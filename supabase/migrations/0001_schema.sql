-- ============================================================================
-- Boost My Social — schema
-- Mirrors the original MySQL tables (general_users, services, orders, …)
-- on Postgres / Supabase.
-- Run with: supabase db push   (or paste into the Supabase SQL editor)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: replaces general_users. Auth lives in auth.users (Supabase Auth).
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  first_name   text,
  last_name    text,
  role         text not null default 'user' check (role in ('admin', 'user')),
  balance      numeric(15, 4) not null default 0 check (balance >= 0),
  spent        numeric(15, 4) not null default 0,
  api_key      text unique,
  custom_rate  numeric(10, 4) not null default 0,
  timezone     text default 'UTC',
  status       smallint not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- settings: replaces general_options (key/value)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key   text primary key,
  value text
);

-- ---------------------------------------------------------------------------
-- categories / services
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          serial primary key,
  name        text not null,
  description text,
  image       text,
  sort        integer not null default 0,
  status      smallint not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.api_providers (
  id          serial primary key,
  name        text not null,
  url         text,
  api_key     text,
  type        text not null default 'standard',
  balance     numeric(15, 5) not null default 0,
  currency    text default 'USD',
  description text,
  status      smallint not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.services (
  id              serial primary key,
  category_id     integer not null references public.categories (id) on delete cascade,
  name            text not null,
  description     text,
  price           numeric(15, 4) not null default 0,
  original_price  numeric(15, 4) not null default 0,
  min             integer not null default 1,
  max             integer not null default 1000000,
  type            text not null default 'default',
  add_type        text not null default 'manual' check (add_type in ('manual', 'api')),
  api_provider_id integer references public.api_providers (id) on delete set null,
  api_service_id  text,
  dripfeed        smallint not null default 0,
  status          smallint not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists services_category_idx on public.services (category_id);

-- Per-user custom rates (general_users_price)
create table if not exists public.user_service_prices (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  service_id integer not null references public.services (id) on delete cascade,
  price      numeric(15, 4) not null,
  unique (user_id, service_id)
);

-- ---------------------------------------------------------------------------
-- orders: same status vocabulary as the PHP panel
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id              bigserial primary key,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  service_id      integer references public.services (id) on delete set null,
  category_id     integer references public.categories (id) on delete set null,
  api_provider_id integer references public.api_providers (id) on delete set null,
  api_service_id  text,
  api_order_id    text,
  service_type    text not null default 'default',
  type            text not null default 'direct' check (type in ('direct', 'api')),
  link            text,
  quantity        integer not null default 0,
  charge          numeric(15, 4) not null default 0,
  formal_charge   numeric(15, 4) not null default 0,
  profit          numeric(15, 4) not null default 0,
  status          text not null default 'pending'
                  check (status in ('active','completed','processing','inprogress','pending',
                                    'partial','canceled','refunded','awaiting','error','fail')),
  start_count     integer default 0,
  remains         integer default 0,
  refunded        boolean not null default false,
  is_dripfeed     smallint not null default 0,
  runs            integer not null default 0,
  interval        integer not null default 0,
  dripfeed_quantity integer not null default 0,
  sub_status      text,
  sub_posts       integer,
  sub_min         integer,
  sub_max         integer,
  sub_delay       integer,
  sub_expiry      date,
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_user_idx    on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- transactions: ledger (general_transaction_logs)
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  type          text not null check (type in ('deposit','order','refund','admin_credit','admin_debit','bonus')),
  amount        numeric(15, 4) not null,
  balance_after numeric(15, 4),
  reference     text,
  description   text,
  status        text not null default 'completed',
  created_at    timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- deposits: manual payment requests + admin approval (formerly handled by
-- the payment gateway modules inside add_funds)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_methods (
  id         serial primary key,
  type       text not null default 'manual',
  name       text not null,
  min        numeric(15, 2) not null default 1,
  max        numeric(15, 2) not null default 10000,
  new_users  smallint not null default 1,
  status     smallint not null default 1,
  config     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id           bigserial primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  method_id    integer references public.payment_methods (id) on delete set null,
  amount       numeric(15, 2) not null check (amount > 0),
  bonus        numeric(15, 4) not null default 0,
  reference    text,
  proof        text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  note         text,
  processed_by uuid references public.profiles (id) on delete set null,
  processed_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists payment_requests_user_idx on public.payment_requests (user_id, created_at desc);

create table if not exists public.bonuses (
  id         serial primary key,
  method_id  integer references public.payment_methods (id) on delete cascade,
  from_amount numeric(15, 2) not null default 0,
  percentage numeric(6, 2) not null default 0,
  status     smallint not null default 1
);

-- ---------------------------------------------------------------------------
-- support tickets
-- ---------------------------------------------------------------------------
create table if not exists public.tickets (
  id          bigserial primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  subject     text not null,
  description text,
  status      text not null default 'pending' check (status in ('new','pending','closed','answered')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists tickets_user_idx on public.tickets (user_id, created_at desc);

create table if not exists public.ticket_messages (
  id         bigserial primary key,
  ticket_id  bigint not null references public.tickets (id) on delete cascade,
  user_id    uuid references public.profiles (id) on delete set null,
  message    text not null,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

-- ---------------------------------------------------------------------------
-- content
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id         serial primary key,
  question   text not null,
  answer     text,
  sort       integer not null default 0,
  status     smallint not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id          bigserial primary key,
  description text,
  status      smallint not null default 1,
  expiry      timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.custom_pages (
  id          serial primary key,
  name        text not null,
  slug        text not null unique,
  content     text,
  status      smallint not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.subscribers (
  id         bigserial primary key,
  email      text not null,
  ip         text,
  created_at timestamptz not null default now()
);
create unique index if not exists subscribers_email_key on public.subscribers (lower(email));

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','categories','api_providers','services','orders','tickets','custom_pages']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.touch_updated_at()', t);
  end loop;
end;
$$;

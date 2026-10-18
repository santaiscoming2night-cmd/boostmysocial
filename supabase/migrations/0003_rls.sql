-- ============================================================================
-- Boost My Social — Row Level Security
-- The app reads user data with the user's own session and performs every
-- privileged write through the server (service role) or the RPCs above.
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.settings            enable row level security;
alter table public.categories          enable row level security;
alter table public.services            enable row level security;
alter table public.api_providers       enable row level security;
alter table public.user_service_prices enable row level security;
alter table public.orders              enable row level security;
alter table public.transactions        enable row level security;
alter table public.payment_methods     enable row level security;
alter table public.payment_requests    enable row level security;
alter table public.bonuses             enable row level security;
alter table public.tickets             enable row level security;
alter table public.ticket_messages     enable row level security;
alter table public.faqs                enable row level security;
alter table public.news                enable row level security;
alter table public.custom_pages        enable row level security;
alter table public.subscribers         enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles: admin read all" on public.profiles;
create policy "profiles: admin read all" on public.profiles
  for select using (public.is_admin());

-- services / catalogue (public read of active rows) -------------------------
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories
  for select using (status = 1 or public.is_admin());

drop policy if exists "services: public read" on public.services;
create policy "services: public read" on public.services
  for select using (status = 1 or public.is_admin());

drop policy if exists "faqs: public read" on public.faqs;
create policy "faqs: public read" on public.faqs
  for select using (status = 1 or public.is_admin());

drop policy if exists "news: public read" on public.news;
create policy "news: public read" on public.news
  for select using (status = 1 or public.is_admin());

drop policy if exists "pages: public read" on public.custom_pages;
create policy "pages: public read" on public.custom_pages
  for select using (status = 1 or public.is_admin());

drop policy if exists "payment methods: public read" on public.payment_methods;
create policy "payment methods: public read" on public.payment_methods
  for select using (status = 1 or public.is_admin());

-- orders --------------------------------------------------------------------
drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- cancellation requests are an UPDATE, but only through the RPC below
create or replace function public.request_order_cancel(p_order_id bigint)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare v_order public.orders%rowtype;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  select * into v_order from public.orders where id = p_order_id and user_id = auth.uid() for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status in ('completed','canceled','refunded','partial') then
    raise exception 'order_cannot_be_canceled';
  end if;
  if v_order.note like '%[cancel requested]%' then
    return json_build_object('status', 'already_requested');
  end if;
  update public.orders
     set note = coalesce(note, '') || ' [cancel requested]'
   where id = p_order_id;
  return json_build_object('status', 'requested');
end;
$$;
revoke all on function public.request_order_cancel(bigint) from public, anon;
grant execute on function public.request_order_cancel(bigint) to authenticated;

-- transactions --------------------------------------------------------------
drop policy if exists "transactions: read own" on public.transactions;
create policy "transactions: read own" on public.transactions
  for select using (user_id = auth.uid() or public.is_admin());

-- deposits ------------------------------------------------------------------
drop policy if exists "payment requests: read own" on public.payment_requests;
create policy "payment requests: read own" on public.payment_requests
  for select using (user_id = auth.uid() or public.is_admin());

-- tickets -------------------------------------------------------------------
drop policy if exists "tickets: read own" on public.tickets;
create policy "tickets: read own" on public.tickets
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tickets: create own" on public.tickets;
create policy "tickets: create own" on public.tickets
  for insert with check (user_id = auth.uid());

drop policy if exists "tickets: owner update" on public.tickets;
create policy "tickets: owner update" on public.tickets
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "ticket messages: read own" on public.ticket_messages;
create policy "ticket messages: read own" on public.ticket_messages
  for select using (
    public.is_admin()
    or exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

drop policy if exists "ticket messages: create own" on public.ticket_messages;
create policy "ticket messages: create own" on public.ticket_messages
  for insert with check (
    public.is_admin()
    or (user_id = auth.uid()
        and not is_admin
        and exists (select 1 from public.tickets t where t.id = ticket_id and t.user_id = auth.uid()))
  );

-- subscribers (public newsletter form) --------------------------------------
drop policy if exists "subscribers: anyone can subscribe" on public.subscribers;
create policy "subscribers: anyone can subscribe" on public.subscribers
  for insert with check (true);

-- admin-only tables ---------------------------------------------------------
drop policy if exists "api providers: admin read" on public.api_providers;
create policy "api providers: admin read" on public.api_providers
  for select using (public.is_admin());

drop policy if exists "settings: admin read" on public.settings;
create policy "settings: admin read" on public.settings
  for select using (public.is_admin());

drop policy if exists "bonuses: admin read" on public.bonuses;
create policy "bonuses: admin read" on public.bonuses
  for select using (public.is_admin());

drop policy if exists "user prices: read own" on public.user_service_prices;
create policy "user prices: read own" on public.user_service_prices
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "subscribers: admin read" on public.subscribers;
create policy "subscribers: admin read" on public.subscribers
  for select using (public.is_admin());

-- Base privileges -----------------------------------------------------------
-- Supabase grants these to the API roles by default; stated explicitly so the
-- schema also works when restored elsewhere. Row Level Security still decides
-- which rows each role can touch.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant insert on public.subscribers to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

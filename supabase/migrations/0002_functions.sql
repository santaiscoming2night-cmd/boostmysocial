-- ============================================================================
-- Boost My Social — business logic (atomic, race-safe)
-- Every function is SECURITY DEFINER so balances can only change here.
-- ============================================================================

-- Admin check ---------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 1
  );
$$;

-- New auth user -> profile --------------------------------------------------
-- The first account to sign up becomes the administrator.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin boolean;
begin
  v_admin := not exists (select 1 from public.profiles);
  insert into public.profiles (id, email, first_name, last_name, role, api_key, timezone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    case when v_admin then 'admin' else 'user' end,
    replace(gen_random_uuid()::text, '-', ''),
    coalesce(new.raw_user_meta_data ->> 'timezone', 'UTC')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------------------
-- place_order: validates the service, charges the caller, creates the order
-- --------------------------------------------------------------------------
create or replace function public.place_order(
  p_service_id integer,
  p_link       text,
  p_quantity   integer,
  p_note       text default null,
  p_type       text default 'direct'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid      uuid := auth.uid();
  v_service  public.services%rowtype;
  v_profile  public.profiles%rowtype;
  v_price    numeric(15,4);
  v_charge   numeric(15,4);
  v_formal   numeric(15,4);
  v_order_id bigint;
  v_balance  numeric(15,4);
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity_must_be_positive';
  end if;
  if p_link is null or length(trim(p_link)) = 0 then
    raise exception 'link_required';
  end if;

  select * into v_service from public.services where id = p_service_id and status = 1;
  if not found then
    raise exception 'service_not_found';
  end if;

  if p_quantity < v_service.min then
    raise exception 'quantity_below_min';
  end if;
  if p_quantity > v_service.max then
    raise exception 'quantity_above_max';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if not found or v_profile.status <> 1 then
    raise exception 'account_blocked';
  end if;

  -- per-user custom rate, otherwise the public rate
  select price into v_price from public.user_service_prices
   where user_id = v_uid and service_id = p_service_id;
  if v_price is null or v_price <= 0 then
    v_price := v_service.price;
  end if;

  v_charge := round(v_price * p_quantity / 1000.0, 4);
  if v_service.original_price > 0 and v_service.price > 0 then
    v_formal := round(v_service.original_price * p_quantity / 1000.0, 4);
  else
    v_formal := v_charge;
  end if;

  if v_profile.balance < v_charge then
    raise exception 'insufficient_funds';
  end if;

  v_balance := v_profile.balance - v_charge;

  update public.profiles
     set balance = v_balance,
         spent   = spent + v_charge
   where id = v_uid;

  insert into public.orders
    (user_id, service_id, category_id, api_provider_id, api_service_id,
     service_type, type, link, quantity, charge, formal_charge, profit,
     status, remains, note)
  values
    (v_uid, v_service.id, v_service.category_id, v_service.api_provider_id, v_service.api_service_id,
     v_service.type, case when p_type = 'api' then 'api' else 'direct' end,
     trim(p_link), p_quantity, v_charge, v_formal, v_charge - v_formal,
     'pending', p_quantity, nullif(trim(coalesce(p_note, '')), ''))
  returning id into v_order_id;

  insert into public.transactions (user_id, type, amount, balance_after, reference, description)
  values (v_uid, 'order', -v_charge, v_balance, v_order_id::text, 'Order #' || v_order_id);

  return json_build_object(
    'order_id', v_order_id,
    'charge', v_charge,
    'balance', v_balance
  );
end;
$$;

-- --------------------------------------------------------------------------
-- request_deposit: creates a pending manual deposit (admin approves it)
-- --------------------------------------------------------------------------
create or replace function public.request_deposit(
  p_method_id integer,
  p_amount    numeric,
  p_reference text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_method public.payment_methods%rowtype;
  v_bonus  numeric(15,4) := 0;
  v_pct    numeric(6,2)  := 0;
  v_id     bigint;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_method from public.payment_methods where id = p_method_id and status = 1;
  if not found then raise exception 'payment_method_not_found'; end if;
  if p_amount is null or p_amount < v_method.min then raise exception 'amount_below_min'; end if;
  if p_amount > v_method.max then raise exception 'amount_above_max'; end if;

  select percentage into v_pct from public.bonuses
   where method_id = p_method_id and status = 1 and from_amount <= p_amount
   order by from_amount desc limit 1;
  if v_pct is not null and v_pct > 0 then
    v_bonus := round(p_amount * v_pct / 100.0, 4);
  end if;

  insert into public.payment_requests (user_id, method_id, amount, bonus, reference)
  values (v_uid, p_method_id, p_amount, v_bonus, nullif(trim(coalesce(p_reference, '')), ''))
  returning id into v_id;

  return json_build_object('request_id', v_id, 'bonus', v_bonus);
end;
$$;

-- --------------------------------------------------------------------------
-- admin_approve_deposit: credits the balance exactly once
-- --------------------------------------------------------------------------
create or replace function public.admin_approve_deposit(
  p_request_id bigint,
  p_approve    boolean default true
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req     public.payment_requests%rowtype;
  v_balance numeric(15,4);
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;

  select * into v_req from public.payment_requests where id = p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_req.status <> 'pending' then raise exception 'already_processed'; end if;

  if p_approve then
    update public.profiles
       set balance = balance + v_req.amount + v_req.bonus
     where id = v_req.user_id
     returning balance into v_balance;

    insert into public.transactions (user_id, type, amount, balance_after, reference, description)
    values (v_req.user_id, 'deposit', v_req.amount, v_balance,
            v_req.id::text, coalesce('Deposit via ' || (select name from public.payment_methods where id = v_req.method_id), 'Deposit'));

    if v_req.bonus > 0 then
      insert into public.transactions (user_id, type, amount, balance_after, reference, description)
      values (v_req.user_id, 'bonus', v_req.bonus, v_balance, v_req.id::text, 'Deposit bonus');
    end if;

    update public.payment_requests
       set status = 'approved', processed_by = auth.uid(), processed_at = now()
     where id = p_request_id;
  else
    update public.payment_requests
       set status = 'rejected', processed_by = auth.uid(), processed_at = now()
     where id = p_request_id;
  end if;

  return json_build_object('status', case when p_approve then 'approved' else 'rejected' end);
end;
$$;

-- --------------------------------------------------------------------------
-- admin_update_order: status changes with automatic refunds
-- --------------------------------------------------------------------------
create or replace function public.admin_update_order(
  p_order_id   bigint,
  p_status     text,
  p_start_count integer default null,
  p_remains    integer default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order   public.orders%rowtype;
  v_refund  numeric(15,4) := 0;
  v_balance numeric(15,4);
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if p_status not in ('active','completed','processing','inprogress','pending','partial','canceled','refunded','awaiting','error','fail') then
    raise exception 'invalid_status';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;

  if p_status in ('canceled','refunded') and not v_order.refunded then
    v_refund := v_order.charge;
  elsif p_status = 'partial' and not v_order.refunded and v_order.quantity > 0 then
    v_refund := round(v_order.charge * coalesce(p_remains, v_order.remains, 0) / v_order.quantity, 4);
    if v_refund > v_order.charge then v_refund := v_order.charge; end if;
  end if;

  update public.orders
     set status = p_status,
         start_count = coalesce(p_start_count, start_count),
         remains = coalesce(p_remains, case when p_status = 'completed' then 0 else remains end),
         refunded = refunded or v_refund > 0
   where id = p_order_id;

  if v_refund > 0 then
    update public.profiles
       set balance = balance + v_refund,
           spent   = greatest(spent - v_refund, 0)
     where id = v_order.user_id
     returning balance into v_balance;

    insert into public.transactions (user_id, type, amount, balance_after, reference, description)
    values (v_order.user_id, 'refund', v_refund, v_balance, p_order_id::text,
            'Refund for order #' || p_order_id);
  end if;

  return json_build_object('order_id', p_order_id, 'status', p_status, 'refunded', v_refund);
end;
$$;

-- --------------------------------------------------------------------------
-- admin_adjust_balance: +/- credit with a ledger entry
-- --------------------------------------------------------------------------
create or replace function public.admin_adjust_balance(
  p_user_id uuid,
  p_amount  numeric,
  p_note    text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric(15,4);
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if p_amount = 0 then raise exception 'amount_zero'; end if;

  update public.profiles
     set balance = greatest(balance + p_amount, 0)
   where id = p_user_id
   returning balance into v_balance;
  if v_balance is null then raise exception 'user_not_found'; end if;

  insert into public.transactions (user_id, type, amount, balance_after, description)
  values (p_user_id,
          case when p_amount > 0 then 'admin_credit' else 'admin_debit' end,
          p_amount, v_balance, coalesce(nullif(trim(p_note), ''), 'Balance adjustment'));

  return json_build_object('balance', v_balance);
end;
$$;

-- --------------------------------------------------------------------------
-- Permissions: only signed-in users may call these RPCs
-- --------------------------------------------------------------------------
revoke all on function public.place_order(integer, text, integer, text, text) from public, anon;
revoke all on function public.request_deposit(integer, numeric, text) from public, anon;
revoke all on function public.admin_approve_deposit(bigint, boolean) from public, anon;
revoke all on function public.admin_update_order(bigint, text, integer, integer) from public, anon;
revoke all on function public.admin_adjust_balance(uuid, numeric, text) from public, anon;

grant execute on function public.place_order(integer, text, integer, text, text) to authenticated;
grant execute on function public.request_deposit(integer, numeric, text) to authenticated;
grant execute on function public.admin_approve_deposit(bigint, boolean) to authenticated;
grant execute on function public.admin_update_order(bigint, text, integer, integer) to authenticated;
grant execute on function public.admin_adjust_balance(uuid, numeric, text) to authenticated;

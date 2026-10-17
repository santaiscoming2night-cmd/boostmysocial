-- ============================================================================
-- Panel API support
-- api_place_order mirrors place_order but is called with the service role and
-- an explicit user id (the request is authenticated with the user's API key).
-- ============================================================================
create or replace function public.api_place_order(
  p_user_id    uuid,
  p_service_id integer,
  p_link       text,
  p_quantity   integer,
  p_note       text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_profile public.profiles%rowtype;
  v_price   numeric(15,4);
  v_charge  numeric(15,4);
  v_formal  numeric(15,4);
  v_order   bigint;
  v_balance numeric(15,4);
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'quantity_must_be_positive'; end if;
  if p_link is null or length(trim(p_link)) = 0 then raise exception 'link_required'; end if;

  select * into v_service from public.services where id = p_service_id and status = 1;
  if not found then raise exception 'service_not_found'; end if;
  if p_quantity < v_service.min then raise exception 'quantity_below_min'; end if;
  if p_quantity > v_service.max then raise exception 'quantity_above_max'; end if;

  select * into v_profile from public.profiles where id = p_user_id for update;
  if not found or v_profile.status <> 1 then raise exception 'account_blocked'; end if;

  select price into v_price from public.user_service_prices where user_id = p_user_id and service_id = p_service_id;
  if v_price is null or v_price <= 0 then v_price := v_service.price; end if;

  v_charge := round(v_price * p_quantity / 1000.0, 4);
  v_formal := case when v_service.original_price > 0 and v_service.price > 0
                   then round(v_service.original_price * p_quantity / 1000.0, 4)
                   else v_charge end;

  if v_profile.balance < v_charge then raise exception 'insufficient_funds'; end if;
  v_balance := v_profile.balance - v_charge;

  update public.profiles set balance = v_balance, spent = spent + v_charge where id = p_user_id;

  insert into public.orders
    (user_id, service_id, category_id, api_provider_id, api_service_id, service_type, type,
     link, quantity, charge, formal_charge, profit, status, remains, note)
  values
    (p_user_id, v_service.id, v_service.category_id, v_service.api_provider_id, v_service.api_service_id,
     v_service.type, 'api', trim(p_link), p_quantity, v_charge, v_formal, v_charge - v_formal,
     'pending', p_quantity, nullif(trim(coalesce(p_note, '')), ''))
  returning id into v_order;

  insert into public.transactions (user_id, type, amount, balance_after, reference, description)
  values (p_user_id, 'order', -v_charge, v_balance, v_order::text, 'API order #' || v_order);

  return json_build_object('order_id', v_order, 'charge', v_charge, 'balance', v_balance);
end;
$$;

revoke all on function public.api_place_order(uuid, integer, text, integer, text) from public, anon, authenticated;

-- Rotate the caller's API key
create or replace function public.rotate_api_key()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_key text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  v_key := replace(gen_random_uuid()::text, '-', '');
  update public.profiles set api_key = v_key where id = auth.uid();
  return v_key;
end;
$$;
revoke all on function public.rotate_api_key() from public, anon;
grant execute on function public.rotate_api_key() to authenticated;

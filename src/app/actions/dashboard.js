'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionUser } from '@/lib/auth';

function back(path, params) {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `${path}?${query}` : path);
}

const RPC_ERRORS = {
  insufficient_funds: 'Not enough funds on balance.',
  quantity_below_min: 'Quantity must be greater than or equal to the minimum amount.',
  quantity_above_max: 'Quantity must be less than or equal to the maximum amount.',
  service_not_found: 'That service is not available.',
  link_required: 'A link is required.',
  account_blocked: 'Your account is blocked.',
  amount_below_min: 'The amount is below the minimum for this payment method.',
  amount_above_max: 'The amount is above the maximum for this payment method.',
  payment_method_not_found: 'That payment method is not available.',
  not_authenticated: 'Please sign in again.',
};

function explain(message) {
  if (!message) return 'Something went wrong.';
  const key = Object.keys(RPC_ERRORS).find((k) => message.includes(k));
  return key ? RPC_ERRORS[key] : message;
}

export async function placeOrder(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('place_order', {
    p_service_id: Number(formData.get('service_id')),
    p_link: String(formData.get('link') || ''),
    p_quantity: Number(formData.get('quantity') || 0),
    p_note: String(formData.get('note') || ''),
    p_type: 'direct',
  });

  if (error) back('/order/add', { err: explain(error.message) });
  revalidatePath('/dashboard');
  revalidatePath('/order/log');
  back('/order/log', { ok: `Order #${data.order_id} placed successfully.` });
}

export async function cancelOrder(formData) {
  const supabase = await createClient();
  const id = Number(formData.get('order_id'));
  const { error } = await supabase.rpc('request_order_cancel', { p_order_id: id });
  if (error) back('/order/log', { err: explain(error.message) });
  back('/order/log', { ok: 'Cancellation requested. Support will review the order.' });
}

export async function requestDeposit(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('request_deposit', {
    p_method_id: Number(formData.get('method_id')),
    p_amount: Number(formData.get('amount') || 0),
    p_reference: String(formData.get('reference') || ''),
  });

  if (error) back('/add-funds', { err: explain(error.message) });
  back('/add-funds', {
    ok: `Deposit request #${data.request_id} submitted. Your balance is credited after confirmation.`,
  });
}

export async function createTicket(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const subject = String(formData.get('subject') || '').trim();
  const description = String(formData.get('description') || '').trim();
  if (!subject || !description) back('/tickets/new', { err: 'Subject and message are required.' });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .insert({ user_id: user.id, subject, description, status: 'pending' })
    .select('id')
    .single();

  if (error) back('/tickets/new', { err: error.message });
  revalidatePath('/tickets');
  redirect(`/tickets/${data.id}?ok=Ticket created.`);
}

export async function replyTicket(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const ticketId = Number(formData.get('ticket_id'));
  const message = String(formData.get('message') || '').trim();
  if (!message) redirect(`/tickets/${ticketId}`);

  const supabase = await createClient();
  const { error } = await supabase.from('ticket_messages').insert({
    ticket_id: ticketId,
    user_id: user.id,
    message,
    is_admin: false,
  });

  if (error) redirect(`/tickets/${ticketId}?err=${encodeURIComponent(error.message)}`);

  await supabase.from('tickets').update({ status: 'pending' }).eq('id', ticketId).eq('user_id', user.id);
  revalidatePath(`/tickets/${ticketId}`);
  redirect(`/tickets/${ticketId}?ok=Reply sent.`);
}

export async function updateProfile(formData) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const first_name = String(formData.get('first_name') || '').trim();
  const last_name = String(formData.get('last_name') || '').trim();
  const timezone = String(formData.get('timezone') || 'UTC');

  const admin = createAdminClient();
  if (!admin) redirect('/profile?err=Supabase+is+not+configured.');

  const { error } = await admin
    .from('profiles')
    .update({ first_name, last_name, timezone })
    .eq('id', user.id);

  if (error) redirect(`/profile?err=${encodeURIComponent(error.message)}`);
  revalidatePath('/profile');
  redirect('/profile?ok=Profile updated.');
}

export async function changePassword(formData) {
  const password = String(formData.get('password') || '');
  if (password.length < 8) redirect('/profile?err=Password+must+be+at+least+8+characters.');

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/profile?err=${encodeURIComponent(error.message)}`);
  redirect('/profile?ok=Password updated.');
}

export async function subscribe(formData) {
  const email = String(formData.get('email') || '').trim();
  if (!email) redirect('/');
  const admin = createAdminClient();
  if (admin) {
    await admin.from('subscribers').insert({ email });
  }
  redirect('/?subscribed=1#subscribe');
}

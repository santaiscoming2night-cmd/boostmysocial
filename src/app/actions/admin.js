'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth';

async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

function admin() {
  const client = createAdminClient();
  if (!client) redirect('/dashboard?err=SUPABASE_SERVICE_ROLE_KEY+is+missing');
  return client;
}

// Balance/order RPCs verify the caller with auth.uid(), so they must run on
// the admin's own session (service-role calls have no uid). The functions are
// SECURITY DEFINER and enforce the admin check themselves.
async function sessionClient() {
  const client = await createClient();
  if (!client) redirect('/dashboard?err=Supabase+is+not+configured');
  return client;
}

function back(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `${path}?${query}` : path);
}

async function run(path, fn, successMessage) {
  try {
    await fn();
  } catch (error) {
    back(path, { err: error.message || 'Operation failed' });
  }
  back(path, { ok: successMessage });
}

/* ---------------------------------------------------------------- orders */
export async function updateOrder(formData) {
  await requireAdminUser();
  const db = await sessionClient();

  await run(
    '/admin/orders',
    async () => {
      const { error } = await db.rpc('admin_update_order', {
        p_order_id: Number(formData.get('order_id')),
        p_status: String(formData.get('status')),
        p_start_count: formData.get('start_count') ? Number(formData.get('start_count')) : null,
        p_remains: formData.get('remains') ? Number(formData.get('remains')) : null,
      });
      if (error) throw new Error(error.message);
    },
    'Order updated.'
  );
}

/* --------------------------------------------------------------- deposits */
export async function processDeposit(formData) {
  await requireAdminUser();
  const db = await sessionClient();
  const approve = String(formData.get('decision')) === 'approve';

  await run(
    '/admin/deposits',
    async () => {
      const { error } = await db.rpc('admin_approve_deposit', {
        p_request_id: Number(formData.get('request_id')),
        p_approve: approve,
      });
      if (error) throw new Error(error.message);
    },
    approve ? 'Deposit approved and balance credited.' : 'Deposit rejected.'
  );
}

export async function adjustBalance(formData) {
  await requireAdminUser();
  const db = await sessionClient();

  await run(
    '/admin/users',
    async () => {
      const { error } = await db.rpc('admin_adjust_balance', {
        p_user_id: String(formData.get('user_id')),
        p_amount: Number(formData.get('amount')),
        p_note: String(formData.get('note') || ''),
      });
      if (error) throw new Error(error.message);
    },
    'Balance updated.'
  );
}

/* ----------------------------------------------------------------- users */
export async function saveUser(formData) {
  await requireAdminUser();
  const db = admin();
  const id = String(formData.get('id'));

  await run(
    '/admin/users',
    async () => {
      const { error } = await db
        .from('profiles')
        .update({
          first_name: String(formData.get('first_name') || ''),
          last_name: String(formData.get('last_name') || ''),
          role: String(formData.get('role') || 'user'),
          status: Number(formData.get('status') || 1),
        })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    'User saved.'
  );
}

/* -------------------------------------------------------------- services */
export async function saveService(formData) {
  await requireAdminUser();
  const db = admin();
  const id = formData.get('id') ? Number(formData.get('id')) : null;
  const payload = {
    category_id: Number(formData.get('category_id')),
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || ''),
    price: Number(formData.get('price') || 0),
    original_price: Number(formData.get('original_price') || formData.get('price') || 0),
    min: Number(formData.get('min') || 1),
    max: Number(formData.get('max') || 1000000),
    status: Number(formData.get('status') || 1),
    dripfeed: formData.get('dripfeed') ? 1 : 0,
    type: String(formData.get('type') || 'default'),
  };

  await run(
    '/admin/services',
    async () => {
      if (!payload.name || !payload.category_id) throw new Error('Name and category are required');
      const query = id ? db.from('services').update(payload).eq('id', id) : db.from('services').insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    id ? 'Service updated.' : 'Service created.'
  );
}

export async function deleteService(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/services',
    async () => {
      const { error } = await db.from('services').delete().eq('id', Number(formData.get('id')));
      if (error) throw new Error(error.message);
    },
    'Service deleted.'
  );
}

export async function toggleService(formData) {
  await requireAdminUser();
  const db = admin();
  const id = Number(formData.get('id'));
  const status = Number(formData.get('status')) === 1 ? 0 : 1;
  await run(
    '/admin/services',
    async () => {
      const { error } = await db.from('services').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    'Service updated.'
  );
}

/* ------------------------------------------------------------ categories */
export async function saveCategory(formData) {
  await requireAdminUser();
  const db = admin();
  const id = formData.get('id') ? Number(formData.get('id')) : null;

  await run(
    '/admin/categories',
    async () => {
      const payload = {
        name: String(formData.get('name') || '').trim(),
        description: String(formData.get('description') || ''),
        sort: Number(formData.get('sort') || 0),
        status: Number(formData.get('status') || 1),
      };
      if (!payload.name) throw new Error('Name is required');
      const query = id ? db.from('categories').update(payload).eq('id', id) : db.from('categories').insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    id ? 'Category updated.' : 'Category created.'
  );
}

export async function deleteCategory(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/categories',
    async () => {
      const { error } = await db.from('categories').delete().eq('id', Number(formData.get('id')));
      if (error) throw new Error(error.message);
    },
    'Category deleted.'
  );
}

/* -------------------------------------------------------------- providers */
export async function saveProvider(formData) {
  await requireAdminUser();
  const db = admin();
  const id = formData.get('id') ? Number(formData.get('id')) : null;

  await run(
    '/admin/providers',
    async () => {
      const payload = {
        name: String(formData.get('name') || '').trim(),
        url: String(formData.get('url') || ''),
        api_key: String(formData.get('api_key') || ''),
        status: Number(formData.get('status') || 1),
      };
      if (!payload.name) throw new Error('Name is required');
      const query = id ? db.from('api_providers').update(payload).eq('id', id) : db.from('api_providers').insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    id ? 'Provider updated.' : 'Provider created.'
  );
}

export async function deleteProvider(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/providers',
    async () => {
      const { error } = await db.from('api_providers').delete().eq('id', Number(formData.get('id')));
      if (error) throw new Error(error.message);
    },
    'Provider deleted.'
  );
}

/* --------------------------------------------------------------- settings */
export async function saveSettings(formData) {
  await requireAdminUser();
  const db = admin();

  await run(
    '/admin/settings',
    async () => {
      const map = new Map();
      for (const [key, value] of formData.entries()) {
        if (!key.startsWith('s_')) continue;
        map.set(key.slice(2), String(value));
      }
      const rows = [...map.entries()].map(([key, value]) => ({ key, value }));
      const { error } = await db.from('settings').upsert(rows, { onConflict: 'key' });
      if (error) throw new Error(error.message);
    },
    'Settings saved.'
  );
}

/* ---------------------------------------------------------------- content */
export async function saveFaq(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/content',
    async () => {
      const payload = {
        question: String(formData.get('question') || '').trim(),
        answer: String(formData.get('answer') || ''),
        sort: Number(formData.get('sort') || 0),
        status: Number(formData.get('status') || 1),
      };
      if (!payload.question) throw new Error('Question is required');
      const { error } = await db.from('faqs').insert(payload);
      if (error) throw new Error(error.message);
    },
    'FAQ added.'
  );
}

export async function deleteFaq(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/content',
    async () => {
      const { error } = await db.from('faqs').delete().eq('id', Number(formData.get('id')));
      if (error) throw new Error(error.message);
    },
    'FAQ removed.'
  );
}

export async function saveNews(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/content',
    async () => {
      const { error } = await db.from('news').insert({
        description: String(formData.get('description') || ''),
        status: 1,
      });
      if (error) throw new Error(error.message);
    },
    'Announcement published.'
  );
}

export async function deleteNews(formData) {
  await requireAdminUser();
  const db = admin();
  await run(
    '/admin/content',
    async () => {
      const { error } = await db.from('news').delete().eq('id', Number(formData.get('id')));
      if (error) throw new Error(error.message);
    },
    'Announcement removed.'
  );
}

export async function savePage(formData) {
  await requireAdminUser();
  const db = admin();
  const id = formData.get('id') ? Number(formData.get('id')) : null;
  await run(
    '/admin/content',
    async () => {
      const payload = {
        name: String(formData.get('name') || '').trim(),
        slug: String(formData.get('slug') || '').trim().toLowerCase(),
        content: String(formData.get('content') || ''),
        status: 1,
      };
      if (!payload.name || !payload.slug) throw new Error('Name and slug are required');
      const query = id ? db.from('custom_pages').update(payload).eq('id', id) : db.from('custom_pages').insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    id ? 'Page updated.' : 'Page created.'
  );
}

/* ----------------------------------------------------------------- tickets */
export async function replyAdminTicket(formData) {
  await requireAdminUser();
  const db = admin();
  const ticketId = Number(formData.get('ticket_id'));
  const message = String(formData.get('message') || '').trim();

  await run(
    `/admin/tickets/${ticketId}`,
    async () => {
      if (!message) throw new Error('Message is required');
      const { error } = await db.from('ticket_messages').insert({
        ticket_id: ticketId,
        user_id: null,
        message,
        is_admin: true,
      });
      if (error) throw new Error(error.message);
      await db.from('tickets').update({ status: 'answered' }).eq('id', ticketId);
    },
    'Reply sent.'
  );
}

export async function setTicketStatus(formData) {
  await requireAdminUser();
  const db = admin();
  const ticketId = Number(formData.get('ticket_id'));
  await run(
    `/admin/tickets/${ticketId}`,
    async () => {
      const { error } = await db.from('tickets').update({ status: String(formData.get('status')) }).eq('id', ticketId);
      if (error) throw new Error(error.message);
    },
    'Ticket updated.'
  );
}

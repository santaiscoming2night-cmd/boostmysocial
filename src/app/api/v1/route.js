import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Panel API (action based), compatible with the original /api/v1 endpoint:
 *   key=...&action=services|add|status|balance
 */
async function readParams(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }
  const form = await request.formData().catch(() => null);
  const params = {};
  if (form) form.forEach((value, key) => { params[key] = value; });
  return params;
}

function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  const db = createAdminClient();
  if (!db) return error('Server is not configured', 500);

  const params = await readParams(request);
  const key = String(params.key || '').trim();
  const action = String(params.action || '').trim();
  if (!key) return error('Missing API key');

  const { data: profile } = await db.from('profiles').select('*').eq('api_key', key).maybeSingle();
  if (!profile) return error('Invalid API key', 401);
  if (profile.status !== 1) return error('Account is blocked', 403);

  if (action === 'services') {
    const { data: services } = await db
      .from('services')
      .select('id, category_id, name, price, min, max, type, dripfeed, categories(name)')
      .eq('status', 1)
      .order('category_id');
    return NextResponse.json(
      (services || []).map((service) => ({
        service: service.id,
        name: service.name,
        category: service.categories?.name || String(service.category_id),
        rate: String(service.price),
        min: String(service.min),
        max: String(service.max),
        type: service.type,
        dripfeed: Boolean(service.dripfeed),
      }))
    );
  }

  if (action === 'balance') {
    return NextResponse.json({ balance: String(profile.balance), currency: 'USD' });
  }

  if (action === 'add') {
    const serviceId = Number(params.service);
    const link = String(params.link || '').trim();
    const quantity = Number(params.quantity);
    if (!serviceId || !link || !quantity) return error('service, link and quantity are required');

    const { data, error: rpcError } = await db.rpc('api_place_order', {
      p_user_id: profile.id,
      p_service_id: serviceId,
      p_link: link,
      p_quantity: quantity,
      p_note: '',
    });
    if (rpcError) return error(rpcError.message);
    return NextResponse.json({ order: data.order_id, charge: String(data.charge) });
  }

  if (action === 'status') {
    const single = params.order ? [Number(params.order)] : String(params.orders || '').split(',').map((v) => Number(v.trim())).filter(Boolean);
    if (single.length === 0) return error('order or orders is required');

    const { data: orders } = await db
      .from('orders')
      .select('id, charge, start_count, remains, status')
      .in('id', single)
      .eq('user_id', profile.id);

    const labels = {
      active: 'Active', completed: 'Completed', processing: 'Processing', pending: 'Pending',
      inprogress: 'In progress', partial: 'Partial', canceled: 'Canceled', refunded: 'Refunded',
      awaiting: 'Awaiting', error: 'Error', fail: 'Fail',
    };

    const rows = (orders || []).map((order) => ({
      order: order.id,
      charge: String(order.charge),
      start_count: String(order.start_count ?? 0),
      remains: String(order.remains ?? 0),
      status: labels[order.status] || order.status,
    }));

    if (params.order) {
      if (rows.length === 0) return error('Order not found', 404);
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json(rows);
  }

  return error('Unknown action');
}

export async function GET() {
  return error('Use POST with your API key, action and parameters.', 405);
}

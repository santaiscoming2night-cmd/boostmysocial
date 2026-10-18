import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import { money, dateTime, orderStatusLabel } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import StatusBadge from '@/components/StatusBadge';
import { updateOrder } from '@/app/actions/admin';

export const metadata = { title: 'All orders' };
export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'processing', 'inprogress', 'active', 'completed', 'partial', 'canceled', 'refunded', 'awaiting', 'error', 'fail'];

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();
  const db = createAdminClient();

  const status = params.status && STATUSES.includes(params.status) ? params.status : '';
  const q = String(params.q || '').trim();
  const page = Math.max(1, Number(params.page || 1));
  const perPage = 30;

  let query = db
    .from('orders')
    .select('*, profiles(email, first_name, last_name), services(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);
  if (status) query = query.eq('status', status);
  if (q) query = query.or(`link.ilike.%${q}%,id.eq.${Number(q) || 0}`);

  const { data: orders, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / perPage));

  return (
    <>
      <PageTitle icon="fe fe-inbox">All orders</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="card">
        <div className="card-header">
          <form className="row" method="get">
            <div className="col-md-4"><input name="q" defaultValue={q} className="form-control" placeholder="Order ID or link" /></div>
            <div className="col-md-3">
              <select name="status" defaultValue={status} className="form-control">
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
              </select>
            </div>
            <div className="col-md-3"><button className="btn btn-secondary">Filter</button></div>
            <div className="col-md-2 text-md-right text-muted small align-self-center">{count || 0} orders</div>
          </form>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead>
              <tr><th>ID</th><th>User</th><th>Service</th><th>Link</th><th>Qty</th><th>Charge</th><th>Status</th><th>Created</th><th style={{ minWidth: 260 }}>Update</th></tr>
            </thead>
            <tbody>
              {(orders || []).length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-muted">#{order.id}</td>
                  <td>{order.profiles?.email || '—'}</td>
                  <td>{order.services?.name || `#${order.service_id}`}</td>
                  <td><span className="order-link" title={order.link}>{order.link}</span></td>
                  <td>{order.quantity}</td>
                  <td>{money(order.charge, settings)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-muted">{dateTime(order.created_at)}</td>
                  <td>
                    <form action={updateOrder} className="form-inline">
                      <input type="hidden" name="order_id" value={order.id} />
                      <select name="status" defaultValue={order.status} className="form-control form-control-sm mr-1 mb-1">
                        {STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
                      </select>
                      <input name="start_count" defaultValue={order.start_count ?? ''} className="form-control form-control-sm mr-1 mb-1" style={{ width: 80 }} placeholder="start" />
                      <input name="remains" defaultValue={order.remains ?? ''} className="form-control form-control-sm mr-1 mb-1" style={{ width: 80 }} placeholder="remains" />
                      <button className="btn btn-sm btn-primary mb-1">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="card-footer d-flex justify-content-between">
            <a className={`btn btn-sm btn-secondary ${page <= 1 ? 'disabled' : ''}`} href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>Previous</a>
            <span className="text-muted align-self-center">Page {page} of {totalPages}</span>
            <a className={`btn btn-sm btn-secondary ${page >= totalPages ? 'disabled' : ''}`} href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>Next</a>
          </div>
        ) : null}
      </div>
    </>
  );
}

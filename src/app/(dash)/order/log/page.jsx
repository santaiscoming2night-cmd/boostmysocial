import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateTime, orderStatusLabel } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';
import Flash from '@/components/Flash';
import { cancelOrder } from '@/app/actions/dashboard';

export const metadata = { title: 'Order logs' };
export const dynamic = 'force-dynamic';

const PER_PAGE = 25;
const STATUSES = ['active', 'completed', 'processing', 'inprogress', 'pending', 'partial', 'canceled', 'refunded'];

export default async function OrderLogPage({ searchParams }) {
  const params = await searchParams;
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();

  const status = params.status && STATUSES.includes(params.status) ? params.status : '';
  const search = String(params.q || '').trim();
  const page = Math.max(1, Number(params.page || 1));

  let query = supabase
    .from('orders')
    .select('*, services(name)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`link.ilike.%${search}%,note.ilike.%${search}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PER_PAGE));

  const queryString = (overrides) => {
    const sp = new URLSearchParams({ status, q: search, page: String(page), ...overrides });
    [...sp.entries()].forEach(([key, value]) => { if (!value) sp.delete(key); });
    return sp.toString();
  };

  return (
    <>
      <PageTitle icon="fe fe-inbox" actions={<Link href="/order/add" className="btn btn-primary"><i className="fe fe-plus mr-1" />New order</Link>}>
        Order logs
      </PageTitle>
      <Flash ok={params.ok} err={params.err} />

      <div className="card">
        <div className="card-header">
          <form className="row" method="get">
            <div className="col-md-4">
              <input name="q" defaultValue={search} className="form-control" placeholder="Search by link…" />
            </div>
            <div className="col-md-3">
              <select name="status" defaultValue={status} className="form-control">
                <option value="">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-secondary" type="submit">Filter</button>
            </div>
            <div className="col-md-2 text-md-right text-muted small align-self-center">{count || 0} orders</div>
          </form>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Link</th>
                <th>Quantity</th>
                <th>Charge</th>
                <th>Start count</th>
                <th>Remains</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(orders || []).length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted py-4">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td className="text-muted">#{order.id}</td>
                  <td>{order.services?.name || `Service #${order.service_id}`}</td>
                  <td><span className="order-link" title={order.link}>{order.link}</span></td>
                  <td>{order.quantity}</td>
                  <td>{money(order.charge, settings)}</td>
                  <td>{order.start_count ?? '—'}</td>
                  <td>{order.remains ?? '—'}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-muted">{dateTime(order.created_at)}</td>
                  <td className="text-right">
                    {['pending', 'active', 'inprogress', 'processing', 'awaiting'].includes(order.status) ? (
                      <form action={cancelOrder}>
                        <input type="hidden" name="order_id" value={order.id} />
                        <button className="btn btn-sm btn-outline-danger" type="submit">Request cancel</button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 ? (
          <div className="card-footer d-flex justify-content-between">
            <Link className={`btn btn-sm btn-secondary ${page <= 1 ? 'disabled' : ''}`} href={`/order/log?${queryString({ page: String(page - 1) })}`}>Previous</Link>
            <span className="text-muted align-self-center">Page {page} of {totalPages}</span>
            <Link className={`btn btn-sm btn-secondary ${page >= totalPages ? 'disabled' : ''}`} href={`/order/log?${queryString({ page: String(page + 1) })}`}>Next</Link>
          </div>
        ) : null}
      </div>
    </>
  );
}

import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateTime } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';

export const metadata = { title: 'Statistics' };
export const dynamic = 'force-dynamic';

async function loadStats(user) {
  const supabase = await createClient();
  if (!supabase) return { orders: [], counts: {}, spent: 0 };
  const [recent, all, spent] = await Promise.all([
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
    supabase.from('orders').select('status').eq('user_id', user.id),
    supabase.from('transactions').select('amount').eq('user_id', user.id).eq('type', 'order'),
  ]);
  const counts = {};
  (all.data || []).forEach((row) => {
    counts[row.status] = (counts[row.status] || 0) + 1;
  });
  const spentTotal = (spent.data || []).reduce((sum, row) => sum + Math.abs(Number(row.amount || 0)), 0);
  return { orders: recent.data || [], counts, spent: spentTotal, total: (all.data || []).length };
}

export default async function DashboardPage() {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const { orders, counts, spent, total = 0 } = await loadStats(user);
  const active = (counts.active || 0) + (counts.inprogress || 0) + (counts.processing || 0);

  const cards = [
    { label: 'Balance', value: money(user.balance, settings), icon: 'fe fe-dollar-sign', tone: 'primary' },
    { label: 'Total spent', value: money(spent, settings), icon: 'fe fe-trending-up', tone: 'green' },
    { label: 'Total orders', value: total, icon: 'fe fe-shopping-cart', tone: 'azure' },
    { label: 'Active orders', value: active, icon: 'fe fe-loader', tone: 'orange' },
  ];

  return (
    <>
      <div className="row">
        {cards.map((card) => (
          <div className="col-sm-6 col-lg-3" key={card.label}>
            <div className="card stat-card">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small text-uppercase">{card.label}</div>
                    <div className="h1 mt-1">{card.value}</div>
                  </div>
                  <span className={`text-${card.tone}`} style={{ fontSize: 28 }}><i className={card.icon} /></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title">Recent orders</h3>
              <Link href="/order/log" className="btn btn-sm btn-secondary">View all</Link>
            </div>
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service</th>
                    <th>Link</th>
                    <th>Charge</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No orders yet. <Link href="/order/add">Place your first order</Link>.</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.id}>
                      <td className="text-muted">#{order.id}</td>
                      <td>{order.service_id || '—'}</td>
                      <td><span className="order-link">{order.link}</span></td>
                      <td>{money(order.charge, settings)}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td className="text-muted">{dateTime(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Quick actions</h3></div>
            <div className="card-body d-grid">
              <Link href="/order/add" className="btn btn-primary btn-block mb-2"><i className="fe fe-shopping-cart mr-2" />New order</Link>
              {user.role !== 'admin' ? <Link href="/add-funds" className="btn btn-success btn-block mb-2"><i className="fe fe-dollar-sign mr-2" />Add funds</Link> : null}
              <Link href="/tickets/new" className="btn btn-secondary btn-block mb-2"><i className="fa fa-comments-o mr-2" />Open a ticket</Link>
              <Link href="/services" className="btn btn-outline-primary btn-block"><i className="fe fe-list mr-2" />Browse services</Link>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Order status</h3></div>
            <div className="card-body p-0">
              <table className="table table-sm mb-0">
                <tbody>
                  {['pending', 'inprogress', 'completed', 'partial', 'canceled'].map((status) => (
                    <tr key={status}>
                      <td><StatusBadge status={status} /></td>
                      <td className="text-right text-muted">{counts[status] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

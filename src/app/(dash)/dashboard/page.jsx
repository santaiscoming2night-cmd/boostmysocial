import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { money, dateTime } from '@/lib/format';
import StatusBadge from '@/components/StatusBadge';
import DashboardGuide from '@/components/DashboardGuide';

export const metadata = { title: 'Dashboard' };
export const dynamic = 'force-dynamic';

const ACTIVE_ORDER_STATUSES = ['pending', 'processing', 'inprogress', 'active', 'awaiting'];
const OPEN_TICKET_STATUSES = ['new', 'pending', 'answered'];

async function loadMemberStats(user) {
  const supabase = await createClient();
  if (!supabase) return { orders: [], counts: {}, spent: 0, total: 0 };

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

async function loadAdminStats() {
  const serviceClient = createAdminClient();
  const db = serviceClient || await createClient();
  if (!db) {
    return {
      users: 0,
      orders: 0,
      pendingOrders: 0,
      openTickets: 0,
      activeServices: 0,
      pendingPayments: 0,
      recentOrders: [],
    };
  }

  const [usersResult, ordersResult, pendingOrdersResult, ticketsResult, servicesResult, paymentsResult, recentResult] = await Promise.all([
    db.from('profiles').select('id', { count: 'exact', head: true }),
    db.from('orders').select('id', { count: 'exact', head: true }),
    db.from('orders').select('id', { count: 'exact', head: true }).in('status', ACTIVE_ORDER_STATUSES),
    db.from('tickets').select('id', { count: 'exact', head: true }).in('status', OPEN_TICKET_STATUSES),
    db.from('services').select('id', { count: 'exact', head: true }).eq('status', 1),
    db.from('payment_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    db
      .from('orders')
      .select('id, charge, status, created_at, profiles(email, first_name, last_name), services(name)')
      .order('created_at', { ascending: false })
      .limit(7),
  ]);

  return {
    users: usersResult.count || 0,
    orders: ordersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    openTickets: ticketsResult.count || 0,
    activeServices: servicesResult.count || 0,
    pendingPayments: paymentsResult.count || 0,
    recentOrders: recentResult.data || [],
  };
}

function HeroPlatformTiles({ admin = false }) {
  return (
    <div className="dashboard-hero-platforms" aria-hidden="true">
      <span className="dashboard-hero-platform dashboard-hero-platform--instagram"><i className="fa fa-instagram" /></span>
      <span className="dashboard-hero-platform dashboard-hero-platform--youtube"><i className="fa fa-youtube-play" /></span>
      <span className="dashboard-hero-platform dashboard-hero-platform--facebook"><i className="fa fa-facebook" /></span>
      <div className="dashboard-hero-live-card">
        <span><i className="atelier-live-dot" /> LIVE</span>
        <b>{admin ? 'Panel active' : 'Ready to post'}</b>
      </div>
    </div>
  );
}

function DashboardHero({ admin = false, firstName }) {
  return (
    <section className={`atelier-command-hero ${admin ? 'atelier-command-hero--admin' : ''}`}>
      <div className="atelier-command-hero-copy">
        <p className="atelier-kicker">{admin ? 'ADMIN DASHBOARD' : 'WELCOME BACK'}</p>
        <h1>Hi, {firstName}.</h1>
        <p>{admin ? 'Here is a quick look at your panel today.' : 'Choose a service, add your link, and place an order.'}</p>
      </div>
      <HeroPlatformTiles admin={admin} />
      <div className="atelier-command-hero-actions">
        {admin ? (
          <>
            <Link href="/admin/orders" className="btn"><i className="fe fe-inbox" /> View orders</Link>
            <Link href="/admin/settings" className="btn btn-secondary"><i className="fe fe-sliders" /> Site settings</Link>
          </>
        ) : (
          <>
            <Link href="/order/add" className="btn"><i className="fe fe-zap" /> Place an order</Link>
            <Link href="/add-funds" className="btn btn-secondary"><i className="fe fe-plus" /> Add funds</Link>
          </>
        )}
      </div>
    </section>
  );
}

function StatCards({ cards }) {
  return (
    <div className="row dashboard-stat-row">
      {cards.map((card) => (
        <div className="col-sm-6 col-lg-3" key={card.label}>
          <div className={`card stat-card dashboard-stat-card dashboard-stat-card--${card.tone}`}>
            <div className="card-body">
              <div className="dashboard-stat-top">
                <span className={`dashboard-stat-icon dashboard-stat-icon--${card.tone}`}><i className={card.icon} /></span>
                {card.note ? <small>{card.note}</small> : null}
              </div>
              <div className="dashboard-stat-value">{card.value}</div>
              <div className="dashboard-stat-label">{card.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberStatusCard({ counts, total }) {
  const moving = ACTIVE_ORDER_STATUSES.reduce((sum, status) => sum + (counts[status] || 0), 0);
  const completed = counts.completed || 0;
  const percent = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <section className="dashboard-status-card" aria-labelledby="order-status-title">
      <div className="dashboard-status-card-head">
        <div>
          <span>YOUR ORDERS</span>
          <h2 id="order-status-title">Order status</h2>
        </div>
        <span className="dashboard-status-live"><i className="atelier-live-dot" /> Live</span>
      </div>
      <div className="dashboard-status-meter" aria-label={`${percent}% of orders completed`}><span style={{ width: `${percent}%` }} /></div>
      <div className="dashboard-status-numbers">
        <div><b>{moving}</b><span>In progress</span></div>
        <div><b>{completed}</b><span>Completed</span></div>
        <div><b>{total}</b><span>Total orders</span></div>
      </div>
      <Link href="/order/log" className="dashboard-card-link">See order history <i className="fe fe-arrow-up-right" /></Link>
    </section>
  );
}

function AdminAttentionCard({ stats }) {
  const items = [
    { href: '/admin/orders?status=pending', icon: 'fe fe-inbox', tone: 'pink', label: 'Orders to check', value: stats.pendingOrders },
    { href: '/admin/tickets', icon: 'fe fe-message-circle', tone: 'blue', label: 'Open messages', value: stats.openTickets },
    { href: '/admin/deposits', icon: 'fe fe-credit-card', tone: 'orange', label: 'Pending payments', value: stats.pendingPayments },
  ];

  return (
    <section className="dashboard-status-card dashboard-status-card--admin" aria-labelledby="attention-title">
      <div className="dashboard-status-card-head">
        <div>
          <span>ADMIN ACTIONS</span>
          <h2 id="attention-title">Needs your attention</h2>
        </div>
        <span className="dashboard-status-live"><i className="atelier-live-dot" /> Live</span>
      </div>
      <div className="dashboard-attention-list">
        {items.map((item) => (
          <Link href={item.href} className="dashboard-attention-item" key={item.label}>
            <span className={`dashboard-attention-icon dashboard-attention-icon--${item.tone}`}><i className={item.icon} /></span>
            <span>{item.label}</span>
            <b>{item.value}</b>
            <i className="fe fe-chevron-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function MemberDashboard({ user, settings, data }) {
  const active = ACTIVE_ORDER_STATUSES.reduce((sum, status) => sum + (data.counts[status] || 0), 0);
  const cards = [
    { label: 'Available balance', value: money(user.balance, settings), icon: 'fe fe-credit-card', tone: 'primary', note: 'Ready to use' },
    { label: 'Amount spent', value: money(data.spent, settings), icon: 'fe fe-trending-up', tone: 'green', note: 'All time' },
    { label: 'Orders placed', value: data.total, icon: 'fe fe-send', tone: 'azure', note: 'All time' },
    { label: 'In progress', value: active, icon: 'fe fe-activity', tone: 'orange', note: active ? 'Working now' : 'No active orders' },
  ];

  return (
    <>
      <DashboardHero firstName={user.first_name || 'there'} />
      <StatCards cards={cards} />
      <div className="row dashboard-main-row">
        <div className="col-lg-8">
          <section className="card dashboard-recent-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div><span className="dashboard-card-kicker">LATEST</span><h2 className="card-title">Recent orders</h2></div>
              <Link href="/order/log" className="btn btn-sm btn-secondary">View all <i className="fe fe-arrow-up-right" /></Link>
            </div>
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead>
                  <tr><th>ID</th><th>Service</th><th>Link</th><th>Charge</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {data.orders.length === 0 ? (
                    <tr><td colSpan={6} className="dashboard-empty-state"><span className="dashboard-empty-icon"><i className="fe fe-zap" /></span><b>No orders yet</b><span>Place your first order to get started.</span><Link href="/order/add">Place an order <i className="fe fe-arrow-up-right" /></Link></td></tr>
                  ) : data.orders.map((order) => (
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
          </section>
        </div>
        <aside className="col-lg-4 dashboard-aside">
          <DashboardGuide counts={{ orders: data.total, pendingOrders: active }} />
          <MemberStatusCard counts={data.counts} total={data.total} />
        </aside>
      </div>
    </>
  );
}

function AdminDashboard({ user, settings, stats }) {
  const cards = [
    { label: 'Users', value: stats.users, icon: 'fe fe-users', tone: 'primary', note: 'Registered accounts' },
    { label: 'Orders', value: stats.orders, icon: 'fe fe-inbox', tone: 'pink', note: `${stats.pendingOrders} to check` },
    { label: 'Support messages', value: stats.openTickets, icon: 'fe fe-message-circle', tone: 'azure', note: 'Open conversations' },
    { label: 'Live services', value: stats.activeServices, icon: 'fe fe-layers', tone: 'orange', note: 'Available to users' },
  ];

  return (
    <>
      <DashboardHero admin firstName={user.first_name || 'there'} />
      <StatCards cards={cards} />
      <div className="row dashboard-main-row">
        <div className="col-lg-8">
          <section className="card dashboard-recent-card dashboard-recent-card--admin">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div><span className="dashboard-card-kicker">LATEST ACTIVITY</span><h2 className="card-title">New orders</h2></div>
              <Link href="/admin/orders" className="btn btn-sm btn-secondary">Manage orders <i className="fe fe-arrow-up-right" /></Link>
            </div>
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead>
                  <tr><th>ID</th><th>Customer</th><th>Service</th><th>Charge</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {stats.recentOrders.length === 0 ? (
                    <tr><td colSpan={6} className="dashboard-empty-state"><span className="dashboard-empty-icon"><i className="fe fe-inbox" /></span><b>No orders yet</b><span>New orders will appear here when customers place them.</span><Link href="/admin/services">Manage services <i className="fe fe-arrow-up-right" /></Link></td></tr>
                  ) : stats.recentOrders.map((order) => {
                    const name = [order.profiles?.first_name, order.profiles?.last_name].filter(Boolean).join(' ') || order.profiles?.email || 'Unknown user';
                    return (
                      <tr key={order.id}>
                        <td className="text-muted">#{order.id}</td>
                        <td><b>{name}</b><small className="dashboard-table-subtitle">{order.profiles?.email || ''}</small></td>
                        <td>{order.services?.name || `Service #${order.service_id || '—'}`}</td>
                        <td>{money(order.charge, settings)}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td className="text-muted">{dateTime(order.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside className="col-lg-4 dashboard-aside">
          <DashboardGuide admin counts={stats} />
          <AdminAttentionCard stats={stats} />
        </aside>
      </div>
    </>
  );
}

export default async function DashboardPage() {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);

  if (user.role === 'admin') {
    const stats = await loadAdminStats();
    return <AdminDashboard user={user} settings={settings} stats={stats} />;
  }

  const data = await loadMemberStats(user);
  return <MemberDashboard user={user} settings={settings} data={data} />;
}

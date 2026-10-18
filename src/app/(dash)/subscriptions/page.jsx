import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateOnly, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';

export const metadata = { title: 'Subscriptions' };
export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, services(name)')
    .eq('user_id', user.id)
    .not('sub_status', 'is', null)
    .order('created_at', { ascending: false });

  return (
    <>
      <PageTitle icon="fe fe-repeat">Subscriptions</PageTitle>
      <div className="card">
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead>
              <tr><th>ID</th><th>Service</th><th>Username</th><th>Posts</th><th>Min / Max</th><th>Expiry</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(orders || []).length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">No subscriptions yet.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.services?.name || `Service #${order.service_id}`}</td>
                  <td>{order.link}</td>
                  <td>{order.sub_posts}</td>
                  <td>{order.sub_min} / {order.sub_max}</td>
                  <td>{dateOnly(order.sub_expiry)}</td>
                  <td><span className="badge badge-secondary">{order.sub_status}</span></td>
                  <td className="text-muted">{dateTime(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

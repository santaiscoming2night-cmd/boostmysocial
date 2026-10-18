import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import StatusBadge from '@/components/StatusBadge';

export const metadata = { title: 'Dripfeed' };
export const dynamic = 'force-dynamic';

export default async function DripfeedPage() {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*, services(name)')
    .eq('user_id', user.id)
    .eq('is_dripfeed', 1)
    .order('created_at', { ascending: false });

  return (
    <>
      <PageTitle icon="fe fe-droplet">Drip-feed boosts</PageTitle>
      <div className="card">
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead>
              <tr><th>ID</th><th>Service</th><th>Link</th><th>Quantity</th><th>Runs</th><th>Interval</th><th>Charge</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {(orders || []).length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No drip-feed boosts yet.</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.services?.name || `Service #${order.service_id}`}</td>
                  <td><span className="order-link">{order.link}</span></td>
                  <td>{order.quantity}</td>
                  <td>{order.runs}</td>
                  <td>{order.interval} min</td>
                  <td>{money(order.charge, settings)}</td>
                  <td><StatusBadge status={order.status} /></td>
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

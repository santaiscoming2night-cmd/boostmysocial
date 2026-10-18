import { createAdminClient } from '@/lib/supabase/admin';
import { dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';

export const metadata = { title: 'Subscribers' };
export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  const db = createAdminClient();
  const { data: subscribers } = await db.from('subscribers').select('*').order('created_at', { ascending: false }).limit(500);

  return (
    <>
      <PageTitle icon="fe fe-mail">Subscribers</PageTitle>
      <div className="card">
        <div className="table-responsive">
          <table className="table card-table table-vcenter">
            <thead><tr><th>#</th><th>Email</th><th>IP</th><th>Subscribed</th></tr></thead>
            <tbody>
              {(subscribers || []).length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted py-4">No subscribers yet.</td></tr>
              ) : subscribers.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.id}</td>
                  <td>{row.email}</td>
                  <td className="text-muted">{row.ip || '—'}</td>
                  <td className="text-muted">{dateTime(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

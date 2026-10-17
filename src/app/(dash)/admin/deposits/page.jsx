import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import { money, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import { processDeposit } from '@/app/actions/admin';

export const metadata = { title: 'Deposits' };
export const dynamic = 'force-dynamic';

const COLORS = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default async function AdminDepositsPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();
  const db = createAdminClient();
  const status = ['pending', 'approved', 'rejected'].includes(params.status) ? params.status : '';

  let query = db
    .from('payment_requests')
    .select('*, profiles(email), payment_methods(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data: requests } = await query;
  const { data: methods } = await db.from('payment_methods').select('*').order('id');

  return (
    <>
      <PageTitle icon="fa fa-money">Deposits &amp; payment methods</PageTitle>
      <Flash ok={params.ok} err={params.err} />

      <div className="card">
        <div className="card-header">
          <div className="btn-group">
            {['', 'pending', 'approved', 'rejected'].map((value) => (
              <a key={value || 'all'} href={`/admin/deposits${value ? `?status=${value}` : ''}`} className={`btn btn-sm ${status === value ? 'btn-primary' : 'btn-secondary'}`}>
                {value || 'all'}
              </a>
            ))}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead><tr><th>#</th><th>User</th><th>Method</th><th>Amount</th><th>Bonus</th><th>Reference</th><th>Status</th><th>Requested</th><th /></tr></thead>
            <tbody>
              {(requests || []).length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-4">No deposit requests.</td></tr>
              ) : requests.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.id}</td>
                  <td>{row.profiles?.email || '—'}</td>
                  <td>{row.payment_methods?.name || '—'}</td>
                  <td>{money(row.amount, settings)}</td>
                  <td>{row.bonus > 0 ? money(row.bonus, settings) : '—'}</td>
                  <td className="text-muted">{row.reference || '—'}</td>
                  <td><span className={`badge badge-${COLORS[row.status]}`}>{row.status}</span></td>
                  <td className="text-muted">{dateTime(row.created_at)}</td>
                  <td className="text-right">
                    {row.status === 'pending' ? (
                      <div className="btn-group">
                        <form action={processDeposit}>
                          <input type="hidden" name="request_id" value={row.id} />
                          <input type="hidden" name="decision" value="approve" />
                          <button className="btn btn-sm btn-success">Approve</button>
                        </form>
                        <form action={processDeposit}>
                          <input type="hidden" name="request_id" value={row.id} />
                          <input type="hidden" name="decision" value="reject" />
                          <button className="btn btn-sm btn-danger">Reject</button>
                        </form>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Payment methods</h3></div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead><tr><th>#</th><th>Name</th><th>Type</th><th>Min</th><th>Max</th><th>New users</th><th>Status</th></tr></thead>
            <tbody>
              {(methods || []).map((method) => (
                <tr key={method.id}>
                  <td>{method.id}</td>
                  <td>{method.name}</td>
                  <td className="text-muted">{method.type}</td>
                  <td>{money(method.min, settings)}</td>
                  <td>{money(method.max, settings)}</td>
                  <td>{method.new_users ? 'allowed' : 'existing only'}</td>
                  <td><span className={`badge badge-${method.status === 1 ? 'success' : 'secondary'}`}>{method.status === 1 ? 'enabled' : 'disabled'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer text-muted small">
          Manual deposits are approved above. Card / wallet gateways can be enabled by adding their keys to the
          <code> config </code> JSON of a payment method (Admin → Payments or the SQL editor).
        </div>
      </div>
    </>
  );
}

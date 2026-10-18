import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { requestDeposit } from '@/app/actions/dashboard';

export const metadata = { title: 'Add funds' };
export const dynamic = 'force-dynamic';

const STATUS = { pending: 'secondary', approved: 'success', rejected: 'danger' };

export default async function AddFundsPage({ searchParams }) {
  const params = await searchParams;
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();

  const [{ data: methods }, { data: requests }] = await Promise.all([
    supabase.from('payment_methods').select('*').eq('status', 1).order('id'),
    supabase.from('payment_requests').select('*, payment_methods(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
  ]);

  const active = (methods || []).find((m) => m.id === Number(params.method)) || methods?.[0];

  return (
    <>
      <PageTitle icon="fa fa-money">Add funds</PageTitle>
      <Flash ok={params.ok} err={params.err} />

      <div className="row">
        <div className="col-lg-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="text-uppercase small">Current balance</div>
              <div className="h1 mb-0">{money(user.balance, settings)}</div>
            </div>
          </div>

          {(methods || []).map((method) => (
            <a
              key={method.id}
              href={`/add-funds?method=${method.id}`}
              className={`card ${active?.id === method.id ? 'border-primary' : ''} text-decoration-none`}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="font-weight-bold text-default">{method.name}</div>
                  <div className="text-muted small">Min {money(method.min, settings)} · Max {money(method.max, settings)}</div>
                </div>
                <i className="fe fe-chevron-right text-muted" />
              </div>
            </a>
          ))}
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{active ? `Pay with ${active.name}` : 'Add funds'}</h3></div>
            <div className="card-body">
              {!active ? (
                <p className="text-muted mb-0">No payment methods are enabled. Please contact support.</p>
              ) : (
                <>
                  {active.config?.instructions ? (
                    <div className="alert alert-info">{active.config.instructions}</div>
                  ) : null}
                  <form action={requestDeposit}>
                    <input type="hidden" name="method_id" value={active.id} />
                    <div className="form-group">
                      <label className="form-label">Amount ({settings.currency_code})</label>
                      <input
                        className="form-control form-control-lg"
                        type="number"
                        name="amount"
                        min={active.min}
                        max={active.max}
                        step="0.01"
                        placeholder={`${active.min} – ${active.max}`}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment reference / transaction ID</label>
                      <input className="form-control" name="reference" placeholder="e.g. mobile money transaction ID" />
                    </div>
                    <SubmitButton className="btn btn-primary btn-lg" pendingText="Submitting…">Submit deposit</SubmitButton>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Deposit history</h3></div>
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead><tr><th>#</th><th>Method</th><th>Amount</th><th>Bonus</th><th>Status</th><th>Reference</th><th>Date</th></tr></thead>
                <tbody>
                  {(requests || []).length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-4">No deposit requests yet.</td></tr>
                  ) : requests.map((row) => (
                    <tr key={row.id}>
                      <td className="text-muted">{row.id}</td>
                      <td>{row.payment_methods?.name || '—'}</td>
                      <td>{money(row.amount, settings)}</td>
                      <td>{row.bonus > 0 ? money(row.bonus, settings) : '—'}</td>
                      <td><span className={`badge badge-${STATUS[row.status] || 'secondary'}`}>{row.status}</span></td>
                      <td className="text-muted">{row.reference || '—'}</td>
                      <td className="text-muted">{dateTime(row.created_at)}</td>
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

import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { money, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';

export const metadata = { title: 'Transaction logs' };
export const dynamic = 'force-dynamic';

const LABELS = {
  deposit: 'Deposit',
  order: 'Order',
  refund: 'Refund',
  admin_credit: 'Admin credit',
  admin_debit: 'Admin debit',
  bonus: 'Bonus',
};

export default async function TransactionsPage() {
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(300);

  return (
    <>
      <PageTitle icon="fe fe-calendar">Transaction logs</PageTitle>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Balance: {money(user.balance, settings)}</h3>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead>
              <tr><th>#</th><th>Type</th><th>Amount</th><th>Balance after</th><th>Reference</th><th>Description</th><th>Date</th></tr>
            </thead>
            <tbody>
              {(transactions || []).length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No transactions yet.</td></tr>
              ) : transactions.map((row) => (
                <tr key={row.id}>
                  <td className="text-muted">{row.id}</td>
                  <td><span className={`badge badge-${row.amount < 0 ? 'danger' : 'success'}`}>{LABELS[row.type] || row.type}</span></td>
                  <td className={row.amount < 0 ? 'text-danger' : 'text-success'}>
                    {row.amount < 0 ? '-' : '+'}{money(Math.abs(row.amount), settings)}
                  </td>
                  <td>{row.balance_after != null ? money(row.balance_after, settings) : '—'}</td>
                  <td className="text-muted">{row.reference || '—'}</td>
                  <td>{row.description || '—'}</td>
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

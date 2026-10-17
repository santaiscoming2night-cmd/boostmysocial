import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';

export const metadata = { title: 'Tickets' };
export const dynamic = 'force-dynamic';

const COLORS = { new: 'info', pending: 'warning', answered: 'success', closed: 'secondary' };

export default async function AdminTicketsPage({ searchParams }) {
  const params = await searchParams;
  const db = createAdminClient();
  const status = ['new', 'pending', 'answered', 'closed'].includes(params.status) ? params.status : '';

  let query = db.from('tickets').select('*, profiles(email)', { count: 'exact' }).order('updated_at', { ascending: false }).limit(200);
  if (status) query = query.eq('status', status);
  const { data: tickets } = await query;

  return (
    <>
      <PageTitle icon="fe fe-help-circle">Support tickets</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="card">
        <div className="card-header">
          <div className="btn-group">
            {['', 'pending', 'answered', 'closed'].map((value) => (
              <a key={value || 'all'} href={`/admin/tickets${value ? `?status=${value}` : ''}`} className={`btn btn-sm ${status === value ? 'btn-primary' : 'btn-secondary'}`}>
                {value || 'all'}
              </a>
            ))}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter">
            <thead><tr><th>#</th><th>User</th><th>Subject</th><th>Status</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {(tickets || []).length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No tickets.</td></tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="text-muted">#{ticket.id}</td>
                  <td>{ticket.profiles?.email || '—'}</td>
                  <td>{ticket.subject}</td>
                  <td><span className={`badge badge-${COLORS[ticket.status] || 'secondary'}`}>{ticket.status}</span></td>
                  <td className="text-muted">{dateTime(ticket.updated_at)}</td>
                  <td className="text-right"><Link href={`/admin/tickets/${ticket.id}`} className="btn btn-sm btn-secondary">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

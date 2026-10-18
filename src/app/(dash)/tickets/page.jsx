import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';

export const metadata = { title: 'Tickets' };
export const dynamic = 'force-dynamic';

const COLORS = { new: 'info', pending: 'warning', answered: 'success', closed: 'secondary' };

export default async function TicketsPage({ searchParams }) {
  const params = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, subject, status, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <>
      <PageTitle
        icon="fa fa-comments-o"
        actions={<Link href="/tickets/new" className="btn btn-primary"><i className="fe fe-plus mr-1" />Open ticket</Link>}
      >
        Support tickets
      </PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="card">
        <div className="table-responsive">
          <table className="table card-table table-vcenter">
            <thead><tr><th>#</th><th>Subject</th><th>Status</th><th>Created</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {(tickets || []).length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">No tickets yet. <Link href="/tickets/new">Open one</Link> if you need help.</td></tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="text-muted">#{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td><span className={`badge badge-${COLORS[ticket.status] || 'secondary'}`}>{ticket.status}</span></td>
                  <td className="text-muted">{dateTime(ticket.created_at)}</td>
                  <td className="text-muted">{dateTime(ticket.updated_at)}</td>
                  <td className="text-right"><Link href={`/tickets/${ticket.id}`} className="btn btn-sm btn-secondary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

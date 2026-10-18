import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { replyTicket } from '@/app/actions/dashboard';

export const metadata = { title: 'Ticket' };
export const dynamic = 'force-dynamic';

export default async function TicketPage({ params, searchParams }) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, requireUser()]);
  const supabase = await createClient();

  const { data: ticket } = await supabase.from('tickets').select('*').eq('id', Number(id)).eq('user_id', user.id).single();
  if (!ticket) notFound();

  const { data: messages } = await supabase
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('created_at');

  return (
    <>
      <PageTitle icon="fa fa-comments-o">Ticket #{ticket.id}</PageTitle>
      <Flash ok={query.ok} err={query.err} />
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h3 className="card-title">{ticket.subject}</h3>
              <span className={`badge badge-${ticket.status === 'closed' ? 'secondary' : ticket.status === 'answered' ? 'success' : 'warning'}`}>{ticket.status}</span>
            </div>
            <div className="card-body">
              <div className="mb-4 p-3 bg-light rounded">
                <div className="text-muted small mb-1">{dateTime(ticket.created_at)}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
              </div>

              {(messages || []).map((message) => (
                <div key={message.id} className={`mb-3 p-3 rounded ${message.is_admin ? 'bg-blue-lt border-left border-primary' : 'bg-light'}`}>
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <strong>{message.is_admin ? 'Support team' : 'You'}</strong>
                    <span>{dateTime(message.created_at)}</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.message}</div>
                </div>
              ))}

              {ticket.status !== 'closed' ? (
                <form action={replyTicket} className="mt-4">
                  <input type="hidden" name="ticket_id" value={ticket.id} />
                  <div className="form-group">
                    <label className="form-label">Reply</label>
                    <textarea className="form-control" name="message" rows={4} required />
                  </div>
                  <SubmitButton className="btn btn-primary" pendingText="Sending…">Send reply</SubmitButton>
                </form>
              ) : (
                <p className="text-muted">This ticket is closed.</p>
              )}
            </div>
            <div className="card-footer"><Link href="/tickets" className="text-muted">← Back to tickets</Link></div>
          </div>
        </div>
      </div>
    </>
  );
}

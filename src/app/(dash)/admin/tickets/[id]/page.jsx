import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { replyAdminTicket, setTicketStatus } from '@/app/actions/admin';

export const metadata = { title: 'Ticket' };
export const dynamic = 'force-dynamic';

export default async function AdminTicketPage({ params, searchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const db = createAdminClient();
  const { data: ticket } = await db.from('tickets').select('*, profiles(email, first_name, last_name)').eq('id', Number(id)).single();
  if (!ticket) notFound();
  const { data: messages } = await db.from('ticket_messages').select('*').eq('ticket_id', ticket.id).order('created_at');

  return (
    <>
      <PageTitle icon="fe fe-help-circle">Ticket #{ticket.id}</PageTitle>
      <Flash ok={query.ok} err={query.err} />
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="card-title mb-1">{ticket.subject}</h3>
            <div className="text-muted small">{ticket.profiles?.email} · {dateTime(ticket.created_at)}</div>
          </div>
          <form action={setTicketStatus} className="form-inline">
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <select name="status" defaultValue={ticket.status} className="form-control form-control-sm mr-1">
              <option value="pending">pending</option>
              <option value="answered">answered</option>
              <option value="closed">closed</option>
            </select>
            <button className="btn btn-sm btn-secondary">Update</button>
          </form>
        </div>
        <div className="card-body">
          <div className="p-3 bg-light rounded mb-4" style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
          {(messages || []).map((message) => (
            <div key={message.id} className={`mb-3 p-3 rounded ${message.is_admin ? 'bg-blue-lt' : 'bg-light'}`}>
              <div className="d-flex justify-content-between small text-muted mb-1">
                <strong>{message.is_admin ? 'Support' : 'Customer'}</strong>
                <span>{dateTime(message.created_at)}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{message.message}</div>
            </div>
          ))}
          <form action={replyAdminTicket} className="mt-4">
            <input type="hidden" name="ticket_id" value={ticket.id} />
            <div className="form-group"><label className="form-label">Reply as support</label><textarea name="message" rows={4} className="form-control" required /></div>
            <SubmitButton className="btn btn-primary">Send reply</SubmitButton>
          </form>
        </div>
        <div className="card-footer"><Link href="/admin/tickets" className="text-muted">← All tickets</Link></div>
      </div>
    </>
  );
}

import { requireUser } from '@/lib/auth';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { createTicket } from '@/app/actions/dashboard';

export const metadata = { title: 'Open a ticket' };
export const dynamic = 'force-dynamic';

export default async function NewTicketPage({ searchParams }) {
  const params = await searchParams;
  await requireUser();
  return (
    <>
      <PageTitle icon="fa fa-comments-o">Open a support ticket</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <form action={createTicket}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input className="form-control" name="subject" placeholder="Brief summary of the issue" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" name="description" rows={8} placeholder="Include your order number and as much detail as possible." required />
                </div>
                <SubmitButton className="btn btn-primary" pendingText="Sending…">Submit ticket</SubmitButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

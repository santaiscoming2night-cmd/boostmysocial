import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { updatePassword } from '@/app/actions/auth';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Change password' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const user = await getSessionUser();
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card p-4">
          <h3 className="card-title text-center mb-3">Choose a new password</h3>
          <Flash ok={params.ok} err={params.err} />
          {user ? (
            <form action={updatePassword}>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input type="password" name="password" className="form-control" minLength={8} required autoFocus />
              </div>
              <SubmitButton className="btn btn-primary btn-block">Update password</SubmitButton>
            </form>
          ) : (
            <p className="text-muted text-center mb-0">Open the link from your reset email to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
}

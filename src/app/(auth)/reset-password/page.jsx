import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { updatePassword } from '@/app/actions/auth';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Set a new password' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const user = await getSessionUser();
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <h1 className="card-title">Set a new key.</h1>
          <p className="social-auth-subtitle">Choose a strong password to get back into your account.</p>
          <Flash ok={params.ok} err={params.err} />
          {user ? (
            <form action={updatePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">New password</label>
                <input id="password" type="password" name="password" className="form-control" minLength={8} required autoFocus autoComplete="new-password" placeholder="At least 8 characters" />
              </div>
              <SubmitButton className="btn">Update password <i className="fe fe-check" /></SubmitButton>
            </form>
          ) : (
            <p className="text-muted text-center mb-0">Open the secure recovery link from your email to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
}

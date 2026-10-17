import Link from 'next/link';
import { redirect } from 'next/navigation';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { signUp } from '@/app/actions/auth';
import { getSettings, settingOn } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Sign up' };
export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);
  if (user) redirect('/dashboard');
  if (settingOn(settings, 'disable_signup_page')) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 text-center">
            <h3 className="card-title">Sign up is disabled</h3>
            <p className="text-muted">Registration is currently closed. Please contact support.</p>
            <Link href="/login" className="btn btn-primary">Back to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card p-4">
          <h3 className="card-title text-center mb-4">Create your account</h3>
          <Flash ok={params.ok} err={params.err} />
          <form action={signUp}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input name="first_name" className="form-control" required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input name="last_name" className="form-control" required />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" minLength={8} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" name="confirm_password" className="form-control" minLength={8} required />
            </div>
            <input type="hidden" name="timezone" value="UTC" />
            <SubmitButton className="btn btn-primary btn-block btn-lg" pendingText="Creating account…">Create account</SubmitButton>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted">Already registered? </span>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

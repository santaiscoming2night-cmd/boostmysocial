import Link from 'next/link';
import { redirect } from 'next/navigation';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { signUp } from '@/app/actions/auth';
import { getSettings, settingOn } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';

export const metadata = { title: 'Create access' };
export const dynamic = 'force-dynamic';

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);
  if (user) redirect('/dashboard');
  if (settingOn(settings, 'disable_signup_page')) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card text-center">
            <h1 className="card-title">Access is paused.</h1>
            <p className="social-auth-subtitle">New workspace creation is currently closed. Please contact support if you need help.</p>
            <Link href="/login" className="btn">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card">
          <h1 className="card-title">Create your access.</h1>
          <p className="social-auth-subtitle">Set up your social workspace in a moment. No confirmation-email queue—your workspace opens right after creation.</p>
          <Flash ok={params.ok} err={params.err} />
          <form action={signUp}>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="first_name">First name</label>
                  <input id="first_name" name="first_name" className="form-control" required autoComplete="given-name" />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="last_name">Last name</label>
                  <input id="last_name" name="last_name" className="form-control" required autoComplete="family-name" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup_email">Email address</label>
              <input id="signup_email" type="email" name="email" className="form-control" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="signup_password">Password</label>
              <input id="signup_password" type="password" name="password" className="form-control" placeholder="At least 8 characters" minLength={8} required autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm_password">Confirm password</label>
              <input id="confirm_password" type="password" name="confirm_password" className="form-control" placeholder="Repeat your password" minLength={8} required autoComplete="new-password" />
            </div>
            <input type="hidden" name="timezone" value="UTC" />
            <SubmitButton className="btn" pendingText="Opening workspace…">Create social workspace <i className="fe fe-zap" /></SubmitButton>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted">Already in the network? </span>
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

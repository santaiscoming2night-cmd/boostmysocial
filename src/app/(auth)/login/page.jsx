import Link from 'next/link';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { signIn } from '@/app/actions/auth';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <h1 className="card-title">Welcome back.</h1>
          <p className="social-auth-subtitle">Sign in to your {settings.website_title || 'Boost My Social'} social workspace.</p>
          <Flash ok={params.ok} err={params.err} info={params.blocked ? 'This account is currently unavailable.' : null} />
          <form action={signIn}>
            {params.next ? <input type="hidden" name="next" value={params.next} /> : null}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" type="email" name="email" className="form-control" placeholder="you@example.com" required autoFocus autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" type="password" name="password" className="form-control" placeholder="Enter your password" required autoComplete="current-password" />
            </div>
            <SubmitButton className="btn">Enter social workspace <i className="fe fe-arrow-up-right" /></SubmitButton>
          </form>
          <div className="text-center mt-3">
            <Link href="/forgot-password" className="text-muted">Forgot your password?</Link>
          </div>
          {settings.disable_signup_page !== '1' ? (
            <div className="text-center mt-2">
              <span className="text-muted">New around here? </span>
              <Link href="/signup">Create your access</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

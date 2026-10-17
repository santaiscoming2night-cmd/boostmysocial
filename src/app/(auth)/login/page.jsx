import Link from 'next/link';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { signIn } from '@/app/actions/auth';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Login' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card p-4">
          <h3 className="card-title text-center mb-4">Login to {settings.website_title}</h3>
          <Flash ok={params.ok} err={params.err} info={params.blocked ? 'Your account is blocked.' : null} />
          <form action={signIn}>
            {params.next ? <input type="hidden" name="next" value={params.next} /> : null}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" placeholder="you@example.com" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" placeholder="********" required />
            </div>
            <SubmitButton className="btn btn-primary btn-block btn-lg">Sign in</SubmitButton>
          </form>
          <div className="text-center mt-3">
            <Link href="/forgot-password" className="text-muted">Forgot password?</Link>
          </div>
          {settings.disable_signup_page !== '1' ? (
            <div className="text-center mt-2">
              <span className="text-muted">New here? </span>
              <Link href="/signup">Create an account</Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

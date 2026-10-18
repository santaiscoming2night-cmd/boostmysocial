import Link from 'next/link';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { requestPasswordReset } from '@/app/actions/auth';

export const metadata = { title: 'Recover access' };
export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card">
          <h1 className="card-title">Recover access.</h1>
          <p className="social-auth-subtitle">Enter the email on your workspace and we&apos;ll send a secure password recovery link.</p>
          <Flash ok={params.ok} err={params.err} />
          <form action={requestPasswordReset}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" type="email" name="email" className="form-control" placeholder="you@example.com" required autoFocus autoComplete="email" />
            </div>
            <SubmitButton className="btn">Send recovery link <i className="fe fe-send" /></SubmitButton>
          </form>
          <div className="text-center mt-3"><Link href="/login">Back to sign in</Link></div>
        </div>
      </div>
    </div>
  );
}

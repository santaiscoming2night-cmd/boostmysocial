import Link from 'next/link';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { requestPasswordReset } from '@/app/actions/auth';

export const metadata = { title: 'Forgot password' };
export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card p-4">
          <h3 className="card-title text-center mb-3">Reset your password</h3>
          <p className="text-muted text-center">Enter your email and we will send you a reset link.</p>
          <Flash ok={params.ok} err={params.err} />
          <form action={requestPasswordReset}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required autoFocus />
            </div>
            <SubmitButton className="btn btn-primary btn-block">Send reset link</SubmitButton>
          </form>
          <div className="text-center mt-3">
            <Link href="/login">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

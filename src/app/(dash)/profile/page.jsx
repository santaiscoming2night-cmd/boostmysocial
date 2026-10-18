import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import CopyField from '@/components/CopyField';
import { updateProfile, changePassword } from '@/app/actions/dashboard';
import { dateTime } from '@/lib/format';

export const metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage({ searchParams }) {
  const params = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const current = profile || user;

  return (
    <>
      <PageTitle icon="fe fe-user">Profile</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="row">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Account details</h3></div>
            <div className="card-body">
              <form action={updateProfile}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">First name</label>
                      <input className="form-control" name="first_name" defaultValue={current.first_name || ''} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Last name</label>
                      <input className="form-control" name="last_name" defaultValue={current.last_name || ''} required />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={current.email || ''} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <input className="form-control" name="timezone" defaultValue={current.timezone || 'UTC'} />
                </div>
                <SubmitButton className="btn btn-primary" pendingText="Saving…">Save changes</SubmitButton>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Change password</h3></div>
            <div className="card-body">
              <form action={changePassword}>
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <input type="password" className="form-control" name="password" minLength={8} required />
                </div>
                <SubmitButton className="btn btn-secondary" pendingText="Updating…">Update password</SubmitButton>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card">
            <div className="card-header"><h3 className="card-title">API key</h3></div>
            <div className="card-body">
              <CopyField value={current.api_key} />
              <p className="text-muted small mb-0 mt-2">Use this key with the <a href="/api/docs">API</a>.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Account</h3></div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-4 text-muted">Role</dt><dd className="col-8">{current.role}</dd>
                <dt className="col-4 text-muted">Status</dt><dd className="col-8">{current.status === 1 ? 'Active' : 'Blocked'}</dd>
                <dt className="col-4 text-muted">User ID</dt><dd className="col-8"><small>{current.id}</small></dd>
                <dt className="col-4 text-muted">Joined</dt><dd className="col-8">{dateTime(current.created_at)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

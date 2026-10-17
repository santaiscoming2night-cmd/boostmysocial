import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import { money, dateTime } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import { saveUser, adjustBalance } from '@/app/actions/admin';

export const metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();
  const db = createAdminClient();
  const search = String(params.q || '').trim();

  let query = db.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  if (search) query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  const { data: users } = await query;

  return (
    <>
      <PageTitle icon="fe fe-users">Users</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="card">
        <div className="card-header">
          <form method="get" className="row">
            <div className="col-md-5"><input name="q" defaultValue={search} className="form-control" placeholder="Search name or email" /></div>
            <div className="col-md-3"><button className="btn btn-secondary">Search</button></div>
          </form>
        </div>
        <div className="table-responsive">
          <table className="table card-table table-vcenter table-sm">
            <thead><tr><th>User</th><th>Email</th><th>Balance</th><th>Role</th><th>Status</th><th>Joined</th><th style={{ minWidth: 340 }}>Manage</th></tr></thead>
            <tbody>
              {(users || []).map((user) => (
                <tr key={user.id}>
                  <td>{user.first_name} {user.last_name}<div className="text-muted small">{user.id.slice(0, 8)}…</div></td>
                  <td>{user.email}</td>
                  <td>{money(user.balance, settings)}</td>
                  <td><span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>{user.role}</span></td>
                  <td><span className={`badge badge-${user.status === 1 ? 'success' : 'danger'}`}>{user.status === 1 ? 'active' : 'blocked'}</span></td>
                  <td className="text-muted">{dateTime(user.created_at)}</td>
                  <td>
                    <details>
                      <summary className="text-primary" style={{ cursor: 'pointer' }}>Edit</summary>
                      <form action={saveUser} className="mt-2 mb-2">
                        <input type="hidden" name="id" value={user.id} />
                        <div className="form-row">
                          <div className="col-5"><input name="first_name" defaultValue={user.first_name || ''} className="form-control form-control-sm mb-1" placeholder="First" /></div>
                          <div className="col-5"><input name="last_name" defaultValue={user.last_name || ''} className="form-control form-control-sm mb-1" placeholder="Last" /></div>
                          <div className="col-2"><button className="btn btn-sm btn-primary btn-block">Save</button></div>
                        </div>
                        <div className="form-row">
                          <div className="col-6">
                            <select name="role" defaultValue={user.role} className="form-control form-control-sm mb-1">
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </div>
                          <div className="col-6">
                            <select name="status" defaultValue={String(user.status)} className="form-control form-control-sm mb-1">
                              <option value="1">active</option>
                              <option value="0">blocked</option>
                            </select>
                          </div>
                        </div>
                      </form>
                      <form action={adjustBalance} className="form-inline">
                        <input type="hidden" name="user_id" value={user.id} />
                        <input name="amount" type="number" step="0.01" className="form-control form-control-sm mr-1 mb-1" placeholder="+/- amount" style={{ width: 120 }} required />
                        <input name="note" className="form-control form-control-sm mr-1 mb-1" placeholder="Note" />
                        <button className="btn btn-sm btn-secondary mb-1">Adjust</button>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

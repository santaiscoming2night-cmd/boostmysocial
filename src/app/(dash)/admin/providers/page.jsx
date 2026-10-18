import { createAdminClient } from '@/lib/supabase/admin';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { saveProvider, deleteProvider } from '@/app/actions/admin';

export const metadata = { title: 'API providers' };
export const dynamic = 'force-dynamic';

export default async function AdminProvidersPage({ searchParams }) {
  const params = await searchParams;
  const db = createAdminClient();
  const { data: providers } = await db.from('api_providers').select('*').order('id');
  const editing = params.edit ? (providers || []).find((p) => String(p.id) === String(params.edit)) : null;

  return (
    <>
      <PageTitle icon="fe fe-server">API providers</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="row">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{editing ? `Edit provider #${editing.id}` : 'Add provider'}</h3></div>
            <div className="card-body">
              <form action={saveProvider}>
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
                <div className="form-group"><label className="form-label">Name</label><input name="name" defaultValue={editing?.name || ''} className="form-control" required /></div>
                <div className="form-group"><label className="form-label">API URL</label><input name="url" defaultValue={editing?.url || ''} className="form-control" placeholder="https://provider.com/api/v2" /></div>
                <div className="form-group"><label className="form-label">API key</label><input name="api_key" defaultValue={editing?.api_key || ''} className="form-control" /></div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" defaultValue={String(editing?.status ?? 1)} className="form-control">
                    <option value="1">active</option>
                    <option value="0">inactive</option>
                  </select>
                </div>
                <SubmitButton className="btn btn-primary btn-block">{editing ? 'Save provider' : 'Create provider'}</SubmitButton>
                {editing ? <a href="/admin/providers" className="btn btn-link btn-block">Cancel edit</a> : null}
              </form>
            </div>
          </div>
          <div className="alert alert-info small">
            Providers are stored for importing services and forwarding orders. Automatic order forwarding is intentionally
            manual: update order statuses from <a href="/admin/orders">All orders</a>.
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card">
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead><tr><th>ID</th><th>Name</th><th>URL</th><th>Balance</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {(providers || []).length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-4">No providers yet.</td></tr>
                  ) : providers.map((provider) => (
                    <tr key={provider.id}>
                      <td className="text-muted">{provider.id}</td>
                      <td>{provider.name}</td>
                      <td className="text-muted small">{provider.url}</td>
                      <td>{provider.balance}</td>
                      <td><span className={`badge badge-${provider.status === 1 ? 'success' : 'secondary'}`}>{provider.status === 1 ? 'active' : 'off'}</span></td>
                      <td className="text-right text-nowrap">
                        <a className="btn btn-sm btn-secondary" href={`/admin/providers?edit=${provider.id}`}>Edit</a>
                        <form action={deleteProvider} className="d-inline">
                          <input type="hidden" name="id" value={provider.id} />
                          <button className="btn btn-sm btn-outline-danger">Delete</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

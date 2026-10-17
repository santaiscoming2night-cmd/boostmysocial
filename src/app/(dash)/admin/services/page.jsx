import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { saveService, deleteService, toggleService } from '@/app/actions/admin';

export const metadata = { title: 'Services' };
export const dynamic = 'force-dynamic';

export default async function AdminServicesPage({ searchParams }) {
  const params = await searchParams;
  const settings = await getSettings();
  const db = createAdminClient();

  const { data: categories } = await db.from('categories').select('id, name').order('sort');
  const { data: services } = await db.from('services').select('*, categories(name)').order('category_id').order('id');
  const editing = params.edit ? (services || []).find((s) => String(s.id) === String(params.edit)) : null;

  return (
    <>
      <PageTitle icon="fe fe-list">Services</PageTitle>
      <Flash ok={params.ok} err={params.err} />

      <div className="row">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{editing ? `Edit service #${editing.id}` : 'Add service'}</h3></div>
            <div className="card-body">
              <form action={saveService}>
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category_id" defaultValue={editing?.category_id || ''} className="form-control" required>
                    <option value="">Choose…</option>
                    {(categories || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input name="name" defaultValue={editing?.name || ''} className="form-control" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" defaultValue={editing?.description || ''} rows={5} className="form-control" />
                </div>
                <div className="row">
                  <div className="col-6"><div className="form-group"><label className="form-label">Rate / 1000</label><input name="price" type="number" step="0.0001" defaultValue={editing?.price ?? ''} className="form-control" required /></div></div>
                  <div className="col-6"><div className="form-group"><label className="form-label">Original price</label><input name="original_price" type="number" step="0.0001" defaultValue={editing?.original_price ?? ''} className="form-control" /></div></div>
                  <div className="col-6"><div className="form-group"><label className="form-label">Minimum</label><input name="min" type="number" defaultValue={editing?.min ?? 1} className="form-control" /></div></div>
                  <div className="col-6"><div className="form-group"><label className="form-label">Maximum</label><input name="max" type="number" defaultValue={editing?.max ?? 1000000} className="form-control" /></div></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select name="type" defaultValue={editing?.type || 'default'} className="form-control">
                    <option value="default">default</option>
                    <option value="custom_comments">custom comments</option>
                    <option value="subscriptions">subscriptions</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" defaultValue={String(editing?.status ?? 1)} className="form-control">
                    <option value="1">active</option>
                    <option value="0">inactive</option>
                  </select>
                </div>
                <label className="custom-control custom-checkbox mb-3">
                  <input type="checkbox" name="dripfeed" value="1" defaultChecked={Boolean(editing?.dripfeed)} className="custom-control-input" />
                  <span className="custom-control-label">Dripfeed enabled</span>
                </label>
                <SubmitButton className="btn btn-primary btn-block">{editing ? 'Save service' : 'Create service'}</SubmitButton>
                {editing ? <a href="/admin/services" className="btn btn-link btn-block">Cancel edit</a> : null}
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{(services || []).length} services</h3></div>
            <div className="table-responsive" style={{ maxHeight: 700, overflow: 'auto' }}>
              <table className="table card-table table-vcenter table-sm">
                <thead><tr><th>ID</th><th>Category</th><th>Name</th><th>Rate</th><th>Min / Max</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {(services || []).map((service) => (
                    <tr key={service.id}>
                      <td className="text-muted">{service.id}</td>
                      <td className="text-muted small">{service.categories?.name}</td>
                      <td>{service.name}</td>
                      <td>{settings.currency_symbol}{Number(service.price).toFixed(2)}</td>
                      <td>{service.min} / {service.max}</td>
                      <td><span className={`badge badge-${service.status === 1 ? 'success' : 'secondary'}`}>{service.status === 1 ? 'active' : 'off'}</span></td>
                      <td className="text-right text-nowrap">
                        <a className="btn btn-sm btn-secondary" href={`/admin/services?edit=${service.id}`}>Edit</a>
                        <form action={toggleService} className="d-inline">
                          <input type="hidden" name="id" value={service.id} />
                          <input type="hidden" name="status" value={service.status} />
                          <button className="btn btn-sm btn-outline-secondary">{service.status === 1 ? 'Disable' : 'Enable'}</button>
                        </form>
                        <form action={deleteService} className="d-inline">
                          <input type="hidden" name="id" value={service.id} />
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

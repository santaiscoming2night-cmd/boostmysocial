import { createAdminClient } from '@/lib/supabase/admin';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { saveCategory, deleteCategory } from '@/app/actions/admin';

export const metadata = { title: 'Categories' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({ searchParams }) {
  const params = await searchParams;
  const db = createAdminClient();
  const { data: categories } = await db.from('categories').select('*, services(count)').order('sort');
  const { data: all } = await db.from('categories').select('id, name, description, sort, status').order('sort');
  const editing = params.edit ? (all || []).find((c) => String(c.id) === String(params.edit)) : null;

  return (
    <>
      <PageTitle icon="fa fa-table">Categories</PageTitle>
      <Flash ok={params.ok} err={params.err} />
      <div className="row">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{editing ? `Edit category #${editing.id}` : 'Add category'}</h3></div>
            <div className="card-body">
              <form action={saveCategory}>
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
                <div className="form-group"><label className="form-label">Name</label><input name="name" defaultValue={editing?.name || ''} className="form-control" required /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea name="description" defaultValue={editing?.description || ''} rows={3} className="form-control" /></div>
                <div className="form-group"><label className="form-label">Sort order</label><input type="number" name="sort" defaultValue={editing?.sort ?? 0} className="form-control" /></div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" defaultValue={String(editing?.status ?? 1)} className="form-control">
                    <option value="1">active</option>
                    <option value="0">hidden</option>
                  </select>
                </div>
                <SubmitButton className="btn btn-primary btn-block">{editing ? 'Save category' : 'Create category'}</SubmitButton>
                {editing ? <a href="/admin/categories" className="btn btn-link btn-block">Cancel edit</a> : null}
              </form>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card">
            <div className="table-responsive">
              <table className="table card-table table-vcenter table-sm">
                <thead><tr><th>ID</th><th>Name</th><th>Sort</th><th>Services</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {(categories || []).map((category) => (
                    <tr key={category.id}>
                      <td className="text-muted">{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.sort}</td>
                      <td>{category.services?.[0]?.count ?? 0}</td>
                      <td><span className={`badge badge-${category.status === 1 ? 'success' : 'secondary'}`}>{category.status === 1 ? 'active' : 'hidden'}</span></td>
                      <td className="text-right text-nowrap">
                        <a className="btn btn-sm btn-secondary" href={`/admin/categories?edit=${category.id}`}>Edit</a>
                        <form action={deleteCategory} className="d-inline">
                          <input type="hidden" name="id" value={category.id} />
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

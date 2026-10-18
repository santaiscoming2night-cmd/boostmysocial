import { createAdminClient } from '@/lib/supabase/admin';
import { dateOnly } from '@/lib/format';
import PageTitle from '@/components/PageTitle';
import Flash from '@/components/Flash';
import SubmitButton from '@/components/SubmitButton';
import { saveFaq, deleteFaq, saveNews, deleteNews, savePage } from '@/app/actions/admin';

export const metadata = { title: 'Content' };
export const dynamic = 'force-dynamic';

export default async function AdminContentPage({ searchParams }) {
  const params = await searchParams;
  const db = createAdminClient();
  const [{ data: faqs }, { data: news }, { data: pages }] = await Promise.all([
    db.from('faqs').select('*').order('sort'),
    db.from('news').select('*').order('created_at', { ascending: false }),
    db.from('custom_pages').select('*').order('id'),
  ]);
  const editing = params.page ? (pages || []).find((p) => String(p.id) === String(params.page)) : null;

  return (
    <>
      <PageTitle icon="fe fe-file-text">News, FAQs &amp; pages</PageTitle>
      <Flash ok={params.ok} err={params.err} />

      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header"><h3 className="card-title">FAQ</h3></div>
            <div className="card-body">
              <form action={saveFaq} className="mb-4">
                <div className="form-group"><label className="form-label">Question</label><input name="question" className="form-control" required /></div>
                <div className="form-group"><label className="form-label">Answer</label><textarea name="answer" rows={3} className="form-control" /></div>
                <div className="form-row">
                  <div className="col-4"><input name="sort" type="number" defaultValue={0} className="form-control" /></div>
                  <div className="col-8"><SubmitButton className="btn btn-primary btn-block">Add FAQ</SubmitButton></div>
                </div>
              </form>
              {(faqs || []).map((faq) => (
                <div className="border-top pt-3 mb-3" key={faq.id}>
                  <div className="d-flex justify-content-between">
                    <strong>{faq.question}</strong>
                    <form action={deleteFaq}><input type="hidden" name="id" value={faq.id} /><button className="btn btn-sm btn-outline-danger">Delete</button></form>
                  </div>
                  <div className="text-muted small mt-1">{faq.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Announcements</h3></div>
            <div className="card-body">
              <form action={saveNews} className="mb-4">
                <div className="form-group"><label className="form-label">Message</label><textarea name="description" rows={3} className="form-control" required /></div>
                <SubmitButton className="btn btn-primary">Publish</SubmitButton>
              </form>
              {(news || []).map((item) => (
                <div className="border-top pt-3 mb-3" key={item.id}>
                  <div className="d-flex justify-content-between">
                    <div className="text-muted small">{dateOnly(item.created_at)}</div>
                    <form action={deleteNews}><input type="hidden" name="id" value={item.id} /><button className="btn btn-sm btn-outline-danger">Delete</button></form>
                  </div>
                  <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Custom pages</h3></div>
            <div className="card-body">
              <form action={savePage} className="mb-4">
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
                <div className="form-row">
                  <div className="col-6"><div className="form-group"><label className="form-label">Name</label><input name="name" defaultValue={editing?.name || ''} className="form-control" required /></div></div>
                  <div className="col-6"><div className="form-group"><label className="form-label">Slug</label><input name="slug" defaultValue={editing?.slug || ''} className="form-control" placeholder="terms" required /></div></div>
                </div>
                <div className="form-group"><label className="form-label">Content (HTML)</label><textarea name="content" rows={6} defaultValue={editing?.content || ''} className="form-control" /></div>
                <SubmitButton className="btn btn-primary">{editing ? 'Save page' : 'Create page'}</SubmitButton>
                {editing ? <a href="/admin/content" className="btn btn-link">Cancel</a> : null}
              </form>
              {(pages || []).map((page) => (
                <div className="d-flex justify-content-between border-top py-2" key={page.id}>
                  <span>{page.name} <span className="text-muted small">/{page.slug}</span></span>
                  <a className="btn btn-sm btn-secondary" href={`/admin/content?page=${page.id}`}>Edit</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

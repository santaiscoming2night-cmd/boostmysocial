import { createAdminClient } from '@/lib/supabase/admin';
import { dateOnly } from '@/lib/format';

export const metadata = { title: 'News & announcements' };
export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const db = createAdminClient();
  const { data: news } = db ? await db.from('news').select('*').eq('status', 1).order('created_at', { ascending: false }) : { data: [] };

  return (
    <section className="pt-90 pb-90">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <h1 className="mb-4">News &amp; announcements</h1>
            {(news || []).length === 0 ? <p className="text-muted">Nothing published yet.</p> : null}
            {(news || []).map((item) => (
              <div className="card mb-3" key={item.id}>
                <div className="card-body">
                  <div className="text-muted small mb-2">{dateOnly(item.created_at)}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

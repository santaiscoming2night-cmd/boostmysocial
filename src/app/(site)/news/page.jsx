import { createAdminClient } from '@/lib/supabase/admin';
import { dateOnly } from '@/lib/format';

export const metadata = { title: 'Network updates' };
export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const db = createAdminClient();
  const { data: news } = db ? await db.from('news').select('*').eq('status', 1).order('created_at', { ascending: false }) : { data: [] };

  return (
    <section className="pt-90 pb-90">
      <div className="container nova-public-page">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="nova-section-heading mb-5">
              <p className="nova-kicker">Network updates</p>
              <h1>What&apos;s moving.</h1>
              <p>Release notes, service news, and panel updates from the network.</p>
            </div>
            {(news || []).length === 0 ? <p className="text-muted">Nothing has been published yet. Check back when the signal changes.</p> : null}
            {(news || []).map((item) => (
              <article className="card nova-news-card" key={item.id}>
                <div className="card-body">
                  <div className="nova-news-date"><span className="nova-live-dot" />{dateOnly(item.created_at)}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{item.description}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

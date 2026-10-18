import { createAdminClient } from '@/lib/supabase/admin';
import { dateOnly } from '@/lib/format';

export const metadata = { title: 'Social desk' };
export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const db = createAdminClient();
  const { data: news } = db ? await db.from('news').select('*').eq('status', 1).order('created_at', { ascending: false }) : { data: [] };

  return (
    <section className="pt-90 pb-90">
      <div className="container atelier-public-page">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="atelier-section-heading mb-5">
              <p className="atelier-kicker">Social desk</p>
              <h1>What&apos;s moving.</h1>
              <p>Release notes, service news, and fresh updates from the boost room.</p>
            </div>
            {(news || []).length === 0 ? <p className="text-muted">Nothing has been published yet. Check back when there’s something new to share.</p> : null}
            {(news || []).map((item) => (
              <article className="card atelier-news-card" key={item.id}>
                <div className="card-body">
                  <div className="atelier-news-date"><span className="atelier-live-dot" />{dateOnly(item.created_at)}</div>
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

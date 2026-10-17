import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'FAQs' };
export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  await getSettings();
  const db = createAdminClient();
  const { data: faqs } = db ? await db.from('faqs').select('*').eq('status', 1).order('sort') : { data: [] };

  return (
    <section className="pt-90 pb-90">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="section-title text-center mb-5">
              <h1>Frequently asked questions</h1>
            </div>
            {(faqs || []).map((faq) => (
              <details className="card mb-3" key={faq.id}>
                <summary className="card-header" style={{ cursor: 'pointer' }}>
                  <strong>{faq.question}</strong>
                </summary>
                <div className="card-body text-muted" style={{ whiteSpace: 'pre-wrap' }}>{faq.answer}</div>
              </details>
            ))}
            {(faqs || []).length === 0 ? <p className="text-center text-muted">No FAQs published yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

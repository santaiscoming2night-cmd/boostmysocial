import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Knowledge base' };
export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  await getSettings();
  const db = createAdminClient();
  const { data: faqs } = db ? await db.from('faqs').select('*').eq('status', 1).order('sort') : { data: [] };

  return (
    <section className="pt-90 pb-90">
      <div className="container nova-public-page">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="nova-section-heading center mb-5">
              <p className="nova-kicker">Knowledge base</p>
              <h1>Answers, without the noise.</h1>
              <p>Everything you need to move confidently through the panel.</p>
            </div>
            {(faqs || []).map((faq) => (
              <details className="card nova-public-faq" key={faq.id}>
                <summary className="card-header">
                  <strong>{faq.question}</strong>
                  <i className="fe fe-plus" aria-hidden="true" />
                </summary>
                <div className="card-body text-muted" style={{ whiteSpace: 'pre-wrap' }}>{faq.answer}</div>
              </details>
            ))}
            {(faqs || []).length === 0 ? <p className="text-center text-muted">No answers have been published yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

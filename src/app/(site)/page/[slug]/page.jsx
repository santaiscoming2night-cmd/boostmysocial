import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const db = createAdminClient();
  if (!db) return { title: slug };
  const { data } = await db.from('custom_pages').select('name').eq('slug', slug).eq('status', 1).maybeSingle();
  return { title: data?.name || slug };
}

export default async function CustomPage({ params }) {
  const { slug } = await params;
  const settings = await getSettings();
  const db = createAdminClient();
  if (!db) notFound();

  const { data: page } = await db.from('custom_pages').select('*').eq('slug', slug).eq('status', 1).maybeSingle();
  if (!page) notFound();

  return (
    <section className="pt-90 pb-90">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card">
              <div className="card-body">
                <h1 className="mb-4">{page.name}</h1>
                <div dangerouslySetInnerHTML={{ __html: page.content || '' }} />
                <hr />
                <p className="text-muted small mb-0">Questions? <a href="/tickets/new">Contact support</a> · {settings.website_title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

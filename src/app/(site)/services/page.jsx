import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { getSettings, settingOn } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import ServicesBrowser from '@/components/ServicesBrowser';

export const metadata = { title: 'Services' };
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [user, settings] = await Promise.all([getSessionUser(), getSettings()]);
  const publicList = settingOn(settings, 'enable_service_list_no_login');

  if (!user && !publicList) {
    return (
      <section className="pt-90 pb-90">
        <div className="container text-center">
          <h1>Our services</h1>
          <p className="text-muted">Sign in to browse the full service list and place orders.</p>
          <Link href="/login?next=/services" className="btn btn-primary">Sign in</Link>
        </div>
      </section>
    );
  }

  const supabase = await createClient();
  const [categoriesResult, servicesResult, pricesResult] = supabase
    ? await Promise.all([
        supabase.from('categories').select('id, name, sort, status').eq('status', 1).order('sort'),
        supabase.from('services').select('*').eq('status', 1).order('name'),
        user
          ? supabase.from('user_service_prices').select('service_id, price').eq('user_id', user.id)
          : Promise.resolve({ data: [] }),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const prices = {};
  (pricesResult.data || []).forEach((row) => {
    prices[row.service_id] = row.price;
  });

  const decorated = (servicesResult.data || []).map((service) => ({
    ...service,
    custom_price: prices[service.id] != null ? prices[service.id] : null,
    price: Number(service.price),
  }));

  return (
    <section className="pt-90 pb-90">
      <div className="container">
        <div className="section-title text-center mb-4">
          <h1>Our services</h1>
          <p className="text-muted">Prices are per 1000 units. Sign in to order at your personal rate.</p>
        </div>
        {!user ? (
          <div className="text-center mb-4">
            <Link href="/login?next=/services" className="btn btn-primary">Sign in to order</Link>{' '}
            <Link href="/signup" className="btn btn-outline-primary">Create an account</Link>
          </div>
        ) : null}
        <ServicesBrowser
          categories={categoriesResult.data || []}
          services={decorated}
          symbol={settings.currency_symbol || '$'}
          signedIn={Boolean(user)}
        />
      </div>
    </section>
  );
}

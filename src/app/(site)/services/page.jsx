import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { getSettings, settingOn } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import ServicesBrowser from '@/components/ServicesBrowser';

export const metadata = { title: 'Service catalog' };
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [user, settings] = await Promise.all([getSessionUser(), getSettings()]);
  const publicList = settingOn(settings, 'enable_service_list_no_login');

  if (!user && !publicList) {
    return (
      <section className="pt-90 pb-90">
        <div className="container atelier-public-page text-center">
          <div className="atelier-section-heading center">
            <p className="atelier-kicker">Social menu</p>
            <h1>Explore your boost menu.</h1>
            <p>Sign in to explore services and start campaigns from your social workspace.</p>
          </div>
          <Link href="/login?next=/services" className="btn mt-4"><i className="fe fe-log-in" /> Sign in to explore</Link>
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
      <div className="container atelier-public-page">
        <div className="atelier-section-heading center atelier-catalog-heading">
          <p className="atelier-kicker">Live boost menu</p>
          <h1>Find your next boost.</h1>
          <p>Browse current services, limits, and rates. Prices shown are per 1,000 units.</p>
        </div>
        {!user ? (
          <div className="text-center atelier-public-actions">
            <Link href="/login?next=/services" className="btn"><i className="fe fe-log-in" /> Sign in to boost</Link>
            <Link href="/signup" className="btn btn-outline-primary">Create instant access <i className="fe fe-arrow-up-right" /></Link>
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

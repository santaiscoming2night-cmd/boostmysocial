import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import PageTitle from '@/components/PageTitle';
import OrderForm from './OrderForm';

export const metadata = { title: 'New boost' };
export const dynamic = 'force-dynamic';

export default async function NewOrderPage({ searchParams }) {
  const params = await searchParams;
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const supabase = await createClient();

  const [{ data: categories }, { data: services }, { data: customPrices }] = await Promise.all([
    supabase.from('categories').select('id, name').eq('status', 1).order('sort'),
    supabase.from('services').select('*').eq('status', 1).order('name'),
    supabase.from('user_service_prices').select('service_id, price').eq('user_id', user.id),
  ]);

  const prices = {};
  (customPrices || []).forEach((row) => {
    prices[row.service_id] = row.price;
  });

  return (
    <>
      <PageTitle icon="fe fe-shopping-cart">New boost</PageTitle>
      <div className="row justify-content-md-center">
        <div className="col-md-11">
          <div className="card">
            <div className="card-body">
              <OrderForm
                categories={categories || []}
                services={services || []}
                prices={prices}
                symbol={settings.currency_symbol || '$'}
                minimumDeposit={settings.minimum_deposit}
                initialServiceId={params.service || ''}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

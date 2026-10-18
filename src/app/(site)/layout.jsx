import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);

  return (
    <div className="nova-site">
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/css/nova-panel.css" />

      {!hasSupabaseEnv() ? (
        <div className="setup-banner">
          Supabase is not configured yet — copy <code>.env.example</code> to <code>.env.local</code>, add your project keys, then run the SQL in <code>supabase/migrations</code>.
        </div>
      ) : null}

      <LandingHeader settings={settings} user={user} />
      <div className="site-wrapper">{children}</div>
      <LandingFooter settings={settings} />
    </div>
  );
}

import Script from 'next/script';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }) {
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);
  return (
    <>
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,500,500i,600,600i,700,700i&display=swap" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/plugins/jquery-toast/css/jquery.toast.css" />
      <link rel="stylesheet" href="/assets/plugins/boostrap/colors.css" />
      <link rel="stylesheet" href="/assets/css/util.css" />
      <link rel="stylesheet" href="/themes/regular/assets/css/theme_style.css" />
      <link rel="stylesheet" href="/assets/plugins/aos/dist/aos.css" />
      <link rel="stylesheet" href="/assets/css/footer.css" />

      {!hasSupabaseEnv() ? (
        <div className="setup-banner">
          Supabase is not configured yet — copy <code>.env.example</code> to <code>.env.local</code>, add your project keys, then run the SQL in <code>supabase/migrations</code>.
        </div>
      ) : null}

      <div id="page-overlay" className="incoming" style={{ display: 'none' }} />
      <LandingHeader settings={settings} user={user} />
      <div className="site-wrapper">{children}</div>
      <LandingFooter settings={settings} />

      <Script src="/assets/js/vendors/jquery-3.2.1.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/vendors/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/plugins/aos/dist/aos.js" strategy="afterInteractive" />
      <Script id="aos-init" strategy="afterInteractive">{'if(window.AOS){AOS.init();}'}</Script>
      <Script src="/themes/regular/assets/js/theme.js" strategy="afterInteractive" />
    </>
  );
}

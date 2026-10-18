import Link from 'next/link';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({ children }) {
  const settings = await getSettings();
  const title = settings.website_title || 'Boost My Social';

  return (
    <div className="nova-auth">
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/css/nova-panel.css" />

      <div className="nova-auth-shell">
        <aside className="nova-auth-aside">
          <Link className="nova-brand" href="/" aria-label={`${title} home`}>
            <span className="nova-brand-mark" aria-hidden="true">✦</span>
            <span className="nova-brand-name">{title}</span>
          </Link>
          <div className="nova-auth-aside-copy">
            <p className="nova-kicker">Growth control room</p>
            <h1>Access the <span>signal.</span></h1>
            <p>Step into a sharper social-growth workspace built around action, not busywork.</p>
            <div className="nova-auth-mini-grid" aria-label="Panel benefits">
              <div className="nova-auth-mini"><i className="fe fe-zap" /><b>Fast campaign launch</b></div>
              <div className="nova-auth-mini"><i className="fe fe-eye" /><b>Visible order activity</b></div>
              <div className="nova-auth-mini"><i className="fe fe-life-buoy" /><b>Support in reach</b></div>
            </div>
          </div>
          <span className="nova-auth-aside-status"><span className="nova-live-dot" />Secure panel access online</span>
        </aside>
        <section className="nova-auth-content">
          <Link href="/" className="nova-auth-back"><i className="fe fe-arrow-left" aria-hidden="true" /> Back to site</Link>
          <div className="nova-auth-card">{children}</div>
          <p className="nova-auth-footnote">Protected workspace · Built for focused campaign operations</p>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({ children }) {
  const settings = await getSettings();
  const tagline = settings.website_tagline || 'Social growth, kept in line.';

  return (
    <div className="atelier-auth">
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/css/nova-panel.css" />

      <div className="atelier-auth-shell">
        <aside className="atelier-auth-aside">
          <div className="atelier-auth-aside-top">
            <Brand settings={settings} showTagline />
            <ThemeToggle />
          </div>
          <div className="atelier-auth-manifesto">
            <span className="atelier-index">ACCESS / 01</span>
            <h1>A quieter place to make <em>louder moves.</em></h1>
            <p>{tagline}</p>
          </div>
          <div className="atelier-auth-principles">
            <span><i className="fe fe-zap" />Deliberate launch flow</span>
            <span><i className="fe fe-eye" />Clear order visibility</span>
            <span><i className="fe fe-life-buoy" />Support within reach</span>
          </div>
        </aside>
        <section className="atelier-auth-content">
          <div className="atelier-auth-content-top">
            <Link href="/" className="atelier-back"><i className="fe fe-arrow-left" aria-hidden="true" /> Back to site</Link>
            <span>SECURE WORKSPACE</span>
          </div>
          <div className="atelier-auth-card">{children}</div>
          <p className="atelier-auth-footnote">Your access is private. Your next move is yours.</p>
        </section>
      </div>
    </div>
  );
}

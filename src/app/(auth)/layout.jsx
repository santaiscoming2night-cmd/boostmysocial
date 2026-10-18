import Link from 'next/link';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const FLOATING_SOCIALS = [
  ['fa fa-instagram', 'instagram'],
  ['fa fa-youtube-play', 'youtube'],
  ['fa fa-facebook', 'facebook'],
  ['fa fa-music', 'tiktok'],
];

export default async function AuthLayout({ children }) {
  const settings = await getSettings();
  const tagline = settings.website_tagline || 'Social growth, made louder.';

  return (
    <div className="social-auth">
      <link rel="stylesheet" href="/assets/plugins/font-awesome/css/font-awesome.min.css" />
      <link rel="stylesheet" href="/assets/css/core.css" />
      <link rel="stylesheet" href="/assets/css/nova-panel.css" />

      <div className="social-auth-shell">
        <aside className="social-auth-aside">
          <div className="social-auth-floats" aria-hidden="true">
            {FLOATING_SOCIALS.map(([icon, tone], index) => <span className={`social-auth-float social-auth-float--${tone} social-auth-float--${index + 1}`} key={tone}><i className={icon} /></span>)}
          </div>
          <div className="social-auth-aside-top">
            <Brand settings={settings} showTagline />
            <ThemeToggle />
          </div>
          <div className="social-auth-manifesto">
            <span>WELCOME TO THE BOOST ROOM</span>
            <h1>Make your next post <em>hit different.</em></h1>
            <p>{tagline}</p>
          </div>
          <div className="social-auth-principles">
            <span><i className="fa fa-instagram" />Platform-first services</span>
            <span><i className="fe fe-zap" />Fast boost flow</span>
            <span><i className="fe fe-activity" />Live campaign visibility</span>
          </div>
        </aside>
        <section className="social-auth-content">
          <div className="social-auth-content-top">
            <Link href="/" className="social-back"><i className="fe fe-arrow-left" aria-hidden="true" /> Back to the site</Link>
            <span>YOUR SOCIAL SPACE</span>
          </div>
          <div className="social-auth-card">{children}</div>
          <p className="social-auth-footnote">Private workspace · made for your next move</p>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Brand from '@/components/Brand';

export default function LandingFooter({ settings }) {
  const tagline = settings.website_tagline || 'Social growth, kept in line.';
  const socials = [
    { href: settings.social_facebook_link, icon: 'fa fa-facebook', label: 'Facebook' },
    { href: settings.social_twitter_link, icon: 'fa fa-twitter', label: 'Twitter' },
    { href: settings.social_instagram_link, icon: 'fa fa-instagram', label: 'Instagram' },
    { href: settings.social_youtube_link, icon: 'fa fa-youtube', label: 'YouTube' },
  ].filter((social) => social.href);

  return (
    <footer className="atelier-footer">
      <div className="atelier-footer-top">
        <div className="atelier-footer-brand">
          <Brand settings={settings} showTagline />
          <p>Make deliberate moves, then keep every campaign visible from one focused workspace.</p>
        </div>
        <div className="atelier-footer-column">
          <h2>Explore</h2>
          <nav aria-label="Explore">
            <Link href="/services">Service catalog</Link>
            <Link href="/news">Network updates</Link>
            <Link href="/faq">Knowledge base</Link>
          </nav>
        </div>
        <div className="atelier-footer-column">
          <h2>Workspace</h2>
          <nav aria-label="Workspace">
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create access</Link>
            <Link href="/api/docs">API access</Link>
          </nav>
        </div>
        <div className="atelier-footer-column atelier-footer-subscribe">
          <h2>Dispatch</h2>
          <p>Occasional notes from the panel. No campaign noise.</p>
          <form action="/api/subscribe" method="post">
            <label className="sr-only" htmlFor="panel-updates-email">Email for panel updates</label>
            <input id="panel-updates-email" type="email" name="email" placeholder="you@example.com" required />
            <button type="submit">Subscribe <i className="fe fe-arrow-up-right" /></button>
          </form>
        </div>
      </div>
      <div className="atelier-footer-bottom">
        <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || `© ${new Date().getFullYear()} ${settings.website_title || 'Boost My Social'}` }} />
        <span className="atelier-footer-tagline">{tagline}</span>
        <div className="atelier-socials" aria-label="Social links">
          {socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
              <i className={social.icon} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

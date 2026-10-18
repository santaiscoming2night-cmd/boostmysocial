import Link from 'next/link';

export default function LandingFooter({ settings }) {
  const title = settings.website_title || 'Boost My Social';
  const socials = [
    { href: settings.social_facebook_link, icon: 'fa fa-facebook', label: 'Facebook' },
    { href: settings.social_twitter_link, icon: 'fa fa-twitter', label: 'Twitter' },
    { href: settings.social_instagram_link, icon: 'fa fa-instagram', label: 'Instagram' },
    { href: settings.social_youtube_link, icon: 'fa fa-youtube', label: 'YouTube' },
  ].filter((social) => social.href);

  return (
    <footer className="nova-footer">
      <div className="nova-footer-main">
        <div className="nova-footer-grid">
          <div>
            <Link className="nova-brand" href="/" aria-label={`${title} home`}>
              <span className="nova-brand-mark" aria-hidden="true">✦</span>
              <span className="nova-brand-name">{title}</span>
            </Link>
            <p className="nova-footer-copy">
              A focused social growth workspace for operators who care about pace, clarity, and control.
            </p>
          </div>
          <div>
            <h2 className="nova-footer-heading">Explore</h2>
            <nav className="nova-footer-links" aria-label="Explore">
              <Link href="/services">Service catalog</Link>
              <Link href="/news">Network updates</Link>
              <Link href="/faq">Knowledge base</Link>
            </nav>
          </div>
          <div>
            <h2 className="nova-footer-heading">Workspace</h2>
            <nav className="nova-footer-links" aria-label="Workspace">
              <Link href="/login">Sign in</Link>
              <Link href="/signup">Create access</Link>
              <Link href="/api/docs">API access</Link>
            </nav>
          </div>
          <div className="nova-footer-signal">
            <span className="nova-kicker">Panel status</span>
            <b><span className="nova-live-dot" />Network online</b>
            <p>Launch an order, follow its delivery, and keep your growth operation moving from one command center.</p>
            <form action="/api/subscribe" method="post" className="nova-footer-subscribe">
              <label className="sr-only" htmlFor="panel-updates-email">Email for panel updates</label>
              <input id="panel-updates-email" type="email" name="email" placeholder="Updates to your inbox" required />
              <button type="submit" aria-label="Subscribe to panel updates"><i className="fe fe-arrow-up-right" /></button>
            </form>
          </div>
        </div>
      </div>
      <div className="nova-footer-bottom">
        <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || `© ${new Date().getFullYear()} ${title}` }} />
        <div className="nova-socials" aria-label="Social links">
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

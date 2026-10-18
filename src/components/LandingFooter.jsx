import Link from 'next/link';
import Brand from '@/components/Brand';

export default function LandingFooter({ settings }) {
  const tagline = settings.website_tagline || 'Social growth, made louder.';
  const socials = [
    { href: settings.social_facebook_link, icon: 'fa fa-facebook', label: 'Facebook' },
    { href: settings.social_twitter_link, icon: 'fa fa-twitter', label: 'Twitter' },
    { href: settings.social_instagram_link, icon: 'fa fa-instagram', label: 'Instagram' },
    { href: settings.social_youtube_link, icon: 'fa fa-youtube', label: 'YouTube' },
  ].filter((social) => social.href);

  return (
    <footer className="social-footer">
      <div className="social-footer-top">
        <div className="social-footer-brand">
          <Brand settings={settings} showTagline />
          <p>Social media services made simple.</p>
          <div className="social-footer-platforms" aria-hidden="true"><i className="fa fa-instagram" /><i className="fa fa-youtube-play" /><i className="fa fa-facebook" /><i className="fa fa-music" /></div>
        </div>
        <div className="social-footer-column">
          <h2>Discover</h2>
          <nav aria-label="Discover">
            <Link href="/services">Services</Link>
            <Link href="/news">Updates</Link>
            <Link href="/faq">FAQ</Link>
          </nav>
        </div>
        <div className="social-footer-column">
          <h2>Workspace</h2>
          <nav aria-label="Workspace">
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Create access</Link>
            <Link href="/api/docs">API access</Link>
          </nav>
        </div>
        <div className="social-footer-column social-footer-subscribe">
          <h2>Updates</h2>
          <p>Get service and site updates.</p>
          <form action="/api/subscribe" method="post">
            <label className="sr-only" htmlFor="panel-updates-email">Email for panel updates</label>
            <input id="panel-updates-email" type="email" name="email" placeholder="you@example.com" required />
            <button type="submit" aria-label="Subscribe"><i className="fe fe-arrow-up-right" /></button>
          </form>
        </div>
      </div>
      <div className="social-footer-bottom">
        <span dangerouslySetInnerHTML={{ __html: settings.copy_right_content || `© ${new Date().getFullYear()} ${settings.website_title || 'Boost My Social'}` }} />
        <span>{tagline}</span>
        <div className="social-socials" aria-label="Social links">
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

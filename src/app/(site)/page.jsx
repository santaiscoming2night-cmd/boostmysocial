import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const SOCIAL_ICONS = [
  ['fa fa-instagram', 'instagram'],
  ['fa fa-facebook', 'facebook'],
  ['fa fa-youtube-play', 'youtube'],
  ['fa fa-twitter', 'twitter'],
  ['fa fa-music', 'tiktok'],
  ['fa fa-soundcloud', 'soundcloud'],
];

const GROWTH_MODES = [
  { icon: 'fa fa-instagram', tone: 'instagram', title: 'Instagram growth', text: 'Choose likes, followers, views, and more for Instagram.' },
  { icon: 'fa fa-youtube-play', tone: 'youtube', title: 'YouTube growth', text: 'Choose views, likes, and subscribers for your videos.' },
  { icon: 'fa fa-music', tone: 'tiktok', title: 'TikTok growth', text: 'Choose likes, views, and followers for your TikTok.' },
  { icon: 'fa fa-facebook', tone: 'facebook', title: 'Facebook growth', text: 'Choose services for your page, posts, and audience.' },
];

const STEPS = [
  ['01', 'Choose a platform', 'Pick the social platform you want to grow.'],
  ['02', 'Choose a service', 'See the price, minimum, and maximum.'],
  ['03', 'Add your link', 'Paste your link and choose a quantity.'],
  ['04', 'Track your order', 'Check your dashboard for status updates.'],
];

const FAQS = [
  ['What services are available?', 'Browse the service list to see available options for each platform.'],
  ['Can I track my order?', 'Yes. Your dashboard shows the order status, price, and link.'],
  ['What is scheduled delivery?', 'For selected services, you can spread a larger order over time.'],
  ['Can I start right away?', 'Yes. Your account opens as soon as you sign up.'],
];

function FloatingSocialIcons({ className = '' }) {
  return (
    <div className={`social-float-field ${className}`} aria-hidden="true">
      {SOCIAL_ICONS.map(([icon, tone], index) => (
        <span className={`social-float social-float--${tone} social-float--${index + 1}`} key={tone}><i className={icon} /></span>
      ))}
    </div>
  );
}

export default async function HomePage({ searchParams }) {
  const [settings, user, params] = await Promise.all([getSettings(), getSessionUser(), searchParams]);
  const title = settings.website_title || 'Boost My Social';
  const tagline = settings.website_tagline || 'Social growth, made louder.';
  const primaryHref = user ? '/dashboard' : '/signup';
  const primaryLabel = user ? 'Open my dashboard' : 'Start boosting';

  return (
    <main className="social-home" id="home">
      {params?.subscribed ? (
        <div className="social-alert-wrap"><div className="alert alert-success mb-0">You&apos;re on the list. Fresh panel updates are headed your way.</div></div>
      ) : null}

      <section className="social-hero" aria-labelledby="hero-heading">
        <FloatingSocialIcons className="social-float-field--hero" />
        <div className="social-hero-copy">
          <p className="social-eyebrow"><span className="social-eyebrow-dot" />SOCIAL MEDIA SERVICES</p>
          <h1 id="hero-heading">Grow your <span>socials.</span></h1>
          <p className="social-hero-tagline">{tagline}</p>
          <p className="social-hero-lede">{title} makes it easy to order social media services and track every order in one place.</p>
          <div className="social-hero-actions">
            <Link className="social-action social-action--primary" href={primaryHref}><i className="fe fe-zap" />{primaryLabel}</Link>
            <Link className="social-action social-action--ghost" href="/services">Browse services <i className="fe fe-arrow-up-right" /></Link>
          </div>
          <div className="social-hero-note"><span><i className="fe fe-check" /></span>Start right away · no email verification</div>
        </div>

        <div className="social-hero-stage" aria-label="Social campaign dashboard preview">
          <div className="social-stage-spark social-stage-spark--one" aria-hidden="true" />
          <div className="social-stage-spark social-stage-spark--two" aria-hidden="true" />
          <div className="social-phone-card">
            <div className="social-phone-topbar"><span className="social-phone-dots"><i /><i /><i /></span><span>social update</span><i className="fe fe-more-horizontal" /></div>
            <div className="social-phone-profile">
              <span className="social-profile-avatar"><i className="fa fa-instagram" /></span>
              <div><b>Instagram order</b><small>Active now</small></div>
              <span className="social-live-pill">LIVE</span>
            </div>
            <div className="social-phone-post">
              <div className="social-post-orbit"><i className="fa fa-instagram" /><span>+</span></div>
              <div className="social-post-wave"><i /><i /><i /><i /><i /><i /><i /></div>
              <span className="social-post-caption">Your post is growing</span>
            </div>
            <div className="social-post-stats">
              <span><i className="fe fe-heart" /> 12.8K</span>
              <span><i className="fe fe-message-circle" /> 1.4K</span>
              <span><i className="fe fe-send" /> 3.2K</span>
            </div>
            <div className="social-phone-progress"><span /><span /><span /><span /><span /></div>
          </div>
          <div className="social-mini-card social-mini-card--growth"><span className="social-mini-icon"><i className="fa fa-youtube-play" /></span><div><small>YouTube</small><b>+4.8K views</b></div></div>
          <div className="social-mini-card social-mini-card--audience"><span className="social-mini-icon"><i className="fa fa-facebook" /></span><div><small>Facebook</small><b>Growing now</b></div></div>
          <span className="social-stage-sticker social-stage-sticker--tiktok"><i className="fa fa-music" /></span>
          <span className="social-stage-sticker social-stage-sticker--twitter"><i className="fa fa-twitter" /></span>
        </div>
      </section>

      <section className="social-platform-strip" aria-label="Supported social platforms">
        <div className="social-platform-track">
          <span><i className="fa fa-instagram" />Instagram</span>
          <span><i className="fa fa-youtube-play" />YouTube</span>
          <span><i className="fa fa-music" />TikTok</span>
          <span><i className="fa fa-facebook" />Facebook</span>
          <span><i className="fa fa-twitter" />X / Twitter</span>
          <span><i className="fa fa-soundcloud" />SoundCloud</span>
        </div>
      </section>

      <section className="social-section social-intro" id="method">
        <div className="social-section-heading">
          <p className="social-eyebrow">SIMPLE AND CLEAR</p>
          <h2>Everything you need in one place.</h2>
          <p>Choose a service, add your link, and follow your order from one simple dashboard.</p>
        </div>
        <div className="social-intro-visual" aria-hidden="true">
          <FloatingSocialIcons className="social-float-field--intro" />
          <div className="social-thread social-thread--one" />
          <div className="social-thread social-thread--two" />
          <div className="social-thread-dot social-thread-dot--one" />
          <div className="social-thread-dot social-thread-dot--two" />
          <div className="social-thread-dot social-thread-dot--three" />
          <span className="social-intro-center"><i className="fe fe-zap" /></span>
        </div>
      </section>

      <section className="social-section social-growth-section">
        <div className="social-growth-heading">
          <p className="social-eyebrow">CHOOSE YOUR PLATFORM</p>
          <h2>Popular services, made simple.</h2>
        </div>
        <div className="social-growth-grid">
          {GROWTH_MODES.map((mode) => (
            <article className={`social-growth-card social-growth-card--${mode.tone}`} key={mode.title}>
              <span className="social-growth-icon"><i className={mode.icon} /></span>
              <h3>{mode.title}</h3>
              <p>{mode.text}</p>
              <Link href="/services">See services <i className="fe fe-arrow-up-right" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="social-section social-workflow-section">
        <div className="social-workflow-visual" aria-hidden="true">
          <div className="social-workflow-ring social-workflow-ring--one" />
          <div className="social-workflow-ring social-workflow-ring--two" />
          <span className="social-workflow-core"><i className="fe fe-zap" /></span>
          <span className="social-workflow-icon social-workflow-icon--one"><i className="fa fa-instagram" /></span>
          <span className="social-workflow-icon social-workflow-icon--two"><i className="fa fa-youtube-play" /></span>
          <span className="social-workflow-icon social-workflow-icon--three"><i className="fa fa-facebook" /></span>
          <span className="social-workflow-icon social-workflow-icon--four"><i className="fa fa-music" /></span>
        </div>
        <div className="social-workflow-copy">
          <p className="social-eyebrow">HOW IT WORKS</p>
          <h2>Four easy steps.</h2>
          <div className="social-steps">
            {STEPS.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="social-section social-faq-section" id="faq">
        <div className="social-faq-copy">
          <p className="social-eyebrow">NEED HELP?</p>
          <h2>Common questions.</h2>
          <p>Find quick answers below, or visit the FAQ for more help.</p>
          <Link href="/faq" className="social-action social-action--ghost">View FAQ <i className="fe fe-arrow-up-right" /></Link>
        </div>
        <div className="social-faq-list">
          {FAQS.map(([question, answer], index) => (
            <details key={question}>
              <summary><span>0{index + 1}</span>{question}<i className="fe fe-plus" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="social-final-cta">
        <FloatingSocialIcons className="social-float-field--final" />
        <div>
          <p className="social-eyebrow">READY TO START?</p>
          <h2>Start growing today.</h2>
          <p>Choose a service and place your first order today.</p>
          <Link className="social-action social-action--primary" href={primaryHref}><i className="fe fe-zap" />{primaryLabel}</Link>
        </div>
      </section>
    </main>
  );
}

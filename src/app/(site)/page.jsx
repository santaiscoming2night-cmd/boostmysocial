import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';
import PlatformPlayground from '@/components/PlatformPlayground';

export const dynamic = 'force-dynamic';

const HERO_STICKERS = [
  ['fa fa-instagram', 'instagram', 'pulse-sticker--instagram'],
  ['fa fa-youtube-play', 'youtube', 'pulse-sticker--youtube'],
  ['fa fa-facebook', 'facebook', 'pulse-sticker--facebook'],
  ['fa fa-music', 'tiktok', 'pulse-sticker--tiktok'],
];

const SIMPLE_STEPS = [
  ['01', 'Pick a service', 'Choose the platform and service you need.', 'fe fe-compass'],
  ['02', 'Add your link', 'Paste the link to your post, video, or page.', 'fe fe-link'],
  ['03', 'Track your order', 'Check your dashboard for updates.', 'fe fe-activity'],
];

const FAQS = [
  ['What can I order?', 'Browse the service list to see available options for each platform.'],
  ['Can I track my order?', 'Yes. Your dashboard shows your order status, price, and link.'],
  ['Can I start right away?', 'Yes. Your account opens as soon as you sign up.'],
];

function HeroStickers() {
  return (
    <div className="pulse-hero-stickers" aria-hidden="true">
      {HERO_STICKERS.map(([icon, label, className]) => (
        <span className={`pulse-sticker ${className}`} key={label}><i className={icon} /></span>
      ))}
      <span className="pulse-sticker pulse-sticker--spark">✦</span>
      <span className="pulse-sticker pulse-sticker--arrow"><i className="fe fe-arrow-down-right" /></span>
    </div>
  );
}

function PlatformRibbon() {
  const items = [
    ['fa fa-instagram', 'Instagram'],
    ['fa fa-youtube-play', 'YouTube'],
    ['fa fa-music', 'TikTok'],
    ['fa fa-facebook', 'Facebook'],
    ['fa fa-twitter', 'X / Twitter'],
  ];

  return (
    <section className="pulse-ribbon" aria-label="Social media platforms">
      <div className="pulse-ribbon-track">
        {[...items, ...items].map(([icon, name], index) => (
          <span key={`${name}-${index}`}><i className={icon} />{name}<b>✦</b></span>
        ))}
      </div>
    </section>
  );
}

export default async function HomePage({ searchParams }) {
  const [settings, user, params] = await Promise.all([getSettings(), getSessionUser(), searchParams]);
  const title = settings.website_title || 'Boost My Social';
  const tagline = settings.website_tagline || 'Social growth, made louder.';
  const primaryHref = user ? '/dashboard' : '/signup';
  const primaryLabel = user ? 'Open dashboard' : 'Get started';

  return (
    <main className="pulse-home" id="home">
      {params?.subscribed ? (
        <div className="pulse-alert-wrap"><div className="alert alert-success mb-0">Thanks — you&apos;re signed up for updates.</div></div>
      ) : null}

      <section className="pulse-hero" aria-labelledby="hero-heading">
        <div className="pulse-hero-background" aria-hidden="true"><span>POST</span><span>POP</span><span>POST</span></div>
        <HeroStickers />
        <div className="pulse-hero-copy">
          <p className="pulse-kicker"><span />SOCIAL MEDIA SERVICES</p>
          <h1 id="hero-heading">Make every <em>post</em> pop.</h1>
          <p className="pulse-hero-tagline">{tagline}</p>
          <p className="pulse-hero-lede">Pick a service, add your link, and track your order in one place.</p>
          <div className="pulse-hero-actions">
            <Link href={primaryHref} className="pulse-action pulse-action--main"><i className="fe fe-zap" />{primaryLabel}</Link>
            <Link href="/services" className="pulse-action pulse-action--plain">Browse services <i className="fe fe-arrow-up-right" /></Link>
          </div>
          <p className="pulse-hero-note"><i className="fe fe-check" /> Start right away. No email verification.</p>
        </div>

        <div className="pulse-hero-collage" aria-label="Social order preview">
          <article className="pulse-post-card">
            <div className="pulse-post-head">
              <span className="pulse-post-avatar"><i className="fa fa-instagram" /></span>
              <span><b>your.next.post</b><small>Just now</small></span>
              <i className="fe fe-more-horizontal" />
            </div>
            <div className="pulse-post-art">
              <span className="pulse-post-grid" />
              <span className="pulse-post-platform"><i className="fa fa-instagram" /></span>
              <span className="pulse-post-caption">new post<br />energy ✦</span>
              <span className="pulse-post-scribble">♥</span>
            </div>
            <div className="pulse-post-metrics"><span><i className="fe fe-heart" />12.8K</span><span><i className="fe fe-message-circle" />1.4K</span><span><i className="fe fe-send" />3.2K</span></div>
          </article>
          <div className="pulse-order-ticket">
            <span className="pulse-ticket-pin" aria-hidden="true" />
            <small>ORDER READY</small>
            <b>Instagram Reel Views</b>
            <div><span>Link added</span><i className="fe fe-check" /></div>
            <div><span>Quantity set</span><i className="fe fe-check" /></div>
          </div>
          <div className="pulse-growth-bubble"><span>+4.8K</span><small>views today</small></div>
          <span className="pulse-collage-tag">IT&apos;S YOUR<br />TURN →</span>
        </div>
      </section>

      <PlatformRibbon />

      <section className="pulse-intro" id="method">
        <p className="pulse-kicker">SIMPLE BY DESIGN</p>
        <h2>Less guessing. <span>More doing.</span></h2>
        <p>{title} keeps your social media orders clear, quick, and easy to follow.</p>
      </section>

      <PlatformPlayground />

      <section className="pulse-steps" aria-labelledby="steps-heading">
        <div className="pulse-section-heading">
          <p className="pulse-kicker">HOW IT WORKS</p>
          <h2 id="steps-heading">Three easy steps.</h2>
          <p>No complicated setup. Start when you are ready.</p>
        </div>
        <div className="pulse-step-grid">
          {SIMPLE_STEPS.map(([number, title, text, icon]) => (
            <article className="pulse-step" key={number}>
              <span className="pulse-step-number">{number}</span>
              <span className="pulse-step-icon"><i className={icon} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pulse-faq" id="faq">
        <div className="pulse-faq-copy">
          <p className="pulse-kicker">NEED HELP?</p>
          <h2>We keep it simple.</h2>
          <p>Here are a few quick answers before you start.</p>
          <Link href="/faq" className="pulse-link">View all FAQ <i className="fe fe-arrow-up-right" /></Link>
        </div>
        <div className="pulse-faq-list">
          {FAQS.map(([question, answer], index) => (
            <details key={question}>
              <summary><span>0{index + 1}</span>{question}<i className="fe fe-plus" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pulse-end">
        <HeroStickers />
        <div>
          <p className="pulse-kicker">READY TO START?</p>
          <h2>Give your next post a push.</h2>
          <p>Choose a service and place your first order today.</p>
          <Link href={primaryHref} className="pulse-action pulse-action--main"><i className="fe fe-zap" />{primaryLabel}</Link>
        </div>
      </section>
    </main>
  );
}

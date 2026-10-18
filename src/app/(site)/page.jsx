import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PRINCIPLES = [
  ['01', 'A considered catalog', 'Find the service, rate, limits, and context you need before you commit to a campaign.'],
  ['02', 'A clear launch path', 'Set the destination and quantity, then send the work forward without unnecessary ceremony.'],
  ['03', 'A visible record', 'Keep orders, balances, support, and status changes in one calm operational view.'],
];

const STEPS = [
  ['01', 'Set your base', 'Create your workspace and prepare a balance for the work ahead.'],
  ['02', 'Choose the channel', 'Browse the service catalog with limits and rates in plain view.'],
  ['03', 'Make the move', 'Launch a precise order with the link, quantity, and pacing you intend.'],
  ['04', 'Keep watch', 'Follow the order through its lifecycle from your activity ledger.'],
];

const FAQS = [
  ['What is this panel for?', 'It is a focused workspace for finding, ordering, and tracking social media marketing services in one place.'],
  ['Which platforms are represented?', 'The live catalog lists the currently available categories and services for the platforms supported by this panel.'],
  ['What does drip-feed mean?', 'Drip-feed allows an eligible order to be paced over time instead of being delivered in one single release.'],
  ['Can I review work after I launch it?', 'Yes. Your order log and activity views keep the campaign record and its current status close at hand.'],
];

export default async function HomePage({ searchParams }) {
  const [settings, user, params] = await Promise.all([getSettings(), getSessionUser(), searchParams]);
  const title = settings.website_title || 'Boost My Social';
  const tagline = settings.website_tagline || 'Social growth, kept in line.';
  const primaryHref = user ? '/dashboard' : '/signup';
  const primaryLabel = user ? 'Open the panel' : 'Create access';

  return (
    <main id="home">
      {params?.subscribed ? (
        <div className="signal-alert-wrap">
          <div className="alert alert-success mb-0">You&apos;re on the dispatch list. We&apos;ll keep the notes useful.</div>
        </div>
      ) : null}

      <section className="signal-hero" aria-labelledby="hero-heading">
        <div className="signal-hero-copy">
          <div className="signal-hero-meta"><span>01 / SIGNAL LEDGER</span><span>{title.toUpperCase()}</span></div>
          <h1 id="hero-heading">Make the next move <em>impossible to miss.</em></h1>
          <p className="signal-hero-tagline">{tagline}</p>
          <p className="signal-hero-lede">A purposeful social-growth workspace for people who prefer visibility, rhythm, and a clear record of every campaign.</p>
          <div className="signal-hero-actions">
            <Link className="atelier-action atelier-action--solid" href={primaryHref}>{primaryLabel} <i className="fe fe-arrow-up-right" /></Link>
            <Link className="atelier-action atelier-action--quiet" href="/services">Browse services <i className="fe fe-arrow-right" /></Link>
          </div>
          <div className="signal-hero-footnote"><span />No verification-email detour. A workspace opens when you&apos;re ready.</div>
        </div>

        <figure className="signal-map" aria-labelledby="signal-map-caption">
          <figcaption id="signal-map-caption">CAMPAIGN FIELD / LIVE WORKSPACE</figcaption>
          <svg viewBox="0 0 660 480" role="img" aria-label="A campaign signal map connecting social channels to a central control point">
            <path className="signal-map-grid" d="M84 66H576M84 154H576M84 242H576M84 330H576M84 418H576M120 34V448M240 34V448M360 34V448M480 34V448" />
            <path className="signal-map-route" d="M128 108 L300 220 L500 118 M128 366 L300 220 L528 340 M300 220 L360 384" />
            <path className="signal-map-axis" d="M50 220H610 M300 22V458" />
            <circle className="signal-map-core" cx="300" cy="220" r="28" />
            <circle className="signal-map-node" cx="128" cy="108" r="12" />
            <circle className="signal-map-node" cx="500" cy="118" r="12" />
            <circle className="signal-map-node" cx="128" cy="366" r="12" />
            <circle className="signal-map-node" cx="528" cy="340" r="12" />
            <circle className="signal-map-node" cx="360" cy="384" r="12" />
          </svg>
          <span className="signal-map-label signal-map-label--a">DISCOVER</span>
          <span className="signal-map-label signal-map-label--b">LAUNCH</span>
          <span className="signal-map-label signal-map-label--c">TRACK</span>
          <span className="signal-map-label signal-map-label--d">SUPPORT</span>
          <span className="signal-map-label signal-map-label--e">REVIEW</span>
          <div className="signal-map-center"><span>YOUR</span><b>MOVE</b></div>
          <div className="signal-map-legend"><span><i />Open route</span><span><i />Active record</span></div>
        </figure>
      </section>

      <section className="signal-index" aria-label="Panel capabilities">
        <div><span>CATALOG</span><b>Services in context</b></div>
        <div><span>ACTIVITY</span><b>Order status in view</b></div>
        <div><span>SUPPORT</span><b>Help, kept close</b></div>
        <div><span>ACCESS</span><b>API when you need it</b></div>
      </section>

      <section className="signal-section signal-method" id="method">
        <div className="signal-section-intro">
          <span className="signal-index-mark">02</span>
          <div>
            <p className="signal-eyebrow">The working method</p>
            <h2>Less dashboard. More direction.</h2>
          </div>
        </div>
        <div className="signal-method-copy">
          <p>Most panels bury the next action under a layer of noise. {title} is composed as an operational ledger: each surface exists to help you decide, launch, or understand what happened.</p>
          <Link href="/services" className="signal-text-link">See the live catalog <i className="fe fe-arrow-up-right" /></Link>
        </div>
        <div className="signal-principles">
          {PRINCIPLES.map(([number, heading, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{heading}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="signal-section signal-workflow">
        <div className="signal-workflow-heading">
          <p className="signal-eyebrow">A composed sequence</p>
          <h2>Four moves. One clean record.</h2>
          <p>Everything stays close enough to make the next decision simple.</p>
        </div>
        <div className="signal-steps">
          {STEPS.map(([number, heading, body]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{heading}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="signal-section signal-platforms">
        <div className="signal-platform-copy">
          <p className="signal-eyebrow">A channel-aware workspace</p>
          <h2>Where attention already lives.</h2>
          <p>The catalog is structured around social channels, so the route from intent to action stays easy to read.</p>
        </div>
        <div className="signal-platform-list" aria-label="Social platform categories">
          <span><i className="fa fa-instagram" />Instagram</span>
          <span><i className="fa fa-youtube-play" />YouTube</span>
          <span><i className="fa fa-music" />TikTok</span>
          <span><i className="fa fa-facebook" />Facebook</span>
        </div>
      </section>

      <section className="signal-section signal-faq" id="faq">
        <div className="signal-faq-title">
          <p className="signal-eyebrow">Before you begin</p>
          <h2>Useful answers. No filler.</h2>
          <Link href="/faq" className="signal-text-link">Visit the knowledge base <i className="fe fe-arrow-up-right" /></Link>
        </div>
        <div className="signal-faq-list">
          {FAQS.map(([question, answer], index) => (
            <details key={question}>
              <summary><span>0{index + 1}</span>{question}<i className="fe fe-plus" /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="signal-closing">
        <div>
          <span className="signal-index-mark">03</span>
          <p className="signal-eyebrow">The field is open</p>
          <h2>Give your next campaign a clearer beginning.</h2>
        </div>
        <div>
          <p>{tagline}</p>
          <Link className="atelier-action atelier-action--solid" href={primaryHref}>{primaryLabel} <i className="fe fe-arrow-up-right" /></Link>
        </div>
      </section>
    </main>
  );
}

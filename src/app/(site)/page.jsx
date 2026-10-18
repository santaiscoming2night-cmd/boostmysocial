import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const CAPABILITIES = [
  {
    icon: 'fe fe-layers',
    title: 'One clear control room',
    text: 'Browse the catalog, launch orders, track delivery, and see the numbers that matter without hopping between tools.',
  },
  {
    icon: 'fe fe-activity',
    title: 'Built for momentum',
    text: 'Give every campaign a clean workflow—from selecting a service to following status changes in real time.',
  },
  {
    icon: 'fe fe-shield',
    title: 'Operationally calm',
    text: 'Keep balances, support, order logs, and API tools in a focused workspace designed for repeatable growth.',
  },
];

const STEPS = [
  ['01', 'Create access', 'Open your workspace in a moment. There is no verification-email detour.'],
  ['02', 'Fund your balance', 'Choose an available payment method and set your campaign budget.'],
  ['03', 'Launch precisely', 'Pick a service, enter your link and quantity, then submit your order.'],
  ['04', 'Watch the signal', 'Track status and delivery from the live activity surface in your panel.'],
];

const FAQS = [
  ['What is an SMM panel?', 'It is a central workspace for browsing and ordering social media marketing services, then tracking every order in one place.'],
  ['Which services can I find here?', 'The catalog can include services for social platforms such as Instagram, Facebook, YouTube, TikTok, and more. Availability is shown in the live service list.'],
  ['What is drip-feed?', 'Drip-feed lets a larger order be paced over time rather than delivered all at once. Select services that support it when you want a more gradual schedule.'],
  ['Can I manage multiple orders?', 'Yes. Your order logs collect all campaign activity, while the workspace makes it simple to review individual statuses and balances.'],
];

export default async function HomePage({ searchParams }) {
  const [settings, user, params] = await Promise.all([getSettings(), getSessionUser(), searchParams]);
  const title = settings.website_title || 'Boost My Social';
  const primaryHref = user ? '/dashboard' : '/signup';
  const primaryLabel = user ? 'Open command center' : 'Create your access';

  return (
    <main id="home">
      {params?.subscribed ? (
        <div className="nova-container" style={{ paddingTop: 104 }}>
          <div className="alert alert-success mb-0">Thanks for subscribing. Your signal is on our radar.</div>
        </div>
      ) : null}

      <section className="nova-hero" aria-labelledby="hero-heading">
        <div className="nova-container nova-hero-grid">
          <div className="nova-hero-copy">
            <p className="nova-kicker">Social growth, re-engineered</p>
            <h1 id="hero-heading">Your next move deserves <em>a command center.</em></h1>
            <p className="nova-hero-lede">
              {title} turns social growth into a deliberate system: discover the right service, launch with confidence, and keep every campaign in view.
            </p>
            <div className="nova-hero-actions">
              <Link className="nova-btn" href={primaryHref}>
                <i className="fe fe-zap" aria-hidden="true" /> {primaryLabel}
              </Link>
              <Link className="nova-btn nova-btn--ghost" href="/services">
                Explore services <i className="fe fe-arrow-up-right" aria-hidden="true" />
              </Link>
            </div>
            <p className="nova-hero-note"><span className="nova-live-dot" />Instant workspace access · no confirmation-email queue</p>
          </div>

          <div className="nova-hero-visual" aria-label="Preview of the panel command center">
            <div className="nova-hero-orb" aria-hidden="true" />
            <div className="nova-command-preview">
              <div className="nova-preview-bar">
                <div className="nova-preview-dots" aria-hidden="true"><b /><b /><b /></div>
                <span>Campaign pulse</span>
              </div>
              <div className="nova-preview-body">
                <div className="nova-preview-rail" aria-hidden="true">
                  <div className="nova-preview-brand-line" />
                  <div className="nova-preview-nav-line active" />
                  <div className="nova-preview-nav-line" />
                  <div className="nova-preview-nav-line" />
                  <div className="nova-preview-nav-line" />
                  <div className="nova-preview-nav-line" />
                </div>
                <div className="nova-preview-content">
                  <div className="nova-preview-title-row"><b>Signal overview</b><span><i className="nova-live-dot" />Live</span></div>
                  <div className="nova-preview-stats">
                    <div className="nova-preview-stat"><span>Orders</span><b>1,284</b></div>
                    <div className="nova-preview-stat"><span>Delivery</span><b className="cyan">99.9%</b></div>
                    <div className="nova-preview-stat"><span>Active</span><b className="lime">24</b></div>
                  </div>
                  <div className="nova-preview-chart" aria-hidden="true">
                    <svg viewBox="0 0 330 131" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="novaChartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#61e8ff" stopOpacity=".32" />
                          <stop offset="100%" stopColor="#61e8ff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path className="fill" d="M0,108 C24,101 31,104 47,94 C66,82 70,92 93,71 C117,51 129,73 149,59 C171,43 177,52 195,41 C222,23 231,50 250,33 C276,9 288,24 330,12 L330,131 L0,131 Z" />
                      <path className="line" d="M0,108 C24,101 31,104 47,94 C66,82 70,92 93,71 C117,51 129,73 149,59 C171,43 177,52 195,41 C222,23 231,50 250,33 C276,9 288,24 330,12" />
                      <circle cx="250" cy="33" r="4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="nova-float-card nova-float-card--orders">
              <span className="nova-float-icon"><i className="fe fe-check" /></span>
              <div><b>Order routed</b><span>Campaign is in motion</span></div>
            </div>
            <div className="nova-float-card nova-float-card--signal">
              <span className="nova-float-icon"><i className="fe fe-activity" /></span>
              <div><b>Signal strong</b><span>All systems ready</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="nova-hero-trust">
        <div className="nova-hero-trust-inner">
          <div className="nova-trust-item"><span className="nova-trust-icon"><i className="fe fe-zap" /></span><div><b>Fast launch flow</b><span>From service to order</span></div></div>
          <div className="nova-trust-item"><span className="nova-trust-icon"><i className="fe fe-eye" /></span><div><b>Clear visibility</b><span>Status at a glance</span></div></div>
          <div className="nova-trust-item"><span className="nova-trust-icon"><i className="fe fe-repeat" /></span><div><b>Built to repeat</b><span>For every campaign cycle</span></div></div>
          <div className="nova-trust-item"><span className="nova-trust-icon"><i className="fe fe-headphones" /></span><div><b>Support nearby</b><span>Open a ticket anytime</span></div></div>
        </div>
      </div>

      <section className="nova-home-section" id="network">
        <div className="nova-container">
          <div className="nova-section-heading center">
            <p className="nova-kicker">Less noise. More signal.</p>
            <h2>Not another generic dashboard.</h2>
            <p>A tactile, high-clarity operating layer for social campaigns—designed to make the next action obvious.</p>
          </div>
          <div className="nova-service-grid">
            {CAPABILITIES.map((capability) => (
              <article className="nova-service-card" key={capability.title}>
                <span className="nova-service-glyph"><i className={capability.icon} aria-hidden="true" /></span>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="nova-home-section" style={{ paddingTop: 34 }}>
        <div className="nova-container nova-network">
          <div className="nova-network-visual" aria-hidden="true">
            <div className="nova-network-ring" />
            <div className="nova-network-core"><i className="fe fe-zap" /></div>
            <div className="nova-network-node"><i className="fa fa-instagram" /></div>
            <div className="nova-network-node"><i className="fa fa-youtube-play" /></div>
            <div className="nova-network-node"><i className="fa fa-facebook" /></div>
            <div className="nova-network-node"><i className="fa fa-music" /></div>
          </div>
          <div className="nova-network-copy">
            <div className="nova-section-heading">
              <p className="nova-kicker">The connected layer</p>
              <h2>Every platform, one focused orbit.</h2>
              <p>Keep your social promotion workflow centered even when your audience lives in many places.</p>
            </div>
            <div className="nova-network-points">
              <div className="nova-network-point"><i className="fe fe-command" /><div><b>Structured service discovery</b><span>Browse categories, compare limits, and choose a service with the context you need.</span></div></div>
              <div className="nova-network-point"><i className="fe fe-sliders" /><div><b>Campaign-level control</b><span>Set your link, quantity, and pacing with a form that makes each order easy to understand.</span></div></div>
              <div className="nova-network-point"><i className="fe fe-bar-chart-2" /><div><b>Activity that stays visible</b><span>Use order logs and live statuses to know what is moving without digging through clutter.</span></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="nova-home-section">
        <div className="nova-container nova-process-shell">
          <div className="nova-section-heading center">
            <p className="nova-kicker">A cleaner launch sequence</p>
            <h2>Four moves to momentum.</h2>
            <p>Designed to feel deliberate from the first click—not like another form you have to fight.</p>
          </div>
          <div className="nova-process-grid">
            {STEPS.map(([number, title, text]) => (
              <article className="nova-process-step" key={number}>
                <span className="nova-process-number">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <div className="nova-platform-row" aria-label="Supported social platforms">
            <span className="nova-platform"><i className="fa fa-instagram" />Instagram</span>
            <span className="nova-platform"><i className="fa fa-youtube-play" />YouTube</span>
            <span className="nova-platform"><i className="fa fa-music" />TikTok</span>
            <span className="nova-platform"><i className="fa fa-facebook" />Facebook</span>
          </div>
        </div>
      </section>

      <section className="nova-home-section" id="faq">
        <div className="nova-container">
          <div className="nova-section-heading center">
            <p className="nova-kicker">Clarity, on demand</p>
            <h2>Questions before lift-off?</h2>
            <p>Here are a few quick answers. Visit the knowledge base when you want to go deeper.</p>
          </div>
          <div className="nova-faq-grid">
            {FAQS.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="nova-home-section" style={{ paddingTop: 0 }}>
        <div className="nova-container nova-cta-panel">
          <p className="nova-kicker">The panel is ready</p>
          <h2>Make your next campaign feel inevitable.</h2>
          <p>Open a premium workspace that puts social growth, campaign activity, and your next decision in the same orbit.</p>
          <Link className="nova-btn" href={primaryHref}><i className="fe fe-zap" /> {primaryLabel}</Link>
        </div>
      </section>
    </main>
  );
}

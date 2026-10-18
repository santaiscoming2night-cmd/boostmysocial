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
  { icon: 'fa fa-instagram', tone: 'instagram', title: 'Visual momentum', text: 'Shape the reach around your posts, reels, stories, and profile presence.' },
  { icon: 'fa fa-youtube-play', tone: 'youtube', title: 'Video velocity', text: 'Give new videos a stronger starting spark and keep your catalog moving.' },
  { icon: 'fa fa-music', tone: 'tiktok', title: 'Culture in motion', text: 'Choose services built for short-form moments, sounds, and fast attention.' },
  { icon: 'fa fa-facebook', tone: 'facebook', title: 'Community lift', text: 'Support the pages, groups, and conversations your audience already follows.' },
];

const STEPS = [
  ['01', 'Pick your platform', 'Choose a category made for the social channel you want to grow.'],
  ['02', 'Choose the boost', 'Compare service details, limits, and rates before you boost.'],
  ['03', 'Set the pace', 'Add your link and quantity, then send the campaign into motion.'],
  ['04', 'Watch it travel', 'Track delivery and status from your personal campaign space.'],
];

const FAQS = [
  ['What can I grow with this panel?', 'The live catalog contains the currently available social media marketing services, arranged by platform and goal.'],
  ['Can I see an order after I place it?', 'Yes. Your dashboard and order log keep campaign status, charge, link, and activity in view.'],
  ['What is drip-feed?', 'For eligible services, drip-feed lets you pace a larger order over time instead of requesting a single release.'],
  ['Do I need to verify an email before starting?', 'No. New workspaces open immediately after account creation, so you can start exploring the panel right away.'],
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
          <p className="social-eyebrow"><span className="social-eyebrow-dot" />The social media boost room</p>
          <h1 id="hero-heading">Turn your <span>socials</span> into a movement.</h1>
          <p className="social-hero-tagline">{tagline}</p>
          <p className="social-hero-lede">{title} gives creators, agencies, and resellers one colourful control space to start social campaigns and keep every boost in view.</p>
          <div className="social-hero-actions">
            <Link className="social-action social-action--primary" href={primaryHref}><i className="fe fe-zap" />{primaryLabel}</Link>
            <Link className="social-action social-action--ghost" href="/services">Explore services <i className="fe fe-arrow-up-right" /></Link>
          </div>
          <div className="social-hero-note"><span><i className="fe fe-check" /></span>Instant access · no confirmation-email wait</div>
        </div>

        <div className="social-hero-stage" aria-label="Social campaign dashboard preview">
          <div className="social-stage-spark social-stage-spark--one" aria-hidden="true" />
          <div className="social-stage-spark social-stage-spark--two" aria-hidden="true" />
          <div className="social-phone-card">
            <div className="social-phone-topbar"><span className="social-phone-dots"><i /><i /><i /></span><span>boost feed</span><i className="fe fe-more-horizontal" /></div>
            <div className="social-phone-profile">
              <span className="social-profile-avatar"><i className="fa fa-instagram" /></span>
              <div><b>Campaign pulse</b><small>Instagram · active now</small></div>
              <span className="social-live-pill">LIVE</span>
            </div>
            <div className="social-phone-post">
              <div className="social-post-orbit"><i className="fa fa-instagram" /><span>+</span></div>
              <div className="social-post-wave"><i /><i /><i /><i /><i /><i /><i /></div>
              <span className="social-post-caption">Your next post is taking off</span>
            </div>
            <div className="social-post-stats">
              <span><i className="fe fe-heart" /> 12.8K</span>
              <span><i className="fe fe-message-circle" /> 1.4K</span>
              <span><i className="fe fe-send" /> 3.2K</span>
            </div>
            <div className="social-phone-progress"><span /><span /><span /><span /><span /></div>
          </div>
          <div className="social-mini-card social-mini-card--growth"><span className="social-mini-icon"><i className="fa fa-youtube-play" /></span><div><small>Video energy</small><b>+4.8K views</b></div></div>
          <div className="social-mini-card social-mini-card--audience"><span className="social-mini-icon"><i className="fa fa-facebook" /></span><div><small>Audience pulse</small><b>Growing now</b></div></div>
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
          <p className="social-eyebrow">Not just another panel</p>
          <h2>Built for the way social actually moves.</h2>
          <p>Every campaign begins with a moment. The panel is designed to help that moment travel farther, faster, and with less friction.</p>
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
          <p className="social-eyebrow">Pick your kind of momentum</p>
          <h2>Every boost has a different beat.</h2>
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
          <p className="social-eyebrow">From idea to impact</p>
          <h2>Four taps to your next social push.</h2>
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
          <p className="social-eyebrow">Need the details?</p>
          <h2>Questions from the feed.</h2>
          <p>Get a quick read below, or head to the full knowledge base when you need more.</p>
          <Link href="/faq" className="social-action social-action--ghost">Open FAQ <i className="fe fe-arrow-up-right" /></Link>
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
          <p className="social-eyebrow">Your audience is out there</p>
          <h2>Give them something to find.</h2>
          <p>{tagline}</p>
          <Link className="social-action social-action--primary" href={primaryHref}><i className="fe fe-zap" />{primaryLabel}</Link>
        </div>
      </section>
    </main>
  );
}

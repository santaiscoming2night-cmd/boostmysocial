'use client';

import Link from 'next/link';
import { useId, useState } from 'react';

const PLATFORMS = [
  {
    id: 'instagram',
    icon: 'fa fa-instagram',
    name: 'Instagram',
    line: 'Make your next post stand out.',
    services: ['Likes', 'Followers', 'Reel views'],
    stat: 'POST READY',
    number: '01',
  },
  {
    id: 'tiktok',
    icon: 'fa fa-music',
    name: 'TikTok',
    line: 'Give your video a stronger start.',
    services: ['Views', 'Likes', 'Followers'],
    stat: 'VIDEO READY',
    number: '02',
  },
  {
    id: 'youtube',
    icon: 'fa fa-youtube-play',
    name: 'YouTube',
    line: 'Help your videos reach further.',
    services: ['Views', 'Likes', 'Subscribers'],
    stat: 'VIDEO READY',
    number: '03',
  },
  {
    id: 'facebook',
    icon: 'fa fa-facebook',
    name: 'Facebook',
    line: 'Build more activity around your page.',
    services: ['Page likes', 'Post likes', 'Followers'],
    stat: 'PAGE READY',
    number: '04',
  },
];

export default function PlatformPlayground() {
  const [selectedId, setSelectedId] = useState('instagram');
  const panelId = useId();
  const selected = PLATFORMS.find((platform) => platform.id === selectedId) || PLATFORMS[0];

  return (
    <section className="pulse-platform-lab" aria-labelledby="platform-lab-title">
      <div className="pulse-section-heading pulse-section-heading--split">
        <div>
          <p className="pulse-kicker">PICK A PLATFORM</p>
          <h2 id="platform-lab-title">Your social growth menu.</h2>
        </div>
        <p>Choose a platform to see the kind of services you can explore.</p>
      </div>

      <div className="pulse-lab" data-platform={selected.id}>
        <div className="pulse-lab-tabs" role="tablist" aria-label="Choose a social platform">
          {PLATFORMS.map((platform) => {
            const selectedTab = platform.id === selected.id;
            return (
              <button
                key={platform.id}
                type="button"
                role="tab"
                aria-selected={selectedTab}
                aria-controls={panelId}
                className={`pulse-lab-tab ${selectedTab ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(platform.id)}
              >
                <i className={platform.icon} aria-hidden="true" />
                <span>{platform.name}</span>
                <small>{platform.number}</small>
              </button>
            );
          })}
        </div>

        <div className="pulse-lab-panel" id={panelId} role="tabpanel" aria-live="polite">
          <div className="pulse-lab-art" aria-hidden="true">
            <span className="pulse-lab-art-grid" />
            <span className="pulse-lab-art-icon"><i className={selected.icon} /></span>
            <span className="pulse-lab-art-heart"><i className="fe fe-heart" /></span>
            <span className="pulse-lab-art-spark">✦</span>
            <span className="pulse-lab-art-stamp">{selected.stat}</span>
          </div>
          <div className="pulse-lab-copy">
            <span className="pulse-lab-number">{selected.number}</span>
            <h3>{selected.name}</h3>
            <p>{selected.line}</p>
            <div className="pulse-service-chips" aria-label={`${selected.name} service examples`}>
              {selected.services.map((service) => <span key={service}>{service}</span>)}
            </div>
            <Link href="/services" className="pulse-link">Browse services <i className="fe fe-arrow-up-right" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

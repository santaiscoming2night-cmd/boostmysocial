'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Brand({ settings, href = '/', className = '', showTagline = false, onNavigate }) {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [inverseFailed, setInverseFailed] = useState(false);
  const name = settings?.website_title || 'Boost My Social';
  const tagline = settings?.website_tagline || 'Social growth, kept in line.';
  const primaryLogo = settings?.website_logo || '';
  const inverseLogo = settings?.website_logo_white || primaryLogo;
  const hasPrimary = Boolean(primaryLogo && !primaryFailed);
  const hasInverse = Boolean(inverseLogo && !inverseFailed);

  return (
    <Link href={href} className={`atelier-brand ${className}`.trim()} onClick={onNavigate} aria-label={`${name} home`}>
      <span className="atelier-brand-symbol" aria-hidden="true">
        {hasPrimary || hasInverse ? (
          <span className={`atelier-brand-images ${!hasPrimary ? 'no-light' : ''} ${!hasInverse ? 'no-dark' : ''}`}>
            {hasPrimary ? <img className="atelier-brand-logo atelier-brand-logo--light" src={primaryLogo} alt="" onError={() => setPrimaryFailed(true)} /> : null}
            {hasInverse ? <img className="atelier-brand-logo atelier-brand-logo--dark" src={inverseLogo} alt="" onError={() => setInverseFailed(true)} /> : null}
          </span>
        ) : (
          <span className="atelier-brand-fallback">{name.slice(0, 1).toUpperCase()}</span>
        )}
      </span>
      <span className="atelier-brand-copy">
        <span className="atelier-brand-name">{name}</span>
        {showTagline ? <span className="atelier-brand-tagline">{tagline}</span> : null}
      </span>
    </Link>
  );
}

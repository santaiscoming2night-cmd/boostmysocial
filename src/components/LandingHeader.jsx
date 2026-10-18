'use client';

import Link from 'next/link';
import { useState } from 'react';

function Brand({ title }) {
  return (
    <Link className="nova-brand" href="/" aria-label={`${title} home`}>
      <span className="nova-brand-mark" aria-hidden="true">✦</span>
      <span className="nova-brand-name">{title}</span>
    </Link>
  );
}

export default function LandingHeader({ settings, user }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const title = settings.website_title || 'Boost My Social';

  return (
    <header className="nova-header">
      <div className="nova-header-inner">
        <Brand title={title} />
        <button
          className="nova-menu-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="nova-main-navigation"
          aria-label="Toggle navigation"
        >
          <i className={open ? 'fe fe-x' : 'fe fe-menu'} aria-hidden="true" />
        </button>
        <nav id="nova-main-navigation" className={`nova-header-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          <a href="/#home" onClick={closeMenu}>Home</a>
          <a href="/#network" onClick={closeMenu}>Network</a>
          <Link href="/services" onClick={closeMenu}>Services</Link>
          <Link href="/news" onClick={closeMenu}>Updates</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
        </nav>
        <div className="nova-header-actions">
          {user ? (
            <Link href="/dashboard" className="nova-btn nova-header-cta">
              <i className="fe fe-grid" aria-hidden="true" /> Panel
            </Link>
          ) : (
            <>
              <Link className="nova-header-login" href="/login">Sign in</Link>
              <Link href="/signup" className="nova-btn nova-header-cta">
                <i className="fe fe-zap" aria-hidden="true" /> Start now
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

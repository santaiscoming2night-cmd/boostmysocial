'use client';

import Link from 'next/link';
import { useState } from 'react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingHeader({ settings, user }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="atelier-header">
      <div className="atelier-header-inner">
        <Brand settings={settings} className="atelier-header-brand" />
        <button
          className="atelier-menu-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="atelier-main-navigation"
          aria-label="Toggle navigation"
        >
          <i className={open ? 'fe fe-x' : 'fe fe-menu'} aria-hidden="true" />
        </button>
        <nav id="atelier-main-navigation" className={`atelier-header-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          <a href="/#home" onClick={closeMenu}>Home</a>
          <a href="/#method" onClick={closeMenu}>Method</a>
          <Link href="/services" onClick={closeMenu}>Services</Link>
          <Link href="/news" onClick={closeMenu}>Updates</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
        </nav>
        <div className="atelier-header-tools">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="atelier-action atelier-action--solid">
              Enter panel <i className="fe fe-arrow-up-right" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link className="atelier-sign-in" href="/login">Sign in</Link>
              <Link href="/signup" className="atelier-action atelier-action--solid">Start here <i className="fe fe-arrow-up-right" aria-hidden="true" /></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

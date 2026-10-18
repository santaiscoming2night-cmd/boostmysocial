'use client';

import Link from 'next/link';
import { useState } from 'react';
import Brand from '@/components/Brand';
import ThemeToggle from '@/components/ThemeToggle';

export default function LandingHeader({ settings, user }) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="social-header">
      <div className="social-header-inner">
        <Brand settings={settings} className="social-header-brand" />
        <button
          className="social-menu-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="social-main-navigation"
          aria-label="Toggle navigation"
        >
          <i className={open ? 'fe fe-x' : 'fe fe-menu'} aria-hidden="true" />
        </button>
        <nav id="social-main-navigation" className={`social-header-nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          <a href="/#home" onClick={closeMenu}>Home</a>
          <a href="/#method" onClick={closeMenu}>How it works</a>
          <Link href="/services" onClick={closeMenu}>Services</Link>
          <Link href="/news" onClick={closeMenu}>Updates</Link>
          <Link href="/faq" onClick={closeMenu}>FAQ</Link>
        </nav>
        <div className="social-header-tools">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="social-header-cta"><i className="fe fe-grid" />My panel</Link>
          ) : (
            <>
              <Link className="social-sign-in" href="/login">Sign in</Link>
              <Link href="/signup" className="social-header-cta"><i className="fe fe-zap" />Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingHeader({ settings, user }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header fixed-top" id="headerNav">
      <div className="container">
        <nav className="navbar navbar-expand-lg">
          <Link className="navbar-brand" href="/">
            <img
              className="site-logo d-none"
              src={settings.website_logo || '/assets/images/logo.png'}
              alt="Website logo"
              onError={(event) => { event.currentTarget.src = '/assets/images/logo.png'; }}
            />
            <img
              className="site-logo-white"
              src={settings.website_logo_white || settings.website_logo || '/assets/images/logo-white.png'}
              alt="Website logo"
              onError={(event) => { event.currentTarget.src = '/assets/images/logo-white.png'; }}
            />
          </Link>
          <button className="navbar-toggler" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            <span><i className="fe fe-menu" /></span>
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item active"><a className="nav-link" href="/#home">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="/#services">What we offer</a></li>
              <li className="nav-item"><Link className="nav-link" href="/services">Services</Link></li>
              <li className="nav-item"><Link className="nav-link" href="/faq">FAQs</Link></li>
            </ul>
            <div className="nav-item d-md-flex btn-login-signup">
              {user ? (
                <Link href="/dashboard" className="btn btn-pill btn-outline-primary sign-up">Dashboard</Link>
              ) : (
                <>
                  <Link className="link btn-login" href="/login">Login</Link>
                  <Link href="/signup" className="btn btn-pill btn-outline-primary sign-up">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

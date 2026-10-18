'use client';

import { useState } from 'react';

function LogoPreview({ url, name }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <span className="brand-studio-monogram">{name.slice(0, 1).toUpperCase()}</span>;
  return <img src={url} alt="Current logo preview" onError={() => setFailed(true)} />;
}

export default function BrandSettingsFields({ settings }) {
  const initialLogo = settings.website_logo || '';
  const initialDarkLogo = settings.website_logo_white || '';
  const [name, setName] = useState(settings.website_title || 'Boost My Social');
  const [tagline, setTagline] = useState(settings.website_tagline || 'Social growth, made louder.');
  const [logo, setLogo] = useState(initialLogo);
  const [darkLogo, setDarkLogo] = useState(initialDarkLogo);

  function updatePrimaryLogo(value) {
    setLogo(value);
    // Legacy installs often use the same URL for both theme variants. Keep
    // that convenient default in sync until an admin deliberately supplies a
    // separate dark-mode mark.
    if (!darkLogo || (initialLogo === initialDarkLogo && darkLogo === initialDarkLogo)) {
      setDarkLogo(value);
    }
  }

  return (
    <section className="brand-studio">
      <div className="brand-studio-intro">
        <p className="brand-studio-eyebrow">Brand identity</p>
        <h2>Make the panel unmistakably yours.</h2>
        <p>Name, mark, and message are used across the public site, access screens, and social workspace.</p>
      </div>
      <div className="brand-studio-preview" aria-label="Live brand preview">
        <div className="brand-studio-preview-mark"><LogoPreview key={logo} url={logo} name={name} /></div>
        <div>
          <strong>{name || 'Your panel name'}</strong>
          <span>{tagline || 'Your distinct point of view goes here.'}</span>
        </div>
        <small>LIVE PREVIEW</small>
      </div>
      <div className="brand-studio-fields">
        <div className="form-group">
          <label className="form-label" htmlFor="website-title">Panel name</label>
          <input id="website-title" name="s_website_title" value={name} onChange={(event) => setName(event.target.value)} className="form-control" required />
        </div>
        <div className="form-group brand-studio-field-wide">
          <label className="form-label" htmlFor="website-tagline">Tagline</label>
          <input id="website-tagline" name="s_website_tagline" value={tagline} onChange={(event) => setTagline(event.target.value)} className="form-control" placeholder="A short, memorable point of view" />
          <small>Shown below your name on the home page and brand surfaces.</small>
        </div>
        <div className="form-group brand-studio-field-wide">
          <label className="form-label" htmlFor="website-logo">Primary logo URL</label>
          <input id="website-logo" name="s_website_logo" value={logo} onChange={(event) => updatePrimaryLogo(event.target.value)} className="form-control" placeholder="https://…/your-logo.svg" />
          <small>Use a public transparent PNG or SVG. This is the main logo used on light surfaces.</small>
        </div>
        <div className="form-group brand-studio-field-wide">
          <label className="form-label" htmlFor="website-logo-dark">Dark-mode logo URL <span className="text-muted">(optional)</span></label>
          <input id="website-logo-dark" name="s_website_logo_white" value={darkLogo} onChange={(event) => setDarkLogo(event.target.value)} className="form-control" placeholder="https://…/your-logo-light.svg" />
          <small>Leave blank to use the primary logo in both modes.</small>
        </div>
      </div>
    </section>
  );
}

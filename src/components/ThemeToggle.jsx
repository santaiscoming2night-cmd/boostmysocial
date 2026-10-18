'use client';

import { useEffect, useState } from 'react';

function preferredTheme() {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem('boostmysocial-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle({ compact = false, className = '' }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const syncTheme = () => setTheme(document.documentElement.dataset.theme || preferredTheme());
    syncTheme();
    window.addEventListener('storage', syncTheme);
    window.addEventListener('themechange', syncTheme);
    return () => {
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('themechange', syncTheme);
    };
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem('boostmysocial-theme', next);
    setTheme(next);
    window.dispatchEvent(new Event('themechange'));
  }

  const nextLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'theme-toggle--compact' : ''} ${className}`}
      aria-label={nextLabel}
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-glyph" aria-hidden="true">
        <i className={theme === 'dark' ? 'fe fe-sun' : 'fe fe-moon'} />
      </span>
      {!compact ? <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span> : null}
    </button>
  );
}

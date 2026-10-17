'use client';

import { useState } from 'react';

export default function CopyField({ value, label }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="input-group">
      {label ? <span className="input-group-text">{label}</span> : null}
      <input className="form-control" readOnly value={value || ''} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="btn btn-secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

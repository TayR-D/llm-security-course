import { useState } from 'react';
import { PROFILES, FIELDS } from '../data/profiles';

/**
 * M16 · Provider profiles
 * One profile per provider on a fixed template, so they read the same way. Data
 * lives in ../data/profiles.ts (single source of truth). Verified 2026-10-01.
 */

export default function ProviderProfiles() {
  const [selId, setSelId] = useState(PROFILES[0].id);
  const p = PROFILES.find((x) => x.id === selId)!;

  return (
    <div className="wg">
      <h3>Provider profiles</h3>
      <p className="wg-note">
        The same template for every provider, so differences jump out. Pick one. Closed-API
        providers stack safeguards they control; open-weight providers hand you the toolkit — and
        the responsibility.
      </p>

      <div className="pp-tabs">
        {PROFILES.map((x) => (
          <button key={x.id} className={`pp-tab ${selId === x.id ? 'is-sel' : ''}`} aria-pressed={selId === x.id} onClick={() => setSelId(x.id)}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="pp-head">
        <div>
          <strong className="pp-name">{p.name}</strong>
          <span className="wg-note"> — {p.flagship}</span>
        </div>
        <span className={`wg-pill ${p.openWeight ? 'warn' : 'good'}`}>
          {p.openWeight ? 'open weight' : 'closed API'}
        </span>
      </div>

      <dl className="pp-fields">
        {FIELDS.map((f) => (
          <div key={f.key} className="pp-field">
            <dt>{f.label}</dt>
            <dd>{p[f.key] as string}</dd>
          </div>
        ))}
      </dl>

      <div className="pp-sources">
        <span className="wg-note">Sources:</span>
        {p.sources.map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="pp-src">
            {s.label} ↗
          </a>
        ))}
      </div>

      <p className="wg-banner">
        Fixed-template profiles, verified 2026-10-01. Fields are drawn from each provider&rsquo;s
        own documents where stated; inferences are flagged in the text. The M17 matrix compares
        these providers cell-by-cell; this module reads one at a time.
      </p>

      <style>{`
        .pp-tabs { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.5rem 0; }
        .pp-tab { font: inherit; font-size: 0.82rem; font-weight: 600; border: 1px solid var(--wg-border);
          border-radius: 7px; background: var(--wg-surface-raised); padding: 0.4rem 0.6rem; cursor: pointer; }
        .pp-tab.is-sel { background: var(--wg-accent-soft); border-color: var(--wg-accent); }
        .pp-head { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin: 0.3rem 0 0.5rem; }
        .pp-name { font-size: 0.95rem; }
        .pp-fields { margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .pp-field { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.5rem 0.6rem; background: var(--wg-surface); }
        .pp-field dt { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--wg-ink-quiet); font-weight: 700; }
        .pp-field dd { margin: 0.25rem 0 0; font-size: 0.85rem; }
        .pp-sources { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.7rem; }
        .pp-src { font-size: 0.78rem; }
      `}</style>
    </div>
  );
}

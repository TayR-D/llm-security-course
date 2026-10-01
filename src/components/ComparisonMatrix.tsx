import { useMemo, useState } from 'react';
import {
  DIMENSIONS,
  PROVIDERS,
  MATRIX,
  EVIDENCE_META,
  type Evidence,
} from '../data/comparison';

/**
 * M17 · Guardrail comparison matrix
 * Filter three providers across eight dimensions. Every cell is sourced, dated
 * and evidence-tagged. Data lives in ../data/comparison.ts — the single source
 * of truth, so a refresh edits data, not this component.
 */

const EVIDENCE_FILTERS: (Evidence | 'all')[] = ['all', 'documented', 'observed', 'inferred'];

export default function ComparisonMatrix() {
  const [activeProviders, setActiveProviders] = useState<string[]>(
    PROVIDERS.map((p) => p.id),
  );
  const [evidenceFilter, setEvidenceFilter] = useState<Evidence | 'all'>('all');
  const [dimId, setDimId] = useState(DIMENSIONS[0].id);

  const shown = PROVIDERS.filter((p) => activeProviders.includes(p.id));

  function toggleProvider(id: string) {
    setActiveProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const activeDim = DIMENSIONS.find((d) => d.id === dimId)!;

  // Count cells matching the evidence filter, for the caption.
  const matchCount = useMemo(() => {
    if (evidenceFilter === 'all') return null;
    let n = 0;
    for (const d of DIMENSIONS)
      for (const p of shown) if (MATRIX[d.id][p.id].evidence === evidenceFilter) n++;
    return n;
  }, [evidenceFilter, shown]);

  return (
    <div className="wg not-content">
      <h3 data-kind="Matrix">Guardrail comparison matrix</h3>
      <p className="wg-note">
        The same request meets a different wall on each model because guardrails live in
        different places. Filter the providers and dimensions below; every cell links to a
        primary source and carries an evidence tag and a check date.
      </p>

      <div className="cm-controls">
        <div className="wg-row">
          <span className="wg-note cm-ctl-label">Providers:</span>
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              className="wg-btn"
              aria-pressed={activeProviders.includes(p.id)}
              onClick={() => toggleProvider(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="wg-row">
          <span className="wg-note cm-ctl-label">Evidence:</span>
          {EVIDENCE_FILTERS.map((f) => (
            <button
              key={f}
              className="wg-btn"
              aria-pressed={evidenceFilter === f}
              onClick={() => setEvidenceFilter(f)}
            >
              {f === 'all' ? 'All' : EVIDENCE_META[f].label}
            </button>
          ))}
        </div>
      </div>
      {matchCount !== null ? (
        <p className="wg-note">
          {matchCount} cell{matchCount === 1 ? '' : 's'} tagged{' '}
          <strong>{EVIDENCE_META[evidenceFilter as Evidence].label}</strong> in the current
          view are highlighted; others are dimmed.
        </p>
      ) : null}

      {/* Desktop / wide: full matrix table */}
      <div className="cm-tablewrap">
        <table className="wg-table cm-table">
          <thead>
            <tr>
              <th scope="col">Dimension</th>
              {shown.map((p) => (
                <th key={p.id} scope="col">
                  {p.name}
                  <span className="cm-flagship">{p.flagship}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((d) => (
              <tr key={d.id}>
                <th scope="row" className="cm-dim">
                  {d.name}
                  <span className="wg-note cm-dim-blurb">{d.blurb}</span>
                </th>
                {shown.map((p) => {
                  const cell = MATRIX[d.id][p.id];
                  const dim =
                    evidenceFilter !== 'all' && cell.evidence !== evidenceFilter;
                  const em = EVIDENCE_META[cell.evidence];
                  return (
                    <td key={p.id} className={dim ? 'cm-dimmed' : ''}>
                      <span>{cell.value}</span>
                      <span className="cm-cell-foot">
                        <span className={`wg-pill ${em.pill}`}>{em.label}</span>
                        <a
                          className="cm-src"
                          href={cell.source.url}
                          target="_blank"
                          rel="noreferrer"
                          title={cell.source.title}
                        >
                          source ↗
                        </a>
                        <span className="cm-date">{cell.verified}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Narrow / phone: one dimension at a time */}
      <div className="cm-narrow">
        <label className="cm-select-label" htmlFor="cm-dim">
          Dimension
        </label>
        <select
          id="cm-dim"
          className="cm-select"
          value={dimId}
          onChange={(e) => setDimId(e.target.value)}
        >
          {DIMENSIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="wg-note">{activeDim.blurb}</p>
        <div className="wg-col">
          {shown.map((p) => {
            const cell = MATRIX[activeDim.id][p.id];
            const dim = evidenceFilter !== 'all' && cell.evidence !== evidenceFilter;
            const em = EVIDENCE_META[cell.evidence];
            return (
              <div key={p.id} className={`cm-card ${dim ? 'cm-dimmed' : ''}`}>
                <strong className="cm-card-provider">{p.name}</strong>
                <p className="cm-card-value">{cell.value}</p>
                <span className="cm-cell-foot">
                  <span className={`wg-pill ${em.pill}`}>{em.label}</span>
                  <a className="cm-src" href={cell.source.url} target="_blank" rel="noreferrer">
                    source ↗
                  </a>
                  <span className="cm-date">{cell.verified}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="wg-banner">
        Evidence tags: <strong>Documented</strong> = the provider states it;{' '}
        <strong>Observed</strong> = independent evaluation; <strong>Inferred</strong> = our
        reading. Cells carry the date they were last checked; the matrix is refreshed
        quarterly and after major launches.
      </p>

      <style>{`
        .cm-controls { display: flex; flex-direction: column; gap: 0.4rem; margin: 0.6rem 0; }
        .cm-ctl-label { width: 5.5rem; }
        .cm-tablewrap { overflow-x: auto; }
        .cm-table td, .cm-table th { font-size: 0.82rem; }
        .cm-table td span { display: block; }
        .cm-flagship { display: block; font-weight: 400; font-size: 0.72rem; color: var(--wg-ink-quiet); margin-top: 0.15rem; }
        .cm-dim { min-width: 8.5rem; }
        .cm-dim-blurb { display: block; font-weight: 400; margin-top: 0.15rem; }
        .cm-cell-foot { display: flex !important; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-top: 0.4rem; }
        .cm-src { font-size: 0.76rem; }
        .cm-date { font-size: 0.72rem; color: var(--wg-ink-quiet); font-family: var(--wg-mono); }
        .cm-dimmed { opacity: 0.38; }
        .cm-narrow { display: none; }
        .cm-select-label { font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 0.3rem; }
        .cm-select { width: 100%; padding: 0.45rem 0.5rem; border-radius: var(--r-md); border: 1px solid var(--wg-border);
          background: var(--wg-surface-raised); color: var(--wg-ink); font: inherit; font-size: 0.9rem; }
        .cm-card { border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.6rem; background: var(--wg-surface); }
        .cm-card-provider { font-size: 0.9rem; }
        .cm-card-value { margin: 0.3rem 0; font-size: 0.85rem; }
        @media (max-width: 720px) {
          .cm-tablewrap { display: none; }
          .cm-narrow { display: block; }
          .cm-ctl-label { width: 100%; }
        }
      `}</style>
    </div>
  );
}

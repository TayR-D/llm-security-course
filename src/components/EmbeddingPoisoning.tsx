import { useMemo, useState } from 'react';

/**
 * M9 · Embedding poisoning view
 * A 2D stand-in for embedding space. A poisoned chunk is placed near a target
 * query's neighborhood so the retriever pulls it into context. Toggle the poison
 * and switch queries to see when it lands. Illustrative 2D model; real embeddings
 * are high-dimensional.
 */

interface Point {
  id: string;
  x: number;
  y: number;
  label: string;
  poison?: boolean;
}

// Benign corpus chunks (stable positions in a 0..100 space).
const CORPUS: Point[] = [
  { id: 'c1', x: 22, y: 30, label: 'Refund policy' },
  { id: 'c2', x: 30, y: 24, label: 'Returns window' },
  { id: 'c3', x: 26, y: 38, label: 'Shipping times' },
  { id: 'c4', x: 70, y: 66, label: 'API rate limits' },
  { id: 'c5', x: 78, y: 72, label: 'Auth tokens guide' },
  { id: 'c6', x: 64, y: 74, label: 'Webhook setup' },
  { id: 'c7', x: 48, y: 50, label: 'Company overview' },
];

// The poisoned chunk: benign-looking text, embedded to sit in the refund cluster,
// but its body carries an injection that the model will read once retrieved.
const POISON: Point = { id: 'p', x: 25, y: 29, label: 'Poisoned "refund" doc', poison: true };

const QUERIES: Record<string, { x: number; y: number; label: string }> = {
  refund: { x: 24, y: 31, label: '"How do I get a refund?"' },
  api: { x: 73, y: 69, label: '"What are the API rate limits?"' },
};

const K = 3;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

export default function EmbeddingPoisoning() {
  const [poisoned, setPoisoned] = useState(true);
  const [queryId, setQueryId] = useState<keyof typeof QUERIES>('refund');
  const q = QUERIES[queryId];

  const retrieved = useMemo(() => {
    const pts = poisoned ? [...CORPUS, POISON] : [...CORPUS];
    return pts
      .map((p) => ({ p, d: dist(p.x, p.y, q.x, q.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, K);
  }, [poisoned, q]);

  const retrievedIds = new Set(retrieved.map((r) => r.p.id));
  const poisonRetrieved = retrievedIds.has('p');
  const allPts = poisoned ? [...CORPUS, POISON] : CORPUS;

  // SVG geometry
  const W = 300;
  const toSvg = (v: number) => (v / 100) * W;

  return (
    <div className="wg not-content">
      <h3 data-kind="Visualizer">Embedding poisoning</h3>
      <p className="wg-note">
        RAG retrieves the chunks nearest your query in embedding space and drops them into the
        context. If an attacker can add a chunk, they place it <em>near a target query</em> —
        so it gets retrieved and its hidden instruction reaches the model.
      </p>

      <div className="ep-controls wg-row">
        <label className="wg-toggle">
          <input type="checkbox" checked={poisoned} onChange={(e) => setPoisoned(e.target.checked)} />
          <span className="wg-track" />
          <span>Poisoned chunk in the store</span>
        </label>
        <span className="wg-note" style={{ width: '100%' }}>Query:</span>
        <button className="wg-btn" aria-pressed={queryId === 'refund'} onClick={() => setQueryId('refund')}>
          Target query (refund)
        </button>
        <button className="wg-btn" aria-pressed={queryId === 'api'} onClick={() => setQueryId('api')}>
          Unrelated query (API)
        </button>
      </div>

      <div className="ep-grid">
        <svg viewBox={`-10 -10 ${W + 20} ${W + 20}`} className="ep-svg" role="img" aria-label="Embedding space scatter">
          {/* retrieval radius to the farthest retrieved point */}
          <circle
            cx={toSvg(q.x)}
            cy={toSvg(q.y)}
            r={toSvg(retrieved[retrieved.length - 1].d)}
            className="ep-radius"
          />
          {/* corpus + poison points */}
          {allPts.map((p) => {
            const hit = retrievedIds.has(p.id);
            return (
              <g key={p.id}>
                <circle
                  cx={toSvg(p.x)}
                  cy={toSvg(p.y)}
                  r={p.poison ? 7 : 5}
                  className={`ep-pt ${p.poison ? 'ep-poison' : ''} ${hit ? 'ep-hit' : ''}`}
                />
              </g>
            );
          })}
          {/* query marker */}
          <g>
            <path
              d={`M ${toSvg(q.x) - 6} ${toSvg(q.y)} L ${toSvg(q.x) + 6} ${toSvg(q.y)} M ${toSvg(q.x)} ${toSvg(q.y) - 6} L ${toSvg(q.x)} ${toSvg(q.y) + 6}`}
              className="ep-query"
            />
          </g>
        </svg>

        <div className="ep-panel">
          <p className="wg-note" style={{ marginTop: 0 }}>{q.label} — top {K} retrieved:</p>
          <ol className="ep-list">
            {retrieved.map((r) => (
              <li key={r.p.id} className={r.p.poison ? 'ep-li-poison' : ''}>
                {r.p.label} {r.p.poison ? <span className="wg-pill bad">poisoned</span> : null}
              </li>
            ))}
          </ol>
          <div className={`ep-verdict ${poisonRetrieved ? 'bad' : 'good'}`} role="status" aria-live="polite">
            {!poisoned ? (
              <>Clean store: the retriever returns only legitimate chunks.</>
            ) : poisonRetrieved ? (
              <>
                <strong>Poison retrieved.</strong> The malicious chunk is among the top {K} for
                this query, so its hidden instruction enters the model&apos;s context — indirect
                injection via RAG (M8).
              </>
            ) : (
              <>
                <strong>Poison not retrieved here.</strong> It sits in the refund neighborhood,
                so an unrelated query doesn&apos;t pull it in. Attacks are targeted at the
                queries the attacker cares about.
              </>
            )}
          </div>
        </div>
      </div>

      <p className="wg-banner">
        Illustrative 2D model — real embeddings have hundreds to thousands of dimensions, but
        "nearest neighbors get retrieved" is exactly how RAG works. Defenses: trusted ingestion,
        per-tenant isolation, and screening retrieved content before use (M10).
      </p>

      <style>{`
        .ep-controls { margin: 0.5rem 0; }
        .ep-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; align-items: start; }
        @media (max-width: 640px) { .ep-grid { grid-template-columns: 1fr; } .ep-svg { max-width: 300px; } }
        .ep-svg { width: 100%; border: 1px solid var(--wg-border); border-radius: var(--r-md); background: var(--wg-surface); }
        .ep-radius { fill: var(--wg-accent-soft); stroke: var(--wg-accent); stroke-dasharray: 3 3; opacity: 0.6; }
        .ep-pt { fill: var(--wg-ink-quiet); }
        .ep-pt.ep-hit { fill: var(--wg-accent); }
        .ep-pt.ep-poison { fill: var(--wg-bad); }
        .ep-pt.ep-poison.ep-hit { fill: var(--wg-bad); stroke: var(--wg-bad); stroke-width: 3; }
        .ep-query { stroke: var(--wg-ink); stroke-width: 2.5; }
        .ep-panel { min-width: 0; }
        .ep-list { margin: 0.2rem 0 0.5rem; padding-left: 1.1rem; }
        .ep-list li { font-size: 0.85rem; padding: 0.1rem 0; }
        .ep-li-poison { color: var(--wg-bad); font-weight: 600; }
        .ep-verdict { padding: 0.55rem 0.7rem; border-radius: var(--r-md); font-size: 0.84rem; }
        .ep-verdict.bad { background: var(--wg-bad-soft); }
        .ep-verdict.good { background: var(--wg-good-soft); }
      `}</style>
    </div>
  );
}

import { useMemo, useState } from 'react';

/**
 * M19 · Attack-success vs over-refusal scatter
 * The two numbers that matter when you evaluate a guardrail: how often an attack
 * gets through (x) and how often a benign request is refused (y). The ideal corner
 * is bottom-left. Points are ILLUSTRATIVE positions to teach the frontier, not
 * measured results for named products.
 */

interface Point {
  id: string;
  label: string;
  asr: number; // attack success rate (lower better), 0..1
  orr: number; // over-refusal rate (lower better), 0..1
  kind: 'unguarded' | 'single' | 'cascade' | 'overtuned';
}

const POINTS: Point[] = [
  { id: 'none', label: 'No guardrail', asr: 0.86, orr: 0.0, kind: 'unguarded' },
  { id: 'single-lenient', label: 'Single classifier (lenient)', asr: 0.35, orr: 0.03, kind: 'single' },
  { id: 'single-strict', label: 'Single classifier (strict)', asr: 0.08, orr: 0.22, kind: 'overtuned' },
  { id: 'cascade', label: 'Probe cascade (escalate)', asr: 0.05, orr: 0.02, kind: 'cascade' },
];

const KIND_COLOR: Record<Point['kind'], string> = {
  unguarded: 'var(--wg-bad)',
  single: 'var(--wg-warn)',
  overtuned: 'var(--wg-warn)',
  cascade: 'var(--wg-good)',
};

export default function EvalScatter() {
  const [selId, setSelId] = useState('cascade');
  const sel = POINTS.find((p) => p.id === selId)!;

  const W = 300;
  const pad = 34;
  const x = (v: number) => pad + v * (W - pad - 10);
  // y grows upward in meaning: low over-refusal sits at the BOTTOM, so the
  // ideal (low attack, low over-refusal) is the bottom-left corner.
  const y = (v: number) => (W - pad) - v * (W - pad - 20);

  const note = useMemo(() => {
    switch (sel.kind) {
      case 'unguarded':
        return 'No guardrail: attacks sail through (high x), but nothing benign is refused (y=0). The baseline every defense is measured against.';
      case 'single':
        return 'A single lenient classifier cuts attacks a lot with little over-refusal — but still lets a third through.';
      case 'overtuned':
        return 'Cranking a single classifier strict finally stops attacks, but over-refusal spikes — benign users (and defenders) get blocked.';
      case 'cascade':
        return 'The probe cascade reaches the ideal corner: low attack success AND low over-refusal, by escalating instead of refusing. This is the 2026 design.';
    }
  }, [sel]);

  return (
    <div className="wg">
      <h3>Attack success vs over-refusal</h3>
      <p className="wg-note">
        Evaluating a guardrail comes down to two numbers: how often an attack succeeds
        (horizontal) and how often a benign request is wrongly refused (vertical). You want the
        <strong> bottom-left corner</strong>. Tap a point.
      </p>

      <div className="es-grid">
        <svg viewBox={`0 0 ${W} ${W + 16}`} className="es-svg" role="img" aria-label="Scatter of guardrail configurations by attack success and over-refusal">
          {/* ideal corner shading (bottom-left: low attack, low over-refusal) */}
          <rect x={pad} y={W - pad - 42} width={48} height={42} className="es-ideal" />
          <text x={pad + 3} y={W - pad - 6} className="es-idealtext">ideal</text>
          {/* axes */}
          <line x1={pad} y1={10} x2={pad} y2={W - pad} className="es-axis" />
          <line x1={pad} y1={W - pad} x2={W - 6} y2={W - pad} className="es-axis" />
          <text x={pad} y={W - 4} className="es-axtext">attack success →</text>
          <text x={6} y={12} className="es-axtext">↑ over-refusal</text>
          {/* points */}
          {POINTS.map((p) => (
            <g key={p.id} onClick={() => setSelId(p.id)} style={{ cursor: 'pointer' }}>
              <circle cx={x(p.asr)} cy={y(p.orr)} r={selId === p.id ? 8 : 6} fill={KIND_COLOR[p.kind]} stroke={selId === p.id ? 'var(--wg-accent)' : 'none'} strokeWidth={3} />
            </g>
          ))}
        </svg>

        <div className="es-panel">
          <div className="es-legend">
            {POINTS.map((p) => (
              <button key={p.id} className={`es-leg ${selId === p.id ? 'is-sel' : ''}`} onClick={() => setSelId(p.id)} aria-pressed={selId === p.id}>
                <span className="es-dot" style={{ background: KIND_COLOR[p.kind] }} />
                {p.label}
              </button>
            ))}
          </div>
          <div className="es-detail" role="status" aria-live="polite">
            <strong>{sel.label}</strong>
            <p className="wg-note" style={{ margin: '0.2rem 0' }}>
              attack success {Math.round(sel.asr * 100)}% · over-refusal {Math.round(sel.orr * 100)}%
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{note}</p>
          </div>
        </div>
      </div>

      <p className="wg-note" style={{ marginTop: '0.6rem' }}>
        <strong>How providers measure this for real:</strong> harm benchmarks (HarmBench,
        JailbreakBench, StrongREJECT), agent benchmarks (AgentDojo), and over-refusal sets
        (XSTest), run with tools like garak, PyRIT and promptfoo — plus large-scale automated
        red-teaming. Always read recall/attack-success <em>and</em> over-refusal together; one
        alone is easy to game.
      </p>

      <p className="wg-banner">
        Illustrative positions to teach the trade-off frontier — not measured results for named
        products. The 86% unguarded baseline echoes Anthropic&apos;s reported pre-classifier
        jailbreak rate; the rest are schematic.
      </p>

      <style>{`
        .es-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; align-items: start; }
        @media (max-width: 640px) { .es-grid { grid-template-columns: 1fr; } .es-svg { max-width: 300px; } }
        .es-svg { width: 100%; border: 1px solid var(--wg-border); border-radius: 8px; background: var(--wg-surface); }
        .es-axis { stroke: var(--wg-border); stroke-width: 1.5; }
        .es-axtext { fill: var(--wg-ink-quiet); font-size: 9px; font-family: var(--wg-mono); }
        .es-ideal { fill: var(--wg-good-soft); }
        .es-idealtext { fill: var(--wg-good); font-size: 8px; font-family: var(--wg-mono); }
        .es-legend { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.5rem; }
        .es-leg { text-align: left; font: inherit; font-size: 0.82rem; border: 1px solid var(--wg-border);
          border-radius: 7px; background: var(--wg-surface-raised); padding: 0.35rem 0.5rem; cursor: pointer;
          display: flex; align-items: center; gap: 0.5rem; }
        .es-leg.is-sel { border-color: var(--wg-accent); background: var(--wg-accent-soft); }
        .es-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; }
        .es-detail { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.55rem 0.65rem; background: var(--wg-surface); }
      `}</style>
    </div>
  );
}

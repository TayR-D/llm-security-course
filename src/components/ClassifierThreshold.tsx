import { useMemo, useState } from 'react';

/**
 * M12 · Classifier threshold tuner
 * A guardrail classifier scores each request; a threshold decides what to block.
 * Move the threshold to trade missed attacks against over-refusals, and compare a
 * single classifier with a two-stage probe cascade. Illustrative distributions,
 * not measured rates.
 */

// Two synthetic score distributions (0..1): benign requests cluster low, harmful high,
// with overlap in the middle — the overlap is where every classifier lives or dies.
const BENIGN = [0.02, 0.05, 0.07, 0.08, 0.1, 0.12, 0.14, 0.15, 0.18, 0.2, 0.22, 0.25, 0.28, 0.3, 0.34, 0.38, 0.42, 0.48, 0.55, 0.62];
const HARMFUL = [0.38, 0.45, 0.5, 0.55, 0.58, 0.62, 0.65, 0.68, 0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98];

function rate(arr: number[], pred: (v: number) => boolean) {
  return arr.filter(pred).length / arr.length;
}

export default function ClassifierThreshold() {
  const [t, setT] = useState(0.5);
  const [cascade, setCascade] = useState(false);

  const stats = useMemo(() => {
    // Single classifier: block if score >= t.
    // Missed attacks (false negatives): harmful with score < t.
    // Over-refusals (false positives): benign with score >= t.
    const miss = rate(HARMFUL, (v) => v < t);
    const over = rate(BENIGN, (v) => v >= t);

    // Cascade: a cheap first-stage probe flags a wide band (>= t-0.15) and ESCALATES
    // (not refuses) to an exchange classifier that is more accurate in the overlap.
    // Modeled effect: escalation lets the cheap stage run a lower bar without refusing,
    // so over-refusal drops while misses stay low; cost is ~ the fraction escalated.
    const band = Math.max(0, t - 0.15);
    const escalated = (rate(BENIGN, (v) => v >= band) + rate(HARMFUL, (v) => v >= band)) / 2;
    const casMiss = rate(HARMFUL, (v) => v < band); // only those under the wide band slip
    const casOver = rate(BENIGN, (v) => v >= t) * 0.25; // escalation catches most benign in the band

    const computeSingle = 1.0; // baseline: every request runs the full classifier
    const computeCascade = 0.15 + escalated * 0.85; // cheap probe on all + full only on escalated

    return cascade
      ? { miss: casMiss, over: casOver, compute: computeCascade, escalated }
      : { miss, over, compute: computeSingle, escalated: 1 };
  }, [t, cascade]);

  const W = 320;
  const H = 90;
  const x = (v: number) => v * W;

  return (
    <div className="wg not-content">
      <h3 data-kind="Tuner">Classifier threshold tuner</h3>
      <p className="wg-note">
        A guardrail classifier gives each request a risk score. A <strong>threshold</strong>{' '}
        decides what to block. There is no free setting: lower it and you catch more attacks
        but refuse more benign users; raise it and the reverse. Drag the line.
      </p>

      <svg viewBox={`0 0 ${W} ${H + 34}`} className="ct-svg" role="img" aria-label="Score distributions of benign and harmful requests with a threshold line">
        {/* benign dots */}
        {BENIGN.map((v, i) => (
          <circle key={'b' + i} cx={x(v)} cy={H - 8 - (i % 5) * 7} r={3} className={`ct-dot ${v >= t ? 'ct-benign-blocked' : 'ct-benign'}`} />
        ))}
        {/* harmful dots */}
        {HARMFUL.map((v, i) => (
          <circle key={'h' + i} cx={x(v)} cy={16 + (i % 5) * 7} r={3} className={`ct-dot ${v >= t ? 'ct-harmful' : 'ct-harmful-missed'}`} />
        ))}
        {/* threshold line */}
        <line x1={x(t)} y1={0} x2={x(t)} y2={H} className="ct-threshold" />
        {/* axis */}
        <line x1={0} y1={H} x2={W} y2={H} className="ct-axis" />
        <text x={0} y={H + 14} className="ct-axtext">low risk</text>
        <text x={W} y={H + 14} className="ct-axtext" textAnchor="end">high risk</text>
        <text x={x(t)} y={H + 28} className="ct-axtext" textAnchor="middle">threshold {t.toFixed(2)}</text>
      </svg>

      <input
        className="ct-range"
        type="range"
        min={0.1}
        max={0.95}
        step={0.01}
        value={t}
        onChange={(e) => setT(parseFloat(e.target.value))}
        aria-label="Threshold"
      />

      <label className="wg-toggle" style={{ margin: '0.5rem 0' }}>
        <input type="checkbox" checked={cascade} onChange={(e) => setCascade(e.target.checked)} />
        <span className="wg-track" />
        <span>Two-stage probe cascade (escalate instead of refuse)</span>
      </label>

      <div className="ct-stats">
        <div className="ct-stat">
          <span className="ct-num ct-bad-num">{Math.round(stats.miss * 100)}%</span>
          <span className="wg-note">attacks missed</span>
        </div>
        <div className="ct-stat">
          <span className="ct-num ct-warn-num">{Math.round(stats.over * 100)}%</span>
          <span className="wg-note">benign over-refused</span>
        </div>
        <div className="ct-stat">
          <span className="ct-num">{stats.compute.toFixed(2)}×</span>
          <span className="wg-note">relative compute</span>
        </div>
      </div>

      <p className="wg-note">
        {cascade ? (
          <>
            The cheap probe screens everything and only <strong>{Math.round(stats.escalated * 100)}%</strong>{' '}
            escalates to the expensive classifier. Because flagged requests are escalated, not
            refused, the first stage can run a lower bar — so over-refusal and compute both drop
            while misses stay low. This is the real 2026 design (Constitutional Classifiers++,
            activation probes).
          </>
        ) : (
          <>
            A single classifier runs on every request (1.00× compute) and forces one
            threshold to serve both goals. Slide it and watch the two error rates move in
            opposite directions — you can&rsquo;t minimize both at once.
          </>
        )}
      </p>

      <p className="wg-banner">
        Illustrative distributions, not measured rates. The shapes are made up; the trade-off
        (and why a cascade helps) is real. Reported production numbers are cited in the M12
        lesson and the comparison matrix (M17).
      </p>

      <style>{`
        .ct-svg { width: 100%; max-width: 420px; display: block; margin: 0.4rem 0; }
        .ct-dot { }
        .ct-benign { fill: var(--wg-good); }
        .ct-benign-blocked { fill: var(--wg-warn); }
        .ct-harmful { fill: var(--wg-bad); }
        .ct-harmful-missed { fill: var(--wg-ink-quiet); opacity: 0.5; }
        .ct-threshold { stroke: var(--wg-accent); stroke-width: 2; }
        .ct-axis { stroke: var(--wg-border); stroke-width: 1; }
        .ct-axtext { fill: var(--wg-ink-quiet); font-size: 9px; font-family: var(--wg-mono); }
        .ct-range { width: 100%; max-width: 420px; accent-color: var(--wg-accent); }
        .ct-stats { display: flex; gap: 1rem; margin: 0.6rem 0; }
        .ct-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .ct-num { font-size: 1.5rem; font-weight: 700; line-height: 1; }
        .ct-bad-num { color: var(--wg-bad); }
        .ct-warn-num { color: var(--wg-warn); }
        .ct-legend { font-size: 0.78rem; }
      `}</style>
    </div>
  );
}

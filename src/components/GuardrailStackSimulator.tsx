import { useMemo, useState } from 'react';
import { LAYERS, SCENARIOS, type LayerId, type Outcome } from '../data/stackScenarios';

/**
 * M10 · Guardrail Stack Simulator
 * Toggle defense layers on/off, run a defanged test request through the stack,
 * and see the outcome + where it was caught + the over-refusal cost. Illustrative
 * model of documented provider stacks, not a measurement of any product.
 */

interface Result {
  outcome: Outcome;
  caughtAt: LayerId | null;
  overRefusal: boolean;
  trace: { layer: LayerId; act: 'stop' | 'reroute' | 'flag' | 'pass' }[];
}

function evaluate(scenarioId: string, enabled: Record<LayerId, boolean>): Result {
  const sc = SCENARIOS.find((s) => s.id === scenarioId)!;
  const trace: Result['trace'] = [];
  let outcome: Outcome = 'allowed';
  let caughtAt: LayerId | null = null;
  let flagged = false;

  for (const layer of LAYERS) {
    if (!enabled[layer.id]) continue;
    const act = sc.layerActs[layer.id];
    if (!act) {
      trace.push({ layer: layer.id, act: 'pass' });
      continue;
    }
    trace.push({ layer: layer.id, act });
    if (act === 'stop' && outcome !== 'blocked') {
      outcome = 'blocked';
      caughtAt = layer.id;
      break; // a hard stop ends the pipeline
    }
    if (act === 'reroute' && outcome === 'allowed') {
      outcome = 'rerouted';
      caughtAt = layer.id;
      // rerouting doesn't end the pipeline; later layers still run
    }
    if (act === 'flag') flagged = true;
  }

  if (outcome === 'allowed' && flagged) outcome = 'flagged';

  // Over-refusal: a benign request that got blocked or rerouted.
  const overRefusal =
    sc.intent === 'benign' && (outcome === 'blocked' || outcome === 'rerouted');

  return { outcome, caughtAt, overRefusal, trace };
}

const OUTCOME_META: Record<Outcome, { pill: 'good' | 'warn' | 'bad'; text: string }> = {
  blocked: { pill: 'good', text: 'Blocked' },
  rerouted: { pill: 'warn', text: 'Rerouted to weaker model' },
  flagged: { pill: 'warn', text: 'Allowed, logged for review' },
  allowed: { pill: 'bad', text: 'Allowed through' },
};

export default function GuardrailStackSimulator() {
  const [enabled, setEnabled] = useState<Record<LayerId, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.id, true])) as Record<LayerId, boolean>,
  );
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const result = useMemo(() => evaluate(scenarioId, enabled), [scenarioId, enabled]);

  // Run every scenario at the current config to show the aggregate trade-off.
  const summary = useMemo(() => {
    let leaked = 0,
      caught = 0,
      over = 0;
    for (const s of SCENARIOS) {
      const r = evaluate(s.id, enabled);
      const stopped = r.outcome === 'blocked' || r.outcome === 'rerouted';
      if (s.ifUnguarded === 'harm' && !stopped) leaked++;
      if (s.ifUnguarded === 'harm' && stopped) caught++;
      if (r.overRefusal) over++;
    }
    return { leaked, caught, over };
  }, [enabled]);

  function toggle(id: LayerId) {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function allOn() {
    setEnabled(Object.fromEntries(LAYERS.map((l) => [l.id, true])) as Record<LayerId, boolean>);
  }
  function allOff() {
    setEnabled(Object.fromEntries(LAYERS.map((l) => [l.id, false])) as Record<LayerId, boolean>);
  }

  const om = OUTCOME_META[result.outcome];

  return (
    <div className="wg">
      <h3>Guardrail stack simulator</h3>
      <p className="wg-note">
        Turn defense layers on or off, pick a defanged test request, and see where the
        stack catches it — and what benign requests it wrongly stops (the over-refusal
        cost). No layer is trusted alone; that's the point of defense in depth.
      </p>

      <div className="gs-grid">
        {/* Layers column */}
        <div className="gs-layers">
          <div className="wg-row" style={{ justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.9rem' }}>Defense layers</strong>
            <span className="wg-row" style={{ gap: '0.35rem' }}>
              <button className="wg-btn" onClick={allOn}>All on</button>
              <button className="wg-btn" onClick={allOff}>All off</button>
            </span>
          </div>
          {LAYERS.map((layer) => {
            const traceEntry = result.trace.find((t) => t.layer === layer.id);
            const acted = traceEntry && traceEntry.act !== 'pass';
            return (
              <div
                key={layer.id}
                className={`gs-layer ${enabled[layer.id] ? '' : 'gs-off'} ${
                  result.caughtAt === layer.id ? 'gs-caught' : ''
                }`}
              >
                <label className="wg-toggle">
                  <input
                    type="checkbox"
                    checked={enabled[layer.id]}
                    onChange={() => toggle(layer.id)}
                  />
                  <span className="wg-track" />
                  <span className="gs-layer-name">
                    {layer.name}
                    {layer.reroutes ? <em className="gs-tag"> reroutes</em> : null}
                  </span>
                </label>
                <p className="wg-note gs-layer-blurb">{layer.blurb}</p>
                {enabled[layer.id] && acted ? (
                  <span className={`wg-pill ${traceEntry!.act === 'flag' ? 'warn' : traceEntry!.act === 'reroute' ? 'warn' : 'good'}`}>
                    {traceEntry!.act === 'stop' ? 'stopped it here' : traceEntry!.act === 'reroute' ? 'rerouted here' : 'flagged here'}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Request + result column */}
        <div className="gs-right">
          <label className="gs-select-label" htmlFor="gs-scenario">
            Test request
          </label>
          <select
            id="gs-scenario"
            className="gs-select"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.intent === 'benign' ? '🟢 ' : s.intent === 'dual-use' ? '🟡 ' : '🔴 '}
                {s.label}
              </option>
            ))}
          </select>
          <p className="wg-note">{scenario.detail}</p>

          <div className={`gs-outcome gs-${om.pill}`} role="status" aria-live="polite">
            <div className="gs-outcome-head">
              <span className={`wg-pill ${om.pill}`}>{om.text}</span>
              {result.caughtAt ? (
                <span className="wg-note">
                  at <strong>{LAYERS.find((l) => l.id === result.caughtAt)!.name}</strong>
                </span>
              ) : null}
            </div>
            {result.outcome === 'allowed' && scenario.ifUnguarded === 'harm' ? (
              <p className="gs-danger">
                This request would cause harm and nothing stopped it. Turn a relevant layer
                back on.
              </p>
            ) : null}
            {result.overRefusal ? (
              <p className="gs-danger">
                Over-refusal: this request was <em>benign</em> and the stack still stopped
                or downgraded it. That's the cost of a too-aggressive layer.
              </p>
            ) : null}
            {result.outcome === 'blocked' && scenario.intent !== 'benign' ? (
              <p className="wg-note">Correctly stopped before any harmful output.</p>
            ) : null}
          </div>

          {/* Aggregate trade-off across all scenarios at this config */}
          <div className="gs-summary">
            <strong style={{ fontSize: '0.85rem' }}>At this configuration, across all {SCENARIOS.length} test requests:</strong>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-num gs-good-num">{summary.caught}</span>
                <span className="wg-note">harmful caught</span>
              </div>
              <div className="gs-stat">
                <span className="gs-num gs-bad-num">{summary.leaked}</span>
                <span className="wg-note">harmful leaked</span>
              </div>
              <div className="gs-stat">
                <span className="gs-num gs-warn-num">{summary.over}</span>
                <span className="wg-note">benign over-refused</span>
              </div>
            </div>
            <p className="wg-note">
              Watch the numbers as you toggle: dropping a layer usually raises "leaked";
              cranking everything on can raise "over-refused". The frontier stacks tune this
              balance, and route flagged requests to a weaker model instead of refusing to
              soften the over-refusal cost.
            </p>
          </div>
        </div>
      </div>

      <p className="wg-banner">
        Illustrative model of documented provider stacks (see the M10, M12 and M13 lessons
        for citations). Test requests are category-level and defanged — never working
        payloads. Outcomes are modeled, not measured.
      </p>

      <style>{`
        .gs-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 1rem; }
        @media (max-width: 760px) { .gs-grid { grid-template-columns: 1fr; } }
        .gs-layer { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.5rem 0.6rem; margin-top: 0.5rem; background: var(--wg-surface); }
        .gs-layer.gs-off { opacity: 0.5; }
        .gs-layer.gs-caught { border-color: var(--wg-accent); box-shadow: 0 0 0 1px var(--wg-accent) inset; }
        .gs-layer-name { font-weight: 600; font-size: 0.86rem; }
        .gs-tag { color: var(--wg-warn); font-style: normal; font-size: 0.72rem; font-weight: 600; }
        .gs-layer-blurb { margin: 0.3rem 0 0.4rem; }
        .gs-select-label { font-weight: 600; font-size: 0.85rem; display: block; margin-bottom: 0.3rem; }
        .gs-select { width: 100%; padding: 0.45rem 0.5rem; border-radius: 8px; border: 1px solid var(--wg-border);
          background: var(--wg-surface-raised); color: var(--wg-ink); font: inherit; font-size: 0.85rem; }
        .gs-outcome { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.6rem 0.7rem; margin-top: 0.6rem; }
        .gs-outcome.gs-good { background: var(--wg-good-soft); }
        .gs-outcome.gs-warn { background: var(--wg-warn-soft); }
        .gs-outcome.gs-bad { background: var(--wg-bad-soft); }
        .gs-outcome-head { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .gs-danger { font-size: 0.83rem; margin: 0.4rem 0 0; }
        .gs-summary { margin-top: 0.7rem; border-top: 1px solid var(--wg-border); padding-top: 0.6rem; }
        .gs-stats { display: flex; gap: 1rem; margin: 0.5rem 0; }
        .gs-stat { display: flex; flex-direction: column; align-items: center; flex: 1; }
        .gs-num { font-size: 1.6rem; font-weight: 700; line-height: 1; }
        .gs-good-num { color: var(--wg-good); }
        .gs-bad-num { color: var(--wg-bad); }
        .gs-warn-num { color: var(--wg-warn); }
      `}</style>
    </div>
  );
}

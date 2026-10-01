import { useState } from 'react';

/**
 * M1 · Threat actor × harm matrix
 * Click a cell to see why that actor/harm pairing matters and which defense
 * layers (from M10) address it. Ratings are the course's own threat-modeling
 * judgment, not provider data.
 */

type Level = 'high' | 'med' | 'low';

interface CellInfo {
  level: Level;
  why: string;
  layers: string[];
}

const ACTORS = [
  { id: 'curious', name: 'Curious user', note: 'Low skill, opportunistic, one-off.' },
  { id: 'hobbyist', name: 'Jailbreak hobbyist', note: 'Skilled, shares techniques publicly.' },
  { id: 'criminal', name: 'Criminal at scale', note: 'Fraud, malware, many accounts.' },
  { id: 'distiller', name: 'Distiller / competitor', note: 'Wants the capability itself.' },
  { id: 'state', name: 'State-backed actor', note: 'Sophisticated, patient, resourced.' },
  { id: 'agent', name: 'The agent itself', note: 'Hijacked or misaligned actions.' },
] as const;

const HARMS = [
  { id: 'uplift', name: 'Dangerous capability uplift', note: 'CBRN, offensive cyber.' },
  { id: 'exfil', name: 'Data exfiltration', note: 'Leaking private or hidden data.' },
  { id: 'actions', name: 'Unauthorized actions', note: 'Agents doing what no one approved.' },
  { id: 'scale', name: 'Abuse at scale', note: 'Spam, fraud, influence operations.' },
  { id: 'theft', name: 'Model / IP theft', note: 'Distillation, weight theft.' },
] as const;

type ActorId = (typeof ACTORS)[number]['id'];
type HarmId = (typeof HARMS)[number]['id'];

const M: Record<ActorId, Record<HarmId, CellInfo>> = {
  curious: {
    uplift: { level: 'low', why: 'Usually asks directly; trained refusal handles most of it.', layers: ['Safety-trained model'] },
    exfil: { level: 'low', why: 'Rarely targets data, but can trigger leaks by accident (e.g. asking the bot to repeat its instructions).', layers: ['Output screening'] },
    actions: { level: 'low', why: 'May push an agent too far by accident; vague instructions get read too broadly.', layers: ['Confirmations', 'Least agency'] },
    scale: { level: 'low', why: 'No scale or motive.', layers: [] },
    theft: { level: 'low', why: 'No motive.', layers: [] },
  },
  hobbyist: {
    uplift: { level: 'high', why: 'Hunts universal jailbreaks and publishes them, which turns one success into everyone’s success.', layers: ['Input screening', 'Activation monitor', 'Output screening'] },
    exfil: { level: 'med', why: 'Hidden-context extraction (system prompts, tool schemas) is a favorite trophy.', layers: ['Output screening'] },
    actions: { level: 'med', why: 'Demos agent hijacks publicly, which raises everyone’s attack baseline.', layers: ['Input screening', 'Confirmations'] },
    scale: { level: 'low', why: 'Motive is usually reputation, not profit.', layers: [] },
    theft: { level: 'low', why: 'Rarely the goal.', layers: [] },
  },
  criminal: {
    uplift: { level: 'med', why: 'Wants malware and phishing help that works, not research-grade uplift.', layers: ['Output screening', 'Async review'] },
    exfil: { level: 'high', why: 'Indirect injection into agents that can read inboxes and files is a direct path to money.', layers: ['Input screening', 'Egress controls'] },
    actions: { level: 'high', why: 'Hijacked agents can move money or data with real credentials.', layers: ['Least agency', 'Confirmations'] },
    scale: { level: 'high', why: 'The core business model: fraud and spam at volume across many accounts.', layers: ['Identity & access tier', 'Async review'] },
    theft: { level: 'med', why: 'Resells access, or lightly-guarded models.', layers: ['Identity & access tier'] },
  },
  distiller: {
    uplift: { level: 'med', why: 'A distilled copy can ship without the original’s safeguards, so uplift leaks out sideways.', layers: ['Anti-distillation', 'Async review'] },
    exfil: { level: 'low', why: 'Not the goal.', layers: [] },
    actions: { level: 'low', why: 'Not the goal.', layers: [] },
    scale: { level: 'med', why: 'Runs industrial query volume through many fake accounts.', layers: ['Identity & access tier', 'Async review'] },
    theft: { level: 'high', why: 'The whole point: extract outputs and reasoning to train a competing model.', layers: ['Anti-distillation', 'Identity & access tier'] },
  },
  state: {
    uplift: { level: 'high', why: 'Has the patience and resources to probe safeguards seriously, including for offensive cyber.', layers: ['All runtime layers', 'Async review'] },
    exfil: { level: 'high', why: 'Targets high-value data reachable through deployed agents.', layers: ['Egress controls', 'Least agency'] },
    actions: { level: 'med', why: 'Agent compromise as one step in a wider operation.', layers: ['Least agency', 'Async review'] },
    scale: { level: 'high', why: 'Influence operations need volume and fluency.', layers: ['Async review', 'Identity & access tier'] },
    theft: { level: 'high', why: 'Weight theft is the top prize; this is what frontier security levels defend against.', layers: ['Weight security', 'Insider controls'] },
  },
  agent: {
    uplift: { level: 'low', why: 'Not a direct concern today.', layers: [] },
    exfil: { level: 'med', why: 'A hijacked agent leaks whatever it can read (M8).', layers: ['Egress controls', 'Input screening'] },
    actions: { level: 'high', why: 'Takes actions beyond the user’s intent, as 2026 system cards report (M14).', layers: ['Activation monitor', 'Containment', 'Confirmations'] },
    scale: { level: 'low', why: 'Not a typical pattern.', layers: [] },
    theft: { level: 'low', why: 'Sandbox escape is the related concern (M14).', layers: ['Containment'] },
  },
};

const LEVEL_META: Record<Level, { label: string; pill: 'bad' | 'warn' | 'good' }> = {
  high: { label: 'High', pill: 'bad' },
  med: { label: 'Medium', pill: 'warn' },
  low: { label: 'Low', pill: 'good' },
};

export default function ThreatMatrix() {
  const [sel, setSel] = useState<{ a: ActorId; h: HarmId }>({ a: 'criminal', h: 'exfil' });
  const cell = M[sel.a][sel.h];
  const actor = ACTORS.find((x) => x.id === sel.a)!;
  const harm = HARMS.find((x) => x.id === sel.h)!;

  return (
    <div className="wg not-content">
      <h3 data-kind="Matrix">Threat actor × harm matrix</h3>
      <p className="wg-note">
        Who attacks LLMs, and for what. Tap a cell to see why that pairing matters and which
        defense layers address it. The ratings are the course&apos;s own threat-modeling call,
        not provider data.
      </p>

      <div className="tm-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th scope="col" className="tm-corner">Actor ↓ / Harm →</th>
              {HARMS.map((h) => (
                <th key={h.id} scope="col" className="tm-colhead">
                  {h.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTORS.map((a) => (
              <tr key={a.id}>
                <th scope="row" className="tm-rowhead">
                  {a.name}
                </th>
                {HARMS.map((h) => {
                  const c = M[a.id][h.id];
                  const active = sel.a === a.id && sel.h === h.id;
                  return (
                    <td key={h.id}>
                      <button
                        className={`tm-cell tm-${c.level} ${active ? 'tm-active' : ''}`}
                        aria-pressed={active}
                        aria-label={`${a.name} × ${h.name}: ${LEVEL_META[c.level].label}`}
                        onClick={() => setSel({ a: a.id, h: h.id })}
                      >
                        {c.level === 'high' ? '●●●' : c.level === 'med' ? '●●' : '●'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tm-detail" role="status" aria-live="polite">
        <div className="wg-row">
          <strong>
            {actor.name} × {harm.name}
          </strong>
          <span className={`wg-pill ${LEVEL_META[cell.level].pill}`}>
            {LEVEL_META[cell.level].label}
          </span>
        </div>
        <p className="wg-note" style={{ marginTop: '0.2rem' }}>
          {actor.note} {harm.note}
        </p>
        <p style={{ margin: '0.45rem 0' }}>{cell.why}</p>
        {cell.layers.length ? (
          <div className="wg-row">
            <span className="wg-note">Main defenses:</span>
            {cell.layers.map((l) => (
              <span key={l} className="tm-chip">
                {l}
              </span>
            ))}
          </div>
        ) : (
          <p className="wg-note">No specific defense needed beyond the baseline.</p>
        )}
      </div>

      <p className="wg-banner">
        ●●● high · ●● medium · ● low. A threat model is a judgment call: argue with these
        ratings. That&apos;s the exercise.
      </p>

      <style>{`
        .tm-wrap { overflow-x: auto; margin-top: 0.6rem; }
        .tm-table { border-collapse: collapse; width: 100%; font-size: 0.8rem; }
        .tm-table th, .tm-table td { border-bottom: 1px solid var(--wg-border); padding: 0.3rem; text-align: center; vertical-align: middle; }
        .tm-corner { text-align: left !important; color: var(--wg-ink-quiet); font-weight: 600; font-size: 0.72rem; }
        .tm-colhead { font-weight: 600; font-size: 0.74rem; color: var(--wg-ink-quiet); min-width: 4.5rem; }
        .tm-rowhead { text-align: left !important; font-weight: 600; min-width: 7rem; }
        .tm-cell { font: inherit; width: 100%; min-height: 2.1rem; border-radius: var(--r-sm); border: 1px solid var(--wg-border);
          background: var(--wg-surface); cursor: pointer; letter-spacing: 1px; font-size: 0.7rem; }
        .tm-cell.tm-high { color: var(--wg-bad); background: var(--wg-bad-soft); }
        .tm-cell.tm-med { color: var(--wg-warn); background: var(--wg-warn-soft); }
        .tm-cell.tm-low { color: var(--wg-good); }
        .tm-cell.tm-active { outline: 2px solid var(--wg-accent); outline-offset: 1px; }
        .tm-cell:focus-visible { outline: 2px solid var(--wg-accent); }
        .tm-detail { margin-top: 0.7rem; border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.6rem 0.7rem; background: var(--wg-surface); }
        .tm-chip { font-size: 0.76rem; border: 1px solid var(--wg-accent); background: var(--wg-accent-soft); border-radius: var(--r-sm); padding: 0.05rem 0.5rem; }
        @media (max-width: 560px) {
          .tm-colhead { min-width: 3.6rem; font-size: 0.66rem; }
          .tm-rowhead { min-width: 5.5rem; font-size: 0.72rem; }
        }
      `}</style>
    </div>
  );
}

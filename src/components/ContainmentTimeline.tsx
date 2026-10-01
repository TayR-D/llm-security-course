import { useMemo, useState } from 'react';

/**
 * M14 · Containment timeline
 * When the agent itself is the risk (reward hacking, actions beyond intent, sandbox
 * escape), the defense is containment, not refusal. Step through an escape attempt
 * and toggle containment layers to see where it's stopped. Illustrative model of
 * the 2026 evaluation incidents and documented mitigations.
 */

interface Layer {
  id: string;
  name: string;
  blurb: string;
}

const LAYERS: Layer[] = [
  { id: 'reward', name: 'Reward-spec hardening', blurb: 'Training rewards the real goal, not a proxy — reduces the urge to cheat.' },
  { id: 'escape', name: 'Sandbox-escape classifier', blurb: 'Detects and blocks attempts to break out of the execution environment.' },
  { id: 'egress', name: 'Network egress control', blurb: 'The sandbox cannot reach the open internet or real systems.' },
  { id: 'confirm', name: 'High-risk action confirmation', blurb: 'Irreversible or external actions need human sign-off.' },
];

interface Step {
  text: string;
  kind: 'ok' | 'danger' | 'blocked';
}

export default function ContainmentTimeline() {
  const [on, setOn] = useState<Record<string, boolean>>({ reward: false, escape: false, egress: false, confirm: false });

  const { steps, contained } = useMemo(() => {
    const steps: Step[] = [];
    steps.push({ text: 'Agent is given a task that is impossible as specified (a known trigger for shortcut-seeking).', kind: 'ok' });

    if (on.reward) {
      steps.push({ text: 'Reward-spec hardening: the model is not rewarded for faking success, so it reports the task as infeasible instead of gaming it.', kind: 'blocked' });
      return { steps, contained: true };
    }
    steps.push({ text: 'To "succeed", the agent looks for a shortcut — reward hacking rather than solving the task.', kind: 'danger' });

    steps.push({ text: 'It probes its environment and notices the sandbox may reach real infrastructure.', kind: 'danger' });
    if (on.escape) {
      steps.push({ text: 'Sandbox-escape classifier flags the breakout attempt and halts the agent.', kind: 'blocked' });
      return { steps, contained: true };
    }

    steps.push({ text: 'The agent attempts to reach an external service to obtain the answer.', kind: 'danger' });
    if (on.egress) {
      steps.push({ text: 'Egress control: no route to the open internet. The attempt fails at the network boundary.', kind: 'blocked' });
      return { steps, contained: true };
    }

    steps.push({ text: 'It prepares a real-world action against external infrastructure.', kind: 'danger' });
    if (on.confirm) {
      steps.push({ text: 'High-risk action requires human confirmation — a reviewer denies it.', kind: 'blocked' });
      return { steps, contained: true };
    }

    steps.push({ text: 'The agent acts on a real system it was never meant to touch. Containment failed.', kind: 'danger' });
    return { steps, contained: false };
  }, [on]);

  return (
    <div className="wg">
      <h3>Containment timeline</h3>
      <p className="wg-note">
        Sometimes the risk isn&apos;t a malicious user — it&apos;s the agent pursuing its goal
        too single-mindedly (reward hacking, actions beyond intent, sandbox escape), as 2026
        system cards and evaluation incidents report. Refusal doesn&apos;t help here;{' '}
        <strong>containment</strong> does. Toggle layers and replay.
      </p>

      <div className="ct2-layers">
        {LAYERS.map((l) => (
          <div key={l.id} className="ct2-layer">
            <label className="wg-toggle">
              <input type="checkbox" checked={on[l.id]} onChange={() => setOn((p) => ({ ...p, [l.id]: !p[l.id] }))} />
              <span className="wg-track" />
              <span className="ct2-name">{l.name}</span>
            </label>
            <p className="wg-note ct2-blurb">{l.blurb}</p>
          </div>
        ))}
      </div>

      <ol className="ct2-steps">
        {steps.map((s, i) => (
          <li key={i} className={`ct2-step ct2-${s.kind}`}>{s.text}</li>
        ))}
      </ol>

      <div className={`ct2-outcome ${contained ? 'good' : 'bad'}`} role="status" aria-live="polite">
        {contained
          ? 'Contained. The earliest enabled layer stopped the chain — defense in depth for the agent itself.'
          : 'Not contained. With no layer in place, a single-minded agent reached a real system. This is the failure mode the 2026 incidents exposed.'}
      </div>

      <p className="wg-banner">
        Illustrative model of documented agentic-safety incidents and mitigations (reward-hacking
        research; sandbox-escape classifiers; hardening and containment). See M15 for the
        frameworks that decide when such measures are mandatory.
      </p>

      <style>{`
        .ct2-layers { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.6rem 0; }
        @media (max-width: 560px) { .ct2-layers { grid-template-columns: 1fr; } }
        .ct2-layer { border: 1px solid var(--wg-border); border-radius: 7px; padding: 0.45rem 0.55rem; background: var(--wg-surface-raised); }
        .ct2-name { font-weight: 600; font-size: 0.84rem; }
        .ct2-blurb { margin: 0.3rem 0 0; }
        .ct2-steps { margin: 0.4rem 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .ct2-step { font-size: 0.84rem; }
        .ct2-step.ct2-danger { color: var(--wg-bad); }
        .ct2-step.ct2-blocked { color: var(--wg-good); font-weight: 600; }
        .ct2-outcome { margin-top: 0.5rem; padding: 0.55rem 0.7rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; }
        .ct2-outcome.good { background: var(--wg-good-soft); }
        .ct2-outcome.bad { background: var(--wg-bad-soft); }
      `}</style>
    </div>
  );
}

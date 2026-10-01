import { useState } from 'react';

/**
 * M15 · Framework threshold ladder
 * Each frontier lab defines capability thresholds that trigger stronger safeguards.
 * They don't line up exactly, but they rhyme. Compare the rungs side by side.
 * Sourced; see links. Verified 2026-10-01.
 */

interface Rung {
  tier: 'baseline' | 'high' | 'critical';
  level: string;
  meaning: string;
  status?: string;
}

interface Provider {
  id: string;
  name: string;
  framework: string;
  source: { label: string; url: string };
  rungs: Rung[];
}

const PROVIDERS: Provider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    framework: 'Responsible Scaling Policy v3 (AI Safety Levels)',
    source: { label: 'RSP v3.0 (Feb 2026)', url: 'https://anthropic.com/news/responsible-scaling-policy-v3' },
    rungs: [
      { tier: 'baseline', level: 'ASL-2', meaning: 'Present-day models; baseline safeguards.' },
      { tier: 'high', level: 'ASL-3', meaning: 'Meaningful uplift to CBRN or cyber; stronger security + deployment safeguards required.', status: 'Activated for relevant models since May 2025.' },
      { tier: 'critical', level: 'ASL-4+', meaning: 'Higher thresholds for autonomy and catastrophic uplift; defined ahead of need.', status: 'Mythos 5.1 assessed below the next tier.' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    framework: 'Preparedness Framework',
    source: { label: 'GPT-5.6 System Card (Jul 2026)', url: 'https://deploymentsafety.openai.com/gpt-5-6' },
    rungs: [
      { tier: 'baseline', level: 'Below High', meaning: 'Standard safety training and monitoring.' },
      { tier: 'high', level: 'High', meaning: 'Can meaningfully uplift or automate operationally relevant attacks; tailored safeguards required.', status: 'GPT-5.6 (Sol/Terra/Luna) rated High in cyber and bio.' },
      { tier: 'critical', level: 'Critical', meaning: 'End-to-end autonomous attacks / zero-days on hardened targets without human guidance.', status: 'Forthcoming "Astra" reported to meet the Critical cyber threshold.' },
    ],
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    framework: 'Frontier Safety Framework 3.1',
    source: { label: 'FSF 3.1 (Apr 2026)', url: 'https://deepmind.google/blog/strengthening-our-frontier-safety-framework/' },
    rungs: [
      { tier: 'baseline', level: 'Below TCL', meaning: 'Standard safeguards.' },
      { tier: 'high', level: 'Tracked Capability Level (TCL)', meaning: 'Early-warning rung added Apr 2026 to catch less-extreme risks sooner.', status: 'Flash Cyber gated to vetted defenders.' },
      { tier: 'critical', level: 'Critical Capability Level (CCL)', meaning: 'Severe-harm capability (CBRN, cyber, ML R&D, deceptive alignment, harmful manipulation); safety case required before launch.' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    framework: 'Advanced AI Scaling Framework v2',
    source: { label: 'Advanced AI Scaling Framework v2 (Apr 2026)', url: 'https://ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v2' },
    rungs: [
      { tier: 'baseline', level: 'Below threshold', meaning: 'Standard release process.' },
      { tier: 'high', level: 'High risk', meaning: 'Could substantially contribute to a threat scenario (chem-bio, cyber, loss of control).' },
      { tier: 'critical', level: 'Critical risk', meaning: 'Uniquely enables a catastrophic threat scenario; development/deployment paused until mitigated.' },
    ],
  },
];

const TIER_META = {
  baseline: { label: 'Baseline', pill: 'good' as const },
  high: { label: 'High', pill: 'warn' as const },
  critical: { label: 'Critical', pill: 'bad' as const },
};
const TIERS: ('baseline' | 'high' | 'critical')[] = ['critical', 'high', 'baseline'];

export default function FrameworkLadder() {
  const [selId, setSelId] = useState('anthropic');
  const sel = PROVIDERS.find((p) => p.id === selId)!;

  return (
    <div className="wg not-content">
      <h3 data-kind="Comparison">Framework threshold ladder</h3>
      <p className="wg-note">
        Every lab ties stronger safeguards to capability thresholds. The names differ — ASLs,
        Preparedness levels, CCLs/TCLs, risk tiers — but they rhyme: a baseline, a "serious
        uplift" rung, and a "catastrophic" rung. Compare them.
      </p>

      <div className="wg-row" style={{ margin: '0.5rem 0' }}>
        {PROVIDERS.map((p) => (
          <button key={p.id} className="wg-btn" aria-pressed={selId === p.id} onClick={() => setSelId(p.id)}>
            {p.name}
          </button>
        ))}
      </div>

      <p className="fl-framework">
        <strong>{sel.framework}</strong>
      </p>

      <div className="fl-ladder">
        {TIERS.map((tier) => {
          const rung = sel.rungs.find((r) => r.tier === tier)!;
          const tm = TIER_META[tier];
          return (
            <div key={tier} className={`fl-rung fl-${tier}`}>
              <div className="fl-rung-head">
                <span className={`wg-pill ${tm.pill}`}>{tm.label}</span>
                <strong className="fl-level">{rung.level}</strong>
              </div>
              <p className="fl-meaning">{rung.meaning}</p>
              {rung.status ? <p className="fl-status">{rung.status}</p> : null}
            </div>
          );
        })}
      </div>

      <p className="wg-banner">
        Source:{' '}
        <a href={sel.source.url} target="_blank" rel="noreferrer">
          {sel.source.label}
        </a>{' '}
        · verified 2026-10-01. Rungs are aligned by rough severity for comparison; the labs do
        not define them identically, and a separate compliance framework (e.g. Anthropic&apos;s
        FCF) may carry the legally binding version.
      </p>

      <style>{`
        .fl-framework { font-size: 0.9rem; margin: 0.3rem 0 0.5rem; }
        .fl-ladder { display: flex; flex-direction: column; gap: 0.4rem; }
        .fl-rung { border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.55rem 0.7rem; background: var(--wg-surface-raised); }
        .fl-rung.fl-critical { border-left: 4px solid var(--wg-bad); }
        .fl-rung.fl-high { border-left: 4px solid var(--wg-warn); }
        .fl-rung.fl-baseline { border-left: 4px solid var(--wg-good); }
        .fl-rung-head { display: flex; align-items: center; gap: 0.5rem; }
        .fl-level { font-size: 0.9rem; }
        .fl-meaning { margin: 0.35rem 0 0; font-size: 0.85rem; }
        .fl-status { margin: 0.3rem 0 0; font-size: 0.8rem; color: var(--wg-accent); }
      `}</style>
    </div>
  );
}

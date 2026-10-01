import { useMemo, useState } from 'react';

/**
 * M13 · Capability gate
 * The same request gets a different answer depending on WHO is asking and WHAT
 * they ask. Pick an identity tier and a request type, and see which model answers
 * — full, rerouted to a weaker model, or refused. Illustrative model of documented
 * trusted-access + rerouting behavior (see M13/M17 citations).
 */

type Tier = 'anon' | 'verified' | 'trusted';
type Req = 'benign' | 'vuln-discovery' | 'exploit-dev' | 'bio-research' | 'clearly-malicious';

const TIERS: { id: Tier; name: string; note: string }[] = [
  { id: 'anon', name: 'Standard account', note: 'Unverified. Default safeguards apply.' },
  { id: 'verified', name: 'Verified defender', note: 'Enrolled in a trusted-access program (e.g. Cyber Verification Program).' },
  { id: 'trusted', name: 'Vetted + Mythos-class access', note: 'Vetted org with access to the permissive build.' },
];

const REQS: { id: Req; name: string }[] = [
  { id: 'benign', name: 'Benign coding / general question' },
  { id: 'vuln-discovery', name: 'Find a vulnerability (defensive)' },
  { id: 'exploit-dev', name: 'Develop a working exploit' },
  { id: 'bio-research', name: 'Dual-use life-sciences research' },
  { id: 'clearly-malicious', name: 'Clearly malicious (credential theft, scaled attack)' },
];

type Outcome = 'full' | 'reroute' | 'refuse';
const OUT_META: Record<Outcome, { label: string; pill: 'good' | 'warn' | 'bad' }> = {
  full: { label: 'Answered by the full model', pill: 'good' },
  reroute: { label: 'Rerouted to a weaker model', pill: 'warn' },
  refuse: { label: 'Refused', pill: 'bad' },
};

// The gate: outcome as a function of (tier, request).
function gate(tier: Tier, req: Req): { outcome: Outcome; why: string } {
  if (req === 'benign') return { outcome: 'full', why: 'No sensitive capability involved — everyone gets the full model.' };
  if (req === 'clearly-malicious')
    return { outcome: 'refuse', why: 'No tier unlocks clearly malicious use. Trusted access relaxes dual-use friction, not malice.' };

  if (req === 'vuln-discovery') {
    if (tier === 'anon') return { outcome: 'full', why: 'Vulnerability discovery (defensive) is now allowed on the general model as of Fable 5.1.' };
    return { outcome: 'full', why: 'Allowed for everyone; verification is not required for defensive discovery.' };
  }

  if (req === 'exploit-dev') {
    if (tier === 'trusted') return { outcome: 'full', why: 'Vetted Mythos-class access lifts the cyber safeguard for exploit development.' };
    if (tier === 'verified') return { outcome: 'reroute', why: 'Verified, but exploit development still routes to a weaker model until Mythos-class access is granted.' };
    return { outcome: 'reroute', why: 'Dual-use: exploit development is rerouted to a weaker Opus-class model, not refused.' };
  }

  // bio-research
  if (tier === 'trusted') return { outcome: 'full', why: 'Life Sciences Verification Program unlocks dual-use biology on the Mythos-class build.' };
  return { outcome: 'reroute', why: 'Dual-use biology routes to an Opus-class model unless enrolled in the life-sciences program.' };
}

export default function CapabilityGate() {
  const [tier, setTier] = useState<Tier>('anon');
  const [req, setReq] = useState<Req>('exploit-dev');
  const result = useMemo(() => gate(tier, req), [tier, req]);
  const om = OUT_META[result.outcome];

  return (
    <div className="wg not-content">
      <h3 data-kind="Simulator">Capability gate</h3>
      <p className="wg-note">
        Modern safeguards gate on <em>identity</em>, not just the request. The same ask can be
        answered in full, rerouted to a weaker model, or refused depending on who is verified.
        Pick a tier and a request.
      </p>

      <div className="cg-controls">
        <div>
          <p className="cg-label">Who is asking</p>
          <div className="wg-col">
            {TIERS.map((ti) => (
              <button key={ti.id} className={`cg-opt ${tier === ti.id ? 'is-sel' : ''}`} aria-pressed={tier === ti.id} onClick={() => setTier(ti.id)}>
                <span className="cg-opt-name">{ti.name}</span>
                <span className="wg-note">{ti.note}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="cg-label">What they ask</p>
          <div className="wg-col">
            {REQS.map((r) => (
              <button key={r.id} className={`cg-opt ${req === r.id ? 'is-sel' : ''}`} aria-pressed={req === r.id} onClick={() => setReq(r.id)}>
                <span className="cg-opt-name">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`cg-outcome cg-${om.pill}`} role="status" aria-live="polite">
        <span className={`wg-pill ${om.pill}`}>{om.label}</span>
        <p style={{ margin: '0.4rem 0 0' }}>{result.why}</p>
      </div>

      <p className="wg-banner">
        Illustrative model of documented trusted-access + rerouting behavior (Anthropic CVP/LSVP
        & Opus rerouting; OpenAI Trusted Access for Cyber; Google Fairwind). Exact policies
        change — see the M17 comparison matrix for sourced, dated specifics.
      </p>

      <style>{`
        .cg-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.5rem 0; }
        @media (max-width: 640px) { .cg-controls { grid-template-columns: 1fr; } }
        .cg-label { font-weight: 700; font-size: 0.8rem; margin: 0 0 0.35rem; }
        .cg-opt { text-align: left; font: inherit; display: flex; flex-direction: column; gap: 0.15rem;
          border: 1px solid var(--wg-border); border-radius: var(--r-md); background: var(--wg-surface-raised);
          padding: 0.45rem 0.55rem; cursor: pointer; }
        .cg-opt.is-sel { border-color: var(--wg-accent); background: var(--wg-accent-soft); }
        .cg-opt-name { font-weight: 600; font-size: 0.84rem; }
        .cg-outcome { border-radius: var(--r-md); padding: 0.6rem 0.7rem; background: var(--wg-surface); }
        .cg-outcome.cg-good { background: var(--wg-good-soft); }
        .cg-outcome.cg-warn { background: var(--wg-warn-soft); }
        .cg-outcome.cg-bad { background: var(--wg-bad-soft); }
      `}</style>
    </div>
  );
}

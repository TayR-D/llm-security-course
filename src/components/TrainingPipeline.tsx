import { useState } from 'react';

/**
 * M3 · Training pipeline stepper
 * Walk the stages that turn raw text into an aligned model, and see which safety
 * property enters at each stage — and what it still can't guarantee. Illustrative
 * summary of the public training recipe, not any one provider's exact process.
 */

interface Stage {
  id: string;
  name: string;
  what: string;
  safety: string;
  gap: string;
}

const STAGES: Stage[] = [
  {
    id: 'pretrain',
    name: 'Pretraining',
    what: 'Next-token prediction over a huge text corpus. The model learns language, facts, and reasoning patterns — and, inevitably, harmful knowledge that exists on the open internet.',
    safety: 'Data filtering: the worst material is screened out of the corpus before training.',
    gap: 'A filtered corpus still contains dual-use knowledge. Pretraining adds capability, not refusal — the base model will answer almost anything.',
  },
  {
    id: 'sft',
    name: 'Supervised fine-tuning',
    what: 'The model is fine-tuned on curated examples of good assistant behavior: helpful answers, correct formats, and demonstrations of refusing clearly harmful requests.',
    safety: 'The first refusal behavior is taught here, by example.',
    gap: 'Demonstrations cover the cases the authors thought of. Novel framings and jailbreaks fall outside the examples.',
  },
  {
    id: 'rlhf',
    name: 'RLHF / RLAIF / Constitutional AI',
    what: 'A reward model (trained on human preferences, or on AI judgments against a written constitution) scores the model’s outputs, and reinforcement learning pushes the model toward higher-scoring behavior.',
    safety: 'Refusal generalizes beyond the SFT examples, and the policy source becomes explicit — a spec or constitution the model is optimized against.',
    gap: 'The model learns what the reward model rewards. Reward hacking and mismatched generalization mean the behavior is a strong tendency, never a guarantee (M7).',
  },
  {
    id: 'reasoning',
    name: 'Reasoning RL',
    what: 'Further reinforcement learning rewards correct multi-step reasoning. The model learns to think before answering, which also lets it reason over safety policy at inference time.',
    safety: 'The model can reason about whether a request violates policy, catching some attacks that pattern-matching misses.',
    gap: 'More capability cuts both ways: a stronger reasoner is also better at talking itself into a harmful request, and chain-of-thought can be gamed (M14).',
  },
  {
    id: 'deploy',
    name: 'Deployment safeguards',
    what: 'The trained model ships behind runtime layers: classifiers, activation monitors, access tiers and output screening — the stack from M10.',
    safety: 'Defense in depth: safeguards that don’t live in the weights at all, and can be updated without retraining.',
    gap: 'For open-weight releases, none of this travels with the model — a downloaded copy keeps only what’s baked into the weights, which can be fine-tuned away (M9, M17).',
  },
];

export default function TrainingPipeline() {
  const [i, setI] = useState(0);
  const stage = STAGES[i];

  return (
    <div className="wg">
      <h3>Training pipeline stepper</h3>
      <p className="wg-note">
        Refusal is a learned behavior, added in stages — not a rule in the code. Step
        through to see where each safety property enters, and what it still can&apos;t
        promise.
      </p>

      <ol className="tp-track">
        {STAGES.map((s, idx) => (
          <li key={s.id} className={`tp-node ${idx === i ? 'is-active' : ''} ${idx < i ? 'is-done' : ''}`}>
            <button className="tp-dot" onClick={() => setI(idx)} aria-label={`Go to ${s.name}`} aria-current={idx === i}>
              {idx + 1}
            </button>
            <span className="tp-node-name">{s.name}</span>
          </li>
        ))}
      </ol>

      <div className="tp-card" role="status" aria-live="polite">
        <h4>
          {i + 1}. {stage.name}
        </h4>
        <p>{stage.what}</p>
        <div className="tp-rows">
          <div className="tp-row tp-safety">
            <span className="wg-pill good">safety in</span>
            <span>{stage.safety}</span>
          </div>
          <div className="tp-row tp-gap">
            <span className="wg-pill warn">still open</span>
            <span>{stage.gap}</span>
          </div>
        </div>
      </div>

      <div className="wg-row tp-nav">
        <button className="wg-btn" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
          ← Previous
        </button>
        <span className="wg-note">
          Stage {i + 1} of {STAGES.length}
        </span>
        <button
          className="wg-btn"
          onClick={() => setI((x) => Math.min(STAGES.length - 1, x + 1))}
          disabled={i === STAGES.length - 1}
        >
          Next →
        </button>
      </div>

      <p className="wg-banner">
        Illustrative summary of the publicly described training recipe. Providers differ in
        the details and order; the through-line — refusal is trained in, layer by layer, and
        never absolute — is the real one.
      </p>

      <style>{`
        .tp-track { list-style: none; display: flex; gap: 0; padding: 0; margin: 0.8rem 0; overflow-x: auto; }
        .tp-node { display: flex; flex-direction: column; align-items: center; flex: 1 1 0; min-width: 5rem; position: relative; }
        .tp-node::before { content: ''; position: absolute; top: 0.9rem; left: -50%; width: 100%; height: 2px; background: var(--wg-border); z-index: 0; }
        .tp-node:first-child::before { display: none; }
        .tp-node.is-done::before, .tp-node.is-active::before { background: var(--wg-accent); }
        .tp-dot { position: relative; z-index: 1; width: 1.8rem; height: 1.8rem; border-radius: 50%;
          border: 2px solid var(--wg-border); background: var(--wg-surface-raised); color: var(--wg-ink-quiet);
          font-weight: 700; cursor: pointer; font-size: 0.8rem; }
        .tp-node.is-active .tp-dot { border-color: var(--wg-accent); color: var(--wg-accent); }
        .tp-node.is-done .tp-dot { border-color: var(--wg-accent); background: var(--wg-accent-soft); color: var(--wg-accent); }
        .tp-node-name { font-size: 0.68rem; text-align: center; margin-top: 0.3rem; color: var(--wg-ink-quiet); line-height: 1.2; }
        .tp-node.is-active .tp-node-name { color: var(--wg-ink); font-weight: 600; }
        .tp-card { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.7rem 0.8rem; background: var(--wg-surface); }
        .tp-card h4 { margin-top: 0; }
        .tp-rows { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.6rem; }
        .tp-row { display: flex; gap: 0.5rem; align-items: flex-start; font-size: 0.86rem; }
        .tp-row .wg-pill { flex: none; margin-top: 0.1rem; }
        .tp-nav { justify-content: space-between; margin-top: 0.7rem; }
      `}</style>
    </div>
  );
}

import { useMemo, useState } from 'react';

/**
 * M18 · Guardrail config playground
 * Pick an open guard model, set strictness, and run a small built-in test set to
 * see the confusion matrix and the precision/recall trade-off. Illustrative
 * profiles drawn from the behavior independent benchmarks report (precision-
 * optimized guards miss recall; size does not predict safety). Not measured rates.
 */

interface Guard {
  id: string;
  name: string;
  size: string;
  // base recall (catch rate on harmful) and false-positive rate at mid strictness
  baseRecall: number;
  baseFpr: number;
  note: string;
}

const GUARDS: Guard[] = [
  { id: 'qwen', name: 'Qwen3Guard', size: '8B', baseRecall: 0.9, baseFpr: 0.12, note: 'Recall-strong, multilingual, three-level severity. Benchmarks well above larger guards on catching unsafe content.' },
  { id: 'llamaguard', name: 'Llama Guard 4', size: '12B', baseRecall: 0.62, baseFpr: 0.05, note: 'Precision-optimized: few false alarms, but independent tests show it misses a large share of unsafe content.' },
  { id: 'gptoss', name: 'gpt-oss-safeguard', size: '20B', baseRecall: 0.55, baseFpr: 0.04, note: 'Bring-your-own-policy at runtime; conservative — high precision, lower recall. Bigger is not safer.' },
  { id: 'shieldgemma', name: 'ShieldGemma', size: '9B', baseRecall: 0.7, baseFpr: 0.08, note: 'Harm-category moderation; middling balance.' },
  { id: 'granite', name: 'Granite Guardian 4.1', size: '8B', baseRecall: 0.78, baseFpr: 0.09, note: 'Criteria-conditioned safety judgment; solid all-rounder.' },
];

// Test set: 10 harmful + 10 benign items (defanged labels only).
const HARMFUL_ITEMS = ['malware help', 'credential theft', 'scaled phishing', 'CBRN uplift', 'exploit dev', 'self-harm instructions', 'disinfo campaign', 'injection payload', 'doxxing help', 'fraud script'];
const BENIGN_ITEMS = ['patch a CVE', 'explain TLS', 'write a poem', 'debug Python', 'summarize a paper', 'recipe', 'resume tips', 'SQL join help', 'travel plan', 'unit test'];

export default function GuardrailPlayground() {
  const [guardId, setGuardId] = useState('qwen');
  const [strict, setStrict] = useState(0.5); // 0 lenient .. 1 strict
  const g = GUARDS.find((x) => x.id === guardId)!;

  const { tp, fn, fp, tn, precision, recall } = useMemo(() => {
    // Strictness shifts both recall and FPR up together (catch more, false-alarm more).
    const recallEff = Math.min(0.99, g.baseRecall + (strict - 0.5) * 0.5);
    const fprEff = Math.max(0.0, Math.min(0.9, g.baseFpr + (strict - 0.5) * 0.4));
    const n = 10;
    const tp = Math.round(recallEff * n);
    const fn = n - tp;
    const fp = Math.round(fprEff * n);
    const tn = n - fp;
    const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
    const recall = tp / n;
    return { tp, fn, fp, tn, precision, recall };
  }, [g, strict]);

  // which items fall where (deterministic: hardest-to-catch harmful listed first as FN)
  const caughtHarmful = HARMFUL_ITEMS.slice(0, tp);
  const missedHarmful = HARMFUL_ITEMS.slice(tp);
  const falseAlarms = BENIGN_ITEMS.slice(0, fp);

  return (
    <div className="wg not-content">
      <h3 data-kind="Playground">Guardrail config playground</h3>
      <p className="wg-note">
        You don&apos;t have to build a guard from scratch — open models exist. But they differ a
        lot, and independent benchmarks have a blunt finding: <em>bigger is not safer</em>, and
        precision-optimized guards can miss most unsafe content. Pick one, set strictness, run the
        test set.
      </p>

      <div className="wg-row" style={{ margin: '0.5rem 0' }}>
        {GUARDS.map((x) => (
          <button key={x.id} className="wg-btn" aria-pressed={guardId === x.id} onClick={() => setGuardId(x.id)}>
            {x.name} <span className="gp-size">{x.size}</span>
          </button>
        ))}
      </div>
      <p className="wg-note">{g.note}</p>

      <label className="gp-strict">
        Strictness: {strict < 0.4 ? 'lenient' : strict > 0.6 ? 'strict' : 'balanced'}
        <input type="range" min={0} max={1} step={0.05} value={strict} onChange={(e) => setStrict(parseFloat(e.target.value))} />
      </label>

      <div className="gp-matrix">
        <div className="gp-cell gp-tp"><span className="gp-n">{tp}</span><span>caught (TP)</span></div>
        <div className="gp-cell gp-fn"><span className="gp-n">{fn}</span><span>missed (FN)</span></div>
        <div className="gp-cell gp-fp"><span className="gp-n">{fp}</span><span>false alarm (FP)</span></div>
        <div className="gp-cell gp-tn"><span className="gp-n">{tn}</span><span>correct allow (TN)</span></div>
      </div>

      <div className="gp-scores">
        <span>Precision: <strong>{Math.round(precision * 100)}%</strong></span>
        <span>Recall: <strong>{Math.round(recall * 100)}%</strong></span>
      </div>

      <div className="gp-items">
        {missedHarmful.length ? (
          <p className="gp-miss"><strong>Missed harmful:</strong> {missedHarmful.join(', ')}</p>
        ) : (
          <p className="gp-ok"><strong>No harmful item missed</strong> at this setting.</p>
        )}
        {falseAlarms.length ? (
          <p className="gp-fpitems"><strong>Benign wrongly blocked:</strong> {falseAlarms.join(', ')}</p>
        ) : (
          <p className="gp-ok"><strong>No benign item wrongly blocked.</strong></p>
        )}
      </div>

      <p className="wg-banner">
        Illustrative profiles based on the <em>behavior</em> independent benchmarks report (e.g. a
        4B guard out-recalling a 20B one); not measured rates for any specific version. Other
        options not shown: Prompt Guard 2, Nemotron safety guards, and framework/cloud layers
        (LlamaFirewall, NeMo Guardrails, Bedrock Guardrails, Azure Prompt Shields, Google Model
        Armor).{' '}
        <a href="https://artificialanalysis.ai/articles/guardrail-safety-benchmark" target="_blank" rel="noreferrer">benchmark source ↗</a>
      </p>

      <style>{`
        .gp-size { font-family: var(--wg-mono); font-size: 0.7rem; color: var(--wg-ink-quiet); }
        .gp-strict { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.84rem; font-weight: 600; margin: 0.4rem 0; }
        .gp-strict input { accent-color: var(--wg-accent); max-width: 420px; }
        .gp-matrix { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin: 0.5rem 0; max-width: 420px; }
        .gp-cell { border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.5rem; display: flex; flex-direction: column; gap: 0.1rem; font-size: 0.78rem; }
        .gp-cell .gp-n { font-size: 1.3rem; font-weight: 700; }
        .gp-tp { background: var(--wg-good-soft); }
        .gp-tn { background: var(--wg-good-soft); }
        .gp-fn { background: var(--wg-bad-soft); }
        .gp-fp { background: var(--wg-warn-soft); }
        .gp-scores { display: flex; gap: 1.2rem; font-size: 0.9rem; margin: 0.3rem 0 0.5rem; }
        .gp-items p { font-size: 0.83rem; margin: 0.3rem 0; }
        .gp-miss { color: var(--wg-bad); }
        .gp-fpitems { color: var(--wg-warn); }
        .gp-ok { color: var(--wg-good); }
      `}</style>
    </div>
  );
}

import { useMemo, useState } from 'react';

/**
 * Capstone · Guardrail design checklist for a self-hosted, multi-tenant LLM
 * platform running an open-weight model (refusals removed) with an agent harness
 * and MCP tools. Check items off; progress is per-layer. State persists in
 * localStorage when available (wrapped in try/catch for private windows / SSR).
 */

interface Item {
  id: string;
  text: string;
  ref: string;
}
interface Group {
  id: string;
  name: string;
  why: string;
  items: Item[];
}

const GROUPS: Group[] = [
  {
    id: 'threat',
    name: '1 · Threat model first',
    why: 'Dual-use is the point here, so you can’t rely on refusal. Decide what you’re actually defending.',
    items: [
      { id: 't1', text: 'Name the tenants and what each is trusted to do', ref: 'M1' },
      { id: 't2', text: 'List assets: tenant data, model weights, tool credentials', ref: 'M1' },
      { id: 't3', text: 'Accept that the model has no trained-in refusal (open weight)', ref: 'M3, M11' },
    ],
  },
  {
    id: 'tenancy',
    name: '2 · Identity & tenancy',
    why: 'With no provider access tier, tenant identity IS your access control.',
    items: [
      { id: 'i1', text: 'Authenticated tenants; per-tenant API keys', ref: 'M13' },
      { id: 'i2', text: 'Hard per-tenant isolation of data, memory and RAG stores', ref: 'M9, M13' },
      { id: 'i3', text: 'Per-user rate limits and an enforcement ladder', ref: 'M13' },
    ],
  },
  {
    id: 'input',
    name: '3 · Input screening',
    why: 'The model reads everything as one string — screen untrusted content before it acts.',
    items: [
      { id: 'in1', text: 'Injection/prompt guard on user input (e.g. Prompt Guard 2 / Qwen3Guard)', ref: 'M12, M18' },
      { id: 'in2', text: 'Screen tool output and RAG content, not just the user turn', ref: 'M8' },
      { id: 'in3', text: 'Normalize input (homoglyphs, invisibles) before matching', ref: 'M2' },
    ],
  },
  {
    id: 'output',
    name: '4 · Output screening',
    why: 'Catch what training won’t, including output-obfuscation attacks.',
    items: [
      { id: 'o1', text: 'Content guard on responses (Llama Guard 4 / ShieldGemma / Granite)', ref: 'M12, M18' },
      { id: 'o2', text: 'Judge output in the context of its input where the tool allows', ref: 'M7, M12' },
      { id: 'o3', text: 'Measure recall, not just precision, on your own test set', ref: 'M18, M19' },
    ],
  },
  {
    id: 'agent',
    name: '5 · Agent containment',
    why: 'The agent itself is a risk; limit what a successful injection can reach.',
    items: [
      { id: 'a1', text: 'Least agency: only the tools each task needs', ref: 'M8, M14' },
      { id: 'a2', text: 'Egress allow-list; no open outbound from the sandbox', ref: 'M8, M14' },
      { id: 'a3', text: 'Human confirmation for irreversible / external actions', ref: 'M14' },
      { id: 'a4', text: 'Sandbox + escape detection for code execution', ref: 'M14' },
      { id: 'a5', text: 'Vet MCP servers; treat tool descriptions as untrusted', ref: 'M8' },
    ],
  },
  {
    id: 'monitor',
    name: '6 · Monitoring & governance',
    why: 'You can’t improve what you don’t watch — and you own the risk now.',
    items: [
      { id: 'm1', text: 'Log prompts, tool calls and actions per tenant', ref: 'M13, M14' },
      { id: 'm2', text: 'Async review for abuse patterns across sessions', ref: 'M10, M13' },
      { id: 'm3', text: 'A red-team suite in CI (garak/PyRIT/promptfoo)', ref: 'M19' },
      { id: 'm4', text: 'Signed, pinned model files and dependencies', ref: 'M9' },
    ],
  },
];

const KEY = 'itg-capstone-checklist';

function loadState(): Record<string, boolean> {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function CapstoneChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(loadState);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private window / unavailable — in-memory only */
      }
      return next;
    });
  }

  const total = useMemo(() => GROUPS.reduce((n, g) => n + g.items.length, 0), []);
  const doneCount = GROUPS.reduce((n, g) => n + g.items.filter((it) => checked[it.id]).length, 0);
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div className="wg">
      <h3>Capstone checklist: secure the self-hosted platform</h3>
      <p className="wg-note">
        A multi-tenant platform running an open-weight model with refusals removed, an agent
        harness and MCP tools. There&apos;s no provider safety net — the controls are yours. Work
        the list; it&apos;s the whole course applied to one system.
      </p>

      <div className="cc-progress">
        <div className="cc-bar"><div className="cc-fill" style={{ width: `${pct}%` }} /></div>
        <span className="cc-pct">{doneCount} / {total} ({pct}%)</span>
      </div>

      <div className="cc-groups">
        {GROUPS.map((g) => {
          const gdone = g.items.filter((it) => checked[it.id]).length;
          return (
            <div key={g.id} className="cc-group">
              <div className="cc-group-head">
                <strong>{g.name}</strong>
                <span className="wg-note">{gdone}/{g.items.length}</span>
              </div>
              <p className="wg-note cc-why">{g.why}</p>
              <ul className="cc-items">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <label className="cc-item">
                      <input type="checkbox" checked={!!checked[it.id]} onChange={() => toggle(it.id)} />
                      <span className="cc-text">{it.text}</span>
                      <span className="cc-ref">{it.ref}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="wg-banner">
        Each item links back to the module that covers it. This is a starting scaffold, not a
        compliance certificate — adapt it to your architecture (M5) and threat model (M1). Progress
        is saved in your browser only.
      </p>

      <style>{`
        .cc-progress { display: flex; align-items: center; gap: 0.6rem; margin: 0.5rem 0 0.8rem; }
        .cc-bar { flex: 1; height: 10px; border-radius: 999px; background: var(--wg-surface); border: 1px solid var(--wg-border); overflow: hidden; }
        .cc-fill { height: 100%; background: var(--wg-accent); transition: width 0.2s ease; }
        .cc-pct { font-size: 0.82rem; font-family: var(--wg-mono); color: var(--wg-ink-quiet); flex: none; }
        .cc-groups { display: flex; flex-direction: column; gap: 0.7rem; }
        .cc-group { border: 1px solid var(--wg-border); border-radius: 8px; padding: 0.55rem 0.7rem; background: var(--wg-surface-raised); }
        .cc-group-head { display: flex; justify-content: space-between; align-items: baseline; }
        .cc-why { margin: 0.2rem 0 0.4rem; }
        .cc-items { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .cc-item { display: flex; align-items: baseline; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; }
        .cc-item input { margin-top: 0.15rem; flex: none; accent-color: var(--wg-accent); }
        .cc-text { flex: 1; }
        .cc-ref { font-size: 0.72rem; font-family: var(--wg-mono); color: var(--wg-ink-quiet); flex: none; }
      `}</style>
    </div>
  );
}

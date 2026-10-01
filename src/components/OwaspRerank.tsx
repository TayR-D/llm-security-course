import { useMemo, useState } from 'react';

/**
 * M6 · OWASP LLM Top 10 re-rank + crosswalk
 * Shows the 2025 -> 2026 movement (the first edition weighted by real incident
 * data) and how each entry crosswalks to the Agentic Top 10 / MITRE ATLAS.
 * Source: OWASP GenAI Security Project, LLM Top 10 2026 (published Aug 2026).
 */

interface Entry {
  rank2026: number;
  id: string;
  name: string;
  rank2025: number | null; // null = renamed/new framing
  renamedFrom?: string;
  note: string;
  crosswalk: string;
}

const SOURCE = {
  label: 'OWASP Top 10 for LLM Applications 2026',
  url: 'https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/',
};

const ENTRIES: Entry[] = [
  { rank2026: 1, id: 'LLM01', name: 'Prompt Injection', rank2025: 1, note: 'Held #1. Now explicitly covers cross-modal injection hidden in images or audio. Few public incidents — OWASP calls this a "defense effect": teams spend heavily to keep it rare.', crosswalk: 'Agentic: ASI01 Agent Goal Hijack. Taught in M4, M8.' },
  { rank2026: 2, id: 'LLM02', name: 'Sensitive Information Disclosure', rank2025: 2, note: 'Held #2. Leaking private data, secrets, or other users’ content.', crosswalk: 'Pairs with LLM08 Hidden Context Exposure.' },
  { rank2026: 3, id: 'LLM03', name: 'Excessive Agency', rank2025: 6, note: 'The biggest move on the list, up from 6th. Both the vote and the incident data agree: agents acting on real systems is where damage now lands.', crosswalk: 'Agentic: ASI02 Tool Misuse, ASI03 Identity & Privilege Abuse. Taught in M5, M8, M14.' },
  { rank2026: 4, id: 'LLM04', name: 'Supply Chain', rank2025: 3, note: 'Slipped one place. Compromised models, datasets, adapters and dependencies.', crosswalk: 'Taught in M9.' },
  { rank2026: 5, id: 'LLM05', name: 'Data and Model Poisoning', rank2025: 4, note: 'Now absorbs fine-tuning subversion — including stripping alignment from open weights.', crosswalk: 'Taught in M3, M9.' },
  { rank2026: 6, id: 'LLM06', name: 'Unbounded Consumption', rank2025: 10, note: 'Rose four places. Resource and cost exhaustion (incl. token/denial-of-wallet) now weighed much more heavily.', crosswalk: 'Agentic: resource abuse in long agent loops.' },
  { rank2026: 7, id: 'LLM07', name: 'Misinformation', rank2025: 9, note: 'The widest belief-vs-evidence gap: voters ranked it low, incident data ranked it high. Model output drives tool calls and downstream actions, so a wrong answer becomes a system failure.', crosswalk: 'Taught in M7 (reliability), M14.' },
  { rank2026: 8, id: 'LLM08', name: 'Hidden Context Exposure', rank2025: null, renamedFrom: 'System Prompt Leakage', note: 'Renamed and broadened: not just the system prompt, but any hidden context (tool schemas, retrieved data) an attacker can surface.', crosswalk: 'Pairs with LLM02.' },
  { rank2026: 9, id: 'LLM09', name: 'Vector and Embedding Weaknesses', rank2025: 8, note: 'RAG-specific risks: poisoned stores, cross-tenant leakage, embedding inversion.', crosswalk: 'Taught in M9 (embedding poisoning).' },
  { rank2026: 10, id: 'LLM10', name: 'Improper Output Handling', rank2025: 5, note: 'Fell five places and widened scope. Trusting model output into a shell, SQL, or the DOM.', crosswalk: 'Classic appsec sink; pairs with LLM03.' },
];

function delta(e: Entry): { dir: 'up' | 'down' | 'flat' | 'new'; by: number } {
  if (e.rank2025 === null) return { dir: 'new', by: 0 };
  const d = e.rank2025 - e.rank2026;
  return { dir: d > 0 ? 'up' : d < 0 ? 'down' : 'flat', by: Math.abs(d) };
}

export default function OwaspRerank() {
  const [mode, setMode] = useState<'order' | 'movers'>('order');
  const [selId, setSelId] = useState('LLM03');

  const list = useMemo(() => {
    const copy = [...ENTRIES];
    if (mode === 'movers') {
      copy.sort((a, b) => delta(b).by - delta(a).by);
    }
    return copy;
  }, [mode]);

  const sel = ENTRIES.find((e) => e.id === selId)!;
  const d = delta(sel);

  return (
    <div className="wg not-content">
      <h3 data-kind="Ranking">OWASP LLM Top 10: 2025 → 2026</h3>
      <p className="wg-note">
        The 2026 edition kept all ten categories but re-ranked eight of them, and for the
        first time weighted the ranking with real incident data (25%) alongside the
        practitioner vote (75%). Tap an entry for the story and where the course covers it.
      </p>

      <div className="wg-row" style={{ margin: '0.5rem 0' }}>
        <span className="wg-note" style={{ width: '4.5rem' }}>Sort:</span>
        <button className="wg-btn" aria-pressed={mode === 'order'} onClick={() => setMode('order')}>
          2026 order
        </button>
        <button className="wg-btn" aria-pressed={mode === 'movers'} onClick={() => setMode('movers')}>
          Biggest movers
        </button>
      </div>

      <div className="ow-grid">
        <ol className="ow-list">
          {list.map((e) => {
            const dd = delta(e);
            return (
              <li key={e.id}>
                <button
                  className={`ow-item ${selId === e.id ? 'is-sel' : ''}`}
                  onClick={() => setSelId(e.id)}
                  aria-pressed={selId === e.id}
                >
                  <span className="ow-rank">{e.id}</span>
                  <span className="ow-name">{e.name}</span>
                  <span className={`ow-delta ow-${dd.dir}`}>
                    {dd.dir === 'up' && `▲ ${dd.by}`}
                    {dd.dir === 'down' && `▼ ${dd.by}`}
                    {dd.dir === 'flat' && '= '}
                    {dd.dir === 'new' && 'renamed'}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="ow-detail" role="status" aria-live="polite">
          <div className="wg-row">
            <strong>
              {sel.id} · {sel.name}
            </strong>
          </div>
          <p className="wg-note" style={{ marginTop: '0.2rem' }}>
            {sel.rank2025 !== null ? (
              <>
                2025: #{sel.rank2025} → 2026: #{sel.rank2026}{' '}
                {d.dir === 'up' && <span className="ow-up">(up {d.by})</span>}
                {d.dir === 'down' && <span className="ow-down">(down {d.by})</span>}
                {d.dir === 'flat' && <span>(unchanged)</span>}
              </>
            ) : (
              <>
                Renamed from <em>{sel.renamedFrom}</em> (2025 #7) and broadened.
              </>
            )}
          </p>
          <p style={{ margin: '0.45rem 0' }}>{sel.note}</p>
          <p className="wg-note">
            <strong>Crosswalk:</strong> {sel.crosswalk}
          </p>
        </div>
      </div>

      <p className="wg-banner">
        Source:{' '}
        <a href={SOURCE.url} target="_blank" rel="noreferrer">
          {SOURCE.label}
        </a>{' '}
        · verified 2026-10-01. The 2026 list draws a hard boundary: once a model gains tools,
        memory and the authority to act, the risk moves to the OWASP Agentic Top 10.
      </p>

      <style>{`
        .ow-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 1rem; }
        @media (max-width: 720px) { .ow-grid { grid-template-columns: 1fr; } }
        .ow-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.3rem; }
        .ow-item { width: 100%; display: flex; align-items: center; gap: 0.5rem; text-align: left; font: inherit;
          border: 1px solid var(--wg-border); border-radius: var(--r-md); background: var(--wg-surface-raised);
          padding: 0.4rem 0.5rem; cursor: pointer; }
        .ow-item.is-sel { outline: 2px solid var(--wg-accent); outline-offset: 1px; }
        .ow-rank { font-family: var(--wg-mono); font-size: 0.72rem; color: var(--wg-ink-quiet); flex: none; width: 3.1rem; }
        .ow-name { flex: 1; font-size: 0.84rem; font-weight: 600; }
        .ow-delta { font-size: 0.75rem; font-weight: 700; flex: none; }
        .ow-up, .ow-delta.ow-up { color: var(--wg-good); }
        .ow-down, .ow-delta.ow-down { color: var(--wg-bad); }
        .ow-delta.ow-flat { color: var(--wg-ink-quiet); }
        .ow-delta.ow-new { color: var(--wg-warn); }
        .ow-detail { border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.6rem 0.7rem; background: var(--wg-surface); }
      `}</style>
    </div>
  );
}

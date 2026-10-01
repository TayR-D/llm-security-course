import { useState } from 'react';

/**
 * M5 · Attack surface map
 * Click a component of a modern agent system to see its trust level, what can go
 * wrong, and the OWASP LLM/Agentic risk IDs that apply. Illustrative architecture;
 * real systems vary.
 */

type Trust = 'trusted' | 'boundary' | 'untrusted';

interface Node {
  id: string;
  name: string;
  trust: Trust;
  role: string;
  risk: string;
  owasp: string[];
}

const NODES: Node[] = [
  { id: 'user', name: 'User', trust: 'trusted', role: 'The person making the request.', risk: 'A careless user can over-broadly instruct an agent; a malicious user is the classic attacker.', owasp: ['LLM01 Prompt Injection'] },
  { id: 'app', name: 'App / system prompt', trust: 'trusted', role: 'Your instructions, policies and tool definitions, set by the developer.', risk: 'Leaks (hidden-context exposure) reveal policy and tool schemas that help an attacker.', owasp: ['LLM08 Hidden Context Exposure'] },
  { id: 'model', name: 'Model', trust: 'boundary', role: 'Reads the whole flattened context and decides what to say or which tool to call.', risk: 'Can be jailbroken or injected into; treats all context as one string (M4).', owasp: ['LLM01 Prompt Injection', 'LLM07 Misinformation'] },
  { id: 'rag', name: 'Retriever / RAG', trust: 'untrusted', role: 'Pulls documents from a knowledge base or the web into the context.', risk: 'Retrieved content is untrusted input: indirect injection and poisoned chunks ride in here.', owasp: ['LLM01 Prompt Injection', 'LLM04 Data & Model Poisoning'] },
  { id: 'tools', name: 'Tools / functions', trust: 'boundary', role: 'Let the model act: query a DB, send mail, run code.', risk: 'Over-broad tool access turns a successful injection into real-world action.', owasp: ['ASI02 Tool Misuse', 'LLM03 Excessive Agency'] },
  { id: 'mcp', name: 'MCP servers', trust: 'untrusted', role: 'External tool providers connected over the Model Context Protocol.', risk: 'Tool descriptions are attacker-controllable; tool poisoning and rug-pulls live here.', owasp: ['ASI02 Tool Misuse', 'LLM01 Prompt Injection'] },
  { id: 'memory', name: 'Memory', trust: 'untrusted', role: 'Persists facts across sessions.', risk: 'Poisoned memory corrupts future decisions long after the attack turn.', owasp: ['LLM04 Data & Model Poisoning', 'ASI05 Memory Poisoning'] },
  { id: 'tool-out', name: 'Tool output', trust: 'untrusted', role: 'Whatever a tool or MCP server returns, fed back into the context.', risk: 'Untrusted just like retrieved docs: an injection can hide in a tool result.', owasp: ['LLM01 Prompt Injection'] },
  { id: 'computer', name: 'Computer use', trust: 'untrusted', role: 'The model sees a screen and controls mouse/keyboard.', risk: 'Anything on screen is injectable input; actions hit the real desktop.', owasp: ['LLM03 Excessive Agency', 'ASI02 Tool Misuse'] },
];

const TRUST_META: Record<Trust, { label: string; pill: 'good' | 'warn' | 'bad' }> = {
  trusted: { label: 'Trusted', pill: 'good' },
  boundary: { label: 'Trust boundary', pill: 'warn' },
  untrusted: { label: 'Untrusted input', pill: 'bad' },
};

export default function AttackSurfaceMap() {
  const [selId, setSelId] = useState('rag');
  const sel = NODES.find((n) => n.id === selId)!;

  return (
    <div className="wg not-content">
      <h3 data-kind="Map">Attack surface map</h3>
      <p className="wg-note">
        A modern agent is far more than a chatbot. Tap each component to see whether its
        input is trusted, what can go wrong, and which OWASP risks apply. Red = untrusted
        input that reaches the model.
      </p>

      <div className="as-map">
        {NODES.map((n) => (
          <button
            key={n.id}
            className={`as-node as-${n.trust} ${selId === n.id ? 'is-sel' : ''}`}
            onClick={() => setSelId(n.id)}
            aria-pressed={selId === n.id}
          >
            <span className="as-node-name">{n.name}</span>
            <span className={`wg-pill ${TRUST_META[n.trust].pill}`}>{TRUST_META[n.trust].label}</span>
          </button>
        ))}
      </div>

      <div className="as-detail" role="status" aria-live="polite">
        <div className="wg-row">
          <strong>{sel.name}</strong>
          <span className={`wg-pill ${TRUST_META[sel.trust].pill}`}>{TRUST_META[sel.trust].label}</span>
        </div>
        <p style={{ margin: '0.4rem 0 0.3rem' }}>{sel.role}</p>
        <p className="as-risk">{sel.risk}</p>
        <div className="wg-row" style={{ marginTop: '0.4rem' }}>
          <span className="wg-note">Maps to:</span>
          {sel.owasp.map((o) => (
            <span key={o} className="as-chip">{o}</span>
          ))}
        </div>
      </div>

      <p className="wg-banner">
        Illustrative architecture — real systems add or drop components. OWASP IDs reference
        the 2026 LLM and Agentic Top 10 (covered in M6).
      </p>

      <style>{`
        .as-map { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0.7rem 0; }
        @media (max-width: 560px) { .as-map { grid-template-columns: repeat(2, 1fr); } }
        .as-node { display: flex; flex-direction: column; align-items: flex-start; gap: 0.35rem;
          border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.5rem; background: var(--wg-surface-raised);
          cursor: pointer; text-align: left; font: inherit; }
        .as-node.as-untrusted { border-left: 3px solid var(--wg-bad); }
        .as-node.as-boundary { border-left: 3px solid var(--wg-warn); }
        .as-node.as-trusted { border-left: 3px solid var(--wg-good); }
        .as-node.is-sel { outline: 2px solid var(--wg-accent); outline-offset: 1px; }
        .as-node-name { font-weight: 600; font-size: 0.84rem; }
        .as-detail { border: 1px solid var(--wg-border); border-radius: var(--r-md); padding: 0.6rem 0.7rem; background: var(--wg-surface); }
        .as-risk { font-size: 0.86rem; margin: 0; }
        .as-chip { font-size: 0.74rem; border: 1px solid var(--wg-accent); background: var(--wg-accent-soft);
          border-radius: var(--r-sm); padding: 0.05rem 0.5rem; font-family: var(--wg-mono); }
      `}</style>
    </div>
  );
}

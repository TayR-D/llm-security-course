/**
 * M10 · Guardrail Stack Simulator — data.
 * Defanged, category-level test requests (never working payloads) and which
 * defense layers tend to catch each. Layer behavior is modeled on documented
 * provider stacks (see M10/M12/M13 lessons for citations); this is an
 * illustrative model, not a measurement of any specific product.
 */

export type LayerId =
  | 'identity'
  | 'input'
  | 'trained'
  | 'activation'
  | 'output'
  | 'async';

export interface Layer {
  id: LayerId;
  name: string;
  blurb: string;
  /** reroutes instead of hard-blocking (e.g. flagged cyber -> weaker model) */
  reroutes?: boolean;
}

export const LAYERS: Layer[] = [
  { id: 'identity', name: 'Identity & access tier', blurb: 'Who is asking; trusted-access tiers unlock capability.' },
  { id: 'input', name: 'Input screening', blurb: 'Prompt & injection classifiers on the incoming request.' },
  { id: 'trained', name: 'Safety-trained model', blurb: 'Refusal behavior trained in via a spec/constitution.' },
  { id: 'activation', name: 'Activation monitor', blurb: 'Probes internal activations; can halt output mid-stream.' },
  { id: 'output', name: 'Output screening', blurb: 'Classifies the answer in context; can reroute.', reroutes: true },
  { id: 'async', name: 'Async review & enforcement', blurb: 'Offline monitoring; account-level action later.' },
];

export type Outcome = 'blocked' | 'rerouted' | 'flagged' | 'allowed';

export interface Scenario {
  id: string;
  label: string;
  family: string;
  intent: 'benign' | 'dual-use' | 'malicious';
  detail: string;
  /**
   * For each layer: does this layer act on this request when enabled?
   * 'stop' = blocks/halts, 'reroute' = sends to weaker model, 'flag' = logs for async,
   * undefined = passes through untouched.
   */
  layerActs: Partial<Record<LayerId, 'stop' | 'reroute' | 'flag'>>;
  /** If NO layer acts, what happens — and is that the right outcome? */
  ifUnguarded: 'harm' | 'fine';
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'benign-college',
    label: 'College chemistry homework question',
    family: 'Benign lookup',
    intent: 'benign',
    detail: 'A textbook-level question with no operational uplift. The right answer is to help.',
    layerActs: {},
    ifUnguarded: 'fine',
  },
  {
    id: 'benign-defender',
    label: 'Defender: "explain this CVE so I can patch it"',
    family: 'Benign security work',
    intent: 'benign',
    detail: 'Legitimate defensive work. Over-eager input screening may wrongly flag it — the over-refusal cost.',
    layerActs: { input: 'flag' },
    ifUnguarded: 'fine',
  },
  {
    id: 'dual-pentest',
    label: 'Dual-use: full exploit for a named target',
    family: 'Cyber (dual-use)',
    intent: 'dual-use',
    detail: 'Vulnerability discovery may be allowed; exploit development is rerouted to a weaker model in current stacks.',
    layerActs: { identity: 'reroute', input: 'flag', output: 'reroute' },
    ifUnguarded: 'harm',
  },
  {
    id: 'jailbreak-persona',
    label: 'Jailbreak: persona / role-play wrapper',
    family: 'Jailbreak',
    intent: 'malicious',
    detail: 'A role-play frame around a disallowed request. Trained refusal often holds; classifiers back it up.',
    layerActs: { trained: 'stop', input: 'flag' },
    ifUnguarded: 'harm',
  },
  {
    id: 'jailbreak-obfusc',
    label: 'Jailbreak: encoded / obfuscated request',
    family: 'Jailbreak (obfuscation)',
    intent: 'malicious',
    detail: 'Encoding slips past naive string filters; an activation monitor reads intent that surface text hides.',
    layerActs: { activation: 'stop', output: 'stop' },
    ifUnguarded: 'harm',
  },
  {
    id: 'output-obfusc',
    label: 'Output-obfuscation (harm hidden in "safe-looking" output)',
    family: 'Output obfuscation',
    intent: 'malicious',
    detail: 'Input looks benign; harm is smuggled into the answer. Only in-context output screening reliably catches it.',
    layerActs: { output: 'stop', async: 'flag' },
    ifUnguarded: 'harm',
  },
  {
    id: 'injection-indirect',
    label: 'Indirect injection via a retrieved document',
    family: 'Prompt injection',
    intent: 'malicious',
    detail: 'Instruction hidden in untrusted content (see M4). Input screening on tool/RAG content is the main catch.',
    layerActs: { input: 'stop', async: 'flag' },
    ifUnguarded: 'harm',
  },
  {
    id: 'agent-escape',
    label: 'Agent tries an action beyond the user’s intent',
    family: 'Agentic misalignment',
    intent: 'malicious',
    detail: 'The agent itself is the risk (see M14). Activation/behavior monitors and async enforcement matter most.',
    layerActs: { activation: 'stop', async: 'flag' },
    ifUnguarded: 'harm',
  },
];

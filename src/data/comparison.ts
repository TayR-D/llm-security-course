/**
 * M17 · Guardrail comparison matrix — data.
 * Three providers across the M17 dimensions. Every cell carries an evidence tag
 * and a primary source. Tags: 'documented' (provider states it), 'observed'
 * (independent evaluation), 'inferred' (our reading). Update `verified` when a
 * cell is re-checked. This is the single source of truth for the matrix; the
 * lesson text should not restate these values.
 */

export type Evidence = 'documented' | 'observed' | 'inferred';

export interface Source {
  title: string;
  url: string;
}

export interface Cell {
  value: string;
  evidence: Evidence;
  source: Source;
  verified: string; // ISO date this cell was last checked
}

export interface Dimension {
  id: string;
  name: string;
  blurb: string;
}

export interface Provider {
  id: string;
  name: string;
  flagship: string;
  openWeight: boolean;
}

export const DIMENSIONS: Dimension[] = [
  { id: 'policy-source', name: 'Policy source', blurb: 'The document the model’s behavior is trained against.' },
  { id: 'runtime', name: 'Runtime classifiers', blurb: 'What screens traffic at inference time.' },
  { id: 'flag-response', name: 'Response to a flag', blurb: 'Refuse, safe-complete, or reroute.' },
  { id: 'access-tiers', name: 'Access tiers', blurb: 'How verified identity unlocks more capability.' },
  { id: 'agent-defense', name: 'Agent / injection defense', blurb: 'Protections once the model can act.' },
  { id: 'framework', name: 'Frontier framework', blurb: 'The capability-threshold governance policy.' },
  { id: 'configurability', name: 'Developer configurability', blurb: 'What builders can tune.' },
  { id: 'jurisdiction', name: 'Jurisdiction drivers', blurb: 'Laws shaping the policy.' },
];

export const PROVIDERS: Provider[] = [
  { id: 'anthropic', name: 'Anthropic', flagship: 'Claude Fable 5.1 / Mythos 5.1', openWeight: false },
  { id: 'openai', name: 'OpenAI', flagship: 'GPT-5.6 (Sol / Terra / Luna)', openWeight: false },
  { id: 'google', name: 'Google', flagship: 'Gemini 3.8 Flash / Flash Cyber', openWeight: false },
];

const S = {
  fable51: { title: 'Introducing Claude Fable 5.1 and Mythos 5.1 (Anthropic, Sep 2026)', url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1' },
  ccpp: { title: 'Next-generation Constitutional Classifiers (Anthropic, Jan 2026)', url: 'https://www.anthropic.com/research/next-generation-constitutional-classifiers' },
  rsp: { title: 'Responsible Scaling Policy v3.0 (Anthropic, Feb 2026)', url: 'https://anthropic.com/news/responsible-scaling-policy-v3' },
  gpt56: { title: 'GPT-5.6 System Card (OpenAI, Jul 2026)', url: 'https://deploymentsafety.openai.com/gpt-5-6' },
  tac: { title: 'Scaling Trusted Access for Cyber (OpenAI)', url: 'https://openai.com/index/gpt-5-5-with-trusted-access-for-cyber/' },
  cyberChecks: { title: 'Cybersecurity checks (OpenAI API docs)', url: 'https://developers.openai.com/api/docs/guides/safety-checks/cybersecurity' },
  fsf: { title: 'Strengthening the Frontier Safety Framework (Google DeepMind, Apr 2026)', url: 'https://deepmind.google/blog/strengthening-our-frontier-safety-framework/' },
  fairwind: { title: 'Google, Anthropic, OpenAI unveil cyber AI models (The Hacker News, Sep 2026)', url: 'https://thehackernews.com/2026/09/google-anthropic-and-openai-unveil.html' },
  gemSafety: { title: 'Gemini API safety settings (Google)', url: 'https://ai.google.dev/gemini-api/docs/safety-settings' },
} as const;

// matrix[dimensionId][providerId] = Cell
export const MATRIX: Record<string, Record<string, Cell>> = {
  'policy-source': {
    anthropic: { value: 'Constitution + Usage Policy; classifiers trained on a written constitution', evidence: 'documented', source: S.ccpp, verified: '2026-09-29' },
    openai: { value: 'Model Spec + Usage Policies; safety-trained via RL over policy', evidence: 'documented', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'Safety policies + Frontier Safety Framework; configurable harm categories', evidence: 'documented', source: S.fsf, verified: '2026-09-29' },
  },
  runtime: {
    anthropic: { value: 'Constitutional Classifiers++: activation probe screens all traffic, escalates to an exchange classifier (~1% compute)', evidence: 'documented', source: S.ccpp, verified: '2026-09-29' },
    openai: { value: 'Activation classifiers on Sol/Terra that can halt generation; real-time output scanning', evidence: 'documented', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'Configurable safety filters per harm category; Flash Cyber gated separately', evidence: 'documented', source: S.gemSafety, verified: '2026-09-29' },
  },
  'flag-response': {
    anthropic: { value: 'Reroute: flagged cyber → Opus 4.8, biology → Opus 5, rather than refuse', evidence: 'documented', source: S.fable51, verified: '2026-09-29' },
    openai: { value: 'Block, or offer retry on a lower-capability model; API returns cyber_policy error', evidence: 'documented', source: S.cyberChecks, verified: '2026-09-29' },
    google: { value: 'Block per configured threshold; sensitive cyber capability withheld from the general model', evidence: 'inferred', source: S.fairwind, verified: '2026-09-29' },
  },
  'access-tiers': {
    anthropic: { value: 'Mythos 5.1 via Cyber Verification Program & Life Sciences Verification Program (vetted)', evidence: 'documented', source: S.fable51, verified: '2026-09-29' },
    openai: { value: 'Trusted Access for Cyber; GPT-5.5-Cyber for vetted defenders; per-user safety identifiers', evidence: 'documented', source: S.tac, verified: '2026-09-29' },
    google: { value: 'Gemini 3.8 Flash Cyber to vetted defenders via the Fairwind Program (~650 partners)', evidence: 'documented', source: S.fairwind, verified: '2026-09-29' },
  },
  'agent-defense': {
    anthropic: { value: 'Most robust to date on an external prompt-injection benchmark; sandbox-escape classifier after 2026 incidents', evidence: 'documented', source: S.fable51, verified: '2026-09-29' },
    openai: { value: 'High connector-injection robustness reported; Astra hardened after an eval-infra escape', evidence: 'documented', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'Flash Cyber prioritizes vulnerability-fixing over exploitation; details limited', evidence: 'inferred', source: S.fairwind, verified: '2026-09-29' },
  },
  framework: {
    anthropic: { value: 'Responsible Scaling Policy v3 (ASLs) + separate Frontier Compliance Framework for law', evidence: 'documented', source: S.rsp, verified: '2026-09-29' },
    openai: { value: 'Preparedness Framework; GPT-5.6 rated High cyber & bio, below Critical', evidence: 'documented', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'Frontier Safety Framework 3.1 with Critical & Tracked Capability Levels (Apr 2026)', evidence: 'documented', source: S.fsf, verified: '2026-09-29' },
  },
  configurability: {
    anthropic: { value: 'Limited runtime tuning; Enterprise Frontier Safeguards for ZDR customers', evidence: 'documented', source: S.fable51, verified: '2026-09-29' },
    openai: { value: 'Developer confirmation policies for computer use; safety_identifier per end-user', evidence: 'documented', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'Per-harm-category thresholds adjustable via the Gemini API', evidence: 'documented', source: S.gemSafety, verified: '2026-09-29' },
  },
  jurisdiction: {
    anthropic: { value: 'EU Code of Practice (incl. content-watermarking); California SB 53; NY RAISE Act', evidence: 'documented', source: S.fable51, verified: '2026-09-29' },
    openai: { value: 'Frontier Governance Framework as its SB 53 document; EU obligations', evidence: 'inferred', source: S.gpt56, verified: '2026-09-29' },
    google: { value: 'EU GPAI Code; California SB 53 & EO N-9-26; US federal pre-release review', evidence: 'inferred', source: S.fsf, verified: '2026-09-29' },
  },
};

export const EVIDENCE_META: Record<Evidence, { label: string; pill: 'good' | 'warn' | 'bad' }> = {
  documented: { label: 'Documented', pill: 'good' },
  observed: { label: 'Observed', pill: 'warn' },
  inferred: { label: 'Inferred', pill: 'warn' },
};

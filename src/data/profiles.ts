/**
 * M16 · Provider profiles — data.
 * One profile per provider on a FIXED template, so they're comparable. Sourced
 * where stated; fields we infer are marked in the text. Verified 2026-10-01.
 * This is the single source of truth for the M16 component.
 */

export interface Profile {
  id: string;
  name: string;
  flagship: string;
  openWeight: boolean;
  policySource: string;
  training: string;
  runtime: string;
  devConfig: string;
  agentDefense: string;
  accessTiers: string;
  framework: string;
  evals: string;
  incidents: string;
  sources: { label: string; url: string }[];
}

export const PROFILES: Profile[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    flagship: 'Claude Fable 5.1 / Mythos 5.1',
    openWeight: false,
    policySource: 'Written constitution + Usage Policy; classifiers trained from the same constitution.',
    training: 'Constitutional AI (RLAIF), refusal training, instruction-hierarchy, reasoning RL.',
    runtime: 'Constitutional Classifiers++: activation probe on all traffic, escalates to an exchange classifier (~1% compute, 0.05% harmless-refusal rate).',
    devConfig: 'Limited runtime tuning; Enterprise Frontier Safeguards give misuse detection with zero-data-retention privacy.',
    agentDefense: 'Most robust to date on an external prompt-injection benchmark; sandbox-escape classifier added after 2026 incidents.',
    accessTiers: 'Fable 5.1 general; Mythos 5.1 for vetted orgs via Cyber Verification Program & Life Sciences Verification Program. Flagged cyber reroutes to Opus 4.8, biology to Opus 5.',
    framework: 'Responsible Scaling Policy v3 (ASLs) + separate Frontier Compliance Framework for law.',
    evals: 'System card + risk reports; external testing by UK AISI/CAISI and Gray Swan.',
    incidents: 'Paused external cyber evals of pre-release models after agents acted on real systems; built a sandbox-escape classifier and hardened reward specs.',
    sources: [
      { label: 'Fable 5.1 / Mythos 5.1 (Sep 2026)', url: 'https://www.anthropic.com/claude-fable-and-mythos-5-1' },
      { label: 'Constitutional Classifiers++ (Jan 2026)', url: 'https://www.anthropic.com/research/next-generation-constitutional-classifiers' },
      { label: 'RSP v3 (Feb 2026)', url: 'https://anthropic.com/news/responsible-scaling-policy-v3' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    flagship: 'GPT-5.6 (Sol / Terra / Luna)',
    openWeight: false,
    policySource: 'Model Spec + Usage Policies; safety trained via RL over policy.',
    training: 'Reasoning RL with safety training; instruction hierarchy; metagaming/CoT research.',
    runtime: 'Activation classifiers on Sol/Terra that can halt generation mid-stream; real-time output scanning; cross-conversation pattern detection.',
    devConfig: 'Developer confirmation policies for computer use; per-end-user safety_identifier; API cyber_policy errors on flagged traffic.',
    agentDefense: 'High connector prompt-injection robustness reported; Astra hardened after an ExploitGym eval-infra escape.',
    accessTiers: 'Trusted Access for Cyber; GPT-5.5-Cyber for vetted defenders; retry on a lower-capability model when blocked.',
    framework: 'Preparedness Framework (Low/Med/High/Critical); GPT-5.6 rated High cyber & bio; Frontier Governance Framework as its SB 53 document.',
    evals: 'Deployment Safety Hub system cards; 700k+ GPU-hours automated red-teaming; UK AISI external tests.',
    incidents: 'Agents in an ExploitGym evaluation broke into real infrastructure; added classifiers and layered protections for Astra.',
    sources: [
      { label: 'GPT-5.6 System Card (Jul 2026)', url: 'https://deploymentsafety.openai.com/gpt-5-6' },
      { label: 'Trusted Access for Cyber', url: 'https://openai.com/index/gpt-5-5-with-trusted-access-for-cyber/' },
    ],
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    flagship: 'Gemini 3.8 Flash / Flash Cyber',
    openWeight: false,
    policySource: 'Safety policies + Frontier Safety Framework; configurable harm categories.',
    training: 'Safety fine-tuning; Secure AI Framework (SAIF) practices.',
    runtime: 'Configurable safety filters per harm category; Model Armor; Flash Cyber gated separately.',
    devConfig: 'Per-harm-category thresholds adjustable via the Gemini API — the most developer-tunable of the three.',
    agentDefense: 'Flash Cyber prioritizes vulnerability-fixing over exploitation; agent-specific details limited.',
    accessTiers: 'Gemini 3.8 Flash Cyber to vetted defenders via the Fairwind Program (~650 partners incl. gov, healthcare, telecom).',
    framework: 'Frontier Safety Framework 3.1 with Critical (CCL) and Tracked (TCL) Capability Levels; safety-case review before launch.',
    evals: 'Model cards + FSF evaluations; alert thresholds set below CCLs as early warning.',
    incidents: 'No specific escape incident disclosed in the reviewed sources; focus stated on defender-advantage capabilities.',
    sources: [
      { label: 'FSF 3.1 (Apr 2026)', url: 'https://deepmind.google/blog/strengthening-our-frontier-safety-framework/' },
      { label: 'Fairwind + cyber models (Sep 2026)', url: 'https://thehackernews.com/2026/09/google-anthropic-and-openai-unveil.html' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    flagship: 'Llama family (open weight) + Llama Protections',
    openWeight: true,
    policySource: 'Acceptable Use Policy + Advanced AI Scaling Framework; Llama Community License.',
    training: 'Safety fine-tuning in the base release; the heavy lifting is left to system-level tools you add.',
    runtime: 'Not in the base model — you deploy the Llama Protections stack: Llama Guard (content), Prompt Guard 2 (injection), Code Shield (insecure code), LlamaFirewall (agent guardrails incl. AlignmentCheck).',
    devConfig: 'Fully yours: open weights mean you define, layer and tune every safeguard — and can also remove them.',
    agentDefense: 'LlamaFirewall AlignmentCheck audits an agent’s reasoning for goal hijacking; PromptGuard 2 screens inputs.',
    accessTiers: 'No provider-side access tiers — distribution is open. Control is whatever the deployer imposes.',
    framework: 'Advanced AI Scaling Framework v2 (chem-bio, cyber, loss of control); Safety & Preparedness Reports.',
    evals: 'Published Safety & Preparedness Reports (e.g. Muse Spark) with external input.',
    incidents: 'Open-weight risk is structural: refusal can be fine-tuned away or an “abliterated” build published; no runtime layer travels with the weights.',
    sources: [
      { label: 'Advanced AI Scaling Framework v2', url: 'https://ai.meta.com/static-resource/Meta_Advanced-AI-Scaling-Framework-v2' },
      { label: 'LlamaFirewall (2025)', url: 'https://ai.meta.com/research/publications/llamafirewall-an-open-source-guardrail-system-for-building-secure-ai-agents/' },
    ],
  },
  {
    id: 'openweight',
    name: 'Chinese open-weight labs',
    flagship: 'DeepSeek, Qwen (incl. Qwen3Guard)',
    openWeight: true,
    policySource: 'China’s generative-AI measures shape the hosted service; the open weights carry only trained-in behavior.',
    training: 'Safety fine-tuning in the release; Qwen also ships a dedicated guard model family.',
    runtime: 'None travels with downloaded weights. Qwen3Guard (0.6B/4B/8B, multilingual, three-level severity, Apache-2.0) is a strong open guard you can add — and it benchmarks well on recall.',
    devConfig: 'Fully yours; the guard models take a policy at runtime.',
    agentDefense: 'Deployer-provided; no provider-side agent protections on the weights.',
    accessTiers: 'None on the weights. The hosted APIs apply their own jurisdiction-specific filters.',
    framework: 'Hosted services follow Chinese regulatory requirements; no Western-style frontier framework on the open weights.',
    evals: 'Independent guard-model benchmarks (e.g. Qwen3Guard’s recall) rather than first-party frontier risk reports.',
    incidents: 'Same structural open-weight risk as any downloadable model: safeguards are the deployer’s responsibility.',
    sources: [
      { label: 'Qwen3Guard (open guard model)', url: 'https://huggingface.co/Qwen' },
      { label: 'Guardrail benchmark (Apr 2026)', url: 'https://artificialanalysis.ai/articles/guardrail-safety-benchmark' },
    ],
  },
];

export const FIELDS: { key: keyof Profile; label: string }[] = [
  { key: 'policySource', label: 'Policy source' },
  { key: 'training', label: 'Training approach' },
  { key: 'runtime', label: 'Runtime classifiers' },
  { key: 'devConfig', label: 'Developer configurability' },
  { key: 'agentDefense', label: 'Agent / injection defense' },
  { key: 'accessTiers', label: 'Access tiers' },
  { key: 'framework', label: 'Frontier framework' },
  { key: 'evals', label: 'Published evaluations' },
  { key: 'incidents', label: 'Incidents & what changed' },
];

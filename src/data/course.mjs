// Single source of truth for course structure. Drives the sidebar
// (astro.config.mjs), the lesson header meta, and the home-page route.

export const TOTAL_MODULES = 19;

export const PARTS = [
  {
    id: 'foundations',
    roman: 'I',
    name: 'Foundations',
    goal: 'Build the mental model: why a model cannot reliably tell instructions from data.',
    modules: [
      { n: 1, slug: 'foundations/orientation', title: 'Orientation and threat model' },
      { n: 2, slug: 'foundations/tokens-and-filters', title: 'Tokens, filters and encodings' },
      { n: 3, slug: 'foundations/training-and-alignment', title: 'Training and alignment' },
      { n: 4, slug: 'foundations/context-window', title: 'The context window is one string' },
      { n: 5, slug: 'foundations/apps-agents-mcp', title: 'Apps, agents and MCP' },
    ],
  },
  {
    id: 'attacks',
    roman: 'II',
    name: 'The attack landscape',
    goal: 'Classify any jailbreak or injection by the mechanism it exploits.',
    modules: [
      { n: 6, slug: 'attacks/frameworks', title: 'Frameworks and taxonomies' },
      { n: 7, slug: 'attacks/jailbreaks', title: 'Jailbreaks' },
      { n: 8, slug: 'attacks/prompt-injection', title: 'Prompt injection and agent hijacking' },
      { n: 9, slug: 'attacks/supply-chain', title: 'Model, data and supply-chain threats' },
    ],
  },
  {
    id: 'defenses',
    roman: 'III',
    name: 'How providers defend',
    goal: 'Take the provider safeguard stack apart, layer by layer.',
    modules: [
      { n: 10, slug: 'defenses/defense-in-depth', title: 'Defense in depth' },
      { n: 11, slug: 'defenses/training-time', title: 'Training-time safeguards' },
      { n: 12, slug: 'defenses/inference-time', title: 'Inference-time guardrails' },
      { n: 13, slug: 'defenses/access-identity', title: 'Access, identity and platform controls' },
      { n: 14, slug: 'defenses/inward-facing', title: 'Safeguards that face inward' },
      { n: 15, slug: 'defenses/frameworks-governance', title: 'Frontier safety frameworks' },
    ],
  },
  {
    id: 'compared',
    roman: 'IV',
    name: 'Guardrails compared',
    goal: 'See why the same request meets a different wall on every model.',
    modules: [
      { n: 16, slug: 'compared/provider-profiles', title: 'Provider profiles' },
      { n: 17, slug: 'compared/why-guardrails-differ', title: 'Why guardrails differ' },
      { n: 18, slug: 'compared/deployable-guardrails', title: 'Guardrails you can deploy' },
    ],
  },
  {
    id: 'practice',
    roman: 'V',
    name: 'Practice',
    goal: 'Measure a guardrail stack, then design your own.',
    modules: [
      { n: 19, slug: 'practice/evaluating-guardrails', title: 'Evaluating and red-teaming' },
      { n: null, slug: 'practice/capstone', title: 'Capstone: guard a research platform' },
    ],
  },
];

export function findModule(slug) {
  for (const part of PARTS) {
    const m = part.modules.find((x) => x.slug === slug);
    if (m) return { part, module: m };
  }
  return null;
}

export function sidebar() {
  return PARTS.map((part) => ({
    label: part.name,
    items: part.modules.map((m) => ({
      label: m.n ? `${m.n}. ${m.title}` : m.title,
      slug: m.slug,
    })),
  }));
}

// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';

// Deployed under a subpath on GitHub Pages, at the root on Vercel/Netlify.
// Override at build time with:  SITE=https://example.com BASE=/ npm run build
const SITE = process.env.SITE ?? 'https://example.com';
const BASE = process.env.BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [
    react(),
    starlight({
      title: 'Inside the Guardrails',
      description:
        'An interactive course on LLM security and how frontier providers prevent misuse of their models.',
      lastUpdated: true,
      customCss: ['./src/styles/theme.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/TayR-D' },
      ],
      sidebar: [
        {
          label: 'Start here',
          items: [{ label: 'About this course', slug: 'index' }],
        },
        {
          label: 'I · Foundations',
          items: [
            { label: 'M1 · Orientation & threat model', slug: 'foundations/orientation', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M2 · Tokens, filters & encodings', slug: 'foundations/tokens-and-filters', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M3 · Training & alignment', slug: 'foundations/training-and-alignment', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M4 · The context window is one string', slug: 'foundations/context-window', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M5 · Apps, agents & MCP', slug: 'foundations/apps-agents-mcp', badge: { text: 'interactive', variant: 'tip' } },
          ],
        },
        {
          label: 'II · The attack landscape',
          items: [
            { label: 'M6 · Frameworks & taxonomies', slug: 'attacks/frameworks', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M7 · Jailbreaks', slug: 'attacks/jailbreaks', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M8 · Prompt injection & agent hijacking', slug: 'attacks/prompt-injection', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M9 · Model, data & supply-chain threats', slug: 'attacks/supply-chain', badge: { text: 'interactive', variant: 'tip' } },
          ],
        },
        {
          label: 'III · How providers defend',
          items: [
            { label: 'M10 · Defense in depth', slug: 'defenses/defense-in-depth', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M11 · Training-time safeguards', slug: 'defenses/training-time', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M12 · Inference-time guardrails', slug: 'defenses/inference-time', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M13 · Access, identity & platform', slug: 'defenses/access-identity', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M14 · Safeguards that face inward', slug: 'defenses/inward-facing', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M15 · Frameworks & governance', slug: 'defenses/frameworks-governance', badge: { text: 'interactive', variant: 'tip' } },
          ],
        },
        {
          label: 'IV · Guardrails compared',
          items: [
            { label: 'M16 · Provider profiles', slug: 'compared/provider-profiles', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M17 · Why guardrails differ', slug: 'compared/why-guardrails-differ', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'M18 · Guardrails you can deploy', slug: 'compared/deployable-guardrails', badge: { text: 'interactive', variant: 'tip' } },
          ],
        },
        {
          label: 'V · Practice',
          items: [
            { label: 'M19 · Evaluating & red-teaming', slug: 'practice/evaluating-guardrails', badge: { text: 'interactive', variant: 'tip' } },
            { label: 'Capstone · Guard a platform', slug: 'practice/capstone', badge: { text: 'capstone', variant: 'caution' } },
          ],
        },
      ],
    }),
  ],
});

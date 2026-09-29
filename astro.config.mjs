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
            {
              label: 'M4 · The context window is one string',
              slug: 'foundations/context-window',
              badge: { text: 'interactive', variant: 'tip' },
            },
          ],
        },
        {
          label: 'III · How providers defend',
          items: [
            {
              label: 'M10 · Defense in depth',
              slug: 'defenses/defense-in-depth',
              badge: { text: 'interactive', variant: 'tip' },
            },
          ],
        },
        {
          label: 'IV · Guardrails compared',
          items: [
            {
              label: 'M17 · Why guardrails differ',
              slug: 'compared/why-guardrails-differ',
              badge: { text: 'interactive', variant: 'tip' },
            },
          ],
        },
      ],
    }),
  ],
});

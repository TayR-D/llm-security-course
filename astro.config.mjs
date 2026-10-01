// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import { sidebar } from './src/data/course.mjs';

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
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
      },
      lastUpdated: true,
      customCss: [
        '@fontsource-variable/overpass',
        '@fontsource/overpass-mono/400.css',
        '@fontsource/overpass-mono/600.css',
        './src/styles/theme.css',
      ],
      components: {
        Hero: './src/components/overrides/Hero.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
      },
      social: [
        { icon: 'github', label: 'Source on GitHub', href: 'https://github.com/TayR-D/llm-security-course' },
      ],
      sidebar: [
        { label: 'Course overview', slug: 'index' },
        ...sidebar(),
      ],
    }),
  ],
});

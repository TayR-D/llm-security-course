# Inside the Guardrails

An interactive course on LLM security and how frontier providers prevent misuse of their
models — taught by mechanism, not payload. Built with [Astro](https://astro.build) +
[Starlight](https://starlight.astro.build), with React islands for the interactives.

This repository is the **Phase 1 vertical slice**: the site shell plus three flagship
interactives, one from each layer of the course.

| Module | Lesson | Interactive |
| --- | --- | --- |
| M4 · The context window is one string | `foundations/context-window` | Context Flattener |
| M10 · Defense in depth | `defenses/defense-in-depth` | Guardrail Stack Simulator |
| M17 · Why guardrails differ | `compared/why-guardrails-differ` | Comparison Matrix |

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into ./dist
npm run preview  # serve the built site
```

Node 20+ recommended (built and tested on Node 22).

## Deploy

The build is fully static (`./dist`) and hosts anywhere.

- **Vercel / Netlify (root domain):** import the repo; framework preset "Astro"; no env
  vars needed. Every push publishes a preview.
- **GitHub Pages (subpath):** build with the base path set —
  `SITE=https://<user>.github.io BASE=/<repo>/ npm run build` — then publish `./dist`.

`astro.config.mjs` reads `SITE` and `BASE` from the environment so the same repo deploys to
either without edits.

## How it's built to stay current

- Provider claims are **data, not prose**. The comparison matrix reads from
  `src/data/comparison.ts`; the stack simulator from `src/data/stackScenarios.ts`. A
  refresh edits data, not lessons.
- Every matrix cell carries an **evidence tag** (Documented / Observed / Inferred), a
  **primary source** link, and a **last-verified date**.
- Interactives are **illustrative models** of documented behavior, labeled as such — never
  measurements, never working payloads.

## Structure

```
src/
  components/     React islands (the interactives)
  content/docs/   Lesson pages (.mdx), one folder per course part
  data/           Source-of-truth data for the interactives
  styles/         Shared theme + widget styles (light/dark)
astro.config.mjs  Starlight config: title, sidebar, integrations
```

## Status

Phase 1 of 6. The remaining 16 modules, the labs, and the guardrail CTF follow the build
roadmap in the planning doc. Optional pieces deferred to later phases: Docker-based guard-model
labs, an in-browser classifier, and live labs against a self-hosted platform.

## License

Content and code © the author. Provider names, logos, and cited material belong to their
respective owners; citations are for education and point to each provider's own primary
sources.

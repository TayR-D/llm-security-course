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

## Design system

The UI follows one direction: highway engineering. Quiet, legible infrastructure with one
high-visibility colour.

- **Type:** Overpass (the open descendant of the US Highway Gothic signage face), bundled
  locally via Fontsource. Overpass Mono only for real code and token streams.
- **Colour:** slate ink, porcelain surfaces, cobalt for anything you can act on. Safety
  yellow is reserved for the guardrail mark. Allow, reroute and block colours carry meaning
  only: a benign request correctly allowed is green, a harmful one let through is red.
- **Panels:** every interactive uses the same shell in `src/styles/theme.css`:
  `<div className="wg not-content">`, an `<h3 data-kind="…">` header, a `wg-note` lede, and a
  `wg-banner` footer that says what the model is. `not-content` keeps article styles out.
- **Structure:** `src/data/course.mjs` is the single source for part and module numbering. It
  drives the sidebar, the lesson header and the home-page route.
- **Overrides:** `src/components/overrides/` replaces Starlight's Hero and PageTitle.

## Status

All planned phases complete — 19 modules + capstone, 22 pages, 14 interactives.

- **Part I — Foundations:** M1–M5
- **Part II — Attack landscape:** M6–M9
- **Part III — How providers defend:** M10–M15
- **Part IV — Guardrails compared:** M16–M18
- **Part V — Practice:** M19 + capstone (design checklist)
- Interactive quizzes on the flagship modules; a reusable `Quiz` component for the rest.

Optional, deferred (need Docker + model access / a host machine): a guard-model labs
repo, an in-browser classifier, and a guardrail CTF. See the planning doc for the roadmap.


## License

Content and code © the author. Provider names, logos, and cited material belong to their
respective owners; citations are for education and point to each provider's own primary
sources.

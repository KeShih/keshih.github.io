# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Build Commands

```bash
npm run build      # Build site to _site/
npm run serve      # Dev server with live reload (http://localhost:8080)
npm run typecheck  # Type-check the TypeScript sources (tsc, no emit)
npm run clean      # Remove _site/
```

No test suite or linter is configured. `npm run typecheck` is the closest thing to a static check.

## Architecture

This is an academic personal website built with Eleventy 3 (ESM + TypeScript). It started as a fork of [chaoxu.github.io](https://github.com/chaoxu/chaoxu.github.io); the blog posts, pages, and blog templates inherited from that fork (Chao Xu's writing, still at chaoxu.prof) were removed, so the site is now the homepage only.

### TypeScript Setup

The config, plugins, and data files are TypeScript, run directly (no build artifacts) via the [`tsx`](https://tsx.is) loader:

- `npm run build`/`serve` set `NODE_OPTIONS="--import tsx"` and pass `--config=eleventy.config.ts` (Eleventy 3 does not auto-discover a `.ts` config file, so it must be named explicitly).
- Type-only checking is `tsc` (`tsconfig.json`, `noEmit`, strict). `tsx` strips types at runtime; it does not type-check, so run `npm run typecheck` for that.
- Eleventy ships no types, so `eleventy.config.ts` declares a minimal local `EleventyConfig` interface for the API it uses.
- Because Eleventy only auto-discovers `.js/.cjs/.mjs` global-data files, `eleventy.config.ts` registers `ts` via `addDataExtension("ts", { read: false, … })` so `src/_data/*.ts` (`publications.ts`, `sitemap.ts`) are imported as modules.

### Pages

- `src/index.njk` — the homepage with the publications list (a standalone template, no layout). KaTeX renders math client-side using the macros defined in it.
- `src/404.njk` — the page GitHub Pages serves for unknown paths (`noindex`).
- `src/sitemap.njk` — `/sitemap.xml` (see below).

Output goes to `_site/`, deployed to GitHub Pages by `.github/workflows/deploy.yml`.

`plugins/math.ts` is a markdown-it plugin used by `src/_data/publications.ts`: it turns `$...$` and `$$...$$` in paper titles, notes, and abstracts into `<span class="math">` elements for KaTeX.

### Publications Data

`src/_data/pub.yaml` is a multi-document YAML file. The first document defines metadata (venues, people links, publication types). Subsequent documents are individual papers. `src/_data/publications.ts` processes this into template data, rendering math in titles/abstracts.

On the homepage both the paper title and the document icon link to the paper's PDF (`pdfHref`: the paper's `pdf` field if set, else `files/papers/<id>.pdf`), so search engines see the full title as the text of the link to the PDF. Google also shows a PDF's Title metadata in search results and browsers show it in the tab, so every PDF in `static/files/papers` and `static/files/presentations` should carry its title and authors: set `\hypersetup{pdftitle={...}, pdfauthor={...}}` in the LaTeX source before building it (check with `pdfinfo`).

### Static Assets

`static/` is copied to the site root via passthrough copy. Contains CSS, PDFs (papers, presentations, CV), and images.

`src/sitemap.njk` renders `/sitemap.xml` from `src/_data/sitemap.ts`: the homepage, the CV, and every PDF in `static/files/papers` and `static/files/presentations`, with `lastmod` taken from git commit dates. The deploy checks out the full history for this, and a shallow clone omits `lastmod`. `static/robots.txt` points crawlers to the sitemap.

The CV source lives in the private `KeShih/CV` repo (`en.tex`, `zh.tex` and a shared `cv.sty`; `make en` builds `CV-en.pdf` at that repo's root). When the `CV_TOKEN` Actions secret holds a read-only token for that repo, the deploy workflow publishes its `CV-en.pdf` in place of `static/files/CV-en.pdf`; without the secret, or if the fetch fails, the committed copy is published.

## Deployment and Branching

- `develop` — active development branch and current production deployment trigger. Pushes to `develop` run the `Deploy to GitHub Pages` GitHub Actions workflow, which builds `_site/` and deploys it with `actions/deploy-pages`.
- `master` — legacy branch. GitHub Pages is currently configured for workflow-based deployments, so pushing only to `master` does not deploy the site unless the workflow trigger is changed.
- `upstream` remote points to the original chaoxu.github.io repo

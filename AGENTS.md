# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Build Commands

```bash
npm run build      # Build site to _site/
npm run serve      # Dev server with live reload (http://localhost:8080)
npm run clean      # Remove _site/
```

No test suite or linter is configured.

## Architecture

This is an academic personal website built with Eleventy 3 (ESM). It's a fork of [chaoxu.github.io](https://github.com/chaoxu/chaoxu.github.io) adapted for Ke Shi.

### Content Pipeline

- Source lives in `src/` with Nunjucks templates and Markdown posts
- `eleventy.config.js` configures a custom markdown-it instance with three plugins from `plugins/`
- Output goes to `_site/`, deployed to GitHub Pages by `.github/workflows/deploy.yml`

### Custom Markdown Plugins (`plugins/`)

All three are markdown-it plugins registered in `eleventy.config.js`:

- **math.js** — Parses `$...$` (inline) and `$$...$$` (block) into `<span class="math">` elements. KaTeX renders them client-side using macros defined in `src/index.njk`.
- **theorem-environments.js** — Fenced div syntax (`::: Theorem`, `::: Proof`, etc.) with auto-numbering and cross-references via `[@id]`. Supports both English and Chinese environment names.
- **citations.js** — Parses `[@cite-key]` against `reference.bib` (BibTeX), renders inline citations and appends a References section using `bib_style.csl`.

### Content Collections

- `src/posts/*.md` — English blog posts (layout: `layouts/post.njk`)
- `src/cnposts/*.md` — Chinese blog posts (layout: `layouts/cnpost.njk`)
- `src/pages/*.md` — Standalone pages
- `src/index.njk` — Homepage with publications list (not a layout, renders directly)

### Publications Data

`src/_data/pub.yaml` is a multi-document YAML file. The first document defines metadata (venues, people links, publication types). Subsequent documents are individual papers. `src/_data/publications.js` processes this into template data, rendering math in titles/abstracts.

### Static Assets

`static/` is copied to the site root via passthrough copy. Contains CSS, PDFs (papers, presentations, CV), and images.

## Deployment and Branching

- `develop` — active development branch and current production deployment trigger. Pushes to `develop` run the `Deploy to GitHub Pages` GitHub Actions workflow, which builds `_site/` and deploys it with `actions/deploy-pages`.
- `master` — legacy branch. GitHub Pages is currently configured for workflow-based deployments, so pushing only to `master` does not deploy the site unless the workflow trigger is changed.
- `upstream` remote points to the original chaoxu.github.io repo

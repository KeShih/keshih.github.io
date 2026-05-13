# keshi.pro

Personal academic website for Ke Shi, built with [Eleventy](https://www.11ty.dev/). Forked from [chaoxu.github.io](https://github.com/chaoxu/chaoxu.github.io) and rewritten from Hakyll/Rust/Python to Node.js.

## Development

```bash
npm install
npm run serve   # http://localhost:8080
npm run build   # output to _site/
```

## Deployment

Pushes to `develop` trigger a GitHub Actions workflow that builds and deploys to GitHub Pages via `actions/deploy-pages`.

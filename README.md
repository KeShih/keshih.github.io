# keshi.pro

Personal academic website for Ke Shi, built with [Eleventy](https://www.11ty.dev/). Forked from [chaoxu.github.io](https://github.com/chaoxu/chaoxu.github.io) and rewritten from Hakyll/Rust/Python to Node.js.

## Development

```bash
npm install
npm run serve   # http://localhost:8080
npm run build   # output to _site/
```

## Deployment

GitHub Pages is deployed by the workflow in `.github/workflows/deploy.yml`. Pushes to `develop` trigger the workflow, which builds `_site/` and publishes it with `actions/deploy-pages`.

The `master` branch is not the current deployment source; pushing only to `master` will not deploy the site unless the workflow trigger is changed.

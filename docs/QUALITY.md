# Quality checks

## Lighthouse

The [`Lighthouse` GitHub Actions workflow](../.github/workflows/lighthouse.yml) runs on pushes, pull requests, and manual dispatches. It builds the demo with MSW enabled, starts the production preview, and audits both `/` and `/nft/emerald-ape-000` on mobile and desktop.

Each run publishes the Performance, Accessibility, Best Practices, SEO, and Agentic Browsing scores in the Actions job summary and uploads the JSON reports as a `lighthouse-reports` artifact for 14 days. Reports are not committed because Lighthouse scores vary with the runner and network conditions. Local report files are ignored by Git.

The workflow currently reports scores without blocking merges. The target is 100 in all five categories; performance, especially on mobile, needs further improvement before score thresholds can be used as a reliable CI gate.

To run an audit locally, build and serve the production bundle:

```bash
VITE_ENABLE_MOCKS=true pnpm build
pnpm preview --host 127.0.0.1
```

Then run Lighthouse in another terminal. The default profile is mobile; add `--preset=desktop` for desktop:

```bash
pnpm dlx lighthouse@13.5.0 http://127.0.0.1:4173/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=/tmp/lighthouse-mobile.html \
  --chrome-flags="--headless --no-sandbox"
```

Use `/nft/emerald-ape-000` instead of `/` to audit the NFT detail page.

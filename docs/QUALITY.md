# Quality checks

## Lighthouse

The [`Lighthouse` GitHub Actions workflow](../.github/workflows/lighthouse.yml) runs on pushes, pull requests, and manual dispatches. It builds the demo with MSW enabled, starts the production preview, and audits both `/` and `/nft/emerald-ape-000` on mobile and desktop.

Each run publishes the Performance, Accessibility, Best Practices, SEO, and Agentic Browsing scores in the Actions job summary and uploads the JSON reports as a `lighthouse-reports` artifact for 14 days. Reports are not committed because Lighthouse scores vary with the runner and network conditions. Local report files are ignored by Git.

The workflow reports scores without blocking merges. The challenge's required Lighthouse targets are Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, and SEO ≥ 90. Agentic Browsing is an additional workflow category, not one of the four scored criteria in the challenge brief.

Each workflow run measures each page/device combination once. It does not calculate the required median of three runs, collect LCP/CLS/TBT as a report, or retain HTML reports. Treat its scores as a CI snapshot, not as the complete audit evidence requested by the challenge.

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

For the challenge report, run each of the four route/device combinations three times and report the median category scores. Include LCP, CLS, TBT, Lighthouse/Chrome versions, device profile, build and mock configuration, and relevant runner/network conditions. Preserve the HTML/JSON reports with the delivery evidence.

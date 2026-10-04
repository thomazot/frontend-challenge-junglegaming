# Quality checks

## Lighthouse

The [`Lighthouse` GitHub Actions workflow](../.github/workflows/lighthouse.yml) runs on pushes, pull requests, and manual dispatches. It builds the demo with MSW enabled, starts the production preview, and audits both `/` and `/nft/emerald-ape-000` on mobile and desktop.

Each run publishes the Performance, Accessibility, Best Practices, SEO, and Agentic Browsing scores in the Actions job summary and uploads the JSON reports as a `lighthouse-reports` artifact for 14 days. Reports are not committed because Lighthouse scores vary with the runner and network conditions. Local report files are ignored by Git.

The workflow reports scores without blocking merges. The challenge's required Lighthouse targets are Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, and SEO ≥ 90. Agentic Browsing is an additional workflow category, not one of the four scored criteria in the challenge brief.

Each workflow run measures each page/device combination once. It does not calculate the required median of three runs, collect LCP/CLS/TBT as a report, or retain HTML reports. Treat its scores as a CI snapshot, not as the complete audit evidence requested by the challenge.

## Captured mobile baseline

The mobile Lighthouse report supplied during review was captured on the public deployment on 2026-10-04 with Lighthouse 13.4.1, Chrome 154, an emulated Moto G Power and slow 4G throttling. It reported Performance 78, Accessibility 100, Best Practices 100, SEO 100 and Agentic Browsing 3/3. The report identified the hero avatar (`/images/monkey-nft.jpg`, 504×504 displayed at 144×144) as an image-delivery opportunity with an estimated 20.9 KiB saving; it also showed a 1,497 ms critical request chain, a 640 ms LCP element render delay and 300 ms of render-blocking CSS. Several JavaScript diagnostics were attributable to installed Chrome extensions, so extension-inflated totals should not be treated as first-party bundle measurements.

In response, the hero now offers mobile WebP sources at 144 px and 384 px, the redundant Google Fonts CSS import was removed (the stylesheet remains asynchronously loaded from the document head), and the mobile header no longer requests the desktop-only cart count. These changes target the reported causes without removing visible content or changing its layout. The resulting local production Lighthouse run is recorded separately from the supplied public baseline because the runner/device conditions differ.

After the latest frontend changes, three local Lighthouse 13.4.1 mobile runs scored Performance 62, 72 and 69; Accessibility, Best Practices and SEO scored 100 in all three. The latest run reported FCP 3.2 s, LCP 4.5 s, TBT 320 ms and CLS 0.095. Remaining performance diagnostics include JavaScript boot-up/unused code and render-blocking CSS. These local measurements are not directly comparable with the public deployment result and do not establish the challenge's Performance target (≥ 90); repeat under the same device and network profile before drawing conclusions.

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

---
name: lighthouse-validation
description: Validates and maintains 100% Lighthouse scores (Performance, Accessibility, Best Practices, SEO) after frontend implementations.
---

# Lighthouse 100% Validation Skill

**Context:**
This project requires maintaining a strict 100% Lighthouse score across all four main categories (Performance, Accessibility, Best Practices, and SEO). You must use this skill after completing any frontend feature implementation or UI changes to ensure no regressions occurred.

**Trigger:** 
Automatically apply this skill when finishing an implementation or when requested to validate performance/accessibility.

## Workflow

1. **Build the Application:**
   Generate the production bundle to reflect real-world performance metrics.
   ```bash
   pnpm build
   ```

2. **Start the Preview Server:**
   Run the preview server in the background. Note the port (usually 4173).
   ```bash
   pnpm preview
   ```

3. **Run Lighthouse CLI:**
   Execute Lighthouse against the local preview server in headless mode.
   ```bash
   pnpm dlx lighthouse http://localhost:4173 --output json --output-path ./lh-report.json --chrome-flags="--headless"
   ```

4. **Parse and Analyze Results:**
   Read `lh-report.json` and extract the scores for:
   - `performance`
   - `accessibility`
   - `best-practices`
   - `seo`
   (Multiply by 100 to get the percentage).

5. **Fix Regressions:**
   If any score drops below 100%, parse the `audits` object for items where `score < 1`. 
   - **Performance:** Check for large network payloads, unoptimized images, render-blocking resources, or broken code-splitting (`chunkSizeWarningLimit`).
   - **Accessibility:** Ensure all interactive elements (`button`, `input`, `a`) have `aria-label` or accessible text. Ensure ARIA attributes (`aria-expanded`, `aria-hidden`) are only placed on valid roles.
   - **Best Practices:** Check for console errors (e.g., missing 404 assets like `favicon.ico`) and correct them.
   - **SEO:** Validate meta tags, descriptions, and valid HTML structure.

6. **Iterate:**
   If changes were made in step 5, repeat the build and test process until 100% is achieved on all metrics. Clean up `lh-report.json` when finished.

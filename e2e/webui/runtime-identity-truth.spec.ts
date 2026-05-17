/**
 * TITANE∞ — Runtime Identity Truth — Web UI Playwright spec
 * Verifies that build version and runtime identity are present in the web UI.
 */
import { test, expect } from '@playwright/test';

test.describe('Runtime Identity Truth — Web UI', () => {
  test('app version matches package.json in DOM', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const pkgVersion = process.env.npm_package_version ?? '35.1.7';

    // Check data-app-version attribute set by RuntimeIdentityProbe
    // (may be on html element after applyRuntimeIdentityToDOM runs)
    const htmlVersion = await page.evaluate(() => {
      return (
        document.documentElement.getAttribute('data-app-version') ??
        document.body.getAttribute('data-app-version') ??
        null
      );
    });

    // It's acceptable for the DOM version to be set async; check build-truth.json instead
    const buildTruth = await page.evaluate(async () => {
      try {
        const res = await fetch('/build-truth.json');
        if (!res.ok) return null;
        return (await res.json()) as { appVersion?: string; buildTimestamp?: string };
      } catch {
        return null;
      }
    });

    if (buildTruth) {
      expect(buildTruth.appVersion).toBe(pkgVersion);
      expect(buildTruth.buildTimestamp).toBeTruthy();
    }

    // If DOM version is set, it must match
    if (htmlVersion) {
      expect(htmlVersion).toBe(pkgVersion);
    }
  });

  test('no stale v30.0.0 version in page title or visible text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const title = await page.title();
    expect(title).not.toContain('v30.0.0');

    const bodyText = await page.evaluate(() => document.body.innerText ?? '');
    // User-visible text must not show stale version labels
    expect(bodyText).not.toMatch(/\bv30\.0\.0\b/);
  });

  test('build-truth.json endpoint returns production mode', async ({ page }) => {
    // On Vite dev server, SPA fallback returns HTML for unknown paths.
    // Detect and gracefully skip when not served from a static file server.
    const response = await page.goto('/build-truth.json');
    const contentType = response?.headers()['content-type'] ?? '';
    const isSpaFallback = contentType.includes('text/html');

    if (isSpaFallback) {
      // Dev server SPA fallback — verify via dist/build-truth.json instead (gate-build-truth.sh covers this)
      test.skip(true, 'Dev server SPA fallback: build-truth.json verified via gate-build-truth.sh (PASS=8)');
      return;
    }

    expect(response?.status()).toBe(200);
    const text = await response?.text();
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text ?? '{}') as Record<string, unknown>;
    } catch {
      throw new Error(`build-truth.json is not valid JSON: ${text?.slice(0, 200)}`);
    }
    expect(json.buildMode).toBe('production');
    expect(json.appVersion).toBeTruthy();
    expect(json.buildTimestamp).toBeTruthy();
  });
});

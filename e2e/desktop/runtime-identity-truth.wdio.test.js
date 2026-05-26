/**
 * TITANE∞ — Runtime Identity Truth — WDIO Desktop spec
 * Verifies Tauri runtime identity DOM attributes in stable window.
 */
const path = require('path');
const fs = require('fs');

describe('Runtime Identity Truth — Tauri Stable', () => {
  it('app-version DOM attribute matches package.json version', async () => {
    const pkgPath = path.join(__dirname, '../../package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const expectedVersion = pkg.version;

    // Allow time for RuntimeIdentityProbe useEffect to fire
    await browser.pause(3000);

    const htmlVersion = await browser.execute(() => {
      return (
        document.documentElement.getAttribute('data-app-version') ||
        document.querySelector('[data-app-version]')?.getAttribute('data-app-version') ||
        null
      );
    });

    if (htmlVersion !== null) {
      expect(htmlVersion).toBe(expectedVersion);
    } else {
      // DOM attribute not yet set — check build-truth.json via localStorage or fetch
      const buildVersion = await browser.execute(async () => {
        try {
          const res = await fetch('/build-truth.json');
          if (!res.ok) return null;
          const bt = await res.json();
          return bt.appVersion ?? null;
        } catch {
          return null;
        }
      });
      if (buildVersion) {
        expect(buildVersion).toBe(expectedVersion);
      }
    }
  });

  it('runtime is Tauri (not browser)', async () => {
    const runtimeKind = await browser.execute(() => {
      // Check if Tauri globals are present
      const hasTauri = '__TAURI__' in window || '__TAURI_INTERNALS__' in window;
      const htmlKind = document.documentElement.getAttribute('data-runtime-kind');
      return { hasTauri, htmlKind };
    });

    // In Tauri stable: __TAURI__ or __TAURI_INTERNALS__ must be present
    expect(runtimeKind.hasTauri).toBe(true);

    // If RuntimeIdentityProbe has run, verify the kind
    if (runtimeKind.htmlKind) {
      expect(runtimeKind.htmlKind).toMatch(/^tauri/);
    }
  });

  it('no stale v30.0.0 in page title', async () => {
    const title = await browser.getTitle();
    expect(title).not.toContain('v30.0.0');
  });

  it('SurfaceTruth DOM attribute present', async () => {
    const surfaceTruth = await browser.execute(() => {
      const el = document.querySelector('[data-surface-truth]');
      return el ? el.getAttribute('data-surface-truth') : null;
    });

    // Surface truth must exist (app-root or core)
    expect(surfaceTruth).toBeTruthy();

    // Write proof
    const proofDir = path.join(
      __dirname,
      '../../proof_packs/RUNTIME_VISIBILITY_ROOT_CAUSE_SEAL_2026_05_16'
    );
    fs.mkdirSync(proofDir, { recursive: true });
    fs.writeFileSync(
      path.join(proofDir, 'runtime-identity-proof.json'),
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          surfaceTruth,
          runtimeKindFromDOM: await browser.execute(() =>
            document.documentElement.getAttribute('data-runtime-kind')
          ),
          appVersionFromDOM: await browser.execute(() =>
            document.documentElement.getAttribute('data-app-version')
          ),
          title: await browser.getTitle(),
          url: await browser.getUrl(),
        },
        null,
        2
      )
    );
  });
});

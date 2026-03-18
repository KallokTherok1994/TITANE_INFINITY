/**
 * E2E MEMORY DASHBOARD RUNTIME TRUTH
 * Gate: G_RUNTIME_MEMORY_PROOF + G_X3_RERUN
 * Scope: Memory page — MemoryDashboard persistent_memory_read whitelist fix
 * Proof: asserts "Erreur de chargement mémoire" banner is ABSENT after patch
 *
 * Classification: MEMORY_INVOKE_BROKEN → PATCHED (AH-2026-03-18-MEMORY-WHITELIST-READ)
 */

import assert from 'node:assert';
import fs from 'node:fs';

const REPORT_DIR = './reports/MEMORY_PAGE_RUNTIME_HEAL';
const REPORT_FILE = `${REPORT_DIR}/memory-dashboard-runtime-proof.json`;

const results = {
  timestamp: new Date().toISOString(),
  sha: '379464342',
  fix: 'AH-2026-03-18-MEMORY-WHITELIST-READ',
  runs: [],
};

function saveResults() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Memory Dashboard Runtime Proof saved: ${REPORT_FILE}`);
}

async function ensureTauriPageLoaded() {
  const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost';
  const allowedPrefixes = ['tauri://localhost', 'http://localhost', 'http://127.0.0.1'];

  for (let attempt = 1; attempt <= 3; attempt++) {
    await browser.url(appUrl);
    await browser.pause(2000);
    const href = await browser.execute(() => window.location.href || '');
    if (allowedPrefixes.some(p => href.startsWith(p))) return true;
    if (attempt < 3) await browser.pause(1000);
  }
  return false;
}

async function navigateToMemoryPage() {
  // Navigate to /memory route via hash or path
  await browser.execute(() => {
    if (window.history) {
      window.history.pushState({}, '', '/memory');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  });
  await browser.pause(1500);

  // Fallback: click Memory nav item if visible
  const memLinks = await browser.$$(
    'a[href*="memory"], button[data-route*="memory"], [data-testid*="memory"]'
  );
  for (const link of memLinks.slice(0, 3)) {
    const text = await link.getText().catch(() => '');
    if (/memory|mémoire/i.test(text)) {
      await link.click().catch(() => {});
      await browser.pause(1000);
      break;
    }
  }
}

async function checkMemoryDashboardError() {
  // Check for the specific error banner text
  const errorBanner = await browser.$('p.text-red-400');
  const bannerExists = await errorBanner.isExisting().catch(() => false);
  if (!bannerExists) return { hasError: false, errorText: null };

  const errorText = await errorBanner.getText().catch(() => '');
  const hasMemoryError = /erreur de chargement m.moire|chargement m.moire/i.test(
    errorText
  );
  return { hasError: hasMemoryError, errorText };
}

async function invokePersistentMemoryRead() {
  const result = await browser.executeAsync(done => {
    const invoke =
      window.__TAURI__?.core?.invoke ||
      window.__TAURI__?.tauri?.invoke ||
      window.__TAURI__?.invoke ||
      window.__TAURI_INTERNALS__?.invoke;

    if (!invoke) {
      done({ ok: false, err: 'Tauri IPC unavailable' });
      return;
    }

    const request = {
      levels: ['session', 'intermediate', 'long_term'],
      topics: null,
      currentMode: 'assistant',
      projectId: null,
      includeSummaries: true,
      limit: 10,
    };

    invoke('persistent_memory_read', { request })
      .then(res => done({ ok: true, res }))
      .catch(err => done({ ok: false, err: String(err?.message || err) }));
  });

  return result;
}

describe('G_RUNTIME_MEMORY_PROOF + G_X3_RERUN — Memory Dashboard (AH-2026-03-18-MEMORY-WHITELIST-READ)', () => {
  before(async function () {
    const loaded = await ensureTauriPageLoaded();
    if (!loaded) {
      throw new Error('BLOCKER: Tauri page unavailable — environment setup required');
    }
    await browser.waitUntil(
      async () => (await browser.execute(() => document.readyState)) === 'complete',
      {
        timeout: 15000,
        interval: 300,
        timeoutMsg: 'Page did not reach readyState complete',
      }
    );
  });

  after(() => saveResults());

  // RUN 1
  it('RUN-1: persistent_memory_read is NOT blocked by security whitelist', async function () {
    this.timeout(20000);
    const startTime = Date.now();
    await navigateToMemoryPage();

    const ipcResult = await invokePersistentMemoryRead();
    const latencyMs = Date.now() - startTime;

    // The command must NOT be rejected by whitelist
    // Accept: success OR backend-not-ready (e.g. no persistent memory data yet)
    // Reject: security whitelist error
    const isWhitelistError =
      ipcResult.err && /whitelist|not in whitelist|Security:/i.test(ipcResult.err);

    assert.ok(
      !isWhitelistError,
      `FAIL: persistent_memory_read still blocked by whitelist: ${ipcResult.err}`
    );

    results.runs.push({ run: 1, latencyMs, ipcResult, status: 'PASS' });
    console.log(`✅ RUN-1 PASS (${latencyMs}ms) — whitelist not blocking`);
  });

  // RUN 2
  it('RUN-2: Memory page has no "Erreur de chargement mémoire" banner', async function () {
    this.timeout(20000);
    const startTime = Date.now();
    await navigateToMemoryPage();
    await browser.pause(2000); // allow hook to resolve

    const { hasError, errorText } = await checkMemoryDashboardError();
    const latencyMs = Date.now() - startTime;

    assert.ok(
      !hasError,
      `FAIL: Dashboard still shows "Erreur de chargement mémoire": "${errorText}"`
    );

    results.runs.push({ run: 2, latencyMs, hasErrorBanner: hasError, status: 'PASS' });
    console.log(`✅ RUN-2 PASS (${latencyMs}ms) — no error banner`);
  });

  // RUN 3
  it('RUN-3: persistent_memory_read returns data or explicit backend-inactive (not whitelist reject)', async function () {
    this.timeout(20000);
    const startTime = Date.now();
    await navigateToMemoryPage();

    const ipcResult = await invokePersistentMemoryRead();
    const latencyMs = Date.now() - startTime;

    const isWhitelistError =
      ipcResult.err && /whitelist|not in whitelist|Security:/i.test(ipcResult.err);
    const isSuccess = ipcResult.ok;
    const isBackendInactive = !isSuccess && !isWhitelistError;

    assert.ok(
      !isWhitelistError,
      `FAIL: persistent_memory_read blocked by whitelist on run 3: ${ipcResult.err}`
    );

    const status = isSuccess ? 'PROVEN_RUNTIME' : 'BACKEND_INACTIVE_EXPLICIT';
    results.runs.push({
      run: 3,
      latencyMs,
      ipcResult,
      status: 'PASS',
      dataStatus: status,
    });
    console.log(`✅ RUN-3 PASS (${latencyMs}ms) — dataStatus: ${status}`);
    if (isBackendInactive) {
      console.log(
        `ℹ️  Backend returned error (not whitelist): ${ipcResult.err} — classified BACKEND_INACTIVE_EXPLICIT`
      );
    }
  });
});

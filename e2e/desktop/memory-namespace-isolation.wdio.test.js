import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPORT_DIR = process.env.TITANE_E2E_ARTIFACTS_DIR || './reports/e2e-desktop';
const REPORT_FILE = path.join(REPORT_DIR, 'memory-namespace-isolation-report.json');

const MODE = 'default';
const PROD_KEY = `titane_chat_mode_${MODE}`;
const TEST_KEY = `titane_test_chat_mode_${MODE}`;

function saveReport(entries) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        suite: 'memory-namespace-isolation',
        timestamp: new Date().toISOString(),
        checks: entries,
      },
      null,
      2
    )
  );
}

async function loadChatSurface() {
  const candidates = [
    process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat',
    'tauri://localhost/chat',
    'tauri://localhost/#/titane?tab=conversation',
    'tauri://localhost/#/titane',
    'tauri://localhost',
  ];

  for (const url of candidates) {
    await browser.url(url).catch(() => {});
    await browser.pause(800);
    const loaded = await browser.execute(() => {
      return (
        document.readyState !== 'loading' && window.location.href.startsWith('tauri://')
      );
    });
    if (loaded) {
      return true;
    }
  }

  return false;
}

describe('memory namespace isolation (WDIO desktop)', () => {
  const checks = [];

  after(() => {
    saveReport(checks);
  });

  it('S1 — source uses namespace-aware chat storage key resolver', () => {
    const source = fs.readFileSync('src/hooks/useConversationEngine.ts', 'utf-8');
    const hasResolverImport = source.includes('resolveChatMemoryStorageKey');
    const hasLegacyLiteral = source.includes('titane_chat_mode_${currentMode}');

    checks.push({
      name: 'source-namespace-resolver',
      ok: hasResolverImport && !hasLegacyLiteral,
      details: { hasResolverImport, hasLegacyLiteral },
      at: new Date().toISOString(),
    });

    assert.equal(
      hasResolverImport,
      true,
      'Expected resolveChatMemoryStorageKey import/use'
    );
    assert.equal(hasLegacyLiteral, false, 'Legacy literal storage key still present');
  });

  it('S2 — runtime keeps prod/test payloads isolated and test marker hidden', async function () {
    this.timeout(120000);

    const loaded = await loadChatSurface();
    assert.equal(loaded, true, 'Tauri chat surface should load');

    await browser.execute(
      ({ prodKey, testKey }) => {
        const now = Date.now();
        localStorage.clear();
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('titane_onboarding_complete', '1');

        localStorage.setItem(
          prodKey,
          JSON.stringify({
            mode: 'default',
            messages: [
              {
                id: 'prod-msg-1',
                role: 'assistant',
                content: 'namespace-prod-visible',
                timestamp: now,
              },
            ],
            compressed: [],
            lastCompacted: now,
          })
        );

        localStorage.setItem(
          testKey,
          JSON.stringify({
            mode: 'default',
            messages: [
              {
                id: 'test-msg-1',
                role: 'assistant',
                content: 'namespace-test-hidden',
                timestamp: now,
              },
            ],
            compressed: [],
            lastCompacted: now,
          })
        );
      },
      { prodKey: PROD_KEY, testKey: TEST_KEY }
    );

    await browser.refresh();
    await browser.pause(1500);

    const runtimeStorage = await browser.execute(
      ({ prodKey, testKey }) => {
        const prodPayload = localStorage.getItem(prodKey);
        const testPayload = localStorage.getItem(testKey);
        return {
          prodPresent: Boolean(prodPayload),
          testPresent: Boolean(testPayload),
          prodHasProdMarker:
            typeof prodPayload === 'string' &&
            prodPayload.includes('namespace-prod-visible'),
          testHasTestMarker:
            typeof testPayload === 'string' &&
            testPayload.includes('namespace-test-hidden'),
        };
      },
      { prodKey: PROD_KEY, testKey: TEST_KEY }
    );

    const bodyText = await $('body').getText();
    const hasTestMarker = bodyText.includes('namespace-test-hidden');

    checks.push({
      name: 'runtime-prod-restoration',
      ok:
        runtimeStorage.prodPresent &&
        runtimeStorage.testPresent &&
        runtimeStorage.prodHasProdMarker &&
        runtimeStorage.testHasTestMarker &&
        !hasTestMarker,
      details: { ...runtimeStorage, hasTestMarker },
      at: new Date().toISOString(),
    });

    assert.equal(runtimeStorage.prodPresent, true, 'Expected prod namespace payload');
    assert.equal(runtimeStorage.testPresent, true, 'Expected test namespace payload');
    assert.equal(
      runtimeStorage.prodHasProdMarker,
      true,
      'Expected prod namespace marker in prod payload'
    );
    assert.equal(
      runtimeStorage.testHasTestMarker,
      true,
      'Expected test namespace marker in test payload'
    );
    assert.equal(hasTestMarker, false, 'Test namespace message leaked into runtime UI');
  });
});

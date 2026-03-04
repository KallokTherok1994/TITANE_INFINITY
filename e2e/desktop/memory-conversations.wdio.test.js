/**
 * E2E_TOTAL_LOCK — Memory Conversations Management
 * Scope: P0 capabilities — list_conversations, create_conversation, load_conversation
 * Ring: Ring 3 (Services) → Ring 4 (UI)
 * IPC Commands: list_conversations, create_conversation, load_conversation, delete_conversation
 */

import assert from 'node:assert';
import fs from 'node:fs';

const REPORT_DIR = './reports/E2E_TOTAL_LOCK_20260228_150100';
const REPORT_FILE = `${REPORT_DIR}/memory-conversations-report.json`;

const results = {
  timestamp: new Date().toISOString(),
  tests: [],
  tauriIPCAvailable: false,
};

/**
 * Helper: Ensure Tauri page loaded
 */
async function ensureTauriPageLoaded(url) {
  const allowedPrefixes = ['tauri://localhost', 'http://localhost', 'http://127.0.0.1'];

  for (let attempt = 1; attempt <= 3; attempt++) {
    await browser.url(url);
    await browser.pause(1200);

    const href = await browser.execute(() => window.location.href || '');
    if (allowedPrefixes.some(prefix => href.startsWith(prefix))) {
      return true;
    }

    if (href === 'about:blank' && attempt < 3) {
      continue;
    }
  }

  return false;
}

/**
 * Helper: Invoke Tauri command via browser.executeAsync
 */
async function invokeTauriCommand(command, args = {}) {
  const result = await browser.executeAsync(
    (cmd, payload, done) => {
      const run = async () => {
        const attempts = [];

        if (window.__TAURI__?.core?.invoke) {
          attempts.push(p => window.__TAURI__.core.invoke(cmd, p));
        }
        if (window.__TAURI__?.tauri?.invoke) {
          attempts.push(p => window.__TAURI__.tauri.invoke(cmd, p));
        }
        if (window.__TAURI__?.invoke) {
          attempts.push(p => window.__TAURI__.invoke(cmd, p));
        }
        if (window.__TAURI_INTERNALS__?.invoke) {
          attempts.push(p => window.__TAURI_INTERNALS__.invoke(cmd, p));
        }

        if (!attempts.length) {
          throw new Error('Tauri IPC unavailable');
        }

        let invokeError = 'invoke unavailable';
        for (const tryInvoke of attempts) {
          try {
            return await tryInvoke(payload);
          } catch (error) {
            invokeError = String(error?.message || error);
          }
        }

        throw new Error(invokeError);
      };

      run()
        .then(res => done({ ok: true, res }))
        .catch(err => done({ ok: false, err: String(err?.message || err) }));
    },
    command,
    args
  );

  if (result?.ok) {
    return result.res;
  }

  throw new Error(result?.err || `IPC command ${command} failed`);
}

/**
 * Helper: Save results to JSON report
 */
function saveResults() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Memory Conversations Report saved: ${REPORT_FILE}`);
}

describe('E2E_TOTAL_LOCK — Memory Conversations Management (P0)', () => {
  let conversationId = null;

  before(async function () {
    const appUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/titane';
    const loaded = await ensureTauriPageLoaded(appUrl);
    if (!loaded) {
      throw new Error(
        'BLOCKER: Tauri page unavailable (about:blank) - environment setup required for Memory tests'
      );
    }

    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        const href = await browser.execute(() => window.location.href || '');
        return (
          (readyState === 'interactive' || readyState === 'complete') &&
          (href.startsWith('tauri://localhost') ||
            href.startsWith('http://localhost') ||
            href.startsWith('http://127.0.0.1'))
        );
      },
      { timeout: 10000, interval: 250, timeoutMsg: 'Memory page not fully ready' }
    );

    // Check Tauri IPC availability
    results.tauriIPCAvailable = await browser.execute(() => {
      const hasV1 = typeof window.__TAURI__ !== 'undefined';
      const hasV2 = typeof window.__TAURI_INTERNALS__ !== 'undefined';
      const hasInvoke =
        !!window.__TAURI_INTERNALS__?.invoke ||
        !!window.__TAURI__?.tauri?.invoke ||
        !!window.__TAURI__?.core?.invoke ||
        !!window.__TAURI__?.invoke;
      return (hasV1 || hasV2) && hasInvoke;
    });

    console.log(
      `\n🔍 Tauri IPC Available: ${results.tauriIPCAvailable ? '✅ YES' : '❌ NO'}`
    );

    if (!results.tauriIPCAvailable) {
      throw new Error('BLOCKER: Tauri IPC not available - cannot test Memory commands');
    }
  });

  after(() => {
    saveResults();
  });

  it('P0-Memory-1: chat_get_memory_stats → returns stats object', async function () {
    this.timeout(15000);
    const testName = 'P0-Memory-1: chat_get_memory_stats';
    const startTime = Date.now();

    try {
      const response = await invokeTauriCommand('chat_get_memory_stats', {});
      const latencyMs = Date.now() - startTime;

      assert.notEqual(response, null, 'chat_get_memory_stats returned null');
      assert.equal(typeof response, 'object', 'Response is not an object');
      assert.ok('total_memories' in response, 'Missing total_memories in stats response');

      results.tests.push({
        name: testName,
        status: 'PASS',
        latencyMs,
        totalMemories: response.total_memories,
      });

      console.log(
        `✅ ${testName} PASS (${latencyMs}ms, total_memories=${response.total_memories})`
      );
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('P0-Memory-2: chat_create_conversation → returns conversationId', async function () {
    this.timeout(15000);
    const testName = 'P0-Memory-2: chat_create_conversation';
    const startTime = Date.now();

    try {
      const response = await invokeTauriCommand('chat_create_conversation', {});
      const latencyMs = Date.now() - startTime;

      assert.notEqual(response, null, 'chat_create_conversation returned null');
      assert.equal(typeof response, 'string', 'conversationId is not a string');
      assert.ok(response.length > 10, 'conversationId too short');
      conversationId = response;

      results.tests.push({
        name: testName,
        status: 'PASS',
        latencyMs,
        conversationId,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms, ID: ${conversationId})`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('P0-Memory-3: chat_get_conversation → returns conversation data', async function () {
    this.timeout(15000);
    const testName = 'P0-Memory-3: chat_get_conversation';
    const startTime = Date.now();

    try {
      if (!conversationId) {
        throw new Error('conversationId not set (depends on P0-Memory-2)');
      }

      const response = await invokeTauriCommand('chat_get_conversation', {
        conversationId,
      });
      const latencyMs = Date.now() - startTime;

      assert.notEqual(response, null, 'chat_get_conversation returned null');
      assert.equal(
        typeof response,
        'object',
        'chat_get_conversation returned non-object'
      );
      assert.equal(
        response.conversation_id || response.conversationId,
        conversationId,
        'Returned conversation id mismatch'
      );

      results.tests.push({
        name: testName,
        status: 'PASS',
        latencyMs,
        conversationId,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms, ID: ${conversationId})`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('P0-Memory-4: chat_delete_conversation → cleanup', async function () {
    this.timeout(15000);
    const testName = 'P0-Memory-4: chat_delete_conversation';
    const startTime = Date.now();

    try {
      if (!conversationId) {
        console.warn('⚠️ No conversationId to delete (skipping cleanup)');
        return;
      }

      const response = await invokeTauriCommand('chat_delete_conversation', {
        conversationId,
      });
      const latencyMs = Date.now() - startTime;

      assert.notEqual(response, null, 'chat_delete_conversation returned null');
      assert.equal(typeof response, 'string', 'delete response is not a string');
      assert.ok(response.toLowerCase().includes('supprim'), 'Unexpected delete response');

      results.tests.push({
        name: testName,
        status: 'PASS',
        latencyMs,
        conversationId,
      });

      console.log(
        `✅ ${testName} PASS (${latencyMs}ms, cleaned up ID: ${conversationId})`
      );
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });
});

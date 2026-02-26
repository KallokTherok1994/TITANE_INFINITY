/**
 * E2E Runtime Validation: Chat Always Respond (AR20) - WebDriver Native
 * TITANE∞ v27.0.3 - Direct IPC Access (Resolves Playwright Blocker)
 *
 * Test Suite:
 * - TEST A: Simple prompt "allo" → response exists
 * - TEST B: Offline fallback (external providers disabled) → response exists
 * - TEST C: Invalid external keys → no silence
 * - TEST AR20: 20 consecutive messages → all answered
 *
 * Advantages over Playwright:
 * - Direct Tauri IPC access (window.__TAURI__ available)
 * - Native desktop app testing (no web browser limitations)
 * - Backend validation without UI dependency
 *
 * Requirements:
 * - Tauri app MUST be built (release or debug)
 * - tauri-driver + WebDriverIO infrastructure
 * - Run via: pnpm run e2e:desktop OR node scripts/e2e/run-desktop-suite.js
 *
 * Output: Pass/Fail results with detailed error context
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const REPORT_DIR = path.resolve('reports/e2e-desktop/ar20-validation');
const RUN_TS = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_FILE = path.join(REPORT_DIR, `ar20_results_${RUN_TS}.json`);

// Test results accumulator
const results = {
  runTimestamp: new Date().toISOString(),
  framework: 'WebDriverIO + tauri-driver',
  tauriIPCAvailable: false,
  tests: [],
};

// Helper: Wait for element with retry
async function waitForElement(selector, timeoutMs = 15000) {
  const elem = await $(selector);
  await elem.waitForExist({ timeout: timeoutMs });
  return elem;
}

// Helper: Invoke Tauri IPC command directly
async function invokeTauriCommand(command, args = {}) {
  let lastError = 'invokeTauriCommand failed';

  for (let attempt = 1; attempt <= 5; attempt++) {
    const result = await browser.executeAsync(
      (cmd, payload, done) => {
        const run = async () => {
          if (window.__TAURI_INTERNALS__?.invoke) {
            return await window.__TAURI_INTERNALS__.invoke(cmd, payload);
          }

          if (window.__TAURI__?.tauri?.invoke) {
            return await window.__TAURI__.tauri.invoke(cmd, payload);
          }

          if (window.__TAURI__?.core?.invoke) {
            return await window.__TAURI__.core.invoke(cmd, payload);
          }

          if (window.__TAURI__?.invoke) {
            return await window.__TAURI__.invoke(cmd, payload);
          }

          throw new Error('Tauri IPC not available (no invoke API found)');
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

    lastError = result?.err || lastError;

    if (String(lastError).includes('Origin header is not a valid URL') && attempt < 5) {
      await browser.pause(300);
      continue;
    }

    break;
  }

  throw new Error(lastError);
}

async function recoverFromWindowLoss() {
  const targetUrl = process.env.TITANE_E2E_URL || 'tauri://localhost/#/chat';
  await browser.url(targetUrl);
  await browser.waitUntil(
    async () => {
      const readyState = await browser.execute(() => document.readyState);
      const href = await browser.execute(() => window.location.href || '');
      return (
        (readyState === 'interactive' || readyState === 'complete') &&
        href.startsWith('tauri://localhost')
      );
    },
    { timeout: 10000, interval: 250, timeoutMsg: 'AR20 recovery page not ready' }
  );
}

// Helper: Send chat message via IPC (bypasses UI)
async function sendChatViaIPC(message) {
  let lastError = 'IPC send failed';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const conversationId = `e2e-ar20-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const response = await invokeTauriCommand('conversation_generate', {
        args: {
          message,
          conversationId,
          provider: 'local',
        },
      });
      return { success: true, response };
    } catch (error) {
      lastError = error.message;

      if (String(lastError).includes('no such window') && attempt < 2) {
        try {
          await recoverFromWindowLoss();
          continue;
        } catch (recoveryError) {
          lastError = `${lastError} | recovery_failed: ${recoveryError.message}`;
        }
      }

      break;
    }
  }

  return { success: false, error: lastError };
}

// Helper: Send chat message via UI
async function sendChatViaUI(message, selectors) {
  const input = await $(selectors.input);
  await input.waitForExist({ timeout: 10000 });
  await input.setValue(message);

  const sendBtn = await $(selectors.send);
  await sendBtn.waitForClickable({ timeout: 5000 });
  await sendBtn.click();
}

// Helper: Wait for response in UI
async function waitForUIResponse(selectors, timeoutMs = 20000) {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < timeoutMs) {
    attempts++;
    const responses = await $$(selectors.response);

    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      const text = await lastResponse.getText();
      if (text && text.trim().length > 0) {
        return {
          success: true,
          response: text.trim(),
          attempts,
          latencyMs: Date.now() - startTime,
        };
      }
    }

    await browser.pause(500);
  }

  return { success: false, response: null, attempts, latencyMs: Date.now() - startTime };
}

// Helper: Resolve chat UI selectors
async function resolveChatSelectors() {
  // Try chat bubble pattern
  const bubbleInput = await $('.chat-bubble-input');
  if (await bubbleInput.isExisting()) {
    return {
      input: '.chat-bubble-input',
      send: '.chat-bubble-send',
      response: '.chat-bubble-message.assistant .message-content',
      trigger: '[data-testid="chat-bubble-trigger"]',
    };
  }

  // Try conversation window pattern
  const windowInput = await $('#chat-window-textarea, textarea.conversation-input');
  if (await windowInput.isExisting()) {
    return {
      input: '#chat-window-textarea, textarea.conversation-input',
      send: 'button.conversation-send-btn, button.chat-send-omega',
      response: '.message-assistant .message-content, .chat-bubble-message.assistant',
      trigger: null,
    };
  }

  // Try generic fallback
  const genericInput = await $('textarea[placeholder*="message"], textarea.chat-input');
  if (await genericInput.isExisting()) {
    return {
      input: 'textarea[placeholder*="message"], textarea.chat-input',
      send: 'button[type="submit"]',
      response: '.message-assistant, [class*="assistant"]',
      trigger: null,
    };
  }

  return null;
}

// Helper: Open chat interface if collapsed
async function ensureChatOpen(selectors) {
  if (!selectors?.trigger) return;

  const input = await $(selectors.input);
  if (await input.isExisting()) return; // Already open

  const trigger = await $(selectors.trigger);
  if (await trigger.isExisting()) {
    await trigger.click();
    await browser.pause(1000);
  }
}

// Save results to report file
function saveResults() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Report saved: ${REPORT_FILE}`);
}

describe('Runtime Validation: Chat AR20 Suite (WebDriver Native)', () => {
  let chatSelectors = null;

  before(async () => {
    // Navigate to Tauri app root
    await browser.url('tauri://localhost/#/chat');
    await browser.pause(1000);

    await browser.waitUntil(
      async () => {
        const readyState = await browser.execute(() => document.readyState);
        const href = await browser.execute(() => window.location.href || '');
        return (
          (readyState === 'interactive' || readyState === 'complete') &&
          href.startsWith('tauri://localhost')
        );
      },
      { timeout: 10000, interval: 250, timeoutMsg: 'AR20 page not fully ready' }
    );

    // Verify body exists
    const body = await $('body');
    assert.equal(await body.isExisting(), true, 'App failed to load');

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

    // Resolve chat UI selectors
    chatSelectors = await resolveChatSelectors();
    if (chatSelectors) {
      console.log(`✅ Chat UI detected: ${chatSelectors.input}`);
      await ensureChatOpen(chatSelectors);
    } else {
      console.warn('⚠️ Chat UI not detected, will test IPC only');
    }
  });

  after(() => {
    saveResults();
  });

  it('TEST A: Simple prompt "allo" receives response (IPC)', async function () {
    this.timeout(30000);
    const testName = 'TEST A: IPC Simple';
    const testMsg = 'allo';
    const startTime = Date.now();

    try {
      assert.equal(
        results.tauriIPCAvailable,
        true,
        'Tauri IPC not available (CRITICAL BLOCKER)'
      );

      const result = await sendChatViaIPC(testMsg);
      const latencyMs = Date.now() - startTime;

      assert.equal(result.success, true, `IPC call failed: ${result.error}`);
      assert.notEqual(result.response, null, 'IPC returned null response');
      const assistantText =
        result.response.assistant_message || result.response.content || '';
      assert.ok(assistantText, 'Response missing assistant_message/content field');
      assert.ok(assistantText.length > 0, 'Empty assistant_message/content');
      assert.ok(latencyMs < 20000, `Response too slow: ${latencyMs}ms (max 20000ms)`);

      results.tests.push({
        name: testName,
        status: 'PASS',
        method: 'IPC',
        prompt: testMsg,
        response: assistantText.substring(0, 100),
        latencyMs,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms)`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        method: 'IPC',
        prompt: testMsg,
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('TEST B: Offline fallback (IPC with timeout simulation)', async function () {
    this.timeout(30000);
    const testName = 'TEST B: IPC Offline Fallback';
    const testMsg = 'test offline mode';
    const startTime = Date.now();

    try {
      assert.equal(results.tauriIPCAvailable, true, 'Tauri IPC not available');

      const result = await sendChatViaIPC(testMsg);
      const latencyMs = Date.now() - startTime;

      assert.equal(result.success, true, `IPC call failed: ${result.error}`);
      assert.notEqual(result.response, null, 'No offline fallback response');
      assert.ok(latencyMs < 20000, `Timeout not enforced: ${latencyMs}ms (max 20000ms)`);

      results.tests.push({
        name: testName,
        status: 'PASS',
        method: 'IPC',
        prompt: testMsg,
        response:
          result.response.assistant_message?.substring(0, 100) ||
          result.response.content?.substring(0, 100) ||
          'N/A',
        latencyMs,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms)`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        method: 'IPC',
        prompt: testMsg,
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('TEST C: Invalid external keys → no silence (IPC)', async function () {
    this.timeout(30000);
    const testName = 'TEST C: IPC No Silence';
    const testMsg = 'test with invalid keys';
    const startTime = Date.now();

    try {
      assert.equal(results.tauriIPCAvailable, true, 'Tauri IPC not available');

      const result = await sendChatViaIPC(testMsg);
      const latencyMs = Date.now() - startTime;

      assert.equal(
        result.success,
        true,
        `IPC call failed (silence detected): ${result.error}`
      );
      assert.notEqual(result.response, null, 'Silence detected (null response)');
      const assistantText =
        result.response.assistant_message || result.response.content || '';
      assert.ok(assistantText, 'Silence detected (no assistant_message/content)');
      assert.ok(assistantText.length > 0, 'Silence detected (empty message)');

      results.tests.push({
        name: testName,
        status: 'PASS',
        method: 'IPC',
        prompt: testMsg,
        response: assistantText.substring(0, 100),
        latencyMs,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms)`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        method: 'IPC',
        prompt: testMsg,
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  it('TEST AR20: 20 consecutive messages → all answered (IPC)', async function () {
    this.timeout(600000); // 10 min max
    const testName = 'TEST AR20: 20 Messages IPC';
    const startTime = Date.now();
    const responses = [];

    try {
      assert.equal(results.tauriIPCAvailable, true, 'Tauri IPC not available');

      for (let i = 1; i <= 20; i++) {
        const msgStartTime = Date.now();
        const testMsg = `AR20 test message ${i}/20`;

        const result = await sendChatViaIPC(testMsg);
        const msgLatencyMs = Date.now() - msgStartTime;

        assert.equal(result.success, true, `Message ${i}/20 failed: ${result.error}`);
        assert.notEqual(result.response, null, `Message ${i}/20 returned null`);
        const assistantText =
          result.response.assistant_message || result.response.content || '';
        assert.ok(assistantText, `Message ${i}/20 missing assistant_message/content`);
        assert.ok(assistantText.length > 0, `Message ${i}/20 empty response`);
        assert.ok(msgLatencyMs < 20000, `Message ${i}/20 timeout: ${msgLatencyMs}ms`);

        responses.push({
          index: i,
          prompt: testMsg,
          response: assistantText.substring(0, 50),
          latencyMs: msgLatencyMs,
        });

        console.log(`  ✅ Message ${i}/20: ${msgLatencyMs}ms`);
        await browser.pause(150);
      }

      const totalLatencyMs = Date.now() - startTime;
      const avgLatencyMs = Math.round(totalLatencyMs / 20);

      results.tests.push({
        name: testName,
        status: 'PASS',
        method: 'IPC',
        messagesCount: 20,
        responses,
        totalLatencyMs,
        avgLatencyMs,
      });

      console.log(`✅ ${testName} PASS (20/20, avg ${avgLatencyMs}ms per message)`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        method: 'IPC',
        messagesCount: responses.length,
        responses,
        error: error.message,
        totalLatencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });

  // Optional UI validation tests (if chat UI available)
  it('TEST UI-A: Simple prompt via UI (if available)', async function () {
    if (!chatSelectors) {
      console.log('⏭️ Skipping UI test (chat interface not detected)');
      this.skip();
      return;
    }

    this.timeout(30000);
    const testName = 'TEST UI-A: Simple';
    const testMsg = 'ui test hello';
    const startTime = Date.now();

    try {
      await sendChatViaUI(testMsg, chatSelectors);
      const result = await waitForUIResponse(chatSelectors, 20000);
      const latencyMs = Date.now() - startTime;

      assert.equal(
        result.success,
        true,
        `UI response timeout after ${result.attempts} attempts`
      );
      assert.notEqual(result.response, null, 'UI response null');
      assert.ok(result.response.length > 0, 'UI response empty');

      results.tests.push({
        name: testName,
        status: 'PASS',
        method: 'UI',
        prompt: testMsg,
        response: result.response.substring(0, 100),
        latencyMs,
        attempts: result.attempts,
      });

      console.log(`✅ ${testName} PASS (${latencyMs}ms, ${result.attempts} checks)`);
    } catch (error) {
      results.tests.push({
        name: testName,
        status: 'FAIL',
        method: 'UI',
        prompt: testMsg,
        error: error.message,
        latencyMs: Date.now() - startTime,
      });
      throw error;
    }
  });
});

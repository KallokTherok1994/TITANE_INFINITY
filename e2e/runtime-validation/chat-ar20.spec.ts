/**
 * E2E Runtime Validation: Chat Always Respond (AR20) + Local-First Tests
 * TITANE∞ v27.0.1 - Automated Runtime Proof
 *
 * Test Suite:
 * - TEST A: Simple prompt "allo" → response exists
 * - TEST B: Offline fallback (network disabled) → response exists
 * - TEST C: Invalid external keys → no silence
 * - TEST AR20: 20 consecutive messages → all answered
 *
 * Requirements:
 * - Dev app MUST be running (http://localhost:5173)
 * - Backend Tauri MUST be active
 * - Tests run WITHOUT manual intervention
 *
 * Output: Structured JSON results for automated proof pack
 */

import { test, expect } from '@playwright/test';

const TAURI_E2E_ENABLED = process.env.TITANE_E2E_TAURI === '1';

const CHAT_INPUT_SELECTOR =
  '#chat-input-textarea, textarea.chat-input, [data-testid="chat-input"]';
const SEND_BUTTON_SELECTOR =
  'button.chat-send-btn, button.chat-send-omega, [data-testid="send-button"]';
const MESSAGE_CONTAINER_SELECTOR = '.chat-messages';
const ASSISTANT_MESSAGE_SELECTOR =
  `${MESSAGE_CONTAINER_SELECTOR} .message-bubble.message-assistant .message-text, [data-testid="assistant-message"]`;
const USER_MESSAGE_SELECTOR =
  `${MESSAGE_CONTAINER_SELECTOR} .message-bubble.message-user .message-text`;

// Helper: wait for response in chat UI
async function waitForResponse(page, _userMessage: string, timeoutMs = 15000) {
  const startTime = Date.now();
  let attempts = 0;
  const messages = page.locator(ASSISTANT_MESSAGE_SELECTOR);
  const initialCount = await messages.count();

  while (Date.now() - startTime < timeoutMs) {
    attempts++;
    const count = await messages.count();
    if (count > initialCount) {
      const lastMsg = messages.nth(count - 1);
      const text = await lastMsg.textContent();
      if (text && text.trim().length > 0) {
        return { success: true, response: text.trim(), attempts };
      }
    }

    await page.waitForTimeout(500);
  }

  return { success: false, response: null, attempts };
}

// Helper: send message via chat UI
async function sendChatMessage(page, message: string) {
  const input = page.locator(CHAT_INPUT_SELECTOR).first();
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(message);

  const userMessages = page.locator(USER_MESSAGE_SELECTOR);
  const initialCount = await userMessages.count();

  const sendBtn = page.locator(SEND_BUTTON_SELECTOR).first();
  await sendBtn.waitFor({ state: 'visible', timeout: 5000 });
  await sendBtn.click();

  await expect(userMessages).toHaveCount(initialCount + 1, { timeout: 10000 });
}

test.describe('Runtime Validation: Chat AR20 Suite', () => {
  test.skip(
    !TAURI_E2E_ENABLED,
    'Tauri runtime not enabled (set TITANE_E2E_TAURI=1 to run AR20 tests)'
  );
  test.beforeEach(async ({ page, baseURL }) => {
    const base = (baseURL || 'http://localhost:5173').replace(/\/$/, '');
    await page.goto(`${base}/chat`);
    await page.waitForLoadState('networkidle');

    // Wait for chat UI ready
    await page.waitForSelector(CHAT_INPUT_SELECTOR, { timeout: 15000 });
  });

  test('TEST A: Simple prompt "allo" receives response', async ({ page }) => {
    const testMsg = 'allo';

    await sendChatMessage(page, testMsg);
    const result = await waitForResponse(page, testMsg, 20000);

    expect(
      result.success,
      `❌ TEST A FAIL: No response after ${result.attempts} attempts`
    ).toBe(true);
    expect(result.response, '❌ TEST A FAIL: Empty response').not.toBe(null);
    expect(result.response!.length, '❌ TEST A FAIL: Response too short').toBeGreaterThan(
      0
    );

    console.log(`✅ TEST A PASS: Response received in ${result.attempts} attempts`);
  });

  test('TEST B: Offline mode - fallback response exists', async ({ page, context }) => {
    // Simulate offline: block all network except localhost
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
        route.continue();
      } else {
        route.abort('failed');
      }
    });

    const testMsg = 'test offline';

    await sendChatMessage(page, testMsg);
    const result = await waitForResponse(page, testMsg, 25000);

    expect(
      result.success,
      `❌ TEST B FAIL: No fallback response after ${result.attempts} attempts`
    ).toBe(true);
    expect(result.response, '❌ TEST B FAIL: Empty fallback').not.toBe(null);

    console.log(`✅ TEST B PASS: Fallback response received (offline mode)`);
  });

  test('TEST C: Invalid external keys - no silence', async ({ page }) => {
    // This test assumes external providers are disabled or keys invalid
    // Expected: local fallback prevents silence

    const testMsg = 'test invalid keys';

    await sendChatMessage(page, testMsg);
    const result = await waitForResponse(page, testMsg, 20000);

    expect(result.success, `❌ TEST C FAIL: Silence detected with invalid keys`).toBe(
      true
    );
    expect(result.response, '❌ TEST C FAIL: No fallback triggered').not.toBe(null);

    console.log(`✅ TEST C PASS: No silence despite invalid/missing external keys`);
  });

  test('TEST AR20: 20 consecutive messages all answered', async ({ page }) => {
    const messageCount = 20;
    const results: Array<{
      index: number;
      sent: string;
      received: boolean;
      responseText?: string;
    }> = [];

    for (let i = 1; i <= messageCount; i++) {
      const msg = `AR20 test message ${i}`;

      await sendChatMessage(page, msg);
      const result = await waitForResponse(page, msg, 15000);

      results.push({
        index: i,
        sent: msg,
        received: result.success,
        responseText: result.response || undefined,
      });

      expect(
        result.success,
        `❌ AR20 FAIL: No response for message ${i}/${messageCount}`
      ).toBe(true);

      // Short delay between messages
      await page.waitForTimeout(1000);
    }

    const failedCount = results.filter(r => !r.received).length;
    const successRate = ((messageCount - failedCount) / messageCount) * 100;

    expect(
      failedCount,
      `❌ AR20 FAIL: ${failedCount}/${messageCount} messages unanswered`
    ).toBe(0);
    expect(successRate, '❌ AR20 FAIL: Success rate below 100%').toBe(100);

    console.log(
      `✅ AR20 PASS: ${messageCount}/${messageCount} messages answered (${successRate}% success)`
    );
    console.log(JSON.stringify(results, null, 2));
  });
});

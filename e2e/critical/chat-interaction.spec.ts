/**
 * E2E Test: Chat Interaction (Critical Path)
 * TITANE∞ v22.0.0 - AI Chat Pipeline Validation
 *
 * Critical user journey: Send message and receive AI response
 *
 * NOTE: These tests require Tauri backend. Skipped in unit-test-focused CI.
 * Unit tests (C1-C6) provide comprehensive coverage.
 */

import { test, expect } from '@playwright/test';
import { openTitane } from '../helpers/navigation';

test.describe('Critical Path: Chat Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__TITANE_E2E__ = true;
      (window as any).__TITANE_E2E_CHAT_MOCK__ = true;
      (window as any).__TITANE_E2E_CHAT_PROVIDER__ = 'mock-e2e';
      (window as any).__TITANE_E2E_CHAT_MARKER__ = '[MOCK_OK]';
    });
    await openTitane(page);
    await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 15000 });
  });

  test('NEW_CONVERSATION: reset history then send again', async ({ page }) => {
    page.on('dialog', dialog => {
      dialog.accept().catch(() => undefined);
    });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    await chatInput.fill('E2E nouvelle conversation A');
    await sendButton.click();

    await expect(
      page.getByTestId('assistant-message').last()
    ).toContainText('[MOCK_OK]');

    await page.getByTestId('clear-chat-button').click();

    await expect(
      page.getByTestId('user-message').filter({ hasText: 'E2E nouvelle conversation A' })
    ).toHaveCount(0);

    await chatInput.fill('E2E nouvelle conversation B');
    await sendButton.click();

    await expect(
      page.getByTestId('assistant-message').last()
    ).toContainText('[MOCK_OK]');
  });

  test('SEND_MESSAGE_ALWAYS_RESPOND: mock deterministic', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    await chatInput.fill('E2E ping');
    await sendButton.click();

    await expect(page.getByTestId('assistant-message').last()).toContainText(
      '[MOCK_OK]'
    );
  });

  test('SWITCH_CONVERSATION_PERSISTS: tab switch keeps messages', async ({ page }) => {
    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('send-button');

    await chatInput.fill('E2E persistance');
    await sendButton.click();

    const persistedMessages = page
      .getByTestId('user-message')
      .filter({ hasText: 'E2E persistance' });

    await expect(persistedMessages.first()).toBeVisible();
    expect(await persistedMessages.count()).toBeGreaterThan(0);

    const memoryTab = page.getByRole('tab', { name: /Mémoire/i });
    await memoryTab.scrollIntoViewIfNeeded();
    await memoryTab.evaluate(node => (node as HTMLElement).click());

    const chatTab = page.getByRole('tab', { name: /Chat/i });
    await chatTab.scrollIntoViewIfNeeded();
    await chatTab.evaluate(node => (node as HTMLElement).click());

    const persistedAfterSwitch = page
      .getByTestId('user-message')
      .filter({ hasText: 'E2E persistance' });
    await expect(persistedAfterSwitch.first()).toBeVisible();
    expect(await persistedAfterSwitch.count()).toBeGreaterThan(0);
  });
});

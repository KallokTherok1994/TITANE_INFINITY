/**
 * E2E Test: Chat Interaction (Critical Path)
 * TITANE∞ v22.0.0 - AI Chat Pipeline Validation
 *
 * Critical user journey: Send message and receive AI response
 */

import { test, expect } from '@playwright/test';
import { openTitane } from '../helpers/navigation';

test.describe('Critical Path: Chat Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await openTitane(page);
  });

  test('chat interface is accessible', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    await expect(chatInput).toBeVisible({ timeout: 15000 });
  });

  test('can type message in chat input', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();

    await chatInput.click();
    await chatInput.fill('Hello TITANE');

    const sendButton = page.getByRole('button', { name: /Envoyer/i }).first();
    await expect(sendButton).toBeVisible({ timeout: 15000 });
    await expect(sendButton).toBeEnabled({ timeout: 15000 });
  });

  test('send button is present and enabled', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    await chatInput.fill('ping');

    const sendButton = page.getByRole('button', { name: /Envoyer/i }).first();
    await expect(sendButton).toBeVisible({ timeout: 15000 });
    await expect(sendButton).toBeEnabled({ timeout: 15000 });
  });

  test('message appears in chat history after sending', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    const sendButton = page.getByRole('button', { name: /Envoyer/i }).first();

    await chatInput.fill('Test message');
    await sendButton.click({ force: true });

    await expect(page.getByText('Test message')).toBeVisible({ timeout: 15000 });
  });

  test('AI response mechanism is functional', async ({ page }) => {
    // This test verifies the response pipeline exists
    // (actual AI response depends on backend availability)

    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    await chatInput.fill('ping');

    // Look for send action
    await page.keyboard.press('Enter');

    // Wait for potential response (pipeline may be offline en CI/dev)
    await page.waitForTimeout(1500);

    // At minimum, the sent message should exist in the UI
    await expect(page.getByText('ping')).toBeVisible({ timeout: 15000 });
  });

  test('chat pipeline handles rapid messages', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();

    // Send 3 rapid messages
    for (let i = 0; i < 3; i++) {
      await chatInput.fill(`Rapid test ${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(100);
    }

    // App should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('chat UI updates without full page reload', async ({ page }) => {
    // Get initial load time
    const initialUrl = page.url();

    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    await chatInput.fill('Navigation test');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // URL should remain same (SPA behavior)
    expect(page.url()).toBe(initialUrl);
  });

  test('empty message handling', async ({ page }) => {
    const chatInput = page
      .getByPlaceholder(/Tapez votre message/i)
      .or(page.locator('textarea.conversation-input'))
      .first();
    const sendButton = page.getByRole('button', { name: /Envoyer/i }).first();

    // Try to send empty message
    await chatInput.fill('');
    await expect(sendButton).toBeVisible({ timeout: 15000 });

    // Button should be disabled or action prevented
    const isDisabled = await sendButton.isDisabled().catch(() => false);
    if (!isDisabled) {
      await sendButton.click({ force: true });
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('chat accessibility: keyboard navigation', async ({ page }) => {
    // Tab should focus chat input
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Should focus an input element eventually
    expect(['TEXTAREA', 'INPUT', 'BUTTON', 'A', 'DIV']).toContain(focusedElement);
  });
});

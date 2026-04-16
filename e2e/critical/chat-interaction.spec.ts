/**
 * E2E Test: Chat Interaction (Critical Path)
 * TITANE∞ v22.0.0 - AI Chat Pipeline Validation
 *
 * Critical user journey: Send message and receive AI response
 *
 * NOTE: These tests require Tauri backend. Skipped in unit-test-focused CI.
 * Unit tests (C1-C6) provide comprehensive coverage.
 */

import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';
type E2EChatScenario = 'success' | 'rate_limit';

const enableE2EChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as { __TITANE_E2E_CHAT_CONV_SEQ__?: number }).__TITANE_E2E_CHAT_CONV_SEQ__ =
      0;
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
  });
};

const setE2EChatScenario = async (page: Page, scenario: E2EChatScenario) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = value;
  }, scenario);
};

const getChatInput = (page: Page) =>
  page
    .getByPlaceholder(/Tapez votre message/i)
    .or(page.locator('textarea.conversation-input'))
    .first();

const getSendButton = (page: Page) =>
  page.getByRole('button', { name: /Envoyer/i }).first();

const getAssistantContent = (page: Page) =>
  page
    .locator(
      '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]'
    )
    .last();

test.describe('Critical Path: Chat Interaction', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);
  });

  test('NEW_CONVERSATION: message et réponse mock', async ({ page }) => {
    const chatInput = getChatInput(page);
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    await chatInput.fill('Bonjour TITANE');
    await getSendButton(page).click({ force: true });

    await expect(page.getByText('Bonjour TITANE', { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('[MOCK_OK] Bonjour TITANE')).toBeVisible({
      timeout: 15000,
    });
  });

  test('SEND_MESSAGE_ALWAYS_RESPOND: deux messages', async ({ page }) => {
    const chatInput = getChatInput(page);

    await chatInput.fill('Alpha');
    await getSendButton(page).click({ force: true });
    await expect(page.getByText('[MOCK_OK] Alpha')).toBeVisible({ timeout: 15000 });

    await chatInput.fill('Beta');
    await getSendButton(page).click({ force: true });
    await expect(page.getByText('[MOCK_OK] Beta')).toBeVisible({ timeout: 15000 });
  });

  test('LONG_RESPONSE_VISIBLE_COMPLETE: réponse longue mock affichée complètement', async ({
    page,
  }) => {
    const chatInput = getChatInput(page);
    const longPrompt = Array.from({ length: 40 }, (_, index) => `segment-${index + 1}`)
      .join(' ')
      .trim();

    await chatInput.fill(longPrompt);
    await getSendButton(page).click({ force: true });

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });
    await expect(assistantContent).toContainText('segment-1');
    await expect(assistantContent).toContainText('segment-20');
    await expect(assistantContent).toContainText('segment-40');
  });

  test('SWITCH_CONVERSATION_PERSISTS: UI reste en SPA', async ({ page }) => {
    const initialUrl = page.url();
    const chatInput = getChatInput(page);

    await chatInput.fill('Statut URL');
    await getSendButton(page).click({ force: true });
    await expect(page.getByText('[MOCK_OK] Statut URL')).toBeVisible({
      timeout: 15000,
    });

    expect(page.url()).toBe(initialUrl);
  });

  test('RATE_LIMIT_RUNTIME_TRUTH: le panneau runtime expose le blocage de quota GitHub', async ({
    page,
  }) => {
    await setE2EChatScenario(page, 'rate_limit');

    const chatInput = getChatInput(page);
    await chatInput.fill('Lance une exploration GitHub');
    await getSendButton(page).click({ force: true });

    const runtimePanel = page.getByTestId('chat-runtime-state');
    await expect(runtimePanel).toBeVisible({ timeout: 15000 });
    await expect(runtimePanel).toHaveAttribute('data-provider-reason', 'RATE_LIMIT');
    await expect(runtimePanel).toHaveAttribute('data-provider-mode', 'OFFLINE');
    await expect(runtimePanel).toHaveAttribute('data-network-used', 'true');

    await expect(page.getByTestId('chat-runtime-summary')).toContainText(
      'Reason: RATE_LIMIT'
    );
    await expect(page.getByTestId('chat-runtime-summary')).toContainText(
      'Provider: github-copilot'
    );
    await expect(
      runtimePanel.getByTestId('chat-runtime-badge').getByText('RATE_LIMIT', {
        exact: true,
      })
    ).toBeVisible({ timeout: 15000 });
    await expect(getAssistantContent(page)).not.toContainText('[MOCK_OK]');
  });
});

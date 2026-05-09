import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

const disableChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    delete (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__;
    (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__ = false;
  });
};

test.describe('ThinkingPanel — live cognitive trace certification', () => {
  test.skip(!FULL_E2E_ENABLED, 'Full E2E requires TITANE_E2E_FULL=1 and runtime backend');

  test.beforeEach(async ({ page }) => {
    await disableChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);
  });

  test('LIVE_OLLAMA_COGNITIVE_TRACE_VISIBLE_IN_THINKING_PANEL', async ({ page }) => {
    const mockState = await page.evaluate(() => {
      const value = (window as Record<string, unknown>).__TITANE_E2E_CHAT_MOCK__;
      return value === undefined || value === false;
    });
    expect(mockState).toBe(true);

    const assistantMessages = page.locator('[data-testid="chat-message-assistant"]');
    const beforeCount = await assistantMessages.count();

    const input = page.getByTestId('chat-input');
    await input.waitFor({ state: 'visible', timeout: 20_000 });
    await input.fill(
      'Décris en deux phrases le rôle de TITANE comme assistant local de clarté.'
    );
    await input.press('Enter');

    await expect(async () => {
      const currentCount = await assistantMessages.count();
      expect(currentCount).toBeGreaterThan(beforeCount);
    }).toPass({ timeout: 60_000 });

    const lastAssistantMessage = assistantMessages.last();
    await expect(lastAssistantMessage).toBeVisible({ timeout: 20_000 });
    await expect(lastAssistantMessage).not.toContainText('[MOCK_OK]', {
      timeout: 20_000,
    });

    const panel = page.locator('[data-testid="reasoning-progress"][data-state="done"]');
    await expect(panel).toBeVisible({ timeout: 30_000 });
    await panel.click();

    await page.getByRole('button', { name: /^Expert$/ }).click();

    await expect(page.getByTestId('reasoning-cognitive-trace')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('reasoning-cognitive-verdict')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('reasoning-cognitive-web-policy')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('reasoning-cognitive-quality-action')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('reasoning-cognitive-meta-guard')).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId('reasoning-cognitive-meta-enforcement')).toBeVisible({
      timeout: 20_000,
    });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('chainOfThought');
    expect(bodyText).not.toContain('hiddenThoughts');
    expect(bodyText).not.toContain('rawReasoning');
    expect(bodyText).not.toContain('privateReasoning');
    expect(bodyText).not.toContain('internalReasoningSteps');
  });
});

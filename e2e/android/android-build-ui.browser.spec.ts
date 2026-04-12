import { test, expect } from '@playwright/test';
import path from 'node:path';
import {
  collectConsoleAndPageErrors,
  extractCriticalPageErrors,
  extractCriticalConsoleErrors,
  filterKnownConsoleNoise,
  nowIso,
  waitForCondition,
  writeJsonArtifact,
} from './helpers';

const ARTIFACT_DIR = path.resolve(process.cwd(), 'reports/e2e/android-ui/browser');

test.describe('Android Build UI - Browser and Android Emulation', () => {
  test('renders core conversation UI and exports required UI maps', async ({ page }) => {
    const startedAt = Date.now();
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });

    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    const userMessages = page.getByTestId('chat-message-user');
    const assistantMessages = page.getByTestId('chat-message-assistant');
    const chatError = page.getByTestId('chat-error');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    const userCountBefore = await userMessages.count();
    const assistantCountBefore = await assistantMessages.count();

    await chatInput.fill('Android UI smoke message');
    await expect(chatInput).toHaveValue('Android UI smoke message');
    await sendButton.click({ force: true });

    await expect(userMessages).toHaveCount(userCountBefore + 1, { timeout: 15000 });

    // Non-silence contract: assistant response OR visible chat error.
    const noSilence = await waitForCondition(async () => {
      const assistantCount = await assistantMessages.count();
      const hasChatError = await chatError.isVisible().catch(() => false);
      return assistantCount > assistantCountBefore || hasChatError;
    }, { timeoutMs: 25000, intervalMs: 500 });

    expect(noSilence).toBe(true);

    const viewport = page.viewportSize();
    const route = page.url();

    const domMap = await page.evaluate(() => {
      const has = (selector: string) => Boolean(document.querySelector(selector));
      return {
        pageTitane: has('[data-testid="page-titane"]'),
        pageConversation: has('[data-testid="page-conversation"]'),
        chatInput: has('[data-testid="chat-input"]'),
        chatSend: has('[data-testid="chat-send"]'),
        userMessage: has('[data-testid="chat-message-user"]'),
        assistantMessage: has('[data-testid="chat-message-assistant"]'),
        tabConversation: has('[data-testid="tab-conversation"]'),
        tabTitane: has('[data-testid="tab-titane"]'),
      };
    });

    const requiredSelectors = [
      '[data-testid="page-titane"]',
      '[data-testid="tab-conversation"]',
      '[data-testid="page-conversation"]',
      '[data-testid="chat-input"]',
      '[data-testid="chat-send"]',
    ];

    const ar20 = await page.evaluate(selectors => {
      const present = selectors.filter(selector => document.querySelector(selector));
      return {
        requiredSelectors: selectors,
        presentCount: present.length,
        requiredCount: selectors.length,
        ratio: selectors.length === 0 ? 0 : present.length / selectors.length,
      };
    }, requiredSelectors);

    const offline5 = await page.evaluate(() => {
      const offline = document.querySelector('[data-testid="offline-indicator"]');
      const retry = document.querySelector('[data-testid="retry-indicator"]');
      const runtime = document.querySelector('[data-testid="chat-runtime-state"]');
      return {
        offlineIndicatorPresent: Boolean(offline),
        retryIndicatorPresent: Boolean(retry),
        runtimeStatePresent: Boolean(runtime),
      };
    });

    const navigation = await page.evaluate(() => {
      const text = (el: Element | null) => (el?.textContent ?? '').trim();
      return {
        hasMainNavigation: Boolean(document.querySelector('nav,[role="navigation"]')),
        activeTabLabel:
          text(document.querySelector('[data-testid="tab-conversation"][aria-selected="true"]')) ||
          text(document.querySelector('[data-testid="tab-conversation"]')),
      };
    });

    // Quick responsive sanity check for mobile-like viewport behavior.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('tab-conversation')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();

    const mobileInputMetrics = await page.getByTestId('chat-input').evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: window.innerHeight,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    const assistantCountAfter = await assistantMessages.count();
    const chatErrorVisible = await chatError.isVisible().catch(() => false);

    const stability = {
      startedAt: nowIso(),
      durationMs: Date.now() - startedAt,
      consoleErrorCount: filteredErrors.length,
      consoleErrors: filteredErrors,
      criticalConsoleErrorCount: criticalErrors.length,
      criticalConsoleErrors: criticalErrors,
      pageErrorCount: pageErrors.length,
      pageErrors,
      criticalPageErrorCount: criticalPageErrors.length,
      criticalPageErrors,
      userMessageCount: await userMessages.count(),
      assistantMessageCount: assistantCountAfter,
      chatErrorVisible,
      noSilence,
      mobileInputNearBottom:
        mobileInputMetrics.bottom >= mobileInputMetrics.viewportHeight * 0.6,
      mobileInputMetrics,
    };

    writeJsonArtifact(ARTIFACT_DIR, 'page_classification.json', {
      route,
      viewport,
      project: test.info().project.name,
      mobileLike: Boolean(viewport && viewport.width <= 768),
    });
    writeJsonArtifact(ARTIFACT_DIR, 'chat_dom_map.json', domMap);
    writeJsonArtifact(ARTIFACT_DIR, 'AR20.json', ar20);
    writeJsonArtifact(ARTIFACT_DIR, 'OFFLINE5.json', offline5);
    writeJsonArtifact(ARTIFACT_DIR, 'navigation.json', navigation);
    writeJsonArtifact(ARTIFACT_DIR, 'stability.json', stability);

    expect(ar20.presentCount).toBe(ar20.requiredCount);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
    expect(stability.mobileInputNearBottom).toBe(true);
  });
});

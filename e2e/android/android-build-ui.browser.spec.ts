import { test, expect } from '@playwright/test';
import path from 'node:path';
import {
  extractCriticalConsoleErrors,
  filterKnownConsoleNoise,
  writeJsonArtifact,
} from './helpers';

const ARTIFACT_DIR = path.resolve(process.cwd(), 'reports/e2e/android-ui/browser');

test.describe('Android Build UI - Browser and Android Emulation', () => {
  test('renders core conversation UI and exports required UI maps', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });

    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    await chatInput.fill('Android UI smoke message');
    await expect(chatInput).toHaveValue('Android UI smoke message');

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

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);

    const stability = {
      consoleErrorCount: filteredErrors.length,
      consoleErrors: filteredErrors,
      criticalConsoleErrorCount: criticalErrors.length,
      criticalConsoleErrors: criticalErrors,
      userMessageCount: await page.getByTestId('chat-message-user').count(),
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
  });
});

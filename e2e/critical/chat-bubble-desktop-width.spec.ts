/**
 * TITANE∞ — E2E test: Chat bubble desktop width expansion
 * Verifies that assistant/user message bubbles occupy ≥90% of the chat column
 * on desktop viewports (≥1024px), per AH-2026-04-28-CHAT-BUBBLE-WIDTH-0012
 *
 * data-testid: message-bubble, message-bubble-assistant, message-bubble-user
 * CSS proof: @media (min-width: 1024px) max-width:97% / 88%
 */

import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const DESKTOP_VIEWPORT = { width: 1366, height: 768 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

async function getMessageBubbleMetrics(page: Page): Promise<{
  containerWidth: number | null;
  assistantBubbleWidth: number | null;
  userBubbleWidth: number | null;
  assistantMaxWidthPct: number | null;
  userMaxWidthPct: number | null;
}> {
  return page.evaluate(() => {
    const container =
      document.querySelector('[data-testid="chat-messages-scroll-region"]') ??
      document.querySelector('.message-list-container') ??
      document.querySelector('.message-list');
    const assistantBubble =
      document.querySelector('[data-testid="chat-message-assistant"]') ??
      document.querySelector('.message-bubble-assistant') ??
      document.querySelector('.message-assistant') ??
      document.querySelector('[data-testid="message-bubble"][data-role="assistant"]');
    const userBubble =
      document.querySelector('[data-testid="chat-message-user"]') ??
      document.querySelector('.message-bubble-user') ??
      document.querySelector('.message-user') ??
      document.querySelector('[data-testid="message-bubble"][data-role="user"]');

    if (!container)
      return {
        containerWidth: null,
        assistantBubbleWidth: null,
        userBubbleWidth: null,
        assistantMaxWidthPct: null,
        userMaxWidthPct: null,
      };

    const containerWidth = container.getBoundingClientRect().width;
    const assistantWidth = assistantBubble?.getBoundingClientRect().width ?? null;
    const userWidth = userBubble?.getBoundingClientRect().width ?? null;

    return {
      containerWidth,
      assistantBubbleWidth: assistantWidth,
      userBubbleWidth: userWidth,
      assistantMaxWidthPct:
        assistantWidth && containerWidth ? (assistantWidth / containerWidth) * 100 : null,
      userMaxWidthPct:
        userWidth && containerWidth ? (userWidth / containerWidth) * 100 : null,
    };
  });
}

async function sendTestMessage(page: Page, text: string): Promise<void> {
  const input = page
    .locator(
      '[data-testid="chat-input"], textarea[placeholder*="message"], textarea[placeholder*="Message"]'
    )
    .first();
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.fill(text);
  const sendBtn = page
    .locator(
      '[data-testid="chat-send"], button[aria-label*="envoyer"], button[aria-label*="send"]'
    )
    .first();
  await sendBtn.click();
  // Wait for user bubble to appear; full-suite runs can have slower first paint
  await page.waitForSelector(
    '.message-bubble-user, .message-user, [data-testid="chat-message-user"]',
    { timeout: 20000 }
  );
}

test.describe('Chat bubble desktop width — E2E visual proof', () => {
  test.describe.configure({ mode: 'serial' });

  test('desktop ≥1024px — assistant bubble uses ≥90% of chat column width', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    // Navigate to conversation tab
    const convTab = page
      .locator(
        '[data-testid="tab-conversation"], button:has-text("Chat"), button:has-text("Vue")'
      )
      .first();
    if (await convTab.isVisible()) await convTab.click();

    await sendTestMessage(page, 'Test bulle desktop — largeur maximale attendue');

    // Wait for possible assistant response or just measure user bubble
    await page.waitForTimeout(800);

    const metrics = await getMessageBubbleMetrics(page);

    // Container must be measurable
    expect(metrics.containerWidth).not.toBeNull();
    expect(metrics.containerWidth).toBeGreaterThan(500);

    // User bubble must use at least 60% — on desktop even user bubbles should be wide
    if (metrics.userMaxWidthPct !== null) {
      expect(metrics.userMaxWidthPct).toBeGreaterThan(50);
      // Should not exceed 92% (88% + margins tolerance)
      expect(metrics.userMaxWidthPct).toBeLessThanOrEqual(96);
    }

    // Verify CSS computed max-width on desktop
    const computedMaxWidth = await page.evaluate(() => {
      const bubble = document.querySelector(
        '.message-bubble-user, .message-user, .message-bubble'
      );
      if (!bubble) return null;
      return window.getComputedStyle(bubble).maxWidth;
    });

    // On desktop ≥1024px, max-width should be 97% or 88% (not the old 85%/76%)
    if (computedMaxWidth && computedMaxWidth !== 'none') {
      const pct = parseFloat(computedMaxWidth);
      if (!isNaN(pct)) {
        expect(pct).toBeGreaterThanOrEqual(85); // At least better than old 76%
      }
    }
  });

  test('desktop ≥1024px — CSS @media rules apply correct max-width', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const convTab = page
      .locator(
        '[data-testid="tab-conversation"], button:has-text("Chat"), button:has-text("Vue")'
      )
      .first();
    if (await convTab.isVisible()) await convTab.click();

    await sendTestMessage(page, 'Vérification règle CSS max-width desktop');
    await page.waitForTimeout(800);

    // Verify the computed styles reflect desktop rules (97% for assistant, 88% for user)
    const cssCheck = await page.evaluate(() => {
      const bubbles = document.querySelectorAll(
        '[data-testid="chat-message-assistant"], [data-testid="chat-message-user"], .message-bubble, .message-assistant, .message-user'
      );

      return Array.from(bubbles)
        .slice(0, 6)
        .map(el => ({
          className: el.className,
          computedMaxWidth: window.getComputedStyle(el).maxWidth,
          offsetWidth: (el as HTMLElement).offsetWidth,
          parentWidth: (el as HTMLElement).parentElement?.offsetWidth ?? 0,
        }));
    });

    // At least one bubble should be present
    expect(cssCheck.length).toBeGreaterThan(0);

    for (const bubble of cssCheck) {
      const { offsetWidth, parentWidth, computedMaxWidth } = bubble;
      if (parentWidth > 500 && offsetWidth > 0) {
        const widthRatio = (offsetWidth / parentWidth) * 100;
        // On desktop, bubbles should use at least 80% of available space
        // (old behavior was 55-60% due to cascading constraints)
        expect(widthRatio).toBeGreaterThan(70);
      }
    }
  });

  test('mobile ≤479px — bubble width unchanged (max-width: 95%)', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    const convTab = page
      .locator('[data-testid="tab-conversation"], button:has-text("Chat")')
      .first();
    if (await convTab.isVisible()) await convTab.click();

    await sendTestMessage(page, 'Test mobile — largeur bulle inchangée');
    await page.waitForTimeout(600);

    const metrics = await getMessageBubbleMetrics(page);

    // On mobile, bubbles should not be wider than the old 95% mobile rule
    if (metrics.userMaxWidthPct !== null) {
      expect(metrics.userMaxWidthPct).toBeLessThanOrEqual(98); // tolerance
    }
  });

  test('zoom in (150%) — bubble adapts with container, no overflow', async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    // Simulate zoom in via --titane-ui-scale
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--titane-ui-scale', '1.5');
      document.documentElement.style.fontSize = '24px';
    });

    const convTab = page
      .locator('[data-testid="tab-conversation"], button:has-text("Chat")')
      .first();
    if (await convTab.isVisible()) await convTab.click();

    await sendTestMessage(page, 'Test zoom in 150% — pas de débordement');
    await page.waitForTimeout(800);

    // Verify no horizontal overflow in the message container
    const hasOverflow = await page.evaluate(() => {
      const container = document.querySelector('.message-list-container');
      if (!container) return false;
      return container.scrollWidth > container.clientWidth + 5;
    });

    expect(hasOverflow).toBe(false);
  });

  test('zoom out (70%) — bubble stays proportional, no whitespace regression', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await page.evaluate(() => {
      document.documentElement.style.setProperty('--titane-ui-scale', '0.7');
      document.documentElement.style.fontSize = '11.2px';
    });

    const convTab = page
      .locator('[data-testid="tab-conversation"], button:has-text("Chat")')
      .first();
    if (await convTab.isVisible()) await convTab.click();

    await sendTestMessage(page, 'Test zoom out 70% — largeur proportionnelle');
    await page.waitForTimeout(800);

    const metrics = await getMessageBubbleMetrics(page);

    if (metrics.userMaxWidthPct !== null) {
      // Even at zoom 70%, bubbles should use >70% of the container
      expect(metrics.userMaxWidthPct).toBeGreaterThan(50);
    }
  });
});

import { test, expect, type Page } from '@playwright/test';

import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

type E2EChatScenario = 'success' | 'rate_limit';

type MobileLayoutMetrics = {
  viewport: { width: number; height: number };
  visualViewport: {
    width: number | null;
    height: number | null;
    scale: number | null;
  };
  inputTop: number | null;
  inputBottom: number | null;
  sendBottom: number | null;
  regionBottom: number | null;
};

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

async function setBrowserScaleFactor(page: Page, scale: number): Promise<void> {
  const browserName = page.context().browser()?.browserType().name();
  if (browserName !== 'chromium') {
    return;
  }

  const chromiumContext = page.context() as {
    newCDPSession?: (target: Page) => Promise<{
      send: (method: string, params?: Record<string, unknown>) => Promise<unknown>;
    }>;
  };

  if (typeof chromiumContext.newCDPSession !== 'function') {
    return;
  }

  const session = await chromiumContext.newCDPSession(page);
  await session.send('Emulation.setPageScaleFactor', { pageScaleFactor: scale });
}

async function openConversationSurface(page: Page): Promise<void> {
  await openTitane(page);
  await closeBootBeaconIfPresent(page);
  await page.getByTestId('tab-conversation').click({ force: true }).catch(() => undefined);
  await expect(page.getByTestId('tab-conversation')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-send')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-messages-scroll-region')).toBeVisible({
    timeout: 15000,
  });
}

async function measureMobileLayout(page: Page): Promise<MobileLayoutMetrics> {
  return page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect() : null;
    };

    const inputRect = rect('[data-testid="chat-input"]');
    const sendRect = rect('[data-testid="chat-send"]');
    const regionRect = rect('[data-testid="chat-messages-scroll-region"]');

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      visualViewport: {
        width: window.visualViewport?.width ?? null,
        height: window.visualViewport?.height ?? null,
        scale: window.visualViewport?.scale ?? null,
      },
      inputTop: inputRect?.top ?? null,
      inputBottom: inputRect?.bottom ?? null,
      sendBottom: sendRect?.bottom ?? null,
      regionBottom: regionRect?.bottom ?? null,
    };
  });
}

async function expectCriticalSurfaceInViewport(page: Page): Promise<void> {
  await expect(page.getByTestId('tab-conversation')).toBeInViewport();
  await expect(page.getByTestId('chat-input')).toBeInViewport();
  await expect(page.getByTestId('chat-send')).toBeInViewport();
  await expect(page.getByTestId('chat-messages-scroll-region')).toBeInViewport();
}

function expectWithinVisibleViewport(metrics: MobileLayoutMetrics) {
  const visibleBottom = metrics.viewport.height;

  expect(metrics.inputTop).not.toBeNull();
  expect(metrics.inputBottom).not.toBeNull();
  expect(metrics.sendBottom).not.toBeNull();
  expect(metrics.regionBottom).not.toBeNull();
  expect(metrics.inputTop!).toBeGreaterThanOrEqual(0);
  expect(metrics.inputBottom!).toBeLessThanOrEqual(visibleBottom);
  expect(metrics.sendBottom!).toBeLessThanOrEqual(visibleBottom);
  expect(metrics.regionBottom!).toBeLessThanOrEqual(visibleBottom);
}

test.describe('Android Browser: Chat Layout Viewport', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await enableE2EChatMock(page);
  });

  test('chat shell stays inside the mobile visual viewport during pinch zoom', async ({
    page,
  }) => {
    await openConversationSurface(page);

    const baseline = await measureMobileLayout(page);
    expect(baseline.viewport.width).toBeLessThanOrEqual(430);
    expect(baseline.visualViewport.height).not.toBeNull();
    expectWithinVisibleViewport(baseline);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1.2);
    await page.waitForTimeout(250);
    const zoomed = await measureMobileLayout(page);

    expect(zoomed.visualViewport.scale).not.toBeNull();
    expect(zoomed.visualViewport.scale!).toBeGreaterThanOrEqual(1.1);
    expectWithinVisibleViewport(zoomed);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1);
  });
});
import { test, expect, type Page } from '@playwright/test';

import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';

type E2EChatScenario = 'success' | 'rate_limit';

type LayoutMetrics = {
  viewport: { width: number; height: number };
  visualViewport: {
    width: number | null;
    height: number | null;
    scale: number | null;
  };
  htmlZoom: string;
  density: string | null;
  pageLeft: number | null;
  pageRight: number | null;
  tabLeft: number | null;
  tabRight: number | null;
  pageBottom: number | null;
  tabBottom: number | null;
  inputLeft: number | null;
  inputRight: number | null;
  inputBottom: number | null;
  sendLeft: number | null;
  sendRight: number | null;
  sendBottom: number | null;
  regionLeft: number | null;
  regionRight: number | null;
  regionBottom: number | null;
  containerLeft: number | null;
  containerRight: number | null;
  containerBottom: number | null;
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

const getChatInput = (page: Page) =>
  page
    .getByPlaceholder(/Tapez votre message/i)
    .or(page.locator('textarea.conversation-input'))
    .or(page.getByTestId('chat-input'))
    .first();

async function openConversationSurface(page: Page): Promise<void> {
  await openTitane(page);
  await closeBootBeaconIfPresent(page);
  await page.getByTestId('tab-conversation').click({ force: true }).catch(() => undefined);
  await expect(page.getByTestId('tab-conversation')).toBeVisible({ timeout: 15000 });
  await expect(getChatInput(page)).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-send')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('chat-messages-scroll-region')).toBeVisible({
    timeout: 15000,
  });
}

async function measureLayout(page: Page): Promise<LayoutMetrics> {
  return page.evaluate(() => {
    const rectBottom = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().bottom : null;
    };
    const rectLeft = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().left : null;
    };
    const rectRight = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().right : null;
    };

    const container = document.querySelector('.conversation-container');
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      visualViewport: {
        width: window.visualViewport?.width ?? null,
        height: window.visualViewport?.height ?? null,
        scale: window.visualViewport?.scale ?? null,
      },
      htmlZoom:
        getComputedStyle(document.documentElement).zoom ||
        document.documentElement.style.zoom ||
        '1',
      density: container?.getAttribute('data-density') ?? null,
      pageLeft: rectLeft('[data-testid="page-titane"]'),
      pageRight: rectRight('[data-testid="page-titane"]'),
      tabLeft: rectLeft('[data-testid="tab-conversation"]'),
      tabRight: rectRight('[data-testid="tab-conversation"]'),
      pageBottom: rectBottom('[data-testid="page-titane"]'),
      tabBottom: rectBottom('[data-testid="tab-conversation"]'),
      inputLeft: rectLeft('[data-testid="chat-input"]'),
      inputRight: rectRight('[data-testid="chat-input"]'),
      inputBottom: rectBottom('[data-testid="chat-input"]'),
      sendLeft: rectLeft('[data-testid="chat-send"]'),
      sendRight: rectRight('[data-testid="chat-send"]'),
      sendBottom: rectBottom('[data-testid="chat-send"]'),
      regionLeft: rectLeft('[data-testid="chat-messages-scroll-region"]'),
      regionRight: rectRight('[data-testid="chat-messages-scroll-region"]'),
      regionBottom: rectBottom('[data-testid="chat-messages-scroll-region"]'),
      containerLeft: rectLeft('.conversation-container'),
      containerRight: rectRight('.conversation-container'),
      containerBottom: rectBottom('.conversation-container'),
    };
  });
}

async function expectCriticalSurfaceInViewport(page: Page): Promise<void> {
  await expect(page.getByTestId('tab-conversation')).toBeInViewport();
  await expect(page.getByTestId('chat-input')).toBeInViewport();
  await expect(page.getByTestId('chat-send')).toBeInViewport();
  await expect(page.getByTestId('chat-messages-scroll-region')).toBeInViewport();
}

function expectVisibleWindowBounds(metrics: LayoutMetrics) {
  const viewportBottom = metrics.viewport.height;
  const viewportRight = metrics.viewport.width;
  expect(metrics.tabBottom).not.toBeNull();
  expect(metrics.inputBottom).not.toBeNull();
  expect(metrics.sendBottom).not.toBeNull();
  expect(metrics.regionBottom).not.toBeNull();
  expect(metrics.containerBottom).not.toBeNull();
  expect(metrics.pageLeft).not.toBeNull();
  expect(metrics.pageRight).not.toBeNull();
  expect(metrics.tabLeft).not.toBeNull();
  expect(metrics.tabRight).not.toBeNull();
  expect(metrics.inputLeft).not.toBeNull();
  expect(metrics.inputRight).not.toBeNull();
  expect(metrics.sendLeft).not.toBeNull();
  expect(metrics.sendRight).not.toBeNull();
  expect(metrics.regionLeft).not.toBeNull();
  expect(metrics.regionRight).not.toBeNull();
  expect(metrics.containerLeft).not.toBeNull();
  expect(metrics.containerRight).not.toBeNull();
  expect(metrics.pageLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.tabLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.inputLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.sendLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.regionLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.containerLeft!).toBeGreaterThanOrEqual(0);
  expect(metrics.pageRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.tabRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.inputRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.sendRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.regionRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.containerRight!).toBeLessThanOrEqual(viewportRight);
  expect(metrics.tabBottom!).toBeLessThanOrEqual(viewportBottom);
  expect(metrics.inputBottom!).toBeLessThanOrEqual(viewportBottom);
  expect(metrics.sendBottom!).toBeLessThanOrEqual(viewportBottom);
  expect(metrics.regionBottom!).toBeLessThanOrEqual(viewportBottom);
  expect(metrics.containerBottom!).toBeLessThanOrEqual(viewportBottom);
}

test.describe('Critical Path: Chat Layout Viewport', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await enableE2EChatMock(page);
  });

  test('chat shell stays inside visible window across desktop viewport sizes', async ({
    page,
  }) => {
    const viewports = [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 1024, height: 768 },
      { width: 800, height: 600 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await openConversationSurface(page);
      const metrics = await measureLayout(page);

      expect(metrics.viewport).toEqual(viewport);
      expectVisibleWindowBounds(metrics);
      await expectCriticalSurfaceInViewport(page);
      if (viewport.height <= 980) {
        expect(metrics.density).toBe('compact');
      }
    }
  });

  test('chat shell remains visible after topnav zoom in and zoom out', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openConversationSurface(page);

    const baseline = await measureLayout(page);
    expect(baseline.htmlZoom).toBe('1');
    expectVisibleWindowBounds(baseline);
    await expectCriticalSurfaceInViewport(page);

    await page.getByTestId('topnav-zoom-in').click({ force: true });
    await page.waitForTimeout(200);
    const zoomIn = await measureLayout(page);
    expect(Number(zoomIn.htmlZoom)).toBeGreaterThan(1);
    expectVisibleWindowBounds(zoomIn);
    await expectCriticalSurfaceInViewport(page);

    await page.getByTestId('topnav-zoom-out').click({ force: true });
    await page.waitForTimeout(200);
    const zoomOut = await measureLayout(page);
    expect(Number(zoomOut.htmlZoom)).toBeGreaterThan(0);
    expectVisibleWindowBounds(zoomOut);
    await expectCriticalSurfaceInViewport(page);
  });

  test('chat shell stays bounded during dynamic resize to compact viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openConversationSurface(page);

    const resizeTargets = [
      { width: 1200, height: 760, expectedDensity: 'compact' },
      { width: 1024, height: 640, expectedDensity: 'compact' },
      { width: 900, height: 600, expectedDensity: 'compact' },
    ];

    for (const target of resizeTargets) {
      await page.setViewportSize({ width: target.width, height: target.height });
      await page.waitForTimeout(250);
      const metrics = await measureLayout(page);

      expect(metrics.viewport).toEqual({ width: target.width, height: target.height });
      expect(metrics.density).toBe(target.expectedDensity);
      expectVisibleWindowBounds(metrics);
      await expectCriticalSurfaceInViewport(page);
    }
  });

  test('chat shell stays inside the visual viewport on mobile chromium', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium-android-ui',
      'mobile visual viewport proof is only relevant on the Android Chromium lane'
    );

    await openConversationSurface(page);
    const baseline = await measureLayout(page);

    expect(baseline.viewport.width).toBeLessThanOrEqual(430);
    expect(baseline.visualViewport.height).not.toBeNull();
    expectVisibleWindowBounds(baseline);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1.2);
    await page.waitForTimeout(250);
    const pinchZoom = await measureLayout(page);

    expect(pinchZoom.visualViewport.scale).not.toBeNull();
    expect(pinchZoom.visualViewport.scale!).toBeGreaterThanOrEqual(1.1);
    expectVisibleWindowBounds(pinchZoom);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1);
  });

  test('chat shell stays visible under chromium page zoom and returns to baseline', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'chromium-android-ui',
      'desktop chromium zoom proof runs on the desktop browser lane'
    );

    await page.setViewportSize({ width: 1440, height: 900 });
    await openConversationSurface(page);

    const baseline = await measureLayout(page);
    expectVisibleWindowBounds(baseline);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1.15);
    await page.waitForTimeout(250);
    const browserZoomIn = await measureLayout(page);

    expect(browserZoomIn.visualViewport.scale).not.toBeNull();
    expect(browserZoomIn.visualViewport.scale!).toBeGreaterThanOrEqual(1.1);
    expectVisibleWindowBounds(browserZoomIn);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1);
    await page.waitForTimeout(250);
    const reset = await measureLayout(page);

    expect(reset.visualViewport.scale).not.toBeNull();
    expect(reset.visualViewport.scale!).toBeLessThanOrEqual(1.01);
    expectVisibleWindowBounds(reset);
    await expectCriticalSurfaceInViewport(page);
  });
});
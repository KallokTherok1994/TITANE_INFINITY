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
  devicePixelRatio: number | null;
  effectiveViewportHeight: number | null;
  conversationViewportHeight: number | null;
  htmlZoom: string;
  uiScale: string;
  density: string | null;
  pageLeft: number | null;
  pageRight: number | null;
  tabLeft: number | null;
  tabRight: number | null;
  pageBottom: number | null;
  tabBottom: number | null;
  inputLeft: number | null;
  inputRight: number | null;
  inputTop: number | null;
  inputBottom: number | null;
  sendLeft: number | null;
  sendRight: number | null;
  sendTop: number | null;
  sendBottom: number | null;
  regionLeft: number | null;
  regionRight: number | null;
  regionBottom: number | null;
  containerLeft: number | null;
  containerRight: number | null;
  containerBottom: number | null;
  panelLeft: number | null;
  panelRight: number | null;
  panelTop: number | null;
  panelBottom: number | null;
  panelHidden: boolean;
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

const getAssistantContent = (page: Page) =>
  page.getByTestId('chat-message-assistant').getByTestId('chat-message-content').last();

const buildLongStructuredPrompt = () => {
  const paragraphs = Array.from(
    { length: 16 },
    (_, index) =>
      `Paragraphe ${index + 1}: la zone scroll doit permettre d atteindre le bloc terminal sans sortir du viewport.`
  ).join('\n\n');

  return [
    '# Rapport complet',
    '',
    'Introduction de verification.',
    '',
    '- Segment A',
    '- Segment B',
    '',
    '> Citation de controle',
    '',
    '| Bloc | Etat |',
    '| --- | --- |',
    '| Debut | visible |',
    '| Terminal | attendu |',
    '',
    '```json',
    '{"marker":"SIGMA-CODE"}',
    '```',
    '',
    paragraphs,
    '',
    '## Bloc terminal',
    'OMEGA-FINAL-BLOCK',
  ].join('\n');
};

const submitChatMessage = async (page: Page, message: string) => {
  const chatInput = getChatInput(page);
  await chatInput.fill(message);
  await chatInput.press('Enter');
};

async function openConversationSurface(page: Page): Promise<void> {
  await openTitane(page);
  await closeBootBeaconIfPresent(page);
  await page
    .getByTestId('tab-conversation')
    .click({ force: true })
    .catch(() => undefined);
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
    const rectTop = (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().top : null;
    };

    const container = document.querySelector('.conversation-container');
    const panelContent = document.querySelector(
      '[data-testid="agent-dashboards-panel-content"]'
    );
    const conversationViewportHeightValue = container
      ? getComputedStyle(container).getPropertyValue('--conversation-vh').trim()
      : '';
    const effectiveViewportHeight = Math.floor(
      window.innerHeight /
        ((typeof window.visualViewport?.scale === 'number' &&
        Number.isFinite(window.visualViewport.scale) &&
        window.visualViewport.scale > 0
          ? window.visualViewport.scale
          : 1) || 1)
    );
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      visualViewport: {
        width: window.visualViewport?.width ?? null,
        height: window.visualViewport?.height ?? null,
        scale: window.visualViewport?.scale ?? null,
      },
      devicePixelRatio:
        typeof window.devicePixelRatio === 'number' &&
        Number.isFinite(window.devicePixelRatio)
          ? window.devicePixelRatio
          : null,
      effectiveViewportHeight: Number.isFinite(effectiveViewportHeight)
        ? effectiveViewportHeight
        : null,
      conversationViewportHeight:
        conversationViewportHeightValue && conversationViewportHeightValue.endsWith('px')
          ? Number.parseInt(conversationViewportHeightValue, 10)
          : null,
      htmlZoom:
        getComputedStyle(document.documentElement).zoom ||
        document.documentElement.style.zoom ||
        '1',
      uiScale:
        document.documentElement.style.getPropertyValue('--titane-ui-scale') ||
        getComputedStyle(document.documentElement).getPropertyValue(
          '--titane-ui-scale'
        ) ||
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
      inputTop: rectTop('[data-testid="chat-input"]'),
      inputBottom: rectBottom('[data-testid="chat-input"]'),
      sendLeft: rectLeft('[data-testid="chat-send"]'),
      sendRight: rectRight('[data-testid="chat-send"]'),
      sendTop: rectTop('[data-testid="chat-send"]'),
      sendBottom: rectBottom('[data-testid="chat-send"]'),
      regionLeft: rectLeft('[data-testid="chat-messages-scroll-region"]'),
      regionRight: rectRight('[data-testid="chat-messages-scroll-region"]'),
      regionBottom: rectBottom('[data-testid="chat-messages-scroll-region"]'),
      containerLeft: rectLeft('.conversation-container'),
      containerRight: rectRight('.conversation-container'),
      containerBottom: rectBottom('.conversation-container'),
      panelLeft: rectLeft('[data-testid="agent-dashboards-panel"]'),
      panelRight: rectRight('[data-testid="agent-dashboards-panel"]'),
      panelTop: rectTop('[data-testid="agent-dashboards-panel"]'),
      panelBottom: rectBottom('[data-testid="agent-dashboards-panel"]'),
      panelHidden: panelContent?.hasAttribute('hidden') ?? true,
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

function expectConversationViewportVariable(metrics: LayoutMetrics) {
  expect(metrics.conversationViewportHeight).not.toBeNull();
  expect(metrics.effectiveViewportHeight).not.toBeNull();
  expect(metrics.conversationViewportHeight!).toBeGreaterThanOrEqual(320);
  expect(metrics.conversationViewportHeight!).toBe(metrics.effectiveViewportHeight);
}

function rectsOverlap(params: {
  leftA: number | null;
  rightA: number | null;
  topA: number | null;
  bottomA: number | null;
  leftB: number | null;
  rightB: number | null;
  topB: number | null;
  bottomB: number | null;
}) {
  const { leftA, rightA, topA, bottomA, leftB, rightB, topB, bottomB } = params;

  if (
    leftA === null ||
    rightA === null ||
    topA === null ||
    bottomA === null ||
    leftB === null ||
    rightB === null ||
    topB === null ||
    bottomB === null
  ) {
    return false;
  }

  return !(rightA <= leftB || rightB <= leftA || bottomA <= topB || bottomB <= topA);
}

function expectPanelDoesNotOccludeComposer(metrics: LayoutMetrics) {
  if (!metrics.panelHidden) {
    return;
  }

  const inputOverlap = rectsOverlap({
    leftA: metrics.panelLeft,
    rightA: metrics.panelRight,
    topA: metrics.panelTop,
    bottomA: metrics.panelBottom,
    leftB: metrics.inputLeft,
    rightB: metrics.inputRight,
    topB: metrics.inputTop,
    bottomB: metrics.inputBottom,
  });

  const sendOverlap = rectsOverlap({
    leftA: metrics.panelLeft,
    rightA: metrics.panelRight,
    topA: metrics.panelTop,
    bottomA: metrics.panelBottom,
    leftB: metrics.sendLeft,
    rightB: metrics.sendRight,
    topB: metrics.sendTop,
    bottomB: metrics.sendBottom,
  });

  expect(inputOverlap).toBe(false);
  expect(sendOverlap).toBe(false);
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
      expectConversationViewportVariable(metrics);
      expectPanelDoesNotOccludeComposer(metrics);
      await expectCriticalSurfaceInViewport(page);
      if (viewport.height <= 980) {
        expect(metrics.density).toBe('compact');
      }
    }
  });

  test('chat shell remains visible after topnav zoom in and zoom out', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openConversationSurface(page);

    const baseline = await measureLayout(page);
    expect(Number(baseline.uiScale)).toBe(1);
    expectVisibleWindowBounds(baseline);
    expectConversationViewportVariable(baseline);
    await expectCriticalSurfaceInViewport(page);

    await page.getByTestId('topnav-zoom-in').click({ force: true });
    await page.waitForTimeout(200);
    const zoomIn = await measureLayout(page);
    expect(Number(zoomIn.uiScale)).toBeGreaterThan(1);
    expectVisibleWindowBounds(zoomIn);
    expectConversationViewportVariable(zoomIn);
    expectPanelDoesNotOccludeComposer(zoomIn);
    await expectCriticalSurfaceInViewport(page);

    await page.getByTestId('topnav-zoom-out').click({ force: true });
    await page.waitForTimeout(200);
    const zoomReset = await measureLayout(page);
    expect(Number(zoomReset.uiScale)).toBe(1);
    expectVisibleWindowBounds(zoomReset);
    expectConversationViewportVariable(zoomReset);
    expectPanelDoesNotOccludeComposer(zoomReset);
    await expectCriticalSurfaceInViewport(page);

    await page.getByTestId('topnav-zoom-out').click({ force: true });
    await page.waitForTimeout(200);
    const zoomOut = await measureLayout(page);
    expect(Number(zoomOut.uiScale)).toBeLessThan(1);
    expectVisibleWindowBounds(zoomOut);
    expectConversationViewportVariable(zoomOut);
    expectPanelDoesNotOccludeComposer(zoomOut);
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
      expectConversationViewportVariable(metrics);
      expectPanelDoesNotOccludeComposer(metrics);
      await expectCriticalSurfaceInViewport(page);
    }
  });

  test('latest assistant block remains reachable inside the bounded scroll region', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openConversationSurface(page);

    const scrollRegion = page.getByTestId('chat-messages-scroll-region');
    await submitChatMessage(page, buildLongStructuredPrompt());

    const assistantContent = getAssistantContent(page);
    const terminalMarker = assistantContent.getByText('OMEGA-FINAL-BLOCK', {
      exact: true,
    });

    await expect(assistantContent).toContainText('Rapport complet', { timeout: 15000 });
    await expect(terminalMarker).toHaveCount(1);

    const baseline = await measureLayout(page);
    expectVisibleWindowBounds(baseline);
    expectConversationViewportVariable(baseline);
    expectPanelDoesNotOccludeComposer(baseline);
    await expectCriticalSurfaceInViewport(page);

    const overflow = await scrollRegion.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);

    await scrollRegion.evaluate(element => {
      element.scrollTop = 0;
    });
    await page.waitForTimeout(120);
    const topScrollState = await scrollRegion.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    }));
    expect(topScrollState.scrollTop).toBeGreaterThanOrEqual(0);
    expect(topScrollState.scrollTop).toBeLessThan(topScrollState.scrollHeight);

    await scrollRegion.evaluate(element => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForTimeout(120);
    await expect(terminalMarker).toBeVisible();
    await expect(terminalMarker).toBeInViewport();
    await expect(assistantContent).toContainText('Bloc terminal');
    await expect(page.getByTestId('chat-input')).toBeInViewport();
    await expect(page.getByTestId('chat-send')).toBeInViewport();

    const bottomScrollState = await scrollRegion.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    }));

    expect(bottomScrollState.scrollHeight).toBeGreaterThan(
      bottomScrollState.clientHeight
    );
    expect(bottomScrollState.scrollTop).toBeGreaterThan(topScrollState.scrollTop);
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
    expectConversationViewportVariable(baseline);
    expectPanelDoesNotOccludeComposer(baseline);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1.2);
    await page.waitForTimeout(250);
    const pinchZoom = await measureLayout(page);

    expect(pinchZoom.visualViewport.scale).not.toBeNull();
    expect(pinchZoom.visualViewport.scale!).toBeGreaterThanOrEqual(1.1);
    expectVisibleWindowBounds(pinchZoom);
    expectConversationViewportVariable(pinchZoom);
    expect(pinchZoom.conversationViewportHeight!).toBeLessThan(
      baseline.conversationViewportHeight!
    );
    expectPanelDoesNotOccludeComposer(pinchZoom);
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
    expectConversationViewportVariable(baseline);
    expectPanelDoesNotOccludeComposer(baseline);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1.15);
    await page.waitForTimeout(250);
    const browserZoomIn = await measureLayout(page);

    expect(browserZoomIn.visualViewport.scale).not.toBeNull();
    expect(browserZoomIn.visualViewport.scale!).toBeGreaterThanOrEqual(1.1);
    expectVisibleWindowBounds(browserZoomIn);
    expectConversationViewportVariable(browserZoomIn);
    expect(browserZoomIn.conversationViewportHeight!).toBeLessThan(
      baseline.conversationViewportHeight!
    );
    expectPanelDoesNotOccludeComposer(browserZoomIn);
    await expectCriticalSurfaceInViewport(page);

    await setBrowserScaleFactor(page, 1);
    await page.waitForTimeout(250);
    const reset = await measureLayout(page);

    expect(reset.visualViewport.scale).not.toBeNull();
    expect(reset.visualViewport.scale!).toBeLessThanOrEqual(1.01);
    expectVisibleWindowBounds(reset);
    expectConversationViewportVariable(reset);
    expect(
      Math.abs(reset.conversationViewportHeight! - baseline.conversationViewportHeight!)
    ).toBeLessThanOrEqual(2);
    await expectCriticalSurfaceInViewport(page);
  });
});

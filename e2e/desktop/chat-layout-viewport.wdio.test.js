import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  gotoTopNavPage,
  openApp,
  waitAppReady,
  waitForDisplayed,
} from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const REPORT_DIR = path.resolve(process.cwd(), 'reports/e2e-desktop');
const REPORT_FILE = path.join(REPORT_DIR, 'chat-layout-viewport-report.json');
const devServerUrl = process.env.TAURI_DEV_SERVER_URL || '';

const report = {
  timestamp: new Date().toISOString(),
  suite: 'chat-layout-viewport-desktop',
  canonicalRoute: '/titane?tab=conversation',
  checks: [],
  failures: [],
};

async function persistReport() {
  await ensureArtifactsDir();
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

async function resetChatRuntime() {
  await browser.execute(() => {
    window.localStorage.setItem('onboarding_completed', 'true');
    window.localStorage.setItem('titane_onboarding_complete', '1');
    window.localStorage.setItem('omega-chat-preferred-provider', 'ollama');
  });
}

function getConversationCandidates() {
  const envUrl = process.env.TITANE_E2E_URL || '';
  const candidates = [];

  if (envUrl) {
    candidates.push(envUrl);
  }

  if (devServerUrl) {
    candidates.push(
      `${devServerUrl}/titane?tab=conversation`,
      `${devServerUrl}/#/titane?tab=conversation`,
      `${devServerUrl}/#/chat`,
      devServerUrl
    );
  }

  candidates.push(
    'tauri://localhost/titane?tab=conversation',
    'tauri://localhost/#/titane?tab=conversation',
    'tauri://localhost/#/chat',
    'tauri://localhost'
  );

  return [...new Set(candidates.filter(Boolean))];
}

async function loadCanonicalConversationSurface() {
  const candidates = getConversationCandidates();

  for (const url of candidates) {
    await browser.url(url).catch(() => {});
    const visible = await browser.waitUntil(
      async () => {
        return browser.execute(() => {
          return Boolean(
            document.querySelector('[data-testid="nav-top-main"]') ||
              document.querySelector('[data-testid="page-titane"]') ||
              document.querySelector('[data-testid="chat-input"]')
          );
        });
      },
      {
        timeout: 5000,
        interval: 200,
        timeoutMsg: `surface not ready for ${url}`,
      }
    ).catch(() => false);

    if (!visible) {
      continue;
    }

    const resolved = await browser.execute(() => window.location.href || '');
    report.sourceMode = devServerUrl && resolved.startsWith(devServerUrl) ? 'dev-server' : 'embedded';
    report.loadedUrl = resolved;
    await persistReport();
    return;
  }

  throw new Error(`unable to load conversation surface from candidates: ${candidates.join(', ')}`);
}

async function ensureConversationSurface() {
  await openApp();
  await resetChatRuntime();
  await loadCanonicalConversationSurface();
  await resetUiZoomToBaseline();

  const hasTopNav = await browser.execute(() => {
    return Boolean(document.querySelector('[data-testid="nav-top-main"]'));
  });

  if (hasTopNav) {
    await waitAppReady();
    await gotoTopNavPage(uiPages.titane);
    await browser.execute(() => {
      const tab = document.querySelector('[data-testid="tab-conversation"]');
      tab?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
  }

  // The app bootstrap can reapply the persisted zoom after the first navigation.
  // Reset again once the canonical conversation surface is actually active.
  await resetUiZoomToBaseline();

  await waitForDisplayed('[data-testid="tab-conversation"]');
  await waitForDisplayed('[data-testid="chat-input"]');
  await waitForDisplayed('[data-testid="chat-send"]');
  await waitForDisplayed('[data-testid="chat-messages-scroll-region"]');
}

async function setViewport(width, height) {
  await browser.setWindowSize(width, height);
  await browser.pause(250);
}

async function resetUiZoomToBaseline() {
  await browser.executeAsync(done => {
    const finalize = () => {
      try {
        window.localStorage.setItem('titane_zoom_level', '1');
      } catch {
        // Best effort only.
      }

      document.documentElement.style.removeProperty('zoom');
      document.documentElement.style.fontSize = '16px';
      document.documentElement.style.setProperty('--titane-ui-scale', '1');
      done(null);
    };

    const tauriInvoke =
      window.__TAURI__?.core?.invoke ||
      window.__TAURI__?.invoke ||
      window.__TAURI_INTERNALS__?.invoke ||
      null;

    if (!tauriInvoke) {
      finalize();
      return;
    }

    Promise.resolve(tauriInvoke('window_zoom_reset'))
      .catch(() => undefined)
      .finally(finalize);
  });
  await browser.pause(250);
}

async function measureLayout(label) {
  const metrics = await browser.execute(stepLabel => {
    const rectBottom = selector => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height,
      };
    };

    const rectHorizontal = selector => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) {
        return null;
      }
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        width: rect.width,
      };
    };

    const panelContent = document.querySelector('[data-testid="agent-dashboards-panel-content"]');

    const container = document.querySelector('.conversation-container');
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
      label: stepLabel,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      visualViewport: {
        width: window.visualViewport?.width ?? null,
        height: window.visualViewport?.height ?? null,
        scale: window.visualViewport?.scale ?? null,
      },
      devicePixelRatio:
        typeof window.devicePixelRatio === 'number' && Number.isFinite(window.devicePixelRatio)
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
        getComputedStyle(document.documentElement).getPropertyValue('--titane-ui-scale') ||
        '1',
      density: container?.getAttribute('data-density') ?? null,
      page: rectBottom('[data-testid="page-titane"]'),
      pageHorizontal: rectHorizontal('[data-testid="page-titane"]'),
      tab: rectBottom('[data-testid="tab-conversation"]'),
      tabHorizontal: rectHorizontal('[data-testid="tab-conversation"]'),
      container: rectBottom('.conversation-container'),
      containerHorizontal: rectHorizontal('.conversation-container'),
      region: rectBottom('[data-testid="chat-messages-scroll-region"]'),
      regionHorizontal: rectHorizontal('[data-testid="chat-messages-scroll-region"]'),
      input: rectBottom('[data-testid="chat-input"]'),
      inputHorizontal: rectHorizontal('[data-testid="chat-input"]'),
      send: rectBottom('[data-testid="chat-send"]'),
      sendHorizontal: rectHorizontal('[data-testid="chat-send"]'),
      panel: rectBottom('[data-testid="agent-dashboards-panel"]'),
      panelHorizontal: rectHorizontal('[data-testid="agent-dashboards-panel"]'),
      panelHidden: panelContent?.hasAttribute('hidden') ?? true,
    };
  }, label);

  report.checks.push(metrics);
  await persistReport();
  return metrics;
}

function rectsOverlap(verticalA, horizontalA, verticalB, horizontalB) {
  if (!verticalA || !horizontalA || !verticalB || !horizontalB) {
    return false;
  }

  return !(
    horizontalA.right <= horizontalB.left ||
    horizontalB.right <= horizontalA.left ||
    verticalA.bottom <= verticalB.top ||
    verticalB.bottom <= verticalA.top
  );
}

function assertPanelDoesNotOccludeComposer(metrics) {
  if (!metrics.panelHidden) {
    return;
  }

  assert.equal(
    rectsOverlap(metrics.panel, metrics.panelHorizontal, metrics.input, metrics.inputHorizontal),
    false,
    `${metrics.label}: agent dashboards panel overlaps chat input`
  );
  assert.equal(
    rectsOverlap(metrics.panel, metrics.panelHorizontal, metrics.send, metrics.sendHorizontal),
    false,
    `${metrics.label}: agent dashboards panel overlaps send button`
  );
}

function assertVisibleBounds(metrics) {
  const viewportBottom = metrics.viewport.height;
  const viewportRight = metrics.viewport.width;
  for (const key of ['page', 'tab', 'container', 'region', 'input', 'send']) {
    assert.ok(metrics[key], `missing metrics for ${key}`);
    assert.ok(
      metrics[key].bottom <= viewportBottom,
      `${metrics.label}: ${key}.bottom=${metrics[key].bottom} exceeds viewport=${viewportBottom}`
    );
  }

  for (const key of [
    'pageHorizontal',
    'tabHorizontal',
    'containerHorizontal',
    'regionHorizontal',
    'inputHorizontal',
    'sendHorizontal',
  ]) {
    assert.ok(metrics[key], `missing metrics for ${key}`);
    assert.ok(
      metrics[key].left >= 0,
      `${metrics.label}: ${key}.left=${metrics[key].left} is outside viewport`
    );
    assert.ok(
      metrics[key].right <= viewportRight,
      `${metrics.label}: ${key}.right=${metrics[key].right} exceeds viewport=${viewportRight}`
    );
  }
}

function assertConversationViewportVariable(metrics) {
  assert.notEqual(
    metrics.conversationViewportHeight,
    null,
    `${metrics.label}: missing --conversation-vh value`
  );
  assert.notEqual(
    metrics.effectiveViewportHeight,
    null,
    `${metrics.label}: missing effective viewport height`
  );
  assert.ok(
    metrics.conversationViewportHeight >= 320,
    `${metrics.label}: conversationViewportHeight=${metrics.conversationViewportHeight} is below minimum`
  );
  assert.equal(
    metrics.conversationViewportHeight,
    metrics.effectiveViewportHeight,
    `${metrics.label}: --conversation-vh does not match effective viewport height`
  );
}

async function clickZoom(testId) {
  const selector = `[data-testid="${testId}"]`;
  await waitForDisplayed(selector);
  await browser.execute(sel => {
    const element = document.querySelector(sel);
    element?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }, selector);
  await browser.pause(250);
}

describe('Desktop (Tauri) chat layout viewport truth', () => {
  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      const screenshot = await captureFailureScreenshot(this.currentTest.fullTitle());
      report.failures.push({
        name: this.currentTest.fullTitle(),
        screenshot,
      });
      await persistReport();
    }
  });

  it('keeps the chat surface fully inside the visible desktop window', async () => {
    await setViewport(1440, 900);
    await ensureConversationSurface();

    const baseline = await measureLayout('desktop-baseline');
    assertVisibleBounds(baseline);
    assertConversationViewportVariable(baseline);
    assertPanelDoesNotOccludeComposer(baseline);

    await clickZoom('topnav-zoom-in');
    const zoomIn = await measureLayout('desktop-zoom-in');
    assert.ok(Number(zoomIn.uiScale) > 1, 'topnav zoom-in did not increase ui zoom');
    assertVisibleBounds(zoomIn);
    assertConversationViewportVariable(zoomIn);
    assertPanelDoesNotOccludeComposer(zoomIn);

    await clickZoom('topnav-zoom-out');
    const zoomReset = await measureLayout('desktop-zoom-reset');
    assert.equal(Number(zoomReset.uiScale), 1, 'topnav zoom-out did not reset to baseline');
    assertVisibleBounds(zoomReset);
    assertConversationViewportVariable(zoomReset);
    assertPanelDoesNotOccludeComposer(zoomReset);

    await clickZoom('topnav-zoom-out');
    const zoomOut = await measureLayout('desktop-zoom-out-below-baseline');
    assert.ok(Number(zoomOut.uiScale) < 1, 'topnav zoom-out did not go below baseline');
    assertVisibleBounds(zoomOut);
    assertConversationViewportVariable(zoomOut);
    assertPanelDoesNotOccludeComposer(zoomOut);

    await setViewport(1024, 640);
    const compact = await measureLayout('desktop-compact-resize');
    assert.equal(compact.density, 'compact');
    assertVisibleBounds(compact);
    assertConversationViewportVariable(compact);
    assertPanelDoesNotOccludeComposer(compact);
  });
});

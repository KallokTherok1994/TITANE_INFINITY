import assert from 'node:assert/strict';
import { openApp, waitAppReady, gotoTopNavPage } from './ui-driver.wdio.js';
import { uiPages } from './page-objects/uiPages.po.js';

const COLORS = {
  primary: '#3a8fb7',
  background: '#102030',
  surface: '#1a2a3a',
  text: '#e6f2ff',
  border: '#557799',
  accent: '#44aa88',
};

async function clickSafe(selector) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout: 20000 });
  try {
    await el.click();
    return;
  } catch {
    // Wry/WebKit can reject click() despite visible element.
  }

  await browser.execute(element => {
    if (!element) return;
    try {
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
    } catch {
      // no-op
    }
    element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }, el);
}

async function setColor(testId, value) {
  const selector = `[data-testid="${testId}"]`;
  const input = await $(selector);
  await input.waitForDisplayed({ timeout: 20000 });
  await browser.execute(
    (el, nextValue) => {
      if (!el) return;
      const normalized = String(nextValue || '').toLowerCase();
      el.value = normalized;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    input,
    value
  );
}

async function getColorValue(testId) {
  const selector = `[data-testid="${testId}"]`;
  const input = await $(selector);
  await input.waitForDisplayed({ timeout: 20000 });
  return String(await input.getValue()).toLowerCase();
}

async function getRootVar(name) {
  return browser.execute(varName => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName);
    return String(value || '').trim().toLowerCase();
  }, name);
}

async function openAdminDesign() {
  await openApp();
  await waitAppReady();
  await gotoTopNavPage(uiPages.admin);

  await clickSafe('[data-testid="tab-admin-design"]');
  await (await $('[data-testid="page-design-center"]')).waitForDisplayed({ timeout: 30000 });
}

async function detectDesignStatus() {
  await browser.waitUntil(
    async () => {
      const runtime = await $('[data-testid="design-status-runtime-active"]');
      if (await runtime.isExisting()) return true;
      const fallback = await $('[data-testid="design-status-fallback"]');
      if (await fallback.isExisting()) return true;
      const error = await $('[data-testid="design-status-error"]');
      if (await error.isExisting()) return true;
      return false;
    },
    {
      timeout: 30000,
      interval: 250,
      timeoutMsg: 'no terminal Design status badge found',
    }
  );

  if (await (await $('[data-testid="design-status-runtime-active"]')).isExisting()) {
    return 'runtime-active';
  }
  if (await (await $('[data-testid="design-status-fallback"]')).isExisting()) {
    return 'fallback';
  }
  if (await (await $('[data-testid="design-status-error"]')).isExisting()) {
    return 'error';
  }
  return 'unknown';
}

describe('ADMIN Design truth chain', () => {
  it('applies tokens visibly, persists on reload, and keeps truthful active badge', async function () {
    this.timeout(240000);

    await openAdminDesign();

    const title = await browser.getTitle();
    assert.ok(typeof title === 'string');

    const initialStatus = await detectDesignStatus();
    assert.notEqual(initialStatus, 'unknown');

    const tablist = await $('[role="tablist"][aria-label="Design Center tabs"]');
    await tablist.waitForDisplayed({ timeout: 20000 });

    const designTab = await $('[data-testid="design-tab-design-system"]');
    const appearanceTab = await $('[data-testid="design-tab-appearance"]');

    assert.equal(await designTab.getAttribute('aria-selected'), 'true');
    assert.equal(await appearanceTab.getAttribute('aria-selected'), 'false');

    await clickSafe('[data-testid="design-tab-appearance"]');
    assert.equal(await appearanceTab.getAttribute('aria-selected'), 'true');
    const appearancePanel = await $('[data-testid="design-panel-appearance"]');
    assert.equal(await appearancePanel.getAttribute('role'), 'tabpanel');
    assert.equal(await appearancePanel.getAttribute('aria-labelledby'), 'dc-tab-appearance');

    await appearanceTab.click();
    await browser.keys(['ArrowLeft']);
    assert.equal(await designTab.getAttribute('aria-selected'), 'true');

    const beforeBg = await getRootVar('--color-bg-primary');

    await setColor('design-color-primary', COLORS.primary);
    await setColor('design-color-background', COLORS.background);
    await setColor('design-color-surface', COLORS.surface);
    await setColor('design-color-text', COLORS.text);
    await setColor('design-color-border', COLORS.border);
    await setColor('design-color-accent', COLORS.accent);

    await (await $('[data-testid="design-status-dirty"]')).waitForDisplayed({ timeout: 20000 });

    assert.equal(await getRootVar('--color-bg-primary'), COLORS.background);
    assert.equal(await getRootVar('--color-bg-secondary'), COLORS.surface);
    assert.equal(await getRootVar('--admin-bg-start'), COLORS.background);
    assert.equal(await getRootVar('--badge-accent-color'), COLORS.accent);
    assert.notEqual(beforeBg, COLORS.background);

    await clickSafe('.dc-btn-save');
    const postSaveStatus = await detectDesignStatus();
    assert.ok(postSaveStatus === 'runtime-active' || postSaveStatus === 'fallback');

    await browser.execute(() => {
      window.location.reload();
    });
    await waitAppReady();
    await gotoTopNavPage(uiPages.admin);
    await clickSafe('[data-testid="tab-admin-design"]');

    const reloadStatus = await detectDesignStatus();
    assert.ok(reloadStatus === 'runtime-active' || reloadStatus === 'fallback');

    assert.equal(await getColorValue('design-color-primary'), COLORS.primary);
    assert.equal(await getColorValue('design-color-background'), COLORS.background);
    assert.equal(await getColorValue('design-color-surface'), COLORS.surface);
    assert.equal(await getColorValue('design-color-text'), COLORS.text);
    assert.equal(await getColorValue('design-color-border'), COLORS.border);
    assert.equal(await getColorValue('design-color-accent'), COLORS.accent);

    assert.equal(await getRootVar('--color-bg-primary'), COLORS.background);
    assert.equal(await getRootVar('--admin-bg-start'), COLORS.background);
  });
});

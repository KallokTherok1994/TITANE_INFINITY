import assert from 'node:assert/strict';

import {
  captureFailureScreenshot,
  ensureArtifactsDir,
  getCurrentPathname,
  gotoTopNavPage,
  openApp,
  waitAppReady,
} from './ui-driver.wdio.js';

const TOTAL_DEV_PAGE = {
  id: 'total-dev',
  route: '/total-dev',
  navTestId: 'nav-total-dev',
  root: '[data-testid="total-dev-header"]',
};

const TOTAL_DEV_HEADER = '[data-testid="total-dev-header"]';
const LOCK_BADGE = '[data-testid="lock-badge"]';
const UNLOCK_PANEL = '.total-dev-unlock-panel';
const PASSWORD_INPUT = 'input[placeholder="Token unlock..."]';
const UNLOCK_BUTTON = '[data-testid="total-dev-unlock-btn"]';
const UNLOCK_ERROR = '.total-dev-unlock-error';

async function waitForTotalDevSurface(timeout = 30000) {
  await browser.waitUntil(
    async () => {
      const header = await $(TOTAL_DEV_HEADER);
      const badge = await $(LOCK_BADGE);
      const panel = await $(UNLOCK_PANEL);
      return (
        (await header.isExisting()) &&
        (await badge.isExisting()) &&
        (await panel.isExisting())
      );
    },
    {
      timeout,
      interval: 200,
      timeoutMsg: 'TOTAL_DEV surface did not become available',
    }
  );
}

async function setInputValueWithEvents(selector, value) {
  const element = await $(selector);
  await element.waitForExist({ timeout: 10000 });
  await browser.execute(
    (input, nextValue) => {
      if (!input) return;
      input.focus();

      const descriptor = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value'
      );

      if (descriptor?.set) {
        descriptor.set.call(input, String(nextValue ?? ''));
      } else {
        input.value = String(nextValue ?? '');
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },
    element,
    value
  );
}

async function clickWithDomFallback(selector) {
  const element = await $(selector);
  await element.waitForExist({ timeout: 10000 });

  try {
    await element.scrollIntoView();
  } catch {
    // Best effort only.
  }

  try {
    if (await element.isClickable()) {
      await element.click();
      return true;
    }
  } catch {
    // Fallback below.
  }

  return await browser.execute(button => {
    if (!button) return false;
    const disabled =
      button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true';
    if (disabled) return false;
    button.focus();
    button.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
    return true;
  }, element);
}

describe('TOTAL_DEV Native Desktop (WDIO/Tauri)', () => {
  before(async () => {
    await ensureArtifactsDir();
    await openApp();
    await waitAppReady();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await captureFailureScreenshot(this.currentTest.fullTitle());
    }
  });

  it('1. reaches TOTAL_DEV through the native top navigation', async function () {
    this.timeout(60000);

    await gotoTopNavPage(TOTAL_DEV_PAGE);
    await waitForTotalDevSurface();

    const pathname = await getCurrentPathname();
    assert.equal(pathname, TOTAL_DEV_PAGE.route, `unexpected pathname: ${pathname}`);
  });

  it('2. shows the TOTAL_DEV header on the native surface', async function () {
    this.timeout(30000);

    await waitForTotalDevSurface();

    const header = await $(TOTAL_DEV_HEADER);
    assert.equal(await header.isDisplayed(), true, 'TOTAL_DEV header not visible');

    const text = await header.getText();
    assert.ok(text.includes('TOTAL_DEV'), `unexpected header text: ${text}`);
  });

  it('3. shows the lock badge while remaining in locked mode', async function () {
    this.timeout(30000);

    await waitForTotalDevSurface();

    const badge = await $(LOCK_BADGE);
    assert.equal(await badge.isDisplayed(), true, 'lock badge not visible');

    const text = await badge.getText();
    assert.ok(
      /LOCKED|VERROUILL/i.test(text),
      `lock badge does not reflect a locked state: ${text}`
    );
  });

  it('4. shows the unlock panel and password field', async function () {
    this.timeout(30000);

    await waitForTotalDevSurface();

    const panel = await $(UNLOCK_PANEL);
    const input = await $(PASSWORD_INPUT);

    assert.equal(await panel.isDisplayed(), true, 'unlock panel not visible');
    assert.equal(await input.isDisplayed(), true, 'unlock input not visible');
    assert.equal(await input.isEnabled(), true, 'unlock input not enabled');
  });

  it('5. keeps TOTAL_DEV locked after a wrong unlock attempt', async function () {
    this.timeout(45000);

    await waitForTotalDevSurface();
    await setInputValueWithEvents(PASSWORD_INPUT, 'wrong-password-test');

    const clicked = await clickWithDomFallback(UNLOCK_BUTTON);
    assert.equal(clicked, true, 'unlock button could not be activated');

    await browser.waitUntil(
      async () => {
        const badge = await $(LOCK_BADGE);
        const error = await $(UNLOCK_ERROR);

        if ((await error.isExisting()) && (await error.isDisplayed())) {
          return true;
        }

        if (!(await badge.isExisting())) return false;
        const text = await badge.getText();
        return /LOCKED|VERROUILL/i.test(text);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'wrong unlock attempt did not yield a visible blocked outcome',
      }
    );

    const badge = await $(LOCK_BADGE);
    const badgeText = await badge.getText();
    assert.ok(
      /LOCKED|VERROUILL/i.test(badgeText),
      `TOTAL_DEV left locked mode after wrong unlock attempt: ${badgeText}`
    );
  });
});

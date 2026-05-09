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
const TOTAL_DEV_UNLOCK_TOKEN = process.env.TITANE_TOTAL_DEV_E2E_UNLOCK_TOKEN || '';

const TAB_CHAT = '[data-testid="total-dev-tab-chat"]';
const TAB_CONSOLE = '[data-testid="total-dev-tab-console"]';
const TAB_GIT = '[data-testid="total-dev-tab-git"]';
const TAB_FILES = '[data-testid="total-dev-tab-files"]';

const REVOKE_BUTTON = '.total-dev-btn--revoke';
const PROVIDER_BADGE = '.total-dev-provider-badge';
const CHAT_MODEL_BADGE = '.total-dev-chat-model';

const CONSOLE_INPUT = '.total-dev-console-input';
const CONSOLE_RUN_BUTTON = '.total-dev-btn--console';
const CONSOLE_OUTPUT = '.total-dev-console-output';

const FILE_INPUT = '.total-dev-file-input';
const FILE_READ_BUTTON = '.total-dev-file-input-row .total-dev-btn--primary';
const FILE_RESULT = '.total-dev-file-result';

async function isUnlockedState() {
  const badge = await $(LOCK_BADGE);
  if (!(await badge.isExisting())) return false;
  const text = await badge.getText();
  return /UNLOCKED/i.test(text);
}

async function ensureUnlocked() {
  if (await isUnlockedState()) return;
  await setInputValueWithEvents(PASSWORD_INPUT, TOTAL_DEV_UNLOCK_TOKEN);
  const clicked = await clickWithDomFallback(UNLOCK_BUTTON);
  assert.equal(clicked, true, 'unlock button could not be activated for valid token');

  await browser.waitUntil(
    async () => {
      const badge = await $(LOCK_BADGE);
      if (!(await badge.isExisting())) return false;
      const text = await badge.getText();
      return /UNLOCKED/i.test(text);
    },
    {
      timeout: 15000,
      interval: 250,
      timeoutMsg: 'valid unlock did not transition lock badge to UNLOCKED',
    }
  );
}

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

  it('6. unlocks TOTAL_DEV with env token and shows unlocked badge', async function () {
    this.timeout(60000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await waitForTotalDevSurface();
    await ensureUnlocked();

    const badge = await $(LOCK_BADGE);
    const badgeText = await badge.getText();
    assert.ok(
      /UNLOCKED/i.test(badgeText),
      `unexpected lock badge state after unlock: ${badgeText}`
    );
  });

  it('7. Git panel returns governed status output', async function () {
    this.timeout(60000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await ensureUnlocked();
    const gitTab = await $(TAB_GIT);
    await gitTab.waitForExist({ timeout: 10000 });
    await gitTab.click();

    const statusBtn = await $('[data-testid="total-dev-git-status"]');
    await statusBtn.waitForExist({ timeout: 10000 });
    await statusBtn.click();

    const output = await $('.total-dev-git-output');
    await output.waitForExist({ timeout: 15000 });
    const text = await output.getText();
    assert.ok(
      /git status|On branch|nothing to commit|Changes not staged/i.test(text),
      `unexpected git status output: ${text}`
    );
  });

  it('8. Console panel accepts safe command and rejects unsafe command', async function () {
    this.timeout(90000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await ensureUnlocked();
    const consoleTab = await $(TAB_CONSOLE);
    await consoleTab.waitForExist({ timeout: 10000 });
    await consoleTab.click();

    const input = await $(CONSOLE_INPUT);
    const runBtn = await $(CONSOLE_RUN_BUTTON);
    await input.waitForExist({ timeout: 10000 });

    await input.setValue('pwd');
    await runBtn.click();
    const output = await $(CONSOLE_OUTPUT);
    await output.waitForExist({ timeout: 15000 });
    await browser.waitUntil(
      async () => {
        const text = await output.getText();
        return /exit:\s*0/i.test(text);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'safe command did not finish with exit 0',
      }
    );

    await input.setValue('echo blocked-by-policy');
    await runBtn.click();
    await browser.waitUntil(
      async () => {
        const text = await output.getText();
        return /Commande non autorisee|non autoris|not allowed/i.test(text);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'unsafe command was not rejected by governed console',
      }
    );
  });

  it('9. File inspector reads package.json and blocks sensitive .env', async function () {
    this.timeout(90000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await ensureUnlocked();
    const fileTab = await $(TAB_FILES);
    await fileTab.waitForExist({ timeout: 10000 });
    await fileTab.click();

    const fileInput = await $(FILE_INPUT);
    const readBtn = await $(FILE_READ_BUTTON);
    const result = await $(FILE_RESULT);

    await fileInput.waitForExist({ timeout: 10000 });
    await fileInput.setValue('package.json');
    await readBtn.click();

    await result.waitForExist({ timeout: 15000 });
    await browser.waitUntil(
      async () => {
        const text = await result.getText();
        return /titane-infinity|"name"\s*:\s*"titane-infinity"/i.test(text);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'file inspector did not return package.json content',
      }
    );

    await fileInput.setValue('.env');
    await readBtn.click();
    await browser.waitUntil(
      async () => {
        const bodyText = await $('body').getText();
        return /extension sensible|Lecture refusée|Lecture refusee/i.test(bodyText);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'file inspector did not block .env read attempt',
      }
    );
  });

  it('10. Chat model badge shows the expected DEV model', async function () {
    this.timeout(45000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await ensureUnlocked();
    const chatTab = await $(TAB_CHAT);
    await chatTab.waitForExist({ timeout: 10000 });
    await chatTab.click();

    const providerBadge = await $(PROVIDER_BADGE);
    await providerBadge.waitForExist({ timeout: 10000 });
    const providerText = await providerBadge.getText();
    assert.ok(
      /QWEN Dev|qwen3\.5:9b/i.test(providerText),
      `unexpected provider badge: ${providerText}`
    );

    const modelBadge = await $(CHAT_MODEL_BADGE);
    const modelText = await modelBadge.getText();
    assert.ok(
      /qwen3\.5:9b/i.test(modelText),
      `unexpected chat model badge: ${modelText}`
    );
  });

  it('11. Session revoke transitions lock state honestly', async function () {
    this.timeout(45000);

    if (!TOTAL_DEV_UNLOCK_TOKEN) {
      this.skip();
      return;
    }

    await ensureUnlocked();

    const revoke = await $(REVOKE_BUTTON);
    await revoke.waitForExist({ timeout: 10000 });
    await revoke.click();

    await browser.waitUntil(
      async () => {
        const badge = await $(LOCK_BADGE);
        const text = await badge.getText();
        return /LOCKED|EXPIRED|VERROUILL/i.test(text);
      },
      {
        timeout: 15000,
        interval: 250,
        timeoutMsg: 'session revoke did not return to a locked/expired state',
      }
    );
  });
});

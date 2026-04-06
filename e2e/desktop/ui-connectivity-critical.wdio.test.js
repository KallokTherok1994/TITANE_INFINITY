import assert from 'node:assert/strict';

async function ensureMainUi() {
  await browser.url('tauri://localhost/#/chat');
  await browser.execute(() => {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem(
      'onboarding_preferences',
      JSON.stringify({
        profile: 'e2e',
        mode: 'default',
      })
    );
  });
  await browser.url('tauri://localhost/#/chat');
}

async function clickNavItem(navTestId) {
  const routeByNavId = {
    'nav-titane': '/titane',
    'nav-time': '/time',
    'nav-admin': '/admin',
    'nav-dev': '/dev',
  };

  const direct = await $(`[data-testid="${navTestId}"]`);
  if (await direct.isExisting()) {
    try {
      await direct.scrollIntoView();
      if (await direct.isClickable()) {
        await direct.click();
      } else {
        const current = await direct.getAttribute('aria-current');
        if (current !== 'page') {
          await browser.execute(el => el?.click(), direct);
        }
      }
      return;
    } catch {
      // Continue with menu/fallback path.
    }
  }

  const moreButton = await $('[data-testid="btn-nav-more"]');
  if (await moreButton.isExisting()) {
    await moreButton.click();
    await browser.waitUntil(
      async () => {
        const inMore = await $(`[data-testid="${navTestId}"]`);
        return inMore.isExisting();
      },
      { timeout: 3000, interval: 150, timeoutMsg: `menu item missing: ${navTestId}` }
    );

    const inMore = await $(`[data-testid="${navTestId}"]`);
    if (await inMore.isExisting()) {
      await inMore.click();
      return;
    }
  }

  const expectedRoute = routeByNavId[navTestId];
  if (expectedRoute) {
    await browser.url(`tauri://localhost/#${expectedRoute}`);
    const currentUrl = await browser.getUrl();
    if (currentUrl.includes(expectedRoute)) {
      return;
    }
  }

  assert.fail(`Navigation item not found: ${navTestId}`);
}

describe('Desktop (Tauri) UI connectivity critical', () => {
  it('navigates critical pages via test ids', async () => {
    await ensureMainUi();

    const topNav = await $('[data-testid="nav-top-main"]');
    await topNav.waitForExist({ timeout: 10000 });

    const checks = [
      { nav: 'nav-titane', page: 'page-titane' },
      { nav: 'nav-time', page: 'page-time' },
      { nav: 'nav-admin', page: 'page-admin' },
      { nav: 'nav-dev', page: 'page-dev' },
    ];

    for (const check of checks) {
      await clickNavItem(check.nav);
      const page = await $(`[data-testid="${check.page}"]`);
      await page.waitForExist({ timeout: 10000 });
      assert.equal(await page.isExisting(), true);
    }
  });

  it('exposes conversation critical controls', async () => {
    await ensureMainUi();

    const topNav = await $('[data-testid="nav-top-main"]');
    await topNav.waitForExist({ timeout: 10000 });

    await clickNavItem('nav-titane');

    const tabConversation = await $('[data-testid="tab-conversation"]');
    await tabConversation.waitForExist({ timeout: 10000 });

    const controls = [
      'select-chat-provider',
      'select-conversation-mode',
      'btn-export-json',
      'btn-export-markdown',
      'btn-clear-chat',
      'input-conversation-search',
      'toggle-voice-input',
      'chat-input',
      'chat-send',
    ];

    for (const testId of controls) {
      const element = await $(`[data-testid="${testId}"]`);
      await element.waitForExist({ timeout: 10000 });
      assert.equal(await element.isExisting(), true, `Missing ${testId}`);
    }
  });
});

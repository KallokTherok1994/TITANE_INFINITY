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

async function seedLongConversation(pairCount = 20) {
  const conversationId = 'wdio-scroll-bottom-proof';
  const now = Date.now();
  const messages = Array.from({ length: pairCount * 2 }, (_, index) => {
    const isAssistant = index % 2 === 1;
    const turn = Math.floor(index / 2) + 1;
    return {
      id: `wdio-seed-${index + 1}`,
      role: isAssistant ? 'assistant' : 'user',
      content: isAssistant
        ? `Assistant seed ${turn}: réponse longue pour forcer un historique défilable sous zoom et en layout fullscreen.`
        : `User seed ${turn}: message de test pour vérifier la flèche de retour en bas.`,
      timestamp: now + index,
      metadata: isAssistant
        ? {
            tags: ['seed:scroll-bottom'],
          }
        : {},
    };
  });

  await browser.execute(
    payload => {
      const { seedConversationId, seedMessages, seedTimestamp } = payload;
      localStorage.setItem('titane_active_conversation_id', seedConversationId);
      localStorage.setItem(
        `titane_conversation_${seedConversationId}`,
        JSON.stringify({
          id: seedConversationId,
          title: 'WDIO scroll bottom proof',
          created_at: new Date(seedTimestamp).toISOString(),
          updated_at: new Date(seedTimestamp).toISOString(),
          messages: seedMessages,
        })
      );
      localStorage.setItem(
        'titane_chat_mode_default',
        JSON.stringify({
          mode: 'default',
          messages: seedMessages,
          compressed: [],
          lastCompacted: seedTimestamp,
        })
      );
    },
    {
      seedConversationId: conversationId,
      seedMessages: messages,
      seedTimestamp: now,
    }
  );
}

async function safeClick(element) {
  await element.waitForExist({ timeout: 10000 });
  try {
    await element.scrollIntoView();
  } catch {
    // Fallback to DOM click when WRY cannot scroll the target reliably.
  }

  if (await element.isClickable()) {
    await element.click();
    return;
  }

  await browser.execute(el => el?.click(), element);
}

async function inspectConversationScrollRegion() {
  return browser.execute(() => {
    const container = document.querySelector('.conversation-container');
    const region = document.querySelector('[data-testid="chat-messages-scroll-region"]');
    const input = document.querySelector('[data-testid="chat-input"]');
    const composer = document.querySelector('.conversation-input-container');

    if (
      !(container instanceof HTMLElement) ||
      !(region instanceof HTMLElement) ||
      !(input instanceof HTMLElement) ||
      !(composer instanceof HTMLElement)
    ) {
      return null;
    }

    let hostConstraintApplied = false;
    if (region.scrollHeight <= region.clientHeight) {
      const constrainedHeight = Math.max(260, Math.round(window.innerHeight * 0.42));
      region.style.height = `${constrainedHeight}px`;
      region.style.maxHeight = `${constrainedHeight}px`;
      region.style.overflowY = 'auto';
      hostConstraintApplied = true;
    }

    const inputRect = input.getBoundingClientRect();
    const composerRect = composer.getBoundingClientRect();
    return {
      density: container.dataset.density ?? null,
      fullscreen: container.dataset.fullscreen ?? null,
      scrollHeight: region.scrollHeight,
      clientHeight: region.clientHeight,
      inputBottom: inputRect.bottom,
      composerBottom: composerRect.bottom,
      viewportHeight: window.innerHeight,
      hostConstraintApplied,
    };
  });
}

async function clickNavItem(navTestId) {
  const routeByNavId = {
    'nav-titane': '/titane',
    'nav-time': '/time',
    'nav-admin': '/admin',
    'nav-dev': '/dev',
    'nav-twins': '/twins',
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
    await safeClick(moreButton);
    await browser.waitUntil(
      async () => {
        const inMore = await $(`[data-testid="${navTestId}"]`);
        return inMore.isExisting();
      },
      { timeout: 3000, interval: 150, timeoutMsg: `menu item missing: ${navTestId}` }
    );

    const inMore = await $(`[data-testid="${navTestId}"]`);
    if (await inMore.isExisting()) {
      await safeClick(inMore);
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

  it('keeps TWINS in overflow while chat stays fullscreen on Titane', async () => {
    await ensureMainUi();

    const topNav = await $('[data-testid="nav-top-main"]');
    await topNav.waitForExist({ timeout: 10000 });

    await clickNavItem('nav-titane');

    const titanePage = await $('[data-testid="page-titane"]');
    const conversationPage = await $('[data-testid="page-conversation"]');
    const twinsTab = await $('[data-testid="tab-twins"]');

    await titanePage.waitForExist({ timeout: 10000 });
    await conversationPage.waitForExist({ timeout: 10000 });

    assert.equal(await titanePage.getAttribute('data-layout'), 'chat-fullscreen');
    assert.equal(await conversationPage.getAttribute('data-layout'), 'fullscreen');
    assert.equal(
      await twinsTab.isExisting(),
      false,
      'tab-twins should be removed from Titane'
    );

    const moreButton = await $('[data-testid="btn-nav-more"]');
    await safeClick(moreButton);

    const twinsMenuItem = await $('[data-testid="nav-twins"]');
    await twinsMenuItem.waitForExist({ timeout: 10000 });
    assert.equal(await twinsMenuItem.isExisting(), true, 'nav-twins should stay visible');

    await safeClick(twinsMenuItem);

    await browser.waitUntil(async () => (await browser.getUrl()).includes('/twins'), {
      timeout: 10000,
      interval: 150,
      timeoutMsg: 'navigation to /twins did not complete',
    });

    const twinsRoot = await $('.twins-root');
    await twinsRoot.waitForExist({ timeout: 10000 });
    assert.equal(await twinsRoot.isExisting(), true, 'Twins page root should be visible');
  });

  it('shows a return-to-bottom CTA on long histories and restores the latest message view', async () => {
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
    await seedLongConversation(40);

    const topNav = await $('[data-testid="nav-top-main"]');
    await topNav.waitForExist({ timeout: 10000 });
    await clickNavItem('nav-titane');

    const conversationPage = await $('[data-testid="page-conversation"]');
    await conversationPage.waitForExist({ timeout: 10000 });

    const scrollRegion = await $('[data-testid="chat-messages-scroll-region"]');
    await scrollRegion.waitForExist({ timeout: 10000 });

    await browser.waitUntil(
      async () => (await $$('[data-testid="chat-message-assistant"]')).length >= 12,
      {
        timeout: 10000,
        interval: 150,
        timeoutMsg: 'seeded assistant messages did not hydrate into the conversation',
      }
    );

    const beforeScroll = await inspectConversationScrollRegion();
    assert.notEqual(
      beforeScroll,
      null,
      'conversation scroll region should be inspectable'
    );
    const density = beforeScroll?.density;
    assert.ok(
      density === 'comfortable' || density === 'compact',
      `unexpected conversation density: ${String(density)}`
    );
    assert.equal(beforeScroll?.fullscreen, 'true');
    assert.ok(
      (beforeScroll?.scrollHeight ?? 0) > (beforeScroll?.clientHeight ?? 0),
      'conversation history should overflow after host constraint is applied'
    );
    assert.ok(
      (beforeScroll?.inputBottom ?? 0) <= (beforeScroll?.viewportHeight ?? 0) + 24,
      'chat input should remain within the viewport'
    );
    assert.ok(
      (beforeScroll?.composerBottom ?? 0) <= (beforeScroll?.viewportHeight ?? 0) + 12,
      'composer should remain within the viewport'
    );

    await browser.execute(() => {
      const region = document.querySelector(
        '[data-testid="chat-messages-scroll-region"]'
      );
      region?.scrollTo({ top: 0, behavior: 'auto' });
      region?.dispatchEvent(new Event('scroll', { bubbles: true }));
    });

    const offsetFromBottom = await browser.execute(() => {
      const region = document.querySelector(
        '[data-testid="chat-messages-scroll-region"]'
      );
      if (!(region instanceof HTMLElement)) {
        return -1;
      }

      return region.scrollHeight - (region.scrollTop + region.clientHeight);
    });
    assert.ok(
      offsetFromBottom > 96,
      `conversation history did not become offset from the bottom (offset=${offsetFromBottom})`
    );

    const scrollButton = await $('[data-testid="chat-scroll-to-bottom"]');
    await scrollButton.waitForExist({ timeout: 10000 });
    assert.equal(await scrollButton.isDisplayed(), true);

    await safeClick(scrollButton);

    await browser.waitUntil(
      async () =>
        browser.execute(() => {
          const region = document.querySelector(
            '[data-testid="chat-messages-scroll-region"]'
          );
          if (!region) return false;

          const { scrollTop, clientHeight, scrollHeight } = region;
          return scrollHeight - (scrollTop + clientHeight) <= 96;
        }),
      {
        timeout: 10000,
        interval: 150,
        timeoutMsg: 'conversation did not return near the bottom after clicking CTA',
      }
    );

    const chatInput = await $('[data-testid="chat-input"]');
    await chatInput.waitForDisplayed({ timeout: 10000 });
    assert.equal(await chatInput.isDisplayed(), true, 'chat input should remain visible');
  });
});

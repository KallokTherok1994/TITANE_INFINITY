import { test, expect, type Page } from '@playwright/test';

const enableE2EChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as { __TITANE_E2E_CHAT_SCENARIO__?: 'success' | 'rate_limit' }).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
  });
};

test.describe('Chat Interface', () => {
  test('should preserve TIME context on direct /titane route through no-mock runtime', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      delete (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__;
      delete (window as { __TITANE_E2E_CHAT_SCENARIO__?: 'success' | 'rate_limit' }).__TITANE_E2E_CHAT_SCENARIO__;
    });

    await page.goto('/titane');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await expect(page.url()).not.toContain('/time');

    const mockFlag = await page.evaluate(
      () => (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ ?? false
    );
    expect(mockFlag).toBe(false);

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const raw = window.localStorage.getItem('titane_time_runtime_context_v1');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        });
      })
      .toEqual(
        expect.objectContaining({
          runtimeSource: 'global-publisher',
          currentDateTime: expect.any(String),
          timeZone: expect.any(String),
          currentSegment: expect.any(String),
          isWorkHours: expect.any(Boolean),
        })
      );

    await page.getByTestId('tab-conversation').click();
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 60000 });

    const assistantBefore = await page.getByTestId('chat-message-assistant').count();
    await input.fill('Runtime certification ping. Reply with exactly: TITANE_RUNTIME_OK');
    await page.getByTestId('chat-send').click();

    await expect
      .poll(async () => page.getByTestId('chat-message-assistant').count(), {
        timeout: 120000,
      })
      .toBeGreaterThan(assistantBefore);

    const assistantText = (
      await page
        .getByTestId('chat-message-assistant')
        .last()
        .getByTestId('chat-message-content')
        .innerText()
    ).trim();
    expect(assistantText.length).toBeGreaterThan(0);
    expect(assistantText).not.toContain('[MOCK_OK]');

    const envelope = await page.evaluate(() => {
      const raw = window.localStorage.getItem('titane_chat_context_envelope_v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(envelope).toBeTruthy();
    expect(envelope.routeContext.route).toBe('/titane');
    expect(envelope.timeContext).toEqual(
      expect.objectContaining({
        runtimeSource: 'global-publisher',
        currentDateTime: expect.any(String),
        timeZone: expect.any(String),
        currentSegment: expect.any(String),
      })
    );
    expect(envelope.temporalMemorySummary).toEqual(
      expect.objectContaining({
        status: 'fresh',
        runtimeSource: 'global-publisher',
      })
    );
    expect(typeof envelope.temporalMemorySummary.warningCount).toBe('number');
    expect(envelope.temporalMemorySummary.warningCount).toBeGreaterThanOrEqual(0);

    const postSendMockFlag = await page.evaluate(
      () =>
        (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ ??
        false
    );
    expect(postSendMockFlag).toBe(false);
  });

  test('should persist TIME runtime envelope on direct /titane route without /time', async ({ page }) => {
    await enableE2EChatMock(page);
    await page.goto('/titane');

    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await expect(page.url()).not.toContain('/time');

    await expect.poll(async () => {
      return page.evaluate(() => Boolean(window.localStorage.getItem('titane_time_runtime_context_v1')));
    }).toBe(true);

    const timeRuntimeContext = await page.evaluate(() => {
      const raw = window.localStorage.getItem('titane_time_runtime_context_v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(timeRuntimeContext).toEqual(
      expect.objectContaining({
        runtimeSource: 'global-publisher',
        currentDateTime: expect.any(String),
        timeZone: expect.any(String),
        currentSegment: expect.any(String),
        isWorkHours: expect.any(Boolean),
      })
    );

    await page.getByTestId('tab-conversation').click();
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 60000 });

    await input.fill('Certify TIME runtime context without visiting /time first.');
    await page.getByTestId('chat-send').click();

    const envelope = await page.evaluate(() => {
      const raw = window.localStorage.getItem('titane_chat_context_envelope_v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(envelope).toBeTruthy();
    expect(envelope.routeContext.route).toBe('/titane');
    expect(envelope.timeContext).toEqual(
      expect.objectContaining({
        runtimeSource: 'global-publisher',
        currentDateTime: expect.any(String),
        timeZone: expect.any(String),
        currentSegment: expect.any(String),
        isWorkHours: expect.any(Boolean),
      })
    );
    expect(envelope.temporalMemorySummary).toEqual(
      expect.objectContaining({
        status: 'fresh',
        runtimeSource: 'global-publisher',
      })
    );
    expect(typeof envelope.temporalMemorySummary.warningCount).toBe('number');
    expect(envelope.temporalMemorySummary.warningCount).toBeGreaterThanOrEqual(0);
  });

  test('should send and receive message', async ({ page }) => {
    // Navigate to root — React Router redirects /→/titane client-side
    // (do NOT use /titane: a symlink 'titane' at repo root is served as a static file by Vite)
    await page.goto('/');

    // Wait for app to load (TitanePage est lazy-loadé, premier compile DEV peut être lent)
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });

    // Navigate to conversation tab
    await page.getByTestId('tab-conversation').click();

    // Wait for chat input (textarea, data-testid="chat-input")
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible();

    // Type message
    await input.fill('Hello, TITANE!');

    // Send message (button data-testid="chat-send")
    await page.getByTestId('chat-send').click();

    // Verify user message appears in conversation
    await expect(page.getByTestId('chat-message-user').first()).toBeVisible();
    await expect(page.getByTestId('chat-message-content').first()).toContainText(
      'Hello, TITANE!'
    );
  });

  test('should handle new conversation', async ({ page }) => {
    await page.goto('/');

    // Navigate to conversation tab (attente page chargée)
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('tab-conversation').click();
    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 60000 });

    // Send a message first to populate history
    await input.fill('Test message');
    await page.getByTestId('chat-send').click();
    await expect(page.getByTestId('chat-message-user').first()).toBeVisible();

    // Accept confirmation dialog then clear chat
    page.on('dialog', dialog => dialog.accept());
    await page.getByTestId('btn-clear-chat').click();

    // Verify conversation is cleared
    await expect(page.getByTestId('chat-message-user')).toHaveCount(0);
  });

  test('should validate keyboard shortcuts', async ({ page }) => {
    await page.goto('/');

    // Navigate to conversation tab (attente page chargée)
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('tab-conversation').click();
    const conversationPage = page.getByTestId('page-conversation');
    await expect(conversationPage).toBeVisible({ timeout: 60000 });

    await expect(page.getByTestId('select-conversation-mode')).toHaveCount(0);
    await expect(page.getByTestId('chat-mode-selector-select')).toHaveValue('default');
    await expect(conversationPage).toHaveAttribute('data-conversation-mode', 'default');
    await expect(conversationPage).toHaveAttribute('data-chat-store-mode', 'default');

    // Verify conversation search input is accessible (data-testid="input-conversation-search")
    const searchInput = page.getByTestId('input-conversation-search');
    await expect(searchInput).toBeVisible();

    // Type in search input and verify value
    await searchInput.fill('test search');
    await expect(searchInput).toHaveValue('test search');

    // Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should open ModeBuilder for generate-and-open document intent', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('tab-conversation').click();
    const conversationPage = page.getByTestId('page-conversation');
    await expect(conversationPage).toBeVisible({ timeout: 60000 });

    await expect(page.getByTestId('select-conversation-mode')).toHaveCount(0);
    await expect(page.getByTestId('chat-mode-selector-select')).toHaveValue('default');
    await expect(conversationPage).toHaveAttribute('data-conversation-mode', 'default');
    await expect(conversationPage).toHaveAttribute('data-chat-store-mode', 'default');

    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 60000 });

    await input.fill('Genere un fichier et ouvre l editeur pour que je le modifie');
    await page.getByTestId('chat-send').click();

    await expect(page.locator('.mode-builder-overlay')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('chat-artifact-manifest')).toContainText(
      'Artifact Manifest: artifact-'
    );
  });

  test('should keep code-intent editor route blocked and not open ModeBuilder', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });
    await page.getByTestId('tab-conversation').click();
    const conversationPage = page.getByTestId('page-conversation');
    await expect(conversationPage).toBeVisible({ timeout: 60000 });

    await expect(page.getByTestId('select-conversation-mode')).toHaveCount(0);
    await expect(page.getByTestId('chat-mode-selector-select')).toHaveValue('default');
    await expect(conversationPage).toHaveAttribute('data-conversation-mode', 'default');
    await expect(conversationPage).toHaveAttribute('data-chat-store-mode', 'default');

    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 60000 });

    await input.fill('Genere un fichier de code et ouvre l editeur');
    await page.getByTestId('chat-send').click();

    // Primary assertion: ModeBuilder overlay must never open (route blocked)
    await expect(page.locator('.mode-builder-overlay')).toHaveCount(0);

    // Secondary assertion: if chat-runtime-state becomes visible (requires live LLM),
    // it must not show any editor launch intent — checked opportunistically.
    const runtimeState = page.getByTestId('chat-runtime-state');
    const runtimeVisible = await runtimeState
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (runtimeVisible) {
      await expect(runtimeState).not.toContainText('OPEN_FROM_CHAT_PROVEN');
    }
  });
});

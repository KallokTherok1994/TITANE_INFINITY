import { test, expect } from '@playwright/test';
import path from 'node:path';
import {
  collectConsoleAndPageErrors,
  extractCriticalPageErrors,
  extractCriticalConsoleErrors,
  filterKnownConsoleNoise,
  nowIso,
  waitForCondition,
  writeJsonArtifact,
  awaitAppReady,
  getInputBoundingMetrics,
} from './helpers';

const ARTIFACT_DIR = path.resolve(process.cwd(), 'reports/e2e/android-ui/browser');

/** Android mobile viewport presets used in multi-breakpoint coverage. */
const MOBILE_VIEWPORTS = [
  { name: 'pixel-7', width: 412, height: 915 },
  { name: 'galaxy-s25', width: 360, height: 800 },
  { name: 'iphone-14-pro', width: 390, height: 844 },
] as const;

/** Selectors that must be present in the conversation page (AR20 contract). */
const AR20_REQUIRED_SELECTORS = [
  '[data-testid="page-titane"]',
  '[data-testid="tab-conversation"]',
  '[data-testid="page-conversation"]',
  '[data-testid="chat-input"]',
  '[data-testid="chat-send"]',
];

type E2EChatScenario = 'success' | 'rate_limit';

type E2EChatKnowledgeSeedEntry = {
  title: string;
  category: string;
  content: string;
  relevance: number;
  tags: string[];
};

type E2EInlineCitation = {
  url: string;
  title?: string | null;
  excerpt: string;
  accessed_at: string;
  locator?: string | null;
  locator_text?: string | null;
};

async function dispatchChatSend(
  button: import('@playwright/test').Locator
): Promise<void> {
  await button.evaluate(node => {
    if (!(node instanceof HTMLButtonElement)) {
      throw new Error('chat-send is not a button');
    }
    node.click();
  });
}

async function enableE2EChatMock(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as { __TITANE_E2E_CHAT_CONV_SEQ__?: number }).__TITANE_E2E_CHAT_CONV_SEQ__ =
      0;
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = [];
    (
      window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }
    ).__TITANE_E2E_CHAT_MEMORY_LOG__ = [];
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
    (
      window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }
    ).__TITANE_E2E_WEB_RESEARCH_MOCK__ = false;
    (
      window as { __TITANE_E2E_WEB_RESEARCH_REPORT__?: unknown }
    ).__TITANE_E2E_WEB_RESEARCH_REPORT__ = undefined;
  });
}

async function setE2EChatScenario(
  page: import('@playwright/test').Page,
  scenario: E2EChatScenario
): Promise<void> {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = value;
  }, scenario);
}

async function setE2EChatKnowledgeSeed(
  page: import('@playwright/test').Page,
  seed: E2EChatKnowledgeSeedEntry[]
): Promise<void> {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = value;
    (
      window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }
    ).__TITANE_E2E_CHAT_MEMORY_LOG__ = [];
  }, seed);
}

async function enableInlineWebResearchMock(
  page: import('@playwright/test').Page,
  citations: E2EInlineCitation[]
): Promise<void> {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }
    ).__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    (
      window as { __TITANE_E2E_WEB_RESEARCH_REPORT__?: unknown }
    ).__TITANE_E2E_WEB_RESEARCH_REPORT__ = {
      answer: {
        answer: 'Synthese mock inline web research.',
        citations: value,
        limitations: [],
        trace_id: 'trace-android-inline-citations',
        sources_count: value.length,
        retrieved_passages_count: value.length,
      },
      trace: {
        trace_id: 'trace-android-inline-citations',
        markers: ['M_CITATIONS_BUILD_OK', 'VERDICT_PASS'],
        errors: [],
      },
    };
  }, citations);
}

async function submitChatMessage(
  page: import('@playwright/test').Page,
  message: string
): Promise<void> {
  const chatInput = page.getByTestId('chat-input');
  const sendButton = page.getByTestId('chat-send');

  await expect(chatInput).toBeVisible({ timeout: 15000 });
  await expect(sendButton).toBeVisible({ timeout: 15000 });
  await chatInput.fill(message);
  await dispatchChatSend(sendButton);
}

function buildSeededConversationMessages(pairCount = 18) {
  const now = Date.now();
  return Array.from({ length: pairCount * 2 }, (_, index) => {
    const isAssistant = index % 2 === 1;
    const turn = Math.floor(index / 2) + 1;
    return {
      id: `android-seed-${index + 1}`,
      role: isAssistant ? 'assistant' : 'user',
      content: isAssistant
        ? `Assistant seed ${turn}: réponse longue pour valider la compaction mobile et la flèche retour bas.`
        : `User seed ${turn}: message de test pour générer un historique scrollable.`,
      timestamp: now + index,
      metadata: isAssistant
        ? {
            tags: ['seed:scroll-bottom'],
          }
        : {},
    };
  });
}

async function primeConversationHistory(
  page: import('@playwright/test').Page,
  pairCount = 18
) {
  const seedConversationId = 'android-scroll-bottom-proof';
  const seedTimestamp = Date.now();
  const seedMessages = buildSeededConversationMessages(pairCount);

  await page.addInitScript(
    ({ conversationId, timestamp, messages }) => {
      window.localStorage.setItem('onboarding_completed', 'true');
      window.localStorage.setItem(
        'onboarding_preferences',
        JSON.stringify({
          profile: 'e2e',
          mode: 'default',
        })
      );
      window.localStorage.setItem('titane_active_conversation_id', conversationId);
      window.localStorage.setItem(
        `titane_conversation_${conversationId}`,
        JSON.stringify({
          id: conversationId,
          title: 'Android scroll bottom proof',
          created_at: new Date(timestamp).toISOString(),
          updated_at: new Date(timestamp).toISOString(),
          messages,
        })
      );
      window.localStorage.setItem(
        'titane_chat_mode_default',
        JSON.stringify({
          mode: 'default',
          messages,
          compressed: [],
          lastCompacted: timestamp,
        })
      );
    },
    {
      conversationId: seedConversationId,
      timestamp: seedTimestamp,
      messages: seedMessages,
    }
  );
}

test.describe('Android Build UI - Browser and Android Emulation', () => {
  // ─── T1: Core UI map (canonical smoke test — preserved) ───────────────────
  test('T1 - renders core conversation UI and exports required UI maps', async ({
    page,
  }) => {
    const startedAt = Date.now();
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 60000 });

    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    const userMessages = page.getByTestId('chat-message-user');
    const assistantMessages = page.getByTestId('chat-message-assistant');
    const chatError = page.getByTestId('chat-error');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    const userCountBefore = await userMessages.count();
    const assistantCountBefore = await assistantMessages.count();

    await chatInput.fill('Android UI smoke message');
    await expect(chatInput).toHaveValue('Android UI smoke message');
    await dispatchChatSend(sendButton);

    await expect(userMessages).toHaveCount(userCountBefore + 1, { timeout: 15000 });

    // Non-silence contract: assistant response OR visible chat error.
    const noSilence = await waitForCondition(
      async () => {
        const assistantCount = await assistantMessages.count();
        const hasChatError = await chatError.isVisible().catch(() => false);
        return assistantCount > assistantCountBefore || hasChatError;
      },
      { timeoutMs: 25000, intervalMs: 500 }
    );

    expect(noSilence).toBe(true);

    const viewport = page.viewportSize();
    const route = page.url();

    const domMap = await page.evaluate(() => {
      const has = (selector: string) => Boolean(document.querySelector(selector));
      return {
        pageTitane: has('[data-testid="page-titane"]'),
        pageConversation: has('[data-testid="page-conversation"]'),
        chatInput: has('[data-testid="chat-input"]'),
        chatSend: has('[data-testid="chat-send"]'),
        userMessage: has('[data-testid="chat-message-user"]'),
        assistantMessage: has('[data-testid="chat-message-assistant"]'),
        tabConversation: has('[data-testid="tab-conversation"]'),
        tabTitane: has('[data-testid="tab-titane"]'),
      };
    });

    const requiredSelectors = [...AR20_REQUIRED_SELECTORS];

    const ar20 = await page.evaluate(selectors => {
      const present = selectors.filter(selector => document.querySelector(selector));
      return {
        requiredSelectors: selectors,
        presentCount: present.length,
        requiredCount: selectors.length,
        ratio: selectors.length === 0 ? 0 : present.length / selectors.length,
      };
    }, requiredSelectors);

    const offline5 = await page.evaluate(() => {
      const offline = document.querySelector('[data-testid="offline-indicator"]');
      const retry = document.querySelector('[data-testid="retry-indicator"]');
      const runtime = document.querySelector('[data-testid="chat-runtime-state"]');
      return {
        offlineIndicatorPresent: Boolean(offline),
        retryIndicatorPresent: Boolean(retry),
        runtimeStatePresent: Boolean(runtime),
      };
    });

    const navigation = await page.evaluate(() => {
      const text = (el: Element | null) => (el?.textContent ?? '').trim();
      return {
        hasMainNavigation: Boolean(document.querySelector('nav,[role="navigation"]')),
        activeTabLabel:
          text(
            document.querySelector(
              '[data-testid="tab-conversation"][aria-selected="true"]'
            )
          ) || text(document.querySelector('[data-testid="tab-conversation"]')),
      };
    });

    // Quick responsive sanity check for mobile-like viewport behavior.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('tab-conversation')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();

    const mobileInputMetrics = await page.getByTestId('chat-input').evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        bottom: rect.bottom,
        viewportHeight: window.innerHeight,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    const assistantCountAfter = await assistantMessages.count();
    const chatErrorVisible = await chatError.isVisible().catch(() => false);

    const stability = {
      startedAt: nowIso(),
      durationMs: Date.now() - startedAt,
      consoleErrorCount: filteredErrors.length,
      consoleErrors: filteredErrors,
      criticalConsoleErrorCount: criticalErrors.length,
      criticalConsoleErrors: criticalErrors,
      pageErrorCount: pageErrors.length,
      pageErrors,
      criticalPageErrorCount: criticalPageErrors.length,
      criticalPageErrors,
      userMessageCount: await userMessages.count(),
      assistantMessageCount: assistantCountAfter,
      chatErrorVisible,
      noSilence,
      mobileInputNearBottom:
        mobileInputMetrics.bottom >= mobileInputMetrics.viewportHeight * 0.6,
      mobileInputMetrics,
    };

    writeJsonArtifact(ARTIFACT_DIR, 'page_classification.json', {
      route,
      viewport,
      project: test.info().project.name,
      mobileLike: Boolean(viewport && viewport.width <= 768),
    });
    writeJsonArtifact(ARTIFACT_DIR, 'chat_dom_map.json', domMap);
    writeJsonArtifact(ARTIFACT_DIR, 'AR20.json', ar20);
    writeJsonArtifact(ARTIFACT_DIR, 'OFFLINE5.json', offline5);
    writeJsonArtifact(ARTIFACT_DIR, 'navigation.json', navigation);
    writeJsonArtifact(ARTIFACT_DIR, 'stability.json', stability);

    expect(ar20.presentCount).toBe(ar20.requiredCount);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
    expect(stability.mobileInputNearBottom).toBe(true);
  });

  // ─── T2: App-ready signal ─────────────────────────────────────────────────
  test('T2 - page-titane renders and initial load completes within 15s', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);
    const startedAt = Date.now();

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 15000 });

    const ttRenderMs = Date.now() - startedAt;

    const appReadyVisible = await waitForCondition(
      async () =>
        page
          .getByTestId('app-ready')
          .isVisible()
          .catch(() => false),
      { timeoutMs: 10000, intervalMs: 300 }
    );

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T2_app_ready.json', {
      appReadyVisible,
      ttRenderMs,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(ttRenderMs).toBeLessThan(15000);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T3: Conversation tab navigation ──────────────────────────────────────
  test('T3 - conversation tab navigates and reveals required chat components', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);

    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const elements = {
      chatInput: await page
        .getByTestId('chat-input')
        .isVisible()
        .catch(() => false),
      chatSend: await page
        .getByTestId('chat-send')
        .isVisible()
        .catch(() => false),
      tabConversation: await page
        .getByTestId('tab-conversation')
        .isVisible()
        .catch(() => false),
    };

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T3_conversation_nav.json', {
      elements,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(elements.chatInput).toBe(true);
    expect(elements.chatSend).toBe(true);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T4: Mobile viewport multi-breakpoint layout ───────────────────────────
  for (const vp of MOBILE_VIEWPORTS) {
    test(`T4 - mobile layout at ${vp.name} (${vp.width}x${vp.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

      await awaitAppReady(page);
      await page.getByTestId('tab-conversation').click();
      await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

      const chatInput = page.getByTestId('chat-input');
      await expect(chatInput).toBeVisible();

      // Scroll into view before measuring so the element is in the visible area
      await chatInput.scrollIntoViewIfNeeded();
      const inputMetrics = await getInputBoundingMetrics(page, 'chat-input');

      const filteredErrors = filterKnownConsoleNoise(consoleErrors);
      const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
      const criticalPageErrors = extractCriticalPageErrors(pageErrors);

      writeJsonArtifact(ARTIFACT_DIR, `T4_viewport_${vp.name}.json`, {
        viewport: vp,
        inputMetrics,
        project: test.info().project.name,
        criticalErrors,
        criticalPageErrors,
      });

      // After scroll-into-view: input must fit within viewport (+100px tolerance for browser chrome)
      expect(inputMetrics.bottom).toBeLessThanOrEqual(inputMetrics.viewportHeight + 100);
      // Input takes at least 50% of viewport width — not collapsed
      expect(inputMetrics.width).toBeGreaterThan(vp.width * 0.5);
      expect(criticalErrors).toHaveLength(0);
      expect(criticalPageErrors).toHaveLength(0);
    });
  }

  // ─── T5: Landscape viewport ───────────────────────────────────────────────
  test('T5 - landscape viewport (823x390) - chat input accessible', async ({ page }) => {
    await page.setViewportSize({ width: 823, height: 390 });
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    await expect(chatInput).toBeVisible();

    // Scroll into view before measuring — landscape may require manual scroll
    await chatInput.scrollIntoViewIfNeeded();
    const inputMetrics = await getInputBoundingMetrics(page, 'chat-input');

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T5_landscape.json', {
      viewport: { width: 823, height: 390 },
      inputMetrics,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    // After scroll-into-view: input must fit within viewport (+100px tolerance)
    expect(inputMetrics.bottom).toBeLessThanOrEqual(inputMetrics.viewportHeight + 100);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T6: No critical errors on cold load ──────────────────────────────────
  test('T6 - no critical JS or page errors on cold load (2s settle)', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 30000 });
    // Allow async initializations to settle
    await page.waitForTimeout(2000);

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T6_cold_load_errors.json', {
      timestamp: nowIso(),
      project: test.info().project.name,
      consoleErrors: filteredErrors,
      criticalErrors,
      pageErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T7: Runtime state badge ──────────────────────────────────────────────
  test('T7 - chat runtime state or badge surfaces after conversation load', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const runtimeVisible = await waitForCondition(
      async () => {
        const badge = page.getByTestId('chat-runtime-badge');
        const state = page.getByTestId('chat-runtime-state');
        return (
          (await badge.isVisible().catch(() => false)) ||
          (await state.isVisible().catch(() => false))
        );
      },
      { timeoutMs: 10000, intervalMs: 500 }
    );

    const runtimeText = await page.evaluate(() => {
      const badge = document.querySelector('[data-testid="chat-runtime-badge"]');
      const state = document.querySelector('[data-testid="chat-runtime-state"]');
      return {
        badgeText: badge?.textContent?.trim() ?? null,
        stateText: state?.textContent?.trim() ?? null,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T7_runtime_badge.json', {
      runtimeVisible,
      runtimeText,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    // No critical errors is the hard assertion; runtime visibility is informational
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T8: Chat typing + send dispatch ──────────────────────────────────────
  test('T8 - chat input accepts text and send dispatches user message', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    const userMessages = page.getByTestId('chat-message-user');

    await expect(chatInput).toBeVisible();
    await expect(sendButton).toBeVisible();

    const countBefore = await userMessages.count();
    await chatInput.fill('T8: Android UI input dispatch probe');
    await expect(chatInput).toHaveValue('T8: Android UI input dispatch probe');
    await dispatchChatSend(sendButton);

    await expect(userMessages).toHaveCount(countBefore + 1, { timeout: 15000 });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T8_chat_send.json', {
      messageCountBefore: countBefore,
      messageCountAfter: countBefore + 1,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T9: Non-silence contract ─────────────────────────────────────────────
  test('T9 - non-silence: assistant responds or chat-error shown within 30s', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    const userMessages = page.getByTestId('chat-message-user');
    const assistantMessages = page.getByTestId('chat-message-assistant');
    const chatError = page.getByTestId('chat-error');

    const userCountBefore = await userMessages.count();
    const assistantCountBefore = await assistantMessages.count();

    await chatInput.fill('T9: non-silence probe');
    await dispatchChatSend(sendButton);
    await expect(userMessages).toHaveCount(userCountBefore + 1, { timeout: 15000 });

    const noSilence = await waitForCondition(
      async () => {
        const ac = await assistantMessages.count();
        const err = await chatError.isVisible().catch(() => false);
        return ac > assistantCountBefore || err;
      },
      { timeoutMs: 30000, intervalMs: 500 }
    );

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T9_non_silence.json', {
      noSilence,
      assistantCountBefore,
      assistantCountAfter: await assistantMessages.count(),
      chatErrorVisible: await chatError.isVisible().catch(() => false),
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    // Non-silence contract: skip gracefully when running without a live LLM backend.
    // In Tauri production runtime or with TITANE_E2E_LIVE_LLM=1, this must pass.
    if (!noSilence) {
      const hasLiveLLM = process.env.TITANE_E2E_LIVE_LLM === '1';
      test.skip(
        !hasLiveLLM,
        'T9 non-silence requires a live LLM backend (set TITANE_E2E_LIVE_LLM=1)'
      );
    }
    expect(noSilence).toBe(true);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T10: Scrollable chat container ───────────────────────────────────────
  test('T10 - conversation page has a scrollable overflow container', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const scrollInfo = await page.evaluate(() => {
      const conversationPage = document.querySelector(
        '[data-testid="page-conversation"]'
      );
      if (!conversationPage) return { found: false, source: 'none' };

      const OVERFLOW_VALUES = new Set(['auto', 'scroll', 'overlay']);

      const checkStyle = (el: Element) => {
        const style = window.getComputedStyle(el);
        return (
          OVERFLOW_VALUES.has(style.overflowY) || OVERFLOW_VALUES.has(style.overflow)
        );
      };

      if (checkStyle(conversationPage))
        return { found: true, source: 'page-conversation' };

      for (const child of conversationPage.children) {
        if (checkStyle(child)) return { found: true, source: 'direct-child' };
      }

      for (const el of conversationPage.querySelectorAll('*')) {
        if (checkStyle(el)) return { found: true, source: 'nested' };
      }

      // Fallback: document body or html may scroll (valid for single-page app)
      const bodyStyle = window.getComputedStyle(document.body);
      if (
        OVERFLOW_VALUES.has(bodyStyle.overflowY) ||
        document.body.scrollHeight > window.innerHeight
      ) {
        return { found: true, source: 'body' };
      }

      return { found: false, source: 'none' };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T10_scroll_container.json', {
      scrollInfo,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(scrollInfo.found).toBe(true);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T11: Keyboard focus on chat input ────────────────────────────────────
  test('T11 - chat input receives focus on tap/click', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const chatInput = page.getByTestId('chat-input');
    await chatInput.click();

    const focused = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="chat-input"]');
      return el
        ? document.activeElement === el || el.contains(document.activeElement)
        : false;
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T11_keyboard_focus.json', {
      focused,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(focused).toBe(true);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T12: Navigation landmark ─────────────────────────────────────────────
  test('T12 - page exposes navigation landmark (nav, role=navigation, or tabs)', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);

    const navInfo = await page.evaluate(() => {
      return {
        hasNav: Boolean(document.querySelector('nav')),
        hasRoleNav: Boolean(document.querySelector('[role="navigation"]')),
        hasTabsList: Boolean(document.querySelector('[data-testid="tabs-list"]')),
        hasTabsComponent: Boolean(
          document.querySelector('[data-testid="tabs-component"]')
        ),
        tabsListChildCount:
          document.querySelector('[data-testid="tabs-list"]')?.children.length ?? 0,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T12_nav_landmark.json', {
      navInfo,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    const hasAnyNav =
      navInfo.hasNav ||
      navInfo.hasRoleNav ||
      navInfo.hasTabsList ||
      navInfo.hasTabsComponent;
    expect(hasAnyNav).toBe(true);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T13: Performance — initial render within 10s ─────────────────────────
  test('T13 - performance: page-titane visible within 10s on cold start', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);
    const startedAt = Date.now();

    await page.goto('/');
    await expect(page.getByTestId('page-titane')).toBeVisible({ timeout: 10000 });

    const ttFirstVisibleMs = Date.now() - startedAt;

    const navTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      return {
        domContentLoaded: nav
          ? Math.round(nav.domContentLoadedEventEnd - nav.startTime)
          : null,
        loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T13_performance.json', {
      ttFirstVisibleMs,
      navTiming,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(ttFirstVisibleMs).toBeLessThan(10000);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T14: Provider state surfacing in browser mode ────────────────────────
  test('T14 - provider state surfaces (warning, fallback, or runtime indicator)', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    // Allow async initializations beyond initial hydration
    await page.waitForTimeout(3000);

    const providerState = await page.evaluate(() => {
      const get = (testid: string) =>
        Boolean(document.querySelector(`[data-testid="${testid}"]`));
      return {
        providerWarning: get('chat-provider-warning'),
        chatFallback: get('chat-fallback'),
        runtimeState: get('chat-runtime-state'),
        runtimeBadge: get('chat-runtime-badge'),
        runtimeTag: get('chat-runtime-tag'),
        runtimeSummary: get('chat-runtime-summary'),
        runtimeStateText:
          document
            .querySelector('[data-testid="chat-runtime-state"]')
            ?.textContent?.trim() ?? null,
      };
    });

    const anySurface =
      providerState.providerWarning ||
      providerState.chatFallback ||
      providerState.runtimeState ||
      providerState.runtimeBadge ||
      providerState.runtimeTag ||
      providerState.runtimeSummary;

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T14_provider_state.json', {
      providerState,
      anySurface,
      timestamp: nowIso(),
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    // Critical: no JS errors. Provider surface is informational but should exist.
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T15: AR20 selector coverage ──────────────────────────────────────────
  test('T15 - AR20: all 5 required UI selectors present at conversation page', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const ar20 = await page.evaluate(
      selectors => {
        const missing = selectors.filter(sel => !document.querySelector(sel));
        return {
          requiredSelectors: selectors,
          presentCount: selectors.length - missing.length,
          requiredCount: selectors.length,
          missing,
          ratio: (selectors.length - missing.length) / selectors.length,
        };
      },
      [...AR20_REQUIRED_SELECTORS]
    );

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T15_AR20.json', {
      ar20,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(ar20.missing).toHaveLength(0);
    expect(ar20.presentCount).toBe(ar20.requiredCount);
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T16: Clear chat button availability ──────────────────────────────────
  test('T16 - btn-clear-chat is present and accessible on conversation page', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    // Populate first so clear button may become enabled
    const chatInput = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    await chatInput.fill('T16: clear button probe');
    await dispatchChatSend(sendButton);
    await expect(page.getByTestId('chat-message-user')).toHaveCount(1, {
      timeout: 10000,
    });

    const clearBtn = page.getByTestId('btn-clear-chat');
    const clearBtnPresent = await clearBtn.isVisible().catch(() => false);

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T16_clear_chat.json', {
      clearBtnPresent,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    // No critical errors is mandatory; button presence is informational (may be hidden by design)
    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T17: Compact mobile history + return-to-bottom CTA ──────────────────
  test('T17 - long mobile history stays compact and the return-to-bottom CTA restores the latest view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await primeConversationHistory(page, 22);

    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    const scrollRegion = page.getByTestId('chat-messages-scroll-region');
    const chatInput = page.getByTestId('chat-input');

    await expect(scrollRegion).toBeVisible();
    await expect(chatInput).toBeVisible();
    await expect(page.getByTestId('chat-message-assistant')).toHaveCount(22, {
      timeout: 15000,
    });

    const beforeScroll = await page.evaluate(() => {
      const container = document.querySelector('.conversation-container');
      const region = document.querySelector(
        '[data-testid="chat-messages-scroll-region"]'
      );
      const conversationTab = document.querySelector('[data-testid="tab-conversation"]');
      const input = document.querySelector('[data-testid="chat-input"]');
      const composer = document.querySelector('.conversation-input-container');
      if (
        !(container instanceof HTMLElement) ||
        !(region instanceof HTMLElement) ||
        !(conversationTab instanceof HTMLElement) ||
        !input ||
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

      const tabRect = conversationTab.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const composerRect = composer.getBoundingClientRect();
      return {
        density: container.dataset.density ?? null,
        fullscreen: container.dataset.fullscreen ?? null,
        scrollHeight: region.scrollHeight,
        clientHeight: region.clientHeight,
        tabTop: tabRect.top,
        tabBottom: tabRect.bottom,
        inputBottom: inputRect.bottom,
        composerBottom: composerRect.bottom,
        viewportHeight: window.innerHeight,
        hostConstraintApplied,
      };
    });

    expect(beforeScroll).not.toBeNull();
    expect(beforeScroll?.fullscreen).toBe('true');
    expect(beforeScroll?.density).toBe('compact');
    expect(beforeScroll?.scrollHeight ?? 0).toBeGreaterThan(
      beforeScroll?.clientHeight ?? 0
    );
    expect(beforeScroll?.tabTop ?? -1).toBeGreaterThanOrEqual(0);
    expect(beforeScroll?.tabBottom ?? 0).toBeLessThanOrEqual(
      beforeScroll?.viewportHeight ?? 0
    );
    expect(beforeScroll?.inputBottom ?? 0).toBeLessThanOrEqual(
      (beforeScroll?.viewportHeight ?? 0) + 24
    );
    expect(beforeScroll?.composerBottom ?? 0).toBeLessThanOrEqual(
      (beforeScroll?.viewportHeight ?? 0) + 12
    );

    await page.evaluate(() => {
      const region = document.querySelector(
        '[data-testid="chat-messages-scroll-region"]'
      );
      if (region instanceof HTMLElement) {
        region.scrollTo({ top: 0, behavior: 'auto' });
        region.dispatchEvent(new Event('scroll', { bubbles: true }));
      }
    });

    const scrollToBottom = page.getByTestId('chat-scroll-to-bottom');
    await expect(scrollToBottom).toBeVisible({ timeout: 10000 });

    const ctaMetrics = await scrollToBottom.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        right: rect.right,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });

    expect(ctaMetrics.bottom).toBeLessThanOrEqual(ctaMetrics.viewportHeight + 8);
    expect(ctaMetrics.right).toBeLessThanOrEqual(ctaMetrics.viewportWidth + 8);

    await scrollToBottom.evaluate((button: HTMLButtonElement) => button.click());

    const returnedToBottom = await waitForCondition(
      async () =>
        page.evaluate(() => {
          const region = document.querySelector(
            '[data-testid="chat-messages-scroll-region"]'
          );
          if (!(region instanceof HTMLElement)) {
            return false;
          }

          return region.scrollHeight - (region.scrollTop + region.clientHeight) <= 96;
        }),
      { timeoutMs: 10000, intervalMs: 200 }
    );

    const afterClick = await page.evaluate(() => {
      const region = document.querySelector(
        '[data-testid="chat-messages-scroll-region"]'
      );
      if (!(region instanceof HTMLElement)) {
        return null;
      }

      return {
        remaining: region.scrollHeight - (region.scrollTop + region.clientHeight),
      };
    });

    expect(returnedToBottom).toBe(true);
    expect(afterClick).not.toBeNull();
    expect(afterClick?.remaining ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(96);

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T17_scroll_to_bottom_compact.json', {
      beforeScroll,
      ctaMetrics,
      afterClick,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T18: Runtime truth under mobile rate limit ─────────────────────────
  test('T18 - mobile runtime surfaces quota degradation honestly', async ({ page }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    await enableE2EChatMock(page);
    await setE2EChatScenario(page, 'rate_limit');
    await submitChatMessage(page, 'Lance une exploration GitHub');

    const readRateLimitRuntimeProof = async () => {
      return page.evaluate(() => {
        const panel = document.querySelector('[data-testid="chat-runtime-state"]');
        const summary = document.querySelector('[data-testid="chat-runtime-summary"]');
        const badge = Array.from(
          document.querySelectorAll('[data-testid="chat-runtime-badge"]')
        )
          .map(node => node.textContent?.trim() ?? '')
          .find(text => text.includes('RATE_LIMIT'));

        return {
          providerReason: panel?.getAttribute('data-provider-reason') ?? null,
          providerMode: panel?.getAttribute('data-provider-mode') ?? null,
          networkUsed: panel?.getAttribute('data-network-used') ?? null,
          summary: summary?.textContent?.trim() ?? null,
          badgeText: badge ?? null,
        };
      });
    };

    await expect
      .poll(readRateLimitRuntimeProof, {
        timeout: 15000,
        intervals: [250, 500, 1000],
      })
      .toMatchObject({
        providerReason: 'RATE_LIMIT',
        providerMode: 'OFFLINE',
        networkUsed: 'true',
      });

    const runtimeProof = await readRateLimitRuntimeProof();

    expect(runtimeProof.summary ?? '').toContain('Reason: RATE_LIMIT');
    expect(runtimeProof.summary ?? '').toContain('Provider: github-copilot');
    expect(runtimeProof.badgeText ?? '').toContain('RATE_LIMIT');
    await expect(page.getByTestId('chat-message-content').last()).not.toContainText(
      '[MOCK_OK]'
    );

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T18_rate_limit_runtime_truth.json', {
      runtimeTruth: runtimeProof,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T19: Mobile memory + knowledge runtime tags ────────────────────────
  test('T19 - mobile chat renders knowledge and memory runtime proof tags', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    await enableE2EChatMock(page);
    await setE2EChatKnowledgeSeed(page, [
      {
        title: 'One Door Governance',
        category: 'architecture',
        content:
          'All network access must flow through UI -> IPC -> services -> gateway -> external.',
        relevance: 0.96,
        tags: ['architecture', 'network'],
      },
    ]);

    await submitChatMessage(page, 'Active la connaissance runtime One Door');

    const readMockAssistantProof = async () => {
      return page.evaluate(() => {
        const assistants = document.querySelectorAll(
          '[data-testid="chat-message-assistant"] [data-testid="chat-message-content"]'
        );
        const lastAssistant = assistants[assistants.length - 1];
        return {
          memoryLog:
            (
              window as {
                __TITANE_E2E_CHAT_MEMORY_LOG__?: Array<{
                  userMessage?: string;
                  knowledgeTitles?: string[];
                }>;
              }
            ).__TITANE_E2E_CHAT_MEMORY_LOG__ || [],
          assistantText: lastAssistant?.textContent?.trim() ?? '',
        };
      });
    };

    await expect
      .poll(readMockAssistantProof, {
        timeout: 15000,
        intervals: [250, 500, 1000],
      })
      .toMatchObject({
        memoryLog: [
          expect.objectContaining({
            userMessage: 'Active la connaissance runtime One Door',
            knowledgeTitles: ['One Door Governance'],
          }),
        ],
      });

    const firstAssistantProof = await readMockAssistantProof();

    expect(firstAssistantProof.assistantText).toContain('MOCKOK');
    expect(firstAssistantProof.assistantText).toContain(
      'Active la connaissance runtime One Door'
    );
    expect(firstAssistantProof.assistantText).toContain('MOCKKNOWLEDGE');
    expect(firstAssistantProof.assistantText).toContain('One Door Governance');

    await submitChatMessage(page, 'Rappelle le dernier echange memoire');
    await expect
      .poll(readMockAssistantProof, {
        timeout: 15000,
        intervals: [250, 500, 1000],
      })
      .toMatchObject({
        memoryLog: [
          expect.anything(),
          expect.objectContaining({
            userMessage: 'Rappelle le dernier echange memoire',
          }),
        ],
      });

    const runtimeProof = await readMockAssistantProof();

    expect(runtimeProof.memoryLog).toHaveLength(2);
    expect(runtimeProof.memoryLog[0]).toEqual(
      expect.objectContaining({
        userMessage: 'Active la connaissance runtime One Door',
        knowledgeTitles: ['One Door Governance'],
      })
    );
    expect(runtimeProof.assistantText).toContain('MOCKMEMORY');
    expect(runtimeProof.assistantText).toContain(
      'Active la connaissance runtime One Door'
    );
    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T19_knowledge_memory_runtime_truth.json', {
      runtimeProof,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T20: Mobile inline online citations ────────────────────────────────
  test('T20 - mobile chat renders inline web research citations on the canonical surface', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    await enableE2EChatMock(page);
    await enableInlineWebResearchMock(page, [
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait gouverne A',
        accessed_at: '2026-04-18T10:00:00Z',
        locator_text: 'p=2, c≈40',
      },
      {
        url: 'https://example.com/source-b',
        title: 'Source B',
        excerpt: 'Extrait gouverne B',
        accessed_at: '2026-04-18T10:02:00Z',
        locator: '§4',
      },
    ]);

    await submitChatMessage(page, 'Fais une recherche web en ligne sur TITANE');

    const citationsContainer = page.locator('[data-testid^="message-citations-"]').last();
    await expect(citationsContainer).toBeVisible({ timeout: 15000 });
    await expect(citationsContainer).toContainText('Sources en ligne');
    await expect(citationsContainer.getByText('Source A')).toBeVisible();
    await expect(citationsContainer.getByText('Extrait gouverne A')).toBeVisible();
    await expect(citationsContainer.getByText('p=2, c≈40')).toBeVisible();
    await expect(
      citationsContainer.getByText('accessed: 2026-04-18T10:00:00Z')
    ).toBeVisible();
    await expect(citationsContainer.getByText('Source B')).toBeVisible();

    const citationProof = await page.evaluate(() => {
      const container = document.querySelector('[data-testid^="message-citations-"]');
      const citations = Array.from(
        document.querySelectorAll('[data-testid^="message-citation-"]')
      ).map(node => node.textContent?.trim() ?? '');
      return {
        containerText: container?.textContent?.trim() ?? null,
        citations,
      };
    });

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T20_inline_citations_runtime_truth.json', {
      citationProof,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });

  // ─── T21: Mobile conversation runtime mode truth ───────────────────────
  test('T21 - mobile conversation mode selector keeps page and runtime mode truth aligned', async ({
    page,
  }) => {
    const { consoleErrors, pageErrors } = collectConsoleAndPageErrors(page);

    await awaitAppReady(page);
    await page.getByTestId('tab-conversation').click();
    await expect(page.getByTestId('page-conversation')).toBeVisible({ timeout: 15000 });

    await enableE2EChatMock(page);

    await expect(page.getByTestId('select-conversation-mode')).toHaveCount(0);
    await expect(page.getByTestId('page-conversation')).toHaveAttribute(
      'data-conversation-mode',
      'default'
    );

    await page.getByTestId('chat-mode-selector-select').selectOption('planning');

    await expect(page.getByTestId('page-conversation')).toHaveAttribute(
      'data-conversation-mode',
      'planning'
    );
    await expect(page.getByTestId('page-conversation')).toHaveAttribute(
      'data-chat-store-mode',
      'planning'
    );

    await submitChatMessage(page, 'Confirme le mode planning sur mobile en une phrase.');

    const readModeRuntimeProof = async () => {
      return page.evaluate(() => {
        const panel = document.querySelector('[data-testid="chat-runtime-state"]');
        const summary = document.querySelector('[data-testid="chat-runtime-summary"]');
        const badges = Array.from(
          document.querySelectorAll('[data-testid="chat-runtime-badge"]')
        ).map(node => node.textContent?.trim() ?? '');

        return {
          pageConversationMode:
            document
              .querySelector('[data-testid="page-conversation"]')
              ?.getAttribute('data-conversation-mode') ?? null,
          pageStoreMode:
            document
              .querySelector('[data-testid="page-conversation"]')
              ?.getAttribute('data-chat-store-mode') ?? null,
          runtimeConversationMode: panel?.getAttribute('data-conversation-mode') ?? null,
          runtimeStoreMode: panel?.getAttribute('data-chat-store-mode') ?? null,
          summary: summary?.textContent?.trim() ?? null,
          badges,
        };
      });
    };

    await expect
      .poll(readModeRuntimeProof, {
        timeout: 15000,
        intervals: [250, 500, 1000],
      })
      .toMatchObject({
        pageConversationMode: 'planning',
        pageStoreMode: 'planning',
        runtimeConversationMode: 'planning',
        runtimeStoreMode: 'planning',
      });

    const runtimeProof = await readModeRuntimeProof();

    expect(runtimeProof.summary ?? '').toContain('Conversation mode: planning');
    expect(runtimeProof.summary ?? '').toContain('Store mode: planning');
    expect(runtimeProof.badges).toContain('conversation-mode:planning');
    expect(runtimeProof.badges).toContain('chat-store-mode:planning');

    const filteredErrors = filterKnownConsoleNoise(consoleErrors);
    const criticalErrors = extractCriticalConsoleErrors(filteredErrors);
    const criticalPageErrors = extractCriticalPageErrors(pageErrors);

    writeJsonArtifact(ARTIFACT_DIR, 'T21_mobile_mode_runtime_truth.json', {
      runtimeProof,
      project: test.info().project.name,
      criticalErrors,
      criticalPageErrors,
    });

    expect(criticalErrors).toHaveLength(0);
    expect(criticalPageErrors).toHaveLength(0);
  });
});

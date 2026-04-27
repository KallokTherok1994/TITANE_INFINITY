/**
 * E2E Test: Chat Interaction (Critical Path)
 * TITANE∞ v22.0.0 - AI Chat Pipeline Validation
 *
 * Critical user journey: Send message and receive AI response
 *
 * NOTE: These tests require Tauri backend. Skipped in unit-test-focused CI.
 * Unit tests (C1-C6) provide comprehensive coverage.
 */

import { test, expect, type Page } from '@playwright/test';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

const FULL_E2E_ENABLED = process.env.TITANE_E2E_FULL === '1';
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

const enableE2EChatMock = async (page: Page) => {
  await page.addInitScript(() => {
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
};

const enableInlineWebResearchMock = async (
  page: Page,
  citations: E2EInlineCitation[]
) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }
    ).__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    (
      window as { __TITANE_E2E_WEB_RESEARCH_REPORT__?: unknown }
    ).__TITANE_E2E_WEB_RESEARCH_REPORT__ = {
      answer: {
        answer: 'Synthèse mock inline web research.',
        citations: value,
        limitations: [],
        trace_id: 'trace-e2e-inline-citations',
        sources_count: value.length,
        retrieved_passages_count: value.length,
      },
      trace: {
        trace_id: 'trace-e2e-inline-citations',
        markers: ['M_CITATIONS_BUILD_OK', 'VERDICT_PASS'],
        errors: [],
      },
    };
  }, citations);
};

const setE2EChatScenario = async (page: Page, scenario: E2EChatScenario) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = value;
  }, scenario);
};

const setE2EChatKnowledgeSeed = async (page: Page, seed: E2EChatKnowledgeSeedEntry[]) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = value;
    (
      window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }
    ).__TITANE_E2E_CHAT_MEMORY_LOG__ = [];
  }, seed);
};

const getChatInput = (page: Page) =>
  page
    .getByPlaceholder(/Tapez votre message/i)
    .or(page.locator('textarea.conversation-input'))
    .first();

const getSendButton = (page: Page) =>
  page.getByRole('button', { name: /Envoyer/i }).first();

const getUserContent = (page: Page) =>
  page.getByTestId('chat-message-user').getByTestId('chat-message-content').last();

const getAssistantContent = (page: Page) =>
  page.getByTestId('chat-message-assistant').getByTestId('chat-message-content').last();

const submitChatMessage = async (page: Page, message: string) => {
  const chatInput = getChatInput(page);
  await chatInput.fill(message);
  await chatInput.press('Enter');
};

const buildLongStructuredPrompt = () => {
  const paragraphs = Array.from(
    { length: 14 },
    (_, index) =>
      `Paragraphe ${index + 1}: la reponse doit rester atteignable jusqu au dernier bloc de verification.`
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

const buildUltraLongPlainPrompt = () => {
  const sections = Array.from({ length: 240 }, (_, index) => {
    const sectionNumber = String(index + 1).padStart(3, '0');
    return [
      `ULTRA-SECTION-${sectionNumber}`,
      'question ultra longue desktop',
      `SIGMA-${sectionNumber}`,
      `KAPPA-${sectionNumber}`,
      'verification integrale sans coupe',
    ].join(' ');
  });

  return ['ULTRA-START', ...sections, 'ULTRA-MIDDLE-SENTINEL', ...sections, 'ULTRA-END']
    .join('\n')
    .trim();
};

test.describe('Critical Path: Chat Interaction', () => {
  if (!FULL_E2E_ENABLED) {
    test('gate disabled proof (set TITANE_E2E_FULL=1)', async () => {
      expect(FULL_E2E_ENABLED).toBe(false);
    });
    return;
  }

  test.beforeEach(async ({ page }) => {
    await enableE2EChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);
  });

  test('NEW_CONVERSATION: message et réponse mock', async ({ page }) => {
    const chatInput = getChatInput(page);
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    await submitChatMessage(page, 'Bonjour TITANE');

    await expect(getUserContent(page)).toHaveText('Bonjour TITANE', {
      timeout: 15000,
    });
    await expect(page.getByText('[MOCK_OK] Bonjour TITANE')).toBeVisible({
      timeout: 15000,
    });
  });

  test('SEND_MESSAGE_ALWAYS_RESPOND: deux messages', async ({ page }) => {
    await submitChatMessage(page, 'Alpha');
    await expect(page.getByText('[MOCK_OK] Alpha')).toBeVisible({ timeout: 15000 });

    await submitChatMessage(page, 'Beta');
    await expect(page.getByText('[MOCK_OK] Beta')).toBeVisible({ timeout: 15000 });
  });

  test('MODERN_MODE_SELECTOR_BRIDGES_PAGE_RUNTIME_AND_STORE', async ({ page }) => {
    const pageConversation = page.getByTestId('page-conversation');

    await expect(pageConversation).toHaveAttribute('data-conversation-mode', 'default');
    await expect(page.getByTestId('select-conversation-mode')).toHaveCount(0);

    await page.getByTestId('chat-mode-selector-select').selectOption('planning');

    await expect(pageConversation).toHaveAttribute('data-conversation-mode', 'planning');

    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const raw = window.localStorage.getItem('titane_chat_mode_default');
          if (!raw) {
            return null;
          }

          try {
            const parsed = JSON.parse(raw) as { state?: { currentModeId?: string } };
            return parsed.state?.currentModeId ?? null;
          } catch {
            return 'invalid-json';
          }
        });
      })
      .toBe('planning');

    await submitChatMessage(page, 'Confirme le mode planning en une phrase.');
    await expect(page.getByText('[MOCK_OK] Confirme le mode planning en une phrase.')).toBeVisible({
      timeout: 15000,
    });
    await expect(pageConversation).toHaveAttribute('data-chat-store-mode', 'planning');
    await expect(page.getByTestId('chat-runtime-state')).toHaveAttribute(
      'data-conversation-mode',
      'planning'
    );
    await expect(page.getByTestId('chat-runtime-state')).toHaveAttribute(
      'data-chat-store-mode',
      'planning'
    );
    await expect(page.getByTestId('chat-runtime-summary')).toContainText(
      'Conversation mode: planning'
    );
    await expect(page.getByTestId('chat-runtime-summary')).toContainText('Store mode: planning');
  });

  test('LONG_RESPONSE_VISIBLE_COMPLETE: réponse longue mock affichée complètement', async ({
    page,
  }) => {
    const longPrompt = Array.from({ length: 40 }, (_, index) => `segment-${index + 1}`)
      .join(' ')
      .trim();

    await submitChatMessage(page, longPrompt);

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });
    await expect(assistantContent).toContainText('segment-1');
    await expect(assistantContent).toContainText('segment-20');
    await expect(assistantContent).toContainText('segment-40');
    await expect(
      assistantContent.getByText('segment-40', { exact: false })
    ).toBeVisible();
  });

  test('ASSISTANT_MARKDOWN_RENDERING: la surface canonique rend le markdown assistant sans marqueurs bruts', async ({
    page,
  }) => {
    await submitChatMessage(page, 'Plan **Alpha**\n\n- Beta\n- Gamma');

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });
    await expect(assistantContent.locator('strong')).toHaveText('Alpha');
    await expect(assistantContent.locator('ul li')).toHaveCount(2);
    await expect(assistantContent).not.toContainText('**Alpha**');
  });

  test('ASSISTANT_MARKDOWN_TABLES_AND_QUOTES: la surface canonique rend citations markdown et tableaux', async ({
    page,
  }) => {
    await submitChatMessage(
      page,
      'Synthèse\n\n> Citation importante\n\n| Colonne | Valeur |\n| --- | --- |\n| Alpha | 42 |'
    );

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });
    await expect(assistantContent.locator('blockquote')).toContainText(
      'Citation importante'
    );
    await expect(assistantContent.locator('table thead th')).toHaveCount(2);
    await expect(assistantContent.locator('table tbody td').first()).toHaveText('Alpha');
    await expect(assistantContent).not.toContainText('| --- | --- |');
  });

  test('ASSISTANT_LONG_RESPONSE_TERMINAL_BLOCK_REACHABLE', async ({ page }) => {
    const scrollRegion = page.getByTestId('chat-messages-scroll-region');

    await submitChatMessage(page, buildLongStructuredPrompt());

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('Rapport complet', { timeout: 15000 });
    await expect(assistantContent.locator('table')).toBeVisible();
    await expect(assistantContent.locator('pre code')).toContainText('SIGMA-CODE');

    const overflow = await scrollRegion.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));

    expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);

    await scrollRegion.evaluate(element => {
      element.scrollTop = element.scrollHeight;
    });
    await page.waitForTimeout(120);

    const terminalMarker = assistantContent
      .getByText('OMEGA-FINAL-BLOCK', {
        exact: true,
      })
      .last();
    await terminalMarker.scrollIntoViewIfNeeded();
    await expect(terminalMarker).toBeVisible();
    await expect(terminalMarker).toBeInViewport();
    await expect(assistantContent).toContainText('Bloc terminal');

    const scrollState = await scrollRegion.evaluate(element => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    }));

    expect(scrollState.scrollHeight).toBeGreaterThan(scrollState.clientHeight);
    expect(scrollState.scrollTop).toBeGreaterThan(0);
  });

  test('ULTRA_LONG_QUESTION_AND_RESPONSE_RENDER_COMPLETE_WITHOUT_TRUNCATION', async ({
    page,
  }) => {
    const ultraLongPrompt = buildUltraLongPlainPrompt();
    const expectedAssistantText = `[MOCK_OK] ${ultraLongPrompt}`;

    let truncationAlertCount = 0;
    await page.exposeFunction('onTitaneMessageTruncated', () => {
      truncationAlertCount += 1;
    });
    await page.evaluate(() => {
      window.addEventListener('titane-message-truncated', () => {
        // @ts-expect-error Playwright injecte ce helper sur window pour le comptage.
        window.onTitaneMessageTruncated();
      });
    });

    await submitChatMessage(page, ultraLongPrompt);

    const userContent = getUserContent(page);
    await expect(userContent).toContainText('ULTRA-START', { timeout: 15000 });
    await expect(userContent).toContainText('ULTRA-MIDDLE-SENTINEL');
    await expect(userContent).toContainText('ULTRA-END');

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });
    await expect(assistantContent).toContainText('ULTRA-START');
    await expect(assistantContent).toContainText('ULTRA-MIDDLE-SENTINEL');
    await expect(assistantContent).toContainText('ULTRA-END');

    const userText = await userContent.evaluate(element => element.textContent ?? '');
    const assistantText = await assistantContent.evaluate(
      element => element.textContent ?? ''
    );

    expect(userText.trim()).toBe(ultraLongPrompt);
    expect(assistantText.trim()).toBe(expectedAssistantText);
    expect(assistantText.length).toBe(expectedAssistantText.length);
    expect(assistantText.trim().endsWith('ULTRA-END')).toBe(true);
    expect(truncationAlertCount).toBe(0);
  });

  test('SWITCH_CONVERSATION_PERSISTS: UI reste en SPA', async ({ page }) => {
    const initialUrl = page.url();

    await submitChatMessage(page, 'Statut URL');
    await expect(page.getByText('[MOCK_OK] Statut URL')).toBeVisible({
      timeout: 15000,
    });

    expect(page.url()).toBe(initialUrl);
  });

  test('RATE_LIMIT_RUNTIME_TRUTH: le panneau runtime expose le blocage de quota GitHub', async ({
    page,
  }) => {
    await setE2EChatScenario(page, 'rate_limit');

    await submitChatMessage(page, 'Lance une exploration GitHub');

    const runtimePanel = page.getByTestId('chat-runtime-state');
    await expect(runtimePanel).toBeVisible({ timeout: 15000 });
    await expect(runtimePanel).toHaveAttribute('data-provider-reason', 'RATE_LIMIT');
    await expect(runtimePanel).toHaveAttribute('data-provider-mode', 'OFFLINE');
    await expect(runtimePanel).toHaveAttribute('data-network-used', 'true');

    await expect(page.getByTestId('chat-runtime-summary')).toContainText(
      'Reason: RATE_LIMIT'
    );
    await expect(page.getByTestId('chat-runtime-summary')).toContainText(
      'Provider: github-copilot'
    );
    await expect(
      runtimePanel.getByTestId('chat-runtime-badge').getByText('RATE_LIMIT', {
        exact: true,
      })
    ).toBeVisible({ timeout: 15000 });
    await expect(getAssistantContent(page)).not.toContainText('[MOCK_OK]');
  });

  test('KNOWLEDGE_MEMORY_RUNTIME_TRUTH: la lane mock expose la connaissance seedee et le rappel memoire', async ({
    page,
  }) => {
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

    const firstAssistantContent = getAssistantContent(page);
    await expect(firstAssistantContent).toContainText(
      'Active la connaissance runtime One Door',
      {
        timeout: 15000,
      }
    );
    await expect(firstAssistantContent).toContainText('One Door Governance', {
      timeout: 15000,
    });

    const firstMemoryLog = await page.evaluate(() => {
      return (
        (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] })
          .__TITANE_E2E_CHAT_MEMORY_LOG__ || []
      );
    });

    expect(firstMemoryLog).toHaveLength(1);
    expect(firstMemoryLog[0]).toEqual(
      expect.objectContaining({
        userMessage: 'Active la connaissance runtime One Door',
        knowledgeTitles: ['One Door Governance'],
      })
    );

    await submitChatMessage(page, 'Rappelle le dernier échange mémoire');

    const secondAssistantContent = getAssistantContent(page);
    await expect(secondAssistantContent).toContainText(
      'Active la connaissance runtime One Door',
      {
        timeout: 15000,
      }
    );

    const finalMemoryLog = await page.evaluate(() => {
      return (
        (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] })
          .__TITANE_E2E_CHAT_MEMORY_LOG__ || []
      );
    });

    expect(finalMemoryLog).toHaveLength(2);
  });

  test('CHAT_XP_GENERATION_SYNC: le chat genere des XP visibles sur la page Experience', async ({
    page,
  }) => {
    const xpPrompt =
      'Peux-tu analyser ce module TypeScript, expliquer les risques et proposer un plan de correction detaille ?';

    await submitChatMessage(page, xpPrompt);

    const assistantContent = getAssistantContent(page);
    await expect(assistantContent).toContainText('[MOCK_OK]', { timeout: 15000 });

    const reasoningProgress = page.getByTestId('reasoning-progress');
    await expect(reasoningProgress).toHaveAttribute('data-runtime-xp-gain', /[1-9]\d*/);
    await reasoningProgress.click();
    await expect(page.getByTestId('reasoning-summary-xp')).toContainText('XP gagné');
    await page.getByText('Détaillé').click();
    await expect(page.getByTestId('reasoning-runtime-xp')).toContainText('Chat');
    await expect(page.getByTestId('reasoning-runtime-xp')).toContainText('Cognitif');
    await expect(page.getByTestId('reasoning-runtime-xp-total')).toContainText(
      /^\+\d+ XP$/
    );

    await page.goto('/experience');
    await expect(page.getByTestId('page-experience')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('experience-total-xp')).not.toHaveText(/^0$/);
    await expect(page.getByTestId('experience-chat-sync-summary')).toBeVisible();
    await expect(page.getByTestId('experience-chat-xp-total')).not.toHaveText(/^\+0 XP$/);
    await expect(page.getByTestId('experience-filter-chat_message')).toBeVisible();
    await expect(page.getByTestId('experience-filter-chat_quality_bonus')).toBeVisible();
    await expect(
      page.getByTestId('experience-filter-chat_titane_response')
    ).toBeVisible();

    await page.getByTestId('experience-filter-chat_message').click();
    await expect(page.getByTestId('experience-history-item').first()).toContainText(
      'Message chat'
    );

    const persistedExperienceState = await page.evaluate(() => {
      const raw = localStorage.getItem('titane_experience');
      return raw ? JSON.parse(raw) : null;
    });
    expect(persistedExperienceState?.totalXp).toBeGreaterThan(0);
    expect(persistedExperienceState?.domains?.chat?.xp).toBeGreaterThan(0);

    await page.reload();
    await expect(page.getByTestId('page-experience')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('experience-total-xp')).not.toHaveText(/^0$/);
    await expect(page.getByTestId('experience-chat-xp-total')).not.toHaveText(/^\+0 XP$/);
  });

  test('INLINE_WEB_RESEARCH_CITATIONS_TRUTH: la conversation rend les citations inline du handoff web', async ({
    page,
  }) => {
    await enableInlineWebResearchMock(page, [
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait gouverné A',
        accessed_at: '2026-04-18T10:00:00Z',
        locator_text: 'p=2, c≈40',
      },
      {
        url: 'https://example.com/source-b',
        title: 'Source B',
        excerpt: 'Extrait gouverné B',
        accessed_at: '2026-04-18T10:02:00Z',
        locator: '§4',
      },
    ]);

    await submitChatMessage(page, 'Fais une recherche web en ligne sur TITANE');

    const citationsContainer = page.locator('[data-testid^="message-citations-"]').last();
    await expect(citationsContainer).toBeVisible({ timeout: 15000 });
    await expect(citationsContainer).toContainText('Sources en ligne');
    await expect(citationsContainer.getByText('Source A')).toBeVisible();
    await expect(citationsContainer.getByText('Extrait gouverné A')).toBeVisible();
    await expect(citationsContainer.getByText('p=2, c≈40')).toBeVisible();
    await expect(
      citationsContainer.getByText('accessed: 2026-04-18T10:00:00Z')
    ).toBeVisible();
    await expect(citationsContainer.getByText('Source B')).toBeVisible();
  });
});

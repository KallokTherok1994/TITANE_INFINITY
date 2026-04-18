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
    (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ =
      [];
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
    (window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }).__TITANE_E2E_WEB_RESEARCH_MOCK__ =
      false;
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
    (window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }).__TITANE_E2E_WEB_RESEARCH_MOCK__ =
      true;
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

const setE2EChatKnowledgeSeed = async (
  page: Page,
  seed: E2EChatKnowledgeSeedEntry[]
) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = value;
    (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ =
      [];
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
        content: 'All network access must flow through UI -> IPC -> services -> gateway -> external.',
        relevance: 0.96,
        tags: ['architecture', 'network'],
      },
    ]);

    await submitChatMessage(page, 'Active la connaissance runtime One Door');

    await expect(page.getByText(/\[MOCK_OK\].*Active la connaissance runtime One Door/s)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/\[MOCK_KNOWLEDGE\].*One Door Governance/s)).toBeVisible({
      timeout: 15000,
    });

    const firstMemoryLog = await page.evaluate(() => {
      return (
        (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ ||
        []
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

    await expect(
      page.getByText(/\[MOCK_MEMORY\].*Active la connaissance runtime One Door/s)
    ).toBeVisible({ timeout: 15000 });

    const finalMemoryLog = await page.evaluate(() => {
      return (
        (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ ||
        []
      );
    });

    expect(finalMemoryLog).toHaveLength(2);
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
    await expect(citationsContainer.getByText('accessed: 2026-04-18T10:00:00Z')).toBeVisible();
    await expect(citationsContainer.getByText('Source B')).toBeVisible();
  });
});

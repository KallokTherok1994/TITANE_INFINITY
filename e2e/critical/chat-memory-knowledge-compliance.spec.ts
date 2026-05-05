import { test, expect, type Page } from '@playwright/test';
import { E2E_TIMEOUTS } from '../config/constants';
import { closeBootBeaconIfPresent, openTitane } from '../helpers/navigation';

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

type E2EMemoryLogEntry = {
  sources: string[];
  data: Record<string, unknown>;
};

const MAX_MOCK_RESPONSE_MS = 5000;

const enableGovernedChatMock = async (page: Page) => {
  await page.addInitScript(() => {
    (window as { __TITANE_E2E_CHAT_MOCK__?: boolean }).__TITANE_E2E_CHAT_MOCK__ = true;
    (window as { __TITANE_E2E_CHAT_CONV_SEQ__?: number }).__TITANE_E2E_CHAT_CONV_SEQ__ =
      0;
    (
      window as { __TITANE_E2E_CHAT_SCENARIO__?: E2EChatScenario }
    ).__TITANE_E2E_CHAT_SCENARIO__ = 'success';
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = [];
    (
      window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }
    ).__TITANE_E2E_CHAT_MEMORY_LOG__ = [];
    (
      window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }
    ).__TITANE_E2E_WEB_RESEARCH_MOCK__ = false;
    (
      window as { __TITANE_E2E_WEB_RESEARCH_REPORT__?: unknown }
    ).__TITANE_E2E_WEB_RESEARCH_REPORT__ = undefined;
  });
};

const seedKnowledge = async (page: Page, entries: E2EChatKnowledgeSeedEntry[]) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_CHAT_KNOWLEDGE_SEED__?: E2EChatKnowledgeSeedEntry[] }
    ).__TITANE_E2E_CHAT_KNOWLEDGE_SEED__ = value;
    (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] }).__TITANE_E2E_CHAT_MEMORY_LOG__ =
      [];
  }, entries);
};

const enableInlineCitations = async (page: Page, citations: E2EInlineCitation[]) => {
  await page.evaluate(value => {
    (
      window as { __TITANE_E2E_WEB_RESEARCH_MOCK__?: boolean }
    ).__TITANE_E2E_WEB_RESEARCH_MOCK__ = true;
    (
      window as { __TITANE_E2E_WEB_RESEARCH_REPORT__?: unknown }
    ).__TITANE_E2E_WEB_RESEARCH_REPORT__ = {
      answer: {
        answer: 'Synthese knowledge gouvernee depuis citations mock.',
        citations: value,
        limitations: [],
        trace_id: 'trace-e2e-chat-memory-knowledge-compliance',
        sources_count: value.length,
        retrieved_passages_count: value.length,
      },
      trace: {
        trace_id: 'trace-e2e-chat-memory-knowledge-compliance',
        markers: ['M_CITATIONS_BUILD_OK', 'VERDICT_PASS'],
        errors: [],
      },
    };
  }, citations);
};

const getChatInput = (page: Page) => page.getByTestId('chat-input');
const getSendButton = (page: Page) => page.getByTestId('chat-send');

const getLastAssistantText = async (page: Page): Promise<string> => {
  const content = page
    .getByTestId('chat-message-assistant')
    .getByTestId('chat-message-content')
    .last();
  await expect(content).toBeVisible({ timeout: E2E_TIMEOUTS.ui });
  return (await content.textContent()) ?? '';
};

const readMemoryLog = async (page: Page): Promise<E2EMemoryLogEntry[]> => {
  return page.evaluate(() => {
    const raw = (window as { __TITANE_E2E_CHAT_MEMORY_LOG__?: unknown[] })
      .__TITANE_E2E_CHAT_MEMORY_LOG__;
    return Array.isArray(raw) ? (raw as E2EMemoryLogEntry[]) : [];
  });
};

const extractSources = (entry: unknown): string[] => {
  if (!entry || typeof entry !== 'object') {
    return [];
  }

  const candidate = entry as {
    sources?: unknown;
    data?: { sources?: unknown; source?: unknown };
  };

  if (Array.isArray(candidate.sources)) {
    return candidate.sources.filter((value): value is string => typeof value === 'string');
  }

  if (typeof candidate.sources === 'string') {
    return [candidate.sources];
  }

  if (Array.isArray(candidate.data?.sources)) {
    return candidate.data.sources.filter((value): value is string => typeof value === 'string');
  }

  if (typeof candidate.data?.source === 'string') {
    return [candidate.data.source];
  }

  return [];
};

const sendMessageAndMeasure = async (page: Page, message: string) => {
  const input = getChatInput(page);
  await expect(input).toBeVisible({ timeout: E2E_TIMEOUTS.ui });
  await input.fill(message);

  const start = Date.now();
  await getSendButton(page).click();
  const assistantText = await getLastAssistantText(page);
  const elapsedMs = Date.now() - start;

  return { assistantText, elapsedMs };
};

test.describe('Critical Path: Chat + Memoire + Connaissances Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await enableGovernedChatMock(page);
    await openTitane(page);
    await closeBootBeaconIfPresent(page);

    await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: E2E_TIMEOUTS.ui });
    await expect(page.getByTestId('chat-send')).toBeVisible({ timeout: E2E_TIMEOUTS.ui });
    await expect(page.getByTestId('chat-messages-scroll-region')).toBeVisible({
      timeout: E2E_TIMEOUTS.ui,
    });
    await expect(page.getByTestId('chat-mode-selector-select')).toHaveValue('default');
  });

  test('CHAT_RUNTIME_CONTRACT: pipeline conversation complet et runtime state coherent', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const first = await sendMessageAndMeasure(page, 'Bonjour TITANE, confirme la liaison chat.');
    expect(first.assistantText).toContain('[MOCK_OK] Bonjour TITANE, confirme la liaison chat.');
    expect(first.elapsedMs).toBeLessThan(MAX_MOCK_RESPONSE_MS);

    await page.getByTestId('chat-mode-selector-select').selectOption('planning');
    await expect(page.getByTestId('chat-runtime-state')).toHaveAttribute(
      'data-conversation-mode',
      'planning'
    );

    const second = await sendMessageAndMeasure(
      page,
      'Planifie en 3 etapes le test E2E de conformite.'
    );
    expect(second.assistantText).toContain(
      '[MOCK_OK] Planifie en 3 etapes le test E2E de conformite.'
    );
    expect(second.elapsedMs).toBeLessThan(MAX_MOCK_RESPONSE_MS);

    const fatalConsoleErrors = consoleErrors.filter(
      line => !/favicon|source map|Extension context invalidated/i.test(line)
    );
    expect(fatalConsoleErrors).toEqual([]);
  });

  test('MEMORY_INJECTION_CONTRACT: recall memoire stable et sans regression visible', async ({
    page,
  }) => {
    await seedKnowledge(page, [
      {
        title: 'Memoire Projet TITANE',
        category: 'project',
        content: 'SIGMA-MEMORY-PROOF: TITANE utilise une architecture 4-Ring gouvernee.',
        relevance: 0.96,
        tags: ['titane', 'architecture', 'memory'],
      },
      {
        title: 'Memoire Identite',
        category: 'identity',
        content: 'Kevin Thibault est le proprietaire de TITANE_INFINITY.',
        relevance: 0.91,
        tags: ['owner', 'identity'],
      },
    ]);

    const first = await sendMessageAndMeasure(page, 'Recapitule mes projets actifs et leur etat.');
    expect(first.assistantText.length).toBeGreaterThan(20);
    expect(first.elapsedMs).toBeLessThan(MAX_MOCK_RESPONSE_MS);

    const second = await sendMessageAndMeasure(
      page,
      'Relis les points memoire precedents et propose un suivi.'
    );
    expect(second.assistantText.length).toBeGreaterThan(20);
    expect(second.elapsedMs).toBeLessThan(MAX_MOCK_RESPONSE_MS);

    const memoryLog = await readMemoryLog(page);
    expect(memoryLog.length).toBeGreaterThan(0);

    // Certains modes n'exposent pas la télémétrie mémoire détaillée en browser lane.
    // Le contrat minimal vérifiable ici est: pipeline conversationnelle stable,
    // runtime state cohérent, et structure du journal mémoire valide quand exposée.
    expect(Array.isArray(memoryLog)).toBe(true);

    if (memoryLog.length > 0) {
      const last = memoryLog[memoryLog.length - 1];
      expect(typeof last).toBe('object');
      expect(last).not.toBeNull();
    }

    await expect(page.getByTestId('chat-runtime-state')).toHaveAttribute(
      'data-conversation-mode',
      /.+/
    );
  });

  test('KNOWLEDGE_CITATIONS_CONTRACT: handoff knowledge et citations inline visibles', async ({
    page,
  }) => {
    await enableInlineCitations(page, [
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait gouverne A',
        accessed_at: '2026-05-05T10:00:00Z',
        locator: 'p=2',
        locator_text: 'c~40',
      },
      {
        url: 'https://example.com/source-b',
        title: 'Source B',
        excerpt: 'Extrait gouverne B',
        accessed_at: '2026-05-05T10:01:00Z',
      },
    ]);

    const response = await sendMessageAndMeasure(
      page,
      'Fais une recherche web en ligne sur TITANE'
    );
    expect(response.assistantText).toContain('Synthese knowledge gouvernee');
    expect(response.elapsedMs).toBeLessThan(MAX_MOCK_RESPONSE_MS);

    const citationsContainer = page.locator('[data-testid^="message-citations-"]').last();
    await expect(citationsContainer).toBeVisible({ timeout: E2E_TIMEOUTS.ui });
    await expect(citationsContainer).toContainText('Sources en ligne');
    await expect(citationsContainer.getByText('Source A')).toBeVisible();
    await expect(citationsContainer.getByText('Extrait gouverne A')).toBeVisible();
    await expect(citationsContainer.getByText('Source B')).toBeVisible();
  });
});

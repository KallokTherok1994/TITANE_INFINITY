import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemorySection } from '@/components/sections/MemorySection';

const mockUsePersistentMemory = vi.fn();
const mockUseLTMContext = vi.fn();
const mockGetKnowledge = vi.fn();
const mockClearMemoryCache = vi.fn();
const mockGetAllEntries = vi.fn();
const mockKnowledgeVaultGetState = vi.fn();
const mockKnowledgeVaultInitialize = vi.fn();
const mockKnowledgeVaultSubscribe = vi.fn(() => () => {});

vi.mock('@/hooks/usePersistentMemory', () => ({
  usePersistentMemory: (options: unknown) => mockUsePersistentMemory(options),
}));

vi.mock('@/hooks/useLTMContext', () => ({
  useLTMContext: (conversationId: unknown) => mockUseLTMContext(conversationId),
}));

vi.mock('@/services/api/memory', () => ({
  memoryService: {
    getKnowledge: (...args: unknown[]) => mockGetKnowledge(...args),
    clearCache: () => mockClearMemoryCache(),
  },
}));

vi.mock('@/services/api/defaultKnowledgeBase', () => ({
  getAllEntries: (...args: unknown[]) => mockGetAllEntries(...args),
}));

vi.mock('@/cognitive/knowledge/knowledgeVault', () => ({
  knowledgeVault: {
    getState: () => mockKnowledgeVaultGetState(),
    initialize: (...args: unknown[]) => mockKnowledgeVaultInitialize(...args),
    subscribe: (...args: unknown[]) => mockKnowledgeVaultSubscribe(...args),
  },
}));

vi.mock('@/components/chat/MemoryDashboard', () => ({
  MemoryDashboard: ({
    modeId,
    onEntrySelect,
    selectedEntryId,
  }: {
    modeId: string;
    onEntrySelect?: (entry: {
      id: string;
      content: string;
      level: 'long_term';
      topic: string;
      importance: number;
      metadata: { createdAt: number; accessCount: number };
    }) => void;
    selectedEntryId?: string | null;
  }) => (
    <div data-testid="memory-dashboard">
      dashboard:{modeId}:selected:{selectedEntryId ?? 'none'}
      <button
        data-testid="memory-dashboard-select"
        onClick={() =>
          onEntrySelect?.({
            id: 'ltm-1',
            content: 'Souvenir persistant',
            level: 'long_term',
            topic: 'preferences',
            importance: 5,
            metadata: { createdAt: 100, accessCount: 2 },
          })
        }
      >
        select
      </button>
    </div>
  ),
}));

vi.mock('@/features/memory/MemoryTreeViewer', () => ({
  MemoryTreeViewer: ({
    data,
    isLoading,
  }: {
    data?: { name?: string };
    isLoading?: boolean;
  }) => (
    <div data-testid="memory-tree-viewer">
      {isLoading ? 'loading-tree' : (data?.name ?? 'no-tree')}
    </div>
  ),
}));

vi.mock('@/features/memory/MemorySearchPanel', () => ({
  MemorySearchPanel: ({
    entries,
    selectedEntryId,
    isLoading,
  }: {
    entries?: Array<{ id: string }>;
    selectedEntryId?: string | null;
    isLoading?: boolean;
  }) => (
    <div data-testid="memory-search-panel">
      entries:{entries?.length ?? 0}:selected:{selectedEntryId ?? 'none'}:loading:
      {isLoading ? 'yes' : 'no'}
    </div>
  ),
}));

vi.mock('@components/layout', () => ({
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/ui', () => ({
  Card: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => <div style={style}>{children}</div>,
}));

vi.mock('@/design-system', () => ({
  TMetric: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  TSectionHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@themes/tokens', () => ({
  colors: { neutral: { 400: '#999', 500: '#666' } },
  spacing: { 2: '0.5rem', 4: '1rem', 6: '1.5rem' },
  fontSizes: { sm: '0.875rem', xs: '0.75rem' },
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
  }),
}));

describe('MemorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClearMemoryCache.mockReset();

    mockGetKnowledge.mockResolvedValue([]);
    mockGetAllEntries.mockResolvedValue([]);

    mockUseLTMContext.mockReturnValue({
      historyCount: 4,
    });

    mockKnowledgeVaultGetState.mockReturnValue({
      totalDocuments: 0,
      totalSizeBytes: 0,
      categoryCounts: {
        'code-rust': 0,
        'code-typescript': 0,
        'code-react': 0,
        'code-tauri': 0,
        'code-python': 0,
        'code-other': 0,
        document: 0,
        config: 0,
        data: 0,
        notes: 0,
        snippet: 0,
        unknown: 0,
      },
      lastIngestion: null,
      indexVersion: '1.0.0',
      entries: [],
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [
        {
          id: 'ltm-1',
          level: 'long_term',
          contentType: 'preference',
          title: 'Préférence durable',
          summary: 'Souvenir persistant',
          content: 'Souvenir persistant',
          topic: 'preferences',
          importance: 5,
          tags: ['memoire'],
          status: 'active',
          sourceEntryIds: [],
          confidenceScore: 100,
          userVerified: true,
          editable: true,
          version: 1,
          versionHistory: [],
          metadata: {
            createdAt: 100,
            updatedAt: 100,
            accessCount: 2,
            source: 'system',
            schemaVersion: '1.0.0',
          },
        },
      ],
      summaries: [],
      bundles: [],
      stats: {
        countByLevel: {
          session: 2,
          intermediate: 3,
          long_term: 7,
        },
        summaryCount: 1,
        bundleCount: 1,
      },
      isLoading: false,
      lastUpdate: 123,
      refresh: vi.fn(),
    });
  });

  it('uses admin memory scope and keeps long-term count separate from conversation history', async () => {
    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-1"
      />
    );

    expect(screen.getByTestId('memory-section-root')).toHaveAttribute(
      'data-memory-section-mode',
      'admin'
    );
    expect(mockUsePersistentMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        modeId: 'admin',
        enableCache: true,
      })
    );

    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(
      await screen.findByText(/historique conversationnel, distinct de la ltm/i)
    ).toBeInTheDocument();
    expect(await screen.findByTestId('memory-dashboard')).toHaveTextContent(
      'dashboard:admin:selected:none'
    );
    expect(await screen.findByTestId('memory-tree-viewer')).toHaveTextContent(
      'Memoire TITANE'
    );
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:1'
    );
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'selected:none'
    );
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'loading:no'
    );
  });

  it('passes an honest empty array to semantic search when persistent memory is empty', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 456,
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-empty"
      />
    );

    expect(
      await screen.findByText(/aucune mémoire persistante consolidée/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        /les cartes, l'arbre et la recherche restent donc volontairement vides/i
      )
    ).toBeInTheDocument();
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:0'
    );
  });

  it('surfaces knowledge-base content inside the memory page even when persistent entries are still empty', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 789,
    });

    mockGetKnowledge.mockResolvedValue([
      {
        id: 'kb-runtime-1',
        title: 'Architecture TITANE',
        category: 'system',
        content: 'Le noyau TITANE orchestre la mémoire et les connaissances.',
        relevance: 0.9,
        lastAccessed: '2026-04-08T00:00:00.000Z',
        tags: ['architecture', 'memoire'],
      },
    ]);
    mockGetAllEntries.mockResolvedValue([
      {
        id: 'default-kb-1',
        category: 'identity_profile',
        version: '30.0.0',
        description: 'Profil identitaire système',
        content: {
          summary: 'Identité persistante TITANE∞',
        },
      },
    ]);

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-kb"
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/aucune mémoire persistante consolidée/i)
      ).not.toBeInTheDocument();
    });

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:2'
    );
  });

  it('shows a visible degradation warning when knowledge sources are unavailable', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 999,
    });

    mockGetKnowledge.mockRejectedValue(new Error('runtime kb offline'));
    mockGetAllEntries.mockRejectedValue(new Error('default kb offline'));

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-kb-warning"
      />
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /certaines sources de connaissance sont temporairement indisponibles/i
    );
  });

  it('self-heals transient contextual index failure without showing degraded warning', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 999,
    });

    mockGetKnowledge
      .mockRejectedValueOnce(new Error('context index warming up'))
      .mockResolvedValueOnce([
        {
          title: 'Index recovered',
          content: 'Recovered contextual entry',
          tags: ['recovered'],
          relevance: 0.9,
        },
      ]);
    mockGetAllEntries.mockResolvedValue([
      {
        id: 'default-kb-1',
        category: 'system_architecture',
        version: 'v30.0.0',
        description: 'Base système disponible',
        content: { note: 'default knowledge entry' },
      },
    ]);

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-kb-self-heal"
      />
    );

    await waitFor(() => {
      expect(mockGetKnowledge).toHaveBeenCalledTimes(2);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a bootstrap loading state instead of an empty-memory verdict during the first persistent sync', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: null,
      isLoading: true,
      lastUpdate: null,
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-loading"
      />
    );

    expect(screen.getByTestId('memory-section-root')).toHaveAttribute(
      'data-memory-surface-state',
      'loading'
    );
    expect(screen.getByText(/chargement de la mémoire persistante/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/aucune mémoire persistante consolidée/i)
    ).not.toBeInTheDocument();
    expect(await screen.findByTestId('memory-tree-viewer')).toHaveTextContent(
      'loading-tree'
    );
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:0:selected:none:loading:yes'
    );
  });

  it('deduplicates overlapping knowledge coming from runtime and default sources', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 333,
    });

    mockGetKnowledge.mockResolvedValue([
      {
        id: 'kb-runtime-dup',
        title: 'Architecture TITANE',
        category: 'system_architecture',
        content: 'TITANE orchestre la mémoire via 4 rings et One Door.',
        relevance: 0.97,
        lastAccessed: '2026-04-09T07:00:00.000Z',
        tags: ['architecture', 'memory'],
      },
    ]);
    mockGetAllEntries.mockResolvedValue([
      {
        id: 'system_architecture',
        category: 'system_architecture',
        version: '30.0.0',
        description: 'Architecture cœur TITANE∞',
        content: {
          summary: 'TITANE orchestre la mémoire via 4 rings et One Door.',
        },
      },
    ]);

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-dedupe"
      />
    );

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:1'
    );
  });

  it('fuses semantic duplicates even when the runtime and default categories differ', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 334,
    });

    mockGetKnowledge.mockResolvedValue([
      {
        id: 'kb-runtime-semantic',
        title: 'Architecture TITANE',
        category: 'system',
        content: 'TITANE orchestre la mémoire via 4 rings et la gouvernance One Door.',
        relevance: 0.91,
        lastAccessed: '2026-04-09T07:10:00.000Z',
        tags: ['architecture', 'memoire'],
      },
    ]);
    mockGetAllEntries.mockResolvedValue([
      {
        id: 'system_architecture',
        category: 'system_architecture',
        version: '30.0.0',
        description: 'Architecture cœur TITANE∞',
        content: {
          summary: 'TITANE orchestre la mémoire via 4 rings et la gouvernance One Door.',
        },
      },
    ]);

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-semantic-dedupe"
      />
    );

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:1'
    );
  });

  it('surfaces knowledge-vault documents inside the memory page when available', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      summaries: [],
      bundles: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 335,
      refresh: vi.fn(),
    });

    mockGetKnowledge.mockResolvedValue([]);
    mockGetAllEntries.mockResolvedValue([]);
    mockKnowledgeVaultGetState.mockReturnValue({
      totalDocuments: 1,
      totalSizeBytes: 2048,
      categoryCounts: {
        'code-rust': 0,
        'code-typescript': 0,
        'code-react': 0,
        'code-tauri': 0,
        'code-python': 0,
        'code-other': 0,
        document: 1,
        config: 0,
        data: 0,
        notes: 0,
        snippet: 0,
        unknown: 0,
      },
      lastIngestion: 1775737312495,
      indexVersion: '1.0.0',
      entries: [
        {
          id: 'vault-doc-1',
          title: 'Guide Mémoire Interne',
          path: '/docs/guide-memoire.md',
          category: 'document',
          format: 'markdown',
          summary: 'Guide interne de mémoire',
          content: 'Guide interne de mémoire et base de connaissances TITANE.',
          metadata: {
            author: 'TITANE',
            createdAt: 1775737312000,
            modifiedAt: 1775737312000,
            sizeBytes: 2048,
            language: 'fr',
            keywords: ['memoire', 'knowledge'],
            lineCount: 12,
            wordCount: 42,
          },
          status: 'indexed',
          indexedAt: 1775737312495,
          lastAccessedAt: 1775737312495,
          accessCount: 3,
          relevanceScore: 0.88,
          tags: ['memoire', 'guide'],
        },
      ],
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-vault"
      />
    );

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:1'
    );
  });

  it('shows recently persisted chat memories so new chat knowledge is immediately visible', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [
        {
          id: 'chat-memory-1',
          level: 'session',
          contentType: 'message',
          title: 'Retiens ORION-482-LICHEN',
          summary: 'Code mémoire sauvegardé depuis le chat',
          content: 'Utilisateur: Retiens ORION-482-LICHEN pour la suite.',
          topic: 'general',
          importance: 4,
          tags: ['chat-interaction', 'default'],
          status: 'active',
          sourceEntryIds: [],
          confidenceScore: 100,
          userVerified: true,
          editable: true,
          version: 1,
          versionHistory: [],
          metadata: {
            createdAt: 1700000000000,
            updatedAt: 1700003600000,
            accessCount: 2,
            source: 'chat_user',
            schemaVersion: '1.0.0',
          },
        },
      ],
      summaries: [],
      bundles: [],
      stats: {
        countByLevel: {
          session: 1,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 336,
      refresh: vi.fn(),
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-chat-visibility"
      />
    );

    expect(
      await screen.findByText(/mémoires récentes issues du chat/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/retiens orion-482-lichen/i)).toBeInTheDocument();
  });

  it('includes summaries and bundles so the page exposes the full persistent memory surface', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      summaries: [
        {
          id: 'summary-weekly-1',
          title: 'Synthèse hebdomadaire',
          content: 'Résumé consolidé des apprentissages récents de TITANE.',
          topic: 'learning',
          periodStart: 1700000000000,
          periodEnd: 1700003600000,
          sourceCount: 3,
          sourceIds: ['entry-1', 'entry-2', 'entry-3'],
          keywords: ['synthese', 'learning'],
          aggregatedImportance: 4,
          generatedAt: 1700003600000,
          summaryType: 'weekly',
        },
      ],
      bundles: [
        {
          id: 'bundle-project-1',
          name: 'Bundle projet mémoire',
          description: 'Regroupe les éléments mémoire du projet actif.',
          topic: 'project',
          entryIds: ['entry-1', 'entry-2'],
          tags: ['bundle', 'project'],
          createdAt: 1700000000000,
          updatedAt: 1700007200000,
          createdBy: 'system',
          color: '#4f46e5',
          icon: '🧠',
        },
      ],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 1,
          long_term: 1,
        },
        summaryCount: 1,
        bundleCount: 1,
      },
      isLoading: false,
      lastUpdate: 336,
      refresh: vi.fn(),
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-full-surface"
      />
    );

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:2'
    );
    expect(await screen.findByText(/synthèse hebdomadaire/i)).toBeInTheDocument();
    expect(await screen.findByText(/bundle projet mémoire/i)).toBeInTheDocument();
  });

  it('refreshes the visible memory surface when the vault changes to stay synced live', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    const refreshSpy = vi.fn();
    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      summaries: [],
      bundles: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 337,
      refresh: refreshSpy,
    });

    let vaultState = {
      totalDocuments: 0,
      totalSizeBytes: 0,
      categoryCounts: {
        'code-rust': 0,
        'code-typescript': 0,
        'code-react': 0,
        'code-tauri': 0,
        'code-python': 0,
        'code-other': 0,
        document: 0,
        config: 0,
        data: 0,
        notes: 0,
        snippet: 0,
        unknown: 0,
      },
      lastIngestion: null,
      indexVersion: '1.0.0',
      entries: [] as Array<Record<string, unknown>>,
    };

    mockKnowledgeVaultGetState.mockImplementation(() => vaultState);

    let vaultListener: ((state: typeof vaultState) => void) | undefined;
    mockKnowledgeVaultSubscribe.mockImplementation(listener => {
      vaultListener = listener as typeof vaultListener;
      return () => {
        vaultListener = undefined;
      };
    });

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-live-sync"
      />
    );

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:0'
    );

    vaultState = {
      ...vaultState,
      totalDocuments: 1,
      lastIngestion: 1775737312495,
      entries: [
        {
          id: 'vault-live-1',
          title: 'Mémoire live',
          path: '/docs/live-memory.md',
          category: 'document',
          format: 'markdown',
          summary: 'Document synchronisé à chaud',
          content: 'Document synchronisé à chaud dans la mémoire TITANE.',
          metadata: {
            author: 'TITANE',
            createdAt: 1775737312000,
            modifiedAt: 1775737312000,
            sizeBytes: 512,
            language: 'fr',
            keywords: ['memoire', 'sync'],
            lineCount: 4,
            wordCount: 12,
          },
          status: 'indexed',
          indexedAt: 1775737312495,
          lastAccessedAt: 1775737312495,
          accessCount: 1,
          relevanceScore: 0.76,
          tags: ['live', 'memoire'],
        },
      ],
    };

    await waitFor(async () => {
      vaultListener?.(vaultState);
      expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
        'entries:1'
      );
    });
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('avoids overlapping knowledge-surface syncs while a previous refresh is still pending', async () => {
    mockUseLTMContext.mockReturnValue({
      historyCount: 0,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      summaries: [],
      bundles: [],
      stats: {
        countByLevel: {
          session: 0,
          intermediate: 0,
          long_term: 0,
        },
      },
      isLoading: false,
      lastUpdate: 338,
      refresh: vi.fn(),
    });

    let releaseKnowledge: ((value: []) => void) | null = null;
    mockGetKnowledge.mockImplementation(
      () =>
        new Promise(resolve => {
          releaseKnowledge = resolve as typeof releaseKnowledge;
        })
    );
    mockGetAllEntries.mockResolvedValue([]);

    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-no-overlap"
      />
    );

    await waitFor(() => {
      expect(mockGetKnowledge).toHaveBeenCalledTimes(1);
      expect(mockGetAllEntries).toHaveBeenCalledTimes(1);
    });

    fireEvent(window, new Event('focus'));
    fireEvent(document, new Event('visibilitychange'));

    expect(mockGetKnowledge).toHaveBeenCalledTimes(1);
    expect(mockGetAllEntries).toHaveBeenCalledTimes(1);

    releaseKnowledge?.([]);

    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:0'
    );
  });

  it('synchronizes dashboard selection into the shared memory detail pane', async () => {
    render(
      <MemorySection
        stats={{
          totalXP: 0,
          level: 1,
          memoryShortTerm: 0,
          memoryMidTerm: 0,
          memoryLongTerm: 0,
          evolutionScore: 0,
        }}
        conversationId="conv-sync"
      />
    );

    fireEvent.click(await screen.findByTestId('memory-dashboard-select'));

    expect(screen.getByText(/entrée mémoire sélectionnée/i)).toBeInTheDocument();
    expect(screen.getByText('Souvenir persistant')).toBeInTheDocument();
    expect(screen.getByText(/niveau: long_term/i)).toBeInTheDocument();
    expect(await screen.findByTestId('memory-dashboard')).toHaveTextContent(
      'dashboard:admin:selected:ltm-1'
    );
    expect(await screen.findByTestId('memory-search-panel')).toHaveTextContent(
      'entries:1:selected:ltm-1'
    );
  });
});

import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemorySection } from '@/components/sections/MemorySection';

const mockUsePersistentMemory = vi.fn();
const mockUseLTMContext = vi.fn();
const mockGetKnowledge = vi.fn();
const mockGetAllEntries = vi.fn();

vi.mock('@/hooks/usePersistentMemory', () => ({
  usePersistentMemory: (options: unknown) => mockUsePersistentMemory(options),
}));

vi.mock('@/hooks/useLTMContext', () => ({
  useLTMContext: (conversationId: unknown) => mockUseLTMContext(conversationId),
}));

vi.mock('@/services/api/memory', () => ({
  memoryService: {
    getKnowledge: (...args: unknown[]) => mockGetKnowledge(...args),
  },
}));

vi.mock('@/services/api/defaultKnowledgeBase', () => ({
  getAllEntries: (...args: unknown[]) => mockGetAllEntries(...args),
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

    mockGetKnowledge.mockResolvedValue([]);
    mockGetAllEntries.mockResolvedValue([]);

    mockUseLTMContext.mockReturnValue({
      historyCount: 4,
    });

    mockUsePersistentMemory.mockReturnValue({
      entries: [
        {
          id: 'ltm-1',
          level: 'long_term',
          content: 'Souvenir persistant',
          topic: 'preferences',
          importance: 5,
          tags: ['memoire'],
          metadata: {
            createdAt: 100,
            accessCount: 2,
          },
        },
      ],
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
      expect(screen.queryByText(/aucune mémoire persistante consolidée/i)).not.toBeInTheDocument();
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

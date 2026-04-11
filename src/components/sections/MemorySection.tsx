/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemorySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Memory architecture, tree visualization, semantic search
 */

import React, { useState, useCallback, memo, useMemo, useEffect, useRef } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { createLogger } from '@/utils/logger';
import { usePersistentMemory } from '@/hooks/usePersistentMemory';
import { useLTMContext } from '@/hooks/useLTMContext';
import { memoryService } from '@/services/api/memory';
import {
  getAllEntries as getDefaultKnowledgeBaseEntries,
  type KnowledgeBaseEntry,
} from '@/services/api/defaultKnowledgeBase';
import {
  knowledgeVault,
  type KnowledgeEntry as VaultKnowledgeEntry,
  type KnowledgeVaultState,
} from '@/cognitive/knowledge/knowledgeVault';
import {
  buildPersistentMemoryTree,
  findMemoryTreeNodeByEntryId,
  type MemoryTreeNodeData,
} from '@/features/memory/memoryTreeData';
import { dedupeMemoryEntries } from '@/features/memory/dedupeMemoryEntries';
import { MEMORY_TOPIC_LABELS } from '@/services/memory/persistentMemory.config';
import type {
  MemoryBundle,
  MemoryEntry,
  MemoryStats,
  MemorySummary,
  MemoryTopic,
} from '@/services/memory/persistentMemory.config';
import type { KnowledgeEntry as RuntimeKnowledgeEntry } from '@/services/memory/types';

const pageLogger = createLogger('MemorySection');
const MEMORY_SECTION_MODE = 'admin' as const;
const noopAsync = async () => undefined;

type MemorySectionTab = 'overview' | 'dashboard' | 'tree' | 'search';

const SECTION_TABS: { id: MemorySectionTab; label: string; icon: string }[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: '📊' },
  { id: 'dashboard', label: 'Dashboard', icon: '📚' },
  { id: 'tree', label: 'Arbre', icon: '🌳' },
  { id: 'search', label: 'Recherche', icon: '🔍' },
];

/** Maximum number of knowledge entries visible before "show all" */
const INITIAL_VISIBLE_KNOWLEDGE_COUNT = 24;
/** Maximum content preview length for knowledge cards */
const KNOWLEDGE_PREVIEW_LENGTH = 160;
/** Maximum number of tags shown per knowledge card */
const MAX_VISIBLE_TAGS = 3;
/** Maximum importance level (star scale) */
const MAX_IMPORTANCE = 5;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TitaneStats {
  totalXP: number;
  level: number;
  memoryShortTerm: number;
  memoryMidTerm: number;
  memoryLongTerm: number;
  evolutionScore: number;
}

interface MemorySectionProps {
  stats: TitaneStats;
  conversationId?: string;
}

type MemorySearchEntry = {
  id: string;
  content: string;
  type: 'short' | 'mid' | 'long';
  timestamp: number;
  tags?: string[];
  relevance?: number;
};

const EMPTY_COUNT_BY_LEVEL = {
  session: 0,
  intermediate: 0,
  long_term: 0,
} as const;

const EMPTY_SIZE_BY_LEVEL = {
  session: 0,
  intermediate: 0,
  long_term: 0,
} as const;

function flattenKnowledgeContent(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value.map(item => flattenKnowledgeContent(item)).join(' ');
  }
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>)
      .map(item => flattenKnowledgeContent(item))
      .join(' ');
  }
  return '';
}

function mapKnowledgeTopic(category?: string): MemoryTopic {
  const normalized = String(category ?? '').toLowerCase();
  if (normalized.includes('project')) return 'project';
  if (normalized.includes('decision')) return 'decisions';
  if (normalized.includes('pref')) return 'preferences';
  if (normalized.includes('system') || normalized.includes('identity')) return 'system';
  if (normalized.includes('tech') || normalized.includes('code')) return 'technical';
  return 'learning';
}

function mapRuntimeKnowledgeToMemoryEntry(entry: RuntimeKnowledgeEntry): MemoryEntry {
  const createdAt = Date.parse(entry.lastAccessed || '') || Date.now();

  return {
    id: `knowledge-runtime:${entry.id}`,
    level: 'long_term',
    contentType: 'knowledge',
    title: entry.title || entry.category,
    summary: entry.content.slice(0, 180),
    content: entry.content,
    topic: mapKnowledgeTopic(entry.category),
    importance: entry.relevance >= 0.85 ? 5 : entry.relevance >= 0.65 ? 4 : 3,
    tags: Array.from(
      new Set(['knowledge-base', entry.category, ...(entry.tags ?? [])])
    ).filter(Boolean),
    status: 'active',
    metadata: {
      createdAt,
      updatedAt: createdAt,
      lastAccessedAt: createdAt,
      accessCount: Math.max(1, Math.round(entry.relevance * 10)),
      source: 'system',
      schemaVersion: '1.0.0',
    },
    sourceEntryIds: entry.relatedEntries ?? [],
    confidenceScore: Math.round(entry.relevance * 100),
    userVerified: true,
    editable: false,
    version: 1,
    versionHistory: [],
  };
}

function mapDefaultKnowledgeToMemoryEntry(entry: KnowledgeBaseEntry): MemoryEntry {
  const content =
    flattenKnowledgeContent(entry.content) || entry.description || entry.category;
  const createdAt = Date.now();

  return {
    id: `knowledge-default:${entry.id}`,
    level: 'long_term',
    contentType: 'knowledge',
    title: entry.category,
    summary: entry.description,
    content,
    topic: mapKnowledgeTopic(entry.category),
    importance: 4,
    tags: ['default-kb', 'knowledge-base', entry.category, entry.version].filter(Boolean),
    status: 'active',
    metadata: {
      createdAt,
      updatedAt: createdAt,
      lastAccessedAt: createdAt,
      accessCount: 1,
      source: 'system',
      schemaVersion: '1.0.0',
    },
    sourceEntryIds: [],
    confidenceScore: 100,
    userVerified: true,
    editable: false,
    version: 1,
    versionHistory: [],
  };
}

function clampImportance(
  value: number | undefined,
  fallback: number = 3
): 1 | 2 | 3 | 4 | 5 {
  return Math.min(5, Math.max(1, Math.round(value ?? fallback))) as 1 | 2 | 3 | 4 | 5;
}

function mapPersistentSummaryToMemoryEntry(summary: MemorySummary): MemoryEntry {
  const createdAt =
    summary.generatedAt || summary.periodEnd || summary.periodStart || Date.now();
  const expiresAt =
    Math.max(summary.periodEnd || createdAt, createdAt) + 30 * 24 * 60 * 60 * 1000;

  return {
    id: `memory-summary:${summary.id}`,
    level: 'intermediate',
    contentType: 'summary',
    title: summary.title || `Résumé ${summary.summaryType}`,
    content: summary.content,
    originalContent: summary.content,
    topic: summary.topic,
    importance: clampImportance(summary.aggregatedImportance, 4),
    tags: Array.from(
      new Set(['memory-summary', summary.summaryType, ...(summary.keywords ?? [])])
    ).filter(Boolean),
    status: 'active',
    metadata: {
      createdAt,
      updatedAt: createdAt,
      lastAccessedAt: createdAt,
      accessCount: Math.max(1, summary.sourceCount || 0),
      source: 'auto_summary',
      modeId: summary.primaryMode,
      schemaVersion: '1.0.0',
    },
    sourceEntryIds: summary.sourceIds ?? [],
    relevanceScore: Math.min(1, Math.max(0.1, (summary.aggregatedImportance || 3) / 5)),
    expiresAt,
    promotable: true,
  };
}

function mapPersistentBundleToMemoryEntry(bundle: MemoryBundle): MemoryEntry {
  const createdAt = bundle.createdAt || Date.now();
  const updatedAt = bundle.updatedAt || createdAt;
  const content = [
    bundle.description,
    bundle.entryIds.length > 0
      ? `Ce bundle regroupe ${bundle.entryIds.length} entrée${bundle.entryIds.length > 1 ? 's' : ''} de mémoire.`
      : 'Bundle mémoire prêt à recevoir des entrées.',
    bundle.tags.length > 0 ? `Tags: ${bundle.tags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    id: `memory-bundle:${bundle.id}`,
    level: 'long_term',
    contentType: 'project_context',
    title: bundle.name,
    summary:
      bundle.description ||
      `${bundle.entryIds.length} entrée${bundle.entryIds.length > 1 ? 's' : ''} regroupée${bundle.entryIds.length > 1 ? 's' : ''}`,
    content: content || bundle.name,
    topic: bundle.topic,
    importance: clampImportance(
      bundle.entryIds.length >= 8 ? 5 : bundle.entryIds.length >= 4 ? 4 : 3,
      3
    ),
    tags: Array.from(new Set(['memory-bundle', ...(bundle.tags ?? [])])).filter(Boolean),
    status: 'active',
    metadata: {
      createdAt,
      updatedAt,
      lastAccessedAt: updatedAt,
      accessCount: Math.max(1, bundle.entryIds.length || 0),
      source: bundle.createdBy === 'user' ? 'manual_save' : 'system',
      schemaVersion: '1.0.0',
    },
    sourceEntryIds: bundle.entryIds ?? [],
    confidenceScore: 100,
    userVerified: bundle.createdBy === 'user',
    editable: bundle.createdBy === 'user',
    version: 1,
    versionHistory: [],
  };
}

function mapVaultKnowledgeToMemoryEntry(entry: VaultKnowledgeEntry): MemoryEntry {
  const createdAt = entry.indexedAt || entry.metadata.createdAt || Date.now();
  const content = entry.content || entry.summary || entry.title || entry.path;

  return {
    id: `knowledge-vault:${entry.id}`,
    level: 'long_term',
    contentType: 'knowledge',
    title: entry.title || entry.path,
    summary: entry.summary || content.slice(0, 180),
    content,
    topic: mapKnowledgeTopic(entry.category),
    importance: entry.relevanceScore >= 0.85 ? 5 : entry.relevanceScore >= 0.65 ? 4 : 3,
    tags: Array.from(
      new Set([
        'knowledge-vault',
        entry.category,
        ...(entry.tags ?? []),
        ...(entry.metadata.keywords ?? []),
      ])
    ).filter(Boolean),
    status: 'active',
    metadata: {
      createdAt,
      updatedAt: entry.metadata.modifiedAt || createdAt,
      lastAccessedAt: entry.lastAccessedAt || createdAt,
      accessCount: Math.max(1, entry.accessCount || 0),
      source: 'import',
      schemaVersion: '1.0.0',
    },
    sourceEntryIds: entry.path ? [entry.path] : [],
    confidenceScore: Math.round((entry.relevanceScore || 0.5) * 100),
    userVerified: true,
    editable: true,
    version: 1,
    versionHistory: [],
  };
}

function sortKnowledgeEntries(entries: MemoryEntry[]): MemoryEntry[] {
  return [...entries].sort((a, b) => {
    const accessDelta = (b.metadata.accessCount ?? 0) - (a.metadata.accessCount ?? 0);
    if (accessDelta !== 0) {
      return accessDelta;
    }

    const left = 'title' in a && a.title ? a.title : a.id;
    const right = 'title' in b && b.title ? b.title : b.id;
    return left.localeCompare(right);
  });
}

// Lazy-load heavy components
const LazyMemoryDashboard = React.lazy(() =>
  import('@/components/chat/MemoryDashboard').then(m => ({
    default: m.MemoryDashboard,
  }))
);

const LazyMemoryTreeViewer = React.lazy(() =>
  import('@/features/memory/MemoryTreeViewer').then(m => ({
    default: m.MemoryTreeViewer,
  }))
);

const LazyMemorySearchPanel = React.lazy(() =>
  import('@/features/memory/MemorySearchPanel').then(m => ({
    default: m.MemorySearchPanel,
  }))
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const MemorySection: React.FC<MemorySectionProps> = memo(
  ({ stats, conversationId }) => {
    const [selectedNode, setSelectedNode] = useState<MemoryTreeNodeData | null>(null);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const [knowledgeEntries, setKnowledgeEntries] = useState<MemoryEntry[]>([]);
    const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
    const [knowledgeLoadWarning, setKnowledgeLoadWarning] = useState<string | null>(null);
    const [knowledgeSourceCounts, setKnowledgeSourceCounts] = useState({
      contextual: 0,
      defaults: 0,
      vault: 0,
    });
    const [knowledgeDuplicateCount, setKnowledgeDuplicateCount] = useState(0);
    const [showAllKnowledge, setShowAllKnowledge] = useState(false);
    const [surfaceSyncTimestamp, setSurfaceSyncTimestamp] = useState<number | null>(null);
    const [isSurfaceSyncing, setIsSurfaceSyncing] = useState(false);
    const [activeTab, setActiveTab] = useState<MemorySectionTab>('overview');
    const [knowledgeSearch, setKnowledgeSearch] = useState('');
    const [knowledgeTopicFilter, setKnowledgeTopicFilter] = useState<MemoryTopic | 'all'>(
      'all'
    );
    const isMountedRef = useRef(true);
    const hasObservedPersistentUpdateRef = useRef(false);
    const vaultReadyRef = useRef(false);
    const surfaceRefreshPromiseRef = useRef<Promise<void> | null>(null);
    const queuedSurfaceRefreshRef = useRef<{
      vaultStateOverride?: KnowledgeVaultState;
      forcePersistentRefresh: boolean;
    } | null>(null);

    // PATCH-014: Live LTM conversation history count from SQLite
    const { historyCount: ltmConvCount } = useLTMContext(conversationId ?? null);

    // Load real memory entries for search panel
    const {
      entries: persistentEntries,
      summaries: persistentSummaries = [],
      bundles: persistentBundles = [],
      stats: persistentStats,
      isLoading: persistentMemoryLoading,
      lastUpdate: persistentMemoryLastUpdate,
      refresh: refreshPersistentMemory = noopAsync,
    } = usePersistentMemory({
      modeId: MEMORY_SECTION_MODE,
      enableCache: true,
      refreshInterval: 15000,
    });

    const summaryEntries = useMemo(
      () => persistentSummaries.map(mapPersistentSummaryToMemoryEntry),
      [persistentSummaries]
    );

    const bundleEntries = useMemo(
      () => persistentBundles.map(mapPersistentBundleToMemoryEntry),
      [persistentBundles]
    );

    const consolidatedMemoryEntries = useMemo(
      () =>
        sortKnowledgeEntries(dedupeMemoryEntries([...summaryEntries, ...bundleEntries])),
      [summaryEntries, bundleEntries]
    );

    const recentChatMemoryEntries = useMemo(
      () =>
        [...persistentEntries]
          .filter(entry => {
            const source = String(entry.metadata.source ?? '').toLowerCase();
            return (
              entry.contentType === 'message' ||
              (entry.tags ?? []).includes('chat-interaction') ||
              source.includes('chat')
            );
          })
          .sort(
            (left, right) =>
              (right.metadata.updatedAt ?? right.metadata.createdAt ?? 0) -
              (left.metadata.updatedAt ?? left.metadata.createdAt ?? 0)
          )
          .slice(0, 6),
      [persistentEntries]
    );

    const loadKnowledgeSurface = useCallback(
      async (vaultStateOverride?: KnowledgeVaultState) => {
        const [runtimeKnowledgeResult, defaultKnowledgeResult, vaultKnowledgeResult] =
          await Promise.allSettled([
            memoryService.getKnowledge(64),
            getDefaultKnowledgeBaseEntries(),
            vaultStateOverride
              ? Promise.resolve(vaultStateOverride)
              : (async () => {
                  if (!vaultReadyRef.current) {
                    await knowledgeVault.initialize();
                    vaultReadyRef.current = true;
                  }

                  return knowledgeVault.getState();
                })(),
          ]);

        if (!isMountedRef.current) {
          return;
        }

        const unavailableSources: string[] = [];

        const contextualEntries =
          runtimeKnowledgeResult.status === 'fulfilled'
            ? runtimeKnowledgeResult.value.map(mapRuntimeKnowledgeToMemoryEntry)
            : (() => {
                unavailableSources.push('index contextuel');
                return [];
              })();

        const defaultEntries =
          defaultKnowledgeResult.status === 'fulfilled'
            ? defaultKnowledgeResult.value.map(mapDefaultKnowledgeToMemoryEntry)
            : (() => {
                unavailableSources.push('base système');
                return [];
              })();

        const vaultEntries =
          vaultKnowledgeResult.status === 'fulfilled'
            ? vaultKnowledgeResult.value.entries.map(mapVaultKnowledgeToMemoryEntry)
            : (() => {
                unavailableSources.push('vault local');
                return [];
              })();

        if (
          defaultKnowledgeResult.status === 'fulfilled' &&
          defaultEntries.length === 0
        ) {
          unavailableSources.push('base système');
        }

        const mergedKnowledgeEntries = sortKnowledgeEntries(
          dedupeMemoryEntries([...contextualEntries, ...defaultEntries, ...vaultEntries])
        );

        setKnowledgeEntries(mergedKnowledgeEntries);
        setKnowledgeDuplicateCount(
          Math.max(
            0,
            contextualEntries.length +
              defaultEntries.length +
              vaultEntries.length -
              mergedKnowledgeEntries.length
          )
        );
        setKnowledgeSourceCounts({
          contextual: contextualEntries.length,
          defaults: defaultEntries.length,
          vault: vaultEntries.length,
        });
        setKnowledgeLoadWarning(
          unavailableSources.length > 0
            ? `Certaines sources de connaissance sont temporairement indisponibles (${unavailableSources.join(', ')}). TITANE affiche la mémoire disponible et réessaiera automatiquement lors du prochain rafraîchissement.`
            : null
        );

        if (unavailableSources.length > 0) {
          pageLogger.debug('Knowledge surface degraded', {
            unavailableSources,
          });
        }

        setKnowledgeLoaded(true);
        setSurfaceSyncTimestamp(Date.now());
      },
      []
    );

    const requestSurfaceSync = useCallback(
      async ({
        vaultStateOverride,
        forcePersistentRefresh = false,
      }: {
        vaultStateOverride?: KnowledgeVaultState;
        forcePersistentRefresh?: boolean;
      } = {}) => {
        const nextRequest = {
          vaultStateOverride,
          forcePersistentRefresh,
        };

        if (surfaceRefreshPromiseRef.current) {
          const queued = queuedSurfaceRefreshRef.current;
          queuedSurfaceRefreshRef.current = {
            vaultStateOverride:
              nextRequest.vaultStateOverride ?? queued?.vaultStateOverride,
            forcePersistentRefresh:
              Boolean(nextRequest.forcePersistentRefresh) ||
              Boolean(queued?.forcePersistentRefresh),
          };
          return surfaceRefreshPromiseRef.current;
        }

        const syncPromise = (async () => {
          let currentRequest: typeof nextRequest | null = nextRequest;

          if (isMountedRef.current) {
            setIsSurfaceSyncing(true);
          }

          try {
            while (currentRequest) {
              queuedSurfaceRefreshRef.current = null;

              if (currentRequest.forcePersistentRefresh) {
                await refreshPersistentMemory();
              }

              await loadKnowledgeSurface(currentRequest.vaultStateOverride);
              currentRequest = queuedSurfaceRefreshRef.current;
            }
          } finally {
            if (isMountedRef.current) {
              setIsSurfaceSyncing(false);
            }
            surfaceRefreshPromiseRef.current = null;
          }
        })();

        surfaceRefreshPromiseRef.current = syncPromise;
        return syncPromise;
      },
      [loadKnowledgeSurface, refreshPersistentMemory]
    );

    useEffect(() => {
      isMountedRef.current = true;
      void requestSurfaceSync();

      const unsubscribeVault = knowledgeVault.subscribe(vaultState => {
        void requestSurfaceSync({
          vaultStateOverride: vaultState,
          forcePersistentRefresh: true,
        });
      });

      if (typeof window === 'undefined') {
        return () => {
          unsubscribeVault();
          isMountedRef.current = false;
        };
      }

      const handleWindowFocus = () => {
        void requestSurfaceSync({ forcePersistentRefresh: true });
      };

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          void requestSurfaceSync({ forcePersistentRefresh: true });
        }
      };

      window.addEventListener('focus', handleWindowFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        isMountedRef.current = false;
        unsubscribeVault();
        window.removeEventListener('focus', handleWindowFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [requestSurfaceSync]);

    useEffect(() => {
      if (!hasObservedPersistentUpdateRef.current) {
        hasObservedPersistentUpdateRef.current = true;
        return;
      }

      if (persistentMemoryLastUpdate !== null) {
        void requestSurfaceSync();
      }
    }, [persistentMemoryLastUpdate, requestSurfaceSync]);

    const isBootstrappingPersistentMemory =
      persistentMemoryLoading &&
      persistentMemoryLastUpdate === null &&
      persistentStats === null &&
      persistentEntries.length === 0;

    const isBootstrappingKnowledgeSurface =
      !knowledgeLoaded && knowledgeEntries.length === 0;

    const surfaceEntries = useMemo(
      () =>
        dedupeMemoryEntries([
          ...persistentEntries,
          ...consolidatedMemoryEntries,
          ...knowledgeEntries,
        ]),
      [persistentEntries, consolidatedMemoryEntries, knowledgeEntries]
    );

    const surfaceStats = useMemo(() => {
      if (!persistentStats && surfaceEntries.length === 0) {
        return null;
      }

      const computedCounts = surfaceEntries.reduce(
        (acc, entry) => {
          acc[entry.level] += 1;
          return acc;
        },
        {
          ...EMPTY_COUNT_BY_LEVEL,
        }
      );

      const computedSizes = surfaceEntries.reduce(
        (acc, entry) => {
          acc[entry.level] += entry.content.length;
          return acc;
        },
        {
          ...EMPTY_SIZE_BY_LEVEL,
        }
      );

      return {
        ...(persistentStats ?? {}),
        countByLevel: {
          session: Math.max(
            persistentStats?.countByLevel?.session ?? 0,
            computedCounts.session,
            stats.memoryShortTerm
          ),
          intermediate: Math.max(
            persistentStats?.countByLevel?.intermediate ?? 0,
            computedCounts.intermediate,
            stats.memoryMidTerm
          ),
          long_term: Math.max(
            persistentStats?.countByLevel?.long_term ?? 0,
            computedCounts.long_term,
            stats.memoryLongTerm
          ),
        },
        sizeByLevel: {
          session: Math.max(
            persistentStats?.sizeByLevel?.session ?? 0,
            computedSizes.session
          ),
          intermediate: Math.max(
            persistentStats?.sizeByLevel?.intermediate ?? 0,
            computedSizes.intermediate
          ),
          long_term: Math.max(
            persistentStats?.sizeByLevel?.long_term ?? 0,
            computedSizes.long_term
          ),
        },
        summaryCount: persistentStats?.summaryCount ?? 0,
        bundleCount: persistentStats?.bundleCount ?? 0,
      } as MemoryStats;
    }, [persistentStats, surfaceEntries, stats]);

    const resolvedStats = useMemo(
      () => ({
        memoryShortTerm: surfaceStats?.countByLevel?.session ?? stats.memoryShortTerm,
        memoryMidTerm: surfaceStats?.countByLevel?.intermediate ?? stats.memoryMidTerm,
        memoryLongTerm: surfaceStats?.countByLevel?.long_term ?? stats.memoryLongTerm,
      }),
      [surfaceStats, stats]
    );

    // Map memory surface entries to local MemorySearchEntry format
    const searchEntries: MemorySearchEntry[] = surfaceEntries.map(e => ({
      id: e.id,
      content: e.content,
      type: e.level === 'session' ? 'short' : e.level === 'intermediate' ? 'mid' : 'long',
      timestamp: e.metadata.createdAt,
      tags: e.tags,
      relevance:
        e.metadata.accessCount > 0 ? Math.min(e.metadata.accessCount / 10, 1) : undefined,
    }));

    const filteredKnowledgeEntries = useMemo(() => {
      let result = knowledgeEntries;

      if (knowledgeTopicFilter !== 'all') {
        result = result.filter(e => e.topic === knowledgeTopicFilter);
      }

      if (knowledgeSearch.trim()) {
        const query = knowledgeSearch.toLowerCase();
        result = result.filter(
          e =>
            e.content.toLowerCase().includes(query) ||
            e.tags.some(t => t.toLowerCase().includes(query)) ||
            ('title' in e && e.title?.toLowerCase().includes(query))
        );
      }

      return result;
    }, [knowledgeEntries, knowledgeTopicFilter, knowledgeSearch]);

    const visibleKnowledgeEntries = useMemo(
      () =>
        showAllKnowledge
          ? filteredKnowledgeEntries
          : filteredKnowledgeEntries.slice(0, INITIAL_VISIBLE_KNOWLEDGE_COUNT),
      [filteredKnowledgeEntries, showAllKnowledge]
    );

    const knowledgeTopicCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      for (const entry of knowledgeEntries) {
        counts[entry.topic] = (counts[entry.topic] ?? 0) + 1;
      }
      return counts;
    }, [knowledgeEntries]);

    // Reset pagination when search query or topic filter changes
    useEffect(() => {
      setShowAllKnowledge(false);
    }, [knowledgeSearch, knowledgeTopicFilter]);

    const lastSurfaceSyncLabel = useMemo(() => {
      const timestamp = surfaceSyncTimestamp ?? persistentMemoryLastUpdate;
      if (!timestamp) {
        return 'Synchronisation initiale en cours';
      }

      return new Date(timestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }, [persistentMemoryLastUpdate, surfaceSyncTimestamp]);

    const memoryTreeData = useMemo(
      () =>
        isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
          ? null
          : buildPersistentMemoryTree(surfaceEntries, surfaceStats),
      [
        isBootstrappingPersistentMemory,
        isBootstrappingKnowledgeSurface,
        surfaceEntries,
        surfaceStats,
      ]
    );

    const hasPersistentMemory = useMemo(
      () =>
        surfaceEntries.length > 0 ||
        resolvedStats.memoryShortTerm > 0 ||
        resolvedStats.memoryMidTerm > 0 ||
        resolvedStats.memoryLongTerm > 0,
      [surfaceEntries.length, resolvedStats]
    );

    const memorySurfaceState =
      isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
        ? 'loading'
        : hasPersistentMemory
          ? 'ready'
          : 'empty';

    const handleNodeClick = useCallback((node: MemoryTreeNodeData) => {
      setSelectedNode(node);
      setSelectedEntryId(String(node.attributes?.entryId ?? ''));
      pageLogger.debug('Node clicked', node);
    }, []);

    const selectPersistentEntry = useCallback(
      (entry: MemoryEntry | MemorySearchEntry) => {
        setSelectedEntryId(entry.id);
        const matchedNode = memoryTreeData
          ? findMemoryTreeNodeByEntryId(memoryTreeData, entry.id)
          : null;
        if (matchedNode) {
          setSelectedNode(matchedNode);
        } else {
          const inferredType =
            'level' in entry
              ? entry.level === 'session'
                ? 'short'
                : entry.level === 'intermediate'
                  ? 'mid'
                  : 'long'
              : entry.type;
          const inferredCreatedAt =
            'metadata' in entry ? entry.metadata.createdAt : entry.timestamp;
          setSelectedNode({
            name:
              entry.content.length > 48
                ? `${entry.content.slice(0, 48).trim()}...`
                : entry.content,
            attributes: {
              entryId: entry.id,
              type: inferredType,
              createdAt: inferredCreatedAt,
            },
          });
        }
        pageLogger.debug('Memory entry selected', entry);
      },
      [memoryTreeData]
    );

    const handleEntryClick = useCallback(
      (entry: MemorySearchEntry) => {
        selectPersistentEntry(entry);
      },
      [selectPersistentEntry]
    );

    const selectedEntry = useMemo(
      () =>
        selectedEntryId
          ? (surfaceEntries.find(entry => entry.id === selectedEntryId) ?? null)
          : null,
      [surfaceEntries, selectedEntryId]
    );

    return (
      <div
        className="titane-section titane-section-memory"
        data-testid="memory-section-root"
        data-memory-section-mode={MEMORY_SECTION_MODE}
        data-memory-surface-state={memorySurfaceState}
      >
        <TSectionHeader
          title="💾 Mémoire Triple"
          subtitle="Architecture court/moyen/long terme avec visualisation hiérarchique"
        />

        {/* Section Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            marginBottom: spacing[6],
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: '12px',
            background: 'rgba(30, 30, 40, 0.4)',
            flexWrap: 'wrap',
          }}
          role="tablist"
          aria-label="Navigation mémoire"
        >
          {SECTION_TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={e => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  setActiveTab(SECTION_TABS[(index + 1) % SECTION_TABS.length]!.id);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setActiveTab(
                    SECTION_TABS[(index - 1 + SECTION_TABS.length) % SECTION_TABS.length]!
                      .id
                  );
                }
              }}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '8px',
                border: 'none',
                background:
                  activeTab === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#60a5fa' : colors.neutral[400],
                cursor: 'pointer',
                fontSize: fontSizes.sm,
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards — always visible */}
        <Grid columns={3} gap={4}>
          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Court Terme</h3>
            <TMetric
              label="Entrées"
              value={
                isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
                  ? '…'
                  : resolvedStats.memoryShortTerm.toString()
              }
              color="primary"
            />
            <p
              style={{
                fontSize: fontSizes.sm,
                color: colors.neutral[500],
                marginTop: spacing[4],
              }}
            >
              Contexte immédiat et conversation active
            </p>
          </Card>

          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Moyen Terme</h3>
            <TMetric
              label="Entrées"
              value={
                isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
                  ? '…'
                  : resolvedStats.memoryMidTerm.toString()
              }
              color="success"
            />
            <p
              style={{
                fontSize: fontSizes.sm,
                color: colors.neutral[500],
                marginTop: spacing[4],
              }}
            >
              Sessions récentes et apprentissages temporaires
            </p>
          </Card>

          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>Long Terme</h3>
            <TMetric
              label="Entrées"
              value={
                isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
                  ? '…'
                  : resolvedStats.memoryLongTerm.toString()
              }
              color="info"
            />
            {ltmConvCount > 0 && (
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[400],
                  marginTop: spacing[2],
                }}
              >
                🗂 {ltmConvCount} message{ltmConvCount > 1 ? 's' : ''} dans
                l&apos;historique conversationnel, distinct de la LTM
              </p>
            )}
            <p
              style={{
                fontSize: fontSizes.sm,
                color: colors.neutral[500],
                marginTop: spacing[4],
              }}
            >
              Connaissances permanentes et identité
            </p>
          </Card>
        </Grid>

        {activeTab === 'overview' &&
          (isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface) && (
            <Card
              style={{
                marginTop: spacing[6],
                border: `1px solid ${colors.neutral[500]}`,
              }}
            >
              <h3 style={{ marginBottom: spacing[2] }}>
                Chargement de la mémoire persistante
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                TITANE synchronise actuellement les entrées locales et persistantes avant
                d&apos;afficher le dashboard, l&apos;arbre et la recherche.
              </p>
            </Card>
          )}

        {activeTab === 'overview' &&
          !isBootstrappingPersistentMemory &&
          !isBootstrappingKnowledgeSurface &&
          !hasPersistentMemory && (
            <Card
              style={{
                marginTop: spacing[6],
                border: `1px solid ${colors.neutral[500]}`,
              }}
            >
              <h3 style={{ marginBottom: spacing[2] }}>
                Aucune mémoire persistante consolidée
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                La LTM persistante n&apos;a pas encore reçu d&apos;entrée réelle pour ce
                contexte. Les cartes, l&apos;arbre et la recherche restent donc
                volontairement vides.
              </p>
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[500],
                  marginTop: spacing[2],
                }}
              >
                Pour amorcer la mémoire, utilisez une interaction chat de type
                &quot;mémorise&quot; ou laissez TITANE consolider un souvenir depuis une
                conversation réelle.
              </p>
            </Card>
          )}

        {activeTab === 'overview' && knowledgeLoadWarning && (
          <Card
            style={{
              marginTop: spacing[6],
              border: '1px solid rgba(245, 158, 11, 0.45)',
              background: 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <div role="alert" aria-live="polite">
              <h3 style={{ marginBottom: spacing[2], color: '#f59e0b' }}>
                ⚠️ Surface connaissance partiellement dégradée
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                {knowledgeLoadWarning}
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'overview' && recentChatMemoryEntries.length > 0 && (
          <div style={{ marginTop: spacing[6] }}>
            <Card>
              <h3 style={{ marginBottom: spacing[2] }}>
                💬 Mémoires récentes issues du chat
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                Les dernières informations mémorisées depuis les conversations sont
                affichées ici et restent sauvegardées de façon persistante.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: spacing[3],
                  marginTop: spacing[4],
                }}
              >
                {recentChatMemoryEntries.map(entry => {
                  const preview =
                    'summary' in entry &&
                    typeof entry.summary === 'string' &&
                    entry.summary.trim()
                      ? entry.summary
                      : entry.content;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => selectPersistentEntry(entry)}
                      style={{
                        textAlign: 'left',
                        padding: spacing[3],
                        borderRadius: '10px',
                        border: `1px solid ${colors.neutral[500]}`,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <strong style={{ color: colors.neutral[400], display: 'block' }}>
                        {'title' in entry ? entry.title : entry.id}
                      </strong>
                      <span
                        style={{ color: colors.neutral[500], fontSize: fontSizes.sm }}
                      >
                        {preview.slice(0, 140)}
                        {preview.length > 140 ? '…' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'overview' && consolidatedMemoryEntries.length > 0 && (
          <div style={{ marginTop: spacing[6] }}>
            <Card>
              <h3 style={{ marginBottom: spacing[2] }}>
                🧩 Mémoire consolidée et synchronisée
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                {summaryEntries.length} résumé{summaryEntries.length > 1 ? 's' : ''} et{' '}
                {bundleEntries.length} bundle{bundleEntries.length > 1 ? 's' : ''}{' '}
                enrichissent la mémoire affichée pour refléter la totalité de la mémoire
                persistante de TITANE.
              </p>
              <p
                style={{
                  fontSize: fontSizes.sm,
                  color: colors.neutral[500],
                  marginTop: spacing[2],
                }}
              >
                Dernière synchro visible: {lastSurfaceSyncLabel}. La page reste active et
                se resynchronise automatiquement
                {isSurfaceSyncing ? ' — synchronisation en cours…' : ''}.
              </p>
              <button
                type="button"
                onClick={() => {
                  void requestSurfaceSync({ forcePersistentRefresh: true });
                }}
                disabled={isSurfaceSyncing}
                style={{
                  marginTop: spacing[3],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: '8px',
                  border: `1px solid ${colors.neutral[500]}`,
                  background: 'transparent',
                  color: colors.neutral[400],
                  cursor: isSurfaceSyncing ? 'wait' : 'pointer',
                  opacity: isSurfaceSyncing ? 0.7 : 1,
                }}
              >
                {isSurfaceSyncing
                  ? 'Synchronisation en cours…'
                  : '🔄 Resynchroniser maintenant'}
              </button>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: spacing[3],
                  marginTop: spacing[4],
                }}
              >
                {consolidatedMemoryEntries.map(entry => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => selectPersistentEntry(entry)}
                    style={{
                      textAlign: 'left',
                      padding: spacing[3],
                      borderRadius: '10px',
                      border: `1px solid ${colors.neutral[500]}`,
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ color: colors.neutral[400], display: 'block' }}>
                      {'title' in entry ? entry.title : entry.id}
                    </strong>
                    <span style={{ color: colors.neutral[500], fontSize: fontSizes.sm }}>
                      {entry.content.slice(0, 140)}
                      {entry.content.length > 140 ? '…' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'overview' && knowledgeEntries.length > 0 && (
          <div style={{ marginTop: spacing[6] }}>
            <Card>
              <h3 style={{ marginBottom: spacing[2] }}>
                📚 Bases de connaissances visibles dans la Mémoire
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                {knowledgeSourceCounts.contextual} connaissance
                {knowledgeSourceCounts.contextual > 1 ? 's' : ''} contextuelle
                {knowledgeSourceCounts.contextual > 1 ? 's' : ''},{' '}
                {knowledgeSourceCounts.defaults} catégorie
                {knowledgeSourceCounts.defaults > 1 ? 's' : ''} système et{' '}
                {knowledgeSourceCounts.vault} document
                {knowledgeSourceCounts.vault > 1 ? 's' : ''} du vault local sont fusionnés
                en {knowledgeEntries.length} entrée
                {knowledgeEntries.length > 1 ? 's' : ''} réellement cohérente
                {knowledgeEntries.length > 1 ? 's' : ''}.
              </p>
              {knowledgeDuplicateCount > 0 && (
                <p
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.neutral[500],
                    marginTop: spacing[2],
                  }}
                >
                  {knowledgeDuplicateCount} doublon
                  {knowledgeDuplicateCount > 1 ? 's ont' : ' a'} été fusionné
                  {knowledgeDuplicateCount > 1 ? 's' : ''} automatiquement pour garder une
                  mémoire cohérente et réelle.
                </p>
              )}

              {/* Knowledge search + topic filter */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: spacing[2],
                  marginTop: spacing[4],
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  value={knowledgeSearch}
                  onChange={e => setKnowledgeSearch(e.target.value)}
                  placeholder="🔍 Rechercher une connaissance…"
                  data-testid="knowledge-search-input"
                  style={{
                    flex: '1 1 200px',
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.neutral[500]}`,
                    background: 'rgba(0,0,0,0.2)',
                    color: colors.neutral[300],
                    fontSize: fontSizes.sm,
                  }}
                />
                <select
                  value={knowledgeTopicFilter}
                  onChange={e =>
                    setKnowledgeTopicFilter(e.target.value as MemoryTopic | 'all')
                  }
                  data-testid="knowledge-topic-filter"
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.neutral[500]}`,
                    background: 'rgba(0,0,0,0.2)',
                    color: colors.neutral[300],
                    fontSize: fontSizes.sm,
                  }}
                >
                  <option value="all">Tous les sujets ({knowledgeEntries.length})</option>
                  {Object.entries(knowledgeTopicCounts).map(([topic, count]) => {
                    const topicConfig = MEMORY_TOPIC_LABELS[topic as MemoryTopic];
                    const label = topicConfig
                      ? `${topicConfig.icon} ${topicConfig.label}`
                      : topic;
                    return (
                      <option key={topic} value={topic}>
                        {label} ({count})
                      </option>
                    );
                  })}
                </select>
                {filteredKnowledgeEntries.length !== knowledgeEntries.length && (
                  <span
                    style={{
                      fontSize: fontSizes.sm,
                      color: colors.neutral[400],
                    }}
                  >
                    {filteredKnowledgeEntries.length} / {knowledgeEntries.length} affiché
                    {filteredKnowledgeEntries.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Knowledge entry cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: spacing[3],
                  marginTop: spacing[4],
                }}
              >
                {visibleKnowledgeEntries.map(entry => {
                  const topicConfig = MEMORY_TOPIC_LABELS[entry.topic];
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => selectPersistentEntry(entry)}
                      style={{
                        textAlign: 'left',
                        padding: spacing[3],
                        borderRadius: '10px',
                        border: `1px solid ${colors.neutral[500]}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease, background 0.2s ease',
                      }}
                    >
                      {/* Title */}
                      <strong
                        style={{
                          color: colors.neutral[300],
                          display: 'block',
                          marginBottom: spacing[1],
                        }}
                      >
                        {'title' in entry ? entry.title : entry.id}
                      </strong>
                      {/* Topic badge + Importance */}
                      <div
                        style={{
                          display: 'flex',
                          gap: spacing[1],
                          alignItems: 'center',
                          marginBottom: spacing[2],
                          flexWrap: 'wrap',
                        }}
                      >
                        {topicConfig && (
                          <span
                            style={{
                              fontSize: fontSizes.xs,
                              padding: `1px ${spacing[2]}`,
                              borderRadius: '9999px',
                              background: 'rgba(100, 100, 120, 0.3)',
                              color: colors.neutral[400],
                            }}
                          >
                            {topicConfig.icon} {topicConfig.label}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: fontSizes.xs,
                            color: colors.neutral[500],
                          }}
                        >
                          {'★'.repeat(entry.importance)}
                          {'☆'.repeat(Math.max(0, MAX_IMPORTANCE - entry.importance))}
                        </span>
                      </div>
                      {/* Content preview */}
                      <span
                        style={{
                          color: colors.neutral[500],
                          fontSize: fontSizes.sm,
                          display: 'block',
                        }}
                      >
                        {entry.content.slice(0, KNOWLEDGE_PREVIEW_LENGTH)}
                        {entry.content.length > KNOWLEDGE_PREVIEW_LENGTH ? '…' : ''}
                      </span>
                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: spacing[1],
                            flexWrap: 'wrap',
                            marginTop: spacing[2],
                          }}
                        >
                          {entry.tags.slice(0, MAX_VISIBLE_TAGS).map(tag => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '10px',
                                padding: `0 ${spacing[1]}`,
                                borderRadius: '4px',
                                background: 'rgba(60, 60, 80, 0.4)',
                                color: colors.neutral[500],
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                          {entry.tags.length > MAX_VISIBLE_TAGS && (
                            <span
                              style={{ fontSize: '10px', color: colors.neutral[600] }}
                            >
                              +{entry.tags.length - MAX_VISIBLE_TAGS}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* No results from filter */}
              {filteredKnowledgeEntries.length === 0 && knowledgeEntries.length > 0 && (
                <p
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.neutral[500],
                    marginTop: spacing[4],
                    textAlign: 'center',
                  }}
                >
                  Aucune connaissance ne correspond aux filtres actifs. Essayez
                  d&apos;ajuster la recherche ou le sujet.
                </p>
              )}

              {filteredKnowledgeEntries.length > INITIAL_VISIBLE_KNOWLEDGE_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllKnowledge(value => !value)}
                  style={{
                    marginTop: spacing[4],
                    padding: `${spacing[2]} ${spacing[3]}`,
                    borderRadius: '8px',
                    border: `1px solid ${colors.neutral[500]}`,
                    background: 'transparent',
                    color: colors.neutral[400],
                    cursor: 'pointer',
                  }}
                >
                  {showAllKnowledge
                    ? 'Réduire la liste des connaissances visibles'
                    : `Afficher toutes les connaissances (${filteredKnowledgeEntries.length})`}
                </button>
              )}
            </Card>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'dashboard') && (
          <div style={{ marginTop: spacing[6] }}>
            <Card>
              <h3 style={{ marginBottom: spacing[4] }}>📚 Dashboard Mémoire</h3>
              <React.Suspense
                fallback={
                  <SectionLoadingFallback
                    label="Dashboard mémoire"
                    note="Chargement des signaux mémoire…"
                    testId="loading-memory-dashboard"
                  />
                }
              >
                <LazyMemoryDashboard
                  modeId={MEMORY_SECTION_MODE}
                  compact={true}
                  onEntrySelect={selectPersistentEntry}
                  selectedEntryId={selectedEntryId}
                  additionalEntries={[...consolidatedMemoryEntries, ...knowledgeEntries]}
                />
              </React.Suspense>
            </Card>
          </div>
        )}

        {/* Memory Tree Visualization */}
        {(activeTab === 'overview' || activeTab === 'tree') && (
          <div style={{ marginTop: spacing[6] }}>
            <h3 style={{ marginBottom: spacing[4] }}>🌳 Arbre de la Mémoire</h3>
            <React.Suspense
              fallback={
                <SectionLoadingFallback
                  label="Arbre mémoire"
                  note="Construction de la hiérarchie mémoire…"
                  testId="loading-memory-tree"
                />
              }
            >
              <LazyMemoryTreeViewer
                data={memoryTreeData ?? undefined}
                onNodeClick={handleNodeClick}
                showAttributes={true}
                selectedEntryId={selectedEntryId}
                isLoading={
                  isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
                }
              />
            </React.Suspense>
            {selectedNode && (
              <Card style={{ marginTop: spacing[4] }}>
                <h4 style={{ marginBottom: spacing[2] }}>
                  {selectedEntry ? 'Entrée mémoire sélectionnée' : 'Nœud sélectionné'}
                </h4>
                {selectedEntry ? (
                  <>
                    <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                      {selectedEntry.content}
                    </p>
                    <p
                      style={{
                        fontSize: fontSizes.xs,
                        color: colors.neutral[500],
                        marginTop: spacing[2],
                      }}
                    >
                      Niveau: {selectedEntry.level} | Sujet: {selectedEntry.topic} |
                      Importance: {selectedEntry.importance} | Accès:{' '}
                      {selectedEntry.metadata.accessCount}
                    </p>
                  </>
                ) : (
                  <pre style={{ fontSize: fontSizes.xs, color: colors.neutral[400] }}>
                    {JSON.stringify(selectedNode, null, 2)}
                  </pre>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Memory Search */}
        {(activeTab === 'overview' || activeTab === 'search') && (
          <div style={{ marginTop: spacing[6] }}>
            <h3 style={{ marginBottom: spacing[4] }}>🔍 Recherche Sémantique</h3>
            <React.Suspense
              fallback={
                <SectionLoadingFallback
                  label="Recherche sémantique"
                  note="Initialisation de la recherche mémoire…"
                  testId="loading-memory-search"
                />
              }
            >
              <LazyMemorySearchPanel
                entries={searchEntries}
                onEntryClick={handleEntryClick}
                selectedEntryId={selectedEntryId}
                isLoading={
                  isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface
                }
              />
            </React.Suspense>
          </div>
        )}
      </div>
    );
  }
);

MemorySection.displayName = 'MemorySection';

/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemorySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Memory architecture, tree visualization, semantic search
 */

import React, { useState, useCallback, memo, useMemo, useEffect } from 'react';
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
  buildPersistentMemoryTree,
  findMemoryTreeNodeByEntryId,
  type MemoryTreeNodeData,
} from '@/features/memory/memoryTreeData';
import type {
  MemoryEntry,
  MemoryStats,
  MemoryTopic,
} from '@/services/memory/persistentMemory.config';
import type { KnowledgeEntry as RuntimeKnowledgeEntry } from '@/services/memory/types';

const pageLogger = createLogger('MemorySection');
const MEMORY_SECTION_MODE = 'admin' as const;

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
    tags: Array.from(new Set(['knowledge-base', entry.category, ...entry.tags])).filter(
      Boolean
    ),
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
  const content = flattenKnowledgeContent(entry.content) || entry.description || entry.category;
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

function dedupeMemoryEntries(entries: MemoryEntry[]): MemoryEntry[] {
  const seen = new Set<string>();
  return entries.filter(entry => {
    if (seen.has(entry.id)) {
      return false;
    }
    seen.add(entry.id);
    return true;
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
    const [knowledgeSourceCounts, setKnowledgeSourceCounts] = useState({
      contextual: 0,
      defaults: 0,
    });

    // PATCH-014: Live LTM conversation history count from SQLite
    const { historyCount: ltmConvCount } = useLTMContext(conversationId ?? null);

    // Load real memory entries for search panel
    const {
      entries: persistentEntries,
      stats: persistentStats,
      isLoading: persistentMemoryLoading,
      lastUpdate: persistentMemoryLastUpdate,
    } = usePersistentMemory({
      modeId: MEMORY_SECTION_MODE,
      enableCache: true,
    });

    useEffect(() => {
      let isMounted = true;

      const loadKnowledgeSurface = async () => {
        const [runtimeKnowledgeResult, defaultKnowledgeResult] = await Promise.allSettled([
          memoryService.getKnowledge(64),
          getDefaultKnowledgeBaseEntries(),
        ]);

        if (!isMounted) {
          return;
        }

        const contextualEntries =
          runtimeKnowledgeResult.status === 'fulfilled'
            ? runtimeKnowledgeResult.value.map(mapRuntimeKnowledgeToMemoryEntry)
            : [];
        const defaultEntries =
          defaultKnowledgeResult.status === 'fulfilled'
            ? defaultKnowledgeResult.value.map(mapDefaultKnowledgeToMemoryEntry)
            : [];

        setKnowledgeEntries(dedupeMemoryEntries([...contextualEntries, ...defaultEntries]));
        setKnowledgeSourceCounts({
          contextual: contextualEntries.length,
          defaults: defaultEntries.length,
        });
        setKnowledgeLoaded(true);
      };

      void loadKnowledgeSurface();

      return () => {
        isMounted = false;
      };
    }, []);

    const isBootstrappingPersistentMemory =
      persistentMemoryLoading &&
      persistentMemoryLastUpdate === null &&
      persistentStats === null &&
      persistentEntries.length === 0;

    const isBootstrappingKnowledgeSurface = !knowledgeLoaded && knowledgeEntries.length === 0;

    const surfaceEntries = useMemo(
      () => dedupeMemoryEntries([...persistentEntries, ...knowledgeEntries]),
      [persistentEntries, knowledgeEntries]
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
          session: Math.max(persistentStats?.sizeByLevel?.session ?? 0, computedSizes.session),
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

        {/* Stats Cards */}
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

        {(isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface) && (
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

        {!isBootstrappingPersistentMemory &&
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

        {knowledgeEntries.length > 0 && (
          <div style={{ marginTop: spacing[6] }}>
            <Card>
              <h3 style={{ marginBottom: spacing[2] }}>
                📚 Bases de connaissances visibles dans la Mémoire
              </h3>
              <p style={{ fontSize: fontSizes.sm, color: colors.neutral[400] }}>
                {knowledgeSourceCounts.contextual} connaissance
                {knowledgeSourceCounts.contextual > 1 ? 's' : ''} indexée
                {knowledgeSourceCounts.contextual > 0 ? 's' : ''} et{' '}
                {knowledgeSourceCounts.defaults} catégorie
                {knowledgeSourceCounts.defaults > 1 ? 's' : ''} système sont maintenant
                intégrées au flux mémoire affiché sur cette page.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: spacing[3],
                  marginTop: spacing[4],
                }}
              >
                {knowledgeEntries.slice(0, 6).map(entry => (
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
                additionalEntries={knowledgeEntries}
              />
            </React.Suspense>
          </Card>
        </div>

        {/* Memory Tree Visualization */}
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
              isLoading={isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface}
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

        {/* Memory Search */}
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
              isLoading={isBootstrappingPersistentMemory || isBootstrappingKnowledgeSurface}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }
);

MemorySection.displayName = 'MemorySection';

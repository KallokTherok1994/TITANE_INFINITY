/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemorySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Memory architecture, tree visualization, semantic search
 */

import React, { useState, useCallback, memo, useMemo } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TSectionHeader } from '@/design-system';
import { SectionLoadingFallback } from './SectionLoadingFallback';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { createLogger } from '@/utils/logger';
import { usePersistentMemory } from '@/hooks/usePersistentMemory';
import { useLTMContext } from '@/hooks/useLTMContext';
import {
  buildPersistentMemoryTree,
  findMemoryTreeNodeByEntryId,
  type MemoryTreeNodeData,
} from '@/features/memory/memoryTreeData';
import type { MemoryEntry } from '@/services/memory/persistentMemory.config';

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

    const isBootstrappingPersistentMemory =
      persistentMemoryLoading &&
      persistentMemoryLastUpdate === null &&
      persistentStats === null &&
      persistentEntries.length === 0;

    const resolvedStats = useMemo(
      () => ({
        memoryShortTerm: persistentStats?.countByLevel?.session ?? stats.memoryShortTerm,
        memoryMidTerm: persistentStats?.countByLevel?.intermediate ?? stats.memoryMidTerm,
        memoryLongTerm: persistentStats?.countByLevel?.long_term ?? stats.memoryLongTerm,
      }),
      [persistentStats, stats]
    );

    // Map persistent entries to local MemorySearchEntry format
    const searchEntries: MemorySearchEntry[] = persistentEntries.map(e => ({
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
        isBootstrappingPersistentMemory
          ? null
          : buildPersistentMemoryTree(persistentEntries, persistentStats),
      [isBootstrappingPersistentMemory, persistentEntries, persistentStats]
    );

    const hasPersistentMemory = useMemo(
      () =>
        persistentEntries.length > 0 ||
        resolvedStats.memoryShortTerm > 0 ||
        resolvedStats.memoryMidTerm > 0 ||
        resolvedStats.memoryLongTerm > 0,
      [persistentEntries.length, resolvedStats]
    );

    const memorySurfaceState = isBootstrappingPersistentMemory
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
          ? (persistentEntries.find(entry => entry.id === selectedEntryId) ?? null)
          : null,
      [persistentEntries, selectedEntryId]
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
                isBootstrappingPersistentMemory
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
                isBootstrappingPersistentMemory
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
                isBootstrappingPersistentMemory
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

        {isBootstrappingPersistentMemory && (
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

        {!isBootstrappingPersistentMemory && !hasPersistentMemory && (
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
              isLoading={isBootstrappingPersistentMemory}
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
              isLoading={isBootstrappingPersistentMemory}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }
);

MemorySection.displayName = 'MemorySection';

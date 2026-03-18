/**
 * TITANE∞ v25.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MemorySection Component
 * Extracted from TitanePage.tsx for better maintainability
 * Handles: Memory architecture, tree visualization, semantic search
 */

import React, { useState, useCallback, memo } from 'react';
import { Grid } from '@components/layout';
import { Card } from '@/ui';
import { TMetric, TSectionHeader } from '@/design-system';
import { colors, spacing, fontSizes } from '@themes/tokens';
import { createLogger } from '@/utils/logger';
import { usePersistentMemory } from '@/hooks/usePersistentMemory';
import { useLTMContext } from '@/hooks/useLTMContext';

const pageLogger = createLogger('MemorySection');

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

type MemoryTreeNodeData = {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: MemoryTreeNodeData[];
};

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

    // PATCH-014: Live LTM conversation history count from SQLite
    const { historyCount: ltmConvCount } = useLTMContext(conversationId ?? null);

    // Load real memory entries for search panel
    const { entries: persistentEntries } = usePersistentMemory({
      modeId: 'default',
      enableCache: true,
    });

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

    const handleNodeClick = useCallback((node: MemoryTreeNodeData) => {
      setSelectedNode(node);
      pageLogger.debug('Node clicked', node);
    }, []);

    const handleEntryClick = useCallback((entry: MemorySearchEntry) => {
      pageLogger.debug('Memory entry clicked', entry);
    }, []);

    return (
      <div className="titane-section titane-section-memory">
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
              value={stats.memoryShortTerm.toString()}
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
              value={stats.memoryMidTerm.toString()}
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
              value={(stats.memoryLongTerm + ltmConvCount).toString()}
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
                🗂 {ltmConvCount} message{ltmConvCount > 1 ? 's' : ''} en mémoire de
                session
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

        <div style={{ marginTop: spacing[6] }}>
          <Card>
            <h3 style={{ marginBottom: spacing[4] }}>📚 Dashboard Mémoire</h3>
            <React.Suspense fallback={null}>
              <LazyMemoryDashboard modeId="default" compact={true} />
            </React.Suspense>
          </Card>
        </div>

        {/* Memory Tree Visualization */}
        <div style={{ marginTop: spacing[6] }}>
          <h3 style={{ marginBottom: spacing[4] }}>🌳 Arbre de la Mémoire</h3>
          <React.Suspense fallback={null}>
            <LazyMemoryTreeViewer onNodeClick={handleNodeClick} showAttributes={true} />
          </React.Suspense>
          {selectedNode && (
            <Card style={{ marginTop: spacing[4] }}>
              <h4>Nœud sélectionné</h4>
              <pre style={{ fontSize: fontSizes.xs, color: colors.neutral[400] }}>
                {JSON.stringify(selectedNode, null, 2)}
              </pre>
            </Card>
          )}
        </div>

        {/* Memory Search */}
        <div style={{ marginTop: spacing[6] }}>
          <h3 style={{ marginBottom: spacing[4] }}>🔍 Recherche Sémantique</h3>
          <React.Suspense fallback={null}>
            <LazyMemorySearchPanel
              entries={searchEntries.length > 0 ? searchEntries : undefined}
              onEntryClick={handleEntryClick}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }
);

MemorySection.displayName = 'MemorySection';

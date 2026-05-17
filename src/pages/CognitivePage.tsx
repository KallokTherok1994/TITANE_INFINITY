/**
 * TITANE∞ v35.1.8 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v35.1.8 - Cognitive Page
 * Visualisations de l'état cognitif et des patterns
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { Container, Grid, Stack } from '@components/layout';
import { Card } from '../ui';
import { SurfaceTruthBadge } from '@/components/system/SurfaceTruthBadge';
import { safeInvokeCanonical } from '@/utils/invoke';
import {
  HeliosVisualization,
  NexusGraph,
  HarmoniaPatterns,
  MemoryTimeline,
} from '@features/cognitive';

interface CognitionProbe {
  load?: number;
  active_thoughts?: number;
  depth?: number;
  last_update_ms?: number;
}

export const CognitivePage = (): JSX.Element => {
  const [cognitionProbe, setCognitionProbe] = useState<CognitionProbe | null>(null);
  const [probeError, setProbeError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const r = await safeInvokeCanonical<CognitionProbe>('engine_get_cognition_state');
      if (cancelled) return;
      if (r.ok && r.content) {
        setCognitionProbe(r.content);
        setProbeError(false);
      } else {
        setCognitionProbe(null);
        setProbeError(true);
      }
    };
    void probe();
    const id = setInterval(() => void probe(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const badgeVariant: 'LIVE' | 'PARTIAL' | 'DEGRADED' =
    cognitionProbe != null && cognitionProbe.load != null
      ? 'LIVE'
      : probeError
        ? 'DEGRADED'
        : 'PARTIAL';

  const heliosMetrics = {
    stress_level: 0.2,
    clarity_level: 0.85,
    energy_level: 0.82,
    focus_level: 0.78,
    cognitive_load: 0.45,
    emotional_tone: 'Calme',
  };

  const nexusNodes = [
    {
      id: 'n1',
      label: 'React',
      type: 'skill' as const,
      x: 150,
      y: 100,
      connections: 5,
      importance: 0.9,
    },
    {
      id: 'n2',
      label: 'TypeScript',
      type: 'skill' as const,
      x: 250,
      y: 150,
      connections: 8,
      importance: 0.95,
    },
    {
      id: 'n3',
      label: 'Tauri',
      type: 'concept' as const,
      x: 350,
      y: 100,
      connections: 4,
      importance: 0.8,
    },
    {
      id: 'n4',
      label: 'Design Patterns',
      type: 'concept' as const,
      x: 250,
      y: 50,
      connections: 6,
      importance: 0.85,
    },
    {
      id: 'n5',
      label: 'Projet TITANE',
      type: 'memory' as const,
      x: 250,
      y: 200,
      connections: 3,
      importance: 0.92,
    },
  ];

  const nexusEdges = [
    { source: 'n1', target: 'n2', strength: 0.9 },
    { source: 'n2', target: 'n3', strength: 0.7 },
    { source: 'n2', target: 'n4', strength: 0.8 },
    { source: 'n1', target: 'n5', strength: 0.6 },
  ];

  const harmoniaPatterns = [
    {
      id: 'p1',
      name: 'Deep Work',
      category: 'productivity' as const,
      frequency: 0.85,
      confidence: 0.92,
      hoursMean: 3.5,
      lastOccurrence: new Date(Date.now() - 3600000),
    },
    {
      id: 'p2',
      name: 'Learning Sessions',
      category: 'learning' as const,
      frequency: 0.7,
      confidence: 0.88,
      hoursMean: 2.0,
      lastOccurrence: new Date(Date.now() - 7200000),
    },
    {
      id: 'p3',
      name: 'Creative Flow',
      category: 'creative' as const,
      frequency: 0.6,
      confidence: 0.75,
      hoursMean: 1.5,
      lastOccurrence: new Date(Date.now() - 10800000),
    },
    {
      id: 'p4',
      name: 'Rest Periods',
      category: 'rest' as const,
      frequency: 0.5,
      confidence: 0.95,
      hoursMean: 1.0,
      lastOccurrence: new Date(Date.now() - 14400000),
    },
  ];

  const memoryEntries = [
    {
      id: 'mem1',
      type: 'conversation' as const,
      content: "Discussion sur l'architecture de TITANE∞ v15",
      timestamp: new Date(Date.now() - 3600000),
      importance: 0.9,
      tags: ['architecture', 'typescript', 'design'],
      similarity: 0.92,
    },
    {
      id: 'mem2',
      type: 'skill' as const,
      content: 'Maîtrise de React hooks avancés',
      timestamp: new Date(Date.now() - 86400000),
      importance: 0.85,
      tags: ['react', 'hooks', 'frontend'],
      similarity: 0.88,
    },
    {
      id: 'mem3',
      type: 'fact' as const,
      content: 'Les design tokens améliorent la cohérence UI',
      timestamp: new Date(Date.now() - 172800000),
      importance: 0.75,
      tags: ['design', 'ui', 'best-practices'],
      similarity: 0.8,
    },
    {
      id: 'mem4',
      type: 'experience' as const,
      content: 'Refactoring complet du frontend en 3 phases',
      timestamp: new Date(Date.now() - 259200000),
      importance: 0.95,
      tags: ['refactoring', 'frontend', 'titane'],
      similarity: 0.95,
    },
  ];

  return (
    <div data-testid="page-cognitive">
      <SurfaceTruthBadge variant={badgeVariant} />
      <Container size="xl">
        <Stack direction="vertical" gap={6}>
          {/* Header */}
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              État Cognitif
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-muted)',
              }}
            >
              Analyse approfondie de vos capacités et patterns mentaux
            </p>
          </div>

          {/* Top Row: Helios + Nexus */}
          <Grid columns={2} gap={4}>
            <Card variant="glass" elevation="lg">
              <h2
                style={{
                  margin: 0,
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                }}
              >
                Métriques Cognitives
              </h2>
              <HeliosVisualization metrics={heliosMetrics} />
            </Card>

            <Card variant="glass" elevation="lg">
              <h2
                style={{
                  margin: 0,
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                }}
              >
                Graphe de Connaissances
              </h2>
              <NexusGraph nodes={nexusNodes} edges={nexusEdges} />
            </Card>
          </Grid>

          {/* Middle Row: Harmonia */}
          <Card variant="glass" elevation="lg">
            <h2
              style={{
                margin: 0,
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-xl)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}
            >
              Patterns Comportementaux
            </h2>
            <HarmoniaPatterns patterns={harmoniaPatterns} />
          </Card>

          {/* Bottom Row: Memory Timeline */}
          <Card variant="glass" elevation="lg">
            <h2
              style={{
                margin: 0,
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--text-xl)',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}
            >
              Timeline des Mémoires
            </h2>
            <MemoryTimeline entries={memoryEntries} />
          </Card>
        </Stack>
      </Container>
    </div>
  );
};

// v24.3.1 FIX: Add missing default export for lazy loading
export default CognitivePage;

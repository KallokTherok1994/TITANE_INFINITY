import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test-utils';
import { MemoryDashboard } from '@/components/chat/MemoryDashboard';

const mockUsePersistentMemory = vi.fn();

vi.mock('@/hooks/usePersistentMemory', () => ({
  usePersistentMemory: (options: unknown) => mockUsePersistentMemory(options),
}));

describe('MemoryDashboard hybrid summary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePersistentMemory.mockReturnValue({
      entries: [],
      stats: {
        countByLevel: {
          session: 1,
          intermediate: 1,
          long_term: 1,
        },
        sizeByLevel: {
          session: 10,
          intermediate: 20,
          long_term: 30,
        },
      },
      isLoading: false,
      error: null,
      refresh: vi.fn(),
      sessionCount: 1,
      intermediateCount: 1,
      longTermCount: 1,
    });
  });

  it('renders persisted hybrid summary when diagnostics are provided', () => {
    render(
      <MemoryDashboard
        modeId="admin"
        hybridDiagnostics={{
          shadowWriteEnabled: true,
          shadowReadEnabled: true,
          hybridOrchestrationEnabled: true,
          shadowWriteCount: 2,
          shadowReadCount: 3,
          lastHybridOrchestrationStatus: 'ready',
          lastHybridOrchestrationCount: 1,
          lastHybridOrchestrationPreview: ['Atlas runtime addendum'],
          lastHybridOrchestrationReason:
            'supplements hybrides additifs injectes dans le contexte prompt',
          shadowReadRolloutMode: 'canary',
          shadowReadActivePresetId: 'balanced',
          shadowReadActivePresetLabel: 'Equilibre',
          shadowReadCanaryEligible: true,
          shadowReadCanaryBucket: 12,
          shadowReadCanaryPercentage: 25,
          shadowReadTrendWindow: 10,
          shadowReadCanaryReason: 'bucket 12 inclus dans la cible < 25',
          shadowReadCanaryQueryPreview: 'Atlas memory',
          shadowReadCanaryOperatorHint:
            'Le contexte est dans le canari courant. Conserver ce preset pour observation ou passer en Full pour generaliser.',
          lastShadowWriteAt: 1,
          lastShadowReadAt: 2,
          lastShadowReadStatus: 'ready',
          lastShadowReadSampleCount: 2,
          lastShadowReadTotalMemories: 4,
          lastCanonicalContextCount: 3,
          lastShadowReadQualification: 'partial',
          lastShadowReadCoverageRatio: 0.6,
          lastShadowReadAverageSimilarity: 0.7,
          lastShadowReadAverageRetrievalScore: 0.8,
          lastShadowReadCompositeScore: 0.75,
          lastShadowReadMatchedCount: 2,
          lastShadowReadMissingCount: 1,
          lastShadowReadExtraCount: 1,
          lastShadowReadCanonicalPreview: ['Atlas'],
          lastShadowReadUnifiedPreview: ['Atlas', 'Shadow extra'],
          lastShadowReadMatchedPairs: [],
          lastShadowReadNearMatches: [],
          lastShadowReadNearMatchStability: [],
          lastShadowReadMissingReasons: [],
          recentShadowReadQualifications: [],
          recentShadowReadExtendedTrend: [],
          recentShadowReadPresetChanges: [
            {
              at: 3,
              fromPresetLabel: 'Observation',
              toPresetLabel: 'Equilibre',
              mode: 'canary',
              percentage: 25,
              trendWindow: 10,
              source: 'preset',
            },
          ],
          lastShadowReadTrendSummary: {
            windowSize: 10,
            readyCount: 0,
            partialCount: 0,
            insufficientCount: 0,
            averageCompositeScore: 0,
          },
          lastShadowReadMissingLabels: [],
          lastShadowReadExtraLabels: [],
          lastShadowReadQuery: 'Atlas memory',
          lastError: null,
        }}
      />
    );

    expect(screen.getByTestId('memory-dashboard-hybrid-summary')).toBeInTheDocument();
    expect(screen.getByTestId('memory-dashboard-hybrid-active-preset')).toHaveTextContent(
      'Preset actif: Equilibre'
    );
    expect(screen.getByTestId('memory-dashboard-hybrid-status')).toHaveTextContent(
      'shadow read ready'
    );
    expect(screen.getByTestId('memory-dashboard-hybrid-operator-hint')).toHaveTextContent(
      'Le contexte est dans le canari courant.'
    );
    expect(
      screen.getByTestId('memory-dashboard-hybrid-preset-history')
    ).toHaveTextContent('Observation -> Equilibre (preset)');
  });
});

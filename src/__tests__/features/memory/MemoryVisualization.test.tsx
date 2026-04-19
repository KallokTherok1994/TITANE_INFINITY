/**
 * Tests pour MemoryTreeViewer Component
 * Coverage: rendu, controls, callback node click
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryTreeViewer } from '@/features/memory/MemoryTreeViewer';

vi.mock('react-d3-tree', () => ({
  default: ({ data, renderCustomNodeElement, translate, dimensions }: any) => (
    <div
      data-testid="mock-tree"
      data-translate-x={translate?.x}
      data-translate-y={translate?.y}
      data-dimensions={`${dimensions?.width ?? 0}x${dimensions?.height ?? 0}`}
    >
      <span>{data?.name}</span>
      <svg data-testid="mock-tree-rendered">
        {data?.children?.map((child: any, index: number) => (
          <g key={index}>
            {renderCustomNodeElement?.({
              nodeDatum: child,
              hierarchyPointNode: { x: 120 + index * 80, y: 220 + index * 40 },
            })}
          </g>
        ))}
      </svg>
    </div>
  ),
}));

describe('MemoryTreeViewer Component', () => {
  const mockMemoryTree = {
    name: 'Mémoire TITANE',
    attributes: { type: 'root' },
    children: [
      { name: 'Court Terme', attributes: { type: 'short', entryId: 'short-1' } },
      { name: 'Moyen Terme', attributes: { type: 'mid' } },
      { name: 'Long Terme', attributes: { type: 'long' } },
    ],
  };

  describe('Rendering', () => {
    it('should render an honest empty state without data', () => {
      render(<MemoryTreeViewer />);
      expect(screen.getByText(/aucune entrée mémoire disponible/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/rechercher dans la mémoire/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/court terme/i)).not.toBeInTheDocument();
    });

    it('should render a bootstrap loading state before the persistent tree is ready', () => {
      render(<MemoryTreeViewer isLoading={true} />);
      expect(screen.getByText(/chargement de l'arbre mémoire/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/aucune entrée mémoire disponible/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/rechercher dans la mémoire/i)
      ).not.toBeInTheDocument();
    });

    it('should render memory tree', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(screen.getByTestId('mock-tree')).toBeInTheDocument();
      expect(screen.getByText('Mémoire TITANE')).toBeInTheDocument();
    });

    it('should render controls and search input', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(
        screen.getByPlaceholderText(/rechercher dans la mémoire/i)
      ).toBeInTheDocument();
      expect(screen.getByTitle(/zoom avant/i)).toBeInTheDocument();
      expect(screen.getByTitle(/zoom arrière/i)).toBeInTheDocument();
    });

    it('should react to search input changes', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      const input = screen.getByPlaceholderText(/rechercher dans la mémoire/i);
      fireEvent.change(input, { target: { value: 'court' } });
      expect(input).toHaveValue('court');
    });

    it('should expose and highlight the selected entry state', () => {
      const { container } = render(
        <MemoryTreeViewer data={mockMemoryTree} selectedEntryId="short-1" />
      );

      expect(screen.getByTestId('memory-tree-selection-state')).toHaveTextContent(
        'short-1'
      );
      expect(container.querySelector('circle[stroke="#22d3ee"]')).toBeInTheDocument();
    });

    it('should render hybrid memory diagnostics when provided', () => {
      const handleRolloutConfigChange = vi.fn();
      const handleProbeRequest = vi.fn();

      render(
        <MemoryTreeViewer
          data={mockMemoryTree}
          onShadowReadRolloutConfigChange={handleRolloutConfigChange}
          onShadowReadProbeRequest={handleProbeRequest}
          diagnostics={{
            shadowWriteEnabled: true,
            shadowReadEnabled: true,
            hybridOrchestrationEnabled: true,
            shadowWriteCount: 3,
            shadowReadCount: 2,
            lastHybridOrchestrationStatus: 'ready',
            lastHybridOrchestrationCount: 1,
            lastHybridOrchestrationPreview: ['Atlas runtime addendum'],
            lastHybridOrchestrationReason:
              'supplements hybrides additifs injectes dans le contexte prompt',
            shadowReadRolloutMode: 'canary',
            shadowReadActivePresetId: 'balanced',
            shadowReadActivePresetLabel: 'Equilibre',
            shadowReadCanaryEligible: true,
            shadowReadCanaryBucket: 18,
            shadowReadCanaryPercentage: 25,
            shadowReadTrendWindow: 8,
            shadowReadCanaryReason: 'bucket 18 inclus dans la cible < 25',
            shadowReadCanaryQueryPreview: 'atlas',
            shadowReadCanaryOperatorHint:
              'Le contexte est dans le canari courant. Conserver ce preset pour observation ou passer en Full pour generaliser.',
            lastShadowWriteAt: Date.now(),
            lastShadowReadAt: Date.now(),
            lastShadowReadStatus: 'ready',
            lastShadowReadSampleCount: 2,
            lastShadowReadTotalMemories: 5,
            lastCanonicalContextCount: 4,
            lastShadowReadQualification: 'partial',
            lastShadowReadCoverageRatio: 0.75,
            lastShadowReadAverageSimilarity: 0.68,
            lastShadowReadAverageRetrievalScore: 0.82,
            lastShadowReadCompositeScore: 0.75,
            lastShadowReadMatchedCount: 3,
            lastShadowReadMissingCount: 1,
            lastShadowReadExtraCount: 2,
            lastShadowReadCanonicalPreview: ['Atlas', 'Knowledge A'],
            lastShadowReadUnifiedPreview: ['Atlas', 'Knowledge A', 'Shadow extra'],
            lastShadowReadMatchedPairs: [
              { canonicalLabel: 'Atlas', unifiedLabel: 'Atlas', similarity: 1 },
              { canonicalLabel: 'Knowledge A', unifiedLabel: 'Knowledge A', similarity: 1 },
            ],
            lastShadowReadNearMatches: [
              {
                canonicalLabel: 'Atlas memory',
                unifiedLabel: 'Atlas shadow memory',
                similarity: 0.33,
                gapToThreshold: 0.07,
              },
            ],
            lastShadowReadNearMatchStability: [
              {
                canonicalLabel: 'Atlas memory',
                unifiedLabel: 'Atlas shadow memory',
                seenCount: 3,
                observationWindow: 5,
                averageSimilarity: 0.31,
                stability: 'recurrent',
              },
            ],
            lastShadowReadMissingReasons: [
              {
                canonicalLabel: 'Atlas',
                bestUnifiedLabel: 'Shadow extra',
                bestSimilarity: 0.2,
                gapToThreshold: 0.2,
                priority: 'faible',
                reason: 'similarite inferieure au seuil (20%)',
              },
            ],
            recentShadowReadQualifications: [
              { at: 1, qualification: 'partial', compositeScore: 0.75 },
              { at: 0, qualification: 'ready', compositeScore: 0.81 },
            ],
            recentShadowReadExtendedTrend: [
              { at: 2, qualification: 'partial', compositeScore: 0.75 },
              { at: 1, qualification: 'ready', compositeScore: 0.81 },
              { at: 0, qualification: 'insufficient', compositeScore: 0.22 },
            ],
            recentShadowReadPresetChanges: [
              {
                at: 2,
                fromPresetLabel: 'Observation',
                toPresetLabel: 'Equilibre',
                mode: 'canary',
                percentage: 25,
                trendWindow: 8,
                source: 'preset',
              },
            ],
            lastShadowReadTrendSummary: {
              windowSize: 8,
              readyCount: 1,
              partialCount: 1,
              insufficientCount: 1,
              averageCompositeScore: 0.5933,
            },
            lastShadowReadMissingLabels: ['Atlas'],
            lastShadowReadExtraLabels: ['Shadow extra'],
            lastShadowReadQuery: 'atlas',
            lastError: null,
          }}
        />
      );

      expect(screen.getByTestId('memory-hybrid-diagnostics')).toBeInTheDocument();
      expect(screen.getByTestId('memory-hybrid-shadow-write-state')).toHaveTextContent(
        'Shadow write: actif'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-state')).toHaveTextContent(
        'Shadow read: ready'
      );
      expect(screen.getByTestId('memory-hybrid-orchestration-state')).toHaveTextContent(
        'Orchestration hybride: ready'
      );
      expect(screen.getByTestId('memory-hybrid-orchestration-count')).toHaveTextContent(
        'Complements injectes: 1'
      );
      expect(screen.getByTestId('memory-hybrid-orchestration-preview')).toHaveTextContent(
        'Atlas runtime addendum'
      );
      expect(screen.getByTestId('memory-hybrid-orchestration-reason')).toHaveTextContent(
        'supplements hybrides additifs injectes dans le contexte prompt'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-rollout-mode')).toHaveTextContent(
        'Rollout shadow read: canary'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-canary-state')).toHaveTextContent(
        'Canari: eligible (18/25)'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-active-preset')).toHaveTextContent(
        'Preset actif: Equilibre'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-canary-reason')).toHaveTextContent(
        'Raison canari: bucket 18 inclus dans la cible < 25'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-canary-operator-hint')).toHaveTextContent(
        'Action: Le contexte est dans le canari courant. Conserver ce preset pour observation ou passer en Full pour generaliser.'
      );
      expect(
        screen.getByTestId('memory-hybrid-shadow-read-canary-query-preview')
      ).toHaveTextContent('Requete canari: atlas');
      expect(screen.getByTestId('memory-hybrid-shadow-read-preset-history')).toHaveTextContent(
        'Historique presets: Observation -> Equilibre (preset)'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-rollout-controls')).toBeInTheDocument();
      expect(screen.getByTestId('memory-hybrid-shadow-read-rollout-presets')).toBeInTheDocument();
      expect(screen.getByTestId('memory-hybrid-shadow-read-coverage')).toHaveTextContent(
        'Recouvrement canonique: 75%'
      );
      expect(
        screen.getByTestId('memory-hybrid-shadow-read-average-similarity')
      ).toHaveTextContent('Similarite moyenne: 68%');
      expect(screen.getByTestId('memory-hybrid-shadow-read-average-score')).toHaveTextContent(
        'Score retrieval moyen: 82%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-composite-score')).toHaveTextContent(
        'Score compose: 75%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-qualification')).toHaveTextContent(
        'Qualification: partiel'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-canonical-preview')).toHaveTextContent(
        'Canonique: Atlas | Knowledge A'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-unified-preview')).toHaveTextContent(
        'UnifiedMemory: Atlas | Knowledge A | Shadow extra'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-matched-pairs')).toHaveTextContent(
        'Paires: Atlas -> Atlas (100%) | Knowledge A -> Knowledge A (100%)'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-history')).toHaveTextContent(
        'Historique: partial:75% | ready:81%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-trend-summary')).toHaveTextContent(
        'Tendance 8: pret 1 | partiel 1 | insuffisant 1 | score moyen 59%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-extended-trend')).toHaveTextContent(
        'Fenetre etendue: partial:75% | ready:81% | insufficient:22%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-history-chart')).toBeInTheDocument();
      expect(screen.getByTestId('memory-hybrid-shadow-read-history-sparkline')).toBeInTheDocument();
      expect(screen.getAllByTestId('memory-hybrid-shadow-read-history-point')).toHaveLength(2);
      expect(screen.getByTestId('memory-hybrid-shadow-read-history-axis')).toHaveTextContent('%');
      expect(screen.getAllByTestId('memory-hybrid-shadow-read-pair-row')).toHaveLength(2);
      expect(screen.getAllByTestId('memory-hybrid-shadow-read-near-row')).toHaveLength(1);
      expect(screen.getByTestId('memory-hybrid-shadow-read-near-matches')).toHaveTextContent(
        'Similarite: 33%'
      );
      expect(screen.getAllByTestId('memory-hybrid-shadow-read-near-stability-row')).toHaveLength(1);
      expect(screen.getByTestId('memory-hybrid-shadow-read-near-stability')).toHaveTextContent(
        'Stabilite: recurrent'
      );
      expect(screen.getAllByTestId('memory-hybrid-shadow-read-missing-row')).toHaveLength(1);
      expect(screen.getByTestId('memory-hybrid-shadow-read-missing-list')).toHaveTextContent(
        'similarite inferieure au seuil (20%)'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-missing-list')).toHaveTextContent(
        'Ecart au seuil: 20%'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-query')).toHaveTextContent(
        'Requete: atlas'
      );
      expect(screen.getByTestId('memory-hybrid-shadow-read-missing-labels')).toHaveTextContent(
        'Libelles absents: Atlas'
      );

      fireEvent.change(screen.getByTestId('memory-hybrid-shadow-read-rollout-mode-select'), {
        target: { value: 'full' },
      });
      fireEvent.change(
        screen.getByTestId('memory-hybrid-shadow-read-canary-percentage-select'),
        {
          target: { value: '50' },
        }
      );
      fireEvent.change(screen.getByTestId('memory-hybrid-shadow-read-trend-window-select'), {
        target: { value: '16' },
      });
      fireEvent.click(screen.getByTestId('memory-hybrid-shadow-read-rollout-apply'));
      fireEvent.click(screen.getByTestId('memory-hybrid-shadow-read-rollout-probe'));
      fireEvent.click(screen.getByTestId('memory-hybrid-shadow-read-rollout-preset-observe'));

      expect(handleRolloutConfigChange).toHaveBeenCalledWith({
        mode: 'full',
        percentage: 50,
        trendWindow: 16,
      });
      expect(handleRolloutConfigChange).toHaveBeenCalledWith({
        mode: 'canary',
        percentage: 10,
        trendWindow: 12,
      });
      expect(
        screen.getByTestId('memory-hybrid-shadow-read-rollout-preset-balanced')
      ).toHaveClass('memory-hybrid-shadow-read-action-active');
      expect(handleProbeRequest).toHaveBeenCalled();
    });

    it('should recenter the tree when an external selection is synchronized', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} selectedEntryId="short-1" />);
      const tree = screen.getByTestId('mock-tree');

      expect(tree.getAttribute('data-dimensions')).toBe('800x600');
      expect(tree.getAttribute('data-translate-x')).not.toBe('400');
      expect(tree.getAttribute('data-translate-y')).not.toBe('200');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

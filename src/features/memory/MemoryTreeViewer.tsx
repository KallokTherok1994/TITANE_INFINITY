/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * MemoryTreeViewer - Visualisation en arbre de la mémoire TITANE
 * Utilise react-d3-tree pour afficher hiérarchie court/moyen/long terme
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { filterMemoryTree, type MemoryTreeNodeData } from './memoryTreeData';
import { useDebounce } from '@/hooks/useDebounce';
import type {
  HybridMemoryDiagnostics,
  HybridShadowReadRolloutConfig,
} from '@/services/ai/memoryIntegration';
import './MemoryTreeViewer.css';

interface MemoryTreeViewerProps {
  data?: MemoryTreeNodeData;
  onNodeClick?: (node: MemoryTreeNodeData) => void;
  showAttributes?: boolean;
  selectedEntryId?: string | null;
  isLoading?: boolean;
  diagnostics?: HybridMemoryDiagnostics;
  onShadowReadRolloutConfigChange?: (config: HybridShadowReadRolloutConfig) => void;
  onShadowReadProbeRequest?: () => void;
  isShadowReadRolloutBusy?: boolean;
}

const SHADOW_READ_ROLLOUT_PRESETS: Array<{
  id: string;
  label: string;
  config: HybridShadowReadRolloutConfig;
}> = [
  {
    id: 'observe',
    label: 'Observation',
    config: { mode: 'canary', percentage: 10, trendWindow: 12 },
  },
  {
    id: 'balanced',
    label: 'Equilibre',
    config: { mode: 'canary', percentage: 25, trendWindow: 10 },
  },
  {
    id: 'full',
    label: 'Full',
    config: { mode: 'full', percentage: 100, trendWindow: 8 },
  },
];

export const MemoryTreeViewer: React.FC<MemoryTreeViewerProps> = ({
  data,
  onNodeClick,
  showAttributes = true,
  selectedEntryId = null,
  isLoading = false,
  diagnostics,
  onShadowReadRolloutConfigChange,
  onShadowReadProbeRequest,
  isShadowReadRolloutBusy = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedHierarchyPointRef = useRef<{ x: number; y: number } | null>(null);
  const [translate, setTranslate] = useState({ x: 400, y: 200 });
  const [zoom, setZoom] = useState(0.8);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [rolloutModeDraft, setRolloutModeDraft] = useState<'full' | 'canary'>('full');
  const [canaryPercentageDraft, setCanaryPercentageDraft] = useState(100);
  const [trendWindowDraft, setTrendWindowDraft] = useState(12);
  const [isRolloutDraftDirty, setIsRolloutDraftDirty] = useState(false);

  selectedHierarchyPointRef.current = null;

  const treeData = useMemo(() => {
    if (!data) {
      return null;
    }

    return filterMemoryTree(data, debouncedSearchTerm.trim(), selectedType);
  }, [data, debouncedSearchTerm, selectedType]);
  const isBootstrappingMemory = isLoading && !data;
  const hasPersistentTree = Boolean(data);
  const hasFilteredTree = Boolean(treeData);
  const hybridCoveragePercent = diagnostics
    ? Math.round(diagnostics.lastShadowReadCoverageRatio * 100)
    : 0;
  const hybridAverageSimilarityPercent = diagnostics
    ? Math.round(diagnostics.lastShadowReadAverageSimilarity * 100)
    : 0;
  const hybridAverageRetrievalScorePercent = diagnostics
    ? Math.round(diagnostics.lastShadowReadAverageRetrievalScore * 100)
    : 0;
  const hybridCompositeScorePercent = diagnostics
    ? Math.round(diagnostics.lastShadowReadCompositeScore * 100)
    : 0;
  const hybridQualificationLabel = diagnostics
    ? diagnostics.lastShadowReadQualification === 'ready'
      ? 'pret'
      : diagnostics.lastShadowReadQualification === 'partial'
        ? 'partiel'
        : 'insuffisant'
    : 'insuffisant';
  const hybridRecentQualifications = diagnostics?.recentShadowReadQualifications ?? [];
  const hybridExtendedTrend = diagnostics?.recentShadowReadExtendedTrend ?? [];
  const hybridMatchedPairs = diagnostics?.lastShadowReadMatchedPairs ?? [];
  const hybridNearMatches = diagnostics?.lastShadowReadNearMatches ?? [];
  const hybridNearMatchStability = diagnostics?.lastShadowReadNearMatchStability ?? [];
  const hybridMissingReasons = diagnostics?.lastShadowReadMissingReasons ?? [];
  const hybridPresetHistory = diagnostics?.recentShadowReadPresetChanges ?? [];
  const hybridTrendSummaryPercent = diagnostics
    ? Math.round(diagnostics.lastShadowReadTrendSummary.averageCompositeScore * 100)
    : 0;
  const hybridHistoryPoints = useMemo(() => {
    if (hybridRecentQualifications.length === 0) {
      return [] as Array<{
        x: number;
        y: number;
        label: string;
        scoreLabel: string;
        qualification: string;
      }>;
    }

    const sortedEntries = [...hybridRecentQualifications].reverse();
    const width = 180;
    const height = 48;

    return sortedEntries.map((entry, index) => {
      const x =
        sortedEntries.length === 1
          ? width / 2
          : (index / (sortedEntries.length - 1)) * width;
      const y = height - entry.compositeScore * height;
      const label = new Date(entry.at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        label,
        scoreLabel: `${Math.round(entry.compositeScore * 100)}%`,
        qualification: entry.qualification,
      };
    });
  }, [hybridRecentQualifications]);
  const hybridHistoryPolyline = hybridHistoryPoints
    .map(point => `${point.x},${point.y}`)
    .join(' ');

  useEffect(() => {
    if (!diagnostics || isRolloutDraftDirty) {
      return;
    }

    setRolloutModeDraft(diagnostics.shadowReadRolloutMode);
    setCanaryPercentageDraft(diagnostics.shadowReadCanaryPercentage);
    setTrendWindowDraft(diagnostics.shadowReadTrendWindow);
  }, [diagnostics, isRolloutDraftDirty]);

  // Store searchTerm in ref to check match without re-creating callback
  const searchTermRef = React.useRef(debouncedSearchTerm);
  React.useEffect(() => {
    searchTermRef.current = debouncedSearchTerm;
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        return;
      }

      setDimensions(prev =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };

    updateDimensions();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => updateDimensions());
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!selectedEntryId || !selectedHierarchyPointRef.current) {
      return;
    }

    const nextTranslate = {
      x: -selectedHierarchyPointRef.current.x * zoom + dimensions.width / 2,
      y: -selectedHierarchyPointRef.current.y * zoom + dimensions.height / 2,
    };

    setTranslate(prev =>
      Math.abs(prev.x - nextTranslate.x) < 0.5 && Math.abs(prev.y - nextTranslate.y) < 0.5
        ? prev
        : nextTranslate
    );
  }, [selectedEntryId, zoom, dimensions, treeData]);

  // Node rendering avec style personnalisé
  const renderCustomNode = useCallback(
    ({
      nodeDatum,
      hierarchyPointNode,
    }: {
      nodeDatum: MemoryTreeNodeData;
      hierarchyPointNode: { x: number; y: number };
    }) => {
      // Access searchTerm via ref to avoid adding it to dependencies
      const currentSearch = searchTermRef.current.toLowerCase();
      const isMatch = currentSearch
        ? nodeDatum.name.toLowerCase().includes(currentSearch)
        : false;
      const isSelected =
        selectedEntryId !== null &&
        String(nodeDatum.attributes?.entryId ?? '') === selectedEntryId;

      if (isSelected) {
        selectedHierarchyPointRef.current = hierarchyPointNode;
      }

      return (
        <g>
          {/* Node circle */}
          <circle
            r={isSelected ? 24 : 20}
            fill={getNodeColor(nodeDatum)}
            stroke={isSelected ? '#22d3ee' : isMatch ? '#f59e0b' : '#3b82f6'}
            strokeWidth={isSelected ? 4 : isMatch ? 3 : 2}
            style={{ cursor: 'pointer' }}
            onClick={() => onNodeClick?.(nodeDatum)}
          />

          {/* Node icon */}
          <text
            fill="#ffffff"
            fontSize="16"
            textAnchor="middle"
            dy=".3em"
            style={{ pointerEvents: 'none' }}
          >
            {getNodeIcon(nodeDatum)}
          </text>

          {/* Node label */}
          <text
            fill="#e2e8f0"
            fontSize="12"
            fontWeight={isSelected || isMatch ? 'bold' : 'normal'}
            textAnchor="middle"
            dy="35"
            style={{ pointerEvents: 'none' }}
          >
            {nodeDatum.name}
          </text>

          {/* Attributes (if enabled) */}
          {showAttributes && nodeDatum.attributes && (
            <text
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
              dy="50"
              style={{ pointerEvents: 'none' }}
            >
              {Object.keys(nodeDatum.attributes).length} attr.
            </text>
          )}
        </g>
      );
    },
    [showAttributes, onNodeClick, selectedEntryId]
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setZoom(0.8);
    setTranslate({ x: 400, y: 200 });
  };

  const handleApplyShadowReadRollout = () => {
    setIsRolloutDraftDirty(false);
    onShadowReadRolloutConfigChange?.({
      mode: rolloutModeDraft,
      percentage: canaryPercentageDraft,
      trendWindow: trendWindowDraft,
    });
  };

  const handleApplyShadowReadPreset = (config: HybridShadowReadRolloutConfig) => {
    setIsRolloutDraftDirty(false);
    setRolloutModeDraft(config.mode);
    setCanaryPercentageDraft(config.percentage);
    setTrendWindowDraft(config.trendWindow);
    onShadowReadRolloutConfigChange?.(config);
  };

  const activePresetId = diagnostics?.shadowReadActivePresetId ?? 'custom';

  const handleTreeUpdate = useCallback(
    (nextState: { translate: { x: number; y: number }; zoom: number }) => {
      setTranslate(prev =>
        Math.abs(prev.x - nextState.translate.x) < 0.5 &&
        Math.abs(prev.y - nextState.translate.y) < 0.5
          ? prev
          : nextState.translate
      );
      setZoom(prev => (Math.abs(prev - nextState.zoom) < 0.001 ? prev : nextState.zoom));
    },
    []
  );

  return (
    <div className="memory-tree-container" ref={containerRef}>
      {selectedEntryId && (
        <div
          className="memory-tree-selection-state"
          data-testid="memory-tree-selection-state"
        >
          Entree synchronisee: {selectedEntryId}
        </div>
      )}

      {hasPersistentTree && !isBootstrappingMemory && diagnostics && (
        <div
          className="memory-tree-hybrid-diagnostics"
          data-testid="memory-hybrid-diagnostics"
        >
          <strong>Mode hybride mémoire</strong>
          <div className="memory-tree-hybrid-diagnostics-grid">
            <span data-testid="memory-hybrid-shadow-write-state">
              Shadow write: {diagnostics.shadowWriteEnabled ? 'actif' : 'inactif'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-state">
              Shadow read:{' '}
              {diagnostics.shadowReadEnabled
                ? diagnostics.lastShadowReadStatus
                : 'inactif'}
            </span>
            <span data-testid="memory-hybrid-shadow-write-count">
              Ecritures dupliquees: {diagnostics.shadowWriteCount}
            </span>
            <span data-testid="memory-hybrid-shadow-read-count">
              Lectures de controle: {diagnostics.shadowReadCount}
            </span>
            <span data-testid="memory-hybrid-orchestration-state">
              Orchestration hybride:{' '}
              {diagnostics.hybridOrchestrationEnabled
                ? diagnostics.lastHybridOrchestrationStatus
                : 'inactive'}
            </span>
            <span data-testid="memory-hybrid-orchestration-count">
              Complements injectes: {diagnostics.lastHybridOrchestrationCount}
            </span>
            <span data-testid="memory-hybrid-orchestration-preview">
              Apercu orchestration:{' '}
              {diagnostics.lastHybridOrchestrationPreview.join(' | ') || 'aucun'}
            </span>
            <span data-testid="memory-hybrid-orchestration-reason">
              Raison orchestration: {diagnostics.lastHybridOrchestrationReason}
            </span>
            <span data-testid="memory-hybrid-shadow-read-rollout-mode">
              Rollout shadow read: {diagnostics.shadowReadRolloutMode}
            </span>
            <span data-testid="memory-hybrid-shadow-read-active-preset">
              Preset actif: {diagnostics.shadowReadActivePresetLabel}
            </span>
            <span data-testid="memory-hybrid-shadow-read-canary-state">
              Canari: {diagnostics.shadowReadCanaryEligible ? 'eligible' : 'hors-cible'}
              {diagnostics.shadowReadCanaryBucket !== null
                ? ` (${diagnostics.shadowReadCanaryBucket}/${diagnostics.shadowReadCanaryPercentage})`
                : ''}
            </span>
            <span data-testid="memory-hybrid-shadow-read-canary-reason">
              Raison canari: {diagnostics.shadowReadCanaryReason}
            </span>
            <span data-testid="memory-hybrid-shadow-read-canary-operator-hint">
              Action: {diagnostics.shadowReadCanaryOperatorHint}
            </span>
            <span data-testid="memory-hybrid-shadow-read-canary-query-preview">
              Requete canari: {diagnostics.shadowReadCanaryQueryPreview ?? 'aucune'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-preset-history">
              Historique presets:{' '}
              {hybridPresetHistory.length > 0
                ? hybridPresetHistory
                    .map(
                      entry =>
                        `${entry.fromPresetLabel} -> ${entry.toPresetLabel} (${entry.source})`
                    )
                    .join(' | ')
                : 'aucun'}
            </span>
            {(onShadowReadRolloutConfigChange || onShadowReadProbeRequest) && (
              <div
                className="memory-hybrid-shadow-read-rollout-controls"
                data-testid="memory-hybrid-shadow-read-rollout-controls"
              >
                <div
                  className="memory-hybrid-shadow-read-rollout-presets"
                  data-testid="memory-hybrid-shadow-read-rollout-presets"
                >
                  {SHADOW_READ_ROLLOUT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`memory-hybrid-shadow-read-action${activePresetId === preset.id ? ' memory-hybrid-shadow-read-action-active' : ''}`}
                      data-testid={`memory-hybrid-shadow-read-rollout-preset-${preset.id}`}
                      onClick={() => handleApplyShadowReadPreset(preset.config)}
                      disabled={isShadowReadRolloutBusy}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <label className="memory-hybrid-shadow-read-control">
                  <span>Mode</span>
                  <select
                    data-testid="memory-hybrid-shadow-read-rollout-mode-select"
                    value={rolloutModeDraft}
                    onChange={event => {
                      setIsRolloutDraftDirty(true);
                      setRolloutModeDraft(event.target.value as 'full' | 'canary');
                    }}
                    disabled={isShadowReadRolloutBusy}
                  >
                    <option value="full">full</option>
                    <option value="canary">canary</option>
                  </select>
                </label>
                <label className="memory-hybrid-shadow-read-control">
                  <span>Canari %</span>
                  <select
                    data-testid="memory-hybrid-shadow-read-canary-percentage-select"
                    value={String(canaryPercentageDraft)}
                    onChange={event => {
                      setIsRolloutDraftDirty(true);
                      setCanaryPercentageDraft(Number(event.target.value));
                    }}
                    disabled={isShadowReadRolloutBusy}
                  >
                    {[0, 10, 25, 50, 100].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="memory-hybrid-shadow-read-control">
                  <span>Fenetre</span>
                  <select
                    data-testid="memory-hybrid-shadow-read-trend-window-select"
                    value={String(trendWindowDraft)}
                    onChange={event => {
                      setIsRolloutDraftDirty(true);
                      setTrendWindowDraft(Number(event.target.value));
                    }}
                    disabled={isShadowReadRolloutBusy}
                  >
                    {[6, 8, 10, 12, 16, 20].map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="memory-hybrid-shadow-read-rollout-actions">
                  {onShadowReadRolloutConfigChange && (
                    <button
                      type="button"
                      className="memory-hybrid-shadow-read-action"
                      data-testid="memory-hybrid-shadow-read-rollout-apply"
                      onClick={handleApplyShadowReadRollout}
                      disabled={isShadowReadRolloutBusy}
                    >
                      {isShadowReadRolloutBusy ? 'Application…' : 'Appliquer'}
                    </button>
                  )}
                  {onShadowReadProbeRequest && (
                    <button
                      type="button"
                      className="memory-hybrid-shadow-read-action"
                      data-testid="memory-hybrid-shadow-read-rollout-probe"
                      onClick={() => {
                        setIsRolloutDraftDirty(false);
                        onShadowReadProbeRequest();
                      }}
                      disabled={isShadowReadRolloutBusy}
                    >
                      {isShadowReadRolloutBusy ? 'Probe…' : 'Tester maintenant'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <span data-testid="memory-hybrid-shadow-read-sample">
              Echantillon shadow: {diagnostics.lastShadowReadSampleCount}
            </span>
            <span data-testid="memory-hybrid-shadow-read-total">
              Total UnifiedMemory: {diagnostics.lastShadowReadTotalMemories}
            </span>
            <span data-testid="memory-hybrid-shadow-read-coverage">
              Recouvrement canonique: {hybridCoveragePercent}%
            </span>
            <span data-testid="memory-hybrid-shadow-read-average-similarity">
              Similarite moyenne: {hybridAverageSimilarityPercent}%
            </span>
            <span data-testid="memory-hybrid-shadow-read-average-score">
              Score retrieval moyen: {hybridAverageRetrievalScorePercent}%
            </span>
            <span data-testid="memory-hybrid-shadow-read-composite-score">
              Score compose: {hybridCompositeScorePercent}%
            </span>
            <span data-testid="memory-hybrid-shadow-read-qualification">
              Qualification: {hybridQualificationLabel}
            </span>
            <span data-testid="memory-hybrid-shadow-read-delta">
              Manquants: {diagnostics.lastShadowReadMissingCount} | Surplus:{' '}
              {diagnostics.lastShadowReadExtraCount}
            </span>
            <span data-testid="memory-hybrid-shadow-read-canonical-preview">
              Canonique:{' '}
              {diagnostics.lastShadowReadCanonicalPreview.join(' | ') || 'aucun'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-unified-preview">
              UnifiedMemory:{' '}
              {diagnostics.lastShadowReadUnifiedPreview.join(' | ') || 'aucun'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-matched-pairs">
              Paires:{' '}
              {hybridMatchedPairs.length > 0
                ? hybridMatchedPairs
                    .map(
                      pair =>
                        `${pair.canonicalLabel} -> ${pair.unifiedLabel} (${Math.round(pair.similarity * 100)}%)`
                    )
                    .join(' | ')
                : 'aucune'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-history">
              Historique:{' '}
              {hybridRecentQualifications.length > 0
                ? hybridRecentQualifications
                    .map(
                      entry =>
                        `${entry.qualification}:${Math.round(entry.compositeScore * 100)}%`
                    )
                    .join(' | ')
                : 'aucun'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-trend-summary">
              Tendance {diagnostics.lastShadowReadTrendSummary.windowSize}: pret{' '}
              {diagnostics.lastShadowReadTrendSummary.readyCount} | partiel{' '}
              {diagnostics.lastShadowReadTrendSummary.partialCount} | insuffisant{' '}
              {diagnostics.lastShadowReadTrendSummary.insufficientCount} | score moyen{' '}
              {hybridTrendSummaryPercent}%
            </span>
            <span data-testid="memory-hybrid-shadow-read-extended-trend">
              Fenetre etendue:{' '}
              {hybridExtendedTrend.length > 0
                ? hybridExtendedTrend
                    .map(
                      entry =>
                        `${entry.qualification}:${Math.round(entry.compositeScore * 100)}%`
                    )
                    .join(' | ')
                : 'aucune'}
            </span>
            <div
              className="memory-hybrid-shadow-read-history-chart"
              data-testid="memory-hybrid-shadow-read-history-chart"
            >
              {hybridHistoryPoints.length > 0 ? (
                <>
                  <svg
                    className="memory-hybrid-history-sparkline"
                    data-testid="memory-hybrid-shadow-read-history-sparkline"
                    viewBox="0 0 180 48"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      className="memory-hybrid-history-line"
                      points={hybridHistoryPolyline}
                    />
                    {hybridHistoryPoints.map(point => (
                      <circle
                        key={`${point.label}-${point.x}`}
                        className={`memory-hybrid-history-point memory-hybrid-history-point-${point.qualification}`}
                        data-testid="memory-hybrid-shadow-read-history-point"
                        cx={point.x}
                        cy={point.y}
                        r="3"
                      />
                    ))}
                  </svg>
                  <div
                    className="memory-hybrid-history-axis"
                    data-testid="memory-hybrid-shadow-read-history-axis"
                  >
                    {hybridHistoryPoints.map(point => (
                      <span key={`${point.label}-${point.scoreLabel}`}>
                        {point.label} {point.scoreLabel}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <span className="memory-hybrid-history-empty">aucun</span>
              )}
            </div>
            <span data-testid="memory-hybrid-shadow-read-query">
              Requete: {diagnostics.lastShadowReadQuery ?? 'aucune'}
            </span>
            <span data-testid="memory-hybrid-shadow-read-error">
              Derniere erreur: {diagnostics.lastError ?? 'aucune'}
            </span>
            <div
              className="memory-hybrid-shadow-read-pairs-list"
              data-testid="memory-hybrid-shadow-read-pairs-list"
            >
              {hybridMatchedPairs.length > 0 ? (
                hybridMatchedPairs.map((pair, index) => (
                  <div
                    key={`${pair.canonicalLabel}-${index}`}
                    className="memory-hybrid-shadow-read-row"
                    data-testid="memory-hybrid-shadow-read-pair-row"
                  >
                    <strong>{pair.canonicalLabel}</strong>
                    <span>{pair.unifiedLabel}</span>
                    <span>{Math.round(pair.similarity * 100)}%</span>
                  </div>
                ))
              ) : (
                <span className="memory-hybrid-shadow-read-empty">aucune paire</span>
              )}
            </div>
            <div
              className="memory-hybrid-shadow-read-near-list"
              data-testid="memory-hybrid-shadow-read-near-matches"
            >
              {hybridNearMatches.length > 0 ? (
                hybridNearMatches.map((item, index) => (
                  <div
                    key={`${item.canonicalLabel}-${index}`}
                    className="memory-hybrid-shadow-read-row memory-hybrid-shadow-read-row-near"
                    data-testid="memory-hybrid-shadow-read-near-row"
                  >
                    <strong>{item.canonicalLabel}</strong>
                    <span>{item.unifiedLabel}</span>
                    <span>Similarite: {Math.round(item.similarity * 100)}%</span>
                    <span>Ecart au seuil: {Math.round(item.gapToThreshold * 100)}%</span>
                  </div>
                ))
              ) : (
                <span className="memory-hybrid-shadow-read-empty">
                  aucune quasi-correspondance
                </span>
              )}
            </div>
            <div
              className="memory-hybrid-shadow-read-near-stability-list"
              data-testid="memory-hybrid-shadow-read-near-stability"
            >
              {hybridNearMatchStability.length > 0 ? (
                hybridNearMatchStability.map((item, index) => (
                  <div
                    key={`${item.canonicalLabel}-${index}`}
                    className="memory-hybrid-shadow-read-row memory-hybrid-shadow-read-row-stability"
                    data-testid="memory-hybrid-shadow-read-near-stability-row"
                  >
                    <strong>{item.canonicalLabel}</strong>
                    <span>{item.unifiedLabel}</span>
                    <span>Stabilite: {item.stability}</span>
                    <span>
                      Occurrences: {item.seenCount}/{item.observationWindow}
                    </span>
                    <span>
                      Similarite moyenne: {Math.round(item.averageSimilarity * 100)}%
                    </span>
                  </div>
                ))
              ) : (
                <span className="memory-hybrid-shadow-read-empty">
                  aucune stabilite exploitable
                </span>
              )}
            </div>
            <div
              className="memory-hybrid-shadow-read-missing-list"
              data-testid="memory-hybrid-shadow-read-missing-list"
            >
              {hybridMissingReasons.length > 0 ? (
                hybridMissingReasons.map((item, index) => (
                  <div
                    key={`${item.canonicalLabel}-${index}`}
                    className="memory-hybrid-shadow-read-row memory-hybrid-shadow-read-row-missing"
                    data-testid="memory-hybrid-shadow-read-missing-row"
                  >
                    <strong>{item.canonicalLabel}</strong>
                    <span
                      className={`memory-hybrid-missing-priority memory-hybrid-missing-priority-${item.priority}`}
                    >
                      {item.priority}
                    </span>
                    <span>{item.bestUnifiedLabel ?? 'aucun candidat'}</span>
                    <span>{item.reason}</span>
                    <span>Ecart au seuil: {Math.round(item.gapToThreshold * 100)}%</span>
                  </div>
                ))
              ) : (
                <span className="memory-hybrid-shadow-read-empty">
                  aucun manque critique
                </span>
              )}
            </div>
            {diagnostics.lastShadowReadMissingLabels.length > 0 && (
              <span data-testid="memory-hybrid-shadow-read-missing-labels">
                Libelles absents: {diagnostics.lastShadowReadMissingLabels.join(', ')}
              </span>
            )}
            {diagnostics.lastShadowReadExtraLabels.length > 0 && (
              <span data-testid="memory-hybrid-shadow-read-extra-labels">
                Libelles en surplus: {diagnostics.lastShadowReadExtraLabels.join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {hasPersistentTree && !isBootstrappingMemory && (
        <div className="memory-tree-toolbar">
          {/* Search */}
          <div className="memory-tree-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher dans la mémoire..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filter */}
          <select
            className="memory-tree-filter"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="all">Tous types</option>
            <option value="short">Court terme</option>
            <option value="mid">Moyen terme</option>
            <option value="long">Long terme</option>
          </select>

          {/* Zoom controls */}
          <div className="memory-tree-controls">
            <button onClick={handleZoomOut} title="Zoom arrière">
              <ZoomOut size={16} />
            </button>
            <button onClick={handleZoomIn} title="Zoom avant">
              <ZoomIn size={16} />
            </button>
            <button onClick={handleReset} title="Réinitialiser">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tree visualization */}
      <div className="memory-tree-canvas">
        {!hasPersistentTree ? (
          isBootstrappingMemory ? (
            <div className="memory-tree-empty-state" role="status">
              <strong>Chargement de l&apos;arbre mémoire</strong>
              <span>TITANE reconstruit actuellement la hiérarchie persistante.</span>
            </div>
          ) : (
            <div className="memory-tree-empty-state" role="status">
              <strong>Aucune entrée mémoire disponible</strong>
              <span>
                L&apos;arbre s&apos;activera dès qu&apos;une entrée réelle sera présente.
              </span>
            </div>
          )
        ) : !hasFilteredTree ? (
          <div className="memory-tree-empty-state" role="status">
            Aucun nœud ne correspond aux filtres actifs
          </div>
        ) : (
          <Tree
            data={treeData ?? undefined}
            dimensions={dimensions}
            translate={translate}
            zoom={zoom}
            onUpdate={handleTreeUpdate}
            orientation="vertical"
            pathFunc="step"
            renderCustomNodeElement={renderCustomNode}
            nodeSize={{ x: 200, y: 150 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            enableLegacyTransitions
            transitionDuration={300}
          />
        )}
      </div>

      {hasPersistentTree && !isBootstrappingMemory && (
        <div className="memory-tree-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }} />
            <span>Court terme</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }} />
            <span>Moyen terme</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#8b5cf6' }} />
            <span>Long terme</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Get node color based on type
function getNodeColor(node: MemoryTreeNodeData): string {
  const type = node.attributes?.type || 'mid';

  switch (type) {
    case 'short':
      return '#10b981';
    case 'mid':
      return '#3b82f6';
    case 'long':
      return '#8b5cf6';
    default:
      return '#64748b';
  }
}

// Get node icon
function getNodeIcon(node: MemoryTreeNodeData): string {
  const type = node.attributes?.type || 'mid';

  switch (type) {
    case 'short':
      return '⚡';
    case 'mid':
      return '🧠';
    case 'long':
      return '💎';
    default:
      return '📝';
  }
}

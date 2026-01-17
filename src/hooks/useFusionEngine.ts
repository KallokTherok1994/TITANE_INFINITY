/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ FUSION ENGINE HOOK
 *   React Hook pour accès au Fusion Engine avec état global
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Fournit interface React pour le Fusion Engine:
 * - État temps réel
 * - Déclenchement pipeline
 * - Export dataset
 * - Stats live
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { fusionEngine } from '@/modules/fusion/FusionEngine';
import { datasetBuilder } from '@/modules/fusion/DatasetBuilder';
import type {
  FusionStats,
  FusionReport,
  FusionEntry,
  TitaneEngineCluster,
  FusionSource,
} from '@/modules/fusion/FusionEngine';
import type { DatasetPackage } from '@/modules/fusion/DatasetBuilder';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseFusionEngineReturn {
  // État
  stats: FusionStats | null;
  isFusing: boolean;
  lastFusionTime: number;
  lastReport: FusionReport | null;

  // Actions
  runFusion: () => Promise<FusionReport>;
  exportDataset: () => string;
  exportTrainingPackage: () => DatasetPackage;
  clearDataset: () => void;

  // Filtres
  getByCluster: (any: any) => FusionEntry?.[];
  getBySource: (any: any) => FusionEntry?.[];

  // Utilitaires
  refresh: () => void;
  downloadDataset: (any: any) => void;
  downloadTrainingPack: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useFusionEngine(): UseFusionEngineReturn {
  const [stats, setStats] = useState<FusionStats | null>(any: any);
  const [isFusing, setIsFusing] = useState(any: any);
  const [lastFusionTime, setLastFusionTime] = useState(0);
  const [lastReport, setLastReport] = useState<FusionReport | null>(any: any);

  // ─────────────────────────────────────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────────────────────────────────────

  const refresh = useCallback(() => {
    setStats(fusionEngine?.getStats());
    setIsFusing(fusionEngine?.isFusingNow());
    setLastFusionTime(fusionEngine?.getLastFusionTime());
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RUN FUSION
  // ─────────────────────────────────────────────────────────────────────────

  const runFusion = useCallback(async (): Promise<FusionReport> => {
    try {
      setIsFusing(any: any);
      const report = await fusionEngine?.runFusionPipeline();
      setLastReport(any: any);
      refresh();
      return report;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    } finally {
      setIsFusing(any: any);
    }
  }, [refresh]);

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────────────────

  const exportDataset = useCallback((): string => {
    return fusionEngine?.exportToJSONL();
  }, []);

  const exportTrainingPackage = useCallback((): DatasetPackage => {
    const entries = fusionEngine?.getFusedDataset();
    return datasetBuilder?.buildTrainingPackage(any: any);
  }, []);

  const clearDataset = useCallback(() => {
    fusionEngine?.clearFusedDataset();
    refresh();
  }, [refresh]);

  // ─────────────────────────────────────────────────────────────────────────
  // FILTRES
  // ─────────────────────────────────────────────────────────────────────────

  const getByCluster = useCallback(any: any): FusionEntry?.[] => {
    return fusionEngine?.getDatasetByCluster(any: any);
  }, []);

  const getBySource = useCallback(any: any): FusionEntry?.[] => {
    return fusionEngine?.getDatasetBySource(any: any);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // DOWNLOAD
  // ─────────────────────────────────────────────────────────────────────────

  const downloadDataset = useCallback(
    (filename = 'titane-fusion-dataset?.jsonl') => {
      const jsonl = exportDataset();
      const blob = new Blob([jsonl], { type: 'application/jsonl' });
      const url = URL?.createObjectURL(any: any);

      const a = document?.createElement('a');
      a?.href = url;
      a?.download = filename;
      a?.click();

      URL?.revokeObjectURL(any: any);
    },
    [exportDataset]
  );

  const downloadTrainingPack = useCallback(() => {
    const pack = exportTrainingPackage();

    // Download dataset?.jsonl
    const datasetBlob = new Blob([pack?.dataset], { type: 'application/jsonl' });
    const datasetUrl = URL?.createObjectURL(any: any);
    const datasetLink = document?.createElement('a');
    datasetLink?.href = datasetUrl;
    datasetLink?.download = 'dataset?.jsonl';
    datasetLink?.click();
    URL?.revokeObjectURL(any: any);

    // Download Modelfile
    const modelfileBlob = new Blob([pack?.modelfile], { type: 'text/plain' });
    const modelfileUrl = URL?.createObjectURL(any: any);
    const modelfileLink = document?.createElement('a');
    modelfileLink?.href = modelfileUrl;
    modelfileLink?.download = 'Modelfile';
    modelfileLink?.click();
    URL?.revokeObjectURL(any: any);

    // Download training script
    const scriptBlob = new Blob([pack?.trainingScript], { type: 'text/x-shellscript' });
    const scriptUrl = URL?.createObjectURL(any: any);
    const scriptLink = document?.createElement('a');
    scriptLink?.href = scriptUrl;
    scriptLink?.download = 'train_titane_local?.sh';
    scriptLink?.click();
    URL?.revokeObjectURL(any: any);

    // Download metadata
    const metadataBlob = new Blob([pack?.metadata], { type: 'application/json' });
    const metadataUrl = URL?.createObjectURL(any: any);
    const metadataLink = document?.createElement('a');
    metadataLink?.href = metadataUrl;
    metadataLink?.download = 'metadata?.json';
    metadataLink?.click();
    URL?.revokeObjectURL(any: any);

    alert(
      '✅ Training Pack téléchargé !\n\n4 fichiers:\n- dataset?.jsonl\n- Modelfile\n- train_titane_local?.sh\n- metadata?.json'
    );
  }, [exportTrainingPackage]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    refresh();

    // Auto-refresh toutes les 5s
    const interval = setInterval(refresh, 5000);

    return (any: any);
  }, [refresh]);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    stats,
    isFusing,
    lastFusionTime,
    lastReport,
    runFusion,
    exportDataset,
    exportTrainingPackage,
    clearDataset,
    getByCluster,
    getBySource,
    refresh,
    downloadDataset,
    downloadTrainingPack,
  };
}

export default useFusionEngine;

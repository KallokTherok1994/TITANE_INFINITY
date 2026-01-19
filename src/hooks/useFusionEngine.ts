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
  getByCluster: (cluster: TitaneEngineCluster) => FusionEntry[];
  getBySource: (source: FusionSource) => FusionEntry[];

  // Utilitaires
  refresh: () => void;
  downloadDataset: (filename?: string) => void;
  downloadTrainingPack: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useFusionEngine(): UseFusionEngineReturn {
  const [stats, setStats] = useState<FusionStats | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [lastFusionTime, setLastFusionTime] = useState(0);
  const [lastReport, setLastReport] = useState<FusionReport | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────────────────────────────────────

  const refresh = useCallback(() => {
    setStats(fusionEngine.getStats());
    setIsFusing(fusionEngine.isFusingNow());
    setLastFusionTime(fusionEngine.getLastFusionTime());
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RUN FUSION
  // ─────────────────────────────────────────────────────────────────────────

  const runFusion = useCallback(async (): Promise<FusionReport> => {
    try {
      setIsFusing(true);
      const report = await fusionEngine.runFusionPipeline();
      setLastReport(report);
      refresh();
      return report;
    } catch (error) {
      console.error('[useFusionEngine] Fusion failed:', error);
      throw error;
    } finally {
      setIsFusing(false);
    }
  }, [refresh]);

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT
  // ─────────────────────────────────────────────────────────────────────────

  const exportDataset = useCallback((): string => {
    return fusionEngine.exportToJSONL();
  }, []);

  const exportTrainingPackage = useCallback((): DatasetPackage => {
    const entries = fusionEngine.getFusedDataset();
    return datasetBuilder.buildTrainingPackage(entries);
  }, []);

  const clearDataset = useCallback(() => {
    fusionEngine.clearFusedDataset();
    refresh();
  }, [refresh]);

  // ─────────────────────────────────────────────────────────────────────────
  // FILTRES
  // ─────────────────────────────────────────────────────────────────────────

  const getByCluster = useCallback((cluster: TitaneEngineCluster): FusionEntry[] => {
    return fusionEngine.getDatasetByCluster(cluster);
  }, []);

  const getBySource = useCallback((source: FusionSource): FusionEntry[] => {
    return fusionEngine.getDatasetBySource(source);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // DOWNLOAD
  // ─────────────────────────────────────────────────────────────────────────

  const downloadDataset = useCallback(
    (filename = 'titane-fusion-dataset.jsonl') => {
      const jsonl = exportDataset();
      const blob = new Blob([jsonl], { type: 'application/jsonl' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
    },
    [exportDataset]
  );

  const downloadTrainingPack = useCallback(() => {
    const pack = exportTrainingPackage();

    // Download dataset.jsonl
    const datasetBlob = new Blob([pack.dataset], { type: 'application/jsonl' });
    const datasetUrl = URL.createObjectURL(datasetBlob);
    const datasetLink = document.createElement('a');
    datasetLink.href = datasetUrl;
    datasetLink.download = 'dataset.jsonl';
    datasetLink.click();
    URL.revokeObjectURL(datasetUrl);

    // Download Modelfile
    const modelfileBlob = new Blob([pack.modelfile], { type: 'text/plain' });
    const modelfileUrl = URL.createObjectURL(modelfileBlob);
    const modelfileLink = document.createElement('a');
    modelfileLink.href = modelfileUrl;
    modelfileLink.download = 'Modelfile';
    modelfileLink.click();
    URL.revokeObjectURL(modelfileUrl);

    // Download training script
    const scriptBlob = new Blob([pack.trainingScript], { type: 'text/x-shellscript' });
    const scriptUrl = URL.createObjectURL(scriptBlob);
    const scriptLink = document.createElement('a');
    scriptLink.href = scriptUrl;
    scriptLink.download = 'train_titane_local.sh';
    scriptLink.click();
    URL.revokeObjectURL(scriptUrl);

    // Download metadata
    const metadataBlob = new Blob([pack.metadata], { type: 'application/json' });
    const metadataUrl = URL.createObjectURL(metadataBlob);
    const metadataLink = document.createElement('a');
    metadataLink.href = metadataUrl;
    metadataLink.download = 'metadata.json';
    metadataLink.click();
    URL.revokeObjectURL(metadataUrl);

    alert(
      '✅ Training Pack téléchargé !\n\n4 fichiers:\n- dataset.jsonl\n- Modelfile\n- train_titane_local.sh\n- metadata.json'
    );
  }, [exportTrainingPackage]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    refresh();

    // Auto-refresh toutes les 5s
    const interval = setInterval(refresh, 5000);

    return () => clearInterval(interval);
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

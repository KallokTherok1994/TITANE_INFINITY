/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.2 — USE DEVICE HEALTH HOOK
 *
 *   Hook React pour la surveillance et l'auto-réparation des périphériques
 *
 *   Usage:
 *   ```tsx
 *   const { report, isHealthy, isScanning, scan, repair, selfHeal } = useDeviceHealth();
 *   ```
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  deviceHealthService,
  type SystemHealthReport,
  type SelfHealingReport,
  type RepairResult,
} from '@/services/devices/deviceHealthService';
import { createLogger } from '@/utils/logger';

const logger = createLogger('DeviceHealth');

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface UseDeviceHealthReturn {
  // État
  report: SystemHealthReport | null;
  isScanning: boolean;
  isHealing: boolean;
  lastHealingResult: SelfHealingReport | null;

  // Statuts dérivés
  isHealthy: boolean;
  isDegraded: boolean;
  isCritical: boolean;

  // Actions
  scan: () => Promise<SystemHealthReport>;
  selfHeal: () => Promise<SelfHealingReport>;
  repairDevice: (deviceId: string) => Promise<RepairResult>;

  // Monitoring
  startMonitoring: (intervalMs?: number) => void;
  stopMonitoring: () => void;

  // Historique
  repairHistory: RepairResult[];
  clearHistory: () => void;
}

export interface UseDeviceHealthOptions {
  /** Scan automatique au montage */
  autoScan?: boolean;
  /** Monitoring automatique au montage */
  autoMonitor?: boolean;
  /** Intervalle de monitoring en ms */
  monitorInterval?: number;
  /** Auto-heal si critique */
  autoHealOnCritical?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useDeviceHealth(
  options: UseDeviceHealthOptions = {}
): UseDeviceHealthReturn {
  const {
    autoScan = true,
    autoMonitor = false,
    monitorInterval = 60000,
    autoHealOnCritical = true,
  } = options;

  // State
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [lastHealingResult, setLastHealingResult] = useState<SelfHealingReport | null>(
    null
  );
  const [repairHistory, setRepairHistory] = useState<RepairResult[]>([]);

  // Refs
  const mountedRef = useRef(true);
  const autoHealingRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // Actions
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lance l'auto-réparation complète
   */
  const selfHeal = useCallback(async (): Promise<SelfHealingReport> => {
    setIsHealing(true);
    try {
      const result = await deviceHealthService.selfHeal();
      if (mountedRef.current) {
        setLastHealingResult(result);
        setRepairHistory(deviceHealthService.getRepairHistory());
        // Re-scan après healing
        const newReport = await deviceHealthService.scanAll();
        setReport(newReport);
      }
      return result;
    } finally {
      if (mountedRef.current) {
        setIsHealing(false);
      }
    }
  }, []);

  /**
   * Scanne tous les périphériques
   */
  const scan = useCallback(async (): Promise<SystemHealthReport> => {
    setIsScanning(true);
    try {
      const result = await deviceHealthService.scanAll();
      if (mountedRef.current) {
        setReport(result);

        // Auto-heal si critique et option activée
        if (
          autoHealOnCritical &&
          result.overallStatus === 'critical' &&
          !autoHealingRef.current
        ) {
          autoHealingRef.current = true;
          logger.info('Critical status, auto-healing...');
          await selfHeal();
          autoHealingRef.current = false;
        }
      }
      return result;
    } finally {
      if (mountedRef.current) {
        setIsScanning(false);
      }
    }
  }, [autoHealOnCritical, selfHeal]);

  /**
   * Répare un périphérique spécifique
   */
  const repairDevice = useCallback(
    async (deviceId: string): Promise<RepairResult> => {
      setIsHealing(true);
      try {
        const result = await deviceHealthService.repairDevice(deviceId);
        if (mountedRef.current) {
          setRepairHistory(deviceHealthService.getRepairHistory());
          // Re-scan après réparation
          await scan();
        }
        return result;
      } finally {
        if (mountedRef.current) {
          setIsHealing(false);
        }
      }
    },
    [scan]
  );

  /**
   * Démarre le monitoring
   */
  const startMonitoring = useCallback(
    (intervalMs: number = monitorInterval) => {
      deviceHealthService.startMonitoring(intervalMs);
    },
    [monitorInterval]
  );

  /**
   * Arrête le monitoring
   */
  const stopMonitoring = useCallback(() => {
    deviceHealthService.stopMonitoring();
  }, []);

  /**
   * Vide l'historique
   */
  const clearHistory = useCallback(() => {
    deviceHealthService.clearRepairHistory();
    setRepairHistory([]);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Effects
  // ═══════════════════════════════════════════════════════════════════════════

  // Initialisation
  useEffect(() => {
    mountedRef.current = true;

    // S'abonner aux changements
    const unsubscribe = deviceHealthService.subscribe(newReport => {
      if (mountedRef.current) {
        setReport(newReport);
      }
    });

    // Charger l'historique existant
    setRepairHistory(deviceHealthService.getRepairHistory());

    // Auto-scan si demandé
    if (autoScan) {
      scan();
    }

    // Auto-monitor si demandé
    if (autoMonitor) {
      deviceHealthService.startMonitoring(monitorInterval);
    }

    return () => {
      mountedRef.current = false;
      unsubscribe();
      if (autoMonitor) {
        deviceHealthService.stopMonitoring();
      }
    };
  }, [autoScan, autoMonitor, monitorInterval, scan]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Derived State
  // ═══════════════════════════════════════════════════════════════════════════

  const isHealthy = report?.overallStatus === 'healthy';
  const isDegraded = report?.overallStatus === 'degraded';
  const isCritical = report?.overallStatus === 'critical';

  return {
    // État
    report,
    isScanning,
    isHealing,
    lastHealingResult,

    // Statuts
    isHealthy,
    isDegraded,
    isCritical,

    // Actions
    scan,
    selfHeal,
    repairDevice,

    // Monitoring
    startMonitoring,
    stopMonitoring,

    // Historique
    repairHistory,
    clearHistory,
  };
}

export default useDeviceHealth;

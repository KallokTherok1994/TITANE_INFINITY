/**
 * TITANE∞ — Cognitive Layout Service (Ring 3)
 * Wrapper I/O pour CognitiveLayoutEngine (Ring 2)
 *
 * ARCHITECTURE:
 * - CognitiveLayoutEngine (Ring 2) = Pure logic UI/UX
 * - CognitiveLayoutService (Ring 3) = I/O Helios, Nexus, localStorage
 */

import { secureInvoke } from '@/lib/security';

/**
 * État Helios (système)
 */
export interface HeliosState {
  energyScore: number;
  fatigueDetected: boolean;
  regularity: number;
}

/**
 * État Nexus (réseau)
 */
export interface NexusState {
  isConnected: boolean;
  latency: number;
  bandwidth: number;
}

/**
 * Service Cognitive Layout — Opérations I/O
 */
export class CognitiveLayoutService {
  /**
   * Obtenir état système Helios
   */
  static async getHeliosState(): Promise<HeliosState> {
    try {
      const heliosData = await secureInvoke<{
        cpu_usage: number;
        ram_usage: number;
        uptime_seconds: number;
        timestamp: number;
      }>('get_helios_state');

      if (heliosData) {
        const cpuScore = Math.max(0, 1 - heliosData.cpu_usage / 100);
        const ramScore = Math.max(0, 1 - heliosData.ram_usage / 100);
        const energyScore = (cpuScore + ramScore) / 2;

        return {
          energyScore,
          fatigueDetected: energyScore < 0.4,
          regularity: Math.min(heliosData.uptime_seconds / 3600, 1),
        };
      }

      return { energyScore: 0.7, fatigueDetected: false, regularity: 0.5 };
    } catch {
      return { energyScore: 0.7, fatigueDetected: false, regularity: 0.5 };
    }
  }

  /**
   * Obtenir état réseau Nexus
   */
  static async getNexusState(): Promise<NexusState> {
    try {
      const nexusData = await secureInvoke<{
        is_connected: boolean;
        latency_ms: number;
        bandwidth_mbps: number;
      }>('get_nexus_state');

      if (nexusData) {
        return {
          isConnected: nexusData.is_connected,
          latency: nexusData.latency_ms,
          bandwidth: nexusData.bandwidth_mbps,
        };
      }

      return { isConnected: false, latency: 0, bandwidth: 0 };
    } catch {
      return { isConnected: false, latency: 0, bandwidth: 0 };
    }
  }

  /**
   * Sauvegarder préférences layout (localStorage)
   */
  static saveLayoutPreferences(mode: string, preferences: unknown): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`cognitiveLayout_${mode}`, JSON.stringify(preferences));
    }
  }

  /**
   * Charger préférences layout (localStorage)
   */
  static loadLayoutPreferences(mode: string): unknown | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(`cognitiveLayout_${mode}`);
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}

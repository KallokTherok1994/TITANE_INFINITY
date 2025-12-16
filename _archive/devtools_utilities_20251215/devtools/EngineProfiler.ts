/**
 * TITANE∞ v20Ω — Engine Profiler
 * Profilage des moteurs cognitifs
 */

export interface EngineProfile {
  id: string;
  name: string;
  latencies: number[];
  avgLatency: number;
  maxLatency: number;
  minLatency: number;
  activationCount: number;
  errorCount: number;
  lastActivation: number | null;
}

/**
 * Profileur de moteurs
 */
export class EngineProfiler {
  private profiles: Map<string, EngineProfile> = new Map();
  private maxSamples = 100;

  /**
   * Enregistre une activation de moteur
   */
  record(engineId: string, latencyMs: number, isError = false): void {
    let profile = this.profiles.get(engineId);

    if (!profile) {
      profile = {
        id: engineId,
        name: this.formatEngineName(engineId),
        latencies: [],
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        activationCount: 0,
        errorCount: 0,
        lastActivation: null,
      };
      this.profiles.set(engineId, profile);
    }

    // Ajouter la latence
    profile.latencies.push(latencyMs);
    if (profile.latencies.length > this.maxSamples) {
      profile.latencies.shift();
    }

    // Mettre à jour les stats
    profile.activationCount++;
    if (isError) {
      profile.errorCount++;
    }
    profile.lastActivation = Date.now();

    // Recalculer les métriques
    profile.avgLatency =
      profile.latencies.reduce((a, b) => a + b, 0) / profile.latencies.length;
    profile.maxLatency = Math.max(...profile.latencies);
    profile.minLatency = Math.min(...profile.latencies);
  }

  /**
   * Formate le nom du moteur
   */
  private formatEngineName(id: string): string {
    return id
      .replace(/_/g, ' ')
      .replace(/engine/i, 'Engine')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Retourne le profil d'un moteur
   */
  getProfile(engineId: string): EngineProfile | null {
    return this.profiles.get(engineId) ?? null;
  }

  /**
   * Retourne tous les profils
   */
  getAllProfiles(): EngineProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Retourne les moteurs les plus lents
   */
  getSlowest(limit = 5): EngineProfile[] {
    return this.getAllProfiles()
      .sort((a, b) => b.avgLatency - a.avgLatency)
      .slice(0, limit);
  }

  /**
   * Retourne les moteurs avec le plus d'erreurs
   */
  getMostErrors(limit = 5): EngineProfile[] {
    return this.getAllProfiles()
      .filter(p => p.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);
  }

  /**
   * Retourne les moteurs les plus actifs
   */
  getMostActive(limit = 5): EngineProfile[] {
    return this.getAllProfiles()
      .sort((a, b) => b.activationCount - a.activationCount)
      .slice(0, limit);
  }

  /**
   * Calcule le taux d'erreur global
   */
  getGlobalErrorRate(): number {
    let totalActivations = 0;
    let totalErrors = 0;

    for (const profile of this.profiles.values()) {
      totalActivations += profile.activationCount;
      totalErrors += profile.errorCount;
    }

    if (totalActivations === 0) return 0;
    return totalErrors / totalActivations;
  }

  /**
   * Réinitialise un moteur
   */
  resetEngine(engineId: string): void {
    this.profiles.delete(engineId);
  }

  /**
   * Réinitialise tout
   */
  reset(): void {
    this.profiles.clear();
  }
}

export default EngineProfiler;

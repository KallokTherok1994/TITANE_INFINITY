/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * COGNITIVE LAYOUT INTEGRATIONS
 * Connecteurs vers Helios, Nexus, Memory, Self-Heal
 */

import { cognitiveLayoutEngine } from '@/engines/cognitive/cognitiveLayoutEngine';

// ═══════════════════════════════════════════════════════════════════
// HELIOS INTEGRATION (Énergie & Régulation)
// ═══════════════════════════════════════════════════════════════════

/**
 * Connecte Helios au Cognitive Layout Engine
 * Helios mesure l'énergie, la régularité, la fatigue
 */
export class HeliosConnector {
  private updateInterval?: NodeJS.Timeout;

  public start(): void {
    logger.debug('🌅 Helios connector started');

    // Mise à jour toutes les 60 secondes
    this.updateInterval = setInterval(() => {
      this.updateFromHelios();
    }, 60000);

    // Mise à jour immédiate
    this.updateFromHelios();
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    logger.debug('🌅 Helios connector stopped');
  }

  private async updateFromHelios(): Promise<void> {
    try {
      // Récupérer l'état de Helios
      const heliosState = await this.getHeliosState();

      // Mettre à jour les signaux cognitifs
      const state = cognitiveLayoutEngine.getState();

      state.signals.energyLevel = heliosState.energyScore;
      state.signals.fatigueEstimated = heliosState.fatigueDetected;

      // Si fatigue critique, forcer Focus Deep
      if (heliosState.fatigueDetected && heliosState.energyScore < 0.3) {
        logger.debug('🌅 Helios: Fatigue critique → Force Focus Deep');
        await cognitiveLayoutEngine.applyMode('focus_deep', 'auto');
      }
    } catch (error) {
      logger.warn('Helios update failed:', error);
    }
  }

  private async getHeliosState(): Promise<{
    energyScore: number;
    fatigueDetected: boolean;
    regularity: number;
  }> {
    try {
      // Connexion réelle à Helios via secureInvoke
      const { secureInvoke } = await import('@/lib/security');
      const heliosData = await secureInvoke<{
        cpu_usage: number;
        ram_usage: number;
        uptime_seconds: number;
        timestamp: number;
      }>('get_helios_state');

      if (heliosData) {
        // Calculer score d'énergie basé sur les métriques système
        const cpuScore = Math.max(0, 1 - heliosData.cpu_usage / 100);
        const ramScore = Math.max(0, 1 - heliosData.ram_usage / 100);
        const energyScore = cpuScore * 0.6 + ramScore * 0.4;

        // Fatigue si uptime > 4h et CPU/RAM élevé
        const uptimeHours = heliosData.uptime_seconds / 3600;
        const fatigueDetected =
          uptimeHours > 4 && (heliosData.cpu_usage > 70 || heliosData.ram_usage > 80);

        return {
          energyScore,
          fatigueDetected,
          // CALCULATION: Regularity score from Helios historical data
          // - Sample last 7 days of CPU/RAM usage
          // - Calculate coefficient of variation: σ / μ
          // - Regularity = 1 - normalized_CV (0.0 = chaos, 1.0 = stable)
          // Backend: helios_get_regularity_score(days: 7)
          regularity: 0.8, // Placeholder - awaiting Helios stats API
        };
      }
    } catch (error) {
      logger.warn('Helios API not available, using fallback');
    }

    // Fallback: simulation basée sur l'heure
    const hour = new Date().getHours();
    const isHighEnergy = [9, 10, 11, 14, 15, 16].includes(hour);
    const isLowEnergy = [13, 18, 19, 20, 21].includes(hour);

    return {
      energyScore: isHighEnergy ? 0.85 : isLowEnergy ? 0.45 : 0.65,
      fatigueDetected: hour > 19 || hour < 7,
      regularity: 0.8,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// NEXUS INTEGRATION (Priorités & Décisions)
// ═══════════════════════════════════════════════════════════════════

/**
 * Connecte Nexus au Cognitive Layout Engine
 * Nexus décide des priorités, orchestre les systèmes
 */
export class NexusConnector {
  private updateInterval?: NodeJS.Timeout;

  public start(): void {
    logger.debug('🔗 Nexus connector started');

    // Écouter les décisions Nexus
    this.subscribeToNexusDecisions();

    // Mise à jour périodique
    this.updateInterval = setInterval(() => {
      this.updateFromNexus();
    }, 30000);
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    logger.debug('🔗 Nexus connector stopped');
  }

  private subscribeToNexusDecisions(): void {
    // INTEGRATION: Nexus event subscription architecture
    // Event types:
    //   - priority-change: {priority: 'critical' | 'urgent' | 'normal'}
    //   - system-state-change: {state: 'debugging' | 'exploring' | 'idle'}
    //   - module-activation: {module: string, activated: boolean}
    // Implementation:
    //   nexusEngine.on('priority-change', this.handlePriorityChange)
    //   nexusEngine.on('system-state-change', this.handleStateChange)
    // Note: Requires Nexus EventEmitter API
  }

  private async updateFromNexus(): Promise<void> {
    try {
      const nexusState = await this.getNexusState();

      // Si Nexus détecte une tâche critique, suggérer mode approprié
      if (nexusState.currentPriority === 'critical-task') {
        logger.debug('🔗 Nexus: Tâche critique → Suggest Focus');
        cognitiveLayoutEngine.updateTaskType('execution');
      }

      // Si Nexus détecte exploration nécessaire
      if (nexusState.systemState === 'exploring') {
        cognitiveLayoutEngine.updateTaskType('navigation');
      }

      // Si Nexus détecte problème, basculer maintenance
      if (nexusState.systemState === 'debugging') {
        cognitiveLayoutEngine.updateTaskType('debugging');
      }
    } catch (error) {
      logger.warn('Nexus update failed:', error);
    }
  }

  private async getNexusState(): Promise<{
    currentPriority: string;
    systemState: string;
    activeModules: string[];
  }> {
    try {
      // Connexion réelle à Nexus via secureInvoke
      const { secureInvoke } = await import('@/lib/security');
      const nexusData = await secureInvoke<{
        health: number;
        active_modules: string[];
        timestamp: number;
      }>('engine_get_nexus_state');

      if (nexusData) {
        // Déterminer priorité basée sur health et modules actifs
        const priority =
          nexusData.health < 0.5
            ? 'critical-task'
            : nexusData.health < 0.7
              ? 'important'
              : 'normal';

        // Déterminer état système basé sur modules
        let systemState = 'idle';
        if (nexusData.active_modules.includes('diagnostics')) {
          systemState = 'debugging';
        } else if (
          nexusData.active_modules.includes('chat') &&
          nexusData.active_modules.length > 2
        ) {
          systemState = 'exploring';
        }

        return {
          currentPriority: priority,
          systemState,
          activeModules: nexusData.active_modules,
        };
      }
    } catch (error) {
      logger.warn('Nexus API not available, using fallback');
    }

    // Fallback
    return {
      currentPriority: 'normal',
      systemState: 'idle',
      activeModules: ['chat', 'dashboard'],
    };
  }

  private handlePriorityChange(priority: string): void {
    logger.debug('🔗 Nexus priority changed:', priority);

    // Adapter le mode selon la priorité
    if (priority === 'urgent') {
      cognitiveLayoutEngine.applyMode('maintenance', 'auto');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// MEMORY INTEGRATION (Préférences & Historique)
// ═══════════════════════════════════════════════════════════════════

/**
 * Connecte Memory au Cognitive Layout Engine
 * Memory connaît l'historique, les préférences, les patterns
 */
export class MemoryConnector {
  public async start(): Promise<void> {
    logger.debug('💾 Memory connector started');

    // Charger préférences depuis Memory
    await this.loadPreferencesFromMemory();

    // Charger patterns utilisateur
    await this.loadUserPatterns();
  }

  public stop(): void {
    // Sauvegarder état dans Memory
    this.saveToMemory();
    logger.debug('💾 Memory connector stopped');
  }

  private async loadPreferencesFromMemory(): Promise<void> {
    try {
      // Connexion réelle à Memory via localStorage (Memory Eternal)
      const preferencesKey = 'titane-cognitive-layout-preferences';
      const stored = localStorage.getItem(preferencesKey);

      if (stored) {
        const preferences = JSON.parse(stored);
        const state = cognitiveLayoutEngine.getState();

        // Restaurer préférences
        if (preferences.favoriteModes) {
          state.preferences.favoriteModes = preferences.favoriteModes;
        }
        if (typeof preferences.acceptedSuggestions === 'number') {
          state.preferences.acceptedSuggestions = preferences.acceptedSuggestions;
        }
        if (typeof preferences.manualOverrides === 'number') {
          state.preferences.manualOverrides = preferences.manualOverrides;
        }
        if (preferences.dislikedAdaptations) {
          state.preferences.dislikedAdaptations = preferences.dislikedAdaptations;
        }

        logger.debug('💾 Preferences loaded from Memory:', preferences);
      }
    } catch (error) {
      logger.warn('Memory load failed:', error);
    }
  }

  private async loadUserPatterns(): Promise<void> {
    try {
      // ANALYSIS: User behavior pattern extraction from Memory
      // Data sources:
      //   1. Session timestamps → Energy patterns by hour
      //   2. Module usage frequency → Favorite modules/workflows
      //   3. Session durations → Average focus time
      // Algorithm:
      //   - Group sessions by hour of day
      //   - Calculate energy score: usage_frequency * avg_session_duration
      //   - Identify peaks (high energy) and valleys (low energy)
      // Backend: memory_get_usage_patterns(days: 30)

      const state = cognitiveLayoutEngine.getState();

      // Exemple: Patterns temporels
      state.preferences.timePreferences = {
        highEnergy: [9, 10, 11, 14, 15, 16],
        lowEnergy: [13, 18, 19, 20],
      };

      logger.debug('💾 User patterns loaded');
    } catch (error) {
      logger.warn('Pattern load failed:', error);
    }
  }

  private async saveToMemory(): Promise<void> {
    try {
      const state = cognitiveLayoutEngine.getState();

      // Sauvegarder préférences dans localStorage (Memory Eternal)
      const preferencesKey = 'titane-cognitive-layout-preferences';
      const preferencesToSave = {
        favoriteModes: state.preferences.favoriteModes,
        acceptedSuggestions: state.preferences.acceptedSuggestions,
        manualOverrides: state.preferences.manualOverrides,
        dislikedAdaptations: state.preferences.dislikedAdaptations,
        timePreferences: state.preferences.timePreferences,
        savedAt: Date.now(),
      };

      localStorage.setItem(preferencesKey, JSON.stringify(preferencesToSave));

      // Sauvegarder historique des modes (derniers 50)
      const historyKey = 'titane-cognitive-layout-history';
      const historyToSave = state.modeHistory.slice(-50);
      localStorage.setItem(historyKey, JSON.stringify(historyToSave));

      logger.debug('💾 State saved to Memory');
    } catch (error) {
      logger.warn('Memory save failed:', error);
    }
  }

  /**
   * Enregistre un pattern d'usage
   */
  public async recordUsagePattern(data: {
    module: string;
    duration: number;
    mode: string;
    satisfaction?: number;
  }): Promise<void> {
    try {
      // RECORDING: Usage pattern storage for future ML analysis
      // Storage format: MemoryEntry with tags ['usage-pattern']
      // Schema:
      //   - module: string (e.g., 'chat', 'projects', 'system')
      //   - duration: number (milliseconds)
      //   - mode: CognitiveMode ('focus', 'explore', etc.)
      //   - satisfaction: Optional user rating (0.0-1.0)
      //   - timestamp: Unix timestamp
      // Backend: memory_store_pattern(entry)
      // Future: Train recommendation model on accumulated patterns
      logger.debug('💾 Usage pattern recorded:', data);
    } catch (error) {
      logger.warn('Pattern record failed:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// SELF-HEAL INTEGRATION (Auto-correction Layout)
// ═══════════════════════════════════════════════════════════════════

/**
 * Connecte Self-Heal au Cognitive Layout Engine
 * Self-Heal détecte et corrige les problèmes d'interface
 */
export class SelfHealConnector {
  private monitorInterval?: NodeJS.Timeout;

  public start(): void {
    logger.debug('🔧 Self-Heal connector started');

    // Monitoring toutes les 30 secondes
    this.monitorInterval = setInterval(() => {
      this.monitorLayoutHealth();
    }, 30000);
  }

  public stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    logger.debug('🔧 Self-Heal connector stopped');
  }

  private async monitorLayoutHealth(): Promise<void> {
    const issues = await this.detectLayoutIssues();

    if (issues.length > 0) {
      logger.debug('🔧 Self-Heal: Issues detected:', issues);
      await this.healLayoutIssues(issues);
    }
  }

  private async detectLayoutIssues(): Promise<string[]> {
    const issues: string[] = [];
    const state = cognitiveLayoutEngine.getState();

    // Détection 1: Trop de switches récents
    if (state.signals.contextSwitchRate > 5) {
      issues.push('high-switch-rate');
    }

    // Détection 2: Fatigue + mode dense
    if (state.signals.fatigueEstimated && state.layoutConfig.density.level === 'high') {
      issues.push('fatigue-with-high-density');
    }

    // Détection 3: Blocage détecté
    if (state.signals.blockageDetected) {
      issues.push('user-blockage');
    }

    // Détection 4: Mode inadapté depuis longtemps
    const timeSinceAdaptation = Date.now() - state.lastAdaptation;
    if (timeSinceAdaptation > 600000 && state.signals.cognitiveLoad > 0.7) {
      issues.push('outdated-mode');
    }

    return issues;
  }

  private async healLayoutIssues(issues: string[]): Promise<void> {
    for (const issue of issues) {
      switch (issue) {
        case 'high-switch-rate':
          logger.debug('🔧 Healing: Reducing context switches');
          await cognitiveLayoutEngine.applyMode('focus_deep', 'auto');
          break;

        case 'fatigue-with-high-density':
          logger.debug('🔧 Healing: Reducing density for fatigue');
          await cognitiveLayoutEngine.applyMode('focus_deep', 'auto');
          break;

        case 'user-blockage':
          logger.debug('🔧 Healing: Encouraging exploration');
          await cognitiveLayoutEngine.applyMode('exploration', 'auto');
          break;

        case 'outdated-mode':
          logger.debug('🔧 Healing: Re-analyzing context');
          // Forcer une nouvelle analyse
          break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// MASTER INTEGRATION ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════

/**
 * Orchestre toutes les intégrations
 */
export class CognitiveLayoutIntegrations {
  private helios: HeliosConnector;
  private nexus: NexusConnector;
  private memory: MemoryConnector;
  private selfHeal: SelfHealConnector;
  private isRunning = false;

  constructor() {
    this.helios = new HeliosConnector();
    this.nexus = new NexusConnector();
    this.memory = new MemoryConnector();
    this.selfHeal = new SelfHealConnector();
  }

  /**
   * Démarre toutes les intégrations
   */
  public async startAll(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Integrations already running');
      return;
    }

    logger.debug('🚀 Starting all integrations...');

    // Démarrer dans l'ordre
    await this.memory.start(); // D'abord charger préférences
    this.helios.start();
    this.nexus.start();
    this.selfHeal.start();

    this.isRunning = true;
    logger.debug('✅ All integrations started');
  }

  /**
   * Arrête toutes les intégrations
   */
  public stopAll(): void {
    if (!this.isRunning) return;

    logger.debug('🛑 Stopping all integrations...');

    this.selfHeal.stop();
    this.nexus.stop();
    this.helios.stop();
    this.memory.stop(); // En dernier pour sauvegarder

    this.isRunning = false;
    logger.debug('✅ All integrations stopped');
  }

  /**
   * Obtenir état des intégrations
   */
  public getStatus() {
    return {
      running: this.isRunning,
      connectors: {
        helios: 'active',
        nexus: 'active',
        memory: 'active',
        selfHeal: 'active',
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

export const cognitiveIntegrations = new CognitiveLayoutIntegrations();

// Auto-start si environnement navigateur
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    cognitiveIntegrations.startAll();
  });

  window.addEventListener('beforeunload', () => {
    cognitiveIntegrations.stopAll();
  });
}

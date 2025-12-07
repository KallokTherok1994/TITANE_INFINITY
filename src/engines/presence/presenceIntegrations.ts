/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                              ║
 * ║   TITANE∞ - Presence Engine Integrations                                    ║
 * ║                                                                              ║
 * ║   Connecte le moteur de présence aux autres systèmes de TITANE∞             ║
 * ║                                                                              ║
 * ║   © 2025 TITANE∞ v27.0                                                       ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { unifiedPresenceEngine } from './unifiedPresenceEngine';
import { narrativeProtocol } from './narrativeProtocol';
import { cognitiveLayoutEngine } from '../cognitive/cognitiveLayoutEngine';
import { secureInvoke } from '@/lib/security';

// ═══════════════════════════════════════════════════════════════════════════════
// 🔗 COGNITIVE ENGINE CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class CognitivePresenceConnector {
  private syncInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  start(): void {
    if (this.isActive) return;

    console.log('🔗 [Cognitive Connector] Démarrage synchronisation cognitive...');
    this.isActive = true;

    // Écouter les changements de mode cognitif
    cognitiveLayoutEngine.subscribe(state => {
      this.onCognitiveStateChange(state);
    });

    // Synchronisation périodique
    this.syncInterval = setInterval(() => {
      this.syncWithCognitive();
    }, 10000); // 10 secondes

    console.log('✅ [Cognitive Connector] Synchronisation active');
  }

  stop(): void {
    if (!this.isActive) return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isActive = false;
    console.log('🔗 [Cognitive Connector] Synchronisation arrêtée');
  }

  private onCognitiveStateChange(cognitiveState: Record<string, unknown>): void {
    // Créer une transition narrative lors du changement de mode
    const userContext = unifiedPresenceEngine.getUserContext();
    const transition = narrativeProtocol.createTransition(
      'previous_mode',
      cognitiveState.currentMode as string,
      userContext
    );

    console.log(`🎭 [Cognitive Connector] Transition: ${transition.narrative}`);

    // Ajouter un moment narratif
    narrativeProtocol.addNarrativeMoment({
      type: 'transition',
      description: `Mode cognitif: ${cognitiveState.currentMode}`,
      emotionalImpact: 15,
      contextTags: ['cognitive', cognitiveState.currentMode],
    });
  }

  private syncWithCognitive(): void {
    const cognitiveState = cognitiveLayoutEngine.getState();
    const presenceState = unifiedPresenceEngine.getState();

    // Synchroniser la clarté cognitive
    const clarityDiff = Math.abs(
      presenceState.clarityLevel - (100 - cognitiveState.signals.cognitiveLoad)
    );

    if (clarityDiff > 10) {
      console.log(
        `🔄 [Cognitive Connector] Ajustement clarté: ${clarityDiff.toFixed(1)}%`
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ HELIOS CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class HeliosPresenceConnector {
  private syncInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  async start(): Promise<void> {
    if (this.isActive) return;

    console.log('⚡ [Helios Connector] Démarrage synchronisation énergétique...');
    this.isActive = true;

    // Synchronisation périodique
    this.syncInterval = setInterval(() => {
      this.syncWithHelios();
    }, 30000); // 30 secondes

    // Premier sync immédiat
    await this.syncWithHelios();

    console.log('✅ [Helios Connector] Synchronisation active');
  }

  stop(): void {
    if (!this.isActive) return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isActive = false;
    console.log('⚡ [Helios Connector] Synchronisation arrêtée');
  }

  private async syncWithHelios(): Promise<void> {
    try {
      // Récupérer l'état Helios
      const heliosState = await secureInvoke<Record<string, unknown>>(
        'get_helios_state',
        {}
      );

      if (heliosState) {
        const energyScore = this.calculateEnergyScore(heliosState);

        // Ajuster l'intensité visuelle selon l'énergie système
        const presenceState = unifiedPresenceEngine.getState();

        if (energyScore < 40 && presenceState.visualIntensity > 60) {
          console.log('⚡ [Helios Connector] Réduction intensité (énergie faible)');
        }
      }
    } catch (error) {
      // Fallback silencieux si Helios non disponible
      console.debug('⚡ [Helios Connector] État non disponible (mode dégradé)');
    }
  }

  private calculateEnergyScore(heliosState: Record<string, unknown>): number {
    // Calcul simplifié du score énergétique
    const cpuScore = Math.max(0, 100 - ((heliosState.cpu_usage as number) || 50));
    const ramScore = Math.max(0, 100 - ((heliosState.ram_usage as number) || 50));
    return (cpuScore + ramScore) / 2;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 NEXUS CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class NexusPresenceConnector {
  private syncInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  async start(): Promise<void> {
    if (this.isActive) return;

    console.log('🎯 [Nexus Connector] Démarrage synchronisation priorités...');
    this.isActive = true;

    // Synchronisation périodique
    this.syncInterval = setInterval(() => {
      this.syncWithNexus();
    }, 20000); // 20 secondes

    // Premier sync immédiat
    await this.syncWithNexus();

    console.log('✅ [Nexus Connector] Synchronisation active');
  }

  stop(): void {
    if (!this.isActive) return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isActive = false;
    console.log('🎯 [Nexus Connector] Synchronisation arrêtée');
  }

  private async syncWithNexus(): Promise<void> {
    try {
      // Récupérer l'état Nexus
      const nexusState = await secureInvoke<Record<string, unknown>>(
        'engine_get_nexus_state',
        {}
      );

      if (nexusState && nexusState.priorities) {
        // Détecter les priorités critiques
        const criticalPriorities = (
          nexusState.priorities as Array<Record<string, unknown>>
        ).filter(
          (p: Record<string, unknown>) =>
            p.level === 'critical' || (p.urgency as number) > 80
        );

        if (criticalPriorities.length > 0) {
          // Augmenter l'intensité de présence
          console.log(
            `🎯 [Nexus Connector] ${criticalPriorities.length} priorités critiques détectées`
          );

          // Ajouter un moment narratif
          narrativeProtocol.addNarrativeMoment({
            type: 'challenge',
            description: 'Priorités critiques nécessitent attention',
            emotionalImpact: 30,
            contextTags: ['nexus', 'priorité', 'critique'],
          });
        }
      }
    } catch (error) {
      console.debug('🎯 [Nexus Connector] État non disponible (mode dégradé)');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 💾 MEMORY CONNECTOR
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryPresenceConnector {
  private syncInterval: NodeJS.Timeout | null = null;
  private isActive = false;

  start(): void {
    if (this.isActive) return;

    console.log('💾 [Memory Connector] Démarrage synchronisation mémoire...');
    this.isActive = true;

    // Charger l'arc narratif précédent
    narrativeProtocol.loadFromStorage();

    // Sauvegarde périodique
    this.syncInterval = setInterval(() => {
      this.saveToMemory();
    }, 60000); // 1 minute

    console.log('✅ [Memory Connector] Synchronisation active');
  }

  stop(): void {
    if (!this.isActive) return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Sauvegarde finale
    this.saveToMemory();

    this.isActive = false;
    console.log('💾 [Memory Connector] Synchronisation arrêtée');
  }

  private saveToMemory(): void {
    try {
      // Sauvegarder l'état de présence
      const presenceState = unifiedPresenceEngine.getState();
      const userContext = unifiedPresenceEngine.getUserContext();
      const narrativeArc = narrativeProtocol.getCurrentArc();

      localStorage.setItem(
        'titane_presence_snapshot',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          presenceState,
          userContext,
          narrativeArc,
          continuityScore: narrativeProtocol.assessContinuity(),
        })
      );

      // Sauvegarder le protocole narratif
      narrativeProtocol.saveToStorage();

      console.debug('💾 [Memory Connector] État sauvegardé');
    } catch (error) {
      console.warn('⚠️ [Memory Connector] Erreur sauvegarde:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 ORCHESTRATOR - Gère tous les connecteurs
// ═══════════════════════════════════════════════════════════════════════════════

class PresenceIntegrationsOrchestrator {
  private cognitive: CognitivePresenceConnector;
  private helios: HeliosPresenceConnector;
  private nexus: NexusPresenceConnector;
  private memory: MemoryPresenceConnector;
  private isRunning = false;

  constructor() {
    this.cognitive = new CognitivePresenceConnector();
    this.helios = new HeliosPresenceConnector();
    this.nexus = new NexusPresenceConnector();
    this.memory = new MemoryPresenceConnector();
  }

  async startAll(): Promise<void> {
    if (this.isRunning) return;

    console.log('🎨 [Presence Integrations] Démarrage de toutes les intégrations...');

    // Démarrer dans l'ordre
    this.memory.start(); // Mémoire d'abord (charge l'état)
    this.cognitive.start(); // Cognitive (synchronisation continue)
    await this.helios.start(); // Helios (métriques système)
    await this.nexus.start(); // Nexus (priorités)

    this.isRunning = true;

    console.log('✅ [Presence Integrations] Toutes les intégrations actives');
  }

  stopAll(): void {
    if (!this.isRunning) return;

    console.log('🎨 [Presence Integrations] Arrêt de toutes les intégrations...');

    // Arrêter dans l'ordre inverse
    this.nexus.stop();
    this.helios.stop();
    this.cognitive.stop();
    this.memory.stop(); // Mémoire en dernier (sauvegarde finale)

    this.isRunning = false;

    console.log('✅ [Presence Integrations] Toutes les intégrations arrêtées');
  }

  getStatus(): {
    isRunning: boolean;
    connectors: Record<string, boolean>;
  } {
    return {
      isRunning: this.isRunning,
      connectors: {
        cognitive: this.isRunning,
        helios: this.isRunning,
        nexus: this.isRunning,
        memory: this.isRunning,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌟 Export singleton
// ═══════════════════════════════════════════════════════════════════════════════

export const presenceIntegrations = new PresenceIntegrationsOrchestrator();
export default presenceIntegrations;

// ⚡ TITANE∞ v21 — State Engine
// Moteur de gestion des états système avec mapping visuel

import { DS_COLORS, rgba } from './DS_COLORS';
import { DS_CONSTANTS } from './DS_CONSTANTS';

// 🎭 Types d'états système
export type SystemState = 'stable' | 'processing' | 'warning' | 'danger' | 'null' | 'offline';

// 🎨 Configuration visuelle par état
export interface StateVisualConfig {
  color: string;
  colorRgb: string;
  glow: number;
  shadow: string;
  animationSpeed: number;
  intensity: number;
  luminosity: number;
  opacity: number;
  vibration: number;
  blur: number;
  pulseSpeed: number;
  label: string;
  icon: string;
}

// 🧬 Mapping état → configuration visuelle
export const STATE_CONFIGS: Record<SystemState, StateVisualConfig> = {
  stable: {
    color: DS_COLORS.emeraude.hex,
    colorRgb: DS_COLORS.emeraude.rgb,
    glow: DS_CONSTANTS.glow.subtle,
    shadow: `0 0 ${DS_CONSTANTS.blur.base}px ${rgba(DS_COLORS.emeraude.rgb, 0.3)}`,
    animationSpeed: DS_CONSTANTS.animationSpeed.verySlow,
    intensity: 0.4,
    luminosity: 0.4,
    opacity: DS_CONSTANTS.opacity.visible,
    vibration: DS_CONSTANTS.amplitude.none,
    blur: DS_CONSTANTS.blur.min,
    pulseSpeed: DS_CONSTANTS.timing.breath,
    label: 'STABLE',
    icon: '✓',
  },

  processing: {
    color: DS_COLORS.saphir.hex,
    colorRgb: DS_COLORS.saphir.rgb,
    glow: DS_CONSTANTS.glow.base,
    shadow: `0 0 ${DS_CONSTANTS.blur.medium}px ${rgba(DS_COLORS.saphir.rgb, 0.4)}`,
    animationSpeed: DS_CONSTANTS.animationSpeed.medium,
    intensity: 0.6,
    luminosity: 0.6,
    opacity: DS_CONSTANTS.opacity.strong,
    vibration: DS_CONSTANTS.amplitude.subtle,
    blur: DS_CONSTANTS.blur.base,
    pulseSpeed: DS_CONSTANTS.timing.medium,
    label: 'PROCESSING',
    icon: '◉',
  },

  warning: {
    color: DS_COLORS.warning.hex,
    colorRgb: DS_COLORS.warning.rgb,
    glow: DS_CONSTANTS.glow.medium,
    shadow: `0 0 ${DS_CONSTANTS.blur.large}px ${rgba(DS_COLORS.warning.rgb, 0.5)}`,
    animationSpeed: DS_CONSTANTS.animationSpeed.fast,
    intensity: 0.7,
    luminosity: 0.7,
    opacity: DS_CONSTANTS.opacity.strong,
    vibration: DS_CONSTANTS.amplitude.subtle,
    blur: DS_CONSTANTS.blur.medium,
    pulseSpeed: DS_CONSTANTS.timing.fast,
    label: 'WARNING',
    icon: '⚠',
  },

  danger: {
    color: DS_COLORS.rubis.hex,
    colorRgb: DS_COLORS.rubis.rgb,
    glow: DS_CONSTANTS.glow.strong,
    shadow: `0 0 ${DS_CONSTANTS.blur.max}px ${rgba(DS_COLORS.rubis.rgb, 0.6)}`,
    animationSpeed: DS_CONSTANTS.animationSpeed.veryFast,
    intensity: 1.0,
    luminosity: 1.0,
    opacity: DS_CONSTANTS.opacity.solid,
    vibration: DS_CONSTANTS.amplitude.base,
    blur: DS_CONSTANTS.blur.large,
    pulseSpeed: DS_CONSTANTS.timing.micro,
    label: 'CRITICAL',
    icon: '✕',
  },

  null: {
    color: DS_COLORS.diamant.variants[500],
    colorRgb: DS_COLORS.diamant.rgb,
    glow: DS_CONSTANTS.glow.none,
    shadow: `0 0 ${DS_CONSTANTS.blur.min}px ${rgba(DS_COLORS.diamant.rgb, 0.2)}`,
    animationSpeed: DS_CONSTANTS.animationSpeed.static,
    intensity: 0.2,
    luminosity: 0.3,
    opacity: DS_CONSTANTS.opacity.medium,
    vibration: DS_CONSTANTS.amplitude.none,
    blur: DS_CONSTANTS.blur.min,
    pulseSpeed: 0,
    label: 'UNKNOWN',
    icon: '?',
  },

  offline: {
    color: DS_COLORS.diamant.variants[600],
    colorRgb: DS_COLORS.diamant.rgb,
    glow: DS_CONSTANTS.glow.none,
    shadow: 'none',
    animationSpeed: DS_CONSTANTS.animationSpeed.static,
    intensity: 0.1,
    luminosity: 0.2,
    opacity: DS_CONSTANTS.opacity.subtle,
    vibration: DS_CONSTANTS.amplitude.none,
    blur: 0,
    pulseSpeed: 0,
    label: 'OFFLINE',
    icon: '○',
  },
};

// 🧠 State Engine principal
export class StateEngine {
  private currentState: SystemState = 'null';
  private previousState: SystemState | null = null;
  private stateChangeCallbacks: Array<(state: SystemState, config: StateVisualConfig) => void> = [];

  /**
   * Obtenir l'état actuel
   */
  getCurrentState(): SystemState {
    return this.currentState;
  }

  /**
   * Obtenir la configuration visuelle de l'état actuel
   */
  getCurrentConfig(): StateVisualConfig {
    return STATE_CONFIGS[this.currentState];
  }

  /**
   * Définir un nouvel état
   */
  setState(newState: SystemState): void {
    if (newState === this.currentState) return;

    this.previousState = this.currentState;
    this.currentState = newState;

    const config = STATE_CONFIGS[newState];
    this.notifyStateChange(newState, config);
  }

  /**
   * Obtenir la configuration d'un état spécifique
   */
  getStateConfig(state: SystemState): StateVisualConfig {
    return STATE_CONFIGS[state];
  }

  /**
   * S'abonner aux changements d'état
   */
  onStateChange(callback: (state: SystemState, config: StateVisualConfig) => void): () => void {
    this.stateChangeCallbacks.push(callback);

    // Retourner une fonction de désinscription
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifier tous les subscribers d'un changement d'état
   */
  private notifyStateChange(state: SystemState, config: StateVisualConfig): void {
    this.stateChangeCallbacks.forEach((callback) => {
      callback(state, config);
    });
  }

  /**
   * Déterminer l'état selon des métriques système
   */
  determineStateFromMetrics(metrics: {
    cpu?: number;
    memory?: number;
    errors?: number;
    connections?: number;
  }): SystemState {
    const { cpu = 0, memory = 0, errors = 0, connections = 0 } = metrics;

    // Priorité : erreurs > CPU > mémoire > connexions
    if (errors > 0) {
      return errors > 10 ? 'danger' : 'warning';
    }

    if (cpu > DS_CONSTANTS.thresholds.cpu.critical || memory > DS_CONSTANTS.thresholds.memory.critical) {
      return 'danger';
    }

    if (cpu > DS_CONSTANTS.thresholds.cpu.warning || memory > DS_CONSTANTS.thresholds.memory.warning) {
      return 'warning';
    }

    if (connections > DS_CONSTANTS.thresholds.connections.warning) {
      return 'processing';
    }

    if (cpu > 0 || memory > 0 || connections > 0) {
      return 'stable';
    }

    return 'null';
  }

  /**
   * Reset à l'état initial
   */
  reset(): void {
    this.setState('null');
    this.previousState = null;
  }
}

// 🌟 Instance singleton
export const stateEngine = new StateEngine();

// 🎨 Export des configurations pour utilisation directe
export { STATE_CONFIGS as stateConfigs };

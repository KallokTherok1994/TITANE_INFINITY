/**
 * TITANE∞ v21 — UI Mode System
 * Système de modes visuels adaptatifs
 *
 * Permet à l'UI de fonctionner en différents modes :
 * - AUTO : adaptatif selon performance et contexte
 * - MINIMAL : CPU/GPU minimal, pas de particules, faible glow
 * - PERFORMANCE : 60fps garanti, densité dynamique
 * - IMMERSIVE : effets maximaux, séquences riches
 * - DEBUG : visualisation des états internes, metrics
 *
 * Architecture:
 * Mode → Configuration → Visual Engine → Render
 */

import type { VisualConfig } from '@/design-system/visual-states';

// ═════════════════════════════════════════════════════════════════
// TYPES — MODES
// ═════════════════════════════════════════════════════════════════

export enum UIMode {
  AUTO = 'auto', // Mode adaptatif intelligent
  MINIMAL = 'minimal', // Mode minimaliste (économie ressources)
  PERFORMANCE = 'performance', // Mode performance (60fps garanti)
  IMMERSIVE = 'immersive', // Mode immersif (effets max)
  DEBUG = 'debug', // Mode debug (visualisation interne)
}

export interface UIModeConfig {
  // Particules
  enableParticles: boolean;
  particleDensity: number; // 0-1
  particleQuality: 'low' | 'medium' | 'high';

  // Effets
  enableEffects: boolean;
  effectsQuality: 'low' | 'medium' | 'high';
  enableEnergyArcs: boolean;
  enableHealingWaves: boolean;
  enableGlitch: boolean;
  enableAudioWaveform: boolean;

  // Glow & Aura
  enableGlow: boolean;
  glowIntensity: number; // 0-1
  enableAura: boolean;
  auraQuality: 'low' | 'medium' | 'high';

  // Orbital
  enableOrbitalRings: boolean;
  orbitalQuality: 'low' | 'medium' | 'high';

  // Animations
  enableAnimations: boolean;
  animationSpeed: number; // 0-2
  enableTransitions: boolean;
  transitionDuration: number; // ms

  // Performance
  targetFPS: number;
  enableFPSLimit: boolean;
  enableDynamicQuality: boolean; // Réduction auto si FPS < target

  // Debug
  showFPS: boolean;
  showMetrics: boolean;
  showStateOverlay: boolean;
  showPhenomenaDebug: boolean;
  enableConsoleLogging: boolean;

  // Panels
  panelOpacity: number; // 0-1
  enablePanelBlur: boolean;
  panelAnimations: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  cpuUsage: number; // 0-1
  gpuUsage: number; // 0-1
  memoryUsage: number; // MB
  particleCount: number;
  activeEffects: number;
}

export interface AutoModeState {
  currentMode: UIMode;
  metrics: PerformanceMetrics;
  lastAdjustment: number; // timestamp
  adjustmentHistory: Array<{
    timestamp: number;
    reason: string;
    from: UIMode;
    to: UIMode;
  }>;
}

// ═════════════════════════════════════════════════════════════════
// CONFIGURATIONS PAR MODE
// ═════════════════════════════════════════════════════════════════

export const MODE_CONFIGS: Record<UIMode, UIModeConfig> = {
  // ───────────────────────────────────────────────────────────────
  // AUTO - Mode adaptatif
  // ───────────────────────────────────────────────────────────────
  [UIMode.AUTO]: {
    enableParticles: true,
    particleDensity: 0.8,
    particleQuality: 'medium',

    enableEffects: true,
    effectsQuality: 'medium',
    enableEnergyArcs: true,
    enableHealingWaves: true,
    enableGlitch: true,
    enableAudioWaveform: true,

    enableGlow: true,
    glowIntensity: 0.7,
    enableAura: true,
    auraQuality: 'medium',

    enableOrbitalRings: true,
    orbitalQuality: 'medium',

    enableAnimations: true,
    animationSpeed: 1.0,
    enableTransitions: true,
    transitionDuration: 500,

    targetFPS: 60,
    enableFPSLimit: true,
    enableDynamicQuality: true, // Clé du mode AUTO

    showFPS: false,
    showMetrics: false,
    showStateOverlay: false,
    showPhenomenaDebug: false,
    enableConsoleLogging: false,

    panelOpacity: 0.95,
    enablePanelBlur: true,
    panelAnimations: true,
  },

  // ───────────────────────────────────────────────────────────────
  // MINIMAL - Mode économie ressources
  // ───────────────────────────────────────────────────────────────
  [UIMode.MINIMAL]: {
    enableParticles: false, // ❌ Pas de particules
    particleDensity: 0.0,
    particleQuality: 'low',

    enableEffects: false, // ❌ Pas d'effets
    effectsQuality: 'low',
    enableEnergyArcs: false,
    enableHealingWaves: false,
    enableGlitch: false,
    enableAudioWaveform: false,

    enableGlow: true, // ✅ Glow minimal
    glowIntensity: 0.3,
    enableAura: false, // ❌ Pas d'aura
    auraQuality: 'low',

    enableOrbitalRings: true, // ✅ Anneaux simples
    orbitalQuality: 'low',

    enableAnimations: true,
    animationSpeed: 0.7, // Plus lent
    enableTransitions: false, // ❌ Pas de transitions
    transitionDuration: 200,

    targetFPS: 30, // 30 FPS suffisant
    enableFPSLimit: true,
    enableDynamicQuality: false,

    showFPS: false,
    showMetrics: false,
    showStateOverlay: false,
    showPhenomenaDebug: false,
    enableConsoleLogging: false,

    panelOpacity: 0.9,
    enablePanelBlur: false, // ❌ Pas de blur
    panelAnimations: false,
  },

  // ───────────────────────────────────────────────────────────────
  // PERFORMANCE - 60 FPS garanti
  // ───────────────────────────────────────────────────────────────
  [UIMode.PERFORMANCE]: {
    enableParticles: true,
    particleDensity: 0.6, // Densité réduite
    particleQuality: 'medium',

    enableEffects: true,
    effectsQuality: 'medium',
    enableEnergyArcs: true,
    enableHealingWaves: true,
    enableGlitch: true,
    enableAudioWaveform: true,

    enableGlow: true,
    glowIntensity: 0.6,
    enableAura: true,
    auraQuality: 'medium',

    enableOrbitalRings: true,
    orbitalQuality: 'medium',

    enableAnimations: true,
    animationSpeed: 1.0,
    enableTransitions: true,
    transitionDuration: 300, // Transitions rapides

    targetFPS: 60, // 🎯 60 FPS strict
    enableFPSLimit: true,
    enableDynamicQuality: true, // Ajustement auto pour maintenir 60fps

    showFPS: true, // ✅ Affichage FPS
    showMetrics: true, // ✅ Métriques performance
    showStateOverlay: false,
    showPhenomenaDebug: false,
    enableConsoleLogging: false,

    panelOpacity: 0.95,
    enablePanelBlur: true,
    panelAnimations: true,
  },

  // ───────────────────────────────────────────────────────────────
  // IMMERSIVE - Effets maximaux
  // ───────────────────────────────────────────────────────────────
  [UIMode.IMMERSIVE]: {
    enableParticles: true,
    particleDensity: 1.0, // ✨ Densité maximale
    particleQuality: 'high', // ✨ Qualité max

    enableEffects: true,
    effectsQuality: 'high', // ✨ Qualité max
    enableEnergyArcs: true,
    enableHealingWaves: true,
    enableGlitch: true,
    enableAudioWaveform: true,

    enableGlow: true,
    glowIntensity: 1.0, // ✨ Glow max
    enableAura: true,
    auraQuality: 'high', // ✨ Aura max

    enableOrbitalRings: true,
    orbitalQuality: 'high', // ✨ Qualité max

    enableAnimations: true,
    animationSpeed: 1.2, // Plus rapide, plus fluide
    enableTransitions: true,
    transitionDuration: 800, // Transitions longues et fluides

    targetFPS: 60,
    enableFPSLimit: false, // ❌ Pas de limite (best effort)
    enableDynamicQuality: false, // ❌ Qualité fixe max

    showFPS: false,
    showMetrics: false,
    showStateOverlay: false,
    showPhenomenaDebug: false,
    enableConsoleLogging: false,

    panelOpacity: 0.98,
    enablePanelBlur: true,
    panelAnimations: true,
  },

  // ───────────────────────────────────────────────────────────────
  // DEBUG - Visualisation des états internes
  // ───────────────────────────────────────────────────────────────
  [UIMode.DEBUG]: {
    enableParticles: true,
    particleDensity: 0.5, // Réduit pour voir les overlays
    particleQuality: 'medium',

    enableEffects: true,
    effectsQuality: 'medium',
    enableEnergyArcs: true,
    enableHealingWaves: true,
    enableGlitch: true,
    enableAudioWaveform: true,

    enableGlow: true,
    glowIntensity: 0.5,
    enableAura: true,
    auraQuality: 'medium',

    enableOrbitalRings: true,
    orbitalQuality: 'medium',

    enableAnimations: true,
    animationSpeed: 1.0,
    enableTransitions: true,
    transitionDuration: 500,

    targetFPS: 60,
    enableFPSLimit: false,
    enableDynamicQuality: false,

    showFPS: true, // ✅ FPS visible
    showMetrics: true, // ✅ Métriques complètes
    showStateOverlay: true, // ✅ États OS visibles
    showPhenomenaDebug: true, // ✅ Phénomènes actifs
    enableConsoleLogging: true, // ✅ Logs détaillés

    panelOpacity: 0.85, // Plus transparent pour voir debug
    enablePanelBlur: false, // Pas de blur pour clarté
    panelAnimations: false, // Pas d'animations pour stabilité
  },
};

// ═════════════════════════════════════════════════════════════════
// UI MODE MANAGER
// ═════════════════════════════════════════════════════════════════

export class UIModeManager {
  private currentMode: UIMode = UIMode.AUTO;
  private currentConfig: UIModeConfig;
  private autoModeState: AutoModeState | null = null;

  // Performance monitoring (mode AUTO)
  private performanceCheckInterval: number | null = null;
  private performanceCheckFrequency = 2000; // ms

  // Callbacks
  private onModeChangeCallbacks: Set<(mode: UIMode, config: UIModeConfig) => void> =
    new Set();

  constructor(initialMode: UIMode = UIMode.AUTO) {
    this.currentMode = initialMode;
    this.currentConfig = { ...MODE_CONFIGS[initialMode] };

    if (initialMode === UIMode.AUTO) {
      this.initializeAutoMode();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MODE MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  /**
   * Change le mode UI
   */
  setMode(mode: UIMode): void {
    if (mode === this.currentMode) return;

    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.currentConfig = { ...MODE_CONFIGS[mode] };

    console.log(`[UIModeManager] Mode changed: ${previousMode} → ${mode}`);

    // Initialiser AUTO mode si nécessaire
    if (mode === UIMode.AUTO) {
      this.initializeAutoMode();
    } else {
      this.stopAutoMode();
    }

    // Notifier les listeners
    this.notifyModeChange();
  }

  /**
   * Retourne le mode actuel
   */
  getCurrentMode(): UIMode {
    return this.currentMode;
  }

  /**
   * Retourne la configuration actuelle
   */
  getCurrentConfig(): UIModeConfig {
    return { ...this.currentConfig };
  }

  /**
   * Override partiel de la configuration
   */
  overrideConfig(overrides: Partial<UIModeConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...overrides };
    this.notifyModeChange();
  }

  // ─────────────────────────────────────────────────────────────
  // AUTO MODE - Adaptation dynamique
  // ─────────────────────────────────────────────────────────────

  /**
   * Initialise le mode AUTO
   */
  private initializeAutoMode(): void {
    this.autoModeState = {
      currentMode: UIMode.AUTO,
      metrics: {
        fps: 60,
        frameTime: 16.67,
        cpuUsage: 0,
        gpuUsage: 0,
        memoryUsage: 0,
        particleCount: 0,
        activeEffects: 0,
      },
      lastAdjustment: Date.now(),
      adjustmentHistory: [],
    };

    // Démarrer monitoring performance
    this.startPerformanceMonitoring();
  }

  /**
   * Arrête le mode AUTO
   */
  private stopAutoMode(): void {
    if (this.performanceCheckInterval !== null) {
      clearInterval(this.performanceCheckInterval);
      this.performanceCheckInterval = null;
    }
    this.autoModeState = null;
  }

  /**
   * Démarre le monitoring de performance (mode AUTO)
   */
  private startPerformanceMonitoring(): void {
    if (this.performanceCheckInterval !== null) return;

    this.performanceCheckInterval = window.setInterval(() => {
      this.checkPerformanceAndAdjust();
    }, this.performanceCheckFrequency);
  }

  /**
   * Vérifie la performance et ajuste la config si nécessaire
   */
  private checkPerformanceAndAdjust(): void {
    if (!this.autoModeState || this.currentMode !== UIMode.AUTO) return;

    const metrics = this.autoModeState.metrics;
    const targetFPS = this.currentConfig.targetFPS;

    // Règles d'adaptation
    if (metrics.fps < targetFPS * 0.8) {
      // Performance insuffisante → réduire qualité
      this.adjustForLowPerformance();
    } else if (metrics.fps > targetFPS * 0.95 && metrics.cpuUsage < 0.6) {
      // Performance excellente → augmenter qualité
      this.adjustForHighPerformance();
    }
  }

  /**
   * Ajuste pour basse performance
   */
  private adjustForLowPerformance(): void {
    console.log('[UIModeManager] Low performance detected, reducing quality');

    // Réduire densité particules
    if (this.currentConfig.particleDensity > 0.3) {
      this.currentConfig.particleDensity -= 0.1;
    }

    // Réduire qualité effets
    if (this.currentConfig.effectsQuality === 'high') {
      this.currentConfig.effectsQuality = 'medium';
    } else if (this.currentConfig.effectsQuality === 'medium') {
      this.currentConfig.effectsQuality = 'low';
    }

    // Réduire glow
    if (this.currentConfig.glowIntensity > 0.3) {
      this.currentConfig.glowIntensity -= 0.1;
    }

    this.recordAdjustment('low_performance', this.currentMode, this.currentMode);
    this.notifyModeChange();
  }

  /**
   * Ajuste pour haute performance
   */
  private adjustForHighPerformance(): void {
    console.log('[UIModeManager] High performance detected, increasing quality');

    // Augmenter densité particules
    if (this.currentConfig.particleDensity < 1.0) {
      this.currentConfig.particleDensity = Math.min(
        1.0,
        this.currentConfig.particleDensity + 0.1
      );
    }

    // Augmenter qualité effets
    if (this.currentConfig.effectsQuality === 'low') {
      this.currentConfig.effectsQuality = 'medium';
    } else if (this.currentConfig.effectsQuality === 'medium') {
      this.currentConfig.effectsQuality = 'high';
    }

    // Augmenter glow
    if (this.currentConfig.glowIntensity < 0.9) {
      this.currentConfig.glowIntensity = Math.min(
        0.9,
        this.currentConfig.glowIntensity + 0.1
      );
    }

    this.recordAdjustment('high_performance', this.currentMode, this.currentMode);
    this.notifyModeChange();
  }

  /**
   * Met à jour les métriques de performance (appelé par Visual Engine)
   */
  updatePerformanceMetrics(metrics: Partial<PerformanceMetrics>): void {
    if (!this.autoModeState) return;

    this.autoModeState.metrics = {
      ...this.autoModeState.metrics,
      ...metrics,
    };
  }

  /**
   * Enregistre un ajustement
   */
  private recordAdjustment(reason: string, from: UIMode, to: UIMode): void {
    if (!this.autoModeState) return;

    this.autoModeState.adjustmentHistory.push({
      timestamp: Date.now(),
      reason,
      from,
      to,
    });

    this.autoModeState.lastAdjustment = Date.now();

    // Garder seulement les 20 derniers ajustements
    if (this.autoModeState.adjustmentHistory.length > 20) {
      this.autoModeState.adjustmentHistory.shift();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────

  /**
   * Enregistre un callback pour changement de mode
   */
  onModeChange(callback: (mode: UIMode, config: UIModeConfig) => void): void {
    this.onModeChangeCallbacks.add(callback);
  }

  /**
   * Retire un callback
   */
  offModeChange(callback: (mode: UIMode, config: UIModeConfig) => void): void {
    this.onModeChangeCallbacks.delete(callback);
  }

  /**
   * Notifie les listeners d'un changement de mode
   */
  private notifyModeChange(): void {
    for (const callback of this.onModeChangeCallbacks) {
      callback(this.currentMode, this.currentConfig);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Retourne l'état AUTO mode
   */
  getAutoModeState(): AutoModeState | null {
    return this.autoModeState ? { ...this.autoModeState } : null;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoMode();
    this.onModeChangeCallbacks.clear();
  }
}

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

export default UIModeManager;

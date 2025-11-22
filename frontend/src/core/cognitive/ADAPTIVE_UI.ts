// ⚡ TITANE∞ v23 — Adaptive UI
// Système d'adaptation UI selon rythme utilisateur et état système

import { UserRhythm } from './USER_RHYTHM_ANALYZER';
import { SystemState } from '../visual/STATE_ENGINE';

// 🎨 Configuration adaptative UI
export interface AdaptiveUIConfig {
  density: 'minimal' | 'compact' | 'comfortable' | 'spacious';
  contrast: 'low' | 'medium' | 'high';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'disabled';
  glowIntensity: 'subtle' | 'medium' | 'strong';
  visualNoise: 'minimal' | 'normal' | 'rich';
}

// 🧬 Adaptive UI Engine
export class AdaptiveUI {
  private config: AdaptiveUIConfig = {
    density: 'comfortable',
    contrast: 'medium',
    animationSpeed: 'normal',
    glowIntensity: 'medium',
    visualNoise: 'normal',
  };

  private listeners: Array<(config: AdaptiveUIConfig) => void> = [];

  /**
   * Adapter l'UI selon le rythme utilisateur
   */
  adaptToUserRhythm(rhythm: UserRhythm): void {
    // 🚀 Utilisateur rapide → Augmenter lisibilité, contraste
    if (rhythm.speed === 'fast') {
      this.config.density = 'compact';
      this.config.contrast = 'high';
      this.config.animationSpeed = 'fast';
      this.config.glowIntensity = 'strong';
      this.config.visualNoise = 'minimal';
    }

    // 🐌 Utilisateur lent → Adoucir, respirer
    else if (rhythm.speed === 'slow') {
      this.config.density = 'spacious';
      this.config.contrast = 'medium';
      this.config.animationSpeed = 'slow';
      this.config.glowIntensity = 'subtle';
      this.config.visualNoise = 'rich';
    }

    // 😴 Fatigue détectée → Simplifier
    if (rhythm.fatigue > 0.5) {
      this.config.density = 'comfortable';
      this.config.animationSpeed = 'slow';
      this.config.glowIntensity = 'subtle';
      this.config.visualNoise = 'minimal';
    }

    // 🎯 Focus élevé → Stabiliser
    if (rhythm.focus > 0.7) {
      this.config.animationSpeed = 'slow';
      this.config.visualNoise = 'minimal';
    }

    // 🔍 Exploration → Enrichir
    if (rhythm.pattern === 'exploring') {
      this.config.density = 'comfortable';
      this.config.glowIntensity = 'medium';
      this.config.visualNoise = 'normal';
    }

    this.notifyListeners();
  }

  /**
   * Adapter l'UI selon l'état système
   */
  adaptToSystemState(state: SystemState): void {
    switch (state) {
      case 'danger':
      case 'warning':
        // Surcharge système → Réduire bruit visuel, augmenter clarté
        this.config.density = 'comfortable';
        this.config.contrast = 'high';
        this.config.animationSpeed = 'disabled';
        this.config.glowIntensity = 'strong';
        this.config.visualNoise = 'minimal';
        break;

      case 'stable':
        // Système stable → UI normale
        this.config.density = 'comfortable';
        this.config.contrast = 'medium';
        this.config.animationSpeed = 'normal';
        this.config.glowIntensity = 'medium';
        this.config.visualNoise = 'normal';
        break;

      case 'offline':
        // Système offline → UI minimaliste
        this.config.density = 'compact';
        this.config.contrast = 'low';
        this.config.animationSpeed = 'disabled';
        this.config.glowIntensity = 'subtle';
        this.config.visualNoise = 'minimal';
        break;
    }

    this.notifyListeners();
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): AdaptiveUIConfig {
    return { ...this.config };
  }

  /**
   * Générer CSS variables adaptatives
   */
  generateCSSVariables(): Record<string, string> {
    // Densité
    const densityMap = {
      minimal: '8px',
      compact: '12px',
      comfortable: '16px',
      spacious: '24px',
    };

    // Contraste
    const contrastMap = {
      low: '0.6',
      medium: '0.8',
      high: '1.0',
    };

    // Animation speed
    const animSpeedMap = {
      slow: '1.5',
      normal: '1.0',
      fast: '0.7',
      disabled: '0',
    };

    // Glow intensity
    const glowMap = {
      subtle: '0.3',
      medium: '0.5',
      strong: '0.8',
    };

    return {
      '--adaptive-density': densityMap[this.config.density],
      '--adaptive-contrast': contrastMap[this.config.contrast],
      '--adaptive-animation-speed': animSpeedMap[this.config.animationSpeed],
      '--adaptive-glow-intensity': glowMap[this.config.glowIntensity],
    };
  }

  /**
   * S'abonner aux changements
   */
  onChange(callback: (config: AdaptiveUIConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notifier les listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.config));
  }

  /**
   * Réinitialiser à la configuration par défaut
   */
  reset(): void {
    this.config = {
      density: 'comfortable',
      contrast: 'medium',
      animationSpeed: 'normal',
      glowIntensity: 'medium',
      visualNoise: 'normal',
    };
    this.notifyListeners();
  }
}

// 🌟 Instance singleton
export const adaptiveUI = new AdaptiveUI();

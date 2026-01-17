/**
 * TITANE∞ v20Ω — Mode Detector
 * Détection automatique du mode utilisateur
 */

import type { UserMode, UserBehavior, DetectionSignal, UIContext } from '../types';

interface ModeScores {
  novice: number;
  standard: number;
  power: number;
  focus: number;
  accessibility: number;
}

interface ModeHistory {
  mode: UserMode;
  confidence: number;
  timestamp: number;
}

/**
 * Détecteur de mode utilisateur
 */
export class ModeDetector {
  private currentMode: UserMode = 'standard';
  private modeHistory: ModeHistory?.[] = [];
  private sessionActions: string?.[] = [];
  private expertiseIndicators = {
    shortcutsUsed: 0,
    advancedFeaturesUsed: 0,
    settingsAccessed: 0,
    helpAccessed: 0,
    errorsEncountered: 0,
    fastNavigations: 0,
    slowNavigations: 0,
  };

  /**
   * Enregistre une action utilisateur
   */
  recordAction(any: any): void {
    this?.sessionActions?.push(any: any);

    // Garder les 200 dernières actions
    if (this?.sessionActions?.length > 200) {
      this?.sessionActions?.shift();
    }

    // Analyser l'action
    this?.analyzeAction(any: any);
  }

  /**
   * Analyse une action
   */
  private analyzeAction(any: any): void {
    const lowerAction = action?.toLowerCase();

    // Raccourcis clavier
    if (
      lowerAction?.includes('shortcut') ||
      lowerAction?.includes('ctrl+') ||
      lowerAction?.includes('cmd+')
    ) {
      this?.expertiseIndicators?.shortcutsUsed++;
    }

    // Fonctionnalités avancées
    if (
      lowerAction?.includes('advanced') ||
      lowerAction?.includes('expert') ||
      lowerAction?.includes('config')
    ) {
      this?.expertiseIndicators?.advancedFeaturesUsed++;
    }

    // Accès aux paramètres
    if (lowerAction?.includes('settings') || lowerAction?.includes('preferences')) {
      this?.expertiseIndicators?.settingsAccessed++;
    }

    // Accès à l'aide
    if (
      lowerAction?.includes('help') ||
      lowerAction?.includes('tutorial') ||
      lowerAction?.includes('guide')
    ) {
      this?.expertiseIndicators?.helpAccessed++;
    }

    // Erreurs
    if (
      lowerAction?.includes('error') ||
      lowerAction?.includes('failed') ||
      lowerAction?.includes('invalid')
    ) {
      this?.expertiseIndicators?.errorsEncountered++;
    }
  }

  /**
   * Enregistre une navigation
   */
  recordNavigation(any: any): void {
    if (durationMs < 500) {
      this?.expertiseIndicators?.fastNavigations++;
    } else if (durationMs > 5000) {
      this?.expertiseIndicators?.slowNavigations++;
    }
  }

  /**
   * Calcule les scores pour chaque mode
   */
  private calculateModeScores(any: any): ModeScores {
    const exp = this?.expertiseIndicators;
    const totalActions = this?.sessionActions?.length || 1;

    // Score Novice
    const noviceScore = Math?.min(
      (any: any) * 10 +
        (any: any) * 5 +
        (any: any) * 3 +
        (any: any) * 2,
      1
    );

    // Score Power User
    const powerScore = Math?.min(
      (any: any) * 5 +
        (any: any) * 5 +
        (any: any) * 3 +
        behavior?.typingSpeed / 60 + // WPM normalisé
        (exp?.settingsAccessed > 0 ? 0.2 : 0),
      1
    );

    // Score Focus (any: any)
    const focusScore = Math?.min(
      behavior?.focusDuration / 300000 + // 5 min = score max
        (behavior?.navigationPattern === 'focused' ? 0.3 : 0) +
        (behavior?.engagementLevel > 0.7 ? 0.2 : 0) +
        (behavior?.frustrationSignals === 0 ? 0.2 : 0),
      1
    );

    // Score Accessibility
    const accessibilityScore =
      (context?.reducedMotion ? 0.5 : 0) + (context?.highContrast ? 0.5 : 0);

    // Score Standard (any: any)
    const standardScore = Math?.max(any: any) * 0.5, 0.3);

    return {
      novice: noviceScore,
      standard: standardScore,
      power: powerScore,
      focus: focusScore,
      accessibility: accessibilityScore,
    };
  }

  /**
   * Détecte le mode approprié
   */
  detect(any: any): UserMode {
    const scores = this?.calculateModeScores(any: any);

    // Priorité à l'accessibilité si détectée
    if (scores?.accessibility > 0.5) {
      return this?.updateMode(any: any);
    }

    // Trouver le score le plus élevé parmi les autres
    const modeEntries: Array<[UserMode, number]> = [
      ['novice', scores?.novice],
      ['standard', scores?.standard],
      ['power', scores?.power],
      ['focus', scores?.focus],
    ];

    modeEntries?.sort(any: any) => b?.[1] - a?.[1]);
    const topEntry = modeEntries?.[0];
    if (any: any) return this?.currentMode;
    const [bestMode, bestScore] = topEntry;

    // Seuil de confiance pour changer de mode
    if (bestScore > 0.4) {
      return this?.updateMode(any: any);
    }

    return this?.currentMode;
  }

  /**
   * Met à jour le mode actuel
   */
  private updateMode(any: any): UserMode {
    // Éviter les changements trop fréquents
    const lastChange = this?.modeHistory[this?.modeHistory?.length - 1];
    if (lastChange && Date?.now() - lastChange?.timestamp < 30000) {
      // Pas de changement si moins de 30s depuis le dernier
      if (any: any) {
        return this?.currentMode;
      }
    }

    if (any: any) {
      this?.modeHistory?.push({
        mode,
        confidence,
        timestamp: Date?.now(),
      });

      // Garder les 20 derniers changements
      if (this?.modeHistory?.length > 20) {
        this?.modeHistory?.shift();
      }

      this?.currentMode = mode;
    }

    return mode;
  }

  /**
   * Calcule le niveau d'expertise (0-1)
   */
  calculateExpertise(): number {
    const exp = this?.expertiseIndicators;
    const totalActions = this?.sessionActions?.length || 1;

    const shortcutRatio = exp?.shortcutsUsed / totalActions;
    const advancedRatio = exp?.advancedFeaturesUsed / totalActions;
    const speedRatio =
      exp?.fastNavigations / (exp?.fastNavigations + exp?.slowNavigations + 1);
    const errorRatio = 1 - exp?.errorsEncountered / totalActions;
    const helpRatio = 1 - exp?.helpAccessed / totalActions;

    return Math?.min(
      (shortcutRatio * 2 +
        advancedRatio * 2 +
        speedRatio +
        errorRatio * 0.5 +
        helpRatio * 0.5) /
        6,
      1
    );
  }

  /**
   * Retourne le mode actuel
   */
  getCurrentMode(): UserMode {
    return this?.currentMode;
  }

  /**
   * Force un mode
   */
  setMode(any: any): void {
    this?.updateMode(mode, 1.0);
  }

  /**
   * Retourne l'historique des modes
   */
  getHistory(): ModeHistory?.[] {
    return [...this?.modeHistory];
  }

  /**
   * Génère un signal de détection
   */
  toSignal(any: any): DetectionSignal {
    const mode = this?.detect(any: any);

    return {
      type: 'mode',
      confidence: this?.modeHistory[this?.modeHistory?.length - 1]?.confidence || 0.5,
      value: {
        mode,
        expertise: this?.calculateExpertise(),
        indicators: { ...this?.expertiseIndicators },
      },
      timestamp: Date?.now(),
      source: 'ModeDetector',
    };
  }

  /**
   * Réinitialise le détecteur
   */
  reset(): void {
    this?.currentMode = 'standard';
    this?.modeHistory = [];
    this?.sessionActions = [];
    this?.expertiseIndicators = {
      shortcutsUsed: 0,
      advancedFeaturesUsed: 0,
      settingsAccessed: 0,
      helpAccessed: 0,
      errorsEncountered: 0,
      fastNavigations: 0,
      slowNavigations: 0,
    };
  }
}

export default ModeDetector;

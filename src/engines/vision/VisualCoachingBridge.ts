/**
 * TITANE∞ vΩ∞ — VISUAL COACHING BRIDGE
 * Super Prompt #9: Intégration avec EnergyEngine / CoachingEngine / AgendaEngine
 *
 * Responsabilités:
 * - Connecter affectState aux autres moteurs TITANE
 * - Générer des suggestions de coaching non-intrusives
 * - Déclencher des événements visuels
 *
 * ⚠️ RÈGLE FONDAMENTALE:
 * Les suggestions sont TOUJOURS optionnelles et formulées avec prudence.
 * L'intégration est ADDITIVE, jamais BLOQUANTE.
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import type {
  AffectEstimationState,
  VisualCoachingEvent,
  VisualEventType,
  CoachingSuggestion,
  SuggestionType,
  VisualLevel,
} from '@/types/visionAffect';

import {
  COACHING_CONFIG,
  SUGGESTION_MESSAGES,
} from '@/config/visionAffect.config';

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface StreakTracker {
  energy: { level: VisualLevel; count: number; startedAt: number }[];
  tension: { level: VisualLevel; count: number; startedAt: number }[];
  engagement: { level: VisualLevel; count: number; startedAt: number }[];
}

interface CooldownTracker {
  [key: string]: number; // suggestionType -> lastSuggestedAt
}

type EventListener = (event: VisualCoachingEvent) => void;
type SuggestionListener = (suggestion: CoachingSuggestion) => void;

// ============================================================================
// EXTERNAL ENGINE INTERFACES (pour intégration)
// ============================================================================

/**
 * Interface pour EnergyEngine (existant)
 */
export interface EnergyEngineAdapter {
  getCurrentEnergy(): number;
  mergeVisualEnergy(visualLevel: VisualLevel, confidence: number): void;
}

/**
 * Interface pour AgendaEngine (existant)
 */
export interface AgendaEngineAdapter {
  getTodayLoad(): 'light' | 'moderate' | 'heavy';
  getNextBreakIn(): number | null; // minutes
  suggestMicroPause(): void;
}

/**
 * Interface pour CoachingEngine (existant)
 */
export interface CoachingEngineAdapter {
  addVisualSuggestion(suggestion: CoachingSuggestion): void;
}

// ============================================================================
// VISUAL COACHING BRIDGE CLASS
// ============================================================================

/**
 * VisualCoachingBridge v∞
 *
 * Pont entre le Vision Engine et les autres moteurs TITANE.
 * Génère des suggestions prudentes basées sur les indices visuels.
 */
export class VisualCoachingBridge {
  private static instance: VisualCoachingBridge | null = null;

  // Adapters externes
  private energyAdapter: EnergyEngineAdapter | null = null;
  private agendaAdapter: AgendaEngineAdapter | null = null;
  private coachingAdapter: CoachingEngineAdapter | null = null;

  // Tracking
  private streakTracker: StreakTracker = {
    energy: [],
    tension: [],
    engagement: [],
  };

  private cooldownTracker: CooldownTracker = {};
  private lastAffectState: AffectEstimationState | null = null;
  private lastActivityTimestamp: number = Date.now();

  // Événements récents
  private recentEvents: VisualCoachingEvent[] = [];
  private readonly maxRecentEvents = 50;

  // Listeners
  private eventListeners: Set<EventListener> = new Set();
  private suggestionListeners: Set<SuggestionListener> = new Set();

  private constructor() {}

  /**
   * Singleton pattern
   */
  static getInstance(): VisualCoachingBridge {
    if (!VisualCoachingBridge.instance) {
      VisualCoachingBridge.instance = new VisualCoachingBridge();
    }
    return VisualCoachingBridge.instance;
  }

  /**
   * Réinitialise l'instance
   */
  static resetInstance(): void {
    VisualCoachingBridge.instance = null;
  }

  // ============================================================================
  // CONFIGURATION ADAPTERS
  // ============================================================================

  /**
   * Configure l'adapter EnergyEngine
   */
  setEnergyAdapter(adapter: EnergyEngineAdapter): void {
    this.energyAdapter = adapter;
  }

  /**
   * Configure l'adapter AgendaEngine
   */
  setAgendaAdapter(adapter: AgendaEngineAdapter): void {
    this.agendaAdapter = adapter;
  }

  /**
   * Configure l'adapter CoachingEngine
   */
  setCoachingAdapter(adapter: CoachingEngineAdapter): void {
    this.coachingAdapter = adapter;
  }

  // ============================================================================
  // LISTENERS
  // ============================================================================

  /**
   * Ajoute un listener d'événements
   */
  addEventListener(listener: EventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * Retire un listener d'événements
   */
  removeEventListener(listener: EventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * Ajoute un listener de suggestions
   */
  addSuggestionListener(listener: SuggestionListener): void {
    this.suggestionListeners.add(listener);
  }

  /**
   * Retire un listener de suggestions
   */
  removeSuggestionListener(listener: SuggestionListener): void {
    this.suggestionListeners.delete(listener);
  }

  // ============================================================================
  // TRAITEMENT AFFECT STATE
  // ============================================================================

  /**
   * Traite un nouvel état d'affect et génère des événements/suggestions
   */
  processAffectState(affectState: AffectEstimationState): VisualCoachingEvent[] {
    const events: VisualCoachingEvent[] = [];
    const now = Date.now();

    // Ignorer si confiance trop basse
    if (affectState.confidence < 0.3) {
      return events;
    }

    // Mettre à jour les streaks
    this.updateStreaks(affectState);

    // Vérifier les conditions d'alerte
    const energyEvent = this.checkEnergyDrop(affectState, now);
    if (energyEvent) events.push(energyEvent);

    const tensionEvent = this.checkTensionSpike(affectState, now);
    if (tensionEvent) events.push(tensionEvent);

    const engagementEvent = this.checkEngagementDrop(affectState, now);
    if (engagementEvent) events.push(engagementEvent);

    const stillnessEvent = this.checkExtendedStillness(affectState, now);
    if (stillnessEvent) events.push(stillnessEvent);

    // Synchroniser avec les moteurs externes
    this.syncWithExternalEngines(affectState);

    // Stocker les événements
    this.recentEvents.push(...events);
    while (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.shift();
    }

    // Notifier les listeners
    events.forEach(event => {
      this.eventListeners.forEach(listener => listener(event));

      if (event.suggestion) {
        this.suggestionListeners.forEach(listener => listener(event.suggestion!));
      }
    });

    // Mettre à jour l'état
    this.lastAffectState = affectState;
    this.lastActivityTimestamp = now;

    return events;
  }

  // ============================================================================
  // DÉTECTION D'ÉVÉNEMENTS
  // ============================================================================

  /**
   * Vérifie une baisse d'énergie prolongée
   */
  private checkEnergyDrop(
    state: AffectEstimationState,
    now: number
  ): VisualCoachingEvent | null {
    const streaks = this.streakTracker.energy.filter(s => s.level === 'low');

    if (streaks.length === 0) return null;

    const totalLowCount = streaks.reduce((sum, s) => sum + s.count, 0);
    const firstLowAt = streaks[0]?.startedAt || now;
    const duration = now - firstLowAt;

    // Vérifier les conditions
    if (
      totalLowCount >= COACHING_CONFIG.alertThresholds.energyDropStreak &&
      duration >= COACHING_CONFIG.energyDropDelayMs &&
      this.canSuggest('PAUSE_SUGGESTION', now)
    ) {
      this.markSuggested('PAUSE_SUGGESTION', now);

      return {
        type: 'ENERGY_DROP_DETECTED',
        timestamp: now,
        affectState: state,
        suggestion: this.createSuggestion('PAUSE_SUGGESTION', 'medium'),
      };
    }

    return null;
  }

  /**
   * Vérifie un pic de tension prolongé
   */
  private checkTensionSpike(
    state: AffectEstimationState,
    now: number
  ): VisualCoachingEvent | null {
    const streaks = this.streakTracker.tension.filter(s => s.level === 'high');

    if (streaks.length === 0) return null;

    const totalHighCount = streaks.reduce((sum, s) => sum + s.count, 0);
    const firstHighAt = streaks[0]?.startedAt || now;
    const duration = now - firstHighAt;

    if (
      totalHighCount >= COACHING_CONFIG.alertThresholds.tensionSpikeStreak &&
      duration >= COACHING_CONFIG.tensionAlertDelayMs &&
      this.canSuggest('BREATHING_SUGGESTION', now)
    ) {
      this.markSuggested('BREATHING_SUGGESTION', now);

      return {
        type: 'TENSION_SPIKE_DETECTED',
        timestamp: now,
        affectState: state,
        suggestion: this.createSuggestion('BREATHING_SUGGESTION', 'medium'),
      };
    }

    return null;
  }

  /**
   * Vérifie une baisse d'engagement prolongée
   */
  private checkEngagementDrop(
    state: AffectEstimationState,
    now: number
  ): VisualCoachingEvent | null {
    const streaks = this.streakTracker.engagement.filter(s => s.level === 'low');

    if (streaks.length === 0) return null;

    const totalLowCount = streaks.reduce((sum, s) => sum + s.count, 0);

    if (
      totalLowCount >= COACHING_CONFIG.alertThresholds.engagementDropStreak &&
      this.canSuggest('MOVEMENT_SUGGESTION', now)
    ) {
      this.markSuggested('MOVEMENT_SUGGESTION', now);

      return {
        type: 'ENGAGEMENT_LOW',
        timestamp: now,
        affectState: state,
        suggestion: this.createSuggestion('MOVEMENT_SUGGESTION', 'low'),
      };
    }

    return null;
  }

  /**
   * Vérifie une immobilité prolongée
   */
  private checkExtendedStillness(
    state: AffectEstimationState,
    now: number
  ): VisualCoachingEvent | null {
    // Utiliser l'historique pour détecter l'immobilité
    const recentHistory = state.history.slice(-30);

    if (recentHistory.length < 30) return null;

    // Vérifier si tous les niveaux sont "low" ou "medium" pour l'énergie
    const allCalm = recentHistory.every(h =>
      h.energy === 'low' || h.energy === 'medium'
    );

    const duration = now - this.lastActivityTimestamp;

    if (
      allCalm &&
      duration >= COACHING_CONFIG.stillnessAlertMs &&
      this.canSuggest('MOVEMENT_SUGGESTION', now)
    ) {
      this.markSuggested('MOVEMENT_SUGGESTION', now);

      return {
        type: 'EXTENDED_STILLNESS',
        timestamp: now,
        affectState: state,
        suggestion: this.createSuggestion('MOVEMENT_SUGGESTION', 'low'),
      };
    }

    return null;
  }

  // ============================================================================
  // STREAK TRACKING
  // ============================================================================

  /**
   * Met à jour les trackers de séquences
   */
  private updateStreaks(state: AffectEstimationState): void {
    const now = Date.now();

    // Energy
    this.updateSingleStreak(
      this.streakTracker.energy,
      state.visualEnergyLevel,
      now
    );

    // Tension
    this.updateSingleStreak(
      this.streakTracker.tension,
      state.visualTensionLevel,
      now
    );

    // Engagement
    this.updateSingleStreak(
      this.streakTracker.engagement,
      state.visualEngagementLevel,
      now
    );
  }

  /**
   * Met à jour un tracker de séquence unique
   */
  private updateSingleStreak(
    streaks: { level: VisualLevel; count: number; startedAt: number }[],
    currentLevel: VisualLevel,
    now: number
  ): void {
    // Chercher une séquence existante pour ce niveau
    const existing = streaks.find(s => s.level === currentLevel);

    if (existing) {
      existing.count++;
    } else {
      // Nouvelle séquence
      streaks.push({
        level: currentLevel,
        count: 1,
        startedAt: now,
      });
    }

    // Nettoyer les anciennes séquences d'autres niveaux
    // (garder seulement les 5 dernières minutes)
    const cutoff = now - 5 * 60 * 1000;
    const toRemove = streaks.filter(s =>
      s.level !== currentLevel && s.startedAt < cutoff
    );

    toRemove.forEach(s => {
      const idx = streaks.indexOf(s);
      if (idx >= 0) streaks.splice(idx, 1);
    });
  }

  // ============================================================================
  // COOLDOWN MANAGEMENT
  // ============================================================================

  /**
   * Vérifie si une suggestion peut être émise
   */
  private canSuggest(type: SuggestionType, now: number): boolean {
    const lastSuggested = this.cooldownTracker[type];
    if (!lastSuggested) return true;

    return now - lastSuggested >= COACHING_CONFIG.suggestionCooldownMs;
  }

  /**
   * Marque une suggestion comme émise
   */
  private markSuggested(type: SuggestionType, now: number): void {
    this.cooldownTracker[type] = now;
  }

  // ============================================================================
  // CRÉATION DE SUGGESTIONS
  // ============================================================================

  /**
   * Crée une suggestion de coaching
   */
  private createSuggestion(
    type: SuggestionType,
    priority: 'low' | 'medium' | 'high'
  ): CoachingSuggestion {
    return {
      type,
      message: SUGGESTION_MESSAGES[type],
      priority,
      actionable: true,
      expires: Date.now() + 10 * 60 * 1000, // Expire dans 10 min
    };
  }

  // ============================================================================
  // SYNCHRONISATION MOTEURS EXTERNES
  // ============================================================================

  /**
   * Synchronise avec les moteurs externes
   */
  private syncWithExternalEngines(state: AffectEstimationState): void {
    // EnergyEngine - fusionner l'énergie visuelle
    if (this.energyAdapter) {
      this.energyAdapter.mergeVisualEnergy(
        state.visualEnergyLevel,
        state.confidence
      );
    }

    // AgendaEngine - suggérer pause si conditions réunies
    if (this.agendaAdapter && state.visualTensionLevel === 'high') {
      const load = this.agendaAdapter.getTodayLoad();
      if (load === 'heavy') {
        // Haute tension + journée chargée = suggérer micro-pause
        this.agendaAdapter.suggestMicroPause();
      }
    }

    // CoachingEngine - transférer les suggestions
    if (this.coachingAdapter) {
      const latestEvent = this.recentEvents[this.recentEvents.length - 1];
      if (latestEvent?.suggestion) {
        this.coachingAdapter.addVisualSuggestion(latestEvent.suggestion);
      }
    }
  }

  // ============================================================================
  // API PUBLIQUE
  // ============================================================================

  /**
   * Vérifie si une pause devrait être suggérée
   *
   * API pour CoachingEngine externe
   */
  shouldSuggestPause(
    affectState: AffectEstimationState,
    energyLevel?: number,
    agendaLoad?: 'light' | 'moderate' | 'heavy'
  ): { suggest: boolean; reason: string } {
    // Pas assez de confiance
    if (affectState.confidence < 0.4) {
      return { suggest: false, reason: 'Confiance visuelle insuffisante' };
    }

    // Énergie basse + tension haute
    if (
      affectState.visualEnergyLevel === 'low' &&
      affectState.visualTensionLevel === 'high'
    ) {
      return {
        suggest: true,
        reason: 'Les indices visuels suggèrent fatigue et tension combinées',
      };
    }

    // Énergie déclarée basse + visuel cohérent
    if (energyLevel !== undefined && energyLevel < 30) {
      if (affectState.visualEnergyLevel === 'low') {
        return {
          suggest: true,
          reason: 'Énergie déclarée et visuelle toutes deux basses',
        };
      }
    }

    // Journée chargée + tension visible
    if (agendaLoad === 'heavy' && affectState.visualTensionLevel !== 'low') {
      return {
        suggest: true,
        reason: 'Journée chargée avec signes de tension visible',
      };
    }

    return { suggest: false, reason: 'Aucune condition de pause détectée' };
  }

  /**
   * Retourne les événements récents
   */
  getRecentEvents(): VisualCoachingEvent[] {
    return [...this.recentEvents];
  }

  /**
   * Efface les événements et réinitialise les trackers
   */
  reset(): void {
    this.recentEvents = [];
    this.streakTracker = { energy: [], tension: [], engagement: [] };
    this.cooldownTracker = {};
    this.lastAffectState = null;
    this.lastActivityTimestamp = Date.now();
  }
}

// ============================================================================
// EXPORTS FONCTIONNELS
// ============================================================================

let bridgeInstance: VisualCoachingBridge | null = null;

/**
 * Initialise le VisualCoachingBridge
 */
export function initVisualCoachingBridge(): VisualCoachingBridge {
  bridgeInstance = VisualCoachingBridge.getInstance();
  return bridgeInstance;
}

/**
 * Récupère l'instance
 */
export function getVisualCoachingBridge(): VisualCoachingBridge | null {
  return bridgeInstance;
}

/**
 * Traite un état d'affect (raccourci)
 */
export function processVisualAffect(
  state: AffectEstimationState
): VisualCoachingEvent[] {
  return bridgeInstance?.processAffectState(state) ?? [];
}

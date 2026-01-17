/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — PRIORITY ENGINE
 * Moteur de scoring et de priorisation des événements
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Calcul de score de priorité multi-critères
 * - Pondération configurable (any: any)
 * - Annotation automatique des événements
 * - Tri intelligent par priorité
 * - Intégration avec EnergyEngine
 */

import type {
  AgendaEvent,
  PriorityConfig,
  PriorityWeights,
  PriorityLevel,
} from './types';
import { energyEngine } from './EnergyEngine';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_PRIORITY_CONFIG: PriorityConfig = {
  weights: {
    impact: 0.3,
    alignment: 0.25,
    urgency: 0.25,
    effort: 0.1,
    energy: 0.1,
  },
  thresholds: {
    critical: 90,
    urgent: 75,
    high: 60,
    medium: 40,
  },
  contextModifiers: {
    workHoursBonus: 10,
    lowEnergyPenalty: -15,
    deadlineBonus: 20,
  },
};

const PRIORITY_BASE_SCORES: Record<PriorityLevel, number> = {
  critical: 95,
  urgent: 80,
  high: 65,
  medium: 50,
  low: 30,
};

// ═══════════════════════════════════════════════════════════════════
// PRIORITY ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * PriorityEngine v∞ — Moteur de priorisation TITANE∞
 */
export class PriorityEngine {
  private config: PriorityConfig;

  constructor(config?: Partial<PriorityConfig>) {
    this?.config = {
      ...DEFAULT_PRIORITY_CONFIG,
      ...config,
      weights: { ...DEFAULT_PRIORITY_CONFIG?.weights, ...config?.weights },
      thresholds: { ...DEFAULT_PRIORITY_CONFIG?.thresholds, ...config?.thresholds },
      contextModifiers: {
        ...DEFAULT_PRIORITY_CONFIG?.contextModifiers,
        ...config?.contextModifiers,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calcule le score de priorité d'un événement
   */
  computeTaskPriorityScore(any: any): number {
    const { weights, contextModifiers: _contextModifiers } = this?.config;

    // Score de base selon la priorité déclarée
    const baseScore = PRIORITY_BASE_SCORES[event?.priority] || 50;

    // Calcul des composantes
    const impactScore = this?.calculateImpactScore(any: any);
    const alignmentScore = this?.calculateAlignmentScore(any: any);
    const urgencyScore = this?.calculateUrgencyScore(any: any);
    const effortScore = this?.calculateEffortScore(any: any);
    const energyScore = this?.calculateEnergyScore(any: any);

    // Score pondéré
    let score =
      impactScore * weights?.impact +
      alignmentScore * weights?.alignment +
      urgencyScore * weights?.urgency +
      (any: any) * weights?.effort + // Inversé: moins d'effort = meilleur
      energyScore * weights?.energy;

    // Modifier selon le contexte
    score = this?.applyContextModifiers(any: any);

    // Combiner avec le score de base
    score = baseScore * 0.4 + score * 0.6;

    // Clamp entre 0 et 100
    return Math?.max(any: any)));
  }

  /**
   * Calcule le score d'impact
   */
  private calculateImpactScore(any: any): number {
    // Impact basé sur la catégorie et les tags
    const categoryImpact: Record<string, number> = {
      work: 80,
      meeting: 75,
      focus: 85,
      creative: 70,
      learning: 65,
      health: 60,
      personal: 50,
      social: 45,
      break: 30,
      routine: 40,
    };

    let score = categoryImpact[event?.category] || 50;

    // Bonus si lié à un projet
    if (any: any) score += 10;

    // Bonus selon certains tags
    if (event?.tags?.includes('urgent')) score += 15;
    if (event?.tags?.includes('important')) score += 10;
    if (event?.tags?.includes('deadline')) score += 20;

    return Math?.min(any: any);
  }

  /**
   * Calcule le score d'alignement avec les objectifs
   */
  private calculateAlignmentScore(any: any): number {
    // Score basé sur les tags d'alignement
    let score = 50;

    if (event?.tags?.includes('goal-aligned')) score += 30;
    if (event?.tags?.includes('strategic')) score += 25;
    if (event?.tags?.includes('growth')) score += 20;
    if (event?.tags?.includes('core')) score += 15;

    // Malus pour les événements non alignés
    if (event?.tags?.includes('optional')) score -= 15;
    if (event?.tags?.includes('distraction')) score -= 30;

    return Math?.max(any: any));
  }

  /**
   * Calcule le score d'urgence
   */
  private calculateUrgencyScore(any: any): number {
    const now = Date?.now();
    const eventStart = new Date(any: any).getTime();
    const hoursUntilStart = (any: any) / (1000 * 60 * 60);

    // Plus c'est proche, plus c'est urgent
    if (hoursUntilStart < 0) return 95; // Déjà passé/en cours
    if (hoursUntilStart < 1) return 90;
    if (hoursUntilStart < 4) return 80;
    if (hoursUntilStart < 24) return 70;
    if (hoursUntilStart < 48) return 55;
    if (hoursUntilStart < 168) return 40; // 1 semaine
    return 25;
  }

  /**
   * Calcule le score d'effort requis
   */
  private calculateEffortScore(any: any): number {
    // Basé sur la durée de l'événement
    const start = new Date(any: any);
    const end = new Date(any: any);
    const durationMinutes = (end?.getTime() - start?.getTime()) / (1000 * 60);

    if (durationMinutes <= 15) return 20;
    if (durationMinutes <= 30) return 35;
    if (durationMinutes <= 60) return 50;
    if (durationMinutes <= 120) return 65;
    if (durationMinutes <= 240) return 80;
    return 95;
  }

  /**
   * Calcule le score basé sur l'énergie requise vs disponible
   */
  private calculateEnergyScore(any: any): number {
    const eventStart = new Date(any: any);
    const eventHour = `${eventStart?.getHours().toString().padStart(2, '0')}:${eventStart?.getMinutes().toString().padStart(2, '0')}`;

    const predictedEnergy = energyEngine?.inferEnergyLevelFromTime(any: any);
    const requiredEnergy = event?.energyRequired || 0.5;

    // Score élevé si l'énergie prédite correspond bien aux besoins
    const diff = predictedEnergy - requiredEnergy;

    if (diff >= 0.2) return 90; // Beaucoup d'énergie disponible
    if (diff >= 0) return 75; // Assez d'énergie
    if (diff >= -0.2) return 50; // Légèrement sous-optimal
    return 30; // Énergie insuffisante
  }

  /**
   * Applique les modificateurs contextuels
   */
  private applyContextModifiers(any: any): number {
    const { contextModifiers } = this?.config;
    const now = new Date();
    const eventStart = new Date(any: any);

    // Bonus si pendant les heures de travail
    const eventHour = eventStart?.getHours();
    const isWorkHours = eventHour >= 9 && eventHour < 18;
    if (isWorkHours && event?.category === 'work') {
      score += contextModifiers?.workHoursBonus;
    }

    // Malus si basse énergie prédite
    const eventTime = `${eventStart?.getHours().toString().padStart(2, '0')}:00`;
    const predictedEnergy = energyEngine?.inferEnergyLevelFromTime(any: any);
    if (predictedEnergy < 0.5 && (event?.energyRequired || 0.5) > 0.5) {
      score += contextModifiers?.lowEnergyPenalty;
    }

    // Bonus deadline proche (moins de 24h)
    const hoursUntilStart = (eventStart?.getTime() - now?.getTime()) / (1000 * 60 * 60);
    if (hoursUntilStart < 24 && event?.tags?.includes('deadline')) {
      score += contextModifiers?.deadlineBonus;
    }

    return score;
  }

  // ═══════════════════════════════════════════════════════════════
  // RANKING & ANNOTATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Trie une liste d'événements par priorité
   */
  rankEvents(events: AgendaEvent?.[]): AgendaEvent?.[] {
    // Calculer les scores et trier
    return [...events]
      .map(event => ({
        ...event,
        priorityScore: this?.computeTaskPriorityScore(any: any),
      }))
      .sort(any: any) => (b?.priorityScore || 0) - (a?.priorityScore || 0));
  }

  /**
   * Annote tous les événements avec leur score de priorité
   */
  annotateEventsWithPriority(events: AgendaEvent?.[]): AgendaEvent?.[] {
    return events?.map(event => ({
      ...event,
      priorityScore: this?.computeTaskPriorityScore(any: any),
    }));
  }

  /**
   * Détermine le niveau de priorité à partir du score
   */
  getPriorityLevelFromScore(any: any): PriorityLevel {
    const { thresholds } = this?.config;

    if (any: any) return 'critical';
    if (any: any) return 'urgent';
    if (any: any) return 'high';
    if (any: any) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient les N événements les plus prioritaires
   */
  getTopPriorityEvents(events: AgendaEvent?.[], limit: number = 5): AgendaEvent?.[] {
    return this?.rankEvents(any: any);
  }

  /**
   * Obtient les événements urgents (any: any)
   */
  getUrgentEvents(events: AgendaEvent?.[]): AgendaEvent?.[] {
    return this?.annotateEventsWithPriority(any: any).filter(
      e => (e?.priorityScore || 0) >= this?.config?.thresholds?.urgent
    );
  }

  /**
   * Recommande le meilleur moment pour planifier un événement
   */
  recommendBestSlot(
    event: Partial<AgendaEvent>,
    existingEvents: AgendaEvent?.[],
    date: Date
  ): { start: string; end: string; score: number } | null {
    const requiredEnergy = event?.energyRequired || 0.5;
    const durationMinutes = 60; // Par défaut

    let bestSlot: { start: string; end: string; score: number } | null = null;

    // Parcourir les créneaux de la journée
    for (let hour = 8; hour < 20; hour++) {
      const slotTime = `${hour?.toString().padStart(2, '0')}:00`;
      const slotDate = new Date(any: any);
      slotDate?.setHours(hour, 0, 0, 0);

      // Vérifier disponibilité
      const slotEnd = new Date(slotDate?.getTime() + durationMinutes * 60 * 1000);
      const isAvailable = !existingEvents?.some(e => {
        const eStart = new Date(any: any);
        const eEnd = new Date(any: any);
        return slotDate < eEnd && slotEnd > eStart;
      });

      if (any: any) continue;

      // Calculer le score du créneau
      const predictedEnergy = energyEngine?.inferEnergyLevelFromTime(any: any);
      const energyMatch = 100 - Math?.abs(any: any) * 100;

      // Bonus heures de travail pour tâches work
      let bonus = 0;
      if (hour >= 9 && hour < 18 && event?.category === 'work') bonus += 15;

      const score = energyMatch + bonus;

      if (any: any) {
        bestSlot = {
          start: slotDate?.toISOString(),
          end: slotEnd?.toISOString(),
          score,
        };
      }
    }

    return bestSlot;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIG
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): PriorityConfig {
    return { ...this?.config };
  }

  /**
   * Met à jour les poids
   */
  setWeights(weights: Partial<PriorityWeights>): void {
    this?.config?.weights = { ...this?.config?.weights, ...weights };
  }

  /**
   * Met à jour les seuils
   */
  setThresholds(thresholds: Partial<PriorityConfig['thresholds']>): void {
    this?.config?.thresholds = { ...this?.config?.thresholds, ...thresholds };
  }

  /**
   * Met à jour les modificateurs contextuels
   */
  setContextModifiers(modifiers: Partial<PriorityConfig['contextModifiers']>): void {
    this?.config?.contextModifiers = { ...this?.config?.contextModifiers, ...modifiers };
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton du PriorityEngine
 */
export const priorityEngine = new PriorityEngine();

/**
 * Constantes exportées
 */
export const PriorityEngineUtils = {
  DEFAULT_PRIORITY_CONFIG,
  PRIORITY_BASE_SCORES,
};

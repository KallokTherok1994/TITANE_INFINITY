/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — PRIORITY ENGINE
 * Moteur de scoring et de priorisation des événements
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Calcul de score de priorité multi-critères
 * - Pondération configurable (impact, alignement, urgence, effort)
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
    this.config = {
      ...DEFAULT_PRIORITY_CONFIG,
      ...config,
      weights: { ...DEFAULT_PRIORITY_CONFIG.weights, ...config?.weights },
      thresholds: { ...DEFAULT_PRIORITY_CONFIG.thresholds, ...config?.thresholds },
      contextModifiers: { ...DEFAULT_PRIORITY_CONFIG.contextModifiers, ...config?.contextModifiers },
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORE CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calcule le score de priorité d'un événement
   */
  computeTaskPriorityScore(event: AgendaEvent): number {
    const { weights, contextModifiers: _contextModifiers } = this.config;

    // Score de base selon la priorité déclarée
    const baseScore = PRIORITY_BASE_SCORES[event.priority] || 50;

    // Calcul des composantes
    const impactScore = this.calculateImpactScore(event);
    const alignmentScore = this.calculateAlignmentScore(event);
    const urgencyScore = this.calculateUrgencyScore(event);
    const effortScore = this.calculateEffortScore(event);
    const energyScore = this.calculateEnergyScore(event);

    // Score pondéré
    let score =
      impactScore * weights.impact +
      alignmentScore * weights.alignment +
      urgencyScore * weights.urgency +
      (100 - effortScore) * weights.effort + // Inversé: moins d'effort = meilleur
      energyScore * weights.energy;

    // Modifier selon le contexte
    score = this.applyContextModifiers(score, event);

    // Combiner avec le score de base
    score = (baseScore * 0.4) + (score * 0.6);

    // Clamp entre 0 et 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calcule le score d'impact
   */
  private calculateImpactScore(event: AgendaEvent): number {
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

    let score = categoryImpact[event.category] || 50;

    // Bonus si lié à un projet
    if (event.projectId) score += 10;

    // Bonus selon certains tags
    if (event.tags.includes('urgent')) score += 15;
    if (event.tags.includes('important')) score += 10;
    if (event.tags.includes('deadline')) score += 20;

    return Math.min(100, score);
  }

  /**
   * Calcule le score d'alignement avec les objectifs
   */
  private calculateAlignmentScore(event: AgendaEvent): number {
    // Score basé sur les tags d'alignement
    let score = 50;

    if (event.tags.includes('goal-aligned')) score += 30;
    if (event.tags.includes('strategic')) score += 25;
    if (event.tags.includes('growth')) score += 20;
    if (event.tags.includes('core')) score += 15;

    // Malus pour les événements non alignés
    if (event.tags.includes('optional')) score -= 15;
    if (event.tags.includes('distraction')) score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calcule le score d'urgence
   */
  private calculateUrgencyScore(event: AgendaEvent): number {
    const now = Date.now();
    const eventStart = new Date(event.startDateTime).getTime();
    const hoursUntilStart = (eventStart - now) / (1000 * 60 * 60);

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
  private calculateEffortScore(event: AgendaEvent): number {
    // Basé sur la durée de l'événement
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

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
  private calculateEnergyScore(event: AgendaEvent): number {
    const eventStart = new Date(event.startDateTime);
    const eventHour = `${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`;

    const predictedEnergy = energyEngine.inferEnergyLevelFromTime(eventHour);
    const requiredEnergy = event.energyRequired || 0.5;

    // Score élevé si l'énergie prédite correspond bien aux besoins
    const diff = predictedEnergy - requiredEnergy;

    if (diff >= 0.2) return 90; // Beaucoup d'énergie disponible
    if (diff >= 0) return 75;   // Assez d'énergie
    if (diff >= -0.2) return 50; // Légèrement sous-optimal
    return 30; // Énergie insuffisante
  }

  /**
   * Applique les modificateurs contextuels
   */
  private applyContextModifiers(score: number, event: AgendaEvent): number {
    const { contextModifiers } = this.config;
    const now = new Date();
    const eventStart = new Date(event.startDateTime);

    // Bonus si pendant les heures de travail
    const eventHour = eventStart.getHours();
    const isWorkHours = eventHour >= 9 && eventHour < 18;
    if (isWorkHours && event.category === 'work') {
      score += contextModifiers.workHoursBonus;
    }

    // Malus si basse énergie prédite
    const eventTime = `${eventStart.getHours().toString().padStart(2, '0')}:00`;
    const predictedEnergy = energyEngine.inferEnergyLevelFromTime(eventTime);
    if (predictedEnergy < 0.5 && (event.energyRequired || 0.5) > 0.5) {
      score += contextModifiers.lowEnergyPenalty;
    }

    // Bonus deadline proche (moins de 24h)
    const hoursUntilStart = (eventStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilStart < 24 && event.tags.includes('deadline')) {
      score += contextModifiers.deadlineBonus;
    }

    return score;
  }

  // ═══════════════════════════════════════════════════════════════
  // RANKING & ANNOTATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Trie une liste d'événements par priorité
   */
  rankEvents(events: AgendaEvent[]): AgendaEvent[] {
    // Calculer les scores et trier
    return [...events]
      .map(event => ({
        ...event,
        priorityScore: this.computeTaskPriorityScore(event),
      }))
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  }

  /**
   * Annote tous les événements avec leur score de priorité
   */
  annotateEventsWithPriority(events: AgendaEvent[]): AgendaEvent[] {
    return events.map(event => ({
      ...event,
      priorityScore: this.computeTaskPriorityScore(event),
    }));
  }

  /**
   * Détermine le niveau de priorité à partir du score
   */
  getPriorityLevelFromScore(score: number): PriorityLevel {
    const { thresholds } = this.config;

    if (score >= thresholds.critical) return 'critical';
    if (score >= thresholds.urgent) return 'urgent';
    if (score >= thresholds.high) return 'high';
    if (score >= thresholds.medium) return 'medium';
    return 'low';
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient les N événements les plus prioritaires
   */
  getTopPriorityEvents(events: AgendaEvent[], limit: number = 5): AgendaEvent[] {
    return this.rankEvents(events).slice(0, limit);
  }

  /**
   * Obtient les événements urgents (score >= seuil urgent)
   */
  getUrgentEvents(events: AgendaEvent[]): AgendaEvent[] {
    return this.annotateEventsWithPriority(events)
      .filter(e => (e.priorityScore || 0) >= this.config.thresholds.urgent);
  }

  /**
   * Recommande le meilleur moment pour planifier un événement
   */
  recommendBestSlot(
    event: Partial<AgendaEvent>,
    existingEvents: AgendaEvent[],
    date: Date
  ): { start: string; end: string; score: number } | null {
    const requiredEnergy = event.energyRequired || 0.5;
    const durationMinutes = 60; // Par défaut

    let bestSlot: { start: string; end: string; score: number } | null = null;

    // Parcourir les créneaux de la journée
    for (let hour = 8; hour < 20; hour++) {
      const slotTime = `${hour.toString().padStart(2, '0')}:00`;
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);

      // Vérifier disponibilité
      const slotEnd = new Date(slotDate.getTime() + durationMinutes * 60 * 1000);
      const isAvailable = !existingEvents.some(e => {
        const eStart = new Date(e.startDateTime);
        const eEnd = new Date(e.endDateTime);
        return slotDate < eEnd && slotEnd > eStart;
      });

      if (!isAvailable) continue;

      // Calculer le score du créneau
      const predictedEnergy = energyEngine.inferEnergyLevelFromTime(slotTime);
      const energyMatch = 100 - Math.abs(predictedEnergy - requiredEnergy) * 100;

      // Bonus heures de travail pour tâches work
      let bonus = 0;
      if (hour >= 9 && hour < 18 && event.category === 'work') bonus += 15;

      const score = energyMatch + bonus;

      if (!bestSlot || score > bestSlot.score) {
        bestSlot = {
          start: slotDate.toISOString(),
          end: slotEnd.toISOString(),
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
    return { ...this.config };
  }

  /**
   * Met à jour les poids
   */
  setWeights(weights: Partial<PriorityWeights>): void {
    this.config.weights = { ...this.config.weights, ...weights };
  }

  /**
   * Met à jour les seuils
   */
  setThresholds(thresholds: Partial<PriorityConfig['thresholds']>): void {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds };
  }

  /**
   * Met à jour les modificateurs contextuels
   */
  setContextModifiers(modifiers: Partial<PriorityConfig['contextModifiers']>): void {
    this.config.contextModifiers = { ...this.config.contextModifiers, ...modifiers };
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

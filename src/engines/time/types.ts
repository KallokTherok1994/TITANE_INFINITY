/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — TIME ENGINE TYPES
 * Types pour le système de gestion du temps et de l'agenda
 * ═══════════════════════════════════════════════════════════════════
 *
 * Architecture:
 * - TimeState: État du temps actuel (heure, fuseau, segments)
 * - AgendaMeta: Configuration de l'agenda
 * - AgendaEvent: Événements de l'agenda
 * - EnergyState: État énergétique de l'utilisateur
 * - PriorityConfig: Configuration du scoring de priorité
 */

// ═══════════════════════════════════════════════════════════════════
// TIME STATE
// ═══════════════════════════════════════════════════════════════════

/**
 * Segment de journée (matin, après-midi, soir, nuit)
 */
export interface DaySegment {
  /** Identifiant unique du segment */
  id: 'early_morning' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';
  /** Label affiché */
  label: string;
  /** Heure de début (format HH:mm) */
  startTime: string;
  /** Heure de fin (format HH:mm) */
  endTime: string;
  /** Couleur associée (monochrome TITANE) */
  color: string;
  /** Niveau d'énergie typique (0-1) */
  typicalEnergy: number;
  /** Icône emoji */
  icon: string;
}

/**
 * Profil journalier (jour de la semaine)
 */
export interface DayProfile {
  /** Jour de la semaine (0 = Dimanche, 6 = Samedi) */
  day: number;
  /** Label du jour */
  label: string;
  /** Jour actif (travaillé) */
  active: boolean;
  /** Profil du jour */
  profile: 'work' | 'rest' | 'focus' | 'creative' | 'social';
  /** Heures de travail customisées (optionnel) */
  customWorkHours?: { start: string; end: string };
}

/**
 * État du temps système
 */
export interface TimeState {
  /** Date/heure actuelle (ISO string) */
  currentDateTime: string;
  /** Fuseau horaire */
  timeZone: string;
  /** Segments de la journée */
  daySegments: DaySegment[];
  /** Heures de travail par défaut */
  workHours: {
    start: string;
    end: string;
  };
  /** Template hebdomadaire */
  weekTemplate: DayProfile[];
  /** Segment actuel */
  currentSegment: DaySegment | null;
  /** Jour actuel de la semaine (0-6) */
  currentDayOfWeek: number;
  /** Est un jour travaillé */
  isWorkDay: boolean;
  /** Est dans les heures de travail */
  isWorkHours: boolean;
  /** Timestamp dernière mise à jour */
  lastUpdate: number;
}

// ═══════════════════════════════════════════════════════════════════
// AGENDA META & EVENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Vue de l'agenda
 */
export type AgendaView = 'day' | 'week' | 'month';

/**
 * Configuration de l'agenda
 */
export interface AgendaMeta {
  /** Vue par défaut */
  defaultView: AgendaView;
  /** Afficher l'overlay énergie */
  showEnergyOverlay: boolean;
  /** Afficher les blocs de focus */
  showFocusBlocks: boolean;
  /** Synchronisation automatique activée */
  autoSyncEnabled: boolean;
  /** Premier jour de la semaine (0 = Dimanche, 1 = Lundi) */
  firstDayOfWeek: number;
  /** Format 24h */
  use24HourFormat: boolean;
  /** Durée par défaut des événements (minutes) */
  defaultEventDuration: number;
  /** Intervalle de la grille horaire (minutes) */
  timeSlotInterval: 15 | 30 | 60;
  /** Heure de début de la grille */
  gridStartHour: number;
  /** Heure de fin de la grille */
  gridEndHour: number;
}

/**
 * Catégorie d'événement
 */
export type EventCategory =
  | 'work'
  | 'personal'
  | 'meeting'
  | 'focus'
  | 'break'
  | 'routine'
  | 'health'
  | 'creative'
  | 'learning'
  | 'social';

/**
 * Statut d'un événement
 */
export type EventStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';

/**
 * Niveau de priorité
 */
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

/**
 * Événement de l'agenda
 */
export interface AgendaEvent {
  /** Identifiant unique */
  id: string;
  /** Titre de l'événement */
  title: string;
  /** Description (optionnel) */
  description?: string;
  /** Date/heure de début (ISO string) */
  startDateTime: string;
  /** Date/heure de fin (ISO string) */
  endDateTime: string;
  /** Événement sur toute la journée */
  allDay: boolean;
  /** Catégorie */
  category: EventCategory;
  /** Statut */
  status: EventStatus;
  /** Niveau de priorité */
  priority: PriorityLevel;
  /** Score de priorité calculé (0-100) */
  priorityScore?: number;
  /** Niveau d'énergie requis (0-1) */
  energyRequired?: number;
  /** Tags */
  tags: string[];
  /** Récurrence (optionnel) */
  recurrence?: EventRecurrence;
  /** Rappels */
  reminders: EventReminder[];
  /** Couleur personnalisée (optionnel) */
  color?: string;
  /** Localisation (optionnel) */
  location?: string;
  /** Notes additionnelles */
  notes?: string;
  /** Lié à un projet TITANE (optionnel) */
  projectId?: string;
  /** Timestamp création */
  createdAt: number;
  /** Timestamp dernière modification */
  updatedAt: number;
}

/**
 * Récurrence d'événement
 */
export interface EventRecurrence {
  /** Type de récurrence */
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  /** Intervalle (ex: tous les 2 jours) */
  interval: number;
  /** Jours de la semaine (pour récurrence hebdomadaire) */
  daysOfWeek?: number[];
  /** Date de fin de récurrence (optionnel) */
  endDate?: string;
  /** Nombre d'occurrences (optionnel) */
  occurrences?: number;
}

/**
 * Rappel d'événement
 */
export interface EventReminder {
  /** Minutes avant l'événement */
  minutesBefore: number;
  /** Type de rappel */
  type: 'notification' | 'sound' | 'email';
  /** Activé */
  enabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// ENERGY STATE
// ═══════════════════════════════════════════════════════════════════

/**
 * Chronotype de l'utilisateur
 */
export type Chronotype = 'early_bird' | 'night_owl' | 'intermediate';

/**
 * Point d'énergie (pic ou creux)
 */
export interface EnergyPoint {
  /** Heure (format HH:mm) */
  time: string;
  /** Niveau d'énergie (0-1) */
  level: number;
  /** Label */
  label: string;
}

/**
 * Entrée historique d'énergie
 */
export interface EnergyHistoryEntry {
  /** Timestamp */
  timestamp: number;
  /** Niveau d'énergie */
  level: number;
  /** Source (auto/manual) */
  source: 'auto' | 'manual';
  /** Activité en cours */
  activity?: string;
}

/**
 * État énergétique
 */
export interface EnergyState {
  /** Chronotype détecté/configuré */
  chronotype: Chronotype;
  /** Pics d'énergie */
  peaks: EnergyPoint[];
  /** Creux d'énergie */
  dips: EnergyPoint[];
  /** Niveau d'énergie actuel (0-1) */
  currentEnergyLevel: number;
  /** Tendance (montante/descendante/stable) */
  trend: 'rising' | 'falling' | 'stable';
  /** Historique des 24 dernières heures */
  energyHistory: EnergyHistoryEntry[];
  /** Prédiction pour les prochaines heures */
  forecast: EnergyPoint[];
  /** Dernière mise à jour */
  lastUpdate: number;
}

// ═══════════════════════════════════════════════════════════════════
// PRIORITY CONFIG
// ═══════════════════════════════════════════════════════════════════

/**
 * Poids pour le calcul de priorité
 */
export interface PriorityWeights {
  /** Impact de la tâche (0-1) */
  impact: number;
  /** Alignement avec les objectifs (0-1) */
  alignment: number;
  /** Urgence (0-1) */
  urgency: number;
  /** Effort requis (0-1, inversé: moins d'effort = plus de priorité) */
  effort: number;
  /** Énergie requise (0-1) */
  energy: number;
}

/**
 * Configuration du moteur de priorité
 */
export interface PriorityConfig {
  /** Poids des critères */
  weights: PriorityWeights;
  /** Seuils de priorité */
  thresholds: {
    critical: number;
    urgent: number;
    high: number;
    medium: number;
  };
  /** Bonus/malus contextuels */
  contextModifiers: {
    /** Bonus si dans les heures de travail */
    workHoursBonus: number;
    /** Malus si basse énergie */
    lowEnergyPenalty: number;
    /** Bonus deadline proche */
    deadlineBonus: number;
  };
}

// ═══════════════════════════════════════════════════════════════════
// AGENDA COMMAND (Chat Scheduler)
// ═══════════════════════════════════════════════════════════════════

/**
 * Type de commande agenda
 */
export type AgendaCommandType = 'create' | 'update' | 'move' | 'delete' | 'query';

/**
 * Commande agenda structurée (générée par l'IA)
 */
export interface AgendaCommand {
  /** Type de commande */
  type: AgendaCommandType;
  /** Titre de l'événement */
  title?: string;
  /** Date/heure de début */
  start?: string;
  /** Date/heure de fin */
  end?: string;
  /** ID de l'événement source (pour move/update/delete) */
  fromEventId?: string;
  /** Métadonnées additionnelles */
  meta?: {
    /** Durée en minutes */
    durationMinutes?: number;
    /** Catégorie */
    category?: EventCategory;
    /** Priorité */
    priority?: PriorityLevel;
    /** Description */
    description?: string;
    /** Tags */
    tags?: string[];
    /** Récurrence */
    recurrence?: EventRecurrence;
  };
}

// ═══════════════════════════════════════════════════════════════════
// UNIFIED TIME/AGENDA STATE
// ═══════════════════════════════════════════════════════════════════

/**
 * État unifié Time/Agenda pour SingularityState
 */
export interface TimeAgendaState {
  /** État du temps */
  time: TimeState;
  /** Configuration agenda */
  agendaMeta: AgendaMeta;
  /** Événements de l'agenda */
  events: AgendaEvent[];
  /** État énergétique */
  energy: EnergyState;
  /** Configuration priorités */
  priorityConfig: PriorityConfig;
  /** Statistiques */
  stats: {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    completedToday: number;
    averageEnergyToday: number;
  };
  /** Timestamp initialisation */
  initialized: number;
  /** Version du système */
  version: string;
}

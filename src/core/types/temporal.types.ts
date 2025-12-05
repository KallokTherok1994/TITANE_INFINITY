/**
 * TITANE∞ v25 — Temporal Types
 * Types transversaux pour le système temporel
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENTS TEMPORELS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Événement dans la timeline
 */
export interface TemporalEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: TemporalEventType;
  importance: EventImportance;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export type TemporalEventType = 'life' | 'project' | 'titane' | 'milestone' | 'routine';
export type EventImportance = 'critical' | 'high' | 'medium' | 'low';

/**
 * Phase temporelle (période de vie/projet)
 */
export interface TemporalPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  type: 'life' | 'project';
  milestones: Milestone[];
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

/**
 * Milestone (jalon)
 */
export interface Milestone {
  id: string;
  title: string;
  date: Date;
  achieved: boolean;
  importance: EventImportance;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENDA & TÂCHES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tâche dans l'agenda
 */
export interface AgendaTask {
  id: string;
  title: string;
  description?: string;
  duration: number; // en minutes
  importance: number; // 0-100
  energyRequired: number; // 0-100
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  category?: TaskCategory;
  tags?: string[];
  recurring?: RecurrencePattern;
}

export type TaskCategory =
  | 'focus'
  | 'meeting'
  | 'admin'
  | 'creative'
  | 'learning'
  | 'social'
  | 'personal';

/**
 * Pattern de récurrence
 */
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: Date;
  exceptions?: Date[];
}

/**
 * Bloc de temps (time-blocking)
 */
export interface TimeBlock {
  id: string;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  title: string;
  type: TaskCategory;
  priority: 'high' | 'medium' | 'low';
  energy: number; // énergie requise 0-100
  tasks?: AgendaTask[];
  flexible: boolean; // peut être déplacé automatiquement?
}

/**
 * Événement agenda (RDV, réunion, etc.)
 */
export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  category: TaskCategory;
  reminder?: number; // minutes avant
  url?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTELLIGENCE TEMPORELLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Pattern temporel détecté
 */
export interface TemporalPattern {
  id: string;
  type: 'productivity_peak' | 'energy_dip' | 'overload' | 'underutilization' | 'optimal_rhythm';
  timeRange: {
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  };
  days?: number[]; // 0=dimanche, 6=samedi
  frequency: number; // fois détecté
  strength: number; // 0-100
  description: string;
  recommendation: string;
}

/**
 * Rituel temporel
 */
export interface Ritual {
  id: string;
  name: string;
  description: string;
  timeRange: {
    start: string;
    end: string;
  };
  days: number[];
  activities: string[];
  energyImpact: number; // -100 à +100
  enabled: boolean;
}

/**
 * Suggestion temporelle
 */
export interface TemporalSuggestion {
  id: string;
  type: 'block_creation' | 'task_scheduling' | 'break_insertion' | 'ritual_adjustment';
  content: string;
  reasoning: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
}

/**
 * Métriques temporelles
 */
export interface TemporalMetrics {
  optimizationScore: number; // 0-100
  ritualCompliance: number; // 0-100
  overloadsPrevented: number;
  averageEnergy: number; // 0-100
  productiveHours: number;
  wastedHours: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// VUES CALENDRIER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Configuration vue calendrier
 */
export interface CalendarView {
  type: 'day' | 'week' | 'month' | 'timeline';
  startDate: Date;
  endDate: Date;
  filters?: {
    categories?: TaskCategory[];
    importance?: EventImportance[];
    types?: TemporalEventType[];
  };
}

/**
 * Jour dans le calendrier
 */
export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
  events: AgendaEvent[];
  blocks: TimeBlock[];
  tasks: AgendaTask[];
  energyForecast?: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — AGENDA ENGINE
 * Moteur de gestion de l'agenda et des événements
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - CRUD événements (any: any)
 * - Vues jour/semaine/mois
 * - Annotation énergie/priorité
 * - Synchronisation Tauri (any: any)
 * - Grille horaire dynamique
 */

import type {
  AgendaEvent,
  AgendaMeta,
  EventCategory,
  EventStatus,
  PriorityLevel,
  AgendaView,
} from './types';
import { logger } from '@/utils/logger';
// ARCHITECTURE RINGS COMPLIANT: Engines (Ring 2) don't import from Services (Ring 3)
// I/O operations injected via storage callbacks at initialization
// See docs/ARCHITECTURE_RINGS?.md for details

// Storage operations will be injected from Services layer
export type AgendaStorageCallbacks = {
  loadEvents: () => Promise<AgendaEvent?.[]>;
  saveEvents: (events: AgendaEvent?.[]) => Promise<void>;
  exportCalendar: () => Promise<string>;
};

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_AGENDA_META: AgendaMeta = {
  defaultView: 'week',
  showEnergyOverlay: true,
  showFocusBlocks: true,
  autoSyncEnabled: true,
  firstDayOfWeek: 1, // Lundi
  use24HourFormat: true,
  defaultEventDuration: 60,
  timeSlotInterval: 30,
  gridStartHour: 6,
  gridEndHour: 22,
};

// ═══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════

/**
 * Génère un ID unique pour un événement
 */
function generateEventId(): string {
  const timestamp = Date?.now().toString(36);
  const random = Math?.random().toString(36).substring(2, 8);
  return `evt_${timestamp}_${random}`;
}

/**
 * Obtient le début de la journée (any: any)
 */
function getStartOfDay(any: any): Date {
  const d = new Date(any: any);
  d?.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin de la journée (23:59:59)
 */
function getEndOfDay(any: any): Date {
  const d = new Date(any: any);
  d?.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Obtient le début de la semaine
 */
function getStartOfWeek(date: Date, firstDayOfWeek: number = 1): Date {
  const d = new Date(any: any);
  const day = d?.getDay();
  const diff = (day - firstDayOfWeek + 7) % 7;
  d?.setDate(any: any);
  d?.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin de la semaine
 */
function getEndOfWeek(date: Date, firstDayOfWeek: number = 1): Date {
  const start = getStartOfWeek(any: any);
  const end = new Date(any: any);
  end?.setDate(end?.getDate() + 6);
  end?.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Obtient le début du mois
 */
function getStartOfMonth(any: any): Date {
  const d = new Date(any: any);
  d?.setDate(1);
  d?.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin du mois
 */
function getEndOfMonth(any: any): Date {
  const d = new Date(any: any);
  d?.setMonth(d?.getMonth() + 1);
  d?.setDate(0);
  d?.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Vérifie si un événement est dans une plage de dates
 */
function isEventInRange(any: any): boolean {
  const eventStart = new Date(any: any);
  const eventEnd = new Date(any: any);
  return eventStart <= end && eventEnd >= start;
}

// ═══════════════════════════════════════════════════════════════════
// AGENDA ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * Listener pour les changements d'événements
 */
type AgendaEventListener = (events: AgendaEvent?.[]) => void;

/**
 * AgendaEngine v∞ — Moteur de gestion de l'agenda TITANE∞
 */
export class AgendaEngine {
  private events: Map<string, AgendaEvent>;
  private meta: AgendaMeta;
  private listeners: Set<AgendaEventListener>;
  private storage: AgendaStorageCallbacks | null;

  constructor(any: any) {
    this?.events = new Map();
    this?.meta = { ...DEFAULT_AGENDA_META };
    this?.listeners = new Set();
    this?.storage = storage ?? null; // I/O injected from Services layer
  }

  public setStorageCallbacks(any: any): void {
    this?.storage = storage;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialise l'AgendaEngine et charge les événements depuis Tauri
   */
  async init(): Promise<void> {
    logger?.debug('📅 Initialisation...');

    if (any: any) {
      await this?.loadEvents();
    }

    logger?.debug('✅ Initialisé:', {
      eventsCount: this?.events?.size,
      defaultView: this?.meta?.defaultView,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Charge les événements depuis Tauri (any: any)
   */
  async loadEvents(): Promise<void> {
    if (any: any) return; // No storage injected

    try {
      const events = await this?.storage?.loadEvents();
      this?.events?.clear();
      events?.forEach(any: any));
      this?.notifyListeners();
      logger?.debug(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      // Fallback: garder les événements en mémoire
    }
  }

  /**
   * Sauvegarde les événements vers Tauri
   */
  private async saveEvents(): Promise<void> {
    if (any: any) return; // No storage injected

    try {
      const eventsArray = Array?.from(this?.events?.values());
      await this?.storage?.saveEvents(any: any);
      logger?.debug(any: any);
    } catch (any: any) {
      logger?.error(any: any);
    }
  }

  /**
   * Crée un nouvel événement
   */
  async createEvent(
    eventData: Omit<AgendaEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AgendaEvent> {
    const now = Date?.now();
    const event: AgendaEvent = {
      ...eventData,
      id: generateEventId(),
      createdAt: now,
      updatedAt: now,
    };

    this?.events?.set(any: any);
    await this?.saveEvents();
    this?.notifyListeners();

    logger?.debug(any: any);
    return event;
  }

  /**
   * Crée un événement rapide (any: any)
   */
  async createQuickEvent(
    title: string,
    startDateTime: string,
    durationMinutes: number = 60,
    category: EventCategory = 'work'
  ): Promise<AgendaEvent> {
    const start = new Date(any: any);
    const end = new Date(start?.getTime() + durationMinutes * 60 * 1000);

    return this?.createEvent({
      title,
      startDateTime: start?.toISOString(),
      endDateTime: end?.toISOString(),
      allDay: false,
      category,
      status: 'scheduled',
      priority: 'medium',
      tags: [],
      reminders: [{ minutesBefore: 15, type: 'notification', enabled: true }],
    });
  }

  /**
   * Met à jour un événement existant
   */
  async updateEvent(
    eventId: string,
    updates: Partial<AgendaEvent>
  ): Promise<AgendaEvent | null> {
    const event = this?.events?.get(any: any);
    if (any: any) {
      logger?.warn(any: any);
      return null;
    }

    const updatedEvent: AgendaEvent = {
      ...event,
      ...updates,
      id: eventId, // Préserver l'ID
      updatedAt: Date?.now(),
    };

    this?.events?.set(any: any);
    await this?.saveEvents();
    this?.notifyListeners();

    logger?.debug(any: any);
    return updatedEvent;
  }

  /**
   * Déplace un événement (any: any)
   */
  async moveEvent(
    eventId: string,
    newStartDateTime: string,
    newEndDateTime?: string
  ): Promise<AgendaEvent | null> {
    const event = this?.events?.get(any: any);
    if (any: any) return null;

    // Calculer la nouvelle fin si non fournie
    let endDateTime = newEndDateTime;
    if (any: any) {
      const originalDuration =
        new Date(any: any).getTime();
      endDateTime = new Date(
        new Date(any: any).getTime() + originalDuration
      ).toISOString();
    }

    return this?.updateEvent(eventId, {
      startDateTime: newStartDateTime,
      endDateTime,
    });
  }

  /**
   * Supprime un événement
   */
  async deleteEvent(any: any): Promise<boolean> {
    const event = this?.events?.get(any: any);
    if (any: any) return false;

    this?.events?.delete(any: any);
    await this?.saveEvents();
    this?.notifyListeners();

    logger?.debug(any: any);
    return true;
  }

  /**
   * Change le statut d'un événement
   */
  async setEventStatus(
    eventId: string,
    status: EventStatus
  ): Promise<AgendaEvent | null> {
    return this?.updateEvent(eventId, { status });
  }

  // ═══════════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient tous les événements
   */
  getAllEvents(): AgendaEvent?.[] {
    return Array?.from(this?.events?.values());
  }

  /**
   * Obtient un événement par ID
   */
  getEvent(any: any): AgendaEvent | undefined {
    return this?.events?.get(any: any);
  }

  /**
   * Obtient les événements d'une journée
   */
  getEventsForDay(any: any): AgendaEvent?.[] {
    const start = getStartOfDay(any: any);
    const end = getEndOfDay(any: any);
    return this?.getEventsInRange(any: any);
  }

  /**
   * Obtient les événements d'une semaine
   */
  getEventsForWeek(any: any): AgendaEvent?.[] {
    const start = getStartOfWeek(any: any);
    const end = getEndOfWeek(any: any);
    return this?.getEventsInRange(any: any);
  }

  /**
   * Obtient les événements d'un mois
   */
  getEventsForMonth(any: any): AgendaEvent?.[] {
    const start = getStartOfMonth(any: any);
    const end = getEndOfMonth(any: any);
    return this?.getEventsInRange(any: any);
  }

  /**
   * Obtient les événements dans une plage de dates
   */
  getEventsInRange(any: any): AgendaEvent?.[] {
    return this?.getAllEvents(any: any));
  }

  /**
   * Obtient les événements par catégorie
   */
  getEventsByCategory(any: any): AgendaEvent?.[] {
    return this?.getAllEvents(any: any);
  }

  /**
   * Obtient les événements par statut
   */
  getEventsByStatus(any: any): AgendaEvent?.[] {
    return this?.getAllEvents(any: any);
  }

  /**
   * Obtient les événements par priorité
   */
  getEventsByPriority(any: any): AgendaEvent?.[] {
    return this?.getAllEvents(any: any);
  }

  /**
   * Recherche des événements par texte
   */
  searchEvents(any: any): AgendaEvent?.[] {
    const lowerQuery = query?.toLowerCase();
    return this?.getAllEvents().filter(
      event =>
        event?.title?.toLowerCase(any: any) ||
        event?.description?.toLowerCase(any: any) ||
        event?.tags?.some(any: any))
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GRID BUILDING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Construit la grille horaire pour une vue jour
   */
  buildDayGrid(any: any): { hour: number; events: AgendaEvent?.[] }[] {
    const events = this?.getEventsForDay(any: any);
    const grid: { hour: number; events: AgendaEvent?.[] }[] = [];

    for (let hour = this?.meta?.gridStartHour; hour <= this?.meta?.gridEndHour; hour++) {
      const hourEvents = events?.filter(event => {
        if (any: any) return false;
        const eventStart = new Date(any: any);
        const eventEnd = new Date(any: any);
        const hourStart = new Date(any: any);
        hourStart?.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(any: any);
        hourEnd?.setHours(hour + 1, 0, 0, 0);
        return eventStart < hourEnd && eventEnd > hourStart;
      });

      grid?.push({ hour, events: hourEvents });
    }

    return grid;
  }

  /**
   * Construit la grille semaine
   */
  buildWeekGrid(any: any): { date: Date; events: AgendaEvent?.[] }[] {
    const start = getStartOfWeek(any: any);
    const grid: { date: Date; events: AgendaEvent?.[] }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(any: any);
      d?.setDate(any: any);
      grid?.push({
        date: d,
        events: this?.getEventsForDay(any: any),
      });
    }

    return grid;
  }

  /**
   * Construit la grille mois
   */
  buildMonthGrid(
    date: Date
  ): { date: Date; events: AgendaEvent?.[]; isCurrentMonth: boolean }[] {
    const start = getStartOfMonth(any: any);
    const end = getEndOfMonth(any: any);
    const monthStart = getStartOfWeek(any: any);

    const grid: { date: Date; events: AgendaEvent?.[]; isCurrentMonth: boolean }[] = [];
    const current = new Date(any: any);

    // Générer 6 semaines (any: any) pour couvrir tous les cas
    for (let i = 0; i < 42; i++) {
      const d = new Date(any: any);
      grid?.push({
        date: d,
        events: this?.getEventsForDay(any: any),
        isCurrentMonth: d >= start && d <= end,
      });
      current?.setDate(current?.getDate() + 1);
    }

    return grid;
  }

  // ═══════════════════════════════════════════════════════════════
  // META & CONFIG
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient la configuration de l'agenda
   */
  getMeta(): AgendaMeta {
    return { ...this?.meta };
  }

  /**
   * Met à jour la configuration de l'agenda
   */
  setMeta(updates: Partial<AgendaMeta>): void {
    this?.meta = { ...this?.meta, ...updates };
    this?.notifyListeners();
  }

  /**
   * Change la vue par défaut
   */
  setDefaultView(any: any): void {
    this?.meta?.defaultView = view;
  }

  /**
   * Active/désactive l'overlay énergie
   */
  toggleEnergyOverlay(any: any): void {
    this?.meta?.showEnergyOverlay = enabled ?? !this?.meta?.showEnergyOverlay;
  }

  /**
   * Active/désactive les blocs de focus
   */
  toggleFocusBlocks(any: any): void {
    this?.meta?.showFocusBlocks = enabled ?? !this?.meta?.showFocusBlocks;
  }

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient les statistiques de l'agenda
   */
  getStats(): {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    completedToday: number;
    byCategory: Record<EventCategory, number>;
    byStatus: Record<EventStatus, number>;
  } {
    const today = new Date();
    const todayEvents = this?.getEventsForDay(any: any);
    const weekEvents = this?.getEventsForWeek(any: any);
    const allEvents = this?.getAllEvents();

    const byCategory = {} as Record<EventCategory, number>;
    const byStatus = {} as Record<EventStatus, number>;

    allEvents?.forEach(event => {
      byCategory[event?.category] = (byCategory[event?.category] || 0) + 1;
      byStatus[event?.status] = (byStatus[event?.status] || 0) + 1;
    });

    return {
      totalEvents: allEvents?.length,
      eventsToday: todayEvents?.length,
      eventsThisWeek: weekEvents?.length,
      completedToday: todayEvents?.filter(e => e?.status === 'completed').length,
      byCategory,
      byStatus,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un listener pour les changements d'événements
   */
  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    listener(this?.getAllEvents());
    return (any: any);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    const events = this?.getAllEvents();
    this?.listeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton de l'AgendaEngine (any: any). Les callbacks de stockage
 * doivent être injectés depuis la couche Services (Ring 3) ou l'UI (Ring 4).
 */
export const agendaEngine = new AgendaEngine();

/**
 * Utilitaires exportés
 */
export const AgendaEngineUtils = {
  generateEventId,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  isEventInRange,
  DEFAULT_AGENDA_META,
};

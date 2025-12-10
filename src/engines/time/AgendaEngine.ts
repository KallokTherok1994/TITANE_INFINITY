/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — AGENDA ENGINE
 * Moteur de gestion de l'agenda et des événements
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - CRUD événements (create, read, update, delete)
 * - Vues jour/semaine/mois
 * - Annotation énergie/priorité
 * - Synchronisation Tauri (stockage local)
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
import { secureInvoke } from '@/lib/security';

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
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `evt_${timestamp}_${random}`;
}

/**
 * Obtient le début de la journée (minuit)
 */
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin de la journée (23:59:59)
 */
function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Obtient le début de la semaine
 */
function getStartOfWeek(date: Date, firstDayOfWeek: number = 1): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - firstDayOfWeek + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin de la semaine
 */
function getEndOfWeek(date: Date, firstDayOfWeek: number = 1): Date {
  const start = getStartOfWeek(date, firstDayOfWeek);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Obtient le début du mois
 */
function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient la fin du mois
 */
function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Vérifie si un événement est dans une plage de dates
 */
function isEventInRange(event: AgendaEvent, start: Date, end: Date): boolean {
  const eventStart = new Date(event.startDateTime);
  const eventEnd = new Date(event.endDateTime);
  return eventStart <= end && eventEnd >= start;
}

// ═══════════════════════════════════════════════════════════════════
// AGENDA ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * Listener pour les changements d'événements
 */
type AgendaEventListener = (events: AgendaEvent[]) => void;

/**
 * AgendaEngine v∞ — Moteur de gestion de l'agenda TITANE∞
 */
export class AgendaEngine {
  private events: Map<string, AgendaEvent>;
  private meta: AgendaMeta;
  private listeners: Set<AgendaEventListener>;
  private useTauriSync: boolean;

  constructor(useTauriSync: boolean = true) {
    this.events = new Map();
    this.meta = { ...DEFAULT_AGENDA_META };
    this.listeners = new Set();
    this.useTauriSync = useTauriSync;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialise l'AgendaEngine et charge les événements depuis Tauri
   */
  async init(): Promise<void> {
    console.log('[AgendaEngine] 📅 Initialisation...');

    if (this.useTauriSync) {
      await this.loadEvents();
    }

    console.log('[AgendaEngine] ✅ Initialisé:', {
      eventsCount: this.events.size,
      defaultView: this.meta.defaultView,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Charge les événements depuis Tauri (stockage local)
   */
  async loadEvents(): Promise<void> {
    try {
      const events = await secureInvoke<AgendaEvent[]>('agenda_load_events');
      this.events.clear();
      events.forEach(event => this.events.set(event.id, event));
      this.notifyListeners();
      console.log('[AgendaEngine] 📥 Événements chargés:', events.length);
    } catch (error) {
      console.error('[AgendaEngine] Erreur chargement:', error);
      // Fallback: garder les événements en mémoire
    }
  }

  /**
   * Sauvegarde les événements vers Tauri
   */
  private async saveEvents(): Promise<void> {
    if (!this.useTauriSync) return;

    try {
      const eventsArray = Array.from(this.events.values());
      await secureInvoke('agenda_save_events', { events: eventsArray });
      console.log('[AgendaEngine] 💾 Événements sauvegardés:', eventsArray.length);
    } catch (error) {
      console.error('[AgendaEngine] Erreur sauvegarde:', error);
    }
  }

  /**
   * Crée un nouvel événement
   */
  async createEvent(
    eventData: Omit<AgendaEvent, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AgendaEvent> {
    const now = Date.now();
    const event: AgendaEvent = {
      ...eventData,
      id: generateEventId(),
      createdAt: now,
      updatedAt: now,
    };

    this.events.set(event.id, event);
    await this.saveEvents();
    this.notifyListeners();

    console.log('[AgendaEngine] ➕ Événement créé:', event.title);
    return event;
  }

  /**
   * Crée un événement rapide (minimal)
   */
  async createQuickEvent(
    title: string,
    startDateTime: string,
    durationMinutes: number = 60,
    category: EventCategory = 'work'
  ): Promise<AgendaEvent> {
    const start = new Date(startDateTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return this.createEvent({
      title,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
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
    const event = this.events.get(eventId);
    if (!event) {
      console.warn('[AgendaEngine] Événement non trouvé:', eventId);
      return null;
    }

    const updatedEvent: AgendaEvent = {
      ...event,
      ...updates,
      id: eventId, // Préserver l'ID
      updatedAt: Date.now(),
    };

    this.events.set(eventId, updatedEvent);
    await this.saveEvents();
    this.notifyListeners();

    console.log('[AgendaEngine] ✏️ Événement modifié:', updatedEvent.title);
    return updatedEvent;
  }

  /**
   * Déplace un événement (change les dates)
   */
  async moveEvent(
    eventId: string,
    newStartDateTime: string,
    newEndDateTime?: string
  ): Promise<AgendaEvent | null> {
    const event = this.events.get(eventId);
    if (!event) return null;

    // Calculer la nouvelle fin si non fournie
    let endDateTime = newEndDateTime;
    if (!endDateTime) {
      const originalDuration =
        new Date(event.endDateTime).getTime() - new Date(event.startDateTime).getTime();
      endDateTime = new Date(
        new Date(newStartDateTime).getTime() + originalDuration
      ).toISOString();
    }

    return this.updateEvent(eventId, {
      startDateTime: newStartDateTime,
      endDateTime,
    });
  }

  /**
   * Supprime un événement
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;

    this.events.delete(eventId);
    await this.saveEvents();
    this.notifyListeners();

    console.log('[AgendaEngine] 🗑️ Événement supprimé:', event.title);
    return true;
  }

  /**
   * Change le statut d'un événement
   */
  async setEventStatus(
    eventId: string,
    status: EventStatus
  ): Promise<AgendaEvent | null> {
    return this.updateEvent(eventId, { status });
  }

  // ═══════════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient tous les événements
   */
  getAllEvents(): AgendaEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Obtient un événement par ID
   */
  getEvent(eventId: string): AgendaEvent | undefined {
    return this.events.get(eventId);
  }

  /**
   * Obtient les événements d'une journée
   */
  getEventsForDay(date: Date): AgendaEvent[] {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    return this.getEventsInRange(start, end);
  }

  /**
   * Obtient les événements d'une semaine
   */
  getEventsForWeek(date: Date): AgendaEvent[] {
    const start = getStartOfWeek(date, this.meta.firstDayOfWeek);
    const end = getEndOfWeek(date, this.meta.firstDayOfWeek);
    return this.getEventsInRange(start, end);
  }

  /**
   * Obtient les événements d'un mois
   */
  getEventsForMonth(date: Date): AgendaEvent[] {
    const start = getStartOfMonth(date);
    const end = getEndOfMonth(date);
    return this.getEventsInRange(start, end);
  }

  /**
   * Obtient les événements dans une plage de dates
   */
  getEventsInRange(start: Date, end: Date): AgendaEvent[] {
    return this.getAllEvents().filter(event => isEventInRange(event, start, end));
  }

  /**
   * Obtient les événements par catégorie
   */
  getEventsByCategory(category: EventCategory): AgendaEvent[] {
    return this.getAllEvents().filter(event => event.category === category);
  }

  /**
   * Obtient les événements par statut
   */
  getEventsByStatus(status: EventStatus): AgendaEvent[] {
    return this.getAllEvents().filter(event => event.status === status);
  }

  /**
   * Obtient les événements par priorité
   */
  getEventsByPriority(priority: PriorityLevel): AgendaEvent[] {
    return this.getAllEvents().filter(event => event.priority === priority);
  }

  /**
   * Recherche des événements par texte
   */
  searchEvents(query: string): AgendaEvent[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllEvents().filter(
      event =>
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GRID BUILDING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Construit la grille horaire pour une vue jour
   */
  buildDayGrid(date: Date): { hour: number; events: AgendaEvent[] }[] {
    const events = this.getEventsForDay(date);
    const grid: { hour: number; events: AgendaEvent[] }[] = [];

    for (let hour = this.meta.gridStartHour; hour <= this.meta.gridEndHour; hour++) {
      const hourEvents = events.filter(event => {
        if (event.allDay) return false;
        const eventStart = new Date(event.startDateTime);
        const eventEnd = new Date(event.endDateTime);
        const hourStart = new Date(date);
        hourStart.setHours(hour, 0, 0, 0);
        const hourEnd = new Date(date);
        hourEnd.setHours(hour + 1, 0, 0, 0);
        return eventStart < hourEnd && eventEnd > hourStart;
      });

      grid.push({ hour, events: hourEvents });
    }

    return grid;
  }

  /**
   * Construit la grille semaine
   */
  buildWeekGrid(date: Date): { date: Date; events: AgendaEvent[] }[] {
    const start = getStartOfWeek(date, this.meta.firstDayOfWeek);
    const grid: { date: Date; events: AgendaEvent[] }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      grid.push({
        date: d,
        events: this.getEventsForDay(d),
      });
    }

    return grid;
  }

  /**
   * Construit la grille mois
   */
  buildMonthGrid(
    date: Date
  ): { date: Date; events: AgendaEvent[]; isCurrentMonth: boolean }[] {
    const start = getStartOfMonth(date);
    const end = getEndOfMonth(date);
    const monthStart = getStartOfWeek(start, this.meta.firstDayOfWeek);

    const grid: { date: Date; events: AgendaEvent[]; isCurrentMonth: boolean }[] = [];
    const current = new Date(monthStart);

    // Générer 6 semaines (42 jours) pour couvrir tous les cas
    for (let i = 0; i < 42; i++) {
      const d = new Date(current);
      grid.push({
        date: d,
        events: this.getEventsForDay(d),
        isCurrentMonth: d >= start && d <= end,
      });
      current.setDate(current.getDate() + 1);
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
    return { ...this.meta };
  }

  /**
   * Met à jour la configuration de l'agenda
   */
  setMeta(updates: Partial<AgendaMeta>): void {
    this.meta = { ...this.meta, ...updates };
    this.notifyListeners();
  }

  /**
   * Change la vue par défaut
   */
  setDefaultView(view: AgendaView): void {
    this.meta.defaultView = view;
  }

  /**
   * Active/désactive l'overlay énergie
   */
  toggleEnergyOverlay(enabled?: boolean): void {
    this.meta.showEnergyOverlay = enabled ?? !this.meta.showEnergyOverlay;
  }

  /**
   * Active/désactive les blocs de focus
   */
  toggleFocusBlocks(enabled?: boolean): void {
    this.meta.showFocusBlocks = enabled ?? !this.meta.showFocusBlocks;
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
    const todayEvents = this.getEventsForDay(today);
    const weekEvents = this.getEventsForWeek(today);
    const allEvents = this.getAllEvents();

    const byCategory = {} as Record<EventCategory, number>;
    const byStatus = {} as Record<EventStatus, number>;

    allEvents.forEach(event => {
      byCategory[event.category] = (byCategory[event.category] || 0) + 1;
      byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    });

    return {
      totalEvents: allEvents.length,
      eventsToday: todayEvents.length,
      eventsThisWeek: weekEvents.length,
      completedToday: todayEvents.filter(e => e.status === 'completed').length,
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
  subscribe(listener: AgendaEventListener): () => void {
    this.listeners.add(listener);
    listener(this.getAllEvents());
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    const events = this.getAllEvents();
    this.listeners.forEach(listener => {
      try {
        listener(events);
      } catch (error) {
        console.error('[AgendaEngine] Erreur listener:', error);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton de l'AgendaEngine
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

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — USE TIME AGENDA HOOK
 * Hook React pour consommer l'état Time/Agenda/Energy/Priority
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  timeEngine,
  agendaEngine,
  energyEngine,
  priorityEngine,
  chatScheduler,
  initTimeAgendaSystem,
  type AgendaStorageCallbacks,
  type TimeState,
  type AgendaEvent,
  type AgendaMeta,
  type EnergyState,
  type AgendaView,
  type EventCategory,
  type CommandExecutionResult,
} from '@/engines/time';
import { agendaService } from '@/services/agendaService';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════
// HOOK RETURN TYPE
// ═══════════════════════════════════════════════════════════════════

export interface UseTimeAgendaReturn {
  // État
  timeState: TimeState | null;
  events: AgendaEvent[];
  energyState: EnergyState | null;
  agendaMeta: AgendaMeta;

  // Chargement
  loading: boolean;
  initialized: boolean;

  // Navigation
  currentDate: Date;
  currentView: AgendaView;
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: AgendaView) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;

  // Événements filtrés selon la vue
  viewEvents: AgendaEvent[];
  dayGrid: { hour: number; events: AgendaEvent[] }[];
  weekGrid: { date: Date; events: AgendaEvent[] }[];

  // Actions CRUD
  createEvent: (
    title: string,
    start: string,
    durationMinutes?: number,
    category?: EventCategory
  ) => Promise<AgendaEvent>;
  updateEvent: (id: string, updates: Partial<AgendaEvent>) => Promise<AgendaEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  moveEvent: (
    id: string,
    newStart: string,
    newEnd?: string
  ) => Promise<AgendaEvent | null>;

  // Actions rapides
  createQuickEvent: (title: string, startOffset?: number) => Promise<AgendaEvent>;

  // Configuration
  toggleEnergyOverlay: () => void;
  toggleFocusBlocks: () => void;

  // Chat Scheduler
  processAIResponse: (response: string) => Promise<CommandExecutionResult[]>;

  // Statistiques
  stats: {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    currentEnergy: number;
    currentSegment: string;
    isWorkHours: boolean;
  };

  // Refresh
  refresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════

export function useTimeAgenda(autoInit: boolean = true): UseTimeAgendaReturn {
  // États
  const [timeState, setTimeState] = useState<TimeState | null>(null);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [energyState, setEnergyState] = useState<EnergyState | null>(null);
  const [agendaMeta, setAgendaMeta] = useState<AgendaMeta>(agendaEngine.getMeta());
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<AgendaView>('week');

  // ═══════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!autoInit) return;

    const agendaStorage: AgendaStorageCallbacks = {
      loadEvents: () => agendaService.loadAllEvents(),
      saveEvents: events => agendaService.saveAllEvents(events),
      exportCalendar: () => agendaService.exportCalendar(),
    };

    const init = async () => {
      try {
        setLoading(true);
        await initTimeAgendaSystem(agendaStorage);
        setInitialized(true);
      } catch (error) {
        logger.error('Erreur init:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      // Cleanup géré par les moteurs individuels
    };
  }, [autoInit]);

  // ═══════════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!initialized) return;

    // Subscribe to TimeEngine
    const unsubTime = timeEngine.subscribe(setTimeState);

    // Subscribe to AgendaEngine
    const unsubAgenda = agendaEngine.subscribe(newEvents => {
      // Annoter avec les priorités
      const annotatedEvents = priorityEngine.annotateEventsWithPriority(newEvents);
      setEvents(annotatedEvents);
    });

    // Subscribe to EnergyEngine
    const unsubEnergy = energyEngine.subscribe(setEnergyState);

    return () => {
      unsubTime();
      unsubAgenda();
      unsubEnergy();
    };
  }, [initialized]);

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const goToNext = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  // ═══════════════════════════════════════════════════════════════
  // ÉVÉNEMENTS FILTRÉS
  // ═══════════════════════════════════════════════════════════════

  const viewEvents = useMemo(() => {
    switch (currentView) {
      case 'day':
        return agendaEngine.getEventsForDay(currentDate);
      case 'week':
        return agendaEngine.getEventsForWeek(currentDate);
      case 'month':
        return agendaEngine.getEventsForMonth(currentDate);
      default:
        return events;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, currentDate]);

  const dayGrid = useMemo(() => {
    return agendaEngine.buildDayGrid(currentDate);
  }, [currentDate]);

  const weekGrid = useMemo(() => {
    return agendaEngine.buildWeekGrid(currentDate);
  }, [currentDate]);

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS CRUD
  // ═══════════════════════════════════════════════════════════════

  const createEvent = useCallback(
    async (
      title: string,
      start: string,
      durationMinutes: number = 60,
      category: EventCategory = 'work'
    ): Promise<AgendaEvent> => {
      return agendaEngine.createQuickEvent(title, start, durationMinutes, category);
    },
    []
  );

  const updateEvent = useCallback(
    async (id: string, updates: Partial<AgendaEvent>): Promise<AgendaEvent | null> => {
      return agendaEngine.updateEvent(id, updates);
    },
    []
  );

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    return agendaEngine.deleteEvent(id);
  }, []);

  const moveEvent = useCallback(
    async (
      id: string,
      newStart: string,
      newEnd?: string
    ): Promise<AgendaEvent | null> => {
      return agendaEngine.moveEvent(id, newStart, newEnd);
    },
    []
  );

  const createQuickEvent = useCallback(
    async (title: string, startOffset: number = 0): Promise<AgendaEvent> => {
      const start = new Date(Date.now() + startOffset * 60 * 1000);
      return agendaEngine.createQuickEvent(title, start.toISOString(), 60, 'work');
    },
    []
  );

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  const toggleEnergyOverlay = useCallback(() => {
    agendaEngine.toggleEnergyOverlay();
    setAgendaMeta(agendaEngine.getMeta());
  }, []);

  const toggleFocusBlocks = useCallback(() => {
    agendaEngine.toggleFocusBlocks();
    setAgendaMeta(agendaEngine.getMeta());
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CHAT SCHEDULER
  // ═══════════════════════════════════════════════════════════════

  const processAIResponse = useCallback(
    async (response: string): Promise<CommandExecutionResult[]> => {
      return chatScheduler.processAIResponse(response);
    },
    []
  );

  // ═══════════════════════════════════════════════════════════════
  // STATISTIQUES
  // ═══════════════════════════════════════════════════════════════

  const stats = useMemo(() => {
    const agendaStats = agendaEngine.getStats();
    return {
      totalEvents: agendaStats.totalEvents,
      eventsToday: agendaStats.eventsToday,
      eventsThisWeek: agendaStats.eventsThisWeek,
      currentEnergy: energyState?.currentEnergyLevel ?? 0.7,
      currentSegment: timeState?.currentSegment?.label ?? 'Inconnu',
      isWorkHours: timeState?.isWorkHours ?? false,
    };
  }, [energyState, timeState]);

  // ═══════════════════════════════════════════════════════════════
  // REFRESH
  // ═══════════════════════════════════════════════════════════════

  const refresh = useCallback(async () => {
    await agendaEngine.loadEvents();
    timeEngine.updateCurrentDateTime();
    energyEngine.updateCurrentEnergyLevel();
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════

  return {
    // État
    timeState,
    events,
    energyState,
    agendaMeta,

    // Chargement
    loading,
    initialized,

    // Navigation
    currentDate,
    currentView,
    setCurrentDate,
    setCurrentView,
    goToToday,
    goToPrevious,
    goToNext,

    // Événements filtrés
    viewEvents,
    dayGrid,
    weekGrid,

    // Actions CRUD
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent,
    createQuickEvent,

    // Configuration
    toggleEnergyOverlay,
    toggleFocusBlocks,

    // Chat Scheduler
    processAIResponse,

    // Statistiques
    stats,

    // Refresh
    refresh,
  };
}

export default useTimeAgenda;

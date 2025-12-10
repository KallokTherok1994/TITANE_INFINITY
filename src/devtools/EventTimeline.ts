/**
 * TITANE∞ v20Ω — Event Timeline
 * Historique structuré des événements
 */

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'system' | 'engine' | 'pipeline' | 'memory' | 'error' | 'debug' | 'user';
  message: string;
  data?: unknown;
}

export type TimelineFilter = {
  types?: TimelineEvent['type'][];
  startTime?: number;
  endTime?: number;
  search?: string;
};

/**
 * Timeline d'événements
 */
export class EventTimeline {
  private events: TimelineEvent[] = [];
  private maxEvents: number;

  constructor(maxEvents = 1000) {
    this.maxEvents = maxEvents;
  }

  /**
   * Ajoute un événement
   */
  add(type: TimelineEvent['type'], message: string, data?: unknown): TimelineEvent {
    const event: TimelineEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      type,
      message,
      data,
    };

    this.events.push(event);

    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    return event;
  }

  /**
   * Retourne les N événements les plus récents
   */
  recent(count = 50): TimelineEvent[] {
    return this.events.slice(-count).reverse();
  }

  /**
   * Filtre les événements
   */
  filter(filter: TimelineFilter): TimelineEvent[] {
    let result = [...this.events];

    const { types, startTime, endTime } = filter;

    if (types && types.length > 0) {
      result = result.filter(e => types.includes(e.type));
    }

    if (startTime !== undefined) {
      result = result.filter(e => e.timestamp >= startTime);
    }

    if (endTime !== undefined) {
      result = result.filter(e => e.timestamp <= endTime);
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(e => e.message.toLowerCase().includes(search));
    }

    return result;
  }

  /**
   * Retourne les événements par type
   */
  byType(type: TimelineEvent['type']): TimelineEvent[] {
    return this.events.filter(e => e.type === type);
  }

  /**
   * Retourne les erreurs récentes
   */
  recentErrors(count = 10): TimelineEvent[] {
    return this.byType('error').slice(-count).reverse();
  }

  /**
   * Retourne les statistiques
   */
  stats(): TimelineStats {
    const typeCount: Record<string, number> = {};
    let errorCount = 0;

    for (const event of this.events) {
      typeCount[event.type] = (typeCount[event.type] || 0) + 1;
      if (event.type === 'error') {
        errorCount++;
      }
    }

    const timestamps = this.events.map(e => e.timestamp);
    const timespan =
      timestamps.length > 0 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;

    return {
      total: this.events.length,
      byType: typeCount,
      errorCount,
      timespanMs: timespan,
      eventsPerSecond: timespan > 0 ? (this.events.length / timespan) * 1000 : 0,
    };
  }

  /**
   * Exporte en JSON
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Efface tout
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Retourne tous les événements
   */
  all(): TimelineEvent[] {
    return [...this.events];
  }
}

export interface TimelineStats {
  total: number;
  byType: Record<string, number>;
  errorCount: number;
  timespanMs: number;
  eventsPerSecond: number;
}

export default EventTimeline;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ EVENT COALESCER ENGINE vΩ
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @description Fusion et coalescence d'événements pour réduire overhead
 *
 * @responsibilities
 * - Fusionner événements similaires
 * - Réduire overhead traitement
 * - Gérer backpressure
 * - Synchroniser frontend ↔ backend
 * - Éliminer collisions
 * - Queue prioritaire
 * - Batching intelligent
 *
 * @version Ω (Omega - Final Fusion)
 * @created 2025-11-27
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CoalescedEvent {
  id: string;
  type: string;
  data: any;
  count: number; // Nombre d'événements fusionnés
  first_timestamp: number;
  last_timestamp: number;
  priority: EventPriority;
}

export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

export interface EventCoalescerConfig {
  enabled: boolean;
  coalesce_window: number; // ms
  max_batch_size: number;
  max_queue_size: number;
  priority_enabled: boolean;
  backpressure_threshold: number;
}

export interface EventStats {
  total_received: number;
  total_coalesced: number;
  total_processed: number;
  total_dropped: number;
  coalesce_ratio: number; // % d'événements fusionnés
  queue_size: number;
  backpressure_active: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT COALESCER ENGINE
// ═══════════════════════════════════════════════════════════════════════════

export class EventCoalescerEngine {
  private static instance: EventCoalescerEngine;

  private config: EventCoalescerConfig;
  private queue: Map<string, CoalescedEvent> = new Map();
  private stats: EventStats;

  private processingInterval: number | null = null;
  private handlers: Map<string, Set<(event: CoalescedEvent) => void>> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.stats = this.createInitialStats();
  }

  public static getInstance(): EventCoalescerEngine {
    if (!EventCoalescerEngine.instance) {
      EventCoalescerEngine.instance = new EventCoalescerEngine();
    }
    return EventCoalescerEngine.instance;
  }

  /**
   * Configuration par défaut
   */
  private getDefaultConfig(): EventCoalescerConfig {
    return {
      enabled: true,
      coalesce_window: 100, // 100ms
      max_batch_size: 50,
      max_queue_size: 1000,
      priority_enabled: true,
      backpressure_threshold: 800,
    };
  }

  /**
   * Stats initiales
   */
  private createInitialStats(): EventStats {
    return {
      total_received: 0,
      total_coalesced: 0,
      total_processed: 0,
      total_dropped: 0,
      coalesce_ratio: 0,
      queue_size: 0,
      backpressure_active: false,
    };
  }

  /**
   * Configure le coalescer
   */
  public configure(config: Partial<EventCoalescerConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[EventCoalescer] 🔧 Configuration updated');
  }

  /**
   * Démarre le traitement
   */
  public start(): void {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = window.setInterval(() => {
      this.processQueue();
    }, this.config.coalesce_window);

    console.log('[EventCoalescer] 🚀 Started');
  }

  /**
   * Arrête le traitement
   */
  public stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('[EventCoalescer] 🛑 Stopped');
    }
  }

  /**
   * Émet un événement (avec coalescence)
   */
  public emit(type: string, data: any, priority: EventPriority = 'medium'): void {
    if (!this.config.enabled) {
      // Mode direct sans coalescence
      this.dispatchEvent({ type, data, count: 1, priority } as CoalescedEvent);
      return;
    }

    this.stats.total_received++;

    // Vérifier backpressure
    if (this.queue.size >= this.config.backpressure_threshold) {
      this.stats.backpressure_active = true;

      // Dropper événements low priority
      if (priority === 'low') {
        this.stats.total_dropped++;
        return;
      }
    } else {
      this.stats.backpressure_active = false;
    }

    // Vérifier limite queue
    if (this.queue.size >= this.config.max_queue_size) {
      this.stats.total_dropped++;
      return;
    }

    // Créer clé de coalescence
    const key = this.getCoalesceKey(type, data);

    const existing = this.queue.get(key);

    if (existing) {
      // Fusionner avec événement existant
      existing.count++;
      existing.last_timestamp = Date.now();
      existing.data = this.mergeEventData(existing.data, data);
      this.stats.total_coalesced++;
    } else {
      // Nouvel événement
      const event: CoalescedEvent = {
        id: `event-${Date.now()}-${Math.random()}`,
        type,
        data,
        count: 1,
        first_timestamp: Date.now(),
        last_timestamp: Date.now(),
        priority,
      };

      this.queue.set(key, event);
    }

    this.stats.queue_size = this.queue.size;

    // Calculer ratio coalescence
    if (this.stats.total_received > 0) {
      this.stats.coalesce_ratio =
        (this.stats.total_coalesced / this.stats.total_received) * 100;
    }
  }

  /**
   * Génère clé de coalescence
   */
  private getCoalesceKey(type: string, data: any): string {
    // Pour certains types, on fusionne tous les événements
    const coalescableTypes = [
      'state_update',
      'avatar_move',
      'ui_resize',
      'performance_metrics',
    ];

    if (coalescableTypes.includes(type)) {
      return type;
    }

    // Pour les autres, on ajoute un identifiant
    const id = data?.id || data?.target || '';
    return `${type}-${id}`;
  }

  /**
   * Fusionne les données d'événements
   */
  private mergeEventData(existing: any, incoming: any): any {
    // Pour les objets, fusionner
    if (typeof existing === 'object' && typeof incoming === 'object') {
      return { ...existing, ...incoming };
    }

    // Sinon, garder le plus récent
    return incoming;
  }

  /**
   * Traite la queue
   */
  private processQueue(): void {
    if (this.queue.size === 0) {
      return;
    }

    // Convertir en array et trier par priorité
    let events = Array.from(this.queue.values());

    if (this.config.priority_enabled) {
      events = this.sortByPriority(events);
    }

    // Limiter batch size
    const batch = events.slice(0, this.config.max_batch_size);

    // Dispatcher les événements
    for (const event of batch) {
      this.dispatchEvent(event);
      this.queue.delete(this.getEventKey(event));
      this.stats.total_processed++;
    }

    this.stats.queue_size = this.queue.size;
  }

  /**
   * Trie par priorité
   */
  private sortByPriority(events: CoalescedEvent[]): CoalescedEvent[] {
    const priorityOrder: Record<EventPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return events.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Obtient la clé d'un événement
   */
  private getEventKey(event: CoalescedEvent): string {
    return this.getCoalesceKey(event.type, event.data);
  }

  /**
   * Dispatch un événement vers les handlers
   */
  private dispatchEvent(event: CoalescedEvent): void {
    const handlers = this.handlers.get(event.type);

    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('[EventCoalescer] Handler error:', error);
        }
      });
    }
  }

  /**
   * Enregistre un handler
   */
  public on(type: string, handler: (event: CoalescedEvent) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    this.handlers.get(type)!.add(handler);

    // Retourne fonction de cleanup
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Obtient les stats
   */
  public getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Réinitialise les stats
   */
  public resetStats(): void {
    this.stats = this.createInitialStats();
  }

  /**
   * Flush immédiat de la queue
   */
  public flush(): void {
    this.processQueue();
  }
}

export const EventCoalescer = EventCoalescerEngine.getInstance();

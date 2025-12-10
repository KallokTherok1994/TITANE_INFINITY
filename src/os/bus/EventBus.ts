/**
 * TITANE∞ v20Ω — Event Bus
 * Bus d'événements central
 */

import type { EventType, OSEvent, EventHandler, EventSubscription } from '../types';

/**
 * Bus d'événements
 */
export class EventBus {
  private subscribers: Map<EventType, Map<string, EventHandler>> = new Map();
  private wildcardSubscribers: Map<string, EventHandler> = new Map();
  private eventHistory: OSEvent[] = [];
  private maxHistory = 100;
  private eventCounter = 0;

  // Statistiques
  private stats = {
    published: 0,
    handled: 0,
    failed: 0,
  };

  /**
   * S'abonne à un type d'événement
   */
  subscribe<T = unknown>(type: EventType, handler: EventHandler<T>): EventSubscription {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Map());
    }

    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.set(subscriptionId, handler as EventHandler);
    }

    return {
      id: subscriptionId,
      type,
      handler: handler as EventHandler,
      unsubscribe: () => this.unsubscribe(type, subscriptionId),
    };
  }

  /**
   * S'abonne à tous les événements
   */
  subscribeAll(handler: EventHandler): EventSubscription {
    const subscriptionId = `wild-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.wildcardSubscribers.set(subscriptionId, handler);

    return {
      id: subscriptionId,
      type: '*',
      handler,
      unsubscribe: () => this.wildcardSubscribers.delete(subscriptionId),
    };
  }

  /**
   * Se désabonne
   */
  unsubscribe(type: EventType, subscriptionId: string): boolean {
    const handlers = this.subscribers.get(type);
    if (handlers) {
      return handlers.delete(subscriptionId);
    }
    return false;
  }

  /**
   * Publie un événement
   */
  async publish<T = unknown>(
    type: EventType,
    data: T,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const event: OSEvent<T> = {
      id: `evt-${++this.eventCounter}-${Date.now()}`,
      type,
      source,
      timestamp: Date.now(),
      data,
      metadata,
    };

    // Ajouter à l'historique
    this.eventHistory.push(event as OSEvent);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    this.stats.published++;

    // Notifier les abonnés spécifiques
    const handlers = this.subscribers.get(type);
    if (handlers) {
      for (const handler of handlers.values()) {
        try {
          await handler(event as OSEvent);
          this.stats.handled++;
        } catch (error) {
          this.stats.failed++;
          console.error(`[EventBus] Handler error for ${type}:`, error);
        }
      }
    }

    // Notifier les abonnés wildcard
    for (const handler of this.wildcardSubscribers.values()) {
      try {
        await handler(event as OSEvent);
        this.stats.handled++;
      } catch (error) {
        this.stats.failed++;
        console.error(`[EventBus] Wildcard handler error:`, error);
      }
    }
  }

  /**
   * Publie de manière synchrone (fire and forget)
   */
  emit<T = unknown>(
    type: EventType,
    data: T,
    source: string,
    metadata?: Record<string, unknown>
  ): void {
    this.publish(type, data, source, metadata).catch(console.error);
  }

  /**
   * Attend un événement spécifique
   */
  once<T = unknown>(type: EventType, timeout?: number): Promise<OSEvent<T>> {
    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const subscription = this.subscribe<T>(type, event => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        subscription.unsubscribe();
        resolve(event as OSEvent<T>);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`Timeout waiting for event: ${type}`));
        }, timeout);
      }
    });
  }

  /**
   * Retourne l'historique des événements
   */
  getHistory(type?: EventType): OSEvent[] {
    if (type) {
      return this.eventHistory.filter(e => e.type === type);
    }
    return [...this.eventHistory];
  }

  /**
   * Retourne les statistiques
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Retourne le nombre d'abonnés
   */
  getSubscriberCount(type?: EventType): number {
    if (type) {
      return this.subscribers.get(type)?.size ?? 0;
    }

    let total = this.wildcardSubscribers.size;
    for (const handlers of this.subscribers.values()) {
      total += handlers.size;
    }
    return total;
  }

  /**
   * Efface l'historique
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Supprime tous les abonnés
   */
  clear(): void {
    this.subscribers.clear();
    this.wildcardSubscribers.clear();
  }

  /**
   * Réinitialise complètement
   */
  reset(): void {
    this.clear();
    this.clearHistory();
    this.stats = { published: 0, handled: 0, failed: 0 };
    this.eventCounter = 0;
  }
}

// Instance singleton
let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!instance) {
    instance = new EventBus();
  }
  return instance;
}

export default EventBus;

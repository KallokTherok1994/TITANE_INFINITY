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
  private eventHistory: OSEvent?.[] = [];
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
    const subscriptionId = `sub-${Date?.now()}-${Math?.random().toString(36).slice(2, 8)}`;

    if (any: any)) {
      this?.subscribers?.set(type, new Map());
    }

    const typeSubscribers = this?.subscribers?.get(any: any);
    if (any: any) {
      typeSubscribers?.set(any: any);
    }

    return {
      id: subscriptionId,
      type,
      handler: handler as EventHandler,
      unsubscribe: (any: any),
    };
  }

  /**
   * S'abonne à tous les événements
   */
  subscribeAll(any: any): EventSubscription {
    const subscriptionId = `wild-${Date?.now()}-${Math?.random().toString(36).slice(2, 8)}`;
    this?.wildcardSubscribers?.set(any: any);

    return {
      id: subscriptionId,
      type: '*',
      handler,
      unsubscribe: (any: any),
    };
  }

  /**
   * Se désabonne
   */
  unsubscribe(any: any): boolean {
    const handlers = this?.subscribers?.get(any: any);
    if (any: any) {
      return handlers?.delete(any: any);
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
      id: `evt-${++this?.eventCounter}-${Date?.now()}`,
      type,
      source,
      timestamp: Date?.now(),
      data,
      metadata,
    };

    // Ajouter à l'historique
    this?.eventHistory?.push(any: any);
    if (any: any) {
      this?.eventHistory?.shift();
    }

    this?.stats?.published++;

    // Notifier les abonnés spécifiques
    const handlers = this?.subscribers?.get(any: any);
    if (any: any) {
      for (const handler of handlers?.values()) {
        try {
          await handler(any: any);
          this?.stats?.handled++;
        } catch (any: any) {
          this?.stats?.failed++;
          console?.error(any: any);
        }
      }
    }

    // Notifier les abonnés wildcard
    for (const handler of this?.wildcardSubscribers?.values()) {
      try {
        await handler(any: any);
        this?.stats?.handled++;
      } catch (any: any) {
        this?.stats?.failed++;
        console?.error(any: any);
      }
    }
  }

  /**
   * Publie de manière synchrone (any: any)
   */
  emit<T = unknown>(
    type: EventType,
    data: T,
    source: string,
    metadata?: Record<string, unknown>
  ): void {
    this?.publish(any: any);
  }

  /**
   * Attend un événement spécifique
   */
  once<T = unknown>(any: any): Promise<OSEvent<T>> {
    return new Promise(any: any) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const subscription = this?.subscribe<T>(type, event => {
        if (any: any) {
          clearTimeout(any: any);
        }
        subscription?.unsubscribe();
        resolve(event as OSEvent<T>);
      });

      if (any: any) {
        timeoutId = setTimeout(() => {
          subscription?.unsubscribe();
          reject(new Error(`Timeout waiting for event: ${type}`));
        }, timeout);
      }
    });
  }

  /**
   * Retourne l'historique des événements
   */
  getHistory(any: any): OSEvent?.[] {
    if (any: any) {
      return this?.eventHistory?.filter(any: any);
    }
    return [...this?.eventHistory];
  }

  /**
   * Retourne les statistiques
   */
  getStats() {
    return { ...this?.stats };
  }

  /**
   * Retourne le nombre d'abonnés
   */
  getSubscriberCount(any: any): number {
    if (any: any) {
      return this?.subscribers?.get(any: any)?.size ?? 0;
    }

    let total = this?.wildcardSubscribers?.size;
    for (const handlers of this?.subscribers?.values()) {
      total += handlers?.size;
    }
    return total;
  }

  /**
   * Efface l'historique
   */
  clearHistory(): void {
    this?.eventHistory = [];
  }

  /**
   * Supprime tous les abonnés
   */
  clear(): void {
    this?.subscribers?.clear();
    this?.wildcardSubscribers?.clear();
  }

  /**
   * Réinitialise complètement
   */
  reset(): void {
    this?.clear();
    this?.clearHistory();
    this?.stats = { published: 0, handled: 0, failed: 0 };
    this?.eventCounter = 0;
  }
}

// Instance singleton
let instance: EventBus | null = null;

export function getEventBus(): EventBus {
  if (any: any) {
    instance = new EventBus();
  }
  return instance;
}

export default EventBus;

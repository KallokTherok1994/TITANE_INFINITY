/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * EventBus - Unified event system for CoherenceEngine
 * Migrated from src/os/bus/EventBus.ts
 */

import type { EventType, SystemEvent, EventHandler } from '../types';

/**
 * EventBus - Centralized event management system
 *
 * Features:
 * - Type-safe event emission and subscription
 * - Wildcard subscriptions ('*')
 * - Event history for debugging
 * - Automatic cleanup on unsubscribe
 */
export class EventBus {
  private subscribers: Map<EventType | '*', Map<string, EventHandler>> = new Map();
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 100;
  private subscriptionCounter = 0;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T = unknown>(type: EventType | '*', handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Map());
    }

    const subscriptionId = `sub_${++this.subscriptionCounter}`;
    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      typeSubscribers.set(subscriptionId, handler as EventHandler);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(type);
      if (subs) {
        subs.delete(subscriptionId);
      }
    };
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = unknown>(event: SystemEvent<T>): void {
    const enrichedEvent: SystemEvent<T> = {
      ...event,
      timestamp: event.timestamp ?? Date.now(),
    };

    // Store in history
    this.addToHistory(enrichedEvent as SystemEvent);

    // Notify type-specific subscribers
    const typeSubscribers = this.subscribers.get(event.type);
    if (typeSubscribers) {
      typeSubscribers.forEach(handler => {
        try {
          handler(enrichedEvent as SystemEvent);
        } catch (error) {
          console.error(`[EventBus] Handler error for ${event.type}:`, error);
        }
      });
    }

    // Notify wildcard subscribers
    const wildcardSubscribers = this.subscribers.get('*');
    if (wildcardSubscribers) {
      wildcardSubscribers.forEach(handler => {
        try {
          handler(enrichedEvent as SystemEvent);
        } catch (error) {
          console.error('[EventBus] Wildcard handler error:', error);
        }
      });
    }
  }

  /**
   * Get recent event history
   */
  getHistory(limit?: number): SystemEvent[] {
    const count = limit ?? this.maxHistorySize;
    return this.eventHistory.slice(-count);
  }

  /**
   * Get events of a specific type from history
   */
  getHistoryByType(type: EventType, limit = 10): SystemEvent[] {
    return this.eventHistory.filter(e => e.type === type).slice(-limit);
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
    this.eventHistory = [];
  }

  /**
   * Get subscriber count
   */
  getSubscriberCount(type?: EventType): number {
    if (type) {
      return this.subscribers.get(type)?.size ?? 0;
    }
    let total = 0;
    this.subscribers.forEach(subs => {
      total += subs.size;
    });
    return total;
  }

  private addToHistory(event: SystemEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

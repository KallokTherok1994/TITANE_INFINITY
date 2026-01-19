/**
 * TITANE∞ v20Ω — State Bridge
 * Synchronisation d'état entre frontend et backend
 */

import { getTauriBridge } from './TauriBridge';
import { getEventBus } from '../bus/EventBus';

/**
 * Abonnement à un état
 */
interface StateSubscription<T> {
  id: string;
  key: string;
  handler: (value: T) => void;
  unsubscribe: () => void;
}

/**
 * Pont d'état synchronisé
 */
export class StateBridge {
  private localState: Map<string, unknown> = new Map();
  private subscribers: Map<string, Set<(value: unknown) => void>> = new Map();
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private syncIntervalMs = 5000;
  private dirtyKeys: Set<string> = new Set();
  private bridge = getTauriBridge();
  private eventBus = getEventBus();

  /**
   * Initialise le pont d'état
   */
  async init(): Promise<void> {
    // Charger l'état initial depuis le backend
    try {
      const initialState = await this.bridge.invoke<void, Record<string, unknown>>(
        'get_state'
      );
      for (const [key, value] of Object.entries(initialState)) {
        this.localState.set(key, value);
      }
    } catch (error) {
      console.warn('[StateBridge] Failed to load initial state:', error);
    }

    // Écouter les mises à jour du backend
    await this.bridge.listen<{ key: string; value: unknown }>('state:update', payload => {
      this.handleRemoteUpdate(payload.key, payload.value);
    });
  }

  /**
   * Récupère une valeur
   */
  get<T>(key: string): T | undefined {
    return this.localState.get(key) as T | undefined;
  }

  /**
   * Récupère une valeur avec défaut
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    const value = this.localState.get(key);
    return (value !== undefined ? value : defaultValue) as T;
  }

  /**
   * Définit une valeur localement et synchronise
   */
  async set<T>(key: string, value: T): Promise<void> {
    const oldValue = this.localState.get(key);
    this.localState.set(key, value);
    this.dirtyKeys.add(key);

    // Notifier les abonnés locaux
    this.notifySubscribers(key, value);

    // Publier un événement
    this.eventBus.emit('state:changed', { key, value, oldValue }, 'StateBridge');

    // Synchroniser avec le backend
    try {
      await this.bridge.invoke('set_state', { key, value });
      this.dirtyKeys.delete(key);
    } catch (error) {
      console.error(`[StateBridge] Failed to sync ${key}:`, error);
      // Garder dans dirtyKeys pour retry
    }
  }

  /**
   * Met à jour une valeur partiellement
   */
  async update<T extends object>(key: string, partial: Partial<T>): Promise<void> {
    const current = this.get<T>(key) ?? ({} as T);
    const updated = { ...current, ...partial };
    await this.set(key, updated);
  }

  /**
   * Supprime une valeur
   */
  async delete(key: string): Promise<void> {
    this.localState.delete(key);
    this.dirtyKeys.delete(key);

    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      for (const handler of subscribers) {
        handler(undefined);
      }
    }

    try {
      await this.bridge.invoke('delete_state', { key });
    } catch (error) {
      console.error(`[StateBridge] Failed to delete ${key}:`, error);
    }
  }

  /**
   * S'abonne aux changements d'une clé
   */
  subscribe<T>(key: string, handler: (value: T) => void): StateSubscription<T> {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const keySubs = this.subscribers.get(key);
    if (keySubs) {
      keySubs.add(handler as (value: unknown) => void);
    }

    // Appeler avec la valeur actuelle
    const currentValue = this.get<T>(key);
    if (currentValue !== undefined) {
      handler(currentValue);
    }

    return {
      id: subscriptionId,
      key,
      handler,
      unsubscribe: () => {
        const subs = this.subscribers.get(key);
        if (subs) {
          subs.delete(handler as (value: unknown) => void);
          if (subs.size === 0) {
            this.subscribers.delete(key);
          }
        }
      },
    };
  }

  /**
   * Gère une mise à jour distante
   */
  private handleRemoteUpdate(key: string, value: unknown): void {
    const oldValue = this.localState.get(key);

    // Ne pas écraser si on a une modification locale en attente
    if (this.dirtyKeys.has(key)) {
      console.warn(`[StateBridge] Ignoring remote update for dirty key: ${key}`);
      return;
    }

    this.localState.set(key, value);
    this.notifySubscribers(key, value);

    this.eventBus.emit('state:remote_update', { key, value, oldValue }, 'StateBridge');
  }

  /**
   * Notifie les abonnés
   */
  private notifySubscribers(key: string, value: unknown): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      for (const handler of subscribers) {
        try {
          handler(value);
        } catch (error) {
          console.error(`[StateBridge] Subscriber error for ${key}:`, error);
        }
      }
    }
  }

  /**
   * Démarre la synchronisation périodique
   */
  startSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncDirtyKeys().catch(console.error);
    }, this.syncIntervalMs);
  }

  /**
   * Arrête la synchronisation
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Synchronise les clés modifiées
   */
  async syncDirtyKeys(): Promise<void> {
    if (this.dirtyKeys.size === 0) return;

    const keysToSync = Array.from(this.dirtyKeys);

    for (const key of keysToSync) {
      const value = this.localState.get(key);
      try {
        await this.bridge.invoke('set_state', { key, value });
        this.dirtyKeys.delete(key);
      } catch (error) {
        console.error(`[StateBridge] Failed to sync ${key}:`, error);
      }
    }
  }

  /**
   * Force une synchronisation complète
   */
  async fullSync(): Promise<void> {
    try {
      const remoteState = await this.bridge.invoke<void, Record<string, unknown>>(
        'get_state'
      );

      for (const [key, value] of Object.entries(remoteState)) {
        if (!this.dirtyKeys.has(key)) {
          this.localState.set(key, value);
          this.notifySubscribers(key, value);
        }
      }

      // Synchroniser les clés locales non présentes côté serveur
      await this.syncDirtyKeys();
    } catch (error) {
      console.error('[StateBridge] Full sync failed:', error);
    }
  }

  /**
   * Retourne toutes les clés
   */
  keys(): string[] {
    return Array.from(this.localState.keys());
  }

  /**
   * Retourne l'état complet
   */
  getAll(): Record<string, unknown> {
    const state: Record<string, unknown> = {};
    for (const [key, value] of this.localState) {
      state[key] = value;
    }
    return state;
  }

  /**
   * Vérifie si une clé existe
   */
  has(key: string): boolean {
    return this.localState.has(key);
  }

  /**
   * Retourne le nombre de clés sales
   */
  getDirtyCount(): number {
    return this.dirtyKeys.size;
  }

  /**
   * Efface tout l'état local
   */
  clear(): void {
    this.localState.clear();
    this.dirtyKeys.clear();
    this.subscribers.clear();
  }

  /**
   * Détruit le pont
   */
  destroy(): void {
    this.stopSync();
    this.clear();
  }
}

// Instance singleton
let instance: StateBridge | null = null;

export function getStateBridge(): StateBridge {
  if (!instance) {
    instance = new StateBridge();
  }
  return instance;
}

export default StateBridge;

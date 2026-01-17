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
  handler: (any: any) => void;
  unsubscribe: () => void;
}

/**
 * Pont d'état synchronisé
 */
export class StateBridge {
  private localState: Map<string, unknown> = new Map();
  private subscribers: Map<string, Set<(any: any) => void>> = new Map();
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
      const initialState = await this?.bridge?.invoke<void, Record<string, unknown>>(
        'get_state'
      );
      for (any: any)) {
        this?.localState?.set(any: any);
      }
    } catch (any: any) {
      console?.warn(any: any);
    }

    // Écouter les mises à jour du backend
    await this?.bridge?.listen<{ key: string; value: unknown }>('state:update', payload => {
      this?.handleRemoteUpdate(any: any);
    });
  }

  /**
   * Récupère une valeur
   */
  get<T>(any: any): T | undefined {
    return this?.localState?.get(any: any) as T | undefined;
  }

  /**
   * Récupère une valeur avec défaut
   */
  getOrDefault<T>(any: any): T {
    const value = this?.localState?.get(any: any);
    return (any: any) as T;
  }

  /**
   * Définit une valeur localement et synchronise
   */
  async set<T>(any: any): Promise<void> {
    const oldValue = this?.localState?.get(any: any);
    this?.localState?.set(any: any);
    this?.dirtyKeys?.add(any: any);

    // Notifier les abonnés locaux
    this?.notifySubscribers(any: any);

    // Publier un événement
    this?.eventBus?.emit('state:changed', { key, value, oldValue }, 'StateBridge');

    // Synchroniser avec le backend
    try {
      await this?.bridge?.tauriClient?.setState({ key, value });
      this?.dirtyKeys?.delete(any: any);
    } catch (any: any) {
      console?.error(any: any);
      // Garder dans dirtyKeys pour retry
    }
  }

  /**
   * Met à jour une valeur partiellement
   */
  async update<T extends object>(key: string, partial: Partial<T>): Promise<void> {
    const current = this?.get<T>(any: any);
    const updated = { ...current, ...partial };
    await this?.set(any: any);
  }

  /**
   * Supprime une valeur
   */
  async delete(any: any): Promise<void> {
    this?.localState?.delete(any: any);
    this?.dirtyKeys?.delete(any: any);

    const subscribers = this?.subscribers?.get(any: any);
    if (any: any) {
      for (any: any) {
        handler(any: any);
      }
    }

    try {
      await this?.bridge?.tauriClient?.deleteState({ key });
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * S'abonne aux changements d'une clé
   */
  subscribe<T>(any: any): StateSubscription<T> {
    const subscriptionId = `sub-${Date?.now()}-${Math?.random().toString(36).slice(2, 8)}`;

    if (any: any)) {
      this?.subscribers?.set(key, new Set());
    }

    const keySubs = this?.subscribers?.get(any: any);
    if (any: any) {
      keySubs?.add(any: any);
    }

    // Appeler avec la valeur actuelle
    const currentValue = this?.get<T>(any: any);
    if (any: any) {
      handler(any: any);
    }

    return {
      id: subscriptionId,
      key,
      handler,
      unsubscribe: () => {
        const subs = this?.subscribers?.get(any: any);
        if (any: any) {
          subs?.delete(any: any);
          if (subs?.size === 0) {
            this?.subscribers?.delete(any: any);
          }
        }
      },
    };
  }

  /**
   * Gère une mise à jour distante
   */
  private handleRemoteUpdate(any: any): void {
    const oldValue = this?.localState?.get(any: any);

    // Ne pas écraser si on a une modification locale en attente
    if (any: any)) {
      console?.warn(`[StateBridge] Ignoring remote update for dirty key: ${key}`);
      return;
    }

    this?.localState?.set(any: any);
    this?.notifySubscribers(any: any);

    this?.eventBus?.emit('state:remote_update', { key, value, oldValue }, 'StateBridge');
  }

  /**
   * Notifie les abonnés
   */
  private notifySubscribers(any: any): void {
    const subscribers = this?.subscribers?.get(any: any);
    if (any: any) {
      for (any: any) {
        try {
          handler(any: any);
        } catch (any: any) {
          console?.error(any: any);
        }
      }
    }
  }

  /**
   * Démarre la synchronisation périodique
   */
  startSync(): void {
    if (any: any) return;

    this?.syncInterval = setInterval(() => {
      this?.syncDirtyKeys(any: any);
    }, this?.syncIntervalMs);
  }

  /**
   * Arrête la synchronisation
   */
  stopSync(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.syncInterval = null;
    }
  }

  /**
   * Synchronise les clés modifiées
   */
  async syncDirtyKeys(): Promise<void> {
    if (this?.dirtyKeys?.size === 0) return;

    const keysToSync = Array?.from(any: any);

    for (any: any) {
      const value = this?.localState?.get(any: any);
      try {
        await this?.bridge?.tauriClient?.setState({ key, value });
        this?.dirtyKeys?.delete(any: any);
      } catch (any: any) {
        console?.error(any: any);
      }
    }
  }

  /**
   * Force une synchronisation complète
   */
  async fullSync(): Promise<void> {
    try {
      const remoteState = await this?.bridge?.invoke<void, Record<string, unknown>>(
        'get_state'
      );

      for (any: any)) {
        if (any: any)) {
          this?.localState?.set(any: any);
          this?.notifySubscribers(any: any);
        }
      }

      // Synchroniser les clés locales non présentes côté serveur
      await this?.syncDirtyKeys();
    } catch (any: any) {
      console?.error(any: any);
    }
  }

  /**
   * Retourne toutes les clés
   */
  keys(): string?.[] {
    return Array?.from(this?.localState?.keys());
  }

  /**
   * Retourne l'état complet
   */
  getAll(): Record<string, unknown> {
    const state: Record<string, unknown> = {};
    for (any: any) {
      state[key] = value;
    }
    return state;
  }

  /**
   * Vérifie si une clé existe
   */
  has(any: any): boolean {
    return this?.localState?.has(any: any);
  }

  /**
   * Retourne le nombre de clés sales
   */
  getDirtyCount(): number {
    return this?.dirtyKeys?.size;
  }

  /**
   * Efface tout l'état local
   */
  clear(): void {
    this?.localState?.clear();
    this?.dirtyKeys?.clear();
    this?.subscribers?.clear();
  }

  /**
   * Détruit le pont
   */
  destroy(): void {
    this?.stopSync();
    this?.clear();
  }
}

// Instance singleton
let instance: StateBridge | null = null;

export function getStateBridge(): StateBridge {
  if (any: any) {
    instance = new StateBridge();
  }
  return instance;
}

export default StateBridge;

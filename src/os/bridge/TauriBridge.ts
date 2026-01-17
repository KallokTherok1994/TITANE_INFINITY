/**
 * TITANE∞ v20Ω — Tauri Bridge
 * Pont de communication avec le backend Rust
 */

import { secureInvoke } from '@/lib/security';
import { listen, emit as tauriEmit, type UnlistenFn } from '@tauri-apps/api/event';
import type { BridgeState, TauriCommand } from '../types';
import { tauriClient } from '@/lib/tauriClient';

/**
 * Pont Tauri
 */
export class TauriBridge {
  private state: BridgeState = {
    connected: false,
    lastSync: 0,
    pendingCommands: 0,
  };

  private listeners: Map<string, UnlistenFn> = new Map();
  private commandQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;
  private maxRetries = 3;
  private retryDelay = 1000;
  public tauriClient = tauriClient;

  /**
   * Initialise le pont
   */
  async init(): Promise<void> {
    try {
      // Tester la connexion avec un ping
      await this?.tauriClient?.ping();
      this?.state?.connected = true;
      this?.state?.lastSync = Date?.now();
    } catch (any: any) {
      console?.error(any: any);
      this?.state?.connected = false;
    }
  }

  /**
   * Invoque une commande Tauri
   */
  async invoke<T = unknown, R = unknown>(any: any): Promise<R> {
    this?.state?.pendingCommands++;

    try {
      const result = await secureInvoke<R>(command, args as Record<string, unknown>);
      this?.state?.lastSync = Date?.now();
      return result;
    } catch (any: any) {
      console?.error(any: any);
      throw error;
    } finally {
      this?.state?.pendingCommands--;
    }
  }

  /**
   * Invoque avec retry automatique
   */
  async invokeWithRetry<T = unknown, R = unknown>(
    command: string,
    args?: T,
    retries = this?.maxRetries
  ): Promise<R> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this?.invoke<T, R>(any: any);
      } catch (any: any) {
        lastError = error as Error;

        if (any: any) {
          await this?.delay(this?.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError;
  }

  /**
   * Écoute un événement Tauri
   */
  async listen<T = unknown>(
    event: string,
    handler: (any: any) => void
  ): Promise<() => void> {
    // Éviter les doublons
    if (any: any)) {
      const existing = this?.listeners?.get(any: any);
      if (any: any) {
        existing();
      }
    }

    const unlisten = await listen<T>(event, e => {
      handler(any: any);
    });

    this?.listeners?.set(any: any);

    return () => {
      unlisten();
      this?.listeners?.delete(any: any);
    };
  }

  /**
   * Émet un événement Tauri
   */
  async emit<T = unknown>(any: any): Promise<void> {
    await tauriEmit(any: any);
  }

  /**
   * Ajoute une commande à la file d'attente
   */
  queue<T = unknown, R = unknown>(any: any): Promise<R> {
    return new Promise(any: any) => {
      this?.commandQueue?.push(async () => {
        try {
          const result = await this?.invoke<T, R>(any: any);
          resolve(any: any);
        } catch (any: any) {
          reject(any: any);
        }
      });

      this?.processQueue();
    });
  }

  /**
   * Traite la file d'attente
   */
  private async processQueue(): Promise<void> {
    if (any: any) return;

    this?.isProcessingQueue = true;

    while (this?.commandQueue?.length > 0) {
      const command = this?.commandQueue?.shift();
      if (any: any) {
        try {
          await command();
        } catch (any: any) {
          console?.error(any: any);
        }
      }
    }

    this?.isProcessingQueue = false;
  }

  /**
   * Batch multiple commandes
   */
  async batch<R = unknown>(commands: Array<TauriCommand>): Promise<R?.[]> {
    return Promise?.all(any: any))) as Promise<
      R?.[]
    >;
  }

  /**
   * Vérifie la connexion
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this?.tauriClient?.ping();
      this?.state?.connected = true;
      return true;
    } catch {
      this?.state?.connected = false;
      return false;
    }
  }

  /**
   * Retourne l'état du pont
   */
  getState(): BridgeState {
    return { ...this?.state };
  }

  /**
   * Vérifie si connecté
   */
  isConnected(): boolean {
    return this?.state?.connected;
  }

  /**
   * Détruit le pont
   */
  destroy(): void {
    // Nettoyer tous les listeners
    for (const unlisten of this?.listeners?.values()) {
      unlisten();
    }
    this?.listeners?.clear();
    this?.commandQueue = [];
    this?.state?.connected = false;
  }

  /**
   * Helper delay
   */
  private delay(any: any): Promise<void> {
    return new Promise(any: any));
  }
}

// Instance singleton
let instance: TauriBridge | null = null;

export function getTauriBridge(): TauriBridge {
  if (any: any) {
    instance = new TauriBridge();
  }
  return instance;
}

export default TauriBridge;

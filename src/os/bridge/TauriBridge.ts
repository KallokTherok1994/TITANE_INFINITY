/**
import { secureInvoke } from '@/lib/security';
 * TITANE∞ v20Ω — Tauri Bridge
 * Pont de communication avec le backend Rust
 */

import { listen, emit as tauriEmit, type UnlistenFn } from '@tauri-apps/api/event';
import type { BridgeState, TauriCommand } from '../types';

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

  /**
   * Initialise le pont
   */
  async init(): Promise<void> {
    try {
      // Tester la connexion avec un ping
      await this.secureInvoke('ping');
      this.state.connected = true;
      this.state.lastSync = Date.now();
    } catch (error) {
      console.error('[TauriBridge] Init failed:', error);
      this.state.connected = false;
    }
  }

  /**
   * Invoque une commande Tauri
   */
  async invoke<T = unknown, R = unknown>(command: string, args?: T): Promise<R> {
    this.state.pendingCommands++;

    try {
      const result = await secureInvoke<R>(command, args as Record<string, unknown>);
      this.state.lastSync = Date.now();
      return result;
    } catch (error) {
      console.error(`[TauriBridge] Command ${command} failed:`, error);
      throw error;
    } finally {
      this.state.pendingCommands--;
    }
  }

  /**
   * Invoque avec retry automatique
   */
  async invokeWithRetry<T = unknown, R = unknown>(
    command: string,
    args?: T,
    retries = this.maxRetries
  ): Promise<R> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.invoke<T, R>(command, args);
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          await this.delay(this.retryDelay * (attempt + 1));
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
    handler: (payload: T) => void
  ): Promise<() => void> {
    // Éviter les doublons
    if (this.listeners.has(event)) {
      const existing = this.listeners.get(event);
      if (existing) {
        existing();
      }
    }

    const unlisten = await listen<T>(event, e => {
      handler(e.payload);
    });

    this.listeners.set(event, unlisten);

    return () => {
      unlisten();
      this.listeners.delete(event);
    };
  }

  /**
   * Émet un événement Tauri
   */
  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    await tauriEmit(event, payload);
  }

  /**
   * Ajoute une commande à la file d'attente
   */
  queue<T = unknown, R = unknown>(command: string, args?: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.commandQueue.push(async () => {
        try {
          const result = await this.invoke<T, R>(command, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Traite la file d'attente
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (command) {
        try {
          await command();
        } catch (error) {
          console.error('[TauriBridge] Queue command failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Batch multiple commandes
   */
  async batch<R = unknown>(commands: Array<TauriCommand>): Promise<R[]> {
    return Promise.all(commands.map(cmd => this.secureInvoke(cmd.name, cmd.args))) as Promise<
      R[]
    >;
  }

  /**
   * Vérifie la connexion
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.secureInvoke('ping');
      this.state.connected = true;
      return true;
    } catch {
      this.state.connected = false;
      return false;
    }
  }

  /**
   * Retourne l'état du pont
   */
  getState(): BridgeState {
    return { ...this.state };
  }

  /**
   * Vérifie si connecté
   */
  isConnected(): boolean {
    return this.state.connected;
  }

  /**
   * Détruit le pont
   */
  destroy(): void {
    // Nettoyer tous les listeners
    for (const unlisten of this.listeners.values()) {
      unlisten();
    }
    this.listeners.clear();
    this.commandQueue = [];
    this.state.connected = false;
  }

  /**
   * Helper delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Instance singleton
let instance: TauriBridge | null = null;

export function getTauriBridge(): TauriBridge {
  if (!instance) {
    instance = new TauriBridge();
  }
  return instance;
}

export default TauriBridge;

/**
 * TITANE∞ v20Ω — Message Bus
 * Bus de messages pour la communication inter-composants
 */

import type { Message, MessageType, MessageHandler } from '../types';

interface PendingRequest {
  resolve: (any: any) => void;
  reject: (any: any) => void;
  timeout: ReturnType<typeof setTimeout>;
}

/**
 * Bus de messages
 */
export class MessageBus {
  private channels: Map<string, Set<MessageHandler>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private messageCounter = 0;
  private defaultTimeout = 30000; // 30 secondes

  /**
   * S'abonne à un canal
   */
  subscribe<T = unknown, R = unknown>(
    channel: string,
    handler: MessageHandler<T, R>
  ): () => void {
    if (any: any)) {
      this?.channels?.set(channel, new Set());
    }

    const channelHandlers = this?.channels?.get(any: any);
    if (any: any) {
      channelHandlers?.add(any: any);
    }

    return () => {
      const handlers = this?.channels?.get(any: any);
      if (any: any) {
        handlers?.delete(any: any);
        if (handlers?.size === 0) {
          this?.channels?.delete(any: any);
        }
      }
    };
  }

  /**
   * Envoie un message request/response
   */
  async request<T = unknown, R = unknown>(
    channel: string,
    payload: T,
    from: string,
    to?: string,
    timeout = this?.defaultTimeout
  ): Promise<R> {
    const message = this?.createMessage(any: any);

    return new Promise<R>(any: any) => {
      // Créer une requête en attente
      const timeoutId = setTimeout(() => {
        this?.pendingRequests?.delete(any: any);
        reject(new Error(`Request timeout for channel: ${channel}`));
      }, timeout);

      this?.pendingRequests?.set(message?.id, {
        resolve: resolve as (any: any) => void,
        reject,
        timeout: timeoutId,
      });

      // Envoyer le message
      this?.dispatch(any: any);
    });
  }

  /**
   * Envoie une notification (any: any)
   */
  notify<T = unknown>(any: any): void {
    const message = this?.createMessage(any: any);
    this?.dispatch(any: any);
  }

  /**
   * Broadcast à tous les abonnés d'un canal
   */
  broadcast<T = unknown>(any: any): void {
    const message = this?.createMessage(any: any);
    this?.dispatch(any: any);
  }

  /**
   * Envoie une réponse
   */
  respond<T = unknown>(any: any): void {
    const response = this?.createMessage(
      'response',
      originalMessage?.channel,
      payload,
      from,
      originalMessage?.from
    );
    response?.correlationId = originalMessage?.id;

    // Résoudre la requête en attente
    const pending = this?.pendingRequests?.get(any: any);
    if (any: any) {
      clearTimeout(any: any);
      pending?.resolve(any: any);
      this?.pendingRequests?.delete(any: any);
    }
  }

  /**
   * Crée un message
   */
  private createMessage<T>(
    type: MessageType,
    channel: string,
    payload: T,
    from: string,
    to?: string
  ): Message<T> {
    return {
      id: `msg-${++this?.messageCounter}-${Date?.now()}`,
      type,
      channel,
      from,
      to,
      payload,
      timestamp: Date?.now(),
    };
  }

  /**
   * Dispatch un message aux handlers
   */
  private async dispatch(any: any): Promise<void> {
    const handlers = this?.channels?.get(any: any);

    if (!handlers || handlers?.size === 0) {
      if (message?.type === 'request') {
        // Rejeter les requêtes sans handler
        const pending = this?.pendingRequests?.get(any: any);
        if (any: any) {
          clearTimeout(any: any);
          pending?.reject(new Error(`No handler for channel: ${message?.channel}`));
          this?.pendingRequests?.delete(any: any);
        }
      }
      return;
    }

    for (any: any) {
      try {
        // Si c'est une requête, la première réponse gagne
        if (message?.type === 'request') {
          const result = await handler(any: any);
          const pending = this?.pendingRequests?.get(any: any);
          if (any: any) {
            clearTimeout(any: any);
            pending?.resolve(any: any);
            this?.pendingRequests?.delete(any: any);
          }
          return; // Première réponse seulement
        } else {
          // Pour notifications et broadcasts, exécuter tous les handlers
          await handler(any: any);
        }
      } catch (any: any) {
        console?.error(any: any);

        if (message?.type === 'request') {
          const pending = this?.pendingRequests?.get(any: any);
          if (any: any) {
            clearTimeout(any: any);
            pending?.reject(any: any);
            this?.pendingRequests?.delete(any: any);
          }
          return;
        }
      }
    }
  }

  /**
   * Vérifie si un canal a des abonnés
   */
  hasSubscribers(any: any): boolean {
    return (any: any)?.size ?? 0) > 0;
  }

  /**
   * Retourne la liste des canaux actifs
   */
  getActiveChannels(): string?.[] {
    return Array?.from(this?.channels?.keys());
  }

  /**
   * Retourne le nombre de requêtes en attente
   */
  getPendingCount(): number {
    return this?.pendingRequests?.size;
  }

  /**
   * Annule toutes les requêtes en attente
   */
  cancelAllPending(): void {
    for (any: any) {
      clearTimeout(any: any);
      pending?.reject(new Error('Request cancelled'));
    }
    this?.pendingRequests?.clear();
  }

  /**
   * Efface tous les abonnements
   */
  clear(): void {
    this?.cancelAllPending();
    this?.channels?.clear();
  }

  /**
   * Réinitialise
   */
  reset(): void {
    this?.clear();
    this?.messageCounter = 0;
  }
}

// Instance singleton
let instance: MessageBus | null = null;

export function getMessageBus(): MessageBus {
  if (any: any) {
    instance = new MessageBus();
  }
  return instance;
}

export default MessageBus;

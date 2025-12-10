/**
 * TITANE∞ v20Ω — Message Bus
 * Bus de messages pour la communication inter-composants
 */

import type { Message, MessageType, MessageHandler } from '../types';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
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
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }

    const channelHandlers = this.channels.get(channel);
    if (channelHandlers) {
      channelHandlers.add(handler as MessageHandler);
    }

    return () => {
      const handlers = this.channels.get(channel);
      if (handlers) {
        handlers.delete(handler as MessageHandler);
        if (handlers.size === 0) {
          this.channels.delete(channel);
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
    timeout = this.defaultTimeout
  ): Promise<R> {
    const message = this.createMessage('request', channel, payload, from, to);

    return new Promise<R>((resolve, reject) => {
      // Créer une requête en attente
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(message.id);
        reject(new Error(`Request timeout for channel: ${channel}`));
      }, timeout);

      this.pendingRequests.set(message.id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout: timeoutId,
      });

      // Envoyer le message
      this.dispatch(message).catch(reject);
    });
  }

  /**
   * Envoie une notification (sans réponse attendue)
   */
  notify<T = unknown>(channel: string, payload: T, from: string, to?: string): void {
    const message = this.createMessage('notification', channel, payload, from, to);
    this.dispatch(message).catch(console.error);
  }

  /**
   * Broadcast à tous les abonnés d'un canal
   */
  broadcast<T = unknown>(channel: string, payload: T, from: string): void {
    const message = this.createMessage('broadcast', channel, payload, from);
    this.dispatch(message).catch(console.error);
  }

  /**
   * Envoie une réponse
   */
  respond<T = unknown>(originalMessage: Message, payload: T, from: string): void {
    const response = this.createMessage(
      'response',
      originalMessage.channel,
      payload,
      from,
      originalMessage.from
    );
    response.correlationId = originalMessage.id;

    // Résoudre la requête en attente
    const pending = this.pendingRequests.get(originalMessage.id);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(payload);
      this.pendingRequests.delete(originalMessage.id);
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
      id: `msg-${++this.messageCounter}-${Date.now()}`,
      type,
      channel,
      from,
      to,
      payload,
      timestamp: Date.now(),
    };
  }

  /**
   * Dispatch un message aux handlers
   */
  private async dispatch(message: Message): Promise<void> {
    const handlers = this.channels.get(message.channel);

    if (!handlers || handlers.size === 0) {
      if (message.type === 'request') {
        // Rejeter les requêtes sans handler
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          pending.reject(new Error(`No handler for channel: ${message.channel}`));
          this.pendingRequests.delete(message.id);
        }
      }
      return;
    }

    for (const handler of handlers) {
      try {
        // Si c'est une requête, la première réponse gagne
        if (message.type === 'request') {
          const result = await handler(message);
          const pending = this.pendingRequests.get(message.id);
          if (pending) {
            clearTimeout(pending.timeout);
            pending.resolve(result);
            this.pendingRequests.delete(message.id);
          }
          return; // Première réponse seulement
        } else {
          // Pour notifications et broadcasts, exécuter tous les handlers
          await handler(message);
        }
      } catch (error) {
        console.error(`[MessageBus] Handler error for ${message.channel}:`, error);

        if (message.type === 'request') {
          const pending = this.pendingRequests.get(message.id);
          if (pending) {
            clearTimeout(pending.timeout);
            pending.reject(error as Error);
            this.pendingRequests.delete(message.id);
          }
          return;
        }
      }
    }
  }

  /**
   * Vérifie si un canal a des abonnés
   */
  hasSubscribers(channel: string): boolean {
    return (this.channels.get(channel)?.size ?? 0) > 0;
  }

  /**
   * Retourne la liste des canaux actifs
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Retourne le nombre de requêtes en attente
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Annule toutes les requêtes en attente
   */
  cancelAllPending(): void {
    for (const [_id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Request cancelled'));
    }
    this.pendingRequests.clear();
  }

  /**
   * Efface tous les abonnements
   */
  clear(): void {
    this.cancelAllPending();
    this.channels.clear();
  }

  /**
   * Réinitialise
   */
  reset(): void {
    this.clear();
    this.messageCounter = 0;
  }
}

// Instance singleton
let instance: MessageBus | null = null;

export function getMessageBus(): MessageBus {
  if (!instance) {
    instance = new MessageBus();
  }
  return instance;
}

export default MessageBus;

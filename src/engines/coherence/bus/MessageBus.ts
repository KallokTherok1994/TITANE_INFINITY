/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * MessageBus - Point-to-point messaging for CoherenceEngine
 * Migrated from src/os/bus/MessageBus.ts
 */

import type { Message, MessageHandler } from '../types';

/**
 * MessageBus - Direct messaging between components
 *
 * Features:
 * - Point-to-point messaging
 * - Request-response pattern
 * - Message routing
 * - Timeout handling
 */
export class MessageBus {
  private handlers: Map<string, Map<string, MessageHandler>> = new Map();
  private pendingReplies: Map<
    string,
    {
      resolve: (msg: Message) => void;
      reject: (error: Error) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  > = new Map();
  private messageCounter = 0;

  /**
   * Register a handler for messages to a specific target
   */
  register<T = unknown>(
    target: string,
    type: string,
    handler: MessageHandler<T>
  ): () => void {
    const key = `${target}:${type}`;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Map());
    }

    const handlerId = `h_${++this.messageCounter}`;
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.set(handlerId, handler as MessageHandler);
    }

    return () => {
      const h = this.handlers.get(key);
      if (h) {
        h.delete(handlerId);
      }
    };
  }

  /**
   * Send a message to a target
   */
  async send<T = unknown>(message: Omit<Message<T>, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: Message<T> = {
      ...message,
      id: `msg_${++this.messageCounter}`,
      timestamp: Date.now(),
    };

    // Check if this is a reply
    if (fullMessage.replyTo) {
      const pending = this.pendingReplies.get(fullMessage.replyTo);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(fullMessage as Message);
        this.pendingReplies.delete(fullMessage.replyTo);
        return;
      }
    }

    // Route to handlers
    const key = `${message.to}:${message.type}`;
    const handlers = this.handlers.get(key);

    if (handlers && handlers.size > 0) {
      const promises: Promise<void>[] = [];
      handlers.forEach(handler => {
        promises.push(
          Promise.resolve(handler(fullMessage as Message)).catch(error => {
            console.error(`[MessageBus] Handler error for ${key}:`, error);
          })
        );
      });
      await Promise.all(promises);
    } else {
      console.warn(`[MessageBus] No handlers for ${key}`);
    }
  }

  /**
   * Send a message and wait for reply
   */
  async request<TReq = unknown, TRes = unknown>(
    message: Omit<Message<TReq>, 'id' | 'timestamp'>,
    timeoutMs = 5000
  ): Promise<Message<TRes>> {
    const fullMessage: Message<TReq> = {
      ...message,
      id: `msg_${++this.messageCounter}`,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingReplies.delete(fullMessage.id);
        reject(new Error(`Request timeout for ${message.to}:${message.type}`));
      }, timeoutMs);

      this.pendingReplies.set(fullMessage.id, {
        resolve: resolve as (msg: Message) => void,
        reject,
        timeout,
      });

      // Send the message
      this.send(fullMessage).catch(reject);
    });
  }

  /**
   * Reply to a message
   */
  async reply<T = unknown>(originalMessage: Message, payload: T): Promise<void> {
    await this.send({
      from: originalMessage.to,
      to: originalMessage.from,
      type: `${originalMessage.type}:reply`,
      payload,
      replyTo: originalMessage.id,
    });
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.pendingReplies.forEach(pending => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('MessageBus cleared'));
    });
    this.pendingReplies.clear();
  }

  /**
   * Get handler count
   */
  getHandlerCount(): number {
    let total = 0;
    this.handlers.forEach(h => {
      total += h.size;
    });
    return total;
  }
}

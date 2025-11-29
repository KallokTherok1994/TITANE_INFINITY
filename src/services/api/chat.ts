/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import {
  invokeWithRetry,
  STANDARD_COMMAND_OPTIONS,
  LONG_COMMAND_OPTIONS,
} from '../../lib/serviceInvoker';

/**
 * Message de conversation
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  emotionState?: {
    valence: number;
    intensity: number;
    energy: number;
  };
}

/**
 * Configuration streaming
 */
export interface StreamConfig {
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  conversationId?: string;
  messageId?: string;
  systemPrompt?: string;
}

/**
 * Statistiques d'usage pour une réponse chat
 */
export interface ChatResponseUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Métadonnées enrichies pour les réponses chat
 */
export interface ChatResponseMetadata {
  messageId?: string;
  timestamp?: string;
  success?: boolean;
  chunkCount?: number;
  source?: string;
  conversationId?: string;
  [key: string]: unknown;
}

/**
 * Réponse chat normalisée
 */
export interface ChatResponse {
  content: string;
  usage?: ChatResponseUsage;
  finishReason: string;
  model: string;
  provider?: string;
  latencyMs?: number;
  metadata?: ChatResponseMetadata;
  omegaMetadata?: Record<string, unknown>;
}

interface BackendChatMessage {
  id: string;
  content: string;
  model: string;
  provider: string;
  timestamp: string;
  tokens?: number;
}

interface BackendChatResponse {
  success: boolean;
  message: BackendChatMessage;
  error?: string;
  latency_ms: number;
  omega_metadata?: Record<string, unknown>;
}

interface BackendChatRequest {
  message: string;
  provider: string;
  streaming: boolean;
  conversation_id?: string;
  model?: string;
  system_prompt?: string;
}

interface StreamChunkEvent {
  chunk?: string;
  accumulated?: string;
  ordinal?: number;
  done?: boolean;
  content?: string;
  conversation_id?: string;
  conversationId?: string;
  message_id?: string;
  messageId?: string;
  error?: string;
}

interface StreamResultPayload {
  content: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  tokens?: number;
  promptTokens?: number;
  chunkCount?: number;
  conversationId?: string;
  messageId?: string;
  totalDuration?: number;
  loadDuration?: number;
}

interface NormalizedCompleteEvent {
  content: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  tokens?: number;
  error?: string;
  chunkCount?: number;
  conversationId?: string;
  messageId?: string;
  promptTokens?: number;
  totalDuration?: number;
  loadDuration?: number;
}

class ChatService {
  /**
   * Envoi d'un message sans streaming
   */
  async sendMessage(
    messages: ChatMessage[],
    config?: StreamConfig
  ): Promise<ChatResponse> {
    const request = this.buildRequest(messages, config, false);

    try {
      const backendResponse = await invokeWithRetry<BackendChatResponse>(
        'chat_send_message',
        { request },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );

      return this.normalizeResponse(backendResponse, config);
    } catch (error) {
      console.error('[ChatService] Erreur sendMessage:', error);
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Chat envoi échoué: ${reason}`);
    }
  }

  /**
   * Envoi message avec streaming (callbacks)
   */
  async sendMessageStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void,
    config?: StreamConfig
  ): Promise<void> {
    const request = this.buildRequest(messages, config, true);

    let unlistenChunk: UnlistenFn | null = null;
    let unlistenComplete: UnlistenFn | null = null;
    let unlistenDone: UnlistenFn | null = null;
    let listenersCleaned = false;

    let cleanupRef: () => void = () => {};
    const cleanup = () => {
      if (listenersCleaned) {
        return;
      }
      listenersCleaned = true;

      if (unlistenChunk) {
        unlistenChunk();
        unlistenChunk = null;
      }
      if (unlistenComplete) {
        unlistenComplete();
        unlistenComplete = null;
      }
      if (unlistenDone) {
        unlistenDone();
        unlistenDone = null;
      }
    };
    cleanupRef = cleanup;

    let accumulated = '';
    let chunkCount = 0;
    let completed = false;
    let pendingComplete: NormalizedCompleteEvent | null = null;
    let completionPayload: NormalizedCompleteEvent | null = null;
    const pendingChunks: StreamChunkEvent[] = [];

    let targetConversationId: string | null = config?.conversationId ?? null;
    let targetMessageId: string | null = config?.messageId ?? null;

    const registerIds = (conversationId?: string | null, messageId?: string | null) => {
      if (conversationId && (!targetConversationId || targetConversationId === conversationId)) {
        targetConversationId = conversationId;
      }
      if (messageId && (!targetMessageId || targetMessageId === messageId)) {
        targetMessageId = messageId;
      }
    };

    const isMatchingChunk = (payload: StreamChunkEvent): boolean => {
      const payloadConversation = payload.conversation_id ?? payload.conversationId ?? null;
      const payloadMessage = payload.message_id ?? payload.messageId ?? null;

      if (targetConversationId && payloadConversation && payloadConversation !== targetConversationId) {
        return false;
      }
      if (targetMessageId && payloadMessage && payloadMessage !== targetMessageId) {
        return false;
      }
      return true;
    };

    const isMatchingCompletion = (payload: NormalizedCompleteEvent | null): boolean => {
      if (!payload) {
        return false;
      }

      if (targetConversationId && payload.conversationId && payload.conversationId !== targetConversationId) {
        return false;
      }
      if (targetMessageId && payload.messageId && payload.messageId !== targetMessageId) {
        return false;
      }
      return true;
    };

    const processChunk = (payload: StreamChunkEvent) => {
      const chunkText = this.extractChunkText(payload);

      if (typeof payload.accumulated === 'string' && payload.accumulated.length >= accumulated.length) {
        accumulated = payload.accumulated;
      } else if (chunkText) {
        accumulated += chunkText;
      }

      if (typeof payload.ordinal === 'number') {
        chunkCount = Math.max(chunkCount, payload.ordinal + 1);
      } else if (chunkText) {
        chunkCount += 1;
      }

      if (chunkText) {
        try {
          onChunk(chunkText);
        } catch (callbackError) {
          console.warn('[ChatService] onChunk callback error:', callbackError);
        }
      }
    };

    const flushPending = () => {
      if (targetMessageId && pendingChunks.length > 0) {
        const remaining: StreamChunkEvent[] = [];
        for (const payload of pendingChunks) {
          if (isMatchingChunk(payload)) {
            processChunk(payload);
          } else {
            remaining.push(payload);
          }
        }
        pendingChunks.length = 0;
        pendingChunks.push(...remaining);
      }

      if (pendingComplete && isMatchingCompletion(pendingComplete)) {
        const normalized = pendingComplete;
        pendingComplete = null;

        if (normalized.error) {
          completed = true;
          cleanup();
          const err = new Error(normalized.error);
          try {
            onError(err);
          } catch (callbackError) {
            console.warn('[ChatService] onError callback error:', callbackError);
          }
          return;
        }

        completionPayload = normalized;
        completed = true;

        const effectiveChunkCount = chunkCount || normalized.chunkCount || 0;
        const finalContent = normalized.content && normalized.content.length > 0
          ? normalized.content
          : accumulated;

        const response = this.normalizeStreamCompletion(
          finalContent,
          normalized,
          effectiveChunkCount,
          config,
          targetConversationId ?? normalized.conversationId ?? null,
          targetMessageId ?? normalized.messageId ?? null
        );

        try {
          onComplete(response);
        } catch (callbackError) {
          console.warn('[ChatService] onComplete callback error:', callbackError);
        }

        cleanup();
      }
    };

    const queueOrProcessChunk = (payload?: StreamChunkEvent) => {
      if (!payload || completed) {
        return;
      }

      const conversationId = payload.conversation_id ?? payload.conversationId ?? null;
      const messageId = payload.message_id ?? payload.messageId ?? null;
      registerIds(conversationId, messageId);

      if (!isMatchingChunk(payload)) {
        return;
      }

      if (!targetMessageId) {
        pendingChunks.push(payload);
        return;
      }

      processChunk(payload);
    };

    const handleCompletion = (eventPayload: unknown) => {
      const normalized = this.normalizeCompleteEvent(eventPayload);
      if (!normalized) {
        return;
      }

      registerIds(normalized.conversationId ?? null, normalized.messageId ?? null);
      pendingComplete = normalized;
      flushPending();
    };

    const chunkHandler = (event: { payload: StreamChunkEvent }) => {
      queueOrProcessChunk(event.payload);
    };

    const completeHandler = (event: { payload: unknown }) => {
      handleCompletion(event.payload);
    };

    const doneHandler = (event: { payload: StreamChunkEvent }) => {
      const payload = event.payload;
      if (!payload || payload.done !== true) {
        return;
      }
      handleCompletion(payload);
    };

    try {
      [unlistenChunk, unlistenComplete, unlistenDone] = await Promise.all([
        listen<StreamChunkEvent>('chat:stream:chunk', chunkHandler),
        listen<unknown>('chat:stream:complete', completeHandler),
        listen<StreamChunkEvent>('chat:stream:done', doneHandler),
      ]);
      cleanupRef = cleanup;

      const rawResult = await invokeWithRetry<unknown>(
        'chat_stream_message',
        { request },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );

      const streamResult = this.normalizeStreamResult(rawResult);

      registerIds(streamResult.conversationId ?? null, streamResult.messageId ?? null);
      if (typeof streamResult.chunkCount === 'number') {
        chunkCount = Math.max(chunkCount, streamResult.chunkCount);
      }

      flushPending();

      if (!completed) {
        const fallbackCompletion: NormalizedCompleteEvent = completionPayload ?? {
          content: streamResult.content,
          provider: streamResult.provider,
          model: streamResult.model,
          latencyMs: streamResult.latencyMs,
          tokens: streamResult.tokens,
          chunkCount: streamResult.chunkCount,
          conversationId: streamResult.conversationId,
          messageId: streamResult.messageId,
        };

        const finalContent = fallbackCompletion.content && fallbackCompletion.content.length > 0
          ? fallbackCompletion.content
          : accumulated.length > 0
            ? accumulated
            : streamResult.content;

        const effectiveChunkCount = chunkCount || fallbackCompletion.chunkCount || 0;

        const response = this.normalizeStreamCompletion(
          finalContent,
          fallbackCompletion,
          effectiveChunkCount,
          config,
          targetConversationId ?? fallbackCompletion.conversationId ?? null,
          targetMessageId ?? fallbackCompletion.messageId ?? null
        );

        completed = true;

        try {
          onComplete(response);
        } catch (callbackError) {
          console.warn('[ChatService] onComplete callback error (fallback):', callbackError);
        }

        cleanup();
      }
    } catch (error) {
      cleanup();
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        onError(err);
      } catch (callbackError) {
        console.warn('[ChatService] onError callback error (outer):', callbackError);
      }
    } finally {
      cleanupRef();
    }
  }

  /**
   * Génération suggestions contextuelles
   */
  async generateSuggestions(
    context: string,
    mode: string,
    limit: number = 3
  ): Promise<string[]> {
    try {
      return await invokeWithRetry<string[]>(
        'chat_generate_suggestions',
        { context, mode, limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur suggestions:', error);
      return [];
    }
  }

  /**
   * Analyse émotion d'un message
   */
  async analyzeEmotion(message: string): Promise<{
    valence: number;
    intensity: number;
    energy: number;
    label: string;
  }> {
    try {
      return await invokeWithRetry(
        'chat_analyze_emotion',
        { message },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur analyse émotion:', error);
      return {
        valence: 0,
        intensity: 0.5,
        energy: 0.5,
        label: 'neutre',
      };
    }
  }

  /**
   * Récupération historique conversation
   */
  async getHistory(limit: number = 50): Promise<ChatMessage[]> {
    try {
      return await invokeWithRetry<ChatMessage[]>(
        'chat_get_history',
        { limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur historique:', error);
      return [];
    }
  }

  /**
   * Effacement historique
   */
  async clearHistory(): Promise<void> {
    try {
      await invokeWithRetry<void>(
        'chat_clear_history',
        {},
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur effacement:', error);
      throw new Error(`Effacement échoué: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Recherche dans historique
   */
  async searchHistory(query: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      return await invokeWithRetry<ChatMessage[]>(
        'chat_search_history',
        { query, limit },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur recherche:', error);
      return [];
    }
  }

  /**
   * Export conversation (markdown/JSON)
   */
  async exportConversation(format: 'markdown' | 'json'): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'chat_export_conversation',
        { format },
        { ...STANDARD_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur export:', error);
      throw new Error(`Export échoué: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getLatestMessage(messages: ChatMessage[]): ChatMessage {
    let fallback: ChatMessage | null = null;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (!message || typeof message.content !== 'string' || message.content.trim().length === 0) {
        continue;
      }

      if (message.role === 'user') {
        return message;
      }

      if (!fallback) {
        fallback = message;
      }
    }

    if (fallback) {
      return fallback;
    }

    throw new Error('Aucun message valide fourni pour le streaming');
  }

  private buildRequest(
    messages: ChatMessage[],
    config: StreamConfig | undefined,
    streaming: boolean
  ): BackendChatRequest {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Historique de conversation vide');
    }

    const latestMessage = this.getLatestMessage(messages);

    const request: BackendChatRequest = {
      message: latestMessage.content,
      provider: config?.provider ?? 'auto',
      streaming,
    };

    if (config?.conversationId) {
      request.conversation_id = config.conversationId;
    }

    if (config?.model) {
      request.model = config.model;
    }

    if (config?.systemPrompt) {
      request.system_prompt = config.systemPrompt;
    }

    return request;
  }

  private normalizeResponse(
    backend: BackendChatResponse,
    config?: StreamConfig
  ): ChatResponse {
    if (!backend.success) {
      throw new Error(backend.error || 'Chat backend returned an error');
    }

    const tokens = backend.message.tokens;
    const usage = typeof tokens === 'number'
      ? {
          promptTokens: 0,
          completionTokens: tokens,
          totalTokens: tokens,
        }
      : undefined;

    return {
      content: backend.message.content,
      usage,
      finishReason: backend.error ? 'error' : 'stop',
      model: backend.message.model || config?.model || 'auto',
      provider: backend.message.provider,
      latencyMs: backend.latency_ms,
      metadata: {
        messageId: backend.message.id,
        timestamp: backend.message.timestamp,
        success: backend.success,
      },
      omegaMetadata: backend.omega_metadata,
    };
  }

  private normalizeStreamCompletion(
    content: string,
    payload: NormalizedCompleteEvent | null,
    chunkCount: number,
    config?: StreamConfig,
    conversationId: string | null = null,
    messageId: string | null = null
  ): ChatResponse {
    const hasUsage = typeof payload?.tokens === 'number' || typeof payload?.promptTokens === 'number';
    const completionTokens = typeof payload?.tokens === 'number' ? payload.tokens : undefined;
    const promptTokens = typeof payload?.promptTokens === 'number' ? payload.promptTokens : undefined;
    const usage = hasUsage
      ? {
          promptTokens: promptTokens ?? 0,
          completionTokens: completionTokens ?? 0,
          totalTokens: (promptTokens ?? 0) + (completionTokens ?? 0),
        }
      : undefined;

    return {
      content,
      usage,
      finishReason: payload?.error ? 'error' : 'stop',
      model: payload?.model || config?.model || 'auto',
      provider: payload?.provider,
      latencyMs: payload?.latencyMs,
      metadata: {
        chunkCount,
        source: 'tauri-event',
        conversationId: payload?.conversationId ?? conversationId ?? undefined,
        messageId: payload?.messageId ?? messageId ?? undefined,
        totalDuration: payload?.totalDuration,
        loadDuration: payload?.loadDuration,
        promptTokens,
      },
    };
  }

  private normalizeStreamResult(result: unknown): StreamResultPayload {
    if (result == null) {
      return { content: '' };
    }

    if (typeof result === 'string') {
      return { content: result };
    }

    if (typeof result !== 'object') {
      return { content: '' };
    }

    const data = result as Record<string, unknown>;
    const getString = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const getNumber = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'number') {
          return value;
        }
      }
      return undefined;
    };

    return {
      content: getString('content') ?? '',
      provider: getString('provider'),
      model: getString('model'),
      latencyMs: getNumber('latency_ms', 'latencyMs'),
      tokens: getNumber('tokens'),
      promptTokens: getNumber('prompt_tokens', 'promptTokens'),
      chunkCount: getNumber('chunk_count', 'chunkCount'),
      conversationId: getString('conversation_id', 'conversationId'),
      messageId: getString('message_id', 'messageId'),
      totalDuration: getNumber('total_duration', 'totalDuration'),
      loadDuration: getNumber('load_duration', 'loadDuration'),
    };
  }

  private normalizeCompleteEvent(raw: unknown): NormalizedCompleteEvent | null {
    if (raw == null) {
      return null;
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return this.normalizeCompleteEvent(parsed);
      } catch (error) {
        console.warn('[ChatService] Unable to parse completion payload:', error);
        return null;
      }
    }

    if (typeof raw !== 'object') {
      return null;
    }

    const data = raw as Record<string, unknown>;
    const getString = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'string' && value.length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const getNumber = (...keys: string[]): number | undefined => {
      for (const key of keys) {
        const value = data[key];
        if (typeof value === 'number') {
          return value;
        }
      }
      return undefined;
    };

    if (data.done === true && typeof data.content === 'string') {
      const nested = this.normalizeCompleteEvent(data.content);
      if (nested) {
        nested.conversationId = nested.conversationId ?? getString('conversation_id', 'conversationId');
        nested.messageId = nested.messageId ?? getString('message_id', 'messageId');
        if (!nested.chunkCount) {
          const ordinal = getNumber('ordinal');
          if (typeof ordinal === 'number') {
            nested.chunkCount = ordinal;
          }
        }
        if (nested.promptTokens == null) {
          const value = getNumber('prompt_tokens', 'promptTokens');
          if (typeof value === 'number') {
            nested.promptTokens = value;
          }
        }
        if (nested.totalDuration == null) {
          const value = getNumber('total_duration', 'totalDuration');
          if (typeof value === 'number') {
            nested.totalDuration = value;
          }
        }
        if (nested.loadDuration == null) {
          const value = getNumber('load_duration', 'loadDuration');
          if (typeof value === 'number') {
            nested.loadDuration = value;
          }
        }
      }
      return nested;
    }

    const content = getString('content') ?? '';

    return {
      content,
      provider: getString('provider'),
      model: getString('model'),
      latencyMs: getNumber('latency_ms', 'latencyMs'),
      tokens: getNumber('tokens'),
      error: getString('error'),
      chunkCount: getNumber('chunk_count', 'chunkCount'),
      conversationId: getString('conversation_id', 'conversationId'),
      messageId: getString('message_id', 'messageId'),
      promptTokens: getNumber('prompt_tokens', 'promptTokens'),
      totalDuration: getNumber('total_duration', 'totalDuration'),
      loadDuration: getNumber('load_duration', 'loadDuration'),
    };
  }

  private extractChunkText(payload: StreamChunkEvent): string | null {
    if (typeof payload.chunk === 'string' && payload.chunk.length > 0) {
      return payload.chunk;
    }

    if (payload.done !== true && typeof payload.content === 'string' && payload.content.length > 0) {
      return payload.content;
    }

    return null;
  }
}

/**
 * Instance singleton
 */
export const chatService = new ChatService();


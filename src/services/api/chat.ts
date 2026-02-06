/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invokeWithRetry, LONG_COMMAND_OPTIONS } from '@/lib/serviceInvoker';
import { monitoring } from '@/monitoring';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import { chatEngine } from '@/services/ai/chatEngine';
import { getSystemPrompt } from '@/config/chatModes.config';

const getChatEngine = async () => chatEngine;

/**
 * Type pour l'ID de conversation OMEGA
 */
export type ConversationId = string;

/**
 * Réponse de création de conversation
 */
interface StartConversationResponse {
  conversation_id: string;
}

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
  requestId?: string;
  systemPrompt?: string;
  mode?: string; // Mode IA (coach, strategist, etc.)
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
  timestamp?: string | number;
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
  frenchMasteryApplied?: boolean;
  metadata?: ChatResponseMetadata;
  omegaMetadata?: Record<string, unknown>;
}

interface BackendChatMessage {
  id: string;
  content: string;
  model: string;
  provider: string;
  timestamp: string | number; // Backend can send u64 or string
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
  request_id?: string;
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
  private lastEndpoint: 'OMEGA' | 'LEGACY' | null = null;

  private resolveProvider(
    backendProvider: unknown,
    configProvider: string | undefined
  ): string {
    return typeof backendProvider === 'string' && backendProvider.length > 0
      ? backendProvider
      : (configProvider ?? 'auto');
  }

  private resolveLatencyMs(latencyMs: unknown): number {
    return typeof latencyMs === 'number' && Number.isFinite(latencyMs) ? latencyMs : 0;
  }

  public getLastEndpoint(): 'OMEGA' | 'LEGACY' | null {
    return this.lastEndpoint;
  }
  /**
   * Démarre une nouvelle conversation avec le Conversation Engine OMEGA.
   * @returns L'ID de la nouvelle conversation.
   */
  async startNewConversation(): Promise<ConversationId> {
    console.log('[ChatService-OMEGA] 🚀 Démarrage d’une nouvelle conversation...');
    try {
      const response = await invokeWithRetry<StartConversationResponse>(
        'create_new_conversation',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'StartConversation' }
      );
      console.log(
        '[ChatService-OMEGA] ✅ Conversation créée avec ID:',
        response.conversation_id
      );
      return response.conversation_id;
    } catch (error) {
      console.error(
        '[ChatService-OMEGA] ❌ Erreur lors de la création de la conversation:',
        error
      );
      throw new Error('Impossible de démarrer une nouvelle conversation.');
    }
  }

  /**
   * Envoi d'un message au Conversation Engine OMEGA.
   * Utilise l'ID de conversation pour maintenir le contexte.
   */
  async sendMessage(
    message: string,
    conversationId: ConversationId,
    config?: StreamConfig
  ): Promise<ChatResponse> {
    this.lastEndpoint = 'OMEGA';
    if (!conversationId) {
      throw new Error('conversationId est requis pour utiliser le pipeline OMEGA.');
    }

    // 🛡️ BROWSER MODE PROTECTION - Backend web (chatEngine) si Tauri indisponible
    if (!isTauriRuntimeAvailable()) {
      const startedAt = Date.now();
      console.warn(
        '[ChatService-OMEGA] Tauri unavailable - using chatEngine (web backend)'
      );

      try {
        const engineResponse = await (
          await getChatEngine()
        ).generate(message, [], {
          mode: 'default',
        });
        return {
          content: engineResponse.content,
          finishReason:
            typeof engineResponse.metadata?.finishReason === 'string'
              ? engineResponse.metadata.finishReason
              : 'stop',
          model: engineResponse.model ?? 'titane-local-v19.2Ω',
          provider: engineResponse.provider,
          latencyMs: Date.now() - startedAt,
          metadata: {
            source: 'browser-chatEngine',
            messageId: `web-${Date.now()}`,
            timestamp: Date.now(),
            conversationId,
            selectedProvider: config?.provider ?? 'auto',
          },
          omegaMetadata:
            typeof engineResponse.omegaMetadata === 'object' &&
            engineResponse.omegaMetadata
              ? (engineResponse.omegaMetadata as Record<string, unknown>)
              : undefined,
        };
      } catch (error) {
        console.error(
          '[ChatService-OMEGA] Browser chatEngine failure - fallback response',
          error
        );
        return {
          content: `Mode navigateur: backend web indisponible (erreur interne).\n\nVotre message: "${message.substring(0, 100)}${message.length > 100 ? '..."' : '"'}`,
          finishReason: 'browser_fallback',
          model: 'titane-web-fallback',
          provider: 'browser-mode',
          latencyMs: Date.now() - startedAt,
          metadata: {
            source: 'browser-fallback',
            messageId: `fallback-${Date.now()}`,
            timestamp: Date.now(),
            conversationId,
            selectedProvider: config?.provider ?? 'auto',
          },
        };
      }
    }

    const startedAt = Date.now();
    monitoring.trackRequest();

    monitoring.addBreadcrumb('Chat sendMessage (OMEGA)', 'chat', {
      endpoint: 'OMEGA',
      conversationId,
      provider: config?.provider ?? 'auto',
      mode: config?.mode,
      messageLength: message.length,
    });

    console.log('[ChatService-OMEGA] 📤 Envoi message via OMEGA:', {
      conversationId,
      message: message.substring(0, 50) + '...',
    });

    try {
      // ✅ FIX P0-1: Type any pour gérer format OMEGA direct
      const requestId =
        config?.requestId ??
        `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const systemPrompt =
        config?.systemPrompt ?? getSystemPrompt(config?.mode ?? 'default');

      const backendResponse = await invokeWithRetry<any>(
        'conversation_generate', // 🎯 NOUVELLE commande Tauri OMEGA
        {
          message,
          conversation_id: conversationId,
          mode: config?.mode ?? null,
          provider: config?.provider ?? 'auto',
          system_prompt: systemPrompt,
          request_id: requestId,
        },
        { ...LONG_COMMAND_OPTIONS, context: 'ChatOmega' }
      );

      // ✅ FIX AUDIT: Validation format AVANT détection
      if (!backendResponse || typeof backendResponse !== 'object') {
        monitoring.trackPipelineError();
        console.error(
          '[ChatService-OMEGA] ❌ Réponse null ou invalide:',
          backendResponse
        );
        throw new Error('Backend response is null or not an object');
      }

      console.log('[ChatService-OMEGA] 📥 Réponse brute reçue:', {
        hasContent: !!backendResponse.content,
        hasSuccess: !!backendResponse.success,
        hasMessage: !!backendResponse.message,
        hasError: !!backendResponse.error,
        keys: Object.keys(backendResponse),
      });

      // ✅ FIX AUDIT: Gérer cas error explicite AVANT détection format
      if (backendResponse.error && !backendResponse.content && !backendResponse.success) {
        monitoring.trackPipelineError();
        console.error(
          '[ChatService-OMEGA] ❌ Backend retourné erreur:',
          backendResponse.error
        );
        throw new Error(`Backend error: ${backendResponse.error}`);
      }

      // ✅ FIX P0-1: Détection du format de réponse (OMEGA direct vs Legacy)
      if (backendResponse.content !== undefined) {
        // ✅ FIX AUDIT: Valider content non-null ET non-vide
        if (!backendResponse.content || backendResponse.content.trim() === '') {
          monitoring.trackPipelineError();
          console.error('[ChatService-OMEGA] ❌ Backend retourné content vide');
          throw new Error('Backend returned empty content');
        }

        // Format OMEGA direct: { content, conversationId, messageId, latencyMs, metadata }
        const latencyMs = backendResponse.latencyMs || Date.now() - startedAt;
        monitoring.trackPipelineLatency(latencyMs);

        console.log('[ChatService-OMEGA] ✅ Format OMEGA direct détecté:', {
          contentLength: backendResponse.content?.length ?? 0,
          conversationId: backendResponse.conversationId,
          messageId: backendResponse.messageId,
          latencyMs,
          provider: backendResponse.metadata?.provider,
        });

        return {
          content: backendResponse.content,
          finishReason: 'stop',
          model: config?.model || 'omega-pipeline',
          provider: backendResponse.metadata?.provider || 'tauri-backend',
          latencyMs,
          frenchMasteryApplied: backendResponse.frenchMasteryApplied ?? true,
          metadata: {
            messageId: backendResponse.messageId,
            conversationId: backendResponse.conversationId || conversationId, // Fallback
            requestId,
            timestamp: Date.now(),
            success: true,
            ...(backendResponse.metadata || {}),
          },
          omegaMetadata: backendResponse.metadata,
        };
      } else if (backendResponse.success && backendResponse.message) {
        // Format Legacy: { success, message: { content, ... }, error, latency_ms }
        const backendLatency = this.resolveLatencyMs(backendResponse.latency_ms);
        const measuredLatency = Date.now() - startedAt;
        const effectiveLatency = backendLatency > 0 ? backendLatency : measuredLatency;

        monitoring.trackPipelineLatency(effectiveLatency);

        console.log('[ChatService-OMEGA] ℹ️ Format Legacy détecté:', {
          success: backendResponse.success,
          provider: this.resolveProvider(
            backendResponse.message?.provider,
            config?.provider
          ),
          contentLength: backendResponse.message?.content?.length ?? 0,
          latencyMs: backendLatency,
        });

        return this.normalizeResponse(backendResponse, config);
      } else {
        // Format invalide
        monitoring.trackPipelineError();
        console.error(
          '[ChatService-OMEGA] ❌ Format de réponse invalide:',
          backendResponse
        );
        throw new Error(
          backendResponse.error ||
            'Réponse invalide du backend OMEGA (format non reconnu)'
        );
      }
    } catch (error) {
      console.error('[ChatService-OMEGA] ❌ Erreur sendMessage:', error);

      monitoring.trackError(error, {
        endpoint: 'OMEGA',
        conversationId,
        provider: config?.provider ?? 'auto',
        mode: config?.mode,
      });
      monitoring.trackPipelineError();

      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Chat OMEGA envoi échoué: ${reason}`);
    }
  }

  /**
   * [LEGACY] Envoi d'un message sans streaming
   * Réimplémenté avec OMEGA conversation_generate pour compatibilité useChat
   */
  async sendMessageLegacy(
    messages: ChatMessage[],
    config?: StreamConfig
  ): Promise<ChatResponse> {
    // Si aucun message ou messages vides, retourner une erreur
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided to sendMessageLegacy');
    }

    // Récupérer le dernier message utilisateur
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      throw new Error('Last message has no content');
    }

    // Utiliser l'API OMEGA conversation_generate via sendMessage
    // On va créer une conversation si nécessaire
    let conversationId = config?.conversationId;

    // Si pas d'ID de conversation, en créer une nouvelle
    if (!conversationId) {
      try {
        const convResponse = await this.startNewConversation();
        conversationId = convResponse;
      } catch (err) {
        console.warn(
          '[ChatService] Failed to create conversation, using fallback ID:',
          err
        );
        conversationId = `legacy-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      }
    }

    // Appeler sendMessage (OMEGA) avec le dernier message
    return this.sendMessage(lastMessage.content, conversationId, config);
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
    // 🛡️ BROWSER MODE PROTECTION - Fallback immédiat si Tauri indisponible
    if (!isTauriRuntimeAvailable()) {
      console.warn('[ChatService-Stream] Tauri unavailable - using browser fallback');
      const fallbackResponse: ChatResponse = {
        content:
          "Mode navigateur: backend Tauri indisponible. Lance l'application native TITANE∞ pour accéder au moteur IA complet.",
        finishReason: 'browser_fallback',
        model: 'titane-web-fallback',
        provider: 'browser-mode',
        latencyMs: 0,
        metadata: {
          source: 'browser-fallback',
          messageId: `fallback-${Date.now()}`,
          timestamp: Date.now(),
        },
      };

      // Simulate typing effect
      const words = fallbackResponse.content.split(' ');
      let currentText = '';
      for (const word of words) {
        currentText += (currentText ? ' ' : '') + word;
        onChunk(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay per word
      }

      onComplete(fallbackResponse);
      return;
    }

    this.lastEndpoint = 'OMEGA';
    const startedAt = Date.now();
    monitoring.trackRequest();

    const request = this.buildRequest(messages, config, true);

    const lastMessage = messages[messages.length - 1]?.content ?? '';
    monitoring.addBreadcrumb('Chat sendMessageStream (OMEGA)', 'chat', {
      endpoint: 'OMEGA',
      streaming: true,
      provider: config?.provider ?? 'auto',
      mode: config?.mode,
      messageCount: messages.length,
      messageLength: lastMessage.length,
      conversationId: config?.conversationId,
      messageId: config?.messageId,
    });

    const reportStreamError = (err: Error, phase: string) => {
      try {
        monitoring.trackError(err, {
          endpoint: 'OMEGA_STREAM',
          phase,
          provider: config?.provider ?? 'auto',
          mode: config?.mode,
          messageCount: messages.length,
          conversationId: config?.conversationId,
          messageId: config?.messageId,
        });
        monitoring.trackPipelineError();
      } catch {
        // Intentionally ignore monitoring errors
      }
    };

    const reportStreamSuccess = (response: ChatResponse, source: string) => {
      try {
        const measuredLatency = Date.now() - startedAt;
        const responseLatency =
          typeof response.latencyMs === 'number' && Number.isFinite(response.latencyMs)
            ? response.latencyMs
            : 0;
        const effectiveLatency = responseLatency > 0 ? responseLatency : measuredLatency;
        monitoring.trackPipelineLatency(effectiveLatency);

        monitoring.addBreadcrumb('Chat stream completed', 'chat', {
          endpoint: 'OMEGA',
          source,
          provider: response.provider ?? config?.provider ?? 'auto',
          mode: config?.mode,
          latencyMs: effectiveLatency,
          chunkCount: response.metadata?.chunkCount,
          conversationId: response.metadata?.conversationId,
          messageId: response.metadata?.messageId,
        });
      } catch {
        // Intentionally ignore monitoring errors
      }
    };

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
      if (
        conversationId &&
        (!targetConversationId || targetConversationId === conversationId)
      ) {
        targetConversationId = conversationId;
      }
      if (messageId && (!targetMessageId || targetMessageId === messageId)) {
        targetMessageId = messageId;
      }
    };

    const isMatchingChunk = (payload: StreamChunkEvent): boolean => {
      const payloadConversation =
        payload.conversation_id ?? payload.conversationId ?? null;
      const payloadMessage = payload.message_id ?? payload.messageId ?? null;

      if (
        targetConversationId &&
        payloadConversation &&
        payloadConversation !== targetConversationId
      ) {
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

      if (
        targetConversationId &&
        payload.conversationId &&
        payload.conversationId !== targetConversationId
      ) {
        return false;
      }
      if (targetMessageId && payload.messageId && payload.messageId !== targetMessageId) {
        return false;
      }
      return true;
    };

    const processChunk = (payload: StreamChunkEvent) => {
      const chunkText = this.extractChunkText(payload);

      if (
        typeof payload.accumulated === 'string' &&
        payload.accumulated.length >= accumulated.length
      ) {
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
          reportStreamError(err, 'complete');
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
        // Ne jamais écraser du contenu déjà streamé avec un "complete" vide/whitespace.
        const completeContent =
          typeof normalized.content === 'string' && normalized.content.trim().length > 0
            ? normalized.content
            : '';
        const finalContent = completeContent || accumulated;

        if (finalContent.trim().length === 0) {
          completed = true;
          cleanup();
          const err = new Error('Réponse vide du backend (stream completion)');
          reportStreamError(err, 'complete');
          try {
            onError(err);
          } catch (callbackError) {
            console.warn('[ChatService] onError callback error:', callbackError);
          }
          return;
        }

        const response = this.normalizeStreamCompletion(
          finalContent,
          normalized,
          effectiveChunkCount,
          config,
          targetConversationId ?? normalized.conversationId ?? null,
          targetMessageId ?? normalized.messageId ?? null
        );

        reportStreamSuccess(response, 'event');

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

        // Même logique en fallback : si content est vide/whitespace, on retombe sur accumulated,
        // puis sur le résultat brut si besoin.
        const fallbackContent =
          typeof fallbackCompletion.content === 'string' &&
          fallbackCompletion.content.trim().length > 0
            ? fallbackCompletion.content
            : '';
        const finalContent =
          fallbackContent ||
          (accumulated.length > 0 ? accumulated : streamResult.content);

        if (finalContent.trim().length === 0) {
          throw new Error('Réponse vide du backend (stream fallback)');
        }

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

        reportStreamSuccess(response, 'fallback');

        try {
          onComplete(response);
        } catch (callbackError) {
          console.warn(
            '[ChatService] onComplete callback error (fallback):',
            callbackError
          );
        }

        cleanup();
      }
    } catch (error) {
      cleanup();
      const err = error instanceof Error ? error : new Error(String(error));
      reportStreamError(err, 'outer');
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur effacement:', error);
      throw new Error(
        `Effacement échoué: ${error instanceof Error ? error.message : String(error)}`
      );
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
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
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (error) {
      console.error('[ChatService] Erreur export:', error);
      throw new Error(
        `Export échoué: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getLatestMessage(messages: ChatMessage[]): ChatMessage {
    let fallback: ChatMessage | null = null;

    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (
        !message ||
        typeof message.content !== 'string' ||
        message.content.trim().length === 0
      ) {
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

    request.system_prompt =
      config?.systemPrompt ?? getSystemPrompt(config?.mode ?? 'default');

    if (config?.requestId) {
      request.request_id = config.requestId;
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

    const extractNonEmptyContent = (message: BackendChatMessage): string => {
      const rawCandidates: Array<unknown> = [
        message?.content,
        // Defensive fallbacks for backend shape drift
        (message as unknown as Record<string, unknown>)?.['text'],
        (message as unknown as Record<string, unknown>)?.['message'],
        (message as unknown as Record<string, unknown>)?.['response'],
      ];

      for (const candidate of rawCandidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          return candidate;
        }
      }

      throw new Error('Backend returned empty content');
    };

    const content = extractNonEmptyContent(backend.message);
    const tokens = backend.message.tokens;
    const usage =
      typeof tokens === 'number'
        ? {
            promptTokens: 0,
            completionTokens: tokens,
            totalTokens: tokens,
          }
        : undefined;

    const provider = this.resolveProvider(backend.message?.provider, config?.provider);
    const latencyMs = this.resolveLatencyMs(backend.latency_ms);

    return {
      content,
      usage,
      finishReason: backend.error ? 'error' : 'stop',
      model: backend.message.model || config?.model || 'auto',
      provider,
      latencyMs,
      metadata: {
        messageId: backend.message.id,
        timestamp:
          typeof backend.message.timestamp === 'number'
            ? new Date(backend.message.timestamp * 1000).toISOString()
            : backend.message.timestamp,
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
    const hasUsage =
      typeof payload?.tokens === 'number' || typeof payload?.promptTokens === 'number';
    const completionTokens =
      typeof payload?.tokens === 'number' ? payload.tokens : undefined;
    const promptTokens =
      typeof payload?.promptTokens === 'number' ? payload.promptTokens : undefined;
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
      provider: this.resolveProvider(payload?.provider, config?.provider),
      latencyMs: this.resolveLatencyMs(payload?.latencyMs),
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
        nested.conversationId =
          nested.conversationId ?? getString('conversation_id', 'conversationId');
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

    if (
      payload.done !== true &&
      typeof payload.content === 'string' &&
      payload.content.length > 0
    ) {
      return payload.content;
    }

    return null;
  }
}

/**
 * Instance singleton
 */
export const chatService = new ChatService();

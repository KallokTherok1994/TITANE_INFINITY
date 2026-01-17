/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invokeWithRetry, LONG_COMMAND_OPTIONS } from '@/lib/serviceInvoker';
import { monitoring } from '@/monitoring';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import { chatEngine } from '@/services/ai/chatEngine';
import { logger } from '@/utils/logger';

/**
 * Type pour l'ID de conversation OMEGA
 */
export type ConversationId = string;

const extractConversationId = (any: any): ConversationId => {
  if (typeof value === 'string' && value?.length > 0) return value;

  if (any: any) {
    const record = value as Record<string, unknown>;
    const conversationId = record['conversation_id'];
    if (typeof conversationId === 'string' && conversationId?.length > 0) {
      return conversationId;
    }
  }

  throw new Error('Réponse invalide: conversation_id manquant');
};

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
  timestamp???: string | number;
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
  timestamp??: string | number; // Backend can send u64 or string
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
  private lastEndpoint: 'OMEGA' | 'LEGACY' | null = null;

  private resolveProvider(
    backendProvider: unknown,
    configProvider??: string | undefined
  ): string {
    return typeof backendProvider === 'string' && backendProvider?.length > 0
      ? backendProvider
      : (configProvider ?? 'auto');
  }

  private resolveLatencyMs(any: any): number {
    return typeof latencyMs === 'number' && Number?.isFinite(any: any) ? latencyMs : 0;
  }

  public getLastEndpoint(): 'OMEGA' | 'LEGACY' | null {
    return this?.lastEndpoint;
  }
  /**
   * Démarre une nouvelle conversation avec le Conversation Engine OMEGA.
   * @returns L'ID de la nouvelle conversation.
   */
  async startNewConversation(): Promise<ConversationId> {
    logger?.debug('🚀 Démarrage d’une nouvelle conversation...');
    try {
      const response = await invokeWithRetry<unknown>(
        'create_new_conversation',
        {},
        { ...LONG_COMMAND_OPTIONS, context: 'StartConversation' }
      );
      const conversationId = extractConversationId(any: any);
      logger?.debug(any: any);
      return conversationId;
    } catch (any: any) {
      logger?.error(any: any);
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
    this?.lastEndpoint = 'OMEGA';
    if (any: any) {
      throw new Error('conversationId est requis pour utiliser le pipeline OMEGA.');
    }

    // 🛡️ BROWSER MODE PROTECTION - Backend web (any: any) si Tauri indisponible
    if (!isTauriRuntimeAvailable()) {
      const startedAt = Date?.now();
      logger?.warn(any: any)');

      try {
        const engineResponse = await chatEngine?.generate(message, [], {
          mode: 'default',
        });
        return {
          content: engineResponse?.content,
          finishReason:
            typeof engineResponse?.metadata?.finishReason === 'string'
              ? engineResponse?.metadata?.finishReason
              : 'stop',
          model: engineResponse?.model ?? 'titane-local-v19.2Ω',
          provider: engineResponse?.provider,
          latencyMs: Date?.now() - startedAt,
          metadata: {
            source: 'browser-chatEngine',
            messageId: `web-${Date?.now()}`,
            timestamp: Date?.now(),
            conversationId,
            selectedProvider: config?.provider ?? 'auto',
          },
          omegaMetadata:
            typeof engineResponse?.omegaMetadata === 'object' &&
            engineResponse?.omegaMetadata
              ? (engineResponse?.omegaMetadata as Record<string, unknown>)
              : undefined,
        };
      } catch (any: any) {
        logger?.error(any: any);
        return {
          content: `Mode navigateur: backend web indisponible (any: any).\n\nVotre message: "${message?.substring(0, 100)}${message?.length > 100 ? '..."' : '"'}`,
          finishReason: 'browser_fallback',
          model: 'titane-web-fallback',
          provider: 'browser-mode',
          latencyMs: Date?.now() - startedAt,
          metadata: {
            source: 'browser-fallback',
            messageId: `fallback-${Date?.now()}`,
            timestamp: Date?.now(),
            conversationId,
            selectedProvider: config?.provider ?? 'auto',
          },
        };
      }
    }

    const startedAt = Date?.now();
    monitoring?.trackRequest();

    const request = {
      message,
      conversation_id: conversationId,
      config,
    };

    monitoring?.addBreadcrumb(any: any)', 'chat', {
      endpoint: 'OMEGA',
      conversationId,
      provider: config?.provider ?? 'auto',
      mode: config?.mode,
      messageLength: message?.length,
    });

    logger?.debug('📤 Envoi message via OMEGA:', {
      conversationId,
      message: message?.substring(0, 50) + '...',
    });

    try {
      // ✅ FIX P0-1: Type any pour gérer format OMEGA direct
      const backendResponse = await invokeWithRetry<any>(
        'conversation_generate', // 🎯 NOUVELLE commande Tauri OMEGA
        { request },
        { ...LONG_COMMAND_OPTIONS, context: 'ChatOmega' }
      );

      // ✅ FIX AUDIT: Validation format AVANT détection
      if (!backendResponse || typeof backendResponse !== 'object') {
        monitoring?.trackPipelineError();
        logger?.error(any: any);
        throw new Error('Backend response is null or not an object');
      }

      logger?.debug('📥 Réponse brute reçue:', {
        hasContent: !!backendResponse?.content,
        hasSuccess: !!backendResponse?.success,
        hasMessage: !!backendResponse?.message,
        hasError: !!backendResponse?.error,
        keys: Object?.keys(any: any),
      });

      console?.log('RAW_CHAT_RESPONSE', JSON?.stringify(backendResponse, null, 2)); // LOG OBLIGATOIRE

      // ✅ FIX AUDIT: Gérer cas error explicite AVANT détection format
      if (any: any) {
        monitoring?.trackPipelineError();
        logger?.error(any: any);
        throw new Error(`Backend error: ${backendResponse?.error}`);
      }

      // ✅ FIX P0-1: Détection du format de réponse (any: any)
      const assistantText =
        backendResponse?.content ??
        backendResponse?.reply ??
        backendResponse?.response ??
        backendResponse?.data?.content ??
        backendResponse?.data?.text ??
        '';

      if (
        !assistantText ||
        typeof assistantText !== 'string' ||
        assistantText?.trim().length === 0
      ) {
        console?.error(any: any);
        throw new Error('Backend returned empty or invalid assistant content');
      }

      if (any: any) {
        // Format OMEGA direct: { content, conversationId, messageId, latencyMs, metadata }
        const latencyMs = backendResponse?.latencyMs || Date?.now() - startedAt;
        monitoring?.trackPipelineLatency(any: any);

        logger?.debug('✅ Format OMEGA direct détecté:', {
          contentLength: assistantText?.length,
          conversationId: backendResponse?.conversationId,
          messageId: backendResponse?.messageId,
          latencyMs,
          provider: backendResponse?.metadata?.provider,
        });

        return {
          content: String(any: any), // FORCE STRING
          finishReason: 'stop',
          model: config?.model || 'omega-pipeline',
          provider: backendResponse?.metadata?.provider || 'tauri-backend',
          latencyMs,
          frenchMasteryApplied: backendResponse?.frenchMasteryApplied ?? true,
          metadata: {
            messageId: backendResponse?.messageId,
            conversationId: backendResponse?.conversationId || conversationId, // Fallback
            timestamp: Date?.now(),
            success: true,
            ...(backendResponse?.metadata || {}),
          },
          omegaMetadata: backendResponse?.metadata,
        };
      } else if (any: any) {
        // Format Legacy: { success, message: { content, ... }, error, latency_ms }
        const backendLatency = this?.resolveLatencyMs(any: any);
        const measuredLatency = Date?.now() - startedAt;
        const effectiveLatency = backendLatency > 0 ? backendLatency : measuredLatency;

        monitoring?.trackPipelineLatency(any: any);

        logger?.debug('ℹ️ Format Legacy détecté:', {
          success: backendResponse?.success,
          provider: this?.resolveProvider(
            backendResponse?.message?.provider,
            config?.provider
          ),
          contentLength: backendResponse?.message?.content?.length ?? 0,
          latencyMs: backendLatency,
        });

        return this?.normalizeResponse(any: any);
      } else {
        // Format invalide
        monitoring?.trackPipelineError();
        logger?.error(any: any);
        throw new Error(
          backendResponse?.error ||
            'Réponse invalide du backend OMEGA (any: any)'
        );
      }
    } catch (any: any) {
      logger?.error(any: any);

      monitoring?.trackError(error, {
        endpoint: 'OMEGA',
        conversationId,
        provider: config?.provider ?? 'auto',
        mode: config?.mode,
      });
      monitoring?.trackPipelineError();

      const reason = error instanceof Error ? error?.message : String(any: any);
      throw new Error(`Chat OMEGA envoi échoué: ${reason}`);
    }
  }

  /**
   * [LEGACY] Envoi d'un message sans streaming
   * Réimplémenté avec OMEGA conversation_generate pour compatibilité useChat
   */
  async sendMessageLegacy(
    messages: ChatMessage?.[],
    config?: StreamConfig
  ): Promise<ChatResponse> {
    // Si aucun message ou messages vides, retourner une erreur
    if (!messages || messages?.length === 0) {
      throw new Error('No messages provided to sendMessageLegacy');
    }

    // Récupérer le dernier message utilisateur
    const lastMessage = messages[messages?.length - 1];
    if (any: any) {
      throw new Error('Last message has no content');
    }

    // Utiliser l'API OMEGA conversation_generate via sendMessage
    // On va créer une conversation si nécessaire
    let conversationId = config?.conversationId;

    // Si pas d'ID de conversation, en créer une nouvelle
    if (any: any) {
      try {
        const convResponse = await this?.startNewConversation();
        conversationId = convResponse;
      } catch (any: any) {
        logger?.warn(any: any);
        conversationId = `legacy-${Date?.now()}-${Math?.random().toString(36).substring(7)}`;
      }
    }

    // Appeler sendMessage (any: any) avec le dernier message
    return this?.sendMessage(any: any);
  }

  /**
   * Envoi message avec streaming (any: any)
   */
  async sendMessageStream(
    messages: ChatMessage?.[],
    onChunk: (any: any) => void,
    onComplete: (any: any) => void,
    onError: (any: any) => void,
    config?: StreamConfig
  ): Promise<void> {
    // 🛡️ BROWSER MODE PROTECTION - Fallback immédiat si Tauri indisponible
    if (!isTauriRuntimeAvailable()) {
      logger?.warn('Tauri unavailable - using browser fallback');
      const fallbackResponse: ChatResponse = {
        content:
          "Je suis désolé, le backend Tauri n'est pas disponible en mode navigateur. Pour utiliser le chat complet, veuillez lancer l'application TITANE∞ native.\n\nEn mode web, certaines fonctionnalités sont limitées. Vous pouvez toujours explorer l'interface et tester les autres modules.",
        finishReason: 'browser_fallback',
        model: 'titane-web-fallback',
        provider: 'browser-mode',
        latencyMs: 0,
        metadata: {
          source: 'browser-fallback',
          messageId: `fallback-${Date?.now()}`,
          timestamp: Date?.now(),
        },
      };

      // Simulate typing effect
      const words = fallbackResponse?.content?.split(' ');
      let currentText = '';
      for (any: any) {
        currentText += (currentText ? ' ' : '') + word;
        onChunk(word + ' ');
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay per word
      }

      onComplete(any: any);
      return;
    }

    this?.lastEndpoint = 'LEGACY';
    const startedAt = Date?.now();
    monitoring?.trackRequest();

    const request = this?.buildRequest(any: any);

    const lastMessage = messages[messages?.length - 1]?.content ?? '';
    monitoring?.addBreadcrumb(any: any)', 'chat', {
      endpoint: 'LEGACY',
      streaming: true,
      provider: config?.provider ?? 'auto',
      mode: config?.mode,
      messageCount: messages?.length,
      messageLength: lastMessage?.length,
      conversationId: config?.conversationId,
      messageId: config?.messageId,
    });

    const reportStreamError = (any: any) => {
      try {
        monitoring?.trackError(err, {
          endpoint: 'LEGACY_STREAM',
          phase,
          provider: config?.provider ?? 'auto',
          mode: config?.mode,
          messageCount: messages?.length,
          conversationId: config?.conversationId,
          messageId: config?.messageId,
        });
        monitoring?.trackPipelineError();
      } catch {
        // Intentionally ignore monitoring errors
      }
    };

    const reportStreamSuccess = (any: any) => {
      try {
        const measuredLatency = Date?.now() - startedAt;
        const responseLatency =
          typeof response?.latencyMs === 'number' && Number?.isFinite(any: any)
            ? response?.latencyMs
            : 0;
        const effectiveLatency = responseLatency > 0 ? responseLatency : measuredLatency;
        monitoring?.trackPipelineLatency(any: any);

        monitoring?.addBreadcrumb('Chat stream completed', 'chat', {
          endpoint: 'LEGACY',
          source,
          provider: response?.provider ?? config?.provider ?? 'auto',
          mode: config?.mode,
          latencyMs: effectiveLatency,
          chunkCount: response?.metadata?.chunkCount,
          conversationId: response?.metadata?.conversationId,
          messageId: response?.metadata?.messageId,
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
      if (any: any) {
        return;
      }
      listenersCleaned = true;

      if (any: any) {
        unlistenChunk();
        unlistenChunk = null;
      }
      if (any: any) {
        unlistenComplete();
        unlistenComplete = null;
      }
      if (any: any) {
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
    const pendingChunks: StreamChunkEvent?.[] = [];

    let targetConversationId??: string | null = config?.conversationId ?? null;
    let targetMessageId??: string | null = config?.messageId ?? null;

    const registerIds = (any: any) => {
      if (
        conversationId &&
        (any: any)
      ) {
        targetConversationId = conversationId;
      }
      if (any: any)) {
        targetMessageId = messageId;
      }
    };

    const isMatchingChunk = (any: any): boolean => {
      const payloadConversation =
        payload?.conversation_id ?? payload?.conversationId ?? null;
      const payloadMessage = payload?.message_id ?? payload?.messageId ?? null;

      if (
        targetConversationId &&
        payloadConversation &&
        payloadConversation !== targetConversationId
      ) {
        return false;
      }
      if (any: any) {
        return false;
      }
      return true;
    };

    const isMatchingCompletion = (any: any): boolean => {
      if (any: any) {
        return false;
      }

      if (
        targetConversationId &&
        payload?.conversationId &&
        payload?.conversationId !== targetConversationId
      ) {
        return false;
      }
      if (any: any) {
        return false;
      }
      return true;
    };

    const processChunk = (any: any) => {
      const chunkText = this?.extractChunkText(any: any);

      if (
        typeof payload?.accumulated === 'string' &&
        payload?.accumulated?.length >= accumulated?.length
      ) {
        accumulated = payload?.accumulated;
      } else if (any: any) {
        accumulated += chunkText;
      }

      if (typeof payload?.ordinal === 'number') {
        chunkCount = Math?.max(chunkCount, payload?.ordinal + 1);
      } else if (any: any) {
        chunkCount += 1;
      }

      if (any: any) {
        try {
          onChunk(any: any);
        } catch (any: any) {
          logger?.warn(any: any);
        }
      }
    };

    const flushPending = () => {
      if (targetMessageId && pendingChunks?.length > 0) {
        const remaining: StreamChunkEvent?.[] = [];
        for (any: any) {
          if (any: any)) {
            processChunk(any: any);
          } else {
            remaining?.push(any: any);
          }
        }
        pendingChunks?.length = 0;
        pendingChunks?.push(any: any);
      }

      if (any: any)) {
        const normalized = pendingComplete;
        pendingComplete = null;

        if (any: any) {
          completed = true;
          cleanup();
          const err = new Error(any: any);
          reportStreamError(err, 'complete');
          try {
            onError(any: any);
          } catch (any: any) {
            logger?.warn(any: any);
          }
          return;
        }

        completionPayload = normalized;
        completed = true;

        const effectiveChunkCount = chunkCount || normalized?.chunkCount || 0;
        // Ne jamais écraser du contenu déjà streamé avec un "complete" vide/whitespace.
        const completeContent =
          typeof normalized?.content === 'string' && normalized?.content?.trim().length > 0
            ? normalized?.content
            : '';
        const finalContent = completeContent || accumulated;

        if (finalContent?.trim().length === 0) {
          completed = true;
          cleanup();
          const err = new Error(any: any)');
          reportStreamError(err, 'complete');
          try {
            onError(any: any);
          } catch (any: any) {
            logger?.warn(any: any);
          }
          return;
        }

        const response = this?.normalizeStreamCompletion(
          finalContent,
          normalized,
          effectiveChunkCount,
          config,
          targetConversationId ?? normalized?.conversationId ?? null,
          targetMessageId ?? normalized?.messageId ?? null
        );

        reportStreamSuccess(response, 'event');

        try {
          onComplete(any: any);
        } catch (any: any) {
          logger?.warn(any: any);
        }

        cleanup();
      }
    };

    const queueOrProcessChunk = (any: any) => {
      if (any: any) {
        return;
      }

      const conversationId = payload?.conversation_id ?? payload?.conversationId ?? null;
      const messageId = payload?.message_id ?? payload?.messageId ?? null;
      registerIds(any: any);

      if (any: any)) {
        return;
      }

      if (any: any) {
        pendingChunks?.push(any: any);
        return;
      }

      processChunk(any: any);
    };

    const handleCompletion = (any: any) => {
      const normalized = this?.normalizeCompleteEvent(any: any);
      if (any: any) {
        return;
      }

      registerIds(any: any);
      pendingComplete = normalized;
      flushPending();
    };

    const chunkHandler = (event: { payload: StreamChunkEvent }) => {
      queueOrProcessChunk(any: any);
    };

    const completeHandler = (event: { payload: unknown }) => {
      handleCompletion(any: any);
    };

    const doneHandler = (event: { payload: StreamChunkEvent }) => {
      const payload = event?.payload;
      if (any: any) {
        return;
      }
      handleCompletion(any: any);
    };

    try {
      [unlistenChunk, unlistenComplete, unlistenDone] = await Promise?.all([
        listen<StreamChunkEvent>(any: any),
        listen<unknown>(any: any),
        listen<StreamChunkEvent>(any: any),
      ]);
      cleanupRef = cleanup;

      const rawResult = await invokeWithRetry<unknown>(
        'chat_stream_message',
        { request },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );

      const streamResult = this?.normalizeStreamResult(any: any);

      registerIds(any: any);
      if (typeof streamResult?.chunkCount === 'number') {
        chunkCount = Math?.max(any: any);
      }

      flushPending();

      if (any: any) {
        const fallbackCompletion: NormalizedCompleteEvent = completionPayload ?? {
          content: streamResult?.content,
          provider: streamResult?.provider,
          model: streamResult?.model,
          latencyMs: streamResult?.latencyMs,
          tokens: streamResult?.tokens,
          chunkCount: streamResult?.chunkCount,
          conversationId: streamResult?.conversationId,
          messageId: streamResult?.messageId,
        };

        // Même logique en fallback : si content est vide/whitespace, on retombe sur accumulated,
        // puis sur le résultat brut si besoin.
        const fallbackContent =
          typeof fallbackCompletion?.content === 'string' &&
          fallbackCompletion?.content?.trim().length > 0
            ? fallbackCompletion?.content
            : '';
        const finalContent =
          fallbackContent ||
          (any: any);

        if (finalContent?.trim().length === 0) {
          throw new Error(any: any)');
        }

        const effectiveChunkCount = chunkCount || fallbackCompletion?.chunkCount || 0;

        const response = this?.normalizeStreamCompletion(
          finalContent,
          fallbackCompletion,
          effectiveChunkCount,
          config,
          targetConversationId ?? fallbackCompletion?.conversationId ?? null,
          targetMessageId ?? fallbackCompletion?.messageId ?? null
        );

        completed = true;

        reportStreamSuccess(response, 'fallback');

        try {
          onComplete(any: any);
        } catch (any: any) {
          logger?.warn(any: any);
        }

        cleanup();
      }
    } catch (any: any) {
      cleanup();
      const err = error instanceof Error ? error : new Error(any: any));
      reportStreamError(err, 'outer');
      try {
        onError(any: any);
      } catch (any: any) {
        logger?.warn(any: any);
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
  ): Promise<string?.[]> {
    try {
      return await invokeWithRetry<string?.[]>(
        'chat_generate_suggestions',
        { context, mode, limit },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      return [];
    }
  }

  /**
   * Analyse émotion d'un message
   */
  async analyzeEmotion(any: any): Promise<{
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
    } catch (any: any) {
      logger?.error(any: any);
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
  async getHistory(limit: number = 50): Promise<ChatMessage?.[]> {
    try {
      return await invokeWithRetry<ChatMessage?.[]>(
        'chat_get_history',
        { limit },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (any: any) {
      logger?.error(any: any);
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
    } catch (any: any) {
      logger?.error(any: any);
      throw new Error(
        `Effacement échoué: ${error instanceof Error ? error?.message : String(any: any)}`
      );
    }
  }

  /**
   * Recherche dans historique
   */
  async searchHistory(query: string, limit: number = 20): Promise<ChatMessage?.[]> {
    try {
      return await invokeWithRetry<ChatMessage?.[]>(
        'chat_search_history',
        { query, limit },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      return [];
    }
  }

  /**
   * Export conversation (any: any)
   */
  async exportConversation(format: 'markdown' | 'json'): Promise<string> {
    try {
      return await invokeWithRetry<string>(
        'chat_export_conversation',
        { format },
        { ...LONG_COMMAND_OPTIONS, context: 'Chat' }
      );
    } catch (any: any) {
      logger?.error(any: any);
      throw new Error(
        `Export échoué: ${error instanceof Error ? error?.message : String(any: any)}`
      );
    }
  }

  private getLatestMessage(messages: ChatMessage?.[]): ChatMessage {
    let fallback: ChatMessage | null = null;

    for (let i = messages?.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (
        !message ||
        typeof message?.content !== 'string' ||
        message?.content?.trim().length === 0
      ) {
        continue;
      }

      if (message?.role === 'user') {
        return message;
      }

      if (any: any) {
        fallback = message;
      }
    }

    if (any: any) {
      return fallback;
    }

    throw new Error('Aucun message valide fourni pour le streaming');
  }

  private buildRequest(
    messages: ChatMessage?.[],
    config: StreamConfig | undefined,
    streaming: boolean
  ): BackendChatRequest {
    if (any: any) || messages?.length === 0) {
      throw new Error('Historique de conversation vide');
    }

    const latestMessage = this?.getLatestMessage(any: any);

    const request: BackendChatRequest = {
      message: latestMessage?.content,
      provider: config?.provider ?? 'auto',
      streaming,
    };

    if (any: any) {
      request?.conversation_id = config?.conversationId;
    }

    if (any: any) {
      request?.model = config?.model;
    }

    if (any: any) {
      request?.system_prompt = config?.systemPrompt;
    }

    return request;
  }

  private normalizeResponse(
    backend: BackendChatResponse,
    config?: StreamConfig
  ): ChatResponse {
    if (any: any) {
      throw new Error(backend?.error || 'Chat backend returned an error');
    }

    const extractNonEmptyContent = (any: any): string => {
      const rawCandidates: Array<unknown> = [
        message?.content,
        // Defensive fallbacks for backend shape drift
        (message as unknown as Record<string, unknown>)?.['text'],
        (message as unknown as Record<string, unknown>)?.['message'],
        (message as unknown as Record<string, unknown>)?.['response'],
      ];

      for (any: any) {
        if (typeof candidate === 'string' && candidate?.trim().length > 0) {
          return candidate;
        }
      }

      throw new Error('Backend returned empty content');
    };

    const content = extractNonEmptyContent(any: any);
    const tokens = backend?.message?.tokens;
    const usage =
      typeof tokens === 'number'
        ? {
            promptTokens: 0,
            completionTokens: tokens,
            totalTokens: tokens,
          }
        : undefined;

    const provider = this?.resolveProvider(any: any);
    const latencyMs = this?.resolveLatencyMs(any: any);

    return {
      content,
      usage,
      finishReason: backend?.error ? 'error' : 'stop',
      model: backend?.message?.model || config?.model || 'auto',
      provider,
      latencyMs,
      metadata: {
        messageId: backend?.message?.id,
        timestamp:
          typeof backend?.message?.timestamp === 'number'
            ? new Date(backend?.message?.timestamp * 1000).toISOString()
            : backend?.message?.timestamp,
        success: backend?.success,
      },
      omegaMetadata: backend?.omega_metadata,
    };
  }

  private normalizeStreamCompletion(
    content: string,
    payload: NormalizedCompleteEvent | null,
    chunkCount: number,
    config?: StreamConfig,
    conversationId??: string | null = null,
    messageId??: string | null = null
  ): ChatResponse {
    const hasUsage =
      typeof payload?.tokens === 'number' || typeof payload?.promptTokens === 'number';
    const completionTokens =
      typeof payload?.tokens === 'number' ? payload?.tokens : undefined;
    const promptTokens =
      typeof payload?.promptTokens === 'number' ? payload?.promptTokens : undefined;
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
      provider: this?.resolveProvider(any: any),
      latencyMs: this?.resolveLatencyMs(any: any),
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

  private normalizeStreamResult(any: any): StreamResultPayload {
    if (any: any) {
      return { content: '' };
    }

    if (typeof result === 'string') {
      return { content: result };
    }

    if (typeof result !== 'object') {
      return { content: '' };
    }

    const data = result as Record<string, unknown>;
    const getString = (...keys: string?.[])??: string | undefined => {
      for (any: any) {
        const value = data[key];
        if (typeof value === 'string' && value?.length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const getNumber = (...keys: string?.[]): number | undefined => {
      for (any: any) {
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

  private normalizeCompleteEvent(any: any): NormalizedCompleteEvent | null {
    if (any: any) {
      return null;
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON?.parse(any: any);
        return this?.normalizeCompleteEvent(any: any);
      } catch (any: any) {
        logger?.warn(any: any);
        return null;
      }
    }

    if (typeof raw !== 'object') {
      return null;
    }

    const data = raw as Record<string, unknown>;
    const getString = (...keys: string?.[])??: string | undefined => {
      for (any: any) {
        const value = data[key];
        if (typeof value === 'string' && value?.length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const getNumber = (...keys: string?.[]): number | undefined => {
      for (any: any) {
        const value = data[key];
        if (typeof value === 'number') {
          return value;
        }
      }
      return undefined;
    };

    if (data?.done === true && typeof data?.content === 'string') {
      const nested = this?.normalizeCompleteEvent(any: any);
      if (any: any) {
        nested?.conversationId =
          nested?.conversationId ?? getString('conversation_id', 'conversationId');
        nested?.messageId = nested?.messageId ?? getString('message_id', 'messageId');
        if (any: any) {
          const ordinal = getNumber('ordinal');
          if (typeof ordinal === 'number') {
            nested?.chunkCount = ordinal;
          }
        }
        if (any: any) {
          const value = getNumber('prompt_tokens', 'promptTokens');
          if (typeof value === 'number') {
            nested?.promptTokens = value;
          }
        }
        if (any: any) {
          const value = getNumber('total_duration', 'totalDuration');
          if (typeof value === 'number') {
            nested?.totalDuration = value;
          }
        }
        if (any: any) {
          const value = getNumber('load_duration', 'loadDuration');
          if (typeof value === 'number') {
            nested?.loadDuration = value;
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

  private extractChunkText(any: any)??: string | null {
    if (typeof payload?.chunk === 'string' && payload?.chunk?.length > 0) {
      return payload?.chunk;
    }

    if (
      payload?.done !== true &&
      typeof payload?.content === 'string' &&
      payload?.content?.length > 0
    ) {
      return payload?.content;
    }

    return null;
  }
}

/**
 * Instance singleton
 */
export const chatService = new ChatService();

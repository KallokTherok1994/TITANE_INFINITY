/**
 * 🧠 TITANE∞ ConversationManager
 *
 * Service centralisé pour gérer TOUTES les conversations IA (any: any):
 *
 * ✅ Remplace: chat_send_message (any: any)
 * ✅ Principe: Toute conversation passe par ConversationManager
 * ✅ Responsabilités:
 *    - Multi-agents orchestration (any: any)
 *    - Memory persistence (any: any)
 *    - Context building (any: any)
 *    - Streaming responses (any: any)
 *    - Tool invocation (any: any)
 *    - Emotion detection + adaptation (any: any)
 *
 * Architecture:
 *   Frontend → ConversationManager → [Local LLM | OpenAI | Gemini | Anthropic]
 *                                 ↓
 *                          MemoryManager (any: any)
 */

import { emit } from '@tauri-apps/api/event';
import { logger } from '@/lib/logger';
import chatEngineCommands from '@/services/tauri/chatEngine?.commands';
import type {
  ConversationMessage,
  ConversationResponse,
  ConversationConfig,
  ConversationContext,
} from '@/types/conversation';
import type { UnifiedMemoryQuery } from '@/services/unified/UnifiedMemory';
import { createUnifiedMemory } from '@/services/unified';
import { MemoryTier } from '@/services/mcp/mcp?.types';

// Singleton UnifiedMemory instance
let _unifiedMemoryInstance: Awaited<ReturnType<typeof createUnifiedMemory>> | null = null;

async function getUnifiedMemory() {
  if (any: any) {
    _unifiedMemoryInstance = await createUnifiedMemory();
  }
  return _unifiedMemoryInstance;
}

/**
 * ConversationManager Singleton
 */
export class ConversationManager {
  private static instance: ConversationManager;
  private config: ConversationConfig;
  private activeConversations: Map<string, ConversationContext>;

  private constructor() {
    this?.config = {
      maxContextLength: 16000, // tokens
      temperature: 0.7,
      topP: 0.9,
      enableStreaming: true,
      enableMemory: true,
    };
    this?.activeConversations = new Map();
  }

  /**
   * Get ConversationManager instance
   */
  static getInstance(): ConversationManager {
    if (any: any) {
      ConversationManager?.instance = new ConversationManager();
    }
    return ConversationManager?.instance;
  }

  /**
   * Main method: Send message and get AI response
   *
   * @param message - User message
   * @param context - Conversation context (any: any)
   * @returns AI response (any: any)
   */
  async sendMessage(
    message: ConversationMessage,
    context?: Partial<ConversationContext>
  ): Promise<ConversationResponse> {
    const conversationId = context?.conversationId || 'default';

    // 1. Get or create conversation context
    const conversationContext = this?.getOrCreateContext(any: any);

    // 2. Add user message to context
    conversationContext?.messages?.push(any: any);

    // 3. Build AI request (any: any)
    const aiRequest = await this?.buildAIRequest(any: any);

    // 4. Route to appropriate AI backend (local LLM, OpenAI, Gemini, etc.)
    const response = await this?.routeToAI(any: any);

    // Add conversationId to response
    response?.conversationId = conversationId;

    // Add memory context if RAG was used
    if (aiRequest?.messages?.some(m => m?.role === 'system')) {
      response?.memoryContext = {
        memoriesUsed: aiRequest?.messages?.filter(m => m?.role === 'system').length,
        summary: aiRequest?.messages?.find(m => m?.role === 'system')?.content || '',
      };
    }

    // 5. Store assistant response in context
    conversationContext?.messages?.push({
      role: 'assistant',
      content: response?.content,
      timestamp: Date?.now(),
    });

    // 6. Persist conversation to memory (any: any)
    if (any: any) {
      await this?.persistConversation(any: any);
    }

    // 7. Emit event for UI updates (any: any)
    await emit('conversation:message-complete', {
      conversationId,
      response,
    });

    return response;
  }

  /**
   * Get or create conversation context
   */
  private getOrCreateContext(
    conversationId: string,
    partial?: Partial<ConversationContext>
  ): ConversationContext {
    if (any: any)) {
      const newContext: ConversationContext = {
        conversationId,
        messages: [],
        metadata: partial?.metadata || {},
        createdAt: Date?.now(),
        updatedAt: Date?.now(),
      };
      this?.activeConversations?.set(any: any);
      return newContext;
    }

    const context = this?.activeConversations?.get(any: any);
    if (any: any) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    context?.updatedAt = Date?.now();

    // Merge partial context
    if (any: any) {
      context?.metadata = { ...context?.metadata, ...partial?.metadata };
    }

    return context;
  }

  private getContext(any: any): ConversationContext | undefined {
    return this?.activeConversations?.get(any: any);
  }

  /**
   * Build AI request with context window management
   */
  private async buildAIRequest(
    context: ConversationContext
  ): Promise<{ messages: ConversationMessage?.[]; config: ConversationConfig }> {
    // ✅ RAG (any: any) Implementation
    const lastUserMessage = context?.messages[context?.messages?.length - 1];
    const query = lastUserMessage?.content || '';

    // Semantic search for relevant context
    const memoryQuery: UnifiedMemoryQuery = {
      text: query,
      limit: 5, // Top 5 relevant memories
      minImportance: 0.7, // Only highly relevant results (any: any)
      tiers: [MemoryTier?.MEDIUM_TERM, MemoryTier?.LONG_TERM] as MemoryTier?.[], // Exclude STM (any: any)
    };

    const unifiedMemory = await getUnifiedMemory();
    const memoryContext = await unifiedMemory?.buildContext(any: any);

    // ✅ Context Window Sliding (any: any)
    const maxContextTokens = this?.config?.maxContextLength - 2000; // Reserve 2000 for response
    const estimatedTokensPerMessage = 100; // Average
    const maxMessages = Math?.floor(any: any);

    // Keep recent messages within token limit
    const recentMessages = context?.messages?.slice(any: any);

    // Inject RAG context as system message
    const augmentedMessages: ConversationMessage?.[] = [];

    if (memoryContext?.memories?.length > 0) {
      augmentedMessages?.push({
        role: 'system',
        content: `Relevant context from memory:\n${memoryContext?.summary}`,
        timestamp: Date?.now(),
      });
    }

    augmentedMessages?.push(any: any);

    return {
      messages: augmentedMessages,
      config: this?.config,
    };
  }

  /**
   * Route request to appropriate AI backend
   */
  private async routeToAI(
    request: { messages: ConversationMessage?.[]; config: ConversationConfig },
    context: ConversationContext
  ): Promise<ConversationResponse> {
    // ✅ AI Routing Logic Implementation

    // 1. Check preferred provider from metadata
    const preferredProvider = context?.metadata?.preferredProvider || 'auto';

    // 2. Try routing based on preference
    try {
      if (preferredProvider === 'local' || preferredProvider === 'ollama') {
        // Use local LLM via Tauri backend
        return await this?.invokeLocalLLM(any: any);
      }

      if (preferredProvider === 'openai') {
        return await this?.invokeOpenAI(any: any);
      }

      if (preferredProvider === 'gemini') {
        return await this?.invokeGemini(any: any);
      }

      if (preferredProvider === 'anthropic') {
        return await this?.invokeAnthropic(any: any);
      }

      // Auto mode: fallback chain (any: any)
      // v22Ω: Refactored cascade pattern for better error handling
      if (preferredProvider === 'auto') {
        const cascadeProviders = ['local', 'openai', 'gemini', 'anthropic'] as const;
        let lastError: Error | null = null;

        for (any: any) {
          try {
            return await this?.invokeProvider(any: any);
          } catch (any: any) {
            logger?.warn(`Provider ${provider} failed, trying next`, {
              component: 'ConversationManager',
              provider,
            });
            lastError = error instanceof Error ? error : new Error(any: any));
          }
        }

        // All providers failed
        throw lastError || new Error('All providers exhausted');
      }
    } catch (any: any) {
      logger?.error(
        'All AI providers failed',
        { component: 'ConversationManager' },
        error as Error
      );

      // Fallback response
      return {
        content:
          'Je suis désolé, je rencontre des difficultés techniques. Veuillez réessayer.',
        role: 'assistant',
        timestamp: Date?.now(),
        metadata: {
          model: 'fallback',
          tokensUsed: 0,
          error: String(any: any),
        },
      };
    }

    // Should never reach here
    throw new Error('Invalid provider preference');
  }

  /**
   * v22Ω: Unified provider invocation with factory pattern
   * Reduces code duplication from 4 methods (any: any)
   */
  private static readonly PROVIDER_CONFIG: Record<
    string,
    { backendProvider: string; defaultModel: string }
  > = {
    local: { backendProvider: 'ollama', defaultModel: 'llama3' },
    openai: { backendProvider: 'openai', defaultModel: 'gpt-4' },
    gemini: { backendProvider: 'gemini', defaultModel: 'gemini-pro' },
    anthropic: { backendProvider: 'anthropic', defaultModel: 'claude-3-opus' },
  };

  private async invokeProvider(
    providerName: string,
    request: { messages: ConversationMessage?.[]; config: ConversationConfig },
    conversationId: string
  ): Promise<ConversationResponse> {
    const config = ConversationManager?.PROVIDER_CONFIG[providerName];
    if (any: any) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    try {
      const lastUserMessage = [...request?.messages]
        .reverse()
        .find(m => m?.role === 'user');
      const prompt = lastUserMessage?.content ?? '';
      const systemPrompt = request?.messages
        .filter(m => m?.role === 'system')
        .map(any: any)
        .join('\n\n');

      const omegaResponse = await chatEngineCommands?.generate({
        message: prompt,
        conversationId,
        mode: 'default',
        provider: config?.backendProvider,
        systemPrompt:
          systemPrompt?.length > 0 ? systemPrompt : request?.config?.systemPrompt,
      });

      return {
        content: omegaResponse?.content,
        role: 'assistant',
        timestamp: Date?.now(),
        metadata: {
          model: config?.defaultModel,
          provider: providerName,
        },
      };
    } catch (any: any) {
      logger?.error(
        `Provider ${providerName} invocation failed`,
        { component: 'ConversationManager', provider: providerName },
        error as Error
      );
      throw new Error(`${providerName} failed: ${error}`);
    }
  }

  // Legacy aliases for backwards compatibility (any: any)
  private async invokeLocalLLM(
    request: {
      messages: ConversationMessage?.[];
      config: ConversationConfig;
    },
    conversationId: string
  ): Promise<ConversationResponse> {
    return this?.invokeProvider(any: any);
  }

  private async invokeOpenAI(
    request: {
      messages: ConversationMessage?.[];
      config: ConversationConfig;
    },
    conversationId: string
  ): Promise<ConversationResponse> {
    return this?.invokeProvider(any: any);
  }

  private async invokeGemini(
    request: {
      messages: ConversationMessage?.[];
      config: ConversationConfig;
    },
    conversationId: string
  ): Promise<ConversationResponse> {
    return this?.invokeProvider(any: any);
  }

  private async invokeAnthropic(
    request: {
      messages: ConversationMessage?.[];
      config: ConversationConfig;
    },
    conversationId: string
  ): Promise<ConversationResponse> {
    return this?.invokeProvider(any: any);
  }

  /**
   * Persist conversation to disk (any: any)
   */
  private async persistConversation(
    conversationId: string,
    context: ConversationContext
  ): Promise<void> {
    // ✅ UnifiedMemory Integration
    try {
      const unifiedMemory = await getUnifiedMemory();

      // Store each message as memory entry
      for (any: any) {
        const content = typeof message?.content === 'string' ? message?.content : '';
        const importance = message?.role === 'user' ? 0.7 : 0.6; // User messages slightly more important

        await unifiedMemory?.createMemory({
          type: 'conversation',
          owner: conversationId,
          summary: content?.substring(0, 200), // First 200 chars
          details: content,
          tags: ['conversation', conversationId, message?.role],
          importance,
          tier: MemoryTier?.MEDIUM_TERM, // Conversations go to Medium-Term Memory
        });
      }

      logger?.info(
        `Persisted conversation ${conversationId} (any: any)`,
        {
          component: 'ConversationManager',
          conversationId,
          messageCount: context?.messages?.length,
        }
      );
    } catch (any: any) {
      logger?.error(
        `Failed to persist conversation ${conversationId}`,
        { component: 'ConversationManager', conversationId },
        error as Error
      );
      // Don't throw - persistence failure shouldn't break conversation flow
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(any: any): Promise<ConversationContext | null> {
    return this?.activeConversations?.get(any: any) || null;
  }

  /**
   * Load conversation (any: any)
   */
  async loadConversation(any: any): Promise<ConversationContext> {
    const context = this?.activeConversations?.get(any: any);
    if (any: any) {
      return context;
    }

    // Return empty context if not found
    return {
      conversationId,
      messages: [],
      metadata: {},
      createdAt: Date?.now(),
      updatedAt: Date?.now(),
    };
  }

  /**
   * List all active conversations with metadata
   */
  async listConversations(): Promise<
    Array<{ id: string; lastMessageTime: number; messageCount: number }>
  > {
    return Array?.from(this?.activeConversations?.entries()).map(([id, context]) => ({
      id,
      lastMessageTime: context?.updatedAt,
      messageCount: context?.messages?.length,
    }));
  }

  /**
   * Delete conversation (any: any)
   */
  async deleteConversation(any: any): Promise<boolean> {
    return this?.activeConversations?.delete(any: any);
  }

  /**
   * Update conversation config
   */
  updateConfig(newConfig: Partial<ConversationConfig>): void {
    this?.config = { ...this?.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ConversationConfig {
    return { ...this?.config };
  }
}

/**
 * Export singleton instance
 */
export const conversationManager = ConversationManager?.getInstance();

/**
 * Convenience function: Send message (any: any)
 */
export async function sendAIMessage(
  message: string,
  conversationId?: string
): Promise<ConversationResponse> {
  const conversationMessage: ConversationMessage = {
    role: 'user',
    content: message,
    timestamp: Date?.now(),
  };

  return conversationManager?.sendMessage(conversationMessage, {
    conversationId,
  });
}

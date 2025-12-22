/**
 * 🧠 TITANE∞ ConversationManager
 *
 * Service centralisé pour gérer TOUTES les conversations IA (OMEGA v2 spec):
 *
 * ✅ Remplace: chat_send_message (Tauri command legacy)
 * ✅ Principe: Toute conversation passe par ConversationManager
 * ✅ Responsabilités:
 *    - Multi-agents orchestration (IA locale, APIs externes)
 *    - Memory persistence (conversations history)
 *    - Context building (RAG, embeddings, semantic search)
 *    - Streaming responses (real-time token generation)
 *    - Tool invocation (function calling)
 *    - Emotion detection + adaptation (presenceOS integration)
 *
 * Architecture:
 *   Frontend → ConversationManager → [Local LLM | OpenAI | Gemini | Anthropic]
 *                                 ↓
 *                          MemoryManager (persistence)
 */

import { secureInvoke } from '@/lib/security';
import { emit } from '@tauri-apps/api/event';
import { logger } from '@/lib/logger';
import chatEngineCommands from '@/services/tauri/chatEngine.commands';
import type {
  ConversationMessage,
  ConversationResponse,
  ConversationConfig,
  ConversationContext,
} from '@/types/conversation';
import type { UnifiedMemoryQuery } from '@/services/unified/UnifiedMemory';
import { createUnifiedMemory } from '@/services/unified';
import { MemoryTier } from '@/services/mcp/mcp.types';

// Singleton UnifiedMemory instance
let _unifiedMemoryInstance: Awaited<ReturnType<typeof createUnifiedMemory>> | null = null;

async function getUnifiedMemory() {
  if (!_unifiedMemoryInstance) {
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
    this.config = {
      maxContextLength: 16000, // tokens
      temperature: 0.7,
      topP: 0.9,
      enableStreaming: true,
      enableMemory: true,
    };
    this.activeConversations = new Map();
  }

  /**
   * Get ConversationManager instance
   */
  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  /**
   * Main method: Send message and get AI response
   *
   * @param message - User message
   * @param context - Conversation context (history, metadata)
   * @returns AI response (streamed or complete)
   */
  async sendMessage(
    message: ConversationMessage,
    context?: Partial<ConversationContext>
  ): Promise<ConversationResponse> {
    const conversationId = context?.conversationId || 'default';

    // 1. Get or create conversation context
    const conversationContext = this.getOrCreateContext(conversationId, context);

    // 2. Add user message to context
    conversationContext.messages.push(message);

    // 3. Build AI request (context window, RAG, embeddings)
    const aiRequest = await this.buildAIRequest(conversationContext);

    // 4. Route to appropriate AI backend (local LLM, OpenAI, Gemini, etc.)
    const response = await this.routeToAI(aiRequest, conversationContext);

    // Add conversationId to response
    response.conversationId = conversationId;

    // Add memory context if RAG was used
    if (aiRequest.messages.some(m => m.role === 'system')) {
      response.memoryContext = {
        memoriesUsed: aiRequest.messages.filter(m => m.role === 'system').length,
        summary: aiRequest.messages.find(m => m.role === 'system')?.content || '',
      };
    }

    // 5. Store assistant response in context
    conversationContext.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    });

    // 6. Persist conversation to memory (if enabled)
    if (this.config.enableMemory) {
      await this.persistConversation(conversationId, conversationContext);
    }

    // 7. Emit event for UI updates (streaming complete)
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
    if (!this.activeConversations.has(conversationId)) {
      const newContext: ConversationContext = {
        conversationId,
        messages: [],
        metadata: partial?.metadata || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this.activeConversations.set(conversationId, newContext);
      return newContext;
    }

    const context = this.activeConversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    context.updatedAt = Date.now();

    // Merge partial context
    if (partial?.metadata) {
      context.metadata = { ...context.metadata, ...partial.metadata };
    }

    return context;
  }

  private getContext(conversationId: string): ConversationContext | undefined {
    return this.activeConversations.get(conversationId);
  }

  /**
   * Build AI request with context window management
   */
  private async buildAIRequest(
    context: ConversationContext
  ): Promise<{ messages: ConversationMessage[]; config: ConversationConfig }> {
    // ✅ RAG (Retrieval-Augmented Generation) Implementation
    const lastUserMessage = context.messages[context.messages.length - 1];
    const query = lastUserMessage?.content || '';

    // Semantic search for relevant context
    const memoryQuery: UnifiedMemoryQuery = {
      text: query,
      limit: 5, // Top 5 relevant memories
      minImportance: 0.7, // Only highly relevant results (renamed from minScore)
      tiers: [MemoryTier.MEDIUM_TERM, MemoryTier.LONG_TERM] as MemoryTier[], // Exclude STM (already in context)
    };

    const unifiedMemory = await getUnifiedMemory();
    const memoryContext = await unifiedMemory.buildContext(query, memoryQuery);

    // ✅ Context Window Sliding (max tokens management)
    const maxContextTokens = this.config.maxContextLength - 2000; // Reserve 2000 for response
    const estimatedTokensPerMessage = 100; // Average
    const maxMessages = Math.floor(maxContextTokens / estimatedTokensPerMessage);

    // Keep recent messages within token limit
    const recentMessages = context.messages.slice(-maxMessages);

    // Inject RAG context as system message
    const augmentedMessages: ConversationMessage[] = [];

    if (memoryContext.memories.length > 0) {
      augmentedMessages.push({
        role: 'system',
        content: `Relevant context from memory:\n${memoryContext.summary}`,
        timestamp: Date.now(),
      });
    }

    augmentedMessages.push(...recentMessages);

    return {
      messages: augmentedMessages,
      config: this.config,
    };
  }

  /**
   * Route request to appropriate AI backend
   */
  private async routeToAI(
    request: { messages: ConversationMessage[]; config: ConversationConfig },
    context: ConversationContext
  ): Promise<ConversationResponse> {
    // ✅ AI Routing Logic Implementation

    // 1. Check preferred provider from metadata
    const preferredProvider = context.metadata?.preferredProvider || 'auto';

    // 2. Try routing based on preference
    try {
      if (preferredProvider === 'local' || preferredProvider === 'ollama') {
        // Use local LLM via Tauri backend
        return await this.invokeLocalLLM(request, context.conversationId);
      }

      if (preferredProvider === 'openai') {
        return await this.invokeOpenAI(request, context.conversationId);
      }

      if (preferredProvider === 'gemini') {
        return await this.invokeGemini(request, context.conversationId);
      }

      if (preferredProvider === 'anthropic') {
        return await this.invokeAnthropic(request, context.conversationId);
      }

      // Auto mode: fallback chain (local → OpenAI → Gemini → Anthropic)
      // v22Ω: Refactored cascade pattern for better error handling
      if (preferredProvider === 'auto') {
        const cascadeProviders = ['local', 'openai', 'gemini', 'anthropic'] as const;
        let lastError: Error | null = null;

        for (const provider of cascadeProviders) {
          try {
            return await this.invokeProvider(provider, request, context.conversationId);
          } catch (error) {
            logger.warn(`Provider ${provider} failed, trying next`, {
              component: 'ConversationManager',
              provider,
            });
            lastError = error instanceof Error ? error : new Error(String(error));
          }
        }

        // All providers failed
        throw lastError || new Error('All providers exhausted');
      }
    } catch (error) {
      logger.error(
        'All AI providers failed',
        { component: 'ConversationManager' },
        error as Error
      );

      // Fallback response
      return {
        content:
          'Je suis désolé, je rencontre des difficultés techniques. Veuillez réessayer.',
        role: 'assistant',
        timestamp: Date.now(),
        metadata: {
          model: 'fallback',
          tokensUsed: 0,
          error: String(error),
        },
      };
    }

    // Should never reach here
    throw new Error('Invalid provider preference');
  }

  /**
   * v22Ω: Unified provider invocation with factory pattern
   * Reduces code duplication from 4 methods (~130 lines) to 1 method (~30 lines)
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
    request: { messages: ConversationMessage[]; config: ConversationConfig },
    conversationId: string
  ): Promise<ConversationResponse> {
    const config = ConversationManager.PROVIDER_CONFIG[providerName];
    if (!config) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    try {
      const lastUserMessage = [...request.messages].reverse().find(m => m.role === 'user');
      const prompt = lastUserMessage?.content ?? '';
      const systemPrompt = request.messages
        .filter(m => m.role === 'system')
        .map(m => m.content)
        .join('\n\n');

      try {
        const omegaResponse = await chatEngineCommands.generate({
          message: prompt,
          conversationId,
          mode: 'default',
          provider: config.backendProvider,
          systemPrompt: systemPrompt.length > 0 ? systemPrompt : request.config.systemPrompt,
        });

        return {
          content: omegaResponse.content,
          role: 'assistant',
          timestamp: Date.now(),
          metadata: {
            model: config.defaultModel,
            provider: providerName,
          },
        };
      } catch (omegaError) {
        logger.warn('OMEGA v2 call failed, falling back to legacy chat_send_message', {
          component: 'ConversationManager',
          provider: providerName,
        });

        const result = await secureInvoke<{
          content: string;
          model: string;
          tokens_used: number;
        }>('chat_send_message', {
          prompt,
          provider: config.backendProvider,
          streaming: request.config.enableStreaming || false,
        });

        return {
          content: result.content,
          role: 'assistant',
          timestamp: Date.now(),
          metadata: {
            model: result.model || config.defaultModel,
            tokensUsed: result.tokens_used || 0,
            provider: providerName,
          },
        };
      }
    } catch (error) {
      logger.error(
        `Provider ${providerName} invocation failed`,
        { component: 'ConversationManager', provider: providerName },
        error as Error
      );
      throw new Error(`${providerName} failed: ${error}`);
    }
  }

  // Legacy aliases for backwards compatibility (redirect to unified invokeProvider)
  private async invokeLocalLLM(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }, conversationId: string): Promise<ConversationResponse> {
    return this.invokeProvider('local', request, conversationId);
  }

  private async invokeOpenAI(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }, conversationId: string): Promise<ConversationResponse> {
    return this.invokeProvider('openai', request, conversationId);
  }

  private async invokeGemini(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }, conversationId: string): Promise<ConversationResponse> {
    return this.invokeProvider('gemini', request, conversationId);
  }

  private async invokeAnthropic(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }, conversationId: string): Promise<ConversationResponse> {
    return this.invokeProvider('anthropic', request, conversationId);
  }

  /**
   * Persist conversation to disk (MemoryManager integration)
   */
  private async persistConversation(
    conversationId: string,
    context: ConversationContext
  ): Promise<void> {
    // ✅ UnifiedMemory Integration
    try {
      const unifiedMemory = await getUnifiedMemory();

      // Store each message as memory entry
      for (const message of context.messages) {
        const content = typeof message.content === 'string' ? message.content : '';
        const importance = message.role === 'user' ? 0.7 : 0.6; // User messages slightly more important

        await unifiedMemory.createMemory({
          type: 'conversation',
          owner: conversationId,
          summary: content.substring(0, 200), // First 200 chars
          details: content,
          tags: ['conversation', conversationId, message.role],
          importance,
          tier: MemoryTier.MEDIUM_TERM, // Conversations go to Medium-Term Memory
        });
      }

      logger.info(
        `Persisted conversation ${conversationId} (${context.messages.length} messages to UnifiedMemory)`,
        {
          component: 'ConversationManager',
          conversationId,
          messageCount: context.messages.length,
        }
      );
    } catch (error) {
      logger.error(
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
  async getConversation(conversationId: string): Promise<ConversationContext | null> {
    return this.activeConversations.get(conversationId) || null;
  }

  /**
   * Load conversation (alias for getConversation with fallback)
   */
  async loadConversation(conversationId: string): Promise<ConversationContext> {
    const context = this.activeConversations.get(conversationId);
    if (context) {
      return context;
    }

    // Return empty context if not found
    return {
      conversationId,
      messages: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * List all active conversations with metadata
   */
  async listConversations(): Promise<
    Array<{ id: string; lastMessageTime: number; messageCount: number }>
  > {
    return Array.from(this.activeConversations.entries()).map(([id, context]) => ({
      id,
      lastMessageTime: context.updatedAt,
      messageCount: context.messages.length,
    }));
  }

  /**
   * Delete conversation (clears from active conversations)
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    return this.activeConversations.delete(conversationId);
  }

  /**
   * Update conversation config
   */
  updateConfig(newConfig: Partial<ConversationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ConversationConfig {
    return { ...this.config };
  }
}

/**
 * Export singleton instance
 */
export const conversationManager = ConversationManager.getInstance();

/**
 * Convenience function: Send message (OMEGA v2 standard)
 */
export async function sendAIMessage(
  message: string,
  conversationId?: string
): Promise<ConversationResponse> {
  const conversationMessage: ConversationMessage = {
    role: 'user',
    content: message,
    timestamp: Date.now(),
  };

  return conversationManager.sendMessage(conversationMessage, {
    conversationId,
  });
}

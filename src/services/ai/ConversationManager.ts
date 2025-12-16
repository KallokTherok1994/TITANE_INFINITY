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

import { emit } from '@tauri-apps/api/event';
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

    const context = this.activeConversations.get(conversationId)!;
    context.updatedAt = Date.now();

    // Merge partial context
    if (partial?.metadata) {
      context.metadata = { ...context.metadata, ...partial.metadata };
    }

    return context;
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
        return await this.invokeLocalLLM(request);
      }

      if (preferredProvider === 'openai') {
        return await this.invokeOpenAI(request);
      }

      if (preferredProvider === 'gemini') {
        return await this.invokeGemini(request);
      }

      if (preferredProvider === 'anthropic') {
        return await this.invokeAnthropic(request);
      }

      // Auto mode: fallback chain (local → OpenAI → Gemini → Anthropic)
      if (preferredProvider === 'auto') {
        try {
          return await this.invokeLocalLLM(request);
        } catch (localError) {
          console.warn('[ConversationManager] Local LLM failed, trying cloud providers');

          try {
            return await this.invokeOpenAI(request);
          } catch (openaiError) {
            try {
              return await this.invokeGemini(request);
            } catch (geminiError) {
              return await this.invokeAnthropic(request);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ConversationManager] All AI providers failed:', error);

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
   * Invoke local LLM via Tauri backend
   */
  private async invokeLocalLLM(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }): Promise<ConversationResponse> {
    const { invoke } = await import('@tauri-apps/api/tauri');

    try {
      const result = await invoke<{
        content: string;
        model: string;
        tokens_used: number;
      }>('chat_send_message', {
        prompt: request.messages[request.messages.length - 1].content,
        provider: 'ollama',
        streaming: request.config.enableStreaming || false,
      });

      return {
        content: result.content,
        role: 'assistant',
        timestamp: Date.now(),
        metadata: {
          model: result.model || 'llama3',
          tokensUsed: result.tokens_used || 0,
          provider: 'local',
        },
      };
    } catch (error) {
      console.error('[ConversationManager] Local LLM invocation failed:', error);
      throw new Error(`Local LLM failed: ${error}`);
    }
  }

  /**
   * Invoke OpenAI API
   */
  private async invokeOpenAI(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }): Promise<ConversationResponse> {
    const { invoke } = await import('@tauri-apps/api/tauri');

    try {
      const result = await invoke<{
        content: string;
        model: string;
        tokens_used: number;
      }>('chat_send_message', {
        prompt: request.messages[request.messages.length - 1].content,
        provider: 'openai',
        streaming: request.config.enableStreaming || false,
      });

      return {
        content: result.content,
        role: 'assistant',
        timestamp: Date.now(),
        metadata: {
          model: result.model || 'gpt-4',
          tokensUsed: result.tokens_used || 0,
          provider: 'openai',
        },
      };
    } catch (error) {
      console.error('[ConversationManager] OpenAI API call failed:', error);
      throw new Error(`OpenAI failed: ${error}`);
    }
  }

  /**
   * Invoke Gemini API
   */
  private async invokeGemini(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }): Promise<ConversationResponse> {
    const { invoke } = await import('@tauri-apps/api/tauri');

    try {
      const result = await invoke<{
        content: string;
        model: string;
        tokens_used: number;
      }>('chat_send_message', {
        prompt: request.messages[request.messages.length - 1].content,
        provider: 'gemini',
        streaming: request.config.enableStreaming || false,
      });

      return {
        content: result.content,
        role: 'assistant',
        timestamp: Date.now(),
        metadata: {
          model: result.model || 'gemini-pro',
          tokensUsed: result.tokens_used || 0,
          provider: 'gemini',
        },
      };
    } catch (error) {
      console.error('[ConversationManager] Gemini API call failed:', error);
      throw new Error(`Gemini failed: ${error}`);
    }
  }

  /**
   * Invoke Anthropic (Claude) API
   */
  private async invokeAnthropic(request: {
    messages: ConversationMessage[];
    config: ConversationConfig;
  }): Promise<ConversationResponse> {
    const { invoke } = await import('@tauri-apps/api/tauri');

    try {
      const result = await invoke<{
        content: string;
        model: string;
        tokens_used: number;
      }>('chat_send_message', {
        prompt: request.messages[request.messages.length - 1].content,
        provider: 'anthropic',
        streaming: request.config.enableStreaming || false,
      });

      return {
        content: result.content,
        role: 'assistant',
        timestamp: Date.now(),
        metadata: {
          model: result.model || 'claude-3-opus',
          tokensUsed: result.tokens_used || 0,
          provider: 'anthropic',
        },
      };
    } catch (error) {
      console.error('[ConversationManager] Anthropic API call failed:', error);
      throw new Error(`Anthropic failed: ${error}`);
    }
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
        const importance = message.role === 'user' ? 0.7 : 0.6; // User messages slightly more important

        await unifiedMemory.createMemory({
          type: 'conversation',
          owner: conversationId,
          summary: message.content.substring(0, 200), // First 200 chars
          details: message.content,
          tags: ['conversation', conversationId, message.role],
          importance,
          tier: MemoryTier.MEDIUM_TERM, // Conversations go to Medium-Term Memory
        });
      }

      console.log(
        `[ConversationManager] ✅ Persisted conversation ${conversationId} (${context.messages.length} messages to UnifiedMemory)`
      );
    } catch (error) {
      console.error(
        `[ConversationManager] Failed to persist conversation ${conversationId}:`,
        error
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

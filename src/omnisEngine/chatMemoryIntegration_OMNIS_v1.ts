/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * OMNIS MEMORY INTEGRATION v1.0
 * Phase 6 OMNIS: Memory Engine Integration with TITANE Chat
 *
 * Integration Points:
 * - Chat history persistence with auto-backup
 * - User preferences robustness
 * - Session state indestructible
 * - Cache intelligence with compression
 *
 * Architecture: Memory Engine → Chat Integration → UI Components
 */

import {
  omnisMemory,
  storeMemory,
  retrieveMemory,
  removeMemory,
  getMemoryStats,
  getMemoryHealth
} from './memoryEngine_OMNIS_v1_Clean.js';

// ═══════════════════════════════════════════════════════════════
// 🏗️ CHAT MEMORY INTERFACE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  provider?: string;
  metadata?: {
    tokenCount?: number;
    model?: string;
    temperature?: number;
    processingTime?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastUpdated: number;
  settings: {
    provider: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt?: string;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultProvider: string;
  defaultModel: string;
  autoSave: boolean;
  maxHistoryDays: number;
  compressionEnabled: boolean;
  backupEnabled: boolean;
  ui: {
    fontSize: number;
    compactMode: boolean;
    animationsEnabled: boolean;
    soundEnabled: boolean;
  };
}

export interface OmnisChatMemoryConfig {
  maxHistorySize: number;
  autoBackupInterval: number;
  compressionThreshold: number;
  maxSessionsActive: number;
}

// ═══════════════════════════════════════════════════════════════
// 🧠 OMNIS CHAT MEMORY MANAGER
// ═══════════════════════════════════════════════════════════════

class OmnisChatMemoryManager {
  private config: OmnisChatMemoryConfig;
  private sessionCache: Map<string, ChatSession> = new Map();

  constructor(config: Partial<OmnisChatMemoryConfig> = {}) {
    this.config = {
      maxHistorySize: 1000,
      autoBackupInterval: 60000, // 1 minute
      compressionThreshold: 100,
      maxSessionsActive: 10,
      ...config
    };

    this.initializeChatMemory();
  }

  // ───────────────────────────────────────────────────────────
  // 🚀 INITIALIZATION
  // ───────────────────────────────────────────────────────────

  private async initializeChatMemory(): Promise<void> {
    try {
      console.log('🧠 OMNIS Chat Memory Manager - Initializing...');

      // Load active sessions
      await this.loadActiveSessions();

      // Setup auto-backup
      setInterval(async () => {
        await this.autoBackupSessions();
      }, this.config.autoBackupInterval);

      console.log('🧠 OMNIS Chat Memory Manager - ✅ Initialized');

    } catch (error) {
      console.error('💥 Chat Memory initialization failed:', error);
    }
  }

  private async loadActiveSessions(): Promise<void> {
    try {
      const activeSessionIds = await retrieveMemory('chat_active_sessions') as string[] || [];

      for (const sessionId of activeSessionIds.slice(0, this.config.maxSessionsActive)) {
        const session = await retrieveMemory(`chat_session_${sessionId}`) as ChatSession;
        if (session) {
          this.sessionCache.set(sessionId, session);
        }
      }

      console.log(`📥 Loaded ${this.sessionCache.size} active sessions`);

    } catch (error) {
      console.warn('⚠️ Failed to load active sessions:', error);
    }
  }

  // ───────────────────────────────────────────────────────────
  // 💬 CHAT HISTORY OPERATIONS
  // ───────────────────────────────────────────────────────────

  public async createSession(sessionData: Partial<ChatSession>): Promise<string> {
    try {
      const sessionId = sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const session: ChatSession = {
        id: sessionId,
        title: sessionData.title || 'New Chat',
        messages: sessionData.messages || [],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        settings: {
          provider: 'openai',
          model: 'gpt-4o',
          temperature: 0.7,
          maxTokens: 4000,
          ...sessionData.settings
        }
      };

      // Store in cache
      this.sessionCache.set(sessionId, session);

      // Persist to memory engine
      await storeMemory(
        `chat_session_${sessionId}`,
        'chat',
        session,
        'important',
        this.calculateTTL(session)
      );

      // Update active sessions list
      await this.updateActiveSessionsList();

      console.log(`💬 Created session: ${sessionId}`);
      return sessionId;

    } catch (error) {
      console.error('💥 Session creation failed:', error);
      throw new Error('Failed to create chat session');
    }
  }

  public async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      // Try cache first
      if (this.sessionCache.has(sessionId)) {
        return this.sessionCache.get(sessionId) || null;
      }

      // Try memory engine
      const session = await retrieveMemory(`chat_session_${sessionId}`) as ChatSession;
      if (session) {
        this.sessionCache.set(sessionId, session);
        return session;
      }

      return null;

    } catch (error) {
      console.error(`💥 Session retrieval failed for ${sessionId}:`, error);
      return null;
    }
  }

  public async updateSession(sessionId: string, updates: Partial<ChatSession>): Promise<boolean> {
    try {
      const existingSession = await this.getSession(sessionId);
      if (!existingSession) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const updatedSession: ChatSession = {
        ...existingSession,
        ...updates,
        id: sessionId, // Ensure ID doesn't change
        lastUpdated: Date.now()
      };

      // Update cache
      this.sessionCache.set(sessionId, updatedSession);

      // Persist changes
      await storeMemory(
        `chat_session_${sessionId}`,
        'chat',
        updatedSession,
        'important',
        this.calculateTTL(updatedSession)
      );

      return true;

    } catch (error) {
      console.error(`💥 Session update failed for ${sessionId}:`, error);
      return false;
    }
  }

  public async addMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        ...message
      };

      session.messages.push(chatMessage);
      session.lastUpdated = Date.now();

      // Auto-compress if history too long
      if (session.messages.length > this.config.compressionThreshold) {
        await this.compressSessionHistory(session);
      }

      await this.updateSession(sessionId, session);

      console.log(`💬 Added message to session ${sessionId}: ${chatMessage.id}`);
      return chatMessage.id;

    } catch (error) {
      console.error(`💥 Message addition failed for session ${sessionId}:`, error);
      throw new Error('Failed to add message to session');
    }
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Remove from cache
      this.sessionCache.delete(sessionId);

      // Remove from memory engine
      await removeMemory(`chat_session_${sessionId}`);

      // Update active sessions list
      await this.updateActiveSessionsList();

      console.log(`🗑️ Deleted session: ${sessionId}`);
      return true;

    } catch (error) {
      console.error(`💥 Session deletion failed for ${sessionId}:`, error);
      return false;
    }
  }

  public async listSessions(limit: number = 50): Promise<ChatSession[]> {
    try {
      const sessions = Array.from(this.sessionCache.values())
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .slice(0, limit);

      return sessions;

    } catch (error) {
      console.error('💥 Session listing failed:', error);
      return [];
    }
  }

  // ───────────────────────────────────────────────────────────
  // ⚙️ USER PREFERENCES MANAGEMENT
  // ───────────────────────────────────────────────────────────

  public async savePreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      const existing = await retrieveMemory('user_preferences') as UserPreferences || this.getDefaultPreferences();

      const updated: UserPreferences = {
        ...existing,
        ...preferences
      };

      await storeMemory('user_preferences', 'preference', updated, 'critical');

      console.log('⚙️ User preferences saved');
      return true;

    } catch (error) {
      console.error('💥 Preferences save failed:', error);
      return false;
    }
  }

  public async loadPreferences(): Promise<UserPreferences> {
    try {
      const preferences = await retrieveMemory('user_preferences') as UserPreferences;
      return preferences || this.getDefaultPreferences();

    } catch (error) {
      console.warn('⚠️ Preferences load failed, using defaults:', error);
      return this.getDefaultPreferences();
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'auto',
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o',
      autoSave: true,
      maxHistoryDays: 30,
      compressionEnabled: true,
      backupEnabled: true,
      ui: {
        fontSize: 16,
        compactMode: false,
        animationsEnabled: true,
        soundEnabled: false
      }
    };
  }

  // ───────────────────────────────────────────────────────────
  // 🗜️ COMPRESSION & OPTIMIZATION
  // ───────────────────────────────────────────────────────────

  private async compressSessionHistory(session: ChatSession): Promise<void> {
    try {
      // Keep recent messages, compress older ones
      const recentCount = 20;
      const recentMessages = session.messages.slice(-recentCount);
      const oldMessages = session.messages.slice(0, -recentCount);

      if (oldMessages.length > 0) {
        // Create compressed summary of old messages
        const compressedSummary: ChatMessage = {
          id: `compressed_${Date.now()}`,
          role: 'system',
          content: `[Compressed history: ${oldMessages.length} messages from ${new Date(oldMessages[0].timestamp).toLocaleString()} to ${new Date(oldMessages[oldMessages.length - 1].timestamp).toLocaleString()}]`,
          timestamp: oldMessages[oldMessages.length - 1].timestamp,
          metadata: {
            tokenCount: oldMessages.reduce((sum, msg) => sum + (msg.metadata?.tokenCount || 0), 0)
          }
        };

        session.messages = [compressedSummary, ...recentMessages];
        console.log(`🗜️ Compressed ${oldMessages.length} messages for session ${session.id}`);
      }

    } catch (error) {
      console.warn(`⚠️ History compression failed for session ${session.id}:`, error);
    }
  }

  // ───────────────────────────────────────────────────────────
  // 💾 BACKUP & PERSISTENCE
  // ───────────────────────────────────────────────────────────

  private async autoBackupSessions(): Promise<void> {
    try {
      let backupCount = 0;

      for (const [sessionId, session] of this.sessionCache.entries()) {
        // Check if session needs backup (has new messages)
        const timeSinceLastUpdate = Date.now() - session.lastUpdated;
        if (timeSinceLastUpdate < this.config.autoBackupInterval * 2) {
          await storeMemory(
            `chat_session_${sessionId}`,
            'chat',
            session,
            'important',
            this.calculateTTL(session)
          );
          backupCount++;
        }
      }

      if (backupCount > 0) {
        console.log(`💾 Auto-backup completed: ${backupCount} sessions`);
      }

    } catch (error) {
      console.error('💥 Auto-backup failed:', error);
    }
  }

  private async updateActiveSessionsList(): Promise<void> {
    try {
      const activeSessionIds = Array.from(this.sessionCache.keys());
      await storeMemory('chat_active_sessions', 'session', activeSessionIds, 'critical');
    } catch (error) {
      console.error('💥 Active sessions list update failed:', error);
    }
  }

  private calculateTTL(session: ChatSession): number {
    // TTL based on session activity (30 days for active, 7 days for old)
    const daysSinceUpdate = (Date.now() - session.lastUpdated) / (1000 * 60 * 60 * 24);
    const baseTTL = daysSinceUpdate < 7 ? 30 : 7; // days
    return baseTTL * 24 * 60 * 60 * 1000; // convert to milliseconds
  }

  // ───────────────────────────────────────────────────────────
  // 📊 MONITORING & STATISTICS
  // ───────────────────────────────────────────────────────────

  public async getChatMemoryStats(): Promise<{
    activeSessions: number;
    totalMessages: number;
    memoryUsage: unknown;
    health: unknown;
  }> {
    try {
      const totalMessages = Array.from(this.sessionCache.values())
        .reduce((sum, session) => sum + session.messages.length, 0);

      return {
        activeSessions: this.sessionCache.size,
        totalMessages,
        memoryUsage: await getMemoryStats(),
        health: await getMemoryHealth()
      };

    } catch (error) {
      console.error('💥 Stats retrieval failed:', error);
      return {
        activeSessions: 0,
        totalMessages: 0,
        memoryUsage: null,
        health: null
      };
    }
  }

  public async forceBackup(): Promise<void> {
    await this.autoBackupSessions();
    await omnisMemory.forceBackup();
  }

  public async forceCleanup(): Promise<void> {
    // Clean old sessions from cache
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    for (const [sessionId, session] of this.sessionCache.entries()) {
      if (session.lastUpdated < cutoffTime) {
        this.sessionCache.delete(sessionId);
      }
    }

    await omnisMemory.forceCleanup();
    console.log('🧹 Chat memory cleanup completed');
  }

  public destroy(): void {
    this.sessionCache.clear();
    console.log('💥 OMNIS Chat Memory Manager destroyed');
  }
}

// ═══════════════════════════════════════════════════════════════
// 🎯 SINGLETON & EXPORTS
// ═══════════════════════════════════════════════════════════════

export const omnisChatMemory = new OmnisChatMemoryManager({
  maxHistorySize: 1000,
  autoBackupInterval: 60000,
  compressionThreshold: 100,
  maxSessionsActive: 10
});

export { OmnisChatMemoryManager };

// Convenience functions for chat integration
export const createChatSession = omnisChatMemory.createSession.bind(omnisChatMemory);
export const getChatSession = omnisChatMemory.getSession.bind(omnisChatMemory);
export const addChatMessage = omnisChatMemory.addMessage.bind(omnisChatMemory);
export const deleteChatSession = omnisChatMemory.deleteSession.bind(omnisChatMemory);
export const listChatSessions = omnisChatMemory.listSessions.bind(omnisChatMemory);
export const saveUserPreferences = omnisChatMemory.savePreferences.bind(omnisChatMemory);
export const loadUserPreferences = omnisChatMemory.loadPreferences.bind(omnisChatMemory);
export const getChatMemoryStats = omnisChatMemory.getChatMemoryStats.bind(omnisChatMemory);

console.log('💬 OMNIS Chat Memory Integration v1.0 - Module loaded');

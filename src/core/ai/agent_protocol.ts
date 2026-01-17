/**
 * TITANE∞ v∞ Phase 4 - Multi-Agent System
 * Agent Protocol - Communication sécurisée inter-agents
 */

import type { AgentEvent } from './multi_agent_engine';

// ══════════════════════════════════════════════════════════════════
// EVENT TYPES CATALOGUE
// ══════════════════════════════════════════════════════════════════

export const EventTypes = {
  // System events
  SYSTEM_STARTUP: 'system:startup',
  SYSTEM_SHUTDOWN: 'system:shutdown',
  SYSTEM_ERROR: 'system:error',

  // Agent lifecycle
  AGENT_INITIALIZED: 'agent:initialized',
  AGENT_PAUSED: 'agent:paused',
  AGENT_RESUMED: 'agent:resumed',
  AGENT_ERROR: 'agent:error',

  // Physical (Helios)
  METRICS_UPDATED: 'metrics:updated',
  HIGH_CPU: 'alert:high_cpu',
  HIGH_MEMORY: 'alert:high_memory',
  HIGH_LATENCY: 'alert:high_latency',

  // Emotional (Harmonia)
  TONE_ADJUSTED: 'tone:adjusted',
  TONE_INCOHERENT: 'tone:incoherent',
  CONVERSATION_ANALYZED: 'conversation:analyzed',

  // Behavioral (Persona)
  MODE_CHANGED: 'mode:changed',
  CONSISTENCY_WARNING: 'consistency:warning',
  BEHAVIOR_STABILIZED: 'behavior:stabilized',

  // Memory (Memory-Core)
  KNOWLEDGE_IMPORTED: 'knowledge:imported',
  KNOWLEDGE_INTEGRATED: 'knowledge:integrated',
  XP_AWARDED: 'xp:awarded',
  SNAPSHOT_CREATED: 'snapshot:created',

  // Security (Watchdog)
  SECURITY_ALERT: 'security:alert',
  AGENT_BLOCKED: 'security:agent_blocked',
  SUSPICIOUS_ACTIVITY: 'security:suspicious',
  AUDIT_COMPLETE: 'security:audit_complete',
} as const;

// ══════════════════════════════════════════════════════════════════
// ENCRYPTION
// ══════════════════════════════════════════════════════════════════

class EventEncryption {
  private encryptionKey: string | null = null;

  setKey(key: string): void {
    this.encryptionKey = key;
  }

  async encrypt(data: unknown): Promise<string> {
    if (!this.encryptionKey) {
      // No encryption if key not set (dev mode)
      return JSON.stringify(data);
    }

    try {
      const str = JSON.stringify(data);
      // Simple XOR encryption (in production, use Web Crypto API AES-256-GCM)
      const encrypted = this.xorEncrypt(str, this.encryptionKey);
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      console.error('[AgentProtocol] Encryption failed:', error);
      return JSON.stringify(data);
    }
  }

  async decrypt(encrypted: string): Promise<unknown> {
    if (!this.encryptionKey) {
      // No decryption if key not set
      return JSON.parse(encrypted);
    }

    try {
      const decoded = atob(encrypted);
      const decrypted = this.xorEncrypt(decoded, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[AgentProtocol] Decryption failed:', error);
      return null;
    }
  }

  private xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }
}

// ══════════════════════════════════════════════════════════════════
// RATE LIMITING
// ══════════════════════════════════════════════════════════════════

interface RateLimitConfig {
  maxEventsPerSecond: number;
  maxEventsPerMinute: number;
  burstSize: number;
}

class RateLimiter {
  private eventCounts: Map<string, number[]> = new Map();
  private config: RateLimitConfig = {
    maxEventsPerSecond: 10,
    maxEventsPerMinute: 100,
    burstSize: 20,
  };

  setConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }

  checkLimit(agentId: string): boolean {
    const now = Date.now();
    const timestamps = this.eventCounts.get(agentId) || [];

    // Remove old timestamps (older than 1 minute)
    const recent = timestamps.filter(t => now - t < 60000);

    // Check per-second limit
    const lastSecond = recent.filter(t => now - t < 1000);
    if (lastSecond.length >= this.config.maxEventsPerSecond) {
      console.warn(`[RateLimiter] ${agentId} exceeded per-second limit`);
      return false;
    }

    // Check per-minute limit
    if (recent.length >= this.config.maxEventsPerMinute) {
      console.warn(`[RateLimiter] ${agentId} exceeded per-minute limit`);
      return false;
    }

    // Check burst size
    const lastBurst = recent.filter(t => now - t < 100); // 100ms burst window
    if (lastBurst.length >= this.config.burstSize) {
      console.warn(`[RateLimiter] ${agentId} exceeded burst limit`);
      return false;
    }

    // Add current timestamp
    recent.push(now);
    this.eventCounts.set(agentId, recent);

    return true;
  }

  reset(agentId: string): void {
    this.eventCounts.delete(agentId);
  }

  resetAll(): void {
    this.eventCounts.clear();
  }
}

// ══════════════════════════════════════════════════════════════════
// DEADLOCK PREVENTION
// ══════════════════════════════════════════════════════════════════

interface PendingOperation {
  agentId: string;
  operation: string;
  startTime: number;
  timeout: number;
}

class DeadlockPrevention {
  private pendingOps: Map<string, PendingOperation> = new Map();
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds

  registerOperation(
    agentId: string,
    operation: string,
    timeout = this.DEFAULT_TIMEOUT
  ): string {
    const opId = `${agentId}_${operation}_${Date.now()}`;
    this.pendingOps.set(opId, {
      agentId,
      operation,
      startTime: Date.now(),
      timeout,
    });

    // Auto-cleanup after timeout
    setTimeout(() => {
      if (this.pendingOps.has(opId)) {
        console.warn(`[DeadlockPrevention] Operation ${opId} timed out`);
        this.completeOperation(opId);
      }
    }, timeout);

    return opId;
  }

  completeOperation(opId: string): void {
    this.pendingOps.delete(opId);
  }

  checkDeadlock(): string[] {
    const now = Date.now();
    const deadlocked: string[] = [];

    this.pendingOps.forEach((op, opId) => {
      if (now - op.startTime > op.timeout) {
        deadlocked.push(opId);
      }
    });

    return deadlocked;
  }

  getPendingOperations(agentId?: string): PendingOperation[] {
    const ops = Array.from(this.pendingOps.values());
    return agentId ? ops.filter(op => op.agentId === agentId) : ops;
  }

  clearAll(): void {
    this.pendingOps.clear();
  }
}

// ══════════════════════════════════════════════════════════════════
// AGENT PROTOCOL (Main Class)
// ══════════════════════════════════════════════════════════════════

export class AgentProtocol {
  private encryption = new EventEncryption();
  private rateLimiter = new RateLimiter();
  private deadlockPrevention = new DeadlockPrevention();
  private eventQueue: AgentEvent[] = [];
  private processing = false;

  // Initialize protocol with encryption key
  initialize(encryptionKey?: string): void {
    if (encryptionKey) {
      this.encryption.setKey(encryptionKey);
    }
    console.log('[AgentProtocol] Initialized');
  }

  // Create secure event
  async createEvent(
    type: string,
    source: string,
    payload: unknown,
    priority: AgentEvent['priority'] = 'medium'
  ): Promise<AgentEvent> {
    // Check rate limit
    if (!this.rateLimiter.checkLimit(source)) {
      throw new Error(`Rate limit exceeded for agent ${source}`);
    }

    // Encrypt sensitive data
    const encryptedPayload = await this.encryption.encrypt(payload);

    const event: AgentEvent = {
      type,
      source,
      timestamp: Date.now(),
      payload: encryptedPayload,
      priority,
    };

    return event;
  }

  // Decrypt event payload
  async decryptEvent(event: AgentEvent): Promise<unknown> {
    return this.encryption.decrypt(event.payload as string);
  }

  // Queue event for processing
  queueEvent(event: AgentEvent): void {
    this.eventQueue.push(event);
    this.processQueue();
  }

  // Process event queue (prevents flooding)
  private async processQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) return;

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        // Process event (would normally dispatch to agents)
        await this.processEvent(event);
      }

      // Small delay to prevent CPU spike
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processing = false;
  }

  private async processEvent(event: AgentEvent): Promise<void> {
    // Event processing logic (placeholder)
    console.log(`[AgentProtocol] Processing event: ${event.type} from ${event.source}`);
  }

  // Register operation with deadlock prevention
  registerOperation(agentId: string, operation: string, timeout?: number): string {
    return this.deadlockPrevention.registerOperation(agentId, operation, timeout);
  }

  // Complete operation
  completeOperation(opId: string): void {
    this.deadlockPrevention.completeOperation(opId);
  }

  // Check for deadlocks
  checkDeadlocks(): string[] {
    return this.deadlockPrevention.checkDeadlock();
  }

  // Configure rate limiting
  configureRateLimit(config: Partial<RateLimitConfig>): void {
    this.rateLimiter.setConfig(config);
  }

  // Reset rate limit for agent
  resetRateLimit(agentId: string): void {
    this.rateLimiter.reset(agentId);
  }

  // Get statistics
  getStats(): {
    queueSize: number;
    pendingOperations: number;
    deadlockedOperations: number;
  } {
    return {
      queueSize: this.eventQueue.length,
      pendingOperations: this.deadlockPrevention.getPendingOperations().length,
      deadlockedOperations: this.deadlockPrevention.checkDeadlock().length,
    };
  }

  // Cleanup
  shutdown(): void {
    this.eventQueue = [];
    this.rateLimiter.resetAll();
    this.deadlockPrevention.clearAll();
    console.log('[AgentProtocol] Shutdown complete');
  }
}

// ══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ══════════════════════════════════════════════════════════════════

export const agentProtocol = new AgentProtocol();

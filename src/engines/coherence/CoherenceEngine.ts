/**
 * TITANE∞ v20Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * CoherenceEngine - Unified Coherence & Coordination Engine
 * FUSION: Moteur #2 (Cohérence) + Nexus Engine (Coordination)
 *
 * This engine consolidates:
 * - Singularity Kernel coherence validation
 * - Cognitive Kernel cognitive principles
 * - TitaneOS coordination (EventBus, MessageBus, Registries)
 * - Nexus Engine task prioritization
 */

import { EventBus } from './bus/EventBus';
import { MessageBus } from './bus/MessageBus';
import { EngineRegistry } from './registry/EngineRegistry';
import { ServiceRegistry } from './registry/ServiceRegistry';
import { CoherenceValidator } from './validation/coherenceValidator';
import { TaskPrioritizer } from './coordination/taskPrioritizer';
import { EngineCoordinator } from './coordination/engineCoordinator';

import type {
  SystemState,
  ValidationResult,
  Task,
  PrioritizedTasks,
  Engine,
  CoordinationResult,
  SystemEvent,
  EventType,
  EventHandler,
  Message,
  MessageHandler,
  Service,
  CoherenceContext,
  EngineState,
  ProviderState,
  MemoryState,
} from './types';

/**
 * CoherenceEngine - Central coherence and coordination system
 *
 * Responsibilities:
 * - System-wide coherence validation
 * - Inter-engine coordination
 * - Task prioritization
 * - Centralized EventBus and MessageBus
 * - Engine and Service registries
 * - Lifecycle management
 */
class CoherenceEngineImpl {
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERNAL COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════

  private validator: CoherenceValidator;
  private prioritizer: TaskPrioritizer;
  private coordinator: EngineCoordinator;

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC SUBSYSTEMS (exposed for direct access)
  // ═══════════════════════════════════════════════════════════════════════════

  /** Centralized event bus for system-wide events */
  public readonly events: EventBus;

  /** Point-to-point message bus for component communication */
  public readonly messages: MessageBus;

  /** Registry of all cognitive engines */
  public readonly engines: EngineRegistry;

  /** Registry of all system services */
  public readonly services: ServiceRegistry;

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  private initialized = false;
  private systemState: SystemState;

  constructor() {
    // Initialize buses
    this.events = new EventBus();
    this.messages = new MessageBus();

    // Initialize registries
    this.engines = new EngineRegistry();
    this.services = new ServiceRegistry();

    // Initialize logic components
    this.validator = new CoherenceValidator();
    this.prioritizer = new TaskPrioritizer();
    this.coordinator = new EngineCoordinator(this.engines);

    // Initialize default system state
    this.systemState = this.createDefaultState();

    console.log('[CoherenceEngine] Initialized');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Initialize the coherence engine
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Initialize all registered services
    await this.services.initAll();

    // Start all registered engines
    await this.engines.startAll();

    this.initialized = true;
    this.emit({ type: 'system:ready', data: { timestamp: Date.now() } });
    console.log('[CoherenceEngine] System ready');
  }

  /**
   * Shutdown the coherence engine
   */
  async shutdown(): Promise<void> {
    this.emit({ type: 'system:shutdown', data: { timestamp: Date.now() } });

    // Stop all engines
    await this.engines.stopAll();

    // Destroy all services
    await this.services.destroyAll();

    // Clear buses
    this.events.clear();
    this.messages.clear();

    this.initialized = false;
    console.log('[CoherenceEngine] Shutdown complete');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COHERENCE (ex-Singularity Kernel)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate current system state coherence
   */
  validate(state?: SystemState): ValidationResult {
    const stateToValidate = state ?? this.getSystemState();
    const result = this.validator.validate(stateToValidate);

    // Emit validation event
    this.emit({
      type: 'coherence:validated',
      data: {
        valid: result.valid,
        score: result.coherenceScore,
        issues: result.issues.length,
      },
    });

    // Emit violation if invalid
    if (!result.valid) {
      this.emit({
        type: 'coherence:violation',
        data: result,
      });
    }

    return result;
  }

  /**
   * Enforce coherence constraints
   */
  enforceCoherence(context: CoherenceContext): void {
    this.validator.enforce(context);
    this.emit({
      type: 'coherence:enforced',
      data: { context },
    });
  }

  /**
   * Get current coherence score
   */
  getCoherenceScore(): number {
    const result = this.validate();
    return result.coherenceScore;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COORDINATION (ex-Nexus Engine)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Prioritize a list of tasks
   */
  prioritize(tasks: Task[]): PrioritizedTasks {
    return this.prioritizer.prioritize(tasks);
  }

  /**
   * Coordinate multiple engines for a task
   */
  coordinate(engineIds: string[]): CoordinationResult {
    const engines = engineIds
      .map(id => this.engines.get(id))
      .filter((e): e is Engine => e !== undefined);

    return this.coordinator.coordinate(engines);
  }

  /**
   * Get executable tasks (respecting dependencies)
   */
  getExecutableTasks(tasks: Task[], completedIds: Set<string>): Task[] {
    return this.prioritizer.getExecutableTasks(tasks, completedIds);
  }

  /**
   * Synchronize state across engines
   */
  async synchronizeEngines(engineIds: string[]): Promise<void> {
    await this.coordinator.synchronizeState(engineIds);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT BUS (delegated)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Emit a system event
   */
  emit<T = unknown>(event: SystemEvent<T>): void {
    this.events.emit(event);
  }

  /**
   * Subscribe to system events
   */
  subscribe<T = unknown>(type: EventType | '*', handler: EventHandler<T>): () => void {
    return this.events.subscribe(type, handler);
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): SystemEvent[] {
    return this.events.getHistory(limit);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE BUS (delegated)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Register a message handler
   */
  registerMessageHandler<T = unknown>(
    target: string,
    type: string,
    handler: MessageHandler<T>
  ): () => void {
    return this.messages.register(target, type, handler);
  }

  /**
   * Send a message
   */
  async sendMessage<T = unknown>(
    message: Omit<Message<T>, 'id' | 'timestamp'>
  ): Promise<void> {
    await this.messages.send(message);
  }

  /**
   * Request-response pattern
   */
  async request<TReq = unknown, TRes = unknown>(
    message: Omit<Message<TReq>, 'id' | 'timestamp'>,
    timeoutMs?: number
  ): Promise<Message<TRes>> {
    return this.messages.request(message, timeoutMs);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINE REGISTRY (delegated)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Register an engine
   */
  registerEngine(engine: Engine, dependencies?: string[]): void {
    this.engines.register(engine, dependencies);
    this.emit({
      type: 'engine:started',
      data: { engineId: engine.id, name: engine.name },
    });
  }

  /**
   * Get an engine by ID
   */
  getEngine<T extends Engine>(id: string): T | undefined {
    return this.engines.get<T>(id);
  }

  /**
   * Get all engine states
   */
  getAllEngineStates(): Map<string, EngineState> {
    return this.engines.getAllStates();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERVICE REGISTRY (delegated)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Register a service
   */
  registerService(service: Service): void {
    this.services.register(service);
  }

  /**
   * Get a service by ID
   */
  getService<T extends Service>(id: string): T | undefined {
    return this.services.get<T>(id);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current system state
   */
  getSystemState(): SystemState {
    // Update engine states
    const engineStates = this.engines.getAllStates();
    this.systemState.engines = engineStates;
    this.systemState.timestamp = Date.now();

    return this.systemState;
  }

  /**
   * Update provider states
   */
  updateProviderState(id: string, state: Partial<ProviderState>): void {
    const existing = this.systemState.providers.get(id) ?? {
      id,
      health: 1,
      latency: 0,
      available: true,
    };
    this.systemState.providers.set(id, { ...existing, ...state });
  }

  /**
   * Update memory state
   */
  updateMemoryState(state: Partial<MemoryState>): void {
    this.systemState.memory = { ...this.systemState.memory, ...state };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private createDefaultState(): SystemState {
    return {
      engines: new Map(),
      providers: new Map(),
      memory: {
        stmCount: 0,
        mtmCount: 0,
        ltmCount: 0,
        totalSize: 0,
      },
      coherenceScore: 1.0,
      timestamp: Date.now(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Global CoherenceEngine instance
 *
 * Usage:
 * ```typescript
 * import { coherenceEngine } from '@/engines/coherence';
 *
 * // Validation
 * const result = coherenceEngine.validate();
 *
 * // Event subscription
 * coherenceEngine.subscribe('engine:started', (event) => {
 *   console.log('Engine started:', event.data);
 * });
 *
 * // Task prioritization
 * const prioritized = coherenceEngine.prioritize(tasks);
 * ```
 */
export const coherenceEngine = new CoherenceEngineImpl();

// Type export for consumers
export type CoherenceEngine = typeof coherenceEngine;

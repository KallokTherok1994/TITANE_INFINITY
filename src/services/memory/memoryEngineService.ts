/**
 * TITANE∞ vΩ∞ — SERVICE MEMORY ENGINE
 * Super Prompt #3: Service de gestion mémoire multi-couches
 *
 * C. Orchestration de:
 *    - Stockage/récupération mémoire
 *    - Compression sémantique
 *    - Gestion du contexte
 *    - Synchronisation backend
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import { invoke } from '@tauri-apps/api/core';
import { secureInvoke } from '@/lib/security';
import {
  MEMORY_ENGINE_CONFIG,
  RETENTION_POLICIES,
  COMPRESSION_STRATEGIES,
  SEARCH_CONFIG,
  CONTEXT_CONFIG,
  MAINTENANCE_CONFIG,
  SYNC_CONFIG,
  MEMORY_COMMANDS,
  calculateAdjustedImportance,
  getImportanceLevel,
  suggestTier,
  shouldRunMaintenance,
} from '@/config/memoryEngine.config';
import type {
  Memory,
  MemoryTier,
  MemoryContentType,
  MemoryImportance,
  MemorySource,
  MemoryMetadata,
  MemoryAssociation,
  ConversationContext,
  ContextMessage,
  ContextSummary,
  WorkingMemorySlot,
  EmotionalTone,
  CompressionResult,
  CompressionStrategy,
  MemorySearchQuery,
  MemorySearchResult,
  ScoredMemory,
  MemoryStats,
  MaintenanceEvent,
  MemoryEventCallbacks,
  MemoryEngineState,
  MemoryError,
  MemoryResponse,
} from '@/types/memoryEngine';

// ============================================================================
// ÉTAT INTERNE
// ============================================================================

interface MemoryServiceState {
  isInitialized: boolean;
  memories: Map<string, Memory>;
  context: ConversationContext | null;
  stats: MemoryStats;
  pendingSync: Memory[];
  callbacks: MemoryEventCallbacks;
  maintenanceTimer: NodeJS.Timeout | null;
  syncTimer: NodeJS.Timeout | null;
}

const state: MemoryServiceState = {
  isInitialized: false,
  memories: new Map(),
  context: null,
  stats: createEmptyStats(),
  pendingSync: [],
  callbacks: {},
  maintenanceTimer: null,
  syncTimer: null,
};

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise le Memory Engine
 */
export async function initializeMemoryEngine(
  callbacks?: MemoryEventCallbacks
): Promise<void> {
  if (state.isInitialized) {
    console.warn('[MemoryEngine] Déjà initialisé');
    return;
  }

  try {
    // Restaurer les données persistées
    const restored = await restoreFromBackend();
    console.log(`[MemoryEngine] Restauré ${restored} souvenirs`);

    // Configurer les callbacks
    if (callbacks) {
      state.callbacks = callbacks;
    }

    // Démarrer les timers
    startMaintenanceTimer();
    startSyncTimer();

    state.isInitialized = true;
    console.log('[MemoryEngine] Initialisé avec succès');
  } catch (error) {
    console.error('[MemoryEngine] Erreur initialisation:', error);
    throw error;
  }
}

/**
 * Arrête le Memory Engine proprement
 */
export async function shutdownMemoryEngine(): Promise<void> {
  // Arrêter les timers
  if (state.maintenanceTimer) {
    clearInterval(state.maintenanceTimer);
    state.maintenanceTimer = null;
  }
  if (state.syncTimer) {
    clearInterval(state.syncTimer);
    state.syncTimer = null;
  }

  // Sync final
  await syncToBackend(true);

  // Sauvegarder le contexte
  if (state.context) {
    await saveContext();
  }

  state.isInitialized = false;
  console.log('[MemoryEngine] Arrêté proprement');
}

// ============================================================================
// OPÉRATIONS MÉMOIRE CRUD
// ============================================================================

/**
 * Stocke un nouveau souvenir
 */
export async function storeMemory(
  content: string,
  options: {
    contentType?: MemoryContentType;
    tier?: MemoryTier;
    importance?: number;
    source?: MemorySource;
    metadata?: Partial<MemoryMetadata>;
    associations?: MemoryAssociation[];
  } = {}
): Promise<Memory> {
  const id = generateMemoryId();
  const now = Date.now();

  // Calculer l'importance
  const baseImportance = options.importance ?? 50;
  const modifiers = extractImportanceModifiers(content, options.contentType);
  const adjustedImportance = calculateAdjustedImportance(baseImportance, modifiers);

  // Déterminer le tier
  const tier = options.tier ?? suggestTier(0, adjustedImportance, 0);

  // Extraire les métadonnées
  const metadata = extractMetadata(content, options.source ?? 'user_input');
  Object.assign(metadata, options.metadata);

  const memory: Memory = {
    id,
    tier,
    contentType: options.contentType ?? 'message',
    importance: getImportanceLevel(adjustedImportance),
    importanceScore: adjustedImportance,
    content,
    metadata,
    createdAt: now,
    accessedAt: now,
    accessCount: 0,
    associations: options.associations ?? [],
    isCompressed: false,
    isArchived: false,
    decayRate: RETENTION_POLICIES[tier].importanceDecay,
  };

  // Stocker localement
  state.memories.set(id, memory);
  updateStats();

  // Ajouter à la file de sync
  state.pendingSync.push(memory);

  // Callback
  state.callbacks.onMemoryCreated?.(memory);

  // Vérifier si maintenance nécessaire
  await checkMaintenanceNeeded(tier);

  return memory;
}

/**
 * Récupère un souvenir par ID
 */
export function getMemory(id: string): Memory | undefined {
  const memory = state.memories.get(id);

  if (memory) {
    // Mettre à jour les stats d'accès
    memory.accessedAt = Date.now();
    memory.accessCount++;

    state.callbacks.onMemoryAccessed?.(memory);
  }

  return memory;
}

/**
 * Met à jour un souvenir existant
 */
export async function updateMemory(
  id: string,
  updates: Partial<Pick<Memory, 'content' | 'importance' | 'tier' | 'associations'>>
): Promise<Memory | null> {
  const memory = state.memories.get(id);

  if (!memory) {
    return null;
  }

  const changes: Partial<Memory> = {};

  if (updates.content !== undefined) {
    memory.content = updates.content;
    changes.content = updates.content;
    memory.metadata = extractMetadata(updates.content, memory.metadata.source);
  }

  if (updates.importance !== undefined) {
    memory.importance = updates.importance;
    changes.importance = updates.importance;
  }

  if (updates.tier !== undefined) {
    memory.tier = updates.tier;
    changes.tier = updates.tier;
    memory.decayRate = RETENTION_POLICIES[updates.tier].importanceDecay;
  }

  if (updates.associations !== undefined) {
    memory.associations = updates.associations;
    changes.associations = updates.associations;
  }

  state.pendingSync.push(memory);
  state.callbacks.onMemoryUpdated?.(memory, changes);

  return memory;
}

/**
 * Supprime un souvenir
 */
export async function deleteMemory(id: string): Promise<boolean> {
  const existed = state.memories.delete(id);

  if (existed) {
    updateStats();
    state.callbacks.onMemoryDeleted?.(id);

    // Sync la suppression
    try {
      await secureInvoke(MEMORY_COMMANDS.delete, { id });
    } catch (error) {
      console.error('[MemoryEngine] Erreur suppression backend:', error);
    }
  }

  return existed;
}

// ============================================================================
// RECHERCHE
// ============================================================================

/**
 * Recherche des souvenirs
 */
export async function searchMemories(
  query: MemorySearchQuery
): Promise<MemorySearchResult> {
  const startTime = Date.now();
  const results: ScoredMemory[] = [];

  // Filtrer et scorer les souvenirs
  for (const memory of state.memories.values()) {
    // Appliquer les filtres
    if (!matchesFilters(memory, query)) {
      continue;
    }

    // Calculer le score
    const score = calculateRelevanceScore(memory, query);

    if (score >= (query.minRelevance ?? SEARCH_CONFIG.minRelevanceScore)) {
      results.push({
        ...memory,
        score,
        matchType: query.embedding ? 'semantic' : 'exact',
      });
    }
  }

  // Trier
  results.sort((a, b) => {
    switch (query.sortBy) {
      case 'relevance':
        return b.score - a.score;
      case 'recency':
        return b.createdAt - a.createdAt;
      case 'importance':
        return b.importanceScore - a.importanceScore;
      case 'accessCount':
        return b.accessCount - a.accessCount;
      default:
        return b.score - a.score;
    }
  });

  // Appliquer la pagination
  const offset = query.offset ?? 0;
  const paginatedResults = results.slice(offset, offset + query.limit);

  // Extraire les topics
  const topicsFound = new Set<string>();
  for (const result of paginatedResults) {
    result.metadata.topics.forEach(t => topicsFound.add(t));
  }

  return {
    memories: paginatedResults,
    totalCount: results.length,
    queryTimeMs: Date.now() - startTime,
    topicsFound: Array.from(topicsFound),
    tiersSearched: query.tiers ?? ['instant', 'short', 'medium', 'long', 'persistent'],
    usedEmbedding: !!query.embedding,
  };
}

/**
 * Recherche sémantique (via backend)
 */
export async function searchSemantic(
  text: string,
  options: Partial<MemorySearchQuery> = {}
): Promise<MemorySearchResult> {
  try {
    const response = await secureInvoke<MemorySearchResult>(
      MEMORY_COMMANDS.searchSemantic,
      {
        text,
        limit: options.limit ?? SEARCH_CONFIG.defaultLimit,
        tiers: options.tiers,
        contentTypes: options.contentTypes,
        minRelevance: options.minRelevance ?? SEARCH_CONFIG.minSemanticSimilarity,
      }
    );

    return response;
  } catch (error) {
    console.error('[MemoryEngine] Erreur recherche sémantique:', error);
    // Fallback vers recherche locale
    const query: MemorySearchQuery = {
      text,
      limit: options.limit ?? SEARCH_CONFIG.defaultLimit,
      sortBy: options.sortBy ?? 'relevance',
      sortOrder: options.sortOrder ?? 'desc' as const,
      tiers: options.tiers,
      contentTypes: options.contentTypes,
      importanceMin: options.importanceMin,
      timeRange: options.timeRange,
      sessionId: options.sessionId,
      topics: options.topics,
      offset: options.offset,
      includeArchived: options.includeArchived,
      expandAssociations: options.expandAssociations,
      minRelevance: options.minRelevance,
    };
    return searchMemories(query);
  }
}

// ============================================================================
// CONTEXTE CONVERSATIONNEL
// ============================================================================

/**
 * Crée ou récupère le contexte actif
 */
export function getOrCreateContext(sessionId: string): ConversationContext {
  if (state.context && state.context.sessionId === sessionId) {
    return state.context;
  }

  state.context = {
    id: generateContextId(),
    sessionId,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    recentMessages: [],
    maxRecentMessages: CONTEXT_CONFIG.maxRecentMessages,
    emotionalTone: {
      valence: 0,
      arousal: 0.5,
      confidence: 0,
      history: [],
    },
    summaries: [],
    totalMessageCount: 0,
    workingMemory: [],
    maxWorkingMemorySlots: CONTEXT_CONFIG.workingMemorySlots,
    stats: {
      userMessageCount: 0,
      assistantMessageCount: 0,
      averageMessageLength: 0,
      topicsDiscussed: [],
      memoriesAccessed: 0,
      memoriesCreated: 0,
      compressionEvents: 0,
    },
  };

  return state.context;
}

/**
 * Ajoute un message au contexte
 */
export async function addMessageToContext(
  message: Omit<ContextMessage, 'id' | 'timestamp' | 'tokenCount'>
): Promise<ContextMessage> {
  if (!state.context) {
    throw new Error('Aucun contexte actif');
  }

  const contextMessage: ContextMessage = {
    ...message,
    id: generateMessageId(),
    timestamp: Date.now(),
    tokenCount: estimateTokens(message.content),
  };

  state.context.recentMessages.push(contextMessage);
  state.context.lastActivityAt = Date.now();
  state.context.totalMessageCount++;

  // Mettre à jour les stats
  if (message.role === 'user') {
    state.context.stats.userMessageCount++;
  } else if (message.role === 'assistant') {
    state.context.stats.assistantMessageCount++;
  }

  // Vérifier si compression nécessaire
  if (state.context.recentMessages.length > CONTEXT_CONFIG.summaryTriggerMessages) {
    await compressContextMessages();
  }

  // Stocker comme mémoire
  const memory = await storeMemory(message.content, {
    contentType: 'message',
    tier: 'short',
    source: message.role === 'user' ? 'user_input' : 'ai_inference',
    metadata: {
      conversationId: state.context.id,
      sessionId: state.context.sessionId,
    } as Partial<MemoryMetadata>,
  });

  state.context.stats.memoriesCreated++;

  state.callbacks.onContextUpdated?.(state.context);

  return contextMessage;
}

/**
 * Ajoute un élément à la mémoire de travail
 */
export function addToWorkingMemory(
  content: string,
  priority: number = 50,
  sourceMemoryId?: string
): WorkingMemorySlot | null {
  if (!state.context) {
    return null;
  }

  // Vérifier la limite (7±2)
  if (state.context.workingMemory.length >= state.context.maxWorkingMemorySlots) {
    // Éjecter le moins prioritaire
    state.context.workingMemory.sort((a, b) => a.priority - b.priority);
    state.context.workingMemory.shift();
  }

  const slot: WorkingMemorySlot = {
    id: generateSlotId(),
    content,
    priority,
    addedAt: Date.now(),
    sourceMemoryId,
    expiresAfterTurns: CONTEXT_CONFIG.slotExpiryTurns,
    turnsRemaining: CONTEXT_CONFIG.slotExpiryTurns,
  };

  state.context.workingMemory.push(slot);
  return slot;
}

/**
 * Fait avancer les tours de la mémoire de travail
 */
export function tickWorkingMemory(): void {
  if (!state.context) return;

  state.context.workingMemory = state.context.workingMemory.filter(slot => {
    slot.turnsRemaining--;
    slot.priority -= slot.priority * CONTEXT_CONFIG.slotPriorityDecay;
    return slot.turnsRemaining > 0;
  });
}

/**
 * Sauvegarde le contexte
 */
export async function saveContext(): Promise<void> {
  if (!state.context) return;

  try {
    await secureInvoke(MEMORY_COMMANDS.contextSave, {
      context: state.context,
    });
  } catch (error) {
    console.error('[MemoryEngine] Erreur sauvegarde contexte:', error);
  }
}

/**
 * Restaure un contexte précédent
 */
export async function restoreContext(sessionId: string): Promise<ConversationContext | null> {
  try {
    const response = await secureInvoke<ConversationContext | null>(
      MEMORY_COMMANDS.contextRestore,
      { sessionId }
    );

    if (response) {
      state.context = response;
      state.callbacks.onContextUpdated?.(state.context);
    }

    return response;
  } catch (error) {
    console.error('[MemoryEngine] Erreur restauration contexte:', error);
    return null;
  }
}

/**
 * Efface le contexte actuel
 */
export async function clearContext(): Promise<void> {
  if (!state.context) return;

  const sessionId = state.context.sessionId;
  state.context = null;

  try {
    await secureInvoke(MEMORY_COMMANDS.contextClear, { sessionId });
  } catch (error) {
    console.error('[MemoryEngine] Erreur effacement contexte:', error);
  }
}

// ============================================================================
// COMPRESSION
// ============================================================================

/**
 * Compresse plusieurs souvenirs
 */
export async function compressMemories(
  memoryIds: string[],
  strategy: CompressionStrategy = 'hierarchical'
): Promise<CompressionResult | null> {
  const startTime = Date.now();
  const memories = memoryIds
    .map(id => state.memories.get(id))
    .filter((m): m is Memory => m !== undefined);

  if (memories.length < 2) {
    return null;
  }

  const config = COMPRESSION_STRATEGIES[strategy];

  try {
    // Appeler le backend pour la compression
    const response = await secureInvoke<{ compressed: string; retention: number }>(
      MEMORY_COMMANDS.compress,
      {
        contents: memories.map(m => m.content),
        strategy,
        targetTokens: config.targetTokens,
      }
    );

    // Créer le souvenir compressé
    const compressedMemory = await storeMemory(response.compressed, {
      contentType: 'summary',
      tier: 'medium',
      importance: Math.max(...memories.map(m => m.importanceScore)),
      source: 'compression',
    });

    compressedMemory.isCompressed = true;
    compressedMemory.childIds = memoryIds;

    // Lier les souvenirs originaux
    for (const memory of memories) {
      memory.parentId = compressedMemory.id;
    }

    // Calculer les métriques
    const originalTokens = memories.reduce((sum, m) => sum + m.metadata.tokenCount, 0);
    const compressedTokens = compressedMemory.metadata.tokenCount;

    const result: CompressionResult = {
      originalMemoryIds: memoryIds,
      compressedMemory,
      strategy,
      originalTokens,
      compressedTokens,
      compressionRatio: compressedTokens / originalTokens,
      informationRetention: response.retention,
      processedAt: Date.now(),
      processingTimeMs: Date.now() - startTime,
    };

    state.callbacks.onCompressionCompleted?.(result);

    return result;
  } catch (error) {
    console.error('[MemoryEngine] Erreur compression:', error);
    return null;
  }
}

/**
 * Compresse les messages du contexte
 */
async function compressContextMessages(): Promise<void> {
  if (!state.context) return;

  const messagesToCompress = state.context.recentMessages.slice(0, -5); // Garder les 5 derniers

  if (messagesToCompress.length < 5) return;

  const content = messagesToCompress.map(m => `${m.role}: ${m.content}`).join('\n');

  try {
    const response = await secureInvoke<{ summary: string; keyPoints: string[] }>(
      MEMORY_COMMANDS.compress,
      {
        contents: [content],
        strategy: 'abstractive',
        targetTokens: CONTEXT_CONFIG.summaryTargetTokens,
      }
    );

    const summary: ContextSummary = {
      id: generateSummaryId(),
      content: response.summary,
      messageRange: [0, messagesToCompress.length - 1],
      createdAt: Date.now(),
      topics: extractTopics(content),
      keyPoints: response.keyPoints,
      tokenCount: estimateTokens(response.summary),
    };

    state.context.summaries.push(summary);
    state.context.recentMessages = state.context.recentMessages.slice(-5);
    state.context.stats.compressionEvents++;

  } catch (error) {
    console.error('[MemoryEngine] Erreur compression contexte:', error);
  }
}

// ============================================================================
// MAINTENANCE
// ============================================================================

/**
 * Exécute la maintenance
 */
export async function runMaintenance(): Promise<MaintenanceEvent> {
  const beforeStats = { ...state.stats };
  const affectedMemories: string[] = [];

  // 1. Appliquer la décroissance
  for (const memory of state.memories.values()) {
    if (memory.decayRate > 0) {
      const hoursSinceAccess = (Date.now() - memory.accessedAt) / (60 * 60 * 1000);
      const decay = hoursSinceAccess * memory.decayRate;
      memory.importanceScore = Math.max(0, memory.importanceScore - decay);
      memory.importance = getImportanceLevel(memory.importanceScore);
    }
  }

  // 2. Promouvoir/archiver selon les politiques
  for (const memory of state.memories.values()) {
    const policy = RETENTION_POLICIES[memory.tier];
    const age = Date.now() - memory.createdAt;

    if (age > policy.maxAge) {
      affectedMemories.push(memory.id);

      switch (policy.onExpiry) {
        case 'promote':
          if (policy.promotionTier) {
            memory.tier = policy.promotionTier;
            memory.decayRate = RETENTION_POLICIES[policy.promotionTier].importanceDecay;
          }
          break;
        case 'archive':
          memory.tier = 'archival';
          memory.isArchived = true;
          break;
        case 'delete':
          state.memories.delete(memory.id);
          break;
      }
    }
  }

  // 3. Vérifier les limites par tier
  for (const [tier, limit] of Object.entries(MEMORY_ENGINE_CONFIG.tierLimits)) {
    const tierMemories = Array.from(state.memories.values())
      .filter(m => m.tier === tier)
      .sort((a, b) => a.importanceScore - b.importanceScore);

    while (tierMemories.length > limit.maxMemories) {
      const toRemove = tierMemories.shift()!;
      affectedMemories.push(toRemove.id);

      // Archiver au lieu de supprimer
      if (tier !== 'archival') {
        toRemove.tier = 'archival';
        toRemove.isArchived = true;
      } else {
        state.memories.delete(toRemove.id);
      }
    }
  }

  updateStats();

  const event: MaintenanceEvent = {
    type: 'decay',
    timestamp: Date.now(),
    affectedMemories,
    beforeStats,
    afterStats: state.stats,
  };

  state.callbacks.onMaintenanceCompleted?.(event);

  return event;
}

/**
 * Démarre le timer de maintenance
 */
function startMaintenanceTimer(): void {
  state.maintenanceTimer = setInterval(
    () => runMaintenance(),
    MAINTENANCE_CONFIG.checkIntervalMs
  );
}

/**
 * Vérifie si maintenance nécessaire
 */
async function checkMaintenanceNeeded(tier: MemoryTier): Promise<void> {
  const tierMemories = Array.from(state.memories.values())
    .filter(m => m.tier === tier);

  const tierConfig = MEMORY_ENGINE_CONFIG.tierLimits[tier];
  const totalTokens = tierMemories.reduce((sum, m) => sum + m.metadata.tokenCount, 0);

  if (shouldRunMaintenance(
    { totalMemories: tierMemories.length, totalTokens },
    tierConfig
  )) {
    await runMaintenance();
  }
}

// ============================================================================
// SYNCHRONISATION BACKEND
// ============================================================================

/**
 * Synchronise avec le backend
 */
async function syncToBackend(force = false): Promise<void> {
  if (!SYNC_CONFIG.enabled && !force) return;
  if (state.pendingSync.length === 0) return;

  const batch = state.pendingSync.splice(0, SYNC_CONFIG.batchSize);

  try {
    await secureInvoke(MEMORY_COMMANDS.store, {
      memories: batch.map(m => ({
        id: m.id,
        tier: m.tier,
        contentType: m.contentType,
        importance: m.importanceScore,
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt,
        associations: m.associations,
      })),
    });
  } catch (error) {
    console.error('[MemoryEngine] Erreur sync backend:', error);
    // Remettre dans la file
    state.pendingSync.unshift(...batch);
  }
}

/**
 * Restaure depuis le backend
 */
async function restoreFromBackend(): Promise<number> {
  try {
    const response = await secureInvoke<{ memories: Memory[] }>(
      MEMORY_COMMANDS.retrieve,
      { limit: 10000 }
    );

    for (const memory of response.memories) {
      state.memories.set(memory.id, memory);
    }

    updateStats();
    return response.memories.length;
  } catch (error) {
    console.error('[MemoryEngine] Erreur restauration:', error);
    return 0;
  }
}

/**
 * Démarre le timer de sync
 */
function startSyncTimer(): void {
  state.syncTimer = setInterval(
    () => syncToBackend(),
    SYNC_CONFIG.intervalMs
  );
}

// ============================================================================
// STATISTIQUES
// ============================================================================

/**
 * Obtient les statistiques
 */
export function getStats(): MemoryStats {
  return { ...state.stats };
}

/**
 * Obtient l'état du Memory Engine
 */
export function getMemoryEngineState(): MemoryEngineState {
  return {
    isInitialized: state.isInitialized,
    isProcessing: false,
    isSyncing: state.pendingSync.length > 0,
    lastMaintenanceAt: 0,
    lastSyncAt: 0,
    stats: state.stats,
    activeContext: state.context ?? undefined,
    pendingOperations: state.pendingSync.length,
    errors: [],
  };
}

/**
 * Met à jour les statistiques
 */
function updateStats(): void {
  const byTier: Record<MemoryTier, number> = {
    instant: 0,
    short: 0,
    medium: 0,
    long: 0,
    persistent: 0,
    archival: 0,
  };

  const byContentType: Record<MemoryContentType, number> = {
    message: 0,
    context: 0,
    decision: 0,
    fact: 0,
    preference: 0,
    skill: 0,
    relationship: 0,
    emotion: 0,
    correction: 0,
    summary: 0,
  };

  let totalTokens = 0;
  let oldestAge = 0;

  for (const memory of state.memories.values()) {
    byTier[memory.tier]++;
    byContentType[memory.contentType]++;
    totalTokens += memory.metadata.tokenCount;
    oldestAge = Math.max(oldestAge, Date.now() - memory.createdAt);
  }

  state.stats = {
    totalMemories: state.memories.size,
    byTier,
    byContentType,
    totalTokens,
    totalBytes: totalTokens * 4, // Approximation
    averageAccessTime: 0,
    cacheHitRate: 0,
    fragmentationLevel: 0,
    oldestMemoryAge: oldestAge,
    recentCompressions: 0,
  };
}

/**
 * Crée des stats vides
 */
function createEmptyStats(): MemoryStats {
  return {
    totalMemories: 0,
    byTier: {
      instant: 0,
      short: 0,
      medium: 0,
      long: 0,
      persistent: 0,
      archival: 0,
    },
    byContentType: {
      message: 0,
      context: 0,
      decision: 0,
      fact: 0,
      preference: 0,
      skill: 0,
      relationship: 0,
      emotion: 0,
      correction: 0,
      summary: 0,
    },
    totalTokens: 0,
    totalBytes: 0,
    averageAccessTime: 0,
    cacheHitRate: 0,
    fragmentationLevel: 0,
    oldestMemoryAge: 0,
    recentCompressions: 0,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function generateMemoryId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateContextId(): string {
  return `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateSlotId(): string {
  return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateSummaryId(): string {
  return `sum_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function estimateTokens(text: string): number {
  // Approximation: ~4 caractères par token
  return Math.ceil(text.length / 4);
}

function extractMetadata(content: string, source: MemorySource): MemoryMetadata {
  return {
    source,
    sessionId: state.context?.sessionId ?? 'unknown',
    confidence: 0.8,
    topics: extractTopics(content),
    entities: [],
    keywords: extractKeywords(content),
    language: 'fr',
    tokenCount: estimateTokens(content),
    originalLength: content.length,
  };
}

function extractTopics(content: string): string[] {
  const topics: string[] = [];
  const lower = content.toLowerCase();

  const topicKeywords: Record<string, string[]> = {
    développement: ['code', 'développ', 'program', 'fonction', 'variable'],
    architecture: ['architectur', 'structure', 'module', 'couche', 'layer'],
    design: ['design', 'ui', 'interface', 'style', 'couleur'],
    audio: ['audio', 'son', 'voix', 'tts', 'speech'],
    performance: ['performance', 'optim', 'rapide', 'lent', 'cache'],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      topics.push(topic);
    }
  }

  return topics;
}

function extractKeywords(content: string): string[] {
  // Simple extraction de mots-clés
  const words = content.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4)
    .slice(0, 10);
  return [...new Set(words)];
}

function extractImportanceModifiers(
  content: string,
  contentType?: MemoryContentType
): string[] {
  const modifiers: string[] = [];
  const lower = content.toLowerCase();

  if (lower.includes('important') || lower.includes('critique')) {
    modifiers.push('critical_topic');
  }
  if (content.length > 500) {
    modifiers.push('long_content');
  }
  if (contentType === 'correction') {
    modifiers.push('correction');
  }
  if (contentType === 'decision') {
    modifiers.push('decision_made');
  }

  return modifiers;
}

function matchesFilters(memory: Memory, query: MemorySearchQuery): boolean {
  if (query.tiers && !query.tiers.includes(memory.tier)) {
    return false;
  }
  if (query.contentTypes && !query.contentTypes.includes(memory.contentType)) {
    return false;
  }
  if (query.importanceMin && memory.importanceScore < query.importanceMin) {
    return false;
  }
  if (query.timeRange) {
    if (query.timeRange.start && memory.createdAt < query.timeRange.start) {
      return false;
    }
    if (query.timeRange.end && memory.createdAt > query.timeRange.end) {
      return false;
    }
  }
  if (query.sessionId && memory.metadata.sessionId !== query.sessionId) {
    return false;
  }
  if (!query.includeArchived && memory.isArchived) {
    return false;
  }

  return true;
}

function calculateRelevanceScore(memory: Memory, query: MemorySearchQuery): number {
  let score = 0;

  // Score textuel
  if (query.text) {
    const lower = memory.content.toLowerCase();
    const queryLower = query.text.toLowerCase();

    if (lower.includes(queryLower)) {
      score += SEARCH_CONFIG.weights.textMatch;
    } else {
      // Score partiel pour mots individuels
      const queryWords = queryLower.split(/\s+/);
      const matchedWords = queryWords.filter(w => lower.includes(w));
      score += (matchedWords.length / queryWords.length) * SEARCH_CONFIG.weights.textMatch * 0.5;
    }
  }

  // Score de récence
  const ageHours = (Date.now() - memory.createdAt) / (60 * 60 * 1000);
  const recencyScore = Math.exp(-ageHours / 24); // Décroissance exponentielle
  score += recencyScore * SEARCH_CONFIG.weights.recency;

  // Score d'importance
  score += (memory.importanceScore / 100) * SEARCH_CONFIG.weights.importance;

  return Math.min(1, score);
}

// ============================================================================
// EXPORTS
// ============================================================================

export const MemoryEngineService = {
  // Lifecycle
  initialize: initializeMemoryEngine,
  shutdown: shutdownMemoryEngine,

  // CRUD
  store: storeMemory,
  get: getMemory,
  update: updateMemory,
  delete: deleteMemory,

  // Search
  search: searchMemories,
  searchSemantic,

  // Context
  getOrCreateContext,
  addMessage: addMessageToContext,
  addToWorkingMemory,
  tickWorkingMemory,
  saveContext,
  restoreContext,
  clearContext,

  // Compression
  compress: compressMemories,

  // Maintenance
  runMaintenance,

  // Stats
  getStats,
  getState: getMemoryEngineState,
};

export default MemoryEngineService;

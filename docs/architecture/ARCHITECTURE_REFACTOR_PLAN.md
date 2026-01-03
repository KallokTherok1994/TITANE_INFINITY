# TITANE∞ Plan de Refactor — 14 → 9 Composants

> **Document généré le:** 2025-12-08
> **Version:** v20.0Ω
> **Statut:** Plan d'implémentation détaillé

---

## 📋 Vue d'Ensemble du Refactor

### Objectif
Consolider l'architecture de 14+ composants vers 9 composants principaux, réduisant les interactions de 91 → 36 (-60%).

### Stratégie
- **Refactor progressif** : chaque étape reste buildable
- **Backward compatibility** : redirections temporaires
- **Tests first** : couverture avant modification
- **Documentation continue** : mise à jour synchrone

---

## 🔄 Phase 1: CoherenceEngine (Fusion #2 + Nexus)

### 1.1 Fichiers à Créer

```
src/engines/coherence/
├── CoherenceEngine.ts           # Facade principale
├── index.ts                     # Exports
├── types.ts                     # Interfaces
├── validation/
│   ├── coherenceValidator.ts    # Ex-Singularity Kernel logic
│   └── stateValidator.ts        # Validation état système
├── coordination/
│   ├── taskPrioritizer.ts       # Priorisation tâches
│   └── engineCoordinator.ts     # Coordination inter-moteurs
├── bus/
│   ├── EventBus.ts              # Migré de src/os/bus/
│   └── MessageBus.ts            # Migré de src/os/bus/
└── registry/
    ├── EngineRegistry.ts        # Migré de src/os/registry/
    └── ServiceRegistry.ts       # Migré de src/os/registry/
```

### 1.2 Fichiers à Modifier

| Fichier | Action | Détails |
|---------|--------|---------|
| `src/services/ai/singularityKernel.ts` | Déprécier | Ajouter `// @deprecated Use CoherenceEngine` |
| `src/os/TitaneOS.ts` | Modifier | Déléguer vers CoherenceEngine |
| `src/os/bus/EventBus.ts` | Migrer | Copier vers coherence/bus/ |
| `src/os/bus/MessageBus.ts` | Migrer | Copier vers coherence/bus/ |
| `src/os/registry/EngineRegistry.ts` | Migrer | Copier vers coherence/registry/ |
| `src/os/registry/ServiceRegistry.ts` | Migrer | Copier vers coherence/registry/ |
| `src/services/ai/orchestrator.ts` | Modifier | Importer CoherenceEngine |

### 1.3 Tâches Détaillées

```
□ 1.1.1  Créer dossier src/engines/coherence/
□ 1.1.2  Créer types.ts avec interfaces CoherenceEngine
□ 1.1.3  Migrer EventBus vers coherence/bus/ (copie)
□ 1.1.4  Migrer MessageBus vers coherence/bus/ (copie)
□ 1.1.5  Migrer EngineRegistry vers coherence/registry/
□ 1.1.6  Migrer ServiceRegistry vers coherence/registry/
□ 1.1.7  Extraire logique validation de singularityKernel
□ 1.1.8  Créer coherenceValidator.ts
□ 1.1.9  Créer taskPrioritizer.ts (ex-Nexus logic)
□ 1.1.10 Créer engineCoordinator.ts
□ 1.1.11 Créer CoherenceEngine.ts facade
□ 1.1.12 Créer index.ts avec exports
□ 1.1.13 Ajouter @deprecated dans singularityKernel.ts
□ 1.1.14 Modifier TitaneOS.ts pour utiliser CoherenceEngine
□ 1.1.15 Modifier orchestrator.ts pour utiliser CoherenceEngine
□ 1.1.16 Écrire tests unitaires CoherenceEngine
□ 1.1.17 Écrire tests intégration
□ 1.1.18 Vérifier build
□ 1.1.19 Mettre à jour documentation
```

### 1.4 Code Squelette

```typescript
// src/engines/coherence/CoherenceEngine.ts

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
  Handler,
} from './types';

/**
 * CoherenceEngine - Fusion de Moteur #2 (Cohérence) + Nexus Engine
 *
 * Responsabilités:
 * - Validation cohérence globale système
 * - Coordination inter-moteurs
 * - Priorisation tâches/requêtes
 * - EventBus et MessageBus centralisés
 * - Gestion registres (engines, services)
 * - Lifecycle management unifié
 */
class CoherenceEngineImpl {
  private validator: CoherenceValidator;
  private prioritizer: TaskPrioritizer;
  private coordinator: EngineCoordinator;

  // Bus (intégrés)
  public readonly events: EventBus;
  public readonly messages: MessageBus;

  // Registries (intégrés)
  public readonly engines: EngineRegistry;
  public readonly services: ServiceRegistry;

  constructor() {
    this.events = new EventBus();
    this.messages = new MessageBus();
    this.engines = new EngineRegistry();
    this.services = new ServiceRegistry();
    this.validator = new CoherenceValidator();
    this.prioritizer = new TaskPrioritizer();
    this.coordinator = new EngineCoordinator(this.engines);
  }

  // ═══════════════════════════════════════════════════════════
  // COHÉRENCE (ex-Singularity Kernel)
  // ═══════════════════════════════════════════════════════════

  validate(state: SystemState): ValidationResult {
    return this.validator.validate(state);
  }

  enforceCoherence(context: unknown): void {
    this.validator.enforce(context);
    this.events.emit({ type: 'coherence:enforced', data: context });
  }

  // ═══════════════════════════════════════════════════════════
  // COORDINATION (ex-Nexus Engine)
  // ═══════════════════════════════════════════════════════════

  prioritize(tasks: Task[]): PrioritizedTasks {
    return this.prioritizer.prioritize(tasks);
  }

  coordinate(engines: Engine[]): CoordinationResult {
    return this.coordinator.coordinate(engines);
  }

  // ═══════════════════════════════════════════════════════════
  // BUS (intégré)
  // ═══════════════════════════════════════════════════════════

  emit(event: SystemEvent): void {
    this.events.emit(event);
  }

  subscribe(type: EventType, handler: Handler): () => void {
    return this.events.subscribe(type, handler);
  }

  // ═══════════════════════════════════════════════════════════
  // REGISTRY (intégré)
  // ═══════════════════════════════════════════════════════════

  registerEngine(engine: Engine): void {
    this.engines.register(engine);
  }

  getEngine<T extends Engine>(name: string): T | undefined {
    return this.engines.get<T>(name);
  }
}

// Singleton export
export const coherenceEngine = new CoherenceEngineImpl();
export type CoherenceEngine = typeof coherenceEngine;
```

---

## 🔄 Phase 2: UnifiedMemory (Fusion #5 + Memory Core)

### 2.1 Fichiers à Créer

```
src/engines/memory/
├── UnifiedMemoryEngine.ts       # Facade principale
├── index.ts                     # Exports
├── types.ts                     # Interfaces
├── frontend/
│   ├── memoryCache.ts           # Cache local rapide
│   ├── syncManager.ts           # Sync avec backend
│   └── queryBuilder.ts          # Construction requêtes
├── bridge/
│   └── tauriBridge.ts           # IPC avec Rust backend
└── tiers/
    ├── stm.ts                   # Short-term memory
    ├── mtm.ts                   # Medium-term memory
    └── ltm.ts                   # Long-term memory
```

### 2.2 Fichiers à Modifier

| Fichier | Action | Détails |
|---------|--------|---------|
| `src/core/services/unifiedMemory.ts` | Déprécier | Rediriger vers nouveau module |
| `src-tauri/src/memory_os/api.rs` | Modifier | Ajouter endpoints unifiés |
| `src/services/ai/orchestrator.ts` | Modifier | Importer UnifiedMemory |
| `src/services/ai/chatEngine.ts` | Modifier | Utiliser UnifiedMemory |

### 2.3 Tâches Détaillées

```
□ 2.1.1  Créer dossier src/engines/memory/
□ 2.1.2  Créer types.ts avec interfaces
□ 2.1.3  Créer memoryCache.ts
□ 2.1.4  Créer syncManager.ts
□ 2.1.5  Créer tauriBridge.ts
□ 2.1.6  Créer stm.ts, mtm.ts, ltm.ts facades
□ 2.1.7  Créer UnifiedMemoryEngine.ts facade
□ 2.1.8  Créer index.ts avec exports
□ 2.1.9  Modifier api.rs pour nouveaux endpoints
□ 2.1.10 Ajouter @deprecated dans unifiedMemory.ts ancien
□ 2.1.11 Modifier orchestrator.ts
□ 2.1.12 Modifier chatEngine.ts
□ 2.1.13 Écrire tests unitaires
□ 2.1.14 Écrire tests intégration Frontend↔Backend
□ 2.1.15 Vérifier build
□ 2.1.16 Mettre à jour documentation
```

### 2.4 Code Squelette

```typescript
// src/engines/memory/UnifiedMemoryEngine.ts

import { invoke } from '@tauri-apps/api/core';
import { MemoryCache } from './frontend/memoryCache';
import { SyncManager } from './frontend/syncManager';
import type {
  MemoryEntry,
  StoreOptions,
  RecallOptions,
  SearchResult,
  MemoryStats,
  CleanupResult,
} from './types';

/**
 * UnifiedMemory - Fusion de Moteur #5 + Memory Core + Singularity Memory OS
 *
 * Responsabilités:
 * - API mémoire unifiée Frontend ↔ Backend
 * - Hiérarchie STM → MTM → LTM transparente
 * - Recherche sémantique vectorielle
 * - Promotion automatique basée sur importance
 * - Consolidation et garbage collection
 * - Oubli intelligent (forgetting engine)
 */
class UnifiedMemoryImpl {
  private cache: MemoryCache;
  private sync: SyncManager;
  private initialized = false;

  constructor() {
    this.cache = new MemoryCache();
    this.sync = new SyncManager();
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.sync.connect();
    this.initialized = true;
  }

  // ═══════════════════════════════════════════════════════════
  // STOCKAGE
  // ═══════════════════════════════════════════════════════════

  async store(entry: MemoryEntry, options?: StoreOptions): Promise<string> {
    // Cache local first
    const id = this.cache.store(entry);

    // Sync to backend (async)
    try {
      await invoke('memory_store', {
        entry: { ...entry, id },
        tier: options?.tier ?? 'stm'
      });
    } catch (error) {
      console.warn('[UnifiedMemory] Backend sync failed, cached locally', error);
    }

    return id;
  }

  // ═══════════════════════════════════════════════════════════
  // RÉCUPÉRATION
  // ═══════════════════════════════════════════════════════════

  async recall(query: string, options?: RecallOptions): Promise<MemoryEntry[]> {
    // Try cache first
    const cached = this.cache.query(query);
    if (cached.length > 0 && !options?.forceBackend) {
      return cached;
    }

    // Fallback to backend
    try {
      return await invoke<MemoryEntry[]>('memory_recall', {
        query,
        limit: options?.limit ?? 10,
        tiers: options?.tiers ?? ['stm', 'mtm', 'ltm']
      });
    } catch {
      return cached; // Return cache on error
    }
  }

  async semanticSearch(embedding: number[], k = 5): Promise<SearchResult[]> {
    return invoke<SearchResult[]>('memory_semantic_search', {
      embedding,
      k
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GESTION LIFECYCLE
  // ═══════════════════════════════════════════════════════════

  async promote(id: string, targetTier: 'mtm' | 'ltm'): Promise<void> {
    await invoke('memory_promote', { id, targetTier });
    this.cache.invalidate(id);
  }

  async forget(id: string): Promise<void> {
    await invoke('memory_forget', { id });
    this.cache.remove(id);
  }

  async cleanup(): Promise<CleanupResult> {
    this.cache.cleanup();
    return invoke<CleanupResult>('memory_cleanup');
  }

  // ═══════════════════════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════════════════════

  async getStats(): Promise<MemoryStats> {
    const backendStats = await invoke<MemoryStats>('memory_stats');
    return {
      ...backendStats,
      cache: {
        size: this.cache.size,
        hitRate: this.cache.hitRate
      }
    };
  }
}

// Singleton export
export const unifiedMemory = new UnifiedMemoryImpl();
export type UnifiedMemory = typeof unifiedMemory;
```

---

## 🔄 Phase 3: SystemHealth (Fusion Helios + Sentinel)

### 3.1 Fichiers à Créer

```
src/engines/health/
├── SystemHealthEngine.ts        # Facade principale
├── index.ts                     # Exports
├── types.ts                     # Interfaces
├── monitoring/
│   ├── metricsCollector.ts      # Ex-Metrics Engine
│   ├── latencyTracker.ts        # Tracking latence
│   └── providerHealth.ts        # Santé providers
├── healing/
│   ├── autoHealer.ts            # Ex-Auto-Heal
│   ├── recoveryStrategies.ts    # Stratégies récupération
│   └── healingHistory.ts        # Historique healing
├── security/
│   ├── requestValidator.ts      # Ex-Sentinel
│   └── guardrails.ts            # Garde-fous
└── balance/
    └── loadBalancer.ts          # Ex-Harmonia
```

### 3.2 Fichiers à Modifier

| Fichier | Action | Détails |
|---------|--------|---------|
| `src/services/ai/metricsEngine.ts` | Déprécier | Rediriger vers SystemHealth |
| `src/services/ai/autoHealEngine.ts` | Déprécier | Rediriger vers SystemHealth |
| `src/services/ai/orchestrator.ts` | Modifier | Importer SystemHealth |

### 3.3 Tâches Détaillées

```
□ 3.1.1  Créer dossier src/engines/health/
□ 3.1.2  Créer types.ts avec interfaces
□ 3.1.3  Créer metricsCollector.ts
□ 3.1.4  Créer latencyTracker.ts
□ 3.1.5  Créer providerHealth.ts
□ 3.1.6  Créer autoHealer.ts
□ 3.1.7  Créer recoveryStrategies.ts
□ 3.1.8  Créer healingHistory.ts
□ 3.1.9  Créer requestValidator.ts
□ 3.1.10 Créer guardrails.ts
□ 3.1.11 Créer loadBalancer.ts
□ 3.1.12 Créer SystemHealthEngine.ts facade
□ 3.1.13 Créer index.ts avec exports
□ 3.1.14 Ajouter @deprecated dans metricsEngine.ts
□ 3.1.15 Ajouter @deprecated dans autoHealEngine.ts
□ 3.1.16 Modifier orchestrator.ts
□ 3.1.17 Écrire tests unitaires
□ 3.1.18 Écrire tests intégration
□ 3.1.19 Vérifier build
□ 3.1.20 Mettre à jour documentation
```

### 3.4 Code Squelette

```typescript
// src/engines/health/SystemHealthEngine.ts

import { MetricsCollector } from './monitoring/metricsCollector';
import { LatencyTracker } from './monitoring/latencyTracker';
import { ProviderHealthMonitor } from './monitoring/providerHealth';
import { AutoHealer } from './healing/autoHealer';
import { HealingHistory } from './healing/healingHistory';
import { RequestValidator } from './security/requestValidator';
import { Guardrails } from './security/guardrails';
import { LoadBalancer } from './balance/loadBalancer';
import type {
  SystemMetrics,
  ProviderHealth,
  AnomalyHandler,
  Alert,
  HealingContext,
  HealingResult,
  HealingEvent,
  SecurityResult,
  LoadBalanceState,
} from './types';

/**
 * SystemHealth - Fusion de Helios + Sentinel + Harmonia
 *
 * Responsabilités:
 * - Monitoring CPU/RAM/process
 * - Instrumentation performance
 * - Scoring santé providers
 * - Détection anomalies et alertes
 * - Auto-healing et recovery
 * - Garde-fous sécurité
 * - Équilibrage ressources
 */
class SystemHealthImpl {
  private metrics: MetricsCollector;
  private latency: LatencyTracker;
  private providers: ProviderHealthMonitor;
  private healer: AutoHealer;
  private history: HealingHistory;
  private validator: RequestValidator;
  private guardrails: Guardrails;
  private balancer: LoadBalancer;

  private anomalyHandlers: Set<AnomalyHandler> = new Set();

  constructor() {
    this.metrics = new MetricsCollector();
    this.latency = new LatencyTracker();
    this.providers = new ProviderHealthMonitor();
    this.healer = new AutoHealer();
    this.history = new HealingHistory();
    this.validator = new RequestValidator();
    this.guardrails = new Guardrails();
    this.balancer = new LoadBalancer();

    // Setup anomaly detection
    this.metrics.onAnomaly(this.handleAnomaly.bind(this));
  }

  // ═══════════════════════════════════════════════════════════
  // MONITORING
  // ═══════════════════════════════════════════════════════════

  getMetrics(): SystemMetrics {
    return {
      cpu: this.metrics.getCpu(),
      memory: this.metrics.getMemory(),
      providers: this.providers.getAll(),
      latency: this.latency.getPercentiles(),
      errors: this.metrics.getErrors()
    };
  }

  getProviderHealth(id: string): ProviderHealth {
    return this.providers.get(id);
  }

  trackLatency(operation: string, ms: number): void {
    this.latency.track(operation, ms);
  }

  // ═══════════════════════════════════════════════════════════
  // ALERTES
  // ═══════════════════════════════════════════════════════════

  onAnomaly(handler: AnomalyHandler): () => void {
    this.anomalyHandlers.add(handler);
    return () => this.anomalyHandlers.delete(handler);
  }

  private handleAnomaly(anomaly: unknown): void {
    this.anomalyHandlers.forEach(h => h(anomaly));
  }

  getActiveAlerts(): Alert[] {
    return this.metrics.getActiveAlerts();
  }

  // ═══════════════════════════════════════════════════════════
  // AUTO-HEALING
  // ═══════════════════════════════════════════════════════════

  async triggerHealing(context: HealingContext): Promise<HealingResult> {
    const result = await this.healer.heal(context);
    this.history.record(result);
    return result;
  }

  getHealingHistory(): HealingEvent[] {
    return this.history.getRecent();
  }

  // ═══════════════════════════════════════════════════════════
  // SÉCURITÉ (ex-Sentinel)
  // ═══════════════════════════════════════════════════════════

  validateRequest(req: unknown): SecurityResult {
    return this.validator.validate(req);
  }

  applyGuardrails<T>(response: T): T {
    return this.guardrails.apply(response);
  }

  // ═══════════════════════════════════════════════════════════
  // ÉQUILIBRE (ex-Harmonia)
  // ═══════════════════════════════════════════════════════════

  getLoadBalance(): LoadBalanceState {
    return this.balancer.getState();
  }

  async rebalance(): Promise<void> {
    await this.balancer.rebalance();
  }
}

// Singleton export
export const systemHealth = new SystemHealthImpl();
export type SystemHealth = typeof systemHealth;
```

---

## 🔄 Phase 4: ConversationOS Clarification

### 4.1 Tâches

```
□ 4.1.1  Documenter séparation OMEGA vs ConversationOS
□ 4.1.2  Renommer chatEngine.ts → ConversationOS.ts
□ 4.1.3  Retirer logique provider de ConversationOS
□ 4.1.4  Ajouter routing explicite vers OMEGA
□ 4.1.5  Mettre à jour imports
□ 4.1.6  Vérifier build
```

---

## 🔄 Phase 5: Cleanup et Finalisation

### 5.1 Fichiers à Supprimer/Déprécier

| Fichier | Action |
|---------|--------|
| `src/os/bus/EventBus.ts` | Déprécier → Redirect CoherenceEngine |
| `src/os/bus/MessageBus.ts` | Déprécier → Redirect CoherenceEngine |
| `src/os/registry/EngineRegistry.ts` | Déprécier → Redirect CoherenceEngine |
| `src/os/registry/ServiceRegistry.ts` | Déprécier → Redirect CoherenceEngine |
| `src/core/services/unifiedMemory.ts` | Déprécier → Redirect UnifiedMemory |
| `src/services/ai/metricsEngine.ts` | Déprécier → Redirect SystemHealth |
| `src/services/ai/autoHealEngine.ts` | Déprécier → Redirect SystemHealth |

### 5.2 Pattern de Dépréciation

```typescript
/**
 * @deprecated This module is deprecated. Use CoherenceEngine instead.
 *
 * Migration:
 * ```typescript
 * // Before
 * import { eventBus } from '@/os/bus/EventBus';
 * eventBus.emit(event);
 *
 * // After
 * import { coherenceEngine } from '@/engines/coherence';
 * coherenceEngine.emit(event);
 * ```
 *
 * This file will be removed in v21.0.
 */

// Re-export from new location for backward compatibility
export { coherenceEngine as eventBus } from '@/engines/coherence';
```

---

## 📋 Checklist de Validation

### Avant Chaque Commit

```
□ TypeScript compile sans erreur (pnpm run build)
□ ESLint passe (pnpm run lint)
□ Tests unitaires passent
□ Aucune régression fonctionnelle
□ Documentation mise à jour
```

### Avant Release

```
□ Tous les tests d'intégration passent
□ Build Vite réussit
□ Build Tauri réussit
□ Scénarios manuels validés:
  □ Chat texte complet
  □ Chat vocal (si disponible)
  □ Mémoire persist après restart
  □ Auto-heal sur erreur provider
  □ Metrics affichés dans DevTools
□ Documentation architecture à jour
□ CHANGELOG mis à jour
```

### Scénarios de Test Manuel

```
1. FLUX CONVERSATION COMPLET
   - Ouvrir app
   - Envoyer message texte
   - Vérifier réponse
   - Vérifier stockage mémoire
   - Fermer/rouvrir, vérifier rappel

2. TEST FALLBACK PROVIDER
   - Désactiver provider primaire
   - Envoyer message
   - Vérifier fallback automatique
   - Vérifier healing event dans logs

3. TEST PERFORMANCE
   - Envoyer 10 messages rapides
   - Vérifier latences <500ms
   - Vérifier mémoire stable

4. TEST COHERENCE
   - Envoyer messages contradictoires
   - Vérifier cohérence réponses
   - Vérifier logs CoherenceEngine
```

---

## 📅 Timeline Estimée

| Phase | Durée | Priorité |
|-------|-------|----------|
| Phase 1: CoherenceEngine | 2-3 jours | P0 |
| Phase 2: UnifiedMemory | 2-3 jours | P0 |
| Phase 3: SystemHealth | 2 jours | P1 |
| Phase 4: ConversationOS | 0.5 jour | P2 |
| Phase 5: Cleanup | 1 jour | P2 |
| **Total** | **8-10 jours** | |

---

## ⚠️ Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Régression OMEGA | Élevé | Tests intégration exhaustifs |
| Perte mémoire migration | Élevé | Backup avant migration |
| Breaking changes API | Moyen | Shims de compatibilité |
| Performance dégradée | Moyen | Benchmarks avant/après |

---

*Document généré dans le cadre du SUPER PROMPT #2 — Plan de Refactor TITANE∞*

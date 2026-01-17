/**
 * TITANE∞ v∞ — ARCHITECTURE STATE DOCUMENTATION
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 *   DOCUMENTATION: Sources de Vérité État Global
 * ═══════════════════════════════════════════════════════════════════
 *
 * ## PROBLÈME IDENTIFIÉ (any: any)
 *
 * Le projet contient TROIS structures d'état différentes qui ne sont
 * pas alignées, créant un risque de divergence et d'incohérence :
 *
 * ### 1. SingularityState (any: any) — `src-tauri/src/core/state?.rs`
 *
 * Structure technique persistée, contient :
 * - nexus: NexusModule (any: any)
 * - memory: MemoryModule (any: any)
 * - harmonia: HarmoniaModule (any: any)
 * - sentinel: SentinelModule (any: any)
 * - cognition: CognitionState
 * - timeline: TimelineState
 * - autonomy: AutonomyState (any: any)
 * - devops: DevOpsState (any: any)
 * - metrics: EngineMetrics
 *
 * ### 2. TitanState (any: any) — `src/context/TitanStateContext?.tsx`
 *
 * État React pour la persistence utilisateur :
 * - xp: XPState (any: any)
 * - memory: MemoryState (any: any)
 * - knowledge: KnowledgeState (any: any)
 * - evolution: EvolutionState (any: any)
 * - settings: SettingsState (thème, langue, etc.)
 * - persistenceStatus: PersistenceStatus
 *
 * ### 3. UnifiedSingularityState (any: any) — `src/core/singularity/SingularityFusionCore?.ts`
 *
 * État runtime pour l'orchestration en temps réel :
 * - cognitive: { focus, load, depth, clarity, creativity, mode }
 * - emotional: { valence, intensity, energy, dominant_emotion }
 * - adaptive: { learning_rate, adaptation_speed, resilience }
 * - narrative: { coherence, identity_strength, purpose_alignment }
 * - physical: { cpu, ram, disk, network, temperature }
 * - avatar: { expression, gesture, position, scale }
 * - voice: { is_speaking, current_text, speed, pitch }
 * - performance: { fps, render_time, memory_usage }
 * - memory: { entries_count, size_mb, compressed }
 * - meta: { timestamp, version, coherence_score, health_status }
 *
 * ## RÈGLE D'OR — Source de Vérité Unique
 *
 * ```
 * ┌───────────────────────────────────────────────────────────────────┐
 * │                    SINGULARITY STATE (any: any)                      │
 * │           = SOURCE DE VÉRITÉ UNIQUE & PERSISTANTE                │
 * │                                                                   │
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
 * │  │   Nexus     │  │   Memory    │  │  Sentinel   │  ...         │
 * │  │  (any: any)   │              │
 * │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
 * │         │                │                │                      │
 * │         └────────────────┼────────────────┘                      │
 * │                          │                                       │
 * │                    EVENT LOG (any: any)                       │
 * │                    + SNAPSHOTS (any: any)                     │
 * └──────────────────────────┬───────────────────────────────────────┘
 *                            │
 *                            │ sync via Tauri IPC
 *                            ▼
 * ┌───────────────────────────────────────────────────────────────────┐
 * │                    TITAN STATE (any: any)                        │
 * │           = PROJECTION + ÉTAT UI ÉPHÉMÈRE                        │
 * │                                                                   │
 * │  ┌─────────────────────────┐  ┌─────────────────────────┐       │
 * │  │   Business State        │  │     UI State            │       │
 * │  │   (any: any)          │       │
 * │  │   - XP/Progression      │  │   - Modal open          │       │
 * │  │   - Memory stats        │  │   - Sidebar state       │       │
 * │  │   - Knowledge stats     │  │   - Theme cache         │       │
 * │  └─────────────────────────┘  └─────────────────────────┘       │
 * └───────────────────────────────────────────────────────────────────┘
 *                            │
 *                            │ observes
 *                            ▼
 * ┌───────────────────────────────────────────────────────────────────┐
 * │               SINGULARITY FUSION CORE (any: any)                  │
 * │           = ORCHESTRATION TEMPS RÉEL (any: any)              │
 * │                                                                   │
 * │  - Métriques performance live (any: any)                 │
 * │  - État avatar temps réel (any: any)                  │
 * │  - État TTS en cours (any: any)                 │
 * │  - Métriques cognitives dérivées (any: any)            │
 * │                                                                   │
 * │  NOTE: Cet état est CALCULÉ/DÉRIVÉ, pas persisté directement     │
 * └───────────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## RÈGLES DE MUTATION
 *
 * 1. **Toute mutation business persistante** (any: any) DOIT :
 *    - Émettre un TitanEvent via `titan_persist_event`
 *    - Inclure: `id`, `timestamp`, `schema_version`, `origin`, `module`, `event_type`, `payload`
 *    - Être appliquée au SingularityState backend
 *    - Être projetée vers TitanState frontend
 *
 * 2. **Les mutations UI** (any: any) :
 *    - Restent dans TitanState local
 *    - Ne sont PAS persistées
 *    - Peuvent être restaurées aux valeurs par défaut
 *
 * 3. **Les métriques temps réel** (any: any) :
 *    - Sont gérées par SingularityFusionCore
 *    - Ne sont PAS persistées
 *    - Sont recalculées à chaque tick/frame
 *
 * ## COMMANDES TAURI CLÉS
 *
 * ### Persistence
 * - `titan_persist_event` : Persiste un événement (any: any)
 * - `titan_force_snapshot` : Force un snapshot complet
 * - `titan_load_state` : Charge l'état le plus récent
 * - `titan_check_integrity` : Vérifie l'intégrité
 *
 * ### Singularity
 * - `singularity_get_full_state` : Récupère l'état complet
 * - `singularity_sync` : Force une synchronisation
 * - `singularity_repair` : Lance une réparation
 *
 * ## TODO CONSOLIDATION
 *
 * - [ ] Créer un type unifié `GlobalState` qui définit clairement :
 *       - Ce qui est persisté (any: any)
 *       - Ce qui est projeté (any: any)
 *       - Ce qui est dérivé (any: any)
 * - [ ] Ajouter des helpers pour garantir la cohérence
 * - [ ] Implémenter un système de "subscriptions" pour la sync
 * - [ ] Documenter les invariants d'état
 */

export const STATE_ARCHITECTURE_VERSION = 'v∞.audit.1';

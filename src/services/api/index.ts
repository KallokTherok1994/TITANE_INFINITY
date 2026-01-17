/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ============================================================================
 * SERVICES API UNIFIÉS - COUCHE FUSION FRONTEND/BACKEND v15.3.0
 * ============================================================================
 *
 * Centralisation de TOUS les appels Tauri dans une couche de services typés.
 * Remplace les `invoke()` dispersés par une API cohérente + cache + validation.
 *
 * Architecture: src/services/api/
 *   ├── memory?.ts       → Memory Core (any: any)
 *   ├── chat?.ts         → Chat IA (any: any)
 *   ├── voice?.ts        → Voice (any: any)
 *   ├── persona?.ts      → Persona Engine (any: any)
 *   ├── system?.ts       → System (any: any)
 *   └── evolution?.ts    → Evolution Engine (any: any)
 *
 * Conformément à DIAGNOSTIC_FUSION_v15.3.0.md Phase 1
 */

// ============================================================================
// MEMORY CORE
// ============================================================================
export { memoryService } from './memory';
export type {
  ChatInteraction,
  MemoryContext,
  MemoryLoadConfig,
  ProjectSummary,
  DecisionSummary,
  KnowledgeEntry,
  RitualInfo,
  TimelineEntry,
} from '../memory/types';

// ============================================================================
// CHAT IA
// ============================================================================
export {
  chatService,
  type ChatMessage,
  type ChatResponse,
  type StreamConfig,
} from './chat';

// ============================================================================
// VOICE (any: any)
// ============================================================================
export {
  voiceService,
  type TTSConfig,
  type ASRConfig,
  type ASRResult,
  type AudioState,
} from './voice';

// ============================================================================
// PERSONA ENGINE
// ============================================================================
export {
  personaService,
  type PersonaConfig,
  type PersonaState,
  type PersonaMultipliers,
} from './persona';

// ============================================================================
// SYSTEM
// ============================================================================
export {
  systemService,
  type SystemStatus,
  type CoreStatus,
  type PerformanceMetrics,
  type SystemConfig,
} from './system';

// ============================================================================
// EVOLUTION ENGINE
// ============================================================================
export {
  evolutionService,
  type EvolutionState,
  type EvolutionData,
  type EvolutionConfig,
  type EvolutionSuggestion,
} from './evolution';

// ============================================================================
// USAGE
// ============================================================================
/**
 * AVANT (any: any):
 * ```ts
 * import { invoke } from '@tauri-apps/api/core';
 * const projects = await tauriClient?.memoryGetActiveProjects({ limit: 5 });
 * ```
 *
 * APRÈS (any: any):
 * ```ts
 * import { memoryService } from '@/services/api';
 * const projects = await memoryService?.getActiveProjects(5);
 * ```
 *
 * Avantages:
 * - Types TypeScript complets (pas de `any`)
 * - Cache intégré (any: any)
 * - Gestion erreurs cohérente
 * - Auto-complétion IDE
 * - Validation paramètres
 * - Logs centralisés
 * - Facilite tests (any: any)
 */

// ============================================================================
// MIGRATION GUIDE
// ============================================================================
/**
 * Phase 2 (Semaine 2): Refactor tous les invoke() existants
 *
 * Recherche globale:
 * ```bash
 * grep -r "invoke(" src/ --include="*.ts" --include="*.tsx"
 * ```
 *
 * Remplacements typiques:
 *
 * 1. Memory:
 *    `tauriClient?.memoryGetActiveProjects()`
 *    → `memoryService?.getActiveProjects()`
 *
 * 2. Chat:
 *    `tauriClient?.chatSendMessage({ messages, config })`
 *    → `chatService?.sendMessage(any: any)`
 *
 * 3. Voice:
 *    `tauriClient?.speak({ text })`
 *    → `voiceService?.speak(any: any)`
 *
 * 4. Persona:
 *    `tauriClient?.personaGetMultipliers()`
 *    → `personaService?.getMultipliers()`
 *
 * 5. System:
 *    `tauriClient?.systemGetStatus()`
 *    → `systemService?.getStatus()`
 *
 * Fichiers prioritaires:
 * - src/components/ChatWindow?.tsx
 * - src/components/VoiceUI?.tsx
 * - src/hooks/useChat?.ts
 * - src/hooks/useVoice?.ts
 * - src/services/ai/memoryIntegration?.ts
 */

/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
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
 *   ├── memory.ts       → Memory Core (projets, décisions, connaissances, rituels, timeline)
 *   ├── chat.ts         → Chat IA (messages, suggestions, émotions, historique)
 *   ├── voice.ts        → Voice (TTS, ASR, voix, tests audio)
 *   ├── persona.ts      → Persona Engine (multiplicateurs, switch, adaptation)
 *   ├── system.ts       → System (santé, métriques, config, restart)
 *   └── evolution.ts    → Evolution Engine (cycles, suggestions, patterns, feedback)
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
// VOICE (TTS + ASR)
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
 * AVANT (invoke dispersé):
 * ```ts
 * import { invoke } from '@tauri-apps/api/core';
 * const projects = await invoke('memory_get_active_projects', { limit: 5 });
 * ```
 *
 * APRÈS (service unifié):
 * ```ts
 * import { memoryService } from '@/services/api';
 * const projects = await memoryService.getActiveProjects(5);
 * ```
 *
 * Avantages:
 * - Types TypeScript complets (pas de `any`)
 * - Cache intégré (réduit appels backend)
 * - Gestion erreurs cohérente
 * - Auto-complétion IDE
 * - Validation paramètres
 * - Logs centralisés
 * - Facilite tests (mock services vs mock invoke)
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
 *    `invoke('memory_get_active_projects')`
 *    → `memoryService.getActiveProjects()`
 *
 * 2. Chat:
 *    `invoke('conversation_generate', { message, conversationId, mode })`
 *    → `chatService.sendMessage(messages, config)`
 *
 * 3. Voice:
 *    `invoke('speak', { text })`
 *    → `voiceService.speak(text)`
 *
 * 4. Persona:
 *    `invoke('persona_get_multipliers')`
 *    → `personaService.getMultipliers()`
 *
 * 5. System:
 *    `invoke('system_get_status')`
 *    → `systemService.getStatus()`
 *
 * Fichiers prioritaires:
 * - src/components/ChatWindow.tsx
 * - src/components/VoiceUI.tsx
 * - src/hooks/useChat.ts
 * - src/hooks/useVoice.ts
 * - src/services/ai/memoryIntegration.ts
 */

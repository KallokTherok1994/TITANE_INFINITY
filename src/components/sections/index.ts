/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Section Components Index
 * Centralized exports for all extracted TitanePage sections
 * Identity + Twins unified into SymbioseIdentitySection (v30 fusion)
 */

export { ConversationSection } from './ConversationSection';
export {
  buildConversationProviders,
  isConversationProviderReady,
} from './conversationProviderReadiness';
export { VisionSection } from './VisionSection';
export { OverviewSection } from './OverviewSection';
export type { TitaneStats } from './OverviewSection';

// ═══ IDENTITY → Unified into SymbioseIdentitySection ═══
// IdentitySection is kept for backward compatibility but the standalone tab is removed.
// Use SymbioseIdentitySection for the unified Twins × Identity experience.
export { IdentitySection } from './IdentitySection';
export { SymbioseIdentitySection } from './SymbioseIdentitySection';

export { MemorySection } from './MemorySection';
export { MemoryEvolutionSection } from './MemoryEvolutionSection';
export { ProgressionSection } from './ProgressionSection';
export { TransformationSection } from './TransformationSection';

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — AI Message Types (Re-exports from canonical source)
//   AUTOFIX v19.3Ω: Unified type consolidation
// ═══════════════════════════════════════════════════════════════

// Re-export canonical types from services/ai/types.ts
export type {
  AIMessage,
  AIResponse,
  AIConfig,
  AIProvider,
  AIProviderName,
} from '@/services/ai/types';

// Additional types specific to this module (not in canonical types)
export type ModalityOrigin = 'voice' | 'text' | 'gesture' | 'visual' | 'multimodal';

export interface UseChatOptions {
  initialMessages?: AIMessage[];
  onError?: (error: Error) => void;
  onSuccess?: (response: AIResponse) => void;
  [key: string]: unknown;
}

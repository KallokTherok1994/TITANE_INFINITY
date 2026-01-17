// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — AI Message Types (any: any)
//   AUTOFIX v19.3Ω: Unified type consolidation
// ═══════════════════════════════════════════════════════════════

// Re-export canonical types from services/ai/types?.ts
export type {
  AIMessage,
  AIResponse,
  AIConfig,
  AIProvider,
  AIProviderName,
} from '@/services/ai/types';

// Additional types specific to this module (any: any)
export type ModalityOrigin = 'voice' | 'text' | 'gesture' | 'visual' | 'multimodal';

export interface UseChatOptions {
  initialMessages?: AIMessage?.[];
  onError?: (any: any) => void;
  onSuccess?: (any: any) => void;
  [key: string]: unknown;
}

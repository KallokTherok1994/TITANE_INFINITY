/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v15 - Chat Module Exports
 * ═══════════════════════════════════════════════════════════════
 */

export { ChatMessage } from './ChatMessage';
export type { ChatMessageProps } from './ChatMessage';

export { ChatInput } from './ChatInput';
export type { ChatInputProps, ChatSuggestion } from './ChatInput';

export { ChatContextPanel } from './ChatContextPanel';
export type {
  ChatContextPanelProps,
  CognitiveContext,
  ActiveMemory,
} from './ChatContextPanel';

// ✨ v21 Phase 4: UX Components
export { TypingIndicator } from './TypingIndicator';
export type { TypingIndicatorProps } from './TypingIndicator';

export { ProviderStatusPanel } from './ProviderStatusPanel';

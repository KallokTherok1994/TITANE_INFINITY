/**
 * 🛡️ TITANE∞ - Conversation Evaluation Types
 *
 * Type-safe interfaces for conversation quality evaluation
 *
 * @version 24.5.0
 * @date 2025-12-15
 */

/**
 * Conversation turn for evaluation
 */
export interface ConversationTurn {
  user_message: string;
  assistant_response: string;
  context?: ConversationContext;
}

/**
 * Context for conversation evaluation
 */
export interface ConversationContext {
  goal?: string;
  facts?: Array<string | Fact>;
  previous_messages?: Array<{ role: string; content: string }>;
  [key: string]: unknown;
}

/**
 * Fact item for consistency checking
 */
export interface Fact {
  content: string;
  confidence?: number;
  source?: string;
}

/**
 * Analysis result type
 */
export interface AnalysisResult {
  score: number;
  details?: Record<string, unknown>;
  reasoning?: string;
}

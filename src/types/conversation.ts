/**
 * TITANE∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ — CONVERSATION TYPES (Ring 1)
 *   Multi-conversations lifecycle pour Chat IA
 *   Local-first • Tauri-only • Gouvernance stricte
 * ═══════════════════════════════════════════════════════════════════
 */

import type { AIMessage } from './ai';

// ─────────────────────────────────────────────────────────────────
// LEGACY TYPES (ConversationManager OMEGA v2) - À migrer
// ─────────────────────────────────────────────────────────────────

/**
 * Message dans une conversation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  timestamp: number;
  metadata?: {
    emotion?: string;
    intent?: string;
    toolCalls?: ToolCall[];
    [key: string]: unknown;
  };
}

/**
 * Réponse IA
 */
export interface ConversationResponse {
  content: string;
  role: 'assistant';
  timestamp: number;
  conversationId?: string;
  memoryContext?: {
    memoriesUsed: number;
    summary: string;
  };
  metadata?: {
    model?: string;
    tokensUsed?: number;
    finish_reason?: string;
    [key: string]: unknown;
  };
}

/**
 * Configuration conversation
 */
export interface ConversationConfig {
  maxContextLength: number; // tokens
  temperature: number;
  topP: number;
  enableStreaming: boolean;
  enableMemory: boolean;
  model?: string;
  systemPrompt?: string;
}

/**
 * Contexte conversation complète
 */
export interface ConversationContext {
  conversationId: string;
  messages: ConversationMessage[];
  metadata: {
    title?: string;
    tags?: string[];
    userId?: string;
    [key: string]: unknown;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * Tool call (function calling)
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

// ─────────────────────────────────────────────────────────────────
// NOUVEAU: MULTI-CONVERSATIONS TYPES (P1)
// ─────────────────────────────────────────────────────────────────

/**
 * Statut d'une conversation
 */
export type ConversationStatus = 'active' | 'archived';

/**
 * Entité Conversation complète (Ring 1)
 */
export interface Conversation {
  /** Identifiant unique (UUID) */
  id: string;

  /** Titre auto-généré ou personnalisé */
  title: string;

  /** Messages de la conversation */
  messages: AIMessage[];

  /** Statut de la conversation */
  status: ConversationStatus;

  /** Date de création (timestamp ms) */
  created_at: number;

  /** Date de dernière modification (timestamp ms) */
  updated_at: number;

  /** Mode IA utilisé pour cette conversation */
  mode?: string;

  /** Métadonnées additionnelles */
  metadata?: {
    /** Nombre total de tokens utilisés */
    total_tokens?: number;
    /** Provider principal utilisé */
    primary_provider?: string;
    /** Tags personnalisés */
    tags?: string[];
    /** Contexte spécifique */
    context?: Record<string, unknown>;
  };
}

/**
 * Résumé de conversation (pour liste/historique)
 */
export interface ConversationSummary {
  id: string;
  title: string;
  status: ConversationStatus;
  created_at: number;
  updated_at: number;
  message_count: number;
  mode?: string;
}

/**
 * Options de création de conversation
 */
export interface CreateConversationOptions {
  title?: string;
  mode?: string;
  metadata?: Conversation['metadata'];
}

/**
 * Event de lifecycle conversation
 */
export interface ConversationLifecycleEvent {
  type:
    | 'conversation.created'
    | 'conversation.activated'
    | 'conversation.message.appended'
    | 'conversation.archived'
    | 'conversation.restored'
    | 'conversation.updated'
    | 'conversation.deleted';
  conversation_id: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

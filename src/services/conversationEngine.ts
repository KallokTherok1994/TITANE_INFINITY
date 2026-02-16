/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞ — CONVERSATION ENGINE v∞ (Frontend Integration)
 *   Pipeline unifié, Memory Map v∞, Self-Healing, SingularityState Sync
 * ═══════════════════════════════════════════════════════════════════
 */

import { tauriClient } from '@/lib/tauriClient';
import { validateIpcPayload } from '@/lib/ipcContract';
import { getSystemPrompt } from '@/config/chatModes.config';
import type { ProviderDecisionMeta } from '@/types/providerMeta';

const E2E_CHAT_MOCK_FLAG = '__TITANE_E2E_CHAT_MOCK__';
const E2E_CHAT_CONV_SEQ = '__TITANE_E2E_CHAT_CONV_SEQ__';

const getWindowRecord = (): Record<string, unknown> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window as unknown as Record<string, unknown>;
};

const isE2EChatMockEnabled = (): boolean => {
  const win = getWindowRecord();
  if (!win) {
    return false;
  }

  return win[E2E_CHAT_MOCK_FLAG] === true;
};

const createE2EConversationId = (): string => {
  const win = getWindowRecord();
  if (!win) {
    return `e2e-conv-${Date.now()}`;
  }
  const nextSeq =
    typeof win[E2E_CHAT_CONV_SEQ] === 'number'
      ? (win[E2E_CHAT_CONV_SEQ] as number) + 1
      : 1;

  win[E2E_CHAT_CONV_SEQ] = nextSeq;
  return `e2e-conv-${nextSeq}`;
};

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type ConversationMode =
  | 'default'
  | 'brainstorming'
  | 'synthesis'
  | 'planning'
  | 'journal'
  | 'debug_cognitive';

export type Intention = 'Question' | 'Action' | 'Emotion' | 'Clarification' | 'Meta';

export type MemoryEffect = 'New' | 'Recall' | 'Connect' | 'Evolve';

export interface EmotionState {
  valence: number; // -1.0 → 1.0
  intensity: number; // 0.0 → 1.0
  energy: number; // 0.0 → 1.0
}

export interface ConversationRequest {
  user_message: string;
  conversation_id?: string;
  mode: ConversationMode;
  ai_config?: {
    temperature: number;
    max_tokens?: number;
    provider_preference: 'Auto' | 'Gemini' | 'Ollama' | 'Local';
  };
  emotion_context?: EmotionState;
}

export interface ConversationResponse {
  assistant_message: string;
  conversation_id: string;
  message_id: string;
  detected_intention: Intention;
  detected_emotion: EmotionState;
  cognitive_tags: string[];
  cognitive_summary: string;
  metadata: ConversationMetadata;
  meta?: ProviderDecisionMeta;
}

export interface ConversationMetadata {
  timestamp: number;
  provider_used: string;
  latency_ms: number;
  tokens_used: number;
  memory_effect: MemoryEffect;
  links_to_contexts: string[];
}

interface OmegaGenerateResponse {
  content?: string;
  conversationId?: string;
  conversation_id?: string;
  messageId?: string;
  message_id?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
  provider?: string;
  meta?: ProviderDecisionMeta;
}

function normalizeProviderMeta(raw: unknown): ProviderDecisionMeta | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }

  return raw as ProviderDecisionMeta;
}

function isMemoryEffect(val: unknown): val is MemoryEffect {
  return val === 'New' || val === 'Recall' || val === 'Connect' || val === 'Evolve';
}

function normalizeConversationMetadata(meta: unknown): ConversationMetadata {
  const m = (meta ?? {}) as Record<string, unknown>;

  const links = Array.isArray(m.links_to_contexts)
    ? m.links_to_contexts.filter((v): v is string => typeof v === 'string')
    : [];

  return {
    timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
    provider_used: typeof m.provider_used === 'string' ? m.provider_used : 'fallback',
    latency_ms: typeof m.latency_ms === 'number' ? m.latency_ms : 0,
    tokens_used: typeof m.tokens_used === 'number' ? m.tokens_used : 0,
    memory_effect: isMemoryEffect(m.memory_effect) ? m.memory_effect : 'New',
    links_to_contexts: links,
  };
}

export interface ConversationHealthReport {
  status: 'Healthy' | 'Warning' | 'Critical';
  anomalies_detected: Anomaly[];
  repairs_applied: Repair[];
  coherence_score: number;
}

export interface Anomaly {
  anomaly_type: 'MessageLoss' | 'StateDrift' | 'MemoryCorruption' | 'SyncFailure';
  severity: number;
  description: string;
}

export interface Repair {
  repair_type: string;
  success: boolean;
  details: string;
}

export interface ConversationMemoryStats {
  total_processed: number;
  total_anomalies: number;
  last_scan: number;
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION ENGINE API
// ═══════════════════════════════════════════════════════════════════

/**
 * Traiter un message à travers le Conversation Engine v∞
 */
export async function processMessage(
  userMessage: string,
  options?: {
    conversationId?: string;
    mode?: ConversationMode;
    emotionContext?: EmotionState;
  }
): Promise<ConversationResponse> {
  let conversationId = options?.conversationId;

  if (isE2EChatMockEnabled()) {
    if (!conversationId) {
      conversationId = createE2EConversationId();
    }

    const now = Date.now();
    return {
      assistant_message: `[MOCK_OK] ${userMessage}`,
      conversation_id: conversationId,
      message_id: `e2e-${now}`,
      detected_intention: 'Question',
      detected_emotion: {
        valence: 0,
        intensity: 0,
        energy: 0,
      },
      cognitive_tags: ['e2e', 'mock'],
      cognitive_summary: 'E2E mock response',
      metadata: {
        timestamp: now,
        provider_used: 'e2e-mock',
        latency_ms: 0,
        tokens_used: 0,
        memory_effect: 'New',
        links_to_contexts: [],
      },
    };
  }

  if (!conversationId) {
    try {
      conversationId = (await tauriClient.createNewConversation()) as string;
    } catch (error) {
      console.warn('[conversationEngine] ⚠️ Failed to create conversation:', error);
      conversationId = `fallback-${Date.now()}`;
    }
  }

  console.log('[conversationEngine] 📤 Sending to backend:', {
    message_length: userMessage.length,
    mode: options?.mode || 'default',
    conversationId,
  });

  // ✨ v20.5: Ne pas bloquer ici - laisser TauriProtector gérer le fallback Ollama
  // Le protector tentera Tauri en premier, puis Ollama en fallback si besoin
  console.log('[conversationEngine] 🚀 Envoi du message via secureInvoke');

  const systemPrompt = getSystemPrompt(options?.mode ?? 'default');
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const payload = validateIpcPayload('conversation_generate', {
    args: {
      message: userMessage,
      conversationId,
      mode: options?.mode || 'default',
      provider: 'auto',
      systemPrompt,
      requestId,
    },
  });
  const raw = (await tauriClient.conversationGenerate(payload)) as OmegaGenerateResponse;

  const content = typeof raw?.content === 'string' ? raw.content : '';
  if (content.trim().length === 0) {
    console.error('[conversationEngine] ❌ AI returned empty content');
    console.info('[conversationEngine] Raw response:', raw);
    throw new Error('AI backend returned empty response');
  }

  const metadata = (raw?.metadata ?? {}) as Record<string, unknown>;
  const providerMeta = normalizeProviderMeta(raw?.meta);
  const cognitiveTagsRaw = metadata['cognitiveTags'];
  const cognitiveTags = Array.isArray(cognitiveTagsRaw)
    ? cognitiveTagsRaw.filter((v): v is string => typeof v === 'string')
    : [];

  const detectedIntentionRaw = metadata['intention'];
  const detectedIntention: Intention =
    detectedIntentionRaw === 'Question' ||
    detectedIntentionRaw === 'Action' ||
    detectedIntentionRaw === 'Emotion' ||
    detectedIntentionRaw === 'Clarification' ||
    detectedIntentionRaw === 'Meta'
      ? detectedIntentionRaw
      : 'Question';

  const response: ConversationResponse = {
    assistant_message: content,
    conversation_id:
      (typeof raw?.conversationId === 'string' && raw.conversationId) ||
      (typeof raw?.conversation_id === 'string' && raw.conversation_id) ||
      conversationId,
    message_id:
      (typeof raw?.messageId === 'string' && raw.messageId) ||
      (typeof raw?.message_id === 'string' && raw.message_id) ||
      `msg-${Date.now()}`,
    detected_intention: detectedIntention,
    detected_emotion: {
      valence: 0,
      intensity: 0,
      energy: 0,
    },
    cognitive_tags: cognitiveTags,
    cognitive_summary:
      typeof metadata['cognitiveSummary'] === 'string'
        ? (metadata['cognitiveSummary'] as string)
        : '',
    metadata: normalizeConversationMetadata({
      ...metadata,
      provider_used:
        (typeof raw?.provider === 'string' && raw.provider.trim().length > 0
          ? raw.provider
          : undefined) ??
        (typeof metadata['provider_used'] === 'string'
          ? metadata['provider_used']
          : undefined) ??
        'fallback',
      latency_ms:
        (typeof raw?.latencyMs === 'number' ? raw.latencyMs : undefined) ??
        (typeof metadata['latency_ms'] === 'number' ? metadata['latency_ms'] : 0),
    }),
    meta: providerMeta,
  };

  console.log('[conversationEngine] 📥 Backend response:', {
    message_id: response.message_id,
    assistant_message_length: response.assistant_message?.length || 0,
    assistant_message_preview: response.assistant_message?.substring(0, 100),
    provider: response.metadata?.provider_used,
  });

  return response;
}

/**
 * Vérifier la santé du système conversationnel
 */
export async function healthCheck(): Promise<ConversationHealthReport> {
  return (await tauriClient.conversationHealthCheck()) as ConversationHealthReport;
}

/**
 * Obtenir les statistiques mémoire
 */
export async function getMemoryStats(): Promise<ConversationMemoryStats> {
  return (await tauriClient.conversationMemoryStats()) as ConversationMemoryStats;
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Formater une émotion en texte lisible
 */
export function formatEmotion(emotion: EmotionState): string {
  const valenceLabel =
    emotion.valence > 0.5
      ? '😊 Positif'
      : emotion.valence < -0.5
        ? '😔 Négatif'
        : '😐 Neutre';

  const intensityLabel =
    emotion.intensity > 0.7
      ? '🔥 Intense'
      : emotion.intensity > 0.4
        ? '⚡ Modéré'
        : '💧 Calme';

  const energyLabel =
    emotion.energy > 0.7
      ? '⚡ Énergisé'
      : emotion.energy > 0.4
        ? '🔋 Normal'
        : '🌙 Fatigué';

  return `${valenceLabel} • ${intensityLabel} • ${energyLabel}`;
}

/**
 * Formater une intention en texte lisible
 */
export function formatIntention(intention: Intention): string {
  const labels: Record<Intention, string> = {
    Question: '❓ Question',
    Action: '⚡ Action',
    Emotion: '💭 Émotion',
    Clarification: '🔍 Clarification',
    Meta: '🎭 Meta',
  };
  return labels[intention] || intention;
}

/**
 * Formater l'effet mémoire en texte lisible
 */
export function formatMemoryEffect(effect: MemoryEffect): string {
  const labels: Record<MemoryEffect, string> = {
    New: '✨ Nouveau',
    Recall: '📚 Rappel',
    Connect: '🔗 Connexion',
    Evolve: '🌱 Évolution',
  };
  return labels[effect] || effect;
}

/**
 * Analyser le statut de santé
 */
export function analyzeHealthStatus(report: ConversationHealthReport): {
  isHealthy: boolean;
  severity: 'none' | 'low' | 'medium' | 'high';
  message: string;
} {
  if (report.status === 'Healthy') {
    return {
      isHealthy: true,
      severity: 'none',
      message: '✅ Système conversationnel optimal',
    };
  }

  if (report.status === 'Warning') {
    return {
      isHealthy: true,
      severity: 'medium',
      message: '⚠️ Anomalies détectées, réparation en cours',
    };
  }

  return {
    isHealthy: false,
    severity: 'high',
    message: '🚨 État critique, réparation urgente nécessaire',
  };
}

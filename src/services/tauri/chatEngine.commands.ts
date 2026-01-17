/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — Chat Engine Backend Commands
 *   Wrapper type-safe pour les commandes Tauri du nouveau ChatEngine
 * ═══════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

const COMMANDS = {
  generate: 'generate_response',
  stream: 'stream_response',
  speak: 'speak_text',
  saveMemory: 'save_memory',
  loadMemory: 'load_memory',
  resetMemory: 'reset_memory',
  health: 'health_check',
} as const;

const DEFAULTS = {
  temperature: 0.7,
  maxTokens: 1024,
} as const;

export type ProviderPreference = 'auto' | 'gemini' | 'ollama' | 'local';
export type SpeechMode = 'auto' | 'online' | 'local';

// OMEGA Pipeline Types
export interface OmegaGenerateArgs {
  message: string;
  conversationId: string;
  mode?: string;
  provider?: string;
  systemPrompt?: string; // ✨ Ajout: system prompt personnalisé depuis InstructionMode
}

export interface OmegaResponse {
  content: string;
  conversationId: string;
  messageId: string;
  frenchMasteryApplied: boolean;
  latencyMs: number;
  metadata?: {
    intention?: string;
    emotion?: string;
    cognitiveTags?: string[];
    cognitiveSummary?: string;
    provider?: string;
  };
}

export interface ChatRequestArgs {
  conversationId?: string;
  userMessage: string;
  systemPrompt?: string;
  temperature?: number;
  maxOutputTokens?: number;
  provider?: ProviderPreference;
  enableStreaming?: boolean;
}

interface BackendChatCompletionPayload {
  conversation_id: string;
  message_id: string;
  provider: string;
  content: string;
  token_count: number;
  latency_ms: number;
  timestamp: number;
}

export interface ChatCompletionPayload {
  conversationId: string;
  messageId: string;
  provider: string;
  content: string;
  tokenCount: number;
  latencyMs: number;
  timestamp: number;
}

interface BackendEngineHealthReport {
  providers_online: string[];
  providers_degraded: string[];
  provider_errors: string[];
  memory_entries: number;
  memory_tokens: number;
  auto_tts_enabled: boolean;
  timestamp: number;
}

export interface EngineHealthReport {
  providersOnline: string[];
  providersDegraded: string[];
  providerErrors: string[];
  memoryEntries: number;
  memoryTokens: number;
  autoTtsEnabled: boolean;
  timestamp: number;
}

interface BackendStreamChunkPayload {
  conversation_id: string;
  message_id: string;
  ordinal: number;
  content: string;
  done: boolean;
}

export interface StreamChunkPayload {
  conversationId: string;
  messageId: string;
  ordinal: number;
  content: string;
  done: boolean;
}

export interface StreamHandle {
  conversationId: string;
  messageId: string;
}

function normalizeCompletion(
  payload: BackendChatCompletionPayload
): ChatCompletionPayload {
  return {
    conversationId: payload.conversation_id,
    messageId: payload.message_id,
    provider: payload.provider,
    content: payload.content,
    tokenCount: payload.token_count,
    latencyMs: payload.latency_ms,
    timestamp: payload.timestamp,
  };
}

function normalizeHealthReport(payload: BackendEngineHealthReport): EngineHealthReport {
  return {
    providersOnline: payload.providers_online,
    providersDegraded: payload.providers_degraded,
    providerErrors: payload.provider_errors,
    memoryEntries: payload.memory_entries,
    memoryTokens: payload.memory_tokens,
    autoTtsEnabled: payload.auto_tts_enabled,
    timestamp: payload.timestamp,
  };
}

function normalizeStreamChunk(payload: BackendStreamChunkPayload): StreamChunkPayload {
  return {
    conversationId: payload.conversation_id,
    messageId: payload.message_id,
    ordinal: payload.ordinal,
    content: payload.content,
    done: payload.done,
  };
}

function toBackendPayload(args: ChatRequestArgs): Record<string, unknown> {
  return {
    conversation_id: args.conversationId ?? null,
    user_message: args.userMessage,
    system_prompt: args.systemPrompt ?? null,
    temperature: args.temperature ?? DEFAULTS.temperature,
    max_output_tokens: args.maxOutputTokens ?? DEFAULTS.maxTokens,
    provider: (args.provider ?? 'auto').toLowerCase(),
    enable_streaming: args.enableStreaming ?? false,
  };
}

async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await secureInvoke<T>(command, args ?? {});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ChatEngine Commands] ${command} failed:`, message);
    throw new Error(`ChatEngine command "${command}" failed: ${message}`);
  }
}

export async function generateResponse(
  args: ChatRequestArgs
): Promise<ChatCompletionPayload> {
  const payload = toBackendPayload({ ...args, enableStreaming: false });
  const result = await invokeCommand<BackendChatCompletionPayload>(COMMANDS.generate, {
    payload,
  });
  return normalizeCompletion(result);
}

export async function streamResponse(args: ChatRequestArgs): Promise<StreamHandle> {
  const payload = toBackendPayload({ ...args, enableStreaming: true });
  return invokeCommand<StreamHandle>(COMMANDS.stream, { payload });
}

export async function speakText(options: {
  text: string;
  mode?: SpeechMode;
  speed?: number;
  pitch?: number;
  voice?: string | null;
}): Promise<void> {
  const { text, mode = 'auto', speed = 1.0, pitch = 1.0, voice = null } = options;
  return invokeCommand<void>(COMMANDS.speak, {
    text,
    mode,
    speed,
    pitch,
    voice,
  });
}

export async function saveMemory(conversationId: string): Promise<string> {
  return invokeCommand<string>(COMMANDS.saveMemory, { conversationId });
}

export async function loadMemory(conversationId: string): Promise<unknown> {
  return invokeCommand<unknown>(COMMANDS.loadMemory, { conversationId });
}

export async function resetMemory(): Promise<void> {
  return invokeCommand<void>(COMMANDS.resetMemory);
}

export async function healthCheck(): Promise<EngineHealthReport> {
  const report = await invokeCommand<BackendEngineHealthReport>(COMMANDS.health);
  return normalizeHealthReport(report);
}

export async function onStreamChunk(
  handler: (chunk: StreamChunkPayload) => void
): Promise<UnlistenFn> {
  return listen<BackendStreamChunkPayload>('chat:stream:chunk', event => {
    handler(normalizeStreamChunk(event.payload));
  });
}

export async function onStreamDone(
  handler: (chunk: StreamChunkPayload) => void
): Promise<UnlistenFn> {
  return listen<BackendStreamChunkPayload>('chat:stream:done', event => {
    handler(normalizeStreamChunk(event.payload));
  });
}

// OMEGA Pipeline Commands
export async function createNewConversation(): Promise<string> {
  return invokeCommand<string>('create_new_conversation');
}

export async function generate(args: OmegaGenerateArgs): Promise<OmegaResponse> {
  return invokeCommand<OmegaResponse>('conversation_generate', {
    message: args.message,
    conversation_id: args.conversationId,
    mode: args.mode ?? null,
    provider: args.provider ?? null,
    system_prompt: args.systemPrompt ?? null, // ✨ Transmission du system prompt
  });
}

export const chatEngineCommands = {
  generateResponse,
  streamResponse,
  speakText,
  saveMemory,
  loadMemory,
  resetMemory,
  healthCheck,
  onStreamChunk,
  onStreamDone,
  // OMEGA Pipeline
  createNewConversation,
  generate,
};

export default chatEngineCommands;

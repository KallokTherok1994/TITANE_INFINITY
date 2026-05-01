import { z } from 'zod';

import { secureInvoke, type SecureInvokeOptions } from '@/lib/security';

export type IpcCommandName =
  | 'conversation_generate'
  | 'tts_speak'
  | 'get_system_health'
  | 'health_check'
  | 'singularity_get_state'
  | 'singularity_get_full_state'
  | 'get_copilot_key_status'
  // ─── V32 Phase 3: Top-20 critical IPC contracts ───
  | 'create_new_conversation'
  | 'get_conversation_history'
  | 'delete_conversation'
  | 'set_provider_preference'
  | 'chat_set_gemini_key'
  | 'chat_set_openai_key'
  | 'cycle_get_state'
  | 'cycle_get_rhythm'
  | 'cycle_predict_events'
  | 'cycle_suggest_optimal_time'
  | 'cycle_get_alignment'
  | 'cycle_get_diagnostics'
  | 'tts_stop'
  | 'tts_get_voices'
  | 'web_research'
  | 'memory_hybrid_store'
  | 'memory_hybrid_recall'
  | 'singularity_set_intent'
  | 'window_set_zoom'
  | 'get_ollama_status';

const ConversationGenerateArgsSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().min(1),
  mode: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  systemPrompt: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().finite().optional(),
  contextEnvelope: z.record(z.string(), z.unknown()).nullable().optional(),
});

const ConversationGenerateSchema = z.object({
  args: ConversationGenerateArgsSchema,
});

const TtsSettingsSchema = z.object({
  engine: z.string().min(1),
  voiceId: z.string().min(1),
  rate: z.number(),
  pitch: z.number(),
  volume: z.number(),
  language: z.string().min(1),
  emotionEnabled: z.boolean(),
  autoFallback: z.boolean(),
});

// ─── V32 Phase 3: Top-20 schemas ─────────────────────────────

const CreateNewConversationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().optional(),
  mode: z.string().optional(),
});

const GetConversationHistorySchema = z.object({
  conversationId: z.string().min(1),
  limit: z.number().int().positive().optional(),
});

const DeleteConversationSchema = z.object({
  conversationId: z.string().min(1),
});

const SetProviderPreferenceSchema = z.object({
  preference: z.enum(['auto', 'ollama', 'gemini', 'openai', 'anthropic', 'local']),
});

const ChatSetApiKeySchema = z.object({
  key: z.string().min(1),
});

const CyclePredictEventsSchema = z.object({
  hoursAhead: z.number().int().min(1).max(168),
});

const CycleSuggestOptimalTimeSchema = z.object({
  taskType: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(480),
});

const WebResearchSchema = z.object({
  query: z.string().min(1).max(512),
  maxResults: z.number().int().min(1).max(20).optional(),
});

const MemoryHybridStoreSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  namespace: z.string().optional(),
  ttl: z.number().int().positive().optional(),
});

const MemoryHybridRecallSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
  namespace: z.string().optional(),
});

const SingularitySetIntentSchema = z.object({
  intent: z.string().min(1),
  priority: z.number().int().min(0).max(10).optional(),
});

const WindowSetZoomSchema = z.object({
  level: z.number().finite().min(0.25).max(5.0),
});

const TtsSpeakSchema = z.object({
  text: z.string().min(1),
  settings: TtsSettingsSchema,
});

const NoArgsSchema = z.object({}).strict();

const ContractSchemas: Record<IpcCommandName, z.ZodTypeAny> = {
  conversation_generate: ConversationGenerateSchema,
  tts_speak: TtsSpeakSchema,
  get_system_health: NoArgsSchema,
  health_check: NoArgsSchema,
  singularity_get_state: NoArgsSchema,
  singularity_get_full_state: NoArgsSchema,
  get_copilot_key_status: NoArgsSchema,
  // ─── V32 Phase 3: Top-20 ───────────────────────────────────
  create_new_conversation: CreateNewConversationSchema,
  get_conversation_history: GetConversationHistorySchema,
  delete_conversation: DeleteConversationSchema,
  set_provider_preference: SetProviderPreferenceSchema,
  chat_set_gemini_key: ChatSetApiKeySchema,
  chat_set_openai_key: ChatSetApiKeySchema,
  cycle_get_state: NoArgsSchema,
  cycle_get_rhythm: NoArgsSchema,
  cycle_predict_events: CyclePredictEventsSchema,
  cycle_suggest_optimal_time: CycleSuggestOptimalTimeSchema,
  cycle_get_alignment: NoArgsSchema,
  cycle_get_diagnostics: NoArgsSchema,
  tts_stop: NoArgsSchema,
  tts_get_voices: NoArgsSchema,
  web_research: WebResearchSchema,
  memory_hybrid_store: MemoryHybridStoreSchema,
  memory_hybrid_recall: MemoryHybridRecallSchema,
  singularity_set_intent: SingularitySetIntentSchema,
  window_set_zoom: WindowSetZoomSchema,
  get_ollama_status: NoArgsSchema,
};

const CAMELCASE_ENFORCED = new Set<IpcCommandName>([
  'conversation_generate',
  'tts_speak',
]);

function findSnakeCaseKey(value: unknown, path = ''): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const nested = findSnakeCaseKey(value[i], `${path}[${i}]`);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
    if (/_/.test(key)) {
      return path ? `${path}.${key}` : key;
    }
    const nested = findSnakeCaseKey(nestedValue, path ? `${path}.${key}` : key);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return 'Invalid payload';
  }

  const issuePath = firstIssue.path.join('.') || 'payload';
  const issueMessage = firstIssue.message.toLowerCase();

  if (issueMessage.includes('required')) {
    return `Missing required field: ${issuePath}`;
  }

  return `Invalid field ${issuePath}: ${firstIssue.message}`;
}

export function validateIpcPayload<T extends IpcCommandName>(
  command: T,
  payload: Record<string, unknown> = {}
): z.output<(typeof ContractSchemas)[T]> {
  const schema = ContractSchemas[command];
  if (!schema) {
    throw new Error(`IPC contract error: unknown command "${command}"`);
  }

  if (CAMELCASE_ENFORCED.has(command)) {
    const snakeKey = findSnakeCaseKey(payload);
    if (snakeKey) {
      throw new Error(`IPC contract error: snake_case key "${snakeKey}" not allowed`);
    }
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(`IPC contract error: ${formatZodError(parsed.error)}`);
  }

  return parsed.data;
}

export async function invokeStrict<T>(
  command: IpcCommandName,
  payload: Record<string, unknown> = {},
  options?: SecureInvokeOptions,
  validator?: (val: unknown) => val is T
): Promise<T> {
  const validated = validateIpcPayload(command, payload) as Record<string, unknown>;
  return secureInvoke<T>(command, validated, options, validator);
}

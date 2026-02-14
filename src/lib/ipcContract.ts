import { z } from 'zod';

import { secureInvoke, type SecureInvokeOptions } from '@/lib/security';

export type IpcCommandName =
  | 'conversation_generate'
  | 'tts_speak'
  | 'get_system_health'
  | 'health_check'
  | 'singularity_get_state'
  | 'singularity_get_full_state'
  | 'get_copilot_key_status';

const ConversationGenerateArgsSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().min(1),
  mode: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  systemPrompt: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),
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

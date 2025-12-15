/**
 * TITANE∞ v24.7.5 - Type Definitions for Error Handling
 *
 * Centralized type definitions for error metadata across services
 * Replaces `metadata?: any` with strict typed interfaces
 */

/**
 * Base error metadata shared across all error handlers
 */
export interface BaseErrorMetadata {
  /** Context where the error occurred */
  context: string;
  /** Timestamp of error occurrence */
  timestamp: number;
  /** Optional user ID associated with error */
  userId?: string;
  /** Optional session ID */
  sessionId?: string;
  /** Additional custom data */
  [key: string]: unknown;
}

/**
 * Provider-specific error metadata (Ollama, OpenAI, etc.)
 */
export interface ProviderErrorMetadata extends BaseErrorMetadata {
  /** Provider name (ollama, openai, gemini, etc.) */
  provider: string;
  /** Number of retry attempts */
  retryCount?: number;
  /** Error count for this provider session */
  errorCount?: number;
  /** Request details that caused error */
  request?: {
    model?: string;
    prompt?: string;
    maxTokens?: number;
    temperature?: number;
  };
  /** Response details (if partial response received) */
  response?: {
    statusCode?: number;
    headers?: Record<string, string>;
    partialData?: string;
  };
}

/**
 * Chat engine error metadata
 */
export interface ChatErrorMetadata extends BaseErrorMetadata {
  /** Chat mode (default, creative, technical, etc.) */
  mode?: string;
  /** Message that caused error */
  messageId?: string;
  /** Conversation ID */
  conversationId?: string;
  /** Provider being used */
  provider?: string;
  /** Number of messages in conversation */
  messageCount?: number;
}

/**
 * Tauri invoke error metadata
 */
export interface TauriErrorMetadata extends BaseErrorMetadata {
  /** Tauri command that was invoked */
  command: string;
  /** Arguments passed to command */
  args?: Record<string, unknown>;
  /** Expected return type */
  expectedType?: string;
}

/**
 * Cache operation error metadata
 */
export interface CacheErrorMetadata extends BaseErrorMetadata {
  /** Cache key that caused error */
  key: string;
  /** Operation type (get, set, delete, clear) */
  operation: 'get' | 'set' | 'delete' | 'clear';
  /** Cache size before operation */
  cacheSize?: number;
  /** Time since last cache hit */
  timeSinceHit?: number;
}

/**
 * Validation error metadata
 */
export interface ValidationErrorMetadata extends BaseErrorMetadata {
  /** Field that failed validation */
  field: string;
  /** Validation rule that failed */
  rule: string;
  /** Actual value that failed */
  actualValue?: unknown;
  /** Expected value or pattern */
  expectedValue?: unknown;
}

/**
 * Audio/Voice error metadata
 */
export interface AudioErrorMetadata extends BaseErrorMetadata {
  /** Audio device info */
  deviceInfo?: {
    id: string;
    label: string;
    kind: string;
  };
  /** Audio constraints */
  constraints?: MediaStreamConstraints;
  /** Permission status */
  permissionState?: 'granted' | 'denied' | 'prompt';
}

/**
 * Test/Mock metadata (for unit tests)
 */
export interface TestErrorMetadata extends BaseErrorMetadata {
  /** Test suite name */
  testSuite?: string;
  /** Test case name */
  testCase?: string;
  /** Expected vs actual comparison */
  comparison?: {
    expected: unknown;
    actual: unknown;
  };
}

/**
 * Type guard to check if metadata is provider-specific
 */
export function isProviderErrorMetadata(
  metadata: unknown
): metadata is ProviderErrorMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'provider' in metadata &&
    typeof (metadata as ProviderErrorMetadata).provider === 'string'
  );
}

/**
 * Type guard to check if metadata is chat-related
 */
export function isChatErrorMetadata(metadata: unknown): metadata is ChatErrorMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    ('messageId' in metadata || 'conversationId' in metadata)
  );
}

/**
 * Type guard to check if metadata is Tauri-related
 */
export function isTauriErrorMetadata(metadata: unknown): metadata is TauriErrorMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'command' in metadata &&
    typeof (metadata as TauriErrorMetadata).command === 'string'
  );
}

/**
 * Helper to create base error metadata with defaults
 */
export function createBaseErrorMetadata(
  context: string,
  additional?: Partial<BaseErrorMetadata>
): BaseErrorMetadata {
  return {
    context,
    timestamp: Date.now(),
    ...additional,
  };
}

/**
 * Helper to create provider error metadata
 */
export function createProviderErrorMetadata(
  provider: string,
  context: string,
  additional?: Partial<ProviderErrorMetadata>
): ProviderErrorMetadata {
  return {
    ...createBaseErrorMetadata(context),
    provider,
    ...additional,
  };
}

/**
 * Helper to create chat error metadata
 */
export function createChatErrorMetadata(
  context: string,
  additional?: Partial<ChatErrorMetadata>
): ChatErrorMetadata {
  return {
    ...createBaseErrorMetadata(context),
    ...additional,
  };
}

/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   IPC ERROR CLASSIFIER (Ω∞.IPC.CONTRACT.v1)
 *   Distinguish IPC contract errors from Ollama provider errors
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * IPC contract error patterns (Tauri invoke failures)
 * These indicate frontend-backend mismatch, NOT Ollama unavailability
 */
const IPC_ERROR_PATTERNS = [
  // Command not found
  /command .*? not found/i,
  /unknown command/i,
  /failed to invoke/i,

  // Serde deserialization errors
  /missing field/i,
  /invalid type/i,
  /failed to deserialize/i,
  /expected .* at line/i,

  // Argument mismatches
  /missing required (field|argument)/i,
  /unexpected (field|argument)/i,
  /wrong number of arguments/i,

  // Type errors
  /type mismatch/i,
  /cannot convert/i,
  /serialization error/i,

  // Tauri-specific errors
  /tauri error/i,
  /invoke error/i,
  /ipc error/i,
] as const;

/**
 * Network/timeout patterns that could be Ollama OR connectivity
 */
const NETWORK_ERROR_PATTERNS = [
  /timeout/i,
  /aborted/i,
  /connection refused/i,
  /econnrefused/i,
  /network error/i,
  /fetch failed/i,
] as const;

/**
 * Classify error as IPC contract issue vs provider issue
 */
export function isIPCError(error: unknown): boolean {
  if (!error) return false;

  const message = getErrorMessage(error);
  if (!message) return false;

  // Check IPC-specific patterns
  return IPC_ERROR_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if error is network-related (ambiguous - could be Ollama OR IPC)
 */
export function isNetworkError(error: unknown): boolean {
  if (!error) return false;

  const message = getErrorMessage(error);
  if (!message) return false;

  return NETWORK_ERROR_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Get user-friendly error message based on classification
 */
export function classifyError(error: unknown): {
  type: 'ipc' | 'network' | 'ollama' | 'unknown';
  message: string;
  hint: string;
  retryable: boolean;
} {
  if (isIPCError(error)) {
    return {
      type: 'ipc',
      message: 'Erreur IPC: incompatibilité frontend-backend',
      hint: 'Problème de contrat IPC détecté. Contacter le support technique.',
      retryable: false,
    };
  }

  if (isNetworkError(error)) {
    return {
      type: 'network',
      message: 'Erreur réseau ou timeout',
      hint: 'Vérifier la connexion ou attendre avant de réessayer.',
      retryable: true,
    };
  }

  const message = getErrorMessage(error);

  // If contains "ollama" explicitly, it's provider-specific
  if (message && /ollama/i.test(message)) {
    return {
      type: 'ollama',
      message: 'Ollama indisponible',
      hint: 'TITANE bascule en mode local.',
      retryable: true,
    };
  }

  // Default unknown
  return {
    type: 'unknown',
    message: getErrorMessage(error) || 'Erreur inconnue',
    hint: "Une erreur inattendue s'est produite.",
    retryable: false,
  };
}

/**
 * Extract message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }

  return String(error);
}

/**
 * Check if error is AbortError (user-initiated cancellation)
 */
export function isAbortError(error: unknown): boolean {
  if (!error) return false;

  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  const message = getErrorMessage(error);
  return /abort/i.test(message);
}

/**
 * Get detailed error info for logging/debugging
 */
export function getErrorDetails(error: unknown): {
  name: string;
  message: string;
  stack?: string;
  classification: ReturnType<typeof classifyError>;
} {
  const classification = classifyError(error);

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      classification,
    };
  }

  return {
    name: 'UnknownError',
    message: getErrorMessage(error),
    classification,
  };
}

/**
 * TITANE Remote Key Agent — Configuration & Persistence
 * Stores agent configuration in localStorage under key `titane::agent::remote_key_config`
 * Survives page reloads; no server round-trip needed.
 */

export const AGENT_CONFIG_STORAGE_KEY = 'titane::agent::remote_key_config';

export interface AgentTrainingProfile {
  /** System prompt injected into AI analysis requests */
  systemPrompt: string;
  /** Ollama model used for key analysis */
  model: 'gemma2:2b' | 'qwen2.5:latest' | 'llama3.1:latest' | string;
  /** Temperature for AI responses (0.0 – 1.0) */
  temperature: number;
}

export interface AgentRotationPolicy {
  /** Automatically rotate keys older than this many days (0 = disabled) */
  autoRotateDays: number;
  /** Warn when a key hasn't been rotated for this many days */
  warnAfterDays: number;
}

export interface AgentConfig {
  version: 1;
  training: AgentTrainingProfile;
  rotation: AgentRotationPolicy;
  /** Default scopes assigned to newly created keys */
  defaultScopes: string[];
  /** Whether the agent should auto-create a default key on init */
  autoCreateDefault: boolean;
  /** Whether to log every key operation in localStorage for analysis */
  enableUsageLog: boolean;
  /** ISO timestamp when config was last saved */
  updatedAt: string;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  version: 1,
  training: {
    systemPrompt: `Tu es TITANE_KEY_AGENT, l'agent intelligent de gestion des clés API TITANE.
Tu analyses les patterns d'utilisation des clés, détectes les anomalies de sécurité,
suggères des labels adaptés au contexte, et optimises automatiquement les politiques de rotation.
Réponds toujours en français. Sois concis, factuel et sécurité-first.`,
    model: 'gemma2:2b',
    temperature: 0.3,
  },
  rotation: {
    autoRotateDays: 90,
    warnAfterDays: 60,
  },
  defaultScopes: ['chat', 'memory'],
  autoCreateDefault: true,
  enableUsageLog: true,
  updatedAt: new Date().toISOString(),
};

// ─── Persistence helpers ────────────────────────────────────────────────────

export function loadAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(AGENT_CONFIG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AGENT_CONFIG, updatedAt: new Date().toISOString() };
    const parsed = JSON.parse(raw) as Partial<AgentConfig>;
    // Merge with defaults to handle forward-compat
    return {
      ...DEFAULT_AGENT_CONFIG,
      ...parsed,
      training: { ...DEFAULT_AGENT_CONFIG.training, ...(parsed.training ?? {}) },
      rotation: { ...DEFAULT_AGENT_CONFIG.rotation, ...(parsed.rotation ?? {}) },
    };
  } catch {
    return { ...DEFAULT_AGENT_CONFIG, updatedAt: new Date().toISOString() };
  }
}

export function saveAgentConfig(config: AgentConfig): void {
  const updated = { ...config, updatedAt: new Date().toISOString() };
  localStorage.setItem(AGENT_CONFIG_STORAGE_KEY, JSON.stringify(updated));
}

export function resetAgentConfig(): AgentConfig {
  const fresh = { ...DEFAULT_AGENT_CONFIG, updatedAt: new Date().toISOString() };
  localStorage.setItem(AGENT_CONFIG_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

// ─── Usage log ──────────────────────────────────────────────────────────────

export const USAGE_LOG_KEY = 'titane::agent::remote_key_usage_log';
const MAX_LOG_ENTRIES = 200;

export interface UsageLogEntry {
  ts: string;          // ISO
  action: 'create' | 'revoke' | 'rotate' | 'verify_ok' | 'verify_fail' | 'ai_query';
  keyId?: string;
  label?: string;
  detail?: string;
}

export function appendUsageLog(entry: Omit<UsageLogEntry, 'ts'>): void {
  try {
    const raw = localStorage.getItem(USAGE_LOG_KEY);
    const log: UsageLogEntry[] = raw ? JSON.parse(raw) : [];
    log.push({ ts: new Date().toISOString(), ...entry });
    // Keep only the last N entries
    const trimmed = log.slice(-MAX_LOG_ENTRIES);
    localStorage.setItem(USAGE_LOG_KEY, JSON.stringify(trimmed));
  } catch {
    // Non-fatal
  }
}

export function readUsageLog(): UsageLogEntry[] {
  try {
    const raw = localStorage.getItem(USAGE_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearUsageLog(): void {
  localStorage.removeItem(USAGE_LOG_KEY);
}

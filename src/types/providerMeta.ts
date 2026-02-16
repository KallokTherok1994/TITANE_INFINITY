export type ProviderClass = 'local' | 'remote' | 'hybrid';

export type Mode = 'LOCAL' | 'REMOTE' | 'OFFLINE' | 'CACHED' | 'ERROR';

export type ReasonCode =
  | 'OK'
  | 'POLICY_LOCAL_ONLY'
  | 'POLICY_REMOTE_ALLOWED'
  | 'ALLOWLIST_DENIED'
  | 'PROVIDER_DOWN'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'INVALID_CONFIG'
  | 'NETWORK_ERROR'
  | 'FALLBACK_OFFLINE'
  | 'CACHE_HIT'
  | 'CACHE_MISS'
  | 'SERIALIZATION_DROPPED'
  | 'PROVIDER_UNAVAILABLE'
  | 'TOOL_REQUIRED'
  | 'TOOL_DENIED'
  | 'UNKNOWN';

export interface ProviderAttemptMeta {
  provider_id: string;
  provider_class: ProviderClass;
  latency_ms: number;
  outcome: 'success' | 'error';
  reason_code: ReasonCode;
  network_used_attempt: boolean;
}

export interface ProviderDecisionMeta {
  provider_used: string;
  provider_class: ProviderClass;
  mode: Mode;
  reason_code: ReasonCode;
  latency_ms_total: number;
  timeout_ms: number;
  retries: number;
  attempts: ProviderAttemptMeta[];
  network_used: boolean;
  cache_hit: boolean;
  policy: string;
}

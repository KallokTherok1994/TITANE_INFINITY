/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ — CLOUD CENTER SHARED TYPES
 *   Break circular dependencies in CloudCenter components
 * ═══════════════════════════════════════════════════════════════
 */

export interface CloudStatus {
  initialized: boolean;
  status: 'Idle' | 'Syncing' | 'Success' | 'Error' | 'Conflict' | 'Corrupted';
  vault_loaded: boolean;
  vault_revision: number | null;
  vault_size_bytes: number | null;
  last_sync??: string | null;
  device_id??: string | null;
  device_name??: string | null;
  backend: 'LocalFolder' | 'S3Private' | 'P2P' | null;
  sync_mode: 'Manual' | 'Auto' | 'Disabled' | null;
}

export interface SyncResult {
  success: boolean;
  status: string;
  direction: 'Push' | 'Pull' | 'Bidirectional';
  local_revision_before: number;
  local_revision_after: number;
  remote_revision: number | null;
  conflicts_resolved: number;
  duration_ms: number;
  error??: string | null;
  timestamp: string;
}

export interface DeviceIdentity {
  device_id: string;
  device_name: string;
  os: string;
  os_version: string;
  fingerprint: string;
  public_key: string;
  first_seen: string;
  last_seen: string;
  trusted: boolean;
}

export interface SyncLogEntry {
  timestamp: string;
  status: 'Success' | 'Error' | 'Conflict';
  direction: 'Push' | 'Pull' | 'Bidirectional';
  message: string;
  duration_ms: number;
}

export interface SyncHistoryEntry {
  timestamp: string;
  direction: 'Push' | 'Pull' | 'Bidirectional';
  status: string;
  remote_device_id??: string | null;
  revision: number;
  data_size_bytes: number;
  duration_ms: number;
  error_message??: string | null;
  conflicts_resolved: number;
}

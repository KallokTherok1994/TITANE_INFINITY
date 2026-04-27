/**
 * TITANE∞ — Remote Key Manager Service
 *
 * Tauri IPC bindings for named API key management.
 * Mirrors src-tauri/src/remote_key_commands.rs
 *
 * Usage:
 *   import { remoteKeyCreate, remoteKeyList, remoteKeyRevoke, remoteKeyRotate } from '@/services/remoteKeyManager';
 */

import { invoke } from '@tauri-apps/api/core';

export interface RemoteKeyEntry {
  key_id: string;
  label: string;
  scopes: string[];
  created_at: number;
  last_used: number | null;
  enabled: boolean;
}

export interface RemoteKeyCreateResult {
  ok: boolean;
  key_id?: string;
  secret_once?: string;
  error?: string;
}

export interface RemoteKeyListResult {
  ok: boolean;
  keys?: RemoteKeyEntry[];
  error?: string;
}

export interface RemoteKeyRevokeResult {
  ok: boolean;
  error?: string;
}

export interface RemoteKeyRotateResult {
  ok: boolean;
  new_key_id?: string;
  new_secret_once?: string;
  error?: string;
}

/**
 * Create a new named API key.
 * Returns the key_id and plaintext secret (only shown once — store securely).
 */
export const remoteKeyCreate = (
  label: string,
  scopes?: string[]
): Promise<RemoteKeyCreateResult> =>
  invoke('remote_key_create', { label, scopes: scopes ?? null });

/**
 * List all API keys (masked — secrets never returned).
 */
export const remoteKeyList = (): Promise<RemoteKeyListResult> =>
  invoke('remote_key_list');

/**
 * Revoke (disable) an API key by key_id.
 */
export const remoteKeyRevoke = (keyId: string): Promise<RemoteKeyRevokeResult> =>
  invoke('remote_key_revoke', { keyId });

/**
 * Rotate an API key: old key is disabled, new key_id + new secret returned.
 * Secret is shown only once — store securely.
 */
export const remoteKeyRotate = (keyId: string): Promise<RemoteKeyRotateResult> =>
  invoke('remote_key_rotate', { keyId });

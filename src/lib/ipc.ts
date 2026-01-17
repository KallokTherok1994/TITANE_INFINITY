/**
 * TITANE∞ — Wrapper IPC sécurisé (FIX P0)
 *
 * **Règle absolue:** Interdit fetch ipc:// — utilise invoke() exclusivement
 * **Objectif:** Éliminer erreurs CSP "Fetch API cannot load ipc://"
 *
 * © 2026 TITANE Team. All rights reserved.
 */

import { invoke } from '@tauri-apps/api/core';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES IPC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Résultat IPC standardisé
 */
export interface IpcResult<T = unknown> {
  status: 'ok' | 'error';
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Options d'invocation IPC
 */
export interface IpcOptions {
  timeout?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// WRAPPER IPC UNIQUE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper IPC centralisé — remplace tout fetch ipc://
 *
 * **RÈGLE CRITIQUE:** Aucun fetch ipc://localhost autorisé
 * Utilise exclusivement invoke() de @tauri-apps/api/core
 */
export async function ipcInvoke<T = unknown>(
  cmd: string,
  args?: Record<string, unknown>,
  options?: IpcOptions
): Promise<IpcResult<T>> {
  const timestamp = Date.now();

  try {
    // Vérification sécurité : pas de "ipc://" dans cmd
    if (cmd.includes('ipc://')) {
      throw new Error(`SECURITY_VIOLATION: ipc:// interdit dans cmd: ${cmd}`);
    }

    const result = await invoke<T>(cmd, args);

    return {
      status: 'ok',
      data: result,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      status: 'error',
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Version synchrone pour compatibilité (si nécessaire)
 */
export function ipcInvokeSync<T = unknown>(
  cmd: string,
  args?: Record<string, unknown>
): IpcResult<T> {
  throw new Error('ipcInvokeSync non implémenté — utilise ipcInvoke async');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAPPINGS COMMANDES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Commandes IPC allowlistées (mapping explicite)
 */
export const IPC_COMMANDS = {
  SINGULARITY_GET_STATE: 'singularity_get_state',
  // Ajouter autres commandes au besoin
} as const;

/**
 * Type des commandes IPC
 */
export type IpcCommand = typeof IPC_COMMANDS[keyof typeof IPC_COMMANDS];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS UTILITAIRES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si un résultat IPC est réussi
 */
export function isIpcSuccess<T>(result: IpcResult<T>): result is IpcResult<T> & { status: 'ok'; data: T } {
  return result.status === 'ok';
}

/**
 * Extrait les données d'un résultat IPC réussi, ou throw
 */
export function unwrapIpcResult<T>(result: IpcResult<T>): T {
  if (!isIpcSuccess(result)) {
    throw new Error(`IPC_ERROR: ${result.error}`);
  }
  return result.data;
}

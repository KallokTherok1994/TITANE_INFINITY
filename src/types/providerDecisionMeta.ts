/**
 * TITANE∞ — Truth Contract: ProviderDecisionMeta invariants + guards
 *
 * Ring 1 — Types only, no I/O, no side effects.
 *
 * Invariants codés:
 *   1. mode === 'REMOTE'  =>  network_used === true
 *   2. provider_used === 'local_only'  =>  mode !== 'REMOTE'
 */

import type { ProviderDecisionMeta, Mode, ReasonCode } from './providerMeta';

/**
 * Vérifie si un ProviderDecisionMeta respecte tous les invariants du Truth Contract.
 * Retourne null si valide, ou un message d'erreur si une violation est détectée.
 */
export function validateProviderDecisionMeta(
  meta: ProviderDecisionMeta,
): string | null {
  // Invariant 1: mode === 'REMOTE' => network_used === true
  // (also covers: network_used === false => mode !== 'REMOTE')
  if (meta.mode === 'REMOTE' && !meta.network_used) {
    return `NO_LYING_VIOLATION: mode=REMOTE requires network_used=true (provider=${meta.provider_used})`;
  }

  // Invariant 2: provider_used === 'local_only' => mode !== 'REMOTE'
  if (meta.provider_used === 'local_only' && meta.mode === 'REMOTE') {
    return `NO_LYING_VIOLATION: provider_used=local_only cannot have mode=REMOTE`;
  }

  return null;
}

/**
 * Clamp un ProviderDecisionMeta vers un état cohérent si une violation est détectée.
 * Log NO_LYING_VIOLATION_BACKEND et retourne un meta corrigé avec reason_code=CONTRACT_VIOLATION_CLAMPED.
 */
export function clampProviderDecisionMeta(
  meta: ProviderDecisionMeta,
): ProviderDecisionMeta {
  const violation = validateProviderDecisionMeta(meta);
  if (!violation) {
    return meta;
  }

  console.error(`[NO_LYING_VIOLATION_BACKEND] ${violation}`);

  // Clamp: si network_used=false ou provider=local_only, mode ne peut pas être REMOTE → forcer LOCAL
  const clampedMode: Mode = !meta.network_used || meta.provider_used === 'local_only'
    ? 'LOCAL'
    : meta.mode;

  const clampedReasonCode: ReasonCode = 'CONTRACT_VIOLATION_CLAMPED';

  return {
    ...meta,
    mode: clampedMode,
    reason_code: clampedReasonCode,
  };
}

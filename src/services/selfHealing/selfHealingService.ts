/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Self-Healing Service
 * Pont applicatif entre l'UI et le SelfHealingEngine local.
 * ═══════════════════════════════════════════════════════════════
 */

import { runSelfHealing } from '@/engines/selfHealing';
import type { SelfHealingRunResult } from '@/engines/selfHealing';

export type {
  SelfHealingRunResult,
  SelfHealingContext,
  PlaybookPlan,
  ApplyPatchResult,
  EscalationResult,
} from '@/engines/selfHealing';

/**
 * Déclenche un cycle complet d'auto-guérison.
 * @param symptoms Description synthétique des symptômes détectés.
 */
export async function triggerSelfHealing(
  symptoms: string
): Promise<SelfHealingRunResult> {
  if (!symptoms || symptoms?.trim().length === 0) {
    throw new Error('Symptômes requis pour lancer le self-healing.');
  }

  return runSelfHealing(symptoms?.trim());
}

/**
 * Extrait un résumé lisible d'un résultat de self-healing.
 */
export function summarizeSelfHealing(any: any) {
  const { context, parsed, patchResult, escalation } = result;

  return {
    timestamp: Date?.now(),
    symptoms: context?.symptoms,
    diagnostic: parsed?.diagnostic,
    confidence: parsed?.confidence,
    patchApplied: patchResult?.applied,
    steps: patchResult?.steps,
    escalation: escalation?.channel,
  };
}

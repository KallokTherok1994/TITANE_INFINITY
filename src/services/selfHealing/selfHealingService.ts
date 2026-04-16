/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ — Self-Healing Service
 * Pont applicatif entre l'UI et le SelfHealingEngine local.
 * ═══════════════════════════════════════════════════════════════
 */

import { runSelfHealing } from './selfHealingIOAdapter';
import type { SelfHealingRunResult } from './selfHealingIOAdapter';

export type {
  SelfHealingRunResult,
  SelfHealingContext,
  PlaybookPlan,
  ApplyPatchResult,
  EscalationResult,
} from '@/engines/selfHealing';

export type AntiRegressionScope =
  | 'ui'
  | 'runtime'
  | 'performance'
  | 'config'
  | 'cross-surface';

export type AntiRegressionStatus = 'healthy' | 'watch' | 'blocked';

export type AntiRegressionSeverity = 'low' | 'medium' | 'high';

export interface AntiRegressionSnapshotInput {
  anomalyScore: number;
  safeModeActive: boolean;
  circuitBreakerActive: boolean;
  degradedModeActive: boolean;
  pendingActions: string[];
  isConnected: boolean;
  historySize: number;
}

export interface AntiRegressionSnapshot {
  agentName: 'anti-regression-guardian';
  scope: AntiRegressionScope;
  status: AntiRegressionStatus;
  severity: AntiRegressionSeverity;
  activeSignals: string[];
  recommendedChecks: string[];
}

const SIGNAL_TO_SCOPE: Array<{ match: string; scope: Exclude<AntiRegressionScope, 'cross-surface'> }> = [
  { match: 'backend', scope: 'runtime' },
  { match: 'safe_mode', scope: 'runtime' },
  { match: 'circuit_breaker', scope: 'runtime' },
  { match: 'degraded_mode', scope: 'runtime' },
  { match: 'pending_actions', scope: 'ui' },
  { match: 'history_growth', scope: 'config' },
  { match: 'anomaly_score', scope: 'performance' },
];

function classifyAntiRegressionScope(activeSignals: string[]): AntiRegressionScope {
  const scopes = new Set<Exclude<AntiRegressionScope, 'cross-surface'>>();

  for (const signal of activeSignals) {
    const matched = SIGNAL_TO_SCOPE.find(entry => signal.includes(entry.match));
    if (matched) {
      scopes.add(matched.scope);
    }
  }

  if (scopes.size > 1) {
    return 'cross-surface';
  }

  return scopes.values().next().value ?? 'runtime';
}

function classifyAntiRegressionSeverity(
  activeSignals: string[],
  input: AntiRegressionSnapshotInput
): AntiRegressionSeverity {
  if (
    input.safeModeActive ||
    input.circuitBreakerActive ||
    input.anomalyScore >= 0.7 ||
    !input.isConnected
  ) {
    return 'high';
  }

  if (
    input.degradedModeActive ||
    input.pendingActions.length > 0 ||
    input.anomalyScore >= 0.4 ||
    activeSignals.length > 1
  ) {
    return 'medium';
  }

  return 'low';
}

export function buildAntiRegressionSnapshot(
  input: AntiRegressionSnapshotInput
): AntiRegressionSnapshot {
  const activeSignals: string[] = [];

  if (input.anomalyScore >= 0.4) {
    activeSignals.push(`anomaly_score:${input.anomalyScore.toFixed(2)}`);
  }
  if (input.safeModeActive) {
    activeSignals.push('safe_mode:active');
  }
  if (input.circuitBreakerActive) {
    activeSignals.push('circuit_breaker:active');
  }
  if (input.degradedModeActive) {
    activeSignals.push('degraded_mode:active');
  }
  if (input.pendingActions.length > 0) {
    activeSignals.push(`pending_actions:${input.pendingActions.length}`);
  }
  if (!input.isConnected) {
    activeSignals.push('backend:disconnected');
  }
  if (input.historySize >= 5) {
    activeSignals.push(`history_growth:${input.historySize}`);
  }

  const severity = classifyAntiRegressionSeverity(activeSignals, input);
  const status: AntiRegressionStatus =
    severity === 'high' ? 'blocked' : severity === 'medium' ? 'watch' : 'healthy';

  const recommendedChecks = [
    !input.isConnected ? 'Vérifier le backend Tauri et la chaîne IPC canonique' : null,
    input.safeModeActive || input.circuitBreakerActive
      ? 'Qualifier la dérive runtime avant nouvelle activation de correctifs'
      : null,
    input.pendingActions.length > 0
      ? 'Traiter les actions en attente pour éviter une dérive UI non qualifiée'
      : null,
    input.anomalyScore >= 0.4 ? 'Contrôler la stabilité et la performance de la surface active' : null,
  ].filter((value): value is string => value !== null);

  return {
    agentName: 'anti-regression-guardian',
    scope: classifyAntiRegressionScope(activeSignals),
    status,
    severity,
    activeSignals,
    recommendedChecks,
  };
}

/**
 * Déclenche un cycle complet d'auto-guérison.
 * @param symptoms Description synthétique des symptômes détectés.
 */
export async function triggerSelfHealing(
  symptoms: string
): Promise<SelfHealingRunResult> {
  if (!symptoms || symptoms.trim().length === 0) {
    throw new Error('Symptômes requis pour lancer le self-healing.');
  }

  return runSelfHealing(symptoms.trim());
}

/**
 * Extrait un résumé lisible d'un résultat de self-healing.
 */
export function summarizeSelfHealing(result: SelfHealingRunResult) {
  const { context, parsed, patchResult, escalation } = result;

  return {
    timestamp: Date.now(),
    symptoms: context.symptoms,
    diagnostic: parsed.diagnostic,
    confidence: parsed.confidence,
    patchApplied: patchResult.applied,
    steps: patchResult.steps,
    escalation: escalation.channel,
  };
}

export async function runAntiRegressionCycle(symptoms: string): Promise<{
  snapshot: AntiRegressionSnapshot;
  result: SelfHealingRunResult;
}> {
  const snapshot = buildAntiRegressionSnapshot({
    anomalyScore: /critical|latency|slow|perf/i.test(symptoms) ? 0.7 : 0.45,
    safeModeActive: /safe mode|blocked/i.test(symptoms),
    circuitBreakerActive: /circuit|ipc|backend/i.test(symptoms),
    degradedModeActive: /degraded|fallback/i.test(symptoms),
    pendingActions: /pending|confirm/i.test(symptoms) ? ['review'] : [],
    isConnected: !/offline|disconnected/i.test(symptoms),
    historySize: /recurrence|history/i.test(symptoms) ? 6 : 1,
  });

  const result = await triggerSelfHealing(symptoms);
  return { snapshot, result };
}

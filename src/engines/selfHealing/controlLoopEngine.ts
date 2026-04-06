export type ControlState = 'healthy' | 'degraded' | 'critical';

export interface HealthSignal {
  subsystem: 'chat' | 'memory' | 'retrieval' | 'tools' | 'gateway' | 'ui';
  severity: number;
  message: string;
}

export interface BreakerSnapshot {
  provider: boolean;
  tools: boolean;
  memory: boolean;
}

export interface ControlLoopInput {
  loopId: string;
  nowMs: number;
  previousState: ControlState;
  budget: number;
  signals: HealthSignal[];
  breakers: BreakerSnapshot;
  lastActionAtMs?: number;
  lastActionKey?: string;
}

export interface BoundedAction {
  key: string;
  maxSteps: number;
  verifySuite: string;
  expectedTargetState: ControlState;
}

export interface ControlLoopDecision {
  loopId: string;
  decision: 'NO_ACTION' | 'REMEDIATE' | 'SAFE_MODE';
  reasons: string[];
  oscillationGuardTriggered: boolean;
  budgetBefore: number;
  budgetAfter: number;
  expectedImpact: string;
  boundedAction: BoundedAction | null;
  verifyOrRollback: true;
}

export interface ControlLoopConfig {
  enterDegradedThreshold: number;
  exitDegradedThreshold: number;
  enterCriticalThreshold: number;
  cooldownMs: number;
}

const DEFAULT_CONFIG: ControlLoopConfig = {
  enterDegradedThreshold: 0.65,
  exitDegradedThreshold: 0.45,
  enterCriticalThreshold: 0.85,
  cooldownMs: 30_000,
};

export class ControlLoopEngine {
  private readonly config: ControlLoopConfig;

  constructor(config?: Partial<ControlLoopConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  decide(input: ControlLoopInput): ControlLoopDecision {
    const budgetBefore = input.budget;
    const maxSeverity = this.computeMaxSeverity(input.signals);
    const nextState = this.deriveState(maxSeverity, input.previousState);

    const inCooldown =
      typeof input.lastActionAtMs === 'number' &&
      input.nowMs - input.lastActionAtMs < this.config.cooldownMs;

    if (inCooldown) {
      return {
        loopId: input.loopId,
        decision: 'NO_ACTION',
        reasons: ['NO_ACTION_UNSTABLE', 'COOLDOWN_ACTIVE'],
        oscillationGuardTriggered: true,
        budgetBefore,
        budgetAfter: budgetBefore,
        expectedImpact: 'Stabilisation sans action pour éviter oscillation.',
        boundedAction: null,
        verifyOrRollback: true,
      };
    }

    if (budgetBefore <= 0) {
      return {
        loopId: input.loopId,
        decision: 'SAFE_MODE',
        reasons: ['BUDGET_EXHAUSTED'],
        oscillationGuardTriggered: false,
        budgetBefore,
        budgetAfter: budgetBefore,
        expectedImpact: 'Entrée en mode sûr avec escalade.',
        boundedAction: null,
        verifyOrRollback: true,
      };
    }

    if (nextState === 'healthy') {
      return {
        loopId: input.loopId,
        decision: 'NO_ACTION',
        reasons: ['TARGET_ALREADY_HEALTHY'],
        oscillationGuardTriggered: false,
        budgetBefore,
        budgetAfter: budgetBefore,
        expectedImpact: 'Conservation état stable.',
        boundedAction: null,
        verifyOrRollback: true,
      };
    }

    const reasons = this.collectReasons(nextState, input);
    const action: BoundedAction = {
      key: nextState === 'critical' ? 'remediate_critical' : 'remediate_degraded',
      maxSteps: nextState === 'critical' ? 3 : 2,
      verifySuite: 'verify_control_loop_health',
      expectedTargetState: nextState === 'critical' ? 'degraded' : 'healthy',
    };

    return {
      loopId: input.loopId,
      decision: 'REMEDIATE',
      reasons,
      oscillationGuardTriggered: false,
      budgetBefore,
      budgetAfter: budgetBefore - 1,
      expectedImpact:
        nextState === 'critical'
          ? 'Réduction de criticité puis convergence.'
          : 'Retour vers état healthy.',
      boundedAction: action,
      verifyOrRollback: true,
    };
  }

  private computeMaxSeverity(signals: HealthSignal[]): number {
    if (signals.length === 0) {
      return 0;
    }

    return signals.reduce((max, signal) => Math.max(max, signal.severity), 0);
  }

  private deriveState(maxSeverity: number, previousState: ControlState): ControlState {
    if (maxSeverity >= this.config.enterCriticalThreshold) {
      return 'critical';
    }

    if (previousState === 'degraded') {
      return maxSeverity <= this.config.exitDegradedThreshold ? 'healthy' : 'degraded';
    }

    return maxSeverity >= this.config.enterDegradedThreshold ? 'degraded' : 'healthy';
  }

  private collectReasons(state: ControlState, input: ControlLoopInput): string[] {
    const reasons: string[] = [
      state === 'critical' ? 'STATE_CRITICAL' : 'STATE_DEGRADED',
    ];

    if (input.breakers.provider) {
      reasons.push('BREAKER_PROVIDER_OPEN');
    }

    if (input.breakers.tools) {
      reasons.push('BREAKER_TOOLS_OPEN');
    }

    if (input.breakers.memory) {
      reasons.push('BREAKER_MEMORY_OPEN');
    }

    return reasons;
  }
}

export function simulateNoStorm(
  engine: ControlLoopEngine,
  inputs: ControlLoopInput[]
): { noStorm: boolean; remediationCount: number } {
  let remediationCount = 0;

  for (const input of inputs) {
    const decision = engine.decide(input);
    if (decision.decision === 'REMEDIATE') {
      remediationCount += 1;
    }
  }

  return {
    noStorm: remediationCount <= Math.ceil(inputs.length / 2),
    remediationCount,
  };
}

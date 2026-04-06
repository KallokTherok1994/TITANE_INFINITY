export type ResilienceLane = 'provider' | 'tools' | 'memory';

export interface TimeoutBudgetPolicy {
  timeoutMs: number;
  maxRetries: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
  jitterMaxMs: number;
}

export interface BulkheadPolicy {
  lane: ResilienceLane;
  maxInFlight: number;
}

export interface BreakerPolicy {
  failureThreshold: number;
  cooldownMs: number;
}

export interface ResiliencePolicy {
  timeout: Record<ResilienceLane, TimeoutBudgetPolicy>;
  bulkheads: Record<ResilienceLane, BulkheadPolicy>;
  breakers: Record<ResilienceLane, BreakerPolicy>;
}

export interface ExecutionRequest {
  requestId: string;
  lane: ResilienceLane;
  nowMs: number;
  attempt: number;
}

export interface ExecutionPlan {
  allowed: boolean;
  timeoutMs: number;
  retryAllowed: boolean;
  nextBackoffMs: number;
  breakerOpen: boolean;
  reasons: string[];
}

export interface BreakerState {
  open: boolean;
  openedAtMs?: number;
  consecutiveFailures: number;
  lastReason?: string;
}

export interface ResilienceTraceFrame {
  requestId: string;
  lane: ResilienceLane;
  timeoutMs: number;
  retryAllowed: boolean;
  nextBackoffMs: number;
  breakerOpen: boolean;
  reasons: string[];
}

const DEFAULT_POLICY: ResiliencePolicy = {
  timeout: {
    provider: {
      timeoutMs: 8_000,
      maxRetries: 2,
      backoffBaseMs: 250,
      backoffMaxMs: 2_500,
      jitterMaxMs: 100,
    },
    tools: {
      timeoutMs: 4_000,
      maxRetries: 1,
      backoffBaseMs: 150,
      backoffMaxMs: 1_500,
      jitterMaxMs: 50,
    },
    memory: {
      timeoutMs: 2_000,
      maxRetries: 1,
      backoffBaseMs: 100,
      backoffMaxMs: 1_000,
      jitterMaxMs: 25,
    },
  },
  bulkheads: {
    provider: { lane: 'provider', maxInFlight: 4 },
    tools: { lane: 'tools', maxInFlight: 3 },
    memory: { lane: 'memory', maxInFlight: 6 },
  },
  breakers: {
    provider: { failureThreshold: 3, cooldownMs: 20_000 },
    tools: { failureThreshold: 3, cooldownMs: 10_000 },
    memory: { failureThreshold: 4, cooldownMs: 5_000 },
  },
};

export class ResilienceEngine {
  private readonly policy: ResiliencePolicy;
  private readonly breakerState: Record<ResilienceLane, BreakerState>;
  private readonly inFlightCount: Record<ResilienceLane, number>;

  constructor(policy?: Partial<ResiliencePolicy>) {
    this.policy = {
      timeout: {
        ...DEFAULT_POLICY.timeout,
        ...(policy?.timeout ?? {}),
      },
      bulkheads: {
        ...DEFAULT_POLICY.bulkheads,
        ...(policy?.bulkheads ?? {}),
      },
      breakers: {
        ...DEFAULT_POLICY.breakers,
        ...(policy?.breakers ?? {}),
      },
    };

    this.breakerState = {
      provider: { open: false, consecutiveFailures: 0 },
      tools: { open: false, consecutiveFailures: 0 },
      memory: { open: false, consecutiveFailures: 0 },
    };

    this.inFlightCount = {
      provider: 0,
      tools: 0,
      memory: 0,
    };
  }

  begin(request: ExecutionRequest): ExecutionPlan {
    const reasons: string[] = [];
    const breakerOpen = this.isBreakerOpen(request.lane, request.nowMs, reasons);
    const timeoutPolicy = this.policy.timeout[request.lane];

    if (breakerOpen) {
      return {
        allowed: false,
        timeoutMs: timeoutPolicy.timeoutMs,
        retryAllowed: false,
        nextBackoffMs: 0,
        breakerOpen: true,
        reasons,
      };
    }

    const bulkhead = this.policy.bulkheads[request.lane];
    if (this.inFlightCount[request.lane] >= bulkhead.maxInFlight) {
      reasons.push('BULKHEAD_LIMIT_REACHED');
      return {
        allowed: false,
        timeoutMs: timeoutPolicy.timeoutMs,
        retryAllowed: false,
        nextBackoffMs: 0,
        breakerOpen: false,
        reasons,
      };
    }

    this.inFlightCount[request.lane] += 1;
    const retryAllowed = request.attempt < timeoutPolicy.maxRetries;

    return {
      allowed: true,
      timeoutMs: timeoutPolicy.timeoutMs,
      retryAllowed,
      nextBackoffMs: retryAllowed
        ? this.computeBackoffMs(timeoutPolicy, request.attempt)
        : 0,
      breakerOpen: false,
      reasons,
    };
  }

  complete(request: ExecutionRequest, success: boolean, reason?: string): BreakerState {
    this.inFlightCount[request.lane] = Math.max(0, this.inFlightCount[request.lane] - 1);
    const breakerPolicy = this.policy.breakers[request.lane];
    const laneState = this.breakerState[request.lane];

    if (success) {
      laneState.consecutiveFailures = 0;
      laneState.open = false;
      laneState.openedAtMs = undefined;
      laneState.lastReason = undefined;
      return { ...laneState };
    }

    laneState.consecutiveFailures += 1;
    laneState.lastReason = reason ?? 'UNKNOWN_FAILURE';

    if (laneState.consecutiveFailures >= breakerPolicy.failureThreshold) {
      laneState.open = true;
      laneState.openedAtMs = request.nowMs;
    }

    return { ...laneState };
  }

  getTraceFrame(request: ExecutionRequest): ResilienceTraceFrame {
    const plan = this.begin(request);

    return {
      requestId: request.requestId,
      lane: request.lane,
      timeoutMs: plan.timeoutMs,
      retryAllowed: plan.retryAllowed,
      nextBackoffMs: plan.nextBackoffMs,
      breakerOpen: plan.breakerOpen,
      reasons: plan.reasons,
    };
  }

  snapshot(): {
    breakerState: Record<ResilienceLane, BreakerState>;
    inFlightCount: Record<ResilienceLane, number>;
  } {
    return {
      breakerState: {
        provider: { ...this.breakerState.provider },
        tools: { ...this.breakerState.tools },
        memory: { ...this.breakerState.memory },
      },
      inFlightCount: {
        provider: this.inFlightCount.provider,
        tools: this.inFlightCount.tools,
        memory: this.inFlightCount.memory,
      },
    };
  }

  private isBreakerOpen(lane: ResilienceLane, nowMs: number, reasons: string[]): boolean {
    const laneState = this.breakerState[lane];
    if (!laneState.open) {
      return false;
    }

    const breakerPolicy = this.policy.breakers[lane];
    if (typeof laneState.openedAtMs === 'number') {
      const elapsed = nowMs - laneState.openedAtMs;
      if (elapsed >= breakerPolicy.cooldownMs) {
        laneState.open = false;
        laneState.consecutiveFailures = 0;
        laneState.openedAtMs = undefined;
        laneState.lastReason = undefined;
        return false;
      }
    }

    reasons.push('BREAKER_OPEN');
    if (laneState.lastReason) {
      reasons.push(`BREAKER_REASON_${laneState.lastReason}`);
    }
    return true;
  }

  private computeBackoffMs(policy: TimeoutBudgetPolicy, attempt: number): number {
    const exponential = policy.backoffBaseMs * 2 ** Math.max(0, attempt);
    const bounded = Math.min(policy.backoffMaxMs, exponential);
    const deterministicJitter = Math.min(policy.jitterMaxMs, 13 * (attempt + 1));
    return bounded + deterministicJitter;
  }
}

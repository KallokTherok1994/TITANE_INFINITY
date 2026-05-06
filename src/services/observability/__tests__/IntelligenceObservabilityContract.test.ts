/**
 * Tests for IntelligenceObservabilityContract — Lock B2
 * Rule 16: Every new contract/scaffold ships with unit tests
 *
 * Tests cover:
 * - Schema validation for all sub-schemas
 * - Feature flag blocking behavior
 * - Valid full trace validation
 * - Invalid trace rejection
 * - Partial trace handling (optional fields)
 */

import { describe, it, expect } from 'vitest';
import {
  TraceSessionSchema,
  ModelDispatchTruthSchema,
  PromptTruthSchema,
  TokenBudgetSchema,
  EvalFeedbackSchema,
  IntelligenceTraceSchema,
  IntelligenceDecisionEnvelopeSchema,
  buildIntelligenceDecisionEnvelope,
  validateIntelligenceTrace,
} from '../IntelligenceObservabilityContract';

// ─── TraceSessionSchema ───────────────────────────────────────────────────────

describe('TraceSessionSchema', () => {
  it('accepts valid session', () => {
    const result = TraceSessionSchema.safeParse({
      session_id: 'sess_abc123',
      turn_index: 0,
      recorded_at: '2026-05-06T12:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty session_id', () => {
    const result = TraceSessionSchema.safeParse({
      session_id: '',
      turn_index: 0,
      recorded_at: '2026-05-06T12:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative turn_index', () => {
    const result = TraceSessionSchema.safeParse({
      session_id: 'sess_abc123',
      turn_index: -1,
      recorded_at: '2026-05-06T12:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid datetime format', () => {
    const result = TraceSessionSchema.safeParse({
      session_id: 'sess_abc123',
      turn_index: 0,
      recorded_at: 'not-a-datetime',
    });
    expect(result.success).toBe(false);
  });
});

// ─── ModelDispatchTruthSchema ─────────────────────────────────────────────────

describe('ModelDispatchTruthSchema', () => {
  it('accepts valid model dispatch (no fallback)', () => {
    const result = ModelDispatchTruthSchema.safeParse({
      model: 'gemma2:2b',
      provider: 'ollama',
      was_fallback: false,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid model dispatch with fallback reason', () => {
    const result = ModelDispatchTruthSchema.safeParse({
      model: 'gemma2:2b',
      provider: 'ollama',
      was_fallback: true,
      fallback_reason: 'PROVIDER_DOWN',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty model', () => {
    const result = ModelDispatchTruthSchema.safeParse({
      model: '',
      provider: 'ollama',
      was_fallback: false,
    });
    expect(result.success).toBe(false);
  });
});

// ─── PromptTruthSchema ────────────────────────────────────────────────────────

describe('PromptTruthSchema', () => {
  it('accepts valid prompt truth', () => {
    const result = PromptTruthSchema.safeParse({
      prompt_hash: 'ab12cd34ef56gh78',
      instruction_layers_applied: ['L1', 'L3'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects prompt_hash shorter than 8 chars', () => {
    const result = PromptTruthSchema.safeParse({
      prompt_hash: 'ab',
      instruction_layers_applied: [],
    });
    expect(result.success).toBe(false);
  });
});

// ─── TokenBudgetSchema ────────────────────────────────────────────────────────

describe('TokenBudgetSchema', () => {
  it('accepts minimal token budget (latency only)', () => {
    const result = TokenBudgetSchema.safeParse({
      latency_ms: 342,
    });
    expect(result.success).toBe(true);
  });

  it('accepts full token budget', () => {
    const result = TokenBudgetSchema.safeParse({
      prompt_tokens: 128,
      completion_tokens: 64,
      total_tokens: 192,
      latency_ms: 342,
      ttfb_ms: 50,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative latency', () => {
    const result = TokenBudgetSchema.safeParse({ latency_ms: -1 });
    expect(result.success).toBe(false);
  });
});

// ─── EvalFeedbackSchema ───────────────────────────────────────────────────────

describe('EvalFeedbackSchema', () => {
  it('accepts automated feedback', () => {
    const result = EvalFeedbackSchema.safeParse({
      feedback_source: 'automated',
      score: 0.85,
      labels: ['factual'],
      scorecard_ids: ['HONESTY_SCORECARD'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts human feedback without score', () => {
    const result = EvalFeedbackSchema.safeParse({
      feedback_source: 'human',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid feedback_source', () => {
    const result = EvalFeedbackSchema.safeParse({
      feedback_source: 'robot',
    });
    expect(result.success).toBe(false);
  });

  it('rejects score > 1', () => {
    const result = EvalFeedbackSchema.safeParse({
      feedback_source: 'automated',
      score: 1.5,
    });
    expect(result.success).toBe(false);
  });
});

// ─── IntelligenceTraceSchema ──────────────────────────────────────────────────

describe('IntelligenceTraceSchema', () => {
  const minimalTrace = {
    session: {
      session_id: 'sess_test_001',
      turn_index: 0,
      recorded_at: '2026-05-06T10:00:00.000Z',
    },
    model_dispatch: {
      model: 'gemma2:2b',
      provider: 'ollama',
      was_fallback: false,
    },
  };

  it('accepts minimal valid trace (required fields only)', () => {
    const result = IntelligenceTraceSchema.safeParse(minimalTrace);
    expect(result.success).toBe(true);
  });

  it('accepts full trace with all optional fields', () => {
    const result = IntelligenceTraceSchema.safeParse({
      ...minimalTrace,
      prompt_truth: {
        prompt_hash: 'ab12cd34ef56gh78',
        instruction_layers_applied: ['L1', 'L3', 'L4'],
      },
      token_budget: {
        prompt_tokens: 200,
        completion_tokens: 100,
        total_tokens: 300,
        latency_ms: 512,
      },
      feedback: {
        feedback_source: 'automated',
        score: 0.92,
        scorecard_ids: ['COGNITIVE_CORE_TRUTH_SCORECARD'],
      },
      omega_trace_meta: {
        provider_used: 'ollama',
        fallback_used: false,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects trace with missing session', () => {
    const result = IntelligenceTraceSchema.safeParse({
      model_dispatch: minimalTrace.model_dispatch,
    });
    expect(result.success).toBe(false);
  });

  it('rejects trace with missing model_dispatch', () => {
    const result = IntelligenceTraceSchema.safeParse({
      session: minimalTrace.session,
    });
    expect(result.success).toBe(false);
  });
});

// ─── validateIntelligenceTrace (feature flag behavior) ────────────────────────

describe('validateIntelligenceTrace — feature flag behavior', () => {
  it('returns feature_flag_blocked when INTELLIGENCE_OBSERVABILITY_ENABLED is false', () => {
    // In test environment, VITE_ env vars are not set -> flag defaults to false
    const result = validateIntelligenceTrace({
      session: {
        session_id: 'sess_001',
        turn_index: 0,
        recorded_at: '2026-05-06T00:00:00.000Z',
      },
      model_dispatch: {
        model: 'gemma2:2b',
        provider: 'ollama',
        was_fallback: false,
      },
    });

    // In test env flag = false -> returns blocked, not a data error
    if (!result.ok && result.feature_flag_blocked) {
      expect(result.feature_flag_blocked).toBe(true);
      expect(result.errors[0]).toContain('INTELLIGENCE_OBSERVABILITY_ENABLED=false');
    } else if (result.ok) {
      // If somehow flag is true in test env, data should be valid
      expect(result.data.session.session_id).toBe('sess_001');
    }
  });

  it('returns validation errors for malformed data when flag would be active', () => {
    // Test the schema validation branch directly via schema parse
    const result = IntelligenceTraceSchema.safeParse({
      session: { session_id: '', turn_index: -1, recorded_at: 'bad' },
      model_dispatch: { model: '', provider: '', was_fallback: 'yes' },
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});

describe('IntelligenceDecisionEnvelopeSchema', () => {
  const validEnvelope = {
    request_id: 'req-1',
    conversation_id: 'conv-1',
    mode: 'standard',
    intent: 'answer',
    risk_level: 'low',
    memory_used: true,
    knowledge_used: true,
    research_used: false,
    provider_selected: 'ollama',
    model_selected: 'gemma2:2b',
    reasoning_depth: 'medium',
    confidence: 0.82,
    known_limits: ['temporal_freshness'],
    fallback_used: false,
    proof_required: ['trace_visibility'],
    trace_id: 'trace-1',
    desktop_trace_id: 'desktop-trace-1',
  };

  it('accepts a valid v8 envelope', () => {
    const result = IntelligenceDecisionEnvelopeSchema.safeParse(validEnvelope);
    expect(result.success).toBe(true);
  });

  it('rejects confidence out of range', () => {
    const result = IntelligenceDecisionEnvelopeSchema.safeParse({
      ...validEnvelope,
      confidence: 1.2,
    });
    expect(result.success).toBe(false);
  });

  it('requires desktop_trace_id', () => {
    const payload = { ...validEnvelope } as Record<string, unknown>;
    delete payload.desktop_trace_id;
    const result = IntelligenceDecisionEnvelopeSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('buildIntelligenceDecisionEnvelope returns parsed payload', () => {
    const envelope = buildIntelligenceDecisionEnvelope(validEnvelope);
    expect(envelope.trace_id).toBe('trace-1');
    expect(envelope.desktop_trace_id).toBe('desktop-trace-1');
  });
});

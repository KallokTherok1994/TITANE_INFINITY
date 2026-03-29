/**
 * TITANE∞ — P2.1 STRUCTURED OUTPUTS TRUTH CONTRACT TESTS
 * Bounded proof scenarios for IPC truth envelope validation.
 *
 * SC1: Positive path — valid ProviderDecisionMeta passes
 * SC2: Positive path — valid OmegaTraceMeta passes
 * SC3: Positive path — valid full ConversationResponse passes
 * SC4: Negative path — invalid reason_code is caught
 * SC5: Negative path — missing required field is caught
 * SC6: Negative path — empty assistant_message is caught
 * SC7: Negative path — mode/reason_code truth invariant enforced
 */

import { describe, it, expect } from 'vitest';
import {
  validateConversationResponse,
  validateProviderDecisionMeta,
  validateOmegaTraceMeta,
  ProviderDecisionMetaSchema,
  OmegaTraceMetaSchema,
  ReasonCodeSchema,
  ModeSchema,
} from '@/schemas/ipcTruthContracts';

// ═══════════════════════════════════════════════════════════════════
// FIXTURES
// ═══════════════════════════════════════════════════════════════════

const validProviderMeta = {
  provider_used: 'ollama',
  provider_class: 'local',
  mode: 'LOCAL',
  reason_code: 'OK',
  latency_ms_total: 1200,
  timeout_ms: 30000,
  retries: 0,
  attempts: [
    {
      provider_id: 'ollama',
      provider_class: 'local',
      latency_ms: 1200,
      outcome: 'success',
      reason_code: 'OK',
      network_used_attempt: false,
    },
  ],
  network_used: false,
  cache_hit: false,
  policy: 'default',
};

const validOmegaTraceMeta = {
  canonical_mode: 'default',
  profile_id: 'balanced',
  effort_level: 'normal',
  model_class: 'local',
  classifier_confidence: 0.85,
  classifier_reason_code: 'keyword_match',
  classifier_signals: ['memory_keyword'],
  resolved_backend_mode: 'default',
  provider_used: 'ollama',
  fallback_used: false,
};

const validConversationResponse = {
  assistant_message: 'Bonjour, comment puis-je vous aider ?',
  conversation_id: 'conv-abc123',
  message_id: 'msg-xyz789',
  detected_intention: 'Question',
  detected_emotion: { valence: 0.2, intensity: 0.3, energy: 0.5 },
  cognitive_tags: ['factual'],
  cognitive_summary: 'Question factuelle simple',
  metadata: {
    timestamp: 1743270000000,
    provider_used: 'ollama',
    latency_ms: 1200,
    tokens_used: 150,
    memory_effect: 'New',
    links_to_contexts: [],
  },
  meta: validProviderMeta,
  omega_trace_meta: validOmegaTraceMeta,
};

// ═══════════════════════════════════════════════════════════════════
// SC1: VALID PROVIDER META PASSES
// ═══════════════════════════════════════════════════════════════════

describe('SC1: valid ProviderDecisionMeta passes', () => {
  it('accepts a well-formed provider meta', () => {
    const result = validateProviderDecisionMeta(validProviderMeta);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.provider_used).toBe('ollama');
      expect(result.data.mode).toBe('LOCAL');
      expect(result.data.reason_code).toBe('OK');
      expect(result.data.network_used).toBe(false);
    }
  });

  it('accepts remote provider meta', () => {
    const remoteMeta = {
      ...validProviderMeta,
      provider_used: 'gemini',
      provider_class: 'remote',
      mode: 'REMOTE',
      network_used: true,
      attempts: [
        {
          ...validProviderMeta.attempts[0],
          provider_id: 'gemini',
          provider_class: 'remote',
          network_used_attempt: true,
        },
      ],
    };
    const result = validateProviderDecisionMeta(remoteMeta);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mode).toBe('REMOTE');
      expect(result.data.network_used).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC2: VALID OMEGA TRACE META PASSES
// ═══════════════════════════════════════════════════════════════════

describe('SC2: valid OmegaTraceMeta passes', () => {
  it('accepts a well-formed omega trace meta', () => {
    const result = validateOmegaTraceMeta(validOmegaTraceMeta);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.canonical_mode).toBe('default');
      expect(result.data.classifier_confidence).toBe(0.85);
      expect(result.data.fallback_used).toBe(false);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC3: VALID FULL CONVERSATION RESPONSE PASSES
// ═══════════════════════════════════════════════════════════════════

describe('SC3: valid full ConversationResponse passes', () => {
  it('accepts a well-formed conversation response', () => {
    const result = validateConversationResponse(validConversationResponse);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.assistant_message).toBe('Bonjour, comment puis-je vous aider ?');
      expect(result.data.meta?.provider_used).toBe('ollama');
      expect(result.data.omega_trace_meta?.canonical_mode).toBe('default');
    }
  });

  it('accepts response without optional meta fields', () => {
    const minimalResponse = {
      assistant_message: 'Réponse minimale',
      conversation_id: 'conv-min',
      message_id: 'msg-min',
      detected_intention: 'Action',
      detected_emotion: { valence: 0, intensity: 0, energy: 0 },
      cognitive_tags: [],
      cognitive_summary: '',
      metadata: {
        timestamp: 1743270000000,
        provider_used: 'local',
        latency_ms: 50,
        tokens_used: 10,
        memory_effect: 'New',
        links_to_contexts: [],
      },
    };
    const result = validateConversationResponse(minimalResponse);
    expect(result.ok).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC4: INVALID REASON_CODE IS CAUGHT
// ═══════════════════════════════════════════════════════════════════

describe('SC4: invalid reason_code is caught', () => {
  it('rejects unknown reason_code', () => {
    const badMeta = { ...validProviderMeta, reason_code: 'BOGUS_REASON' };
    const result = validateProviderDecisionMeta(badMeta);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('reason_code'))).toBe(true);
    }
  });

  it('catches reason_code drift in full response', () => {
    const badResponse = {
      ...validConversationResponse,
      meta: { ...validProviderMeta, reason_code: 'MADE_UP' },
    };
    const result = validateConversationResponse(badResponse);
    expect(result.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC5: MISSING REQUIRED FIELD IS CAUGHT
// ═══════════════════════════════════════════════════════════════════

describe('SC5: missing required field is caught', () => {
  it('rejects meta without provider_used', () => {
    const { provider_used, ...incomplete } = validProviderMeta;
    const result = validateProviderDecisionMeta(incomplete);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('provider_used'))).toBe(true);
    }
  });

  it('rejects response without conversation_id', () => {
    const { conversation_id, ...incomplete } = validConversationResponse;
    const result = validateConversationResponse(incomplete);
    expect(result.ok).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC6: EMPTY ASSISTANT_MESSAGE IS CAUGHT
// ═══════════════════════════════════════════════════════════════════

describe('SC6: empty assistant_message is caught', () => {
  it('rejects empty string assistant_message', () => {
    const badResponse = { ...validConversationResponse, assistant_message: '' };
    const result = validateConversationResponse(badResponse);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('assistant_message'))).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// SC7: MODE/REASON_CODE TRUTH INVARIANT
// ═══════════════════════════════════════════════════════════════════

describe('SC7: mode/reason_code truth invariant', () => {
  it('detects invalid mode value', () => {
    const badMeta = { ...validProviderMeta, mode: 'OFFLINE_SIM' };
    const result = validateProviderDecisionMeta(badMeta);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('mode'))).toBe(true);
    }
  });

  it('detects invalid provider_class', () => {
    const badMeta = { ...validProviderMeta, provider_class: 'cloud' };
    const result = validateProviderDecisionMeta(badMeta);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some(e => e.includes('provider_class'))).toBe(true);
    }
  });

  it('all canonical reason_codes are accepted', () => {
    const validReasonCodes = [
      'OK', 'POLICY_LOCAL_ONLY', 'POLICY_REMOTE_ALLOWED', 'POLICY_BLOCKED',
      'ALLOWLIST_DENIED', 'PROVIDER_DOWN', 'TIMEOUT', 'RATE_LIMIT',
      'INVALID_CONFIG', 'NETWORK_ERROR', 'FALLBACK_OFFLINE', 'CACHE_HIT',
      'CACHE_MISS', 'SERIALIZATION_DROPPED', 'PROVIDER_UNAVAILABLE',
      'TOOL_REQUIRED', 'TOOL_DENIED', 'CONTRACT_VIOLATION_CLAMPED', 'UNKNOWN',
    ];
    for (const code of validReasonCodes) {
      const meta = { ...validProviderMeta, reason_code: code };
      const result = validateProviderDecisionMeta(meta);
      expect(result.ok).toBe(true);
    }
  });

  it('all canonical modes are accepted', () => {
    const validModes = ['LOCAL', 'REMOTE', 'OFFLINE', 'CACHED', 'ERROR'];
    for (const mode of validModes) {
      const meta = { ...validProviderMeta, mode };
      const result = validateProviderDecisionMeta(meta);
      expect(result.ok).toBe(true);
    }
  });
});
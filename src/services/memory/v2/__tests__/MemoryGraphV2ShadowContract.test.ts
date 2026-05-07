import { describe, it, expect, vi } from 'vitest';
import {
  MemoryNodeV2Schema,
  MemoryRelationV2Schema,
  ShadowWriteResultSchema,
  C1MemoryGraphV2ContractSchema,
  shadowWriteCoordinator,
  getC1MemoryGraphV2Contract,
  MemoryValidationStatusSchema,
  EmbeddingsStatusSchema,
  IDENTITY_SENSITIVE_TYPES,
  isBlockedByIdentitySafety,
} from '../MemoryGraphV2ShadowContract';

// ── MemoryNodeV2Schema ──────────────────────────────────────────────────────────
describe('MemoryNodeV2Schema', () => {
  const validNode = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    schema_version: 2 as const,
    kind: 'ltm' as const,
    type: 'project_context' as const,
    content: 'Test memory content',
    content_hash: 'abc123def456',
    embedding_id: null,
    session_id: 'sess-001',
    created_at: '2026-05-06T10:00:00.000Z',
    updated_at: '2026-05-06T10:00:00.000Z',
    tags: ['test'],
    source_v1_id: null,
  };

  it('validates a valid v2 node', () => {
    const result = MemoryNodeV2Schema.safeParse(validNode);
    expect(result.success).toBe(true);
  });

  it('rejects schema_version != 2', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, schema_version: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, content: '' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid kind values', () => {
    const kinds = ['stm', 'mtm', 'ltm', 'fact', 'event', 'relation', 'summary'] as const;
    for (const kind of kinds) {
      const result = MemoryNodeV2Schema.safeParse({ ...validNode, kind });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid kind', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, kind: 'unknown_kind' });
    expect(result.success).toBe(false);
  });

  it('defaults tags to empty array', () => {
    const { tags: _, ...noTags } = validNode;
    const result = MemoryNodeV2Schema.safeParse(noTags);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});

// ── MemoryRelationV2Schema ──────────────────────────────────────────────────────
describe('MemoryRelationV2Schema', () => {
  const validRelation = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    schema_version: 2 as const,
    from_node_id: '550e8400-e29b-41d4-a716-446655440002',
    to_node_id: '550e8400-e29b-41d4-a716-446655440003',
    relation_type: 'related' as const,
    weight: 0.75,
    created_at: '2026-05-06T10:00:00.000Z',
  };

  it('validates a valid v2 relation', () => {
    const result = MemoryRelationV2Schema.safeParse(validRelation);
    expect(result.success).toBe(true);
  });

  it('rejects weight > 1', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects weight < 0', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: -0.1 });
    expect(result.success).toBe(false);
  });

  it('accepts weight = 0 (boundary)', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 0 });
    expect(result.success).toBe(true);
  });

  it('accepts weight = 1 (boundary)', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects invalid relation_type', () => {
    const result = MemoryRelationV2Schema.safeParse({
      ...validRelation,
      relation_type: 'unknown',
    });
    expect(result.success).toBe(false);
  });
});

// ── shadowWriteCoordinator — flag=false ────────────────────────────────────────
describe('shadowWriteCoordinator — flag disabled (default)', () => {
  it('calls v1Writer and returns v1_written=true', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);

    const result = await shadowWriteCoordinator('op-001', v1, v2, false);

    expect(v1).toHaveBeenCalledOnce();
    expect(result.v1_written).toBe(true);
  });

  it('does NOT call v2ShadowWriter when flag=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);

    await shadowWriteCoordinator('op-002', v1, v2, false);
    expect(v2).not.toHaveBeenCalled();
  });

  it('returns v2_shadow_written=null when flag=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);

    const result = await shadowWriteCoordinator('op-003', v1, v2, false);
    expect(result.v2_shadow_written).toBeNull();
    expect(result.flag_active).toBe(false);
  });
});

// ── shadowWriteCoordinator — flag=true ─────────────────────────────────────────
describe('shadowWriteCoordinator — flag enabled', () => {
  it('calls both v1Writer and v2ShadowWriter', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);

    const result = await shadowWriteCoordinator('op-004', v1, v2, true);
    expect(v1).toHaveBeenCalledOnce();
    expect(v2).toHaveBeenCalledOnce();
    expect(result.v1_written).toBe(true);
    expect(result.v2_shadow_written).toBe(true);
  });

  it('v2 failure does NOT throw — returns v2_shadow_written=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockRejectedValue(new Error('v2 disk error'));

    const result = await shadowWriteCoordinator('op-005', v1, v2, true);
    expect(result.v1_written).toBe(true);
    expect(result.v2_shadow_written).toBe(false);
    expect(result.error_v2).toContain('v2 disk error');
  });

  it('v1 failure propagates (v1 is source of truth)', async () => {
    const v1 = vi.fn().mockRejectedValue(new Error('v1 write failed'));
    const v2 = vi.fn().mockResolvedValue(undefined);

    await expect(shadowWriteCoordinator('op-006', v1, v2, true)).rejects.toThrow(
      'v1 write failed'
    );
    expect(v2).not.toHaveBeenCalled();
  });
});

// ── ShadowWriteResultSchema ─────────────────────────────────────────────────────
describe('ShadowWriteResultSchema', () => {
  it('validates a flag=false result', () => {
    const result = ShadowWriteResultSchema.safeParse({
      op_id: '550e8400-e29b-41d4-a716-446655440010',
      v1_written: true,
      v2_shadow_written: null,
      flag_active: false,
      error_v2: null,
    });
    expect(result.success).toBe(true);
  });

  it('validates a flag=true successful shadow result', () => {
    const result = ShadowWriteResultSchema.safeParse({
      op_id: '550e8400-e29b-41d4-a716-446655440011',
      v1_written: true,
      v2_shadow_written: true,
      flag_active: true,
      error_v2: null,
    });
    expect(result.success).toBe(true);
  });
});

// ── getC1MemoryGraphV2Contract ──────────────────────────────────────────────────
describe('getC1MemoryGraphV2Contract', () => {
  it('parses with C1MemoryGraphV2ContractSchema', () => {
    const contract = getC1MemoryGraphV2Contract();
    const result = C1MemoryGraphV2ContractSchema.safeParse(contract);
    expect(result.success).toBe(true);
  });

  it('lock must be C1', () => {
    expect(getC1MemoryGraphV2Contract().lock).toBe('C1');
  });

  it('tier must be T3', () => {
    expect(getC1MemoryGraphV2Contract().tier).toBe('T3');
  });

  it('v1_is_source_of_truth must be true', () => {
    expect(getC1MemoryGraphV2Contract().v1_is_source_of_truth).toBe(true);
  });

  it('schema_version must be 2', () => {
    expect(getC1MemoryGraphV2Contract().schema_version).toBe(2);
  });

  it('shadow_mode is disabled when flag off (default)', () => {
    const contract = getC1MemoryGraphV2Contract();
    // In test env VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW is not set → flag=false
    if (!contract.flag_active) {
      expect(contract.shadow_mode).toBe('disabled');
    }
  });
});

// ── C1-UNIT-02: validation_status is required ───────────────────────────────────
describe('C1-UNIT-02 — validation_status required', () => {
  it('MemoryValidationStatusSchema accepts all allowed values', () => {
    const valid = [
      'confirmed',
      'hypothesis',
      'rejected',
      'expired',
      'system_observed',
      'requires_kevin_validation',
    ] as const;
    for (const v of valid) {
      expect(MemoryValidationStatusSchema.safeParse(v).success).toBe(true);
    }
  });

  it('MemoryValidationStatusSchema rejects invalid value', () => {
    expect(MemoryValidationStatusSchema.safeParse('unknown_status').success).toBe(false);
  });

  it('MemoryNodeV2Schema defaults validation_status to system_observed', () => {
    const node = {
      id: '550e8400-e29b-41d4-a716-446655440020',
      schema_version: 2 as const,
      kind: 'fact' as const,
      type: 'project_context' as const,
      content: 'some content',
      content_hash: 'hash001',
      embedding_id: null,
      session_id: 'sess-002',
      created_at: '2026-05-06T10:00:00.000Z',
      updated_at: '2026-05-06T10:00:00.000Z',
      tags: [],
      source_v1_id: null,
    };
    const result = MemoryNodeV2Schema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.validation_status).toBe('system_observed');
    }
  });

  it('MemoryNodeV2Schema rejects invalid validation_status', () => {
    const node = {
      id: '550e8400-e29b-41d4-a716-446655440021',
      schema_version: 2 as const,
      kind: 'fact' as const,
      type: 'project_context' as const,
      content: 'some content',
      content_hash: 'hash002',
      embedding_id: null,
      session_id: 'sess-002',
      created_at: '2026-05-06T10:00:00.000Z',
      updated_at: '2026-05-06T10:00:00.000Z',
      tags: [],
      source_v1_id: null,
      validation_status: 'invalid_value',
    };
    expect(MemoryNodeV2Schema.safeParse(node).success).toBe(false);
  });
});

// ── C1-UNIT-03: identity-sensitive memory cannot activate without confirmed ─────
describe('C1-UNIT-03 — identity-safe guard', () => {
  it('IDENTITY_SENSITIVE_TYPES includes identity_fact, symbolic_axis, financial_pressure, constraint, instruction_truth', () => {
    const sensitiveTypes = [
      'identity_fact',
      'symbolic_axis',
      'financial_pressure',
      'constraint',
      'instruction_truth',
    ] as const;
    for (const t of sensitiveTypes) {
      expect(IDENTITY_SENSITIVE_TYPES.has(t)).toBe(true);
    }
  });

  it('isBlockedByIdentitySafety returns true for identity_fact with hypothesis status', () => {
    expect(
      isBlockedByIdentitySafety({
        type: 'identity_fact',
        validation_status: 'hypothesis',
      })
    ).toBe(true);
  });

  it('isBlockedByIdentitySafety returns true for symbolic_axis with system_observed', () => {
    expect(
      isBlockedByIdentitySafety({
        type: 'symbolic_axis',
        validation_status: 'system_observed',
      })
    ).toBe(true);
  });

  it('isBlockedByIdentitySafety returns false for identity_fact with confirmed status', () => {
    expect(
      isBlockedByIdentitySafety({ type: 'identity_fact', validation_status: 'confirmed' })
    ).toBe(false);
  });

  it('isBlockedByIdentitySafety returns false for non-sensitive type regardless of status', () => {
    expect(
      isBlockedByIdentitySafety({
        type: 'project_context',
        validation_status: 'hypothesis',
      })
    ).toBe(false);
    expect(
      isBlockedByIdentitySafety({
        type: 'decision',
        validation_status: 'system_observed',
      })
    ).toBe(false);
  });

  it('financial_pressure node with rejected status is blocked', () => {
    expect(
      isBlockedByIdentitySafety({
        type: 'financial_pressure',
        validation_status: 'rejected',
      })
    ).toBe(true);
  });
});

// ── C1-UNIT-04: shadow write does not replace UnifiedMemory ────────────────────
// (Already covered in shadowWriteCoordinator flag=false tests above — re-asserts the invariant explicitly)
describe('C1-UNIT-04 — shadow write does not replace UnifiedMemory', () => {
  it('v1Writer always called regardless of flag state', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);
    // Flag disabled
    await shadowWriteCoordinator('c1-u04-a', v1, v2, false);
    expect(v1).toHaveBeenCalledOnce();
  });

  it('v2 writer is NEVER called when flag disabled — v1 remains sole writer', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined);
    const v2 = vi.fn().mockResolvedValue(undefined);
    const result = await shadowWriteCoordinator('c1-u04-b', v1, v2, false);
    expect(v2).not.toHaveBeenCalled();
    expect(result.v1_written).toBe(true);
    expect(result.v2_shadow_written).toBeNull();
  });
});

// ── C1-UNIT-05: default feature flags are safe/off ─────────────────────────────
describe('C1-UNIT-05 — default feature flag safety', () => {
  it('getC1MemoryGraphV2Contract shadow_mode is disabled in test env (no VITE env)', () => {
    const contract = getC1MemoryGraphV2Contract();
    // VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW is not set in test env → flag=false
    if (!contract.flag_active) {
      expect(contract.shadow_mode).toBe('disabled');
    }
  });

  it('getC1MemoryGraphV2Contract v1_is_source_of_truth is always true', () => {
    expect(getC1MemoryGraphV2Contract().v1_is_source_of_truth).toBe(true);
  });
});

// ── C1-UNIT-06: contradictions field accepts linked node ids or empty list ──────
describe('C1-UNIT-06 — contradictions field', () => {
  const baseNode = {
    id: '550e8400-e29b-41d4-a716-446655440030',
    schema_version: 2 as const,
    kind: 'fact' as const,
    type: 'contradiction' as const,
    content: 'contradicts prior decision',
    content_hash: 'hash003',
    embedding_id: null,
    session_id: 'sess-003',
    created_at: '2026-05-06T10:00:00.000Z',
    updated_at: '2026-05-06T10:00:00.000Z',
    tags: [],
    source_v1_id: null,
  };

  it('accepts empty contradictions list', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...baseNode, contradictions: [] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.contradictions).toEqual([]);
  });

  it('accepts a list of UUID references', () => {
    const ids = [
      '550e8400-e29b-41d4-a716-446655440031',
      '550e8400-e29b-41d4-a716-446655440032',
    ];
    const result = MemoryNodeV2Schema.safeParse({ ...baseNode, contradictions: ids });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.contradictions).toEqual(ids);
  });

  it('defaults contradictions to empty array', () => {
    const result = MemoryNodeV2Schema.safeParse(baseNode);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.contradictions).toEqual([]);
  });
});

// ── C1-UNIT-07: embeddings_status supports unavailable state ───────────────────
describe('C1-UNIT-07 — embeddings_status', () => {
  it('EmbeddingsStatusSchema accepts all values', () => {
    const values = [
      'not_indexed',
      'pending',
      'indexed',
      'failed',
      'unavailable',
    ] as const;
    for (const v of values) {
      expect(EmbeddingsStatusSchema.safeParse(v).success).toBe(true);
    }
  });

  it('EmbeddingsStatusSchema rejects invalid value', () => {
    expect(EmbeddingsStatusSchema.safeParse('unknown_state').success).toBe(false);
  });

  it('MemoryNodeV2Schema defaults embeddings_status to not_indexed', () => {
    const node = {
      id: '550e8400-e29b-41d4-a716-446655440040',
      schema_version: 2 as const,
      kind: 'ltm' as const,
      type: 'technical_state' as const,
      content: 'technical observation',
      content_hash: 'hash004',
      embedding_id: null,
      session_id: 'sess-004',
      created_at: '2026-05-06T10:00:00.000Z',
      updated_at: '2026-05-06T10:00:00.000Z',
      tags: [],
      source_v1_id: null,
    };
    const result = MemoryNodeV2Schema.safeParse(node);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.embeddings_status).toBe('not_indexed');
    }
  });

  it('accepts unavailable embeddings_status (offline/degraded environment)', () => {
    const node = {
      id: '550e8400-e29b-41d4-a716-446655440041',
      schema_version: 2 as const,
      kind: 'ltm' as const,
      type: 'technical_state' as const,
      content: 'offline state',
      content_hash: 'hash005',
      embedding_id: null,
      embeddings_status: 'unavailable' as const,
      session_id: 'sess-004',
      created_at: '2026-05-06T10:00:00.000Z',
      updated_at: '2026-05-06T10:00:00.000Z',
      tags: [],
      source_v1_id: null,
    };
    const result = MemoryNodeV2Schema.safeParse(node);
    expect(result.success).toBe(true);
  });
});

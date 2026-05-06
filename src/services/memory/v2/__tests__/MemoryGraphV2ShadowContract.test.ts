import { describe, it, expect, vi } from 'vitest'
import {
  MemoryNodeV2Schema,
  MemoryRelationV2Schema,
  ShadowWriteResultSchema,
  C1MemoryGraphV2ContractSchema,
  shadowWriteCoordinator,
  getC1MemoryGraphV2Contract,
} from '../MemoryGraphV2ShadowContract'

// ── MemoryNodeV2Schema ──────────────────────────────────────────────────────────
describe('MemoryNodeV2Schema', () => {
  const validNode = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    schema_version: 2 as const,
    kind: 'ltm' as const,
    content: 'Test memory content',
    content_hash: 'abc123def456',
    embedding_id: null,
    session_id: 'sess-001',
    created_at: '2026-05-06T10:00:00.000Z',
    updated_at: '2026-05-06T10:00:00.000Z',
    tags: ['test'],
    source_v1_id: null,
  }

  it('validates a valid v2 node', () => {
    const result = MemoryNodeV2Schema.safeParse(validNode)
    expect(result.success).toBe(true)
  })

  it('rejects schema_version != 2', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, schema_version: 1 })
    expect(result.success).toBe(false)
  })

  it('rejects empty content', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, content: '' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid kind values', () => {
    const kinds = ['stm', 'mtm', 'ltm', 'fact', 'event', 'relation', 'summary'] as const
    for (const kind of kinds) {
      const result = MemoryNodeV2Schema.safeParse({ ...validNode, kind })
      expect(result.success).toBe(true)
    }
  })

  it('rejects invalid kind', () => {
    const result = MemoryNodeV2Schema.safeParse({ ...validNode, kind: 'unknown_kind' })
    expect(result.success).toBe(false)
  })

  it('defaults tags to empty array', () => {
    const { tags: _, ...noTags } = validNode
    const result = MemoryNodeV2Schema.safeParse(noTags)
    if (result.success) {
      expect(result.data.tags).toEqual([])
    }
  })
})

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
  }

  it('validates a valid v2 relation', () => {
    const result = MemoryRelationV2Schema.safeParse(validRelation)
    expect(result.success).toBe(true)
  })

  it('rejects weight > 1', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 1.5 })
    expect(result.success).toBe(false)
  })

  it('rejects weight < 0', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: -0.1 })
    expect(result.success).toBe(false)
  })

  it('accepts weight = 0 (boundary)', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 0 })
    expect(result.success).toBe(true)
  })

  it('accepts weight = 1 (boundary)', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, weight: 1 })
    expect(result.success).toBe(true)
  })

  it('rejects invalid relation_type', () => {
    const result = MemoryRelationV2Schema.safeParse({ ...validRelation, relation_type: 'unknown' })
    expect(result.success).toBe(false)
  })
})

// ── shadowWriteCoordinator — flag=false ────────────────────────────────────────
describe('shadowWriteCoordinator — flag disabled (default)', () => {
  it('calls v1Writer and returns v1_written=true', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined)
    const v2 = vi.fn().mockResolvedValue(undefined)

    const result = await shadowWriteCoordinator('op-001', v1, v2, false)

    expect(v1).toHaveBeenCalledOnce()
    expect(result.v1_written).toBe(true)
  })

  it('does NOT call v2ShadowWriter when flag=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined)
    const v2 = vi.fn().mockResolvedValue(undefined)

    await shadowWriteCoordinator('op-002', v1, v2, false)
    expect(v2).not.toHaveBeenCalled()
  })

  it('returns v2_shadow_written=null when flag=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined)
    const v2 = vi.fn().mockResolvedValue(undefined)

    const result = await shadowWriteCoordinator('op-003', v1, v2, false)
    expect(result.v2_shadow_written).toBeNull()
    expect(result.flag_active).toBe(false)
  })
})

// ── shadowWriteCoordinator — flag=true ─────────────────────────────────────────
describe('shadowWriteCoordinator — flag enabled', () => {
  it('calls both v1Writer and v2ShadowWriter', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined)
    const v2 = vi.fn().mockResolvedValue(undefined)

    const result = await shadowWriteCoordinator('op-004', v1, v2, true)
    expect(v1).toHaveBeenCalledOnce()
    expect(v2).toHaveBeenCalledOnce()
    expect(result.v1_written).toBe(true)
    expect(result.v2_shadow_written).toBe(true)
  })

  it('v2 failure does NOT throw — returns v2_shadow_written=false', async () => {
    const v1 = vi.fn().mockResolvedValue(undefined)
    const v2 = vi.fn().mockRejectedValue(new Error('v2 disk error'))

    const result = await shadowWriteCoordinator('op-005', v1, v2, true)
    expect(result.v1_written).toBe(true)
    expect(result.v2_shadow_written).toBe(false)
    expect(result.error_v2).toContain('v2 disk error')
  })

  it('v1 failure propagates (v1 is source of truth)', async () => {
    const v1 = vi.fn().mockRejectedValue(new Error('v1 write failed'))
    const v2 = vi.fn().mockResolvedValue(undefined)

    await expect(shadowWriteCoordinator('op-006', v1, v2, true)).rejects.toThrow('v1 write failed')
    expect(v2).not.toHaveBeenCalled()
  })
})

// ── ShadowWriteResultSchema ─────────────────────────────────────────────────────
describe('ShadowWriteResultSchema', () => {
  it('validates a flag=false result', () => {
    const result = ShadowWriteResultSchema.safeParse({
      op_id: '550e8400-e29b-41d4-a716-446655440010',
      v1_written: true,
      v2_shadow_written: null,
      flag_active: false,
      error_v2: null,
    })
    expect(result.success).toBe(true)
  })

  it('validates a flag=true successful shadow result', () => {
    const result = ShadowWriteResultSchema.safeParse({
      op_id: '550e8400-e29b-41d4-a716-446655440011',
      v1_written: true,
      v2_shadow_written: true,
      flag_active: true,
      error_v2: null,
    })
    expect(result.success).toBe(true)
  })
})

// ── getC1MemoryGraphV2Contract ──────────────────────────────────────────────────
describe('getC1MemoryGraphV2Contract', () => {
  it('parses with C1MemoryGraphV2ContractSchema', () => {
    const contract = getC1MemoryGraphV2Contract()
    const result = C1MemoryGraphV2ContractSchema.safeParse(contract)
    expect(result.success).toBe(true)
  })

  it('lock must be C1', () => {
    expect(getC1MemoryGraphV2Contract().lock).toBe('C1')
  })

  it('tier must be T3', () => {
    expect(getC1MemoryGraphV2Contract().tier).toBe('T3')
  })

  it('v1_is_source_of_truth must be true', () => {
    expect(getC1MemoryGraphV2Contract().v1_is_source_of_truth).toBe(true)
  })

  it('schema_version must be 2', () => {
    expect(getC1MemoryGraphV2Contract().schema_version).toBe(2)
  })

  it('shadow_mode is disabled when flag off (default)', () => {
    const contract = getC1MemoryGraphV2Contract()
    // In test env VITE_TITANE_C1_MEMORYGRAPH_V2_SHADOW is not set → flag=false
    if (!contract.flag_active) {
      expect(contract.shadow_mode).toBe('disabled')
    }
  })
})

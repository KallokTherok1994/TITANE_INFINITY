import { describe, it, expect } from 'vitest'
import {
  LatencyBudgetSchema,
  ToolUseEfficiencySchema,
  SelfCorrectionEventSchema,
  AgentEffectivenessSnapshotSchema,
  D0AgentEffectivenessContractSchema,
  computeLatencyBudget,
  computeToolUseEfficiency,
  computeEffectivenessScore,
  classifyEffectivenessTier,
  getDefaultLatencyBudget,
  getD0AgentEffectivenessContract,
} from '../AgentEffectivenessContract'

const NOW = '2026-05-06T10:00:00.000Z'

// ── computeLatencyBudget ────────────────────────────────────────────────────────
describe('computeLatencyBudget', () => {
  it('within budget when actual <= budget', () => {
    const lb = computeLatencyBudget(5000, 3000)
    expect(lb.within_budget).toBe(true)
    expect(lb.overage_ms).toBe(0)
  })

  it('over budget when actual > budget', () => {
    const lb = computeLatencyBudget(5000, 7000)
    expect(lb.within_budget).toBe(false)
    expect(lb.overage_ms).toBe(2000)
  })

  it('exactly at budget = within', () => {
    const lb = computeLatencyBudget(5000, 5000)
    expect(lb.within_budget).toBe(true)
  })

  it('output parseable by LatencyBudgetSchema', () => {
    const lb = computeLatencyBudget(5000, 3000)
    expect(LatencyBudgetSchema.safeParse(lb).success).toBe(true)
  })
})

// ── computeToolUseEfficiency ────────────────────────────────────────────────────
describe('computeToolUseEfficiency', () => {
  it('perfect efficiency with zero redundant/failed', () => {
    const eff = computeToolUseEfficiency(4, 0, 0)
    expect(eff.efficiency_score).toBe(1.0)
  })

  it('returns 1.0 when total=0 (no tools used)', () => {
    const eff = computeToolUseEfficiency(0, 0, 0)
    expect(eff.efficiency_score).toBe(1.0)
  })

  it('efficiency = 0.5 when half redundant', () => {
    const eff = computeToolUseEfficiency(4, 2, 0)
    expect(eff.efficiency_score).toBe(0.5)
  })

  it('efficiency >= 0 when all calls fail', () => {
    const eff = computeToolUseEfficiency(3, 0, 3)
    expect(eff.efficiency_score).toBeGreaterThanOrEqual(0)
  })

  it('output parseable by ToolUseEfficiencySchema', () => {
    const eff = computeToolUseEfficiency(5, 1, 0)
    expect(ToolUseEfficiencySchema.safeParse(eff).success).toBe(true)
  })
})

// ── computeEffectivenessScore ───────────────────────────────────────────────────
describe('computeEffectivenessScore', () => {
  const perfectLatency = computeLatencyBudget(5000, 1000)
  const perfectTools = computeToolUseEfficiency(2, 0, 0)

  it('returns 1.0 for perfect agent', () => {
    const score = computeEffectivenessScore(true, 1.0, perfectLatency, perfectTools, 0)
    expect(score).toBe(1.0)
  })

  it('returns 0 for failed task, zero quality, max latency overrun', () => {
    const badLatency = computeLatencyBudget(1000, 99000)
    const badTools = computeToolUseEfficiency(5, 5, 0)
    const score = computeEffectivenessScore(false, 0, badLatency, badTools, 1.0)
    expect(score).toBe(0)
  })

  it('completed task score > uncompleted task score (all else equal)', () => {
    const a = computeEffectivenessScore(true, 0.8, perfectLatency, perfectTools, 0)
    const b = computeEffectivenessScore(false, 0.8, perfectLatency, perfectTools, 0)
    expect(a).toBeGreaterThan(b)
  })

  it('score is in [0, 1]', () => {
    for (let q = 0; q <= 1; q += 0.25) {
      const s = computeEffectivenessScore(true, q, perfectLatency, perfectTools, 0)
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(1)
    }
  })

  it('high self-correction penalizes score', () => {
    const withoutCorrections = computeEffectivenessScore(true, 0.9, perfectLatency, perfectTools, 0)
    const withCorrections = computeEffectivenessScore(true, 0.9, perfectLatency, perfectTools, 1.0)
    expect(withoutCorrections).toBeGreaterThan(withCorrections)
  })
})

// ── classifyEffectivenessTier ───────────────────────────────────────────────────
describe('classifyEffectivenessTier', () => {
  it('returns elite for >= 0.9', () => {
    expect(classifyEffectivenessTier(0.9)).toBe('elite')
    expect(classifyEffectivenessTier(1.0)).toBe('elite')
  })

  it('returns effective for [0.75, 0.9)', () => {
    expect(classifyEffectivenessTier(0.75)).toBe('effective')
    expect(classifyEffectivenessTier(0.89)).toBe('effective')
  })

  it('returns adequate for [0.5, 0.75)', () => {
    expect(classifyEffectivenessTier(0.5)).toBe('adequate')
  })

  it('returns degraded for [0.25, 0.5)', () => {
    expect(classifyEffectivenessTier(0.25)).toBe('degraded')
  })

  it('returns failing for < 0.25', () => {
    expect(classifyEffectivenessTier(0)).toBe('failing')
    expect(classifyEffectivenessTier(0.24)).toBe('failing')
  })
})

// ── getDefaultLatencyBudget ─────────────────────────────────────────────────────
describe('getDefaultLatencyBudget', () => {
  it('security_guard has lowest budget (fast response required)', () => {
    const secBudget = getDefaultLatencyBudget('security_guard')
    const chatBudget = getDefaultLatencyBudget('omega_chat')
    expect(secBudget).toBeLessThan(chatBudget)
  })

  it('orchestrator has highest budget', () => {
    const orch = getDefaultLatencyBudget('orchestrator')
    expect(orch).toBeGreaterThanOrEqual(30000)
  })

  it('all roles return positive budget', () => {
    const roles = ['omega_chat', 'memory_manager', 'knowledge_indexer', 'research_validator', 'security_guard', 'tool_executor', 'orchestrator'] as const
    for (const role of roles) {
      expect(getDefaultLatencyBudget(role)).toBeGreaterThan(0)
    }
  })
})

// ── SelfCorrectionEventSchema ───────────────────────────────────────────────────
describe('SelfCorrectionEventSchema', () => {
  it('validates a valid self-correction event', () => {
    const result = SelfCorrectionEventSchema.safeParse({
      event_id: 'ev-001',
      agent_role: 'omega_chat',
      correction_type: 'factual_error',
      original_token_count: 100,
      corrected_token_count: 95,
      correction_latency_ms: 1200,
      timestamp: NOW,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid correction_type', () => {
    const result = SelfCorrectionEventSchema.safeParse({
      event_id: 'ev-002',
      agent_role: 'omega_chat',
      correction_type: 'hallucination',
      original_token_count: 100,
      corrected_token_count: 95,
      correction_latency_ms: 1200,
      timestamp: NOW,
    })
    expect(result.success).toBe(false)
  })
})

// ── AgentEffectivenessSnapshotSchema ────────────────────────────────────────────
describe('AgentEffectivenessSnapshotSchema', () => {
  it('validates a complete snapshot', () => {
    const result = AgentEffectivenessSnapshotSchema.safeParse({
      snapshot_id: '550e8400-e29b-41d4-a716-446655440200',
      agent_role: 'omega_chat',
      session_id: 'sess-001',
      task_description: 'Answer user question about Paris',
      task_completed: true,
      response_quality_score: 0.92,
      latency: { budget_ms: 30000, actual_ms: 12000, within_budget: true, overage_ms: 0 },
      tool_efficiency: { total_tool_calls: 2, redundant_calls: 0, failed_calls: 0, efficiency_score: 1.0 },
      self_corrections: [],
      self_correction_rate: 0,
      overall_effectiveness_score: 0.95,
      measured_at: NOW,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty task_description', () => {
    const result = AgentEffectivenessSnapshotSchema.safeParse({
      snapshot_id: '550e8400-e29b-41d4-a716-446655440201',
      agent_role: 'omega_chat',
      session_id: 'sess-002',
      task_description: '',
      task_completed: true,
      response_quality_score: 0.5,
      latency: { budget_ms: 5000, actual_ms: 3000, within_budget: true, overage_ms: 0 },
      tool_efficiency: { total_tool_calls: 0, redundant_calls: 0, failed_calls: 0, efficiency_score: 1.0 },
      self_corrections: [],
      self_correction_rate: 0,
      overall_effectiveness_score: 0.5,
      measured_at: NOW,
    })
    expect(result.success).toBe(false)
  })
})

// ── getD0AgentEffectivenessContract ────────────────────────────────────────────
describe('getD0AgentEffectivenessContract', () => {
  it('parses with D0AgentEffectivenessContractSchema', () => {
    const contract = getD0AgentEffectivenessContract()
    expect(D0AgentEffectivenessContractSchema.safeParse(contract).success).toBe(true)
  })

  it('lock must be D0', () => {
    expect(getD0AgentEffectivenessContract().lock).toBe('D0')
  })

  it('tier must be T2', () => {
    expect(getD0AgentEffectivenessContract().tier).toBe('T2')
  })

  it('governs 7 agent roles', () => {
    expect(getD0AgentEffectivenessContract().agent_roles_governed).toHaveLength(7)
  })

  it('integrations reference B2 and C2', () => {
    const contract = getD0AgentEffectivenessContract()
    const integrationStr = contract.integrations.join(',')
    expect(integrationStr).toContain('B2')
    expect(integrationStr).toContain('C2')
  })

  it('effectiveness_weights sum to 1.0', () => {
    const w = getD0AgentEffectivenessContract().effectiveness_weights
    const sum = w.task_completion + w.quality + w.latency + w.tool_efficiency + w.correction_penalty
    expect(sum).toBeCloseTo(1.0, 5)
  })
})

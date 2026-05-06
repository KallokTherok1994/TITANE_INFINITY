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
  // v12 accountability layer
  AgentEffectivenessScorecardSchema,
  AgentEffectivenessRegistrySchema,
  AgentEffectivenessSummarySchema,
  isAgentMeasurable,
  hasRequiredProof,
  hasValidatorCoverage,
  canClaimPass,
  detectAgentScopeDrift,
  calculateAgentEffectiveness,
  summarizeAgentLimitations,
  buildAgentEffectivenessSummary,
  RUNTIME_AUTHORITY_MINIMUM_RISK,
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

// ── v12 Accountability Layer ─────────────────────────────────────────────────────

function makeAgent(overrides: Partial<{
  agent_id: string
  allowed_scope: string[]
  forbidden_scope: string[]
  trigger_conditions: string[]
  known_limitations: string[]
  required_validators: string[]
  proof_files: string[]
  last_verdict: string
  false_positive_count: number
  false_negative_count: number
  blocked_drift_count: number
  status: string
  risk_level: string
}> = {}) {
  return {
    agent_id: 'architect-guardian',
    agent_name: 'Architect Guardian',
    agent_type: 'guardian' as const,
    mission: 'Enforces 4-Ring, One Door, and IPC architecture invariants',
    trigger_conditions: ['new IPC command added', 'Ring boundary crossed', 'One Door bypass detected'],
    allowed_scope: ['src-tauri/src/', 'src/lib/', 'docs/IPC_CATALOG.md'],
    forbidden_scope: ['memory/', 'deployment/', 'data/knowledge_base/default/'],
    required_inputs: ['diff --stat output', 'Tauri allowlist'],
    required_outputs: ['PASS/FAIL verdict', 'Ring violation list'],
    required_validators: ['bash scripts/verify_instructions.sh', 'bash scripts/autoheal/detect_recurrence.sh'],
    proof_files: ['proof_packs/LOCK_C0_PROVIDER_MODEL_INTELLIGENCE_ROUTING_2026-05-06/VERDICT.md'],
    last_verdict: 'PASS' as const,
    last_run_at: NOW,
    blocked_drift_count: 0,
    false_positive_count: 0,
    false_negative_count: 0,
    known_limitations: ['Cannot detect indirect Ring violations through generated code', 'Does not inspect runtime dynamic imports'],
    risk_level: 'high' as const,
    rollback_expectation: 'git restore src-tauri/src + revert IPC command registration',
    next_gap: 'Add dynamic import scan',
    status: 'ACTIVE' as const,
    ...overrides,
  }
}

// ── D0-UNIT-01 AgentEffectivenessScorecard validates a complete agent ────────────
describe('D0-UNIT-01 AgentEffectivenessScorecardSchema validates complete agent', () => {
  it('parses a well-formed scorecard', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent())
    expect(result.success).toBe(true)
  })

  it('rejects empty agent_id', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ agent_id: '' }))
    expect(result.success).toBe(false)
  })

  it('rejects empty trigger_conditions', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ trigger_conditions: [] }))
    expect(result.success).toBe(false)
  })

  it('rejects empty allowed_scope', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ allowed_scope: [] }))
    expect(result.success).toBe(false)
  })

  it('rejects empty forbidden_scope', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ forbidden_scope: [] }))
    expect(result.success).toBe(false)
  })

  it('requires known_limitations to be non-empty', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ known_limitations: [] }))
    expect(result.success).toBe(false)
  })
})

// ── D0-UNIT-02 agent without validator/proof cannot claim PASS ───────────────────
describe('D0-UNIT-02 agent without validator/proof cannot claim PASS', () => {
  it('canClaimPass returns false when proof_files empty', () => {
    const agent = makeAgent({ proof_files: [] })
    expect(canClaimPass(agent)).toBe(false)
  })

  it('canClaimPass returns false when required_validators empty', () => {
    const agent = makeAgent({ required_validators: [] })
    expect(canClaimPass(agent)).toBe(false)
  })

  it('canClaimPass returns true only when both proof and validators present', () => {
    const agent = makeAgent()
    expect(canClaimPass(agent)).toBe(true)
  })

  it('hasRequiredProof is false when proof_files empty', () => {
    expect(hasRequiredProof(makeAgent({ proof_files: [] }))).toBe(false)
  })

  it('hasValidatorCoverage is false when required_validators empty', () => {
    expect(hasValidatorCoverage(makeAgent({ required_validators: [] }))).toBe(false)
  })
})

// ── D0-UNIT-03 agent without allowed/forbidden scope is incomplete ────────────────
describe('D0-UNIT-03 agent without allowed/forbidden scope is incomplete', () => {
  it('isAgentMeasurable returns false when no allowed_scope', () => {
    expect(isAgentMeasurable(makeAgent({ allowed_scope: [] }))).toBe(false)
  })

  it('isAgentMeasurable returns false when no forbidden_scope', () => {
    expect(isAgentMeasurable(makeAgent({ forbidden_scope: [] }))).toBe(false)
  })

  it('isAgentMeasurable returns false when no trigger_conditions', () => {
    expect(isAgentMeasurable(makeAgent({ trigger_conditions: [] }))).toBe(false)
  })

  it('isAgentMeasurable returns false when no known_limitations', () => {
    expect(isAgentMeasurable(makeAgent({ known_limitations: [] }))).toBe(false)
  })

  it('isAgentMeasurable returns true for complete agent', () => {
    expect(isAgentMeasurable(makeAgent())).toBe(true)
  })
})

// ── D0-UNIT-04 false_positive_count and false_negative_count are required ─────────
describe('D0-UNIT-04 false_positive and false_negative counts are required', () => {
  it('schema accepts zero counts', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(
      makeAgent({ false_positive_count: 0, false_negative_count: 0 })
    )
    expect(result.success).toBe(true)
  })

  it('schema accepts positive counts', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(
      makeAgent({ false_positive_count: 3, false_negative_count: 1 })
    )
    expect(result.success).toBe(true)
  })

  it('schema rejects negative false_positive_count', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(
      makeAgent({ false_positive_count: -1 })
    )
    expect(result.success).toBe(false)
  })

  it('schema rejects negative false_negative_count', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(
      makeAgent({ false_negative_count: -1 })
    )
    expect(result.success).toBe(false)
  })
})

// ── D0-UNIT-05 known_limitations are required unless explicitly justified ─────────
describe('D0-UNIT-05 known_limitations are required', () => {
  it('agent with non-empty limitations passes', () => {
    const agent = makeAgent({ known_limitations: ['Cannot inspect dynamic imports'] })
    const result = AgentEffectivenessScorecardSchema.safeParse(agent)
    expect(result.success).toBe(true)
  })

  it('agent with empty limitations fails schema', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(makeAgent({ known_limitations: [] }))
    expect(result.success).toBe(false)
  })

  it('summarizeAgentLimitations returns NO_LIMITATIONS_DECLARED for empty array', () => {
    const agent = { ...makeAgent(), known_limitations: [] }
    expect(summarizeAgentLimitations(agent)).toContain('NO_LIMITATIONS_DECLARED')
  })

  it('summarizeAgentLimitations returns numbered list for non-empty', () => {
    const agent = makeAgent({ known_limitations: ['Limitation A', 'Limitation B'] })
    const summary = summarizeAgentLimitations(agent)
    expect(summary).toContain('1.')
    expect(summary).toContain('2.')
    expect(summary).toContain('Limitation A')
  })

  it('calculateAgentEffectiveness penalizes missing limitations', () => {
    const withLimitations = calculateAgentEffectiveness(makeAgent())
    const withoutLimitations = calculateAgentEffectiveness({ ...makeAgent(), known_limitations: [] })
    expect(withLimitations).toBeGreaterThan(withoutLimitations)
  })
})

// ── D0-UNIT-06 runtime-authority agent is high risk by default ────────────────────
describe('D0-UNIT-06 runtime-authority agents have high risk by default', () => {
  it('RUNTIME_AUTHORITY_MINIMUM_RISK is high', () => {
    expect(RUNTIME_AUTHORITY_MINIMUM_RISK).toBe('high')
  })

  it('runtime-authority agent tagged high risk passes schema', () => {
    const agent = makeAgent({ risk_level: 'high' })
    const result = AgentEffectivenessScorecardSchema.safeParse(agent)
    expect(result.success).toBe(true)
  })

  it('critical risk is also valid for runtime agents', () => {
    const agent = makeAgent({ risk_level: 'critical' })
    const result = AgentEffectivenessScorecardSchema.safeParse(agent)
    expect(result.success).toBe(true)
  })

  it('schema rejects unknown risk level', () => {
    const result = AgentEffectivenessScorecardSchema.safeParse(
      makeAgent({ risk_level: 'minimal' as any })
    )
    expect(result.success).toBe(false)
  })
})

// ── D0-UNIT-07 detectAgentScopeDrift flags out-of-scope authority ──────────────────
describe('D0-UNIT-07 detectAgentScopeDrift flags out-of-scope authority', () => {
  it('no drift for complete agent', () => {
    expect(detectAgentScopeDrift(makeAgent())).toBe(false)
  })

  it('drift detected when allowed_scope empty', () => {
    expect(detectAgentScopeDrift(makeAgent({ allowed_scope: [] }))).toBe(true)
  })

  it('drift detected when forbidden_scope empty', () => {
    expect(detectAgentScopeDrift(makeAgent({ forbidden_scope: [] }))).toBe(true)
  })

  it('calculateAgentEffectiveness penalizes scope drift', () => {
    const clean = calculateAgentEffectiveness(makeAgent())
    const drifted = calculateAgentEffectiveness(makeAgent({ forbidden_scope: [] }))
    expect(clean).toBeGreaterThan(drifted)
  })
})

// ── D0-UNIT-08 calculateAgentEffectiveness penalizes missing proof ────────────────
describe('D0-UNIT-08 calculateAgentEffectiveness penalizes missing proof', () => {
  it('full agent scores 100', () => {
    expect(calculateAgentEffectiveness(makeAgent())).toBe(100)
  })

  it('agent with no proof_files scores < 100', () => {
    expect(calculateAgentEffectiveness(makeAgent({ proof_files: [] }))).toBeLessThan(100)
  })

  it('agent with no validators scores < 100', () => {
    expect(calculateAgentEffectiveness(makeAgent({ required_validators: [] }))).toBeLessThan(100)
  })

  it('FAIL verdict penalizes score', () => {
    const pass = calculateAgentEffectiveness(makeAgent({ last_verdict: 'PASS' }))
    const fail = calculateAgentEffectiveness(makeAgent({ last_verdict: 'FAIL' }))
    expect(pass).toBeGreaterThan(fail)
  })

  it('score is always >= 0', () => {
    const worstCase = makeAgent({
      proof_files: [],
      required_validators: [],
      allowed_scope: [],
      forbidden_scope: [],
      known_limitations: [],
      last_verdict: 'FAIL',
    })
    expect(calculateAgentEffectiveness({ ...worstCase, known_limitations: [] })).toBeGreaterThanOrEqual(0)
  })
})

// ── D0-UNIT-09 buildAgentEffectivenessSummary aggregates PASS/FAIL/BLOCKED/PARTIAL ─
describe('D0-UNIT-09 buildAgentEffectivenessSummary aggregates verdicts', () => {
  const makeRegistry = (agents: ReturnType<typeof makeAgent>[]) => ({
    version: '1.0.0',
    generated_at: NOW,
    agents,
  })

  it('empty registry returns all-zero summary with registry_complete=true', () => {
    const summary = buildAgentEffectivenessSummary(makeRegistry([]))
    expect(summary.total_agents).toBe(0)
    expect(summary.registry_complete).toBe(true)
  })

  it('UNKNOWN agent makes registry_complete false', () => {
    const agent = makeAgent({ status: 'UNKNOWN' })
    const summary = buildAgentEffectivenessSummary(makeRegistry([agent]))
    expect(summary.registry_complete).toBe(false)
  })

  it('correctly counts PASS/FAIL verdicts', () => {
    const agents = [
      makeAgent({ last_verdict: 'PASS' }),
      makeAgent({ last_verdict: 'FAIL', agent_id: 'a2' }),
      makeAgent({ last_verdict: 'BLOCKED', agent_id: 'a3' }),
    ]
    const summary = buildAgentEffectivenessSummary(makeRegistry(agents))
    expect(summary.pass_count).toBe(1)
    expect(summary.fail_count).toBe(1)
    expect(summary.blocked_count).toBe(1)
  })

  it('counts missing_proof_count correctly', () => {
    const agents = [
      makeAgent({ proof_files: [], agent_id: 'a1' }),
      makeAgent({ proof_files: [], agent_id: 'a2' }),
      makeAgent({ agent_id: 'a3' }),
    ]
    const summary = buildAgentEffectivenessSummary(makeRegistry(agents))
    expect(summary.missing_proof_count).toBe(2)
  })

  it('AgentEffectivenessSummarySchema parses output', () => {
    const summary = buildAgentEffectivenessSummary(makeRegistry([makeAgent()]))
    expect(AgentEffectivenessSummarySchema.safeParse(summary).success).toBe(true)
  })
})

// ── D0-UNIT-10 registry not complete while any required agent is UNKNOWN ──────────
describe('D0-UNIT-10 registry incomplete when any agent is UNKNOWN', () => {
  it('registry with all ACTIVE agents is complete', () => {
    const reg = { version: '1.0.0', generated_at: NOW, agents: [makeAgent()] }
    const summary = buildAgentEffectivenessSummary(reg)
    expect(summary.registry_complete).toBe(true)
  })

  it('one UNKNOWN agent breaks completeness', () => {
    const reg = {
      version: '1.0.0',
      generated_at: NOW,
      agents: [makeAgent(), makeAgent({ agent_id: 'mystery-agent', status: 'UNKNOWN' })],
    }
    const summary = buildAgentEffectivenessSummary(reg)
    expect(summary.registry_complete).toBe(false)
  })

  it('unknown_count reflects UNKNOWN verdicts separately from status', () => {
    const reg = {
      version: '1.0.0',
      generated_at: NOW,
      agents: [makeAgent({ last_verdict: 'UNKNOWN', agent_id: 'a1' })],
    }
    const summary = buildAgentEffectivenessSummary(reg)
    expect(summary.unknown_count).toBe(1)
  })

  it('AgentEffectivenessRegistrySchema parses valid registry', () => {
    const reg = { version: '1.0.0', generated_at: NOW, agents: [makeAgent()] }
    expect(AgentEffectivenessRegistrySchema.safeParse(reg).success).toBe(true)
  })
})

/**
 * Lock D4 — Self-Improvement Lab Contract
 * Unit tests
 */

import { describe, it, expect } from 'vitest';
import {
  ImprovementDomainSchema,
  PipelineStageSchema,
  ImprovementProposalSchema,
  LabSessionSchema,
  D4SelfImprovementLabContractSchema,
  evaluateProposalSafety,
  detectImprovement,
  advancePipelineStage,
  buildLabSession,
  getD4SelfImprovementLabContract,
  SELF_IMPROVEMENT_D4_FLAG,
  type ImprovementProposal,
  // v15 sidecar
  SelfImprovementLabRecordSchema,
  SelfImprovementApprovalGateSchema,
  SelfImprovementPatchProposalSchema,
  ImprovementStateSchema,
  PromotionStatusSchema,
  ImprovementRiskLevelSchema,
  canPromote,
  canGenerateProposal,
  canRunSandbox,
  canCompareEvals,
  blocksAutoMerge,
  blocksSelfDeploy,
  requiresApproval,
  isIdentitySensitiveProposal,
  isRuntimeSensitiveProposal,
  hasRequiredProof,
  buildSelfImprovementSummary,
  D4_SELF_IMPROVEMENT_LAB_CONTRACT,
  D4_SELF_IMPROVEMENT_KNOWN_LIMITS,
  type SelfImprovementLabRecord,
  type SelfImprovementApprovalGate,
} from '../SelfImprovementLabContract';

describe('D4 — Self-Improvement Lab Contract', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────
  describe('ImprovementDomainSchema', () => {
    it('accepts all 5 domains', () => {
      for (const d of [
        'response_quality',
        'reasoning_accuracy',
        'knowledge_gap',
        'latency_optimization',
        'prompt_calibration',
      ] as const) {
        expect(() => ImprovementDomainSchema.parse(d)).not.toThrow();
      }
    });
    it('rejects unknown domain', () => {
      expect(() => ImprovementDomainSchema.parse('world_takeover')).toThrow();
    });
  });

  describe('PipelineStageSchema', () => {
    it('accepts all 5 stages', () => {
      for (const s of ['detect', 'propose', 'evaluate', 'approve', 'apply'] as const) {
        expect(() => PipelineStageSchema.parse(s)).not.toThrow();
      }
    });
    it('rejects unknown stage', () => {
      expect(() => PipelineStageSchema.parse('deploy')).toThrow();
    });
  });

  // ── ImprovementProposalSchema ─────────────────────────────────────────────
  describe('ImprovementProposalSchema', () => {
    const valid = {
      proposal_id: 'p-001',
      domain: 'response_quality',
      description: 'Improve response completeness',
      detected_pattern: 'truncated answers in complex queries',
      proposed_change: 'add length check before emit',
      safety_score: 0.9,
      effectiveness_estimate: 0.7,
      stage: 'detect',
      t4_blocked: true,
      created_at_ms: 1000,
    };
    it('accepts valid proposal', () => {
      expect(() => ImprovementProposalSchema.parse(valid)).not.toThrow();
    });
    it('rejects safety_score > 1', () => {
      expect(() =>
        ImprovementProposalSchema.parse({ ...valid, safety_score: 1.1 })
      ).toThrow();
    });
    it('rejects safety_score < 0', () => {
      expect(() =>
        ImprovementProposalSchema.parse({ ...valid, safety_score: -0.1 })
      ).toThrow();
    });
    it('rejects empty description', () => {
      expect(() =>
        ImprovementProposalSchema.parse({ ...valid, description: '' })
      ).toThrow();
    });
  });

  // ── LabSessionSchema ──────────────────────────────────────────────────────
  describe('LabSessionSchema', () => {
    it('requires total_applied=0 (scaffold invariant)', () => {
      expect(() =>
        LabSessionSchema.parse({
          session_id: 's',
          proposals: [],
          total_detected: 0,
          total_proposed: 0,
          total_evaluated: 0,
          total_blocked_at_t4: 0,
          total_applied: 1,
          flag_active: false,
        })
      ).toThrow();
    });
    it('accepts total_applied=0', () => {
      expect(() =>
        LabSessionSchema.parse({
          session_id: 's',
          proposals: [],
          total_detected: 0,
          total_proposed: 0,
          total_evaluated: 0,
          total_blocked_at_t4: 0,
          total_applied: 0,
          flag_active: false,
        })
      ).not.toThrow();
    });
  });

  // ── evaluateProposalSafety ────────────────────────────────────────────────
  describe('evaluateProposalSafety', () => {
    const makeProposal = (safety: number): ImprovementProposal => ({
      proposal_id: 'p',
      domain: 'response_quality',
      description: 'test',
      detected_pattern: 'x',
      proposed_change: 'y',
      safety_score: safety,
      effectiveness_estimate: 0.5,
      stage: 'detect',
      t4_blocked: true,
      created_at_ms: 0,
    });
    it('safe=true for score >= 0.8', () => {
      expect(evaluateProposalSafety(makeProposal(0.8)).safe).toBe(true);
      expect(evaluateProposalSafety(makeProposal(1.0)).safe).toBe(true);
    });
    it('safe=false for score < 0.8', () => {
      expect(evaluateProposalSafety(makeProposal(0.79)).safe).toBe(false);
      expect(evaluateProposalSafety(makeProposal(0.0)).safe).toBe(false);
    });
    it('blocking_reason null when safe', () => {
      expect(evaluateProposalSafety(makeProposal(0.9)).blocking_reason).toBeNull();
    });
    it('blocking_reason mentions threshold when unsafe', () => {
      expect(evaluateProposalSafety(makeProposal(0.5)).blocking_reason).toContain(
        'threshold'
      );
    });
    it('blocking_reason includes actual score', () => {
      const r = evaluateProposalSafety(makeProposal(0.55));
      expect(r.blocking_reason).toContain('0.55');
    });
  });

  // ── detectImprovement — flag=false ────────────────────────────────────────
  describe('detectImprovement — flag=false (T4 scaffold)', () => {
    const params = {
      proposal_id: 'p-001',
      domain: 'reasoning_accuracy' as const,
      description: 'Fix reasoning chain',
      detected_pattern: 'logic gap',
      proposed_change: 'add validation step',
      safety_score: 0.9,
      effectiveness_estimate: 0.75,
    };
    it('detected=false when flag=false', () => {
      expect(detectImprovement(params, false).detected).toBe(false);
    });
    it('proposal=null when flag=false', () => {
      expect(detectImprovement(params, false).proposal).toBeNull();
    });
    it('blocked_reason mentions flag=false', () => {
      expect(detectImprovement(params, false).blocked_reason).toContain('flag=false');
    });
  });

  // ── detectImprovement — flag=true ─────────────────────────────────────────
  describe('detectImprovement — flag=true', () => {
    const params = {
      proposal_id: 'p-001',
      domain: 'latency_optimization' as const,
      description: 'Optimize slow path',
      detected_pattern: 'knowledge_indexer 12s > budget',
      proposed_change: 'add cache layer',
      safety_score: 0.95,
      effectiveness_estimate: 0.8,
    };
    it('detected=true', () => {
      expect(detectImprovement(params, true).detected).toBe(true);
    });
    it('proposal is not null', () => {
      expect(detectImprovement(params, true).proposal).not.toBeNull();
    });
    it('proposal.stage=detect', () => {
      expect(detectImprovement(params, true).proposal?.stage).toBe('detect');
    });
    it('proposal.t4_blocked=true always', () => {
      expect(detectImprovement(params, true).proposal?.t4_blocked).toBe(true);
    });
  });

  // ── advancePipelineStage ──────────────────────────────────────────────────
  describe('advancePipelineStage — flag=false', () => {
    const detectProposal: ImprovementProposal = {
      proposal_id: 'p',
      domain: 'response_quality',
      description: 'd',
      detected_pattern: 'x',
      proposed_change: 'y',
      safety_score: 0.9,
      effectiveness_estimate: 0.8,
      stage: 'detect',
      t4_blocked: true,
      created_at_ms: 0,
    };
    it('blocked=true when flag=false', () => {
      expect(advancePipelineStage(detectProposal, false).blocked).toBe(true);
    });
    it('advanced=false when flag=false', () => {
      expect(advancePipelineStage(detectProposal, false).advanced).toBe(false);
    });
  });

  describe('advancePipelineStage — flag=true', () => {
    const makeProposal = (stage: ImprovementProposal['stage']): ImprovementProposal => ({
      proposal_id: 'p',
      domain: 'response_quality',
      description: 'd',
      detected_pattern: 'x',
      proposed_change: 'y',
      safety_score: 0.9,
      effectiveness_estimate: 0.8,
      stage,
      t4_blocked: true,
      created_at_ms: 0,
    });
    it('detect → propose advances', () => {
      const r = advancePipelineStage(makeProposal('detect'), true);
      expect(r.advanced).toBe(true);
      expect(r.new_stage).toBe('propose');
    });
    it('propose → evaluate advances', () => {
      const r = advancePipelineStage(makeProposal('propose'), true);
      expect(r.advanced).toBe(true);
      expect(r.new_stage).toBe('evaluate');
    });
    it('evaluate → approve advances', () => {
      const r = advancePipelineStage(makeProposal('evaluate'), true);
      expect(r.advanced).toBe(true);
      expect(r.new_stage).toBe('approve');
    });
    it('approve → apply is BLOCKED (T4 scaffold)', () => {
      const r = advancePipelineStage(makeProposal('approve'), true);
      expect(r.blocked).toBe(true);
      expect(r.advanced).toBe(false);
    });
    it('blocking_reason for approve mentions T4', () => {
      const r = advancePipelineStage(makeProposal('approve'), true);
      expect(r.blocking_reason).toContain('T4');
    });
  });

  // ── buildLabSession ───────────────────────────────────────────────────────
  describe('buildLabSession', () => {
    const makeProposal = (
      stage: ImprovementProposal['stage'],
      id: string
    ): ImprovementProposal => ({
      proposal_id: id,
      domain: 'knowledge_gap',
      description: 'd',
      detected_pattern: 'x',
      proposed_change: 'y',
      safety_score: 0.9,
      effectiveness_estimate: 0.7,
      stage,
      t4_blocked: true,
      created_at_ms: 0,
    });
    it('total_applied always=0', () => {
      const session = buildLabSession(
        's',
        [makeProposal('detect', 'p1'), makeProposal('propose', 'p2')],
        true
      );
      expect(session.total_applied).toBe(0);
    });
    it('total_detected counts detect stage', () => {
      const session = buildLabSession(
        's',
        [
          makeProposal('detect', 'p1'),
          makeProposal('detect', 'p2'),
          makeProposal('propose', 'p3'),
        ],
        true
      );
      expect(session.total_detected).toBe(2);
    });
    it('total_blocked_at_t4 counts all t4_blocked=true', () => {
      const session = buildLabSession(
        's',
        [makeProposal('approve', 'p1'), makeProposal('evaluate', 'p2')],
        true
      );
      expect(session.total_blocked_at_t4).toBe(2);
    });
    it('empty session has all zeros', () => {
      const session = buildLabSession('s', [], false);
      expect(session.total_detected).toBe(0);
      expect(session.total_applied).toBe(0);
    });
    it('validates against LabSessionSchema', () => {
      const session = buildLabSession('s', [makeProposal('detect', 'p1')], true);
      expect(() => LabSessionSchema.parse(session)).not.toThrow();
    });
  });

  // ── getD4SelfImprovementLabContract ───────────────────────────────────────
  describe('getD4SelfImprovementLabContract', () => {
    it('lock=D4', () => expect(getD4SelfImprovementLabContract().lock).toBe('D4'));
    it('tier=T4', () => expect(getD4SelfImprovementLabContract().tier).toBe('T4'));
    it('flag_name correct', () => {
      expect(getD4SelfImprovementLabContract().flag_name).toBe(
        'TITANE_D4_SELF_IMPROVEMENT_LAB'
      );
    });
    it('improvement_domains=5', () =>
      expect(getD4SelfImprovementLabContract().improvement_domains).toBe(5));
    it('pipeline_stages=5', () =>
      expect(getD4SelfImprovementLabContract().pipeline_stages).toBe(5));
    it('apply_stage_blocked=true', () => {
      expect(getD4SelfImprovementLabContract().apply_stage_blocked).toBe(true);
    });
    it('safety_threshold=0.8', () =>
      expect(getD4SelfImprovementLabContract().safety_threshold).toBe(0.8));
    it('t4_approval_required=true', () => {
      expect(getD4SelfImprovementLabContract().t4_approval_required).toBe(true);
    });
    it('total_applied_in_scaffold=0', () => {
      expect(getD4SelfImprovementLabContract().total_applied_in_scaffold).toBe(0);
    });
    it('validates against D4SelfImprovementLabContractSchema', () => {
      expect(() =>
        D4SelfImprovementLabContractSchema.parse(getD4SelfImprovementLabContract())
      ).not.toThrow();
    });
    it('flag_active reflects env', () => {
      expect(getD4SelfImprovementLabContract().flag_active).toBe(
        SELF_IMPROVEMENT_D4_FLAG
      );
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ── D4-UNIT-01..10 — v15 Sidecar: Approval-Gated Lab ────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makeWeakness = () => ({
  weakness_id: 'weak-001',
  domain: 'response_quality' as const,
  description: 'Response truncated in edge case',
  observed_at: '2026-05-06T00:00:00Z',
  severity: 'medium' as const,
  evidence: null,
});

const makeRecord = (
  overrides: Partial<SelfImprovementLabRecord> = {}
): SelfImprovementLabRecord => ({
  record_id: 'rec-001',
  weakness: makeWeakness(),
  hypothesis: null,
  patch_proposal: null,
  sandbox_plan: null,
  approval_gate: null,
  state: 'observed',
  risk_level: 'low',
  created_at: '2026-05-06T00:00:00Z',
  updated_at: '2026-05-06T00:00:00Z',
  ...overrides,
});

const makeApprovedGate = (
  overrides: Partial<SelfImprovementApprovalGate> = {}
): SelfImprovementApprovalGate => ({
  gate_id: 'gate-001',
  patch_id: 'patch-001',
  approval_status: 'approved_for_promotion',
  approved_by: 'kevin',
  approved_at: '2026-05-06T00:00:00Z',
  rejected_reason: null,
  auto_approved: false,
  proof_pack_required: true,
  has_proof_pack: true,
  ...overrides,
});

const makePatch = () => ({
  patch_id: 'patch-001',
  hypothesis_id: 'hyp-001',
  patch_description: 'Handle edge case truncation',
  affected_paths: ['src/services/chat/'],
  is_applied: false as const,
  risk_level: 'low' as const,
  requires_approval: true,
  approval_status: 'not_promotable' as const,
  created_at: '2026-05-06T00:00:00Z',
});

// ── D4-UNIT-01: SelfImprovementLabRecord validates a complete proposed improvement
describe('D4-UNIT-01 — SelfImprovementLabRecord schema validates complete record', () => {
  const record = makeRecord({
    hypothesis: {
      hypothesis_id: 'hyp-001',
      weakness_id: 'weak-001',
      hypothesis_text: 'Truncation caused by buffer limit',
      confidence: 0.85,
      requires_sandbox: false,
      created_at: '2026-05-06T00:00:00Z',
    },
    patch_proposal: makePatch(),
    state: 'proposed',
  });
  it('parses without error', () => {
    expect(() => SelfImprovementLabRecordSchema.parse(record)).not.toThrow();
  });
  it('has record_id', () => {
    expect(record.record_id).toBe('rec-001');
  });
  it('state=proposed', () => {
    expect(record.state).toBe('proposed');
  });
  it('weakness domain is valid', () => {
    expect(ImprovementDomainSchema.safeParse(record.weakness.domain).success).toBe(true);
  });
  it('patch is_applied=false', () => {
    expect(record.patch_proposal?.is_applied).toBe(false);
  });
});

// ── D4-UNIT-02: canPromote false without explicit approval
describe('D4-UNIT-02 — canPromote false without explicit approval', () => {
  it('null gate → false', () => {
    expect(canPromote(makeRecord())).toBe(false);
  });
  it('approval_required gate → false', () => {
    const r = makeRecord({
      approval_gate: makeApprovedGate({ approval_status: 'approval_required' }),
      state: 'proof_ready',
    });
    expect(canPromote(r)).toBe(false);
  });
  it('not_promotable gate → false', () => {
    const r = makeRecord({
      approval_gate: makeApprovedGate({ approval_status: 'not_promotable' }),
      state: 'proof_ready',
    });
    expect(canPromote(r)).toBe(false);
  });
  it('rejected gate → false', () => {
    const r = makeRecord({
      approval_gate: makeApprovedGate({ approval_status: 'rejected' }),
      state: 'proof_ready',
    });
    expect(canPromote(r)).toBe(false);
  });
  it('approved_for_promotion + approved state → true', () => {
    const r = makeRecord({ approval_gate: makeApprovedGate(), state: 'approved' });
    expect(canPromote(r)).toBe(true);
  });
  it('blocked state blocks even with gate approved', () => {
    const r = makeRecord({ approval_gate: makeApprovedGate(), state: 'blocked' });
    expect(canPromote(r)).toBe(false);
  });
});

// ── D4-UNIT-03: confidence alone cannot approve promotion
describe('D4-UNIT-03 — confidence alone cannot approve promotion', () => {
  it('high confidence 0.99, no gate → canPromote=false', () => {
    const r = makeRecord({
      hypothesis: {
        hypothesis_id: 'hyp-001',
        weakness_id: 'weak-001',
        hypothesis_text: 'High confidence test',
        confidence: 0.99,
        requires_sandbox: false,
        created_at: '2026-05-06T00:00:00Z',
      },
    });
    expect(canPromote(r)).toBe(false);
  });
  it('D4_SELF_IMPROVEMENT_LAB_CONTRACT.approval_required=true', () => {
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.approval_required).toBe(true);
  });
  it('requiresApproval always true', () => {
    expect(requiresApproval(makeRecord())).toBe(true);
  });
});

// ── D4-UNIT-04: eval improvement alone cannot approve promotion
describe('D4-UNIT-04 — eval improvement alone cannot approve promotion', () => {
  it('perfect score, no gate → canPromote=false', () => {
    const r = makeRecord({ state: 'proof_ready' });
    expect(canPromote(r)).toBe(false);
  });
  it('approval_gate with not_promotable status → false even if state=proof_ready', () => {
    const r = makeRecord({
      approval_gate: makeApprovedGate({ approval_status: 'not_promotable' }),
      state: 'proof_ready',
    });
    expect(canPromote(r)).toBe(false);
  });
  it('canCompareEvals returns true for proof_ready state', () => {
    expect(canCompareEvals(makeRecord({ state: 'proof_ready' }))).toBe(true);
  });
  it('canCompareEvals does not imply canPromote', () => {
    const r = makeRecord({ state: 'proof_ready' });
    expect(canCompareEvals(r)).toBe(true);
    expect(canPromote(r)).toBe(false);
  });
});

// ── D4-UNIT-05: generated patch proposal is not an applied patch
describe('D4-UNIT-05 — generated patch proposal is never an applied patch', () => {
  it('patch is_applied literal=false parses', () => {
    expect(() => SelfImprovementPatchProposalSchema.parse(makePatch())).not.toThrow();
  });
  it('patch is_applied=false in schema', () => {
    expect(makePatch().is_applied).toBe(false);
  });
  it('patch is_applied=true is rejected by schema', () => {
    const invalidPatch = { ...makePatch(), is_applied: true };
    expect(SelfImprovementPatchProposalSchema.safeParse(invalidPatch).success).toBe(
      false
    );
  });
  it('record with patch has is_applied=false', () => {
    const r = makeRecord({ patch_proposal: makePatch() });
    expect(r.patch_proposal?.is_applied).toBe(false);
  });
});

// ── D4-UNIT-06: identity-sensitive proposal requires Twin Consent Ledger validation
describe('D4-UNIT-06 — identity-sensitive proposal requires Twin Consent Ledger', () => {
  it('identity_sensitive risk is detected', () => {
    const r = makeRecord({ risk_level: 'identity_sensitive' });
    expect(isIdentitySensitiveProposal(r)).toBe(true);
  });
  it('restricted risk is detected as identity-sensitive', () => {
    const r = makeRecord({ risk_level: 'restricted' });
    expect(isIdentitySensitiveProposal(r)).toBe(true);
  });
  it('low risk is not identity-sensitive', () => {
    expect(isIdentitySensitiveProposal(makeRecord({ risk_level: 'low' }))).toBe(false);
  });
  it('medium risk is not identity-sensitive', () => {
    expect(isIdentitySensitiveProposal(makeRecord({ risk_level: 'medium' }))).toBe(false);
  });
  it('D4 known limits include twin-consent reference', () => {
    const limit = D4_SELF_IMPROVEMENT_KNOWN_LIMITS.find(
      l => l.includes('twin-consent') || l.includes('Twin Consent')
    );
    expect(limit).toBeDefined();
  });
});

// ── D4-UNIT-07: runtime-sensitive proposal requires feature flag and rollback
describe('D4-UNIT-07 — runtime-sensitive proposal requires feature flag and rollback', () => {
  it('runtime_sensitive risk is detected', () => {
    const r = makeRecord({ risk_level: 'runtime_sensitive' });
    expect(isRuntimeSensitiveProposal(r)).toBe(true);
  });
  it('security_sensitive risk is detected as runtime-sensitive', () => {
    const r = makeRecord({ risk_level: 'security_sensitive' });
    expect(isRuntimeSensitiveProposal(r)).toBe(true);
  });
  it('restricted risk is also runtime-sensitive', () => {
    const r = makeRecord({ risk_level: 'restricted' });
    expect(isRuntimeSensitiveProposal(r)).toBe(true);
  });
  it('low risk is not runtime-sensitive', () => {
    expect(isRuntimeSensitiveProposal(makeRecord({ risk_level: 'low' }))).toBe(false);
  });
  it('D4 known limits include feature-flag reference', () => {
    const limit = D4_SELF_IMPROVEMENT_KNOWN_LIMITS.find(
      l => l.includes('feature flag') || l.includes('flag-and-rollback')
    );
    expect(limit).toBeDefined();
  });
});

// ── D4-UNIT-08: auto-merge is blocked (blocksAutoMerge always returns true)
describe('D4-UNIT-08 — auto-merge is always blocked', () => {
  it('blocksAutoMerge returns true for observed record', () => {
    expect(blocksAutoMerge(makeRecord())).toBe(true);
  });
  it('blocksAutoMerge returns true for approved record', () => {
    expect(
      blocksAutoMerge(
        makeRecord({ approval_gate: makeApprovedGate(), state: 'approved' })
      )
    ).toBe(true);
  });
  it('blocksAutoMerge returns true for blocked record', () => {
    expect(blocksAutoMerge(makeRecord({ state: 'blocked' }))).toBe(true);
  });
  it('D4_SELF_IMPROVEMENT_LAB_CONTRACT.auto_merge_blocked=true', () => {
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.auto_merge_blocked).toBe(true);
  });
  it('approval gate auto_approved=true is rejected by schema', () => {
    const invalidGate = { ...makeApprovedGate(), auto_approved: true };
    expect(SelfImprovementApprovalGateSchema.safeParse(invalidGate).success).toBe(false);
  });
});

// ── D4-UNIT-09: self-deploy is blocked (blocksSelfDeploy always returns true)
describe('D4-UNIT-09 — self-deploy is always blocked', () => {
  it('blocksSelfDeploy returns true for observed record', () => {
    expect(blocksSelfDeploy(makeRecord())).toBe(true);
  });
  it('blocksSelfDeploy returns true for approved record', () => {
    expect(
      blocksSelfDeploy(
        makeRecord({ approval_gate: makeApprovedGate(), state: 'approved' })
      )
    ).toBe(true);
  });
  it('blocksSelfDeploy returns true for any risk level', () => {
    for (const level of [
      'low',
      'high',
      'identity_sensitive',
      'runtime_sensitive',
      'restricted',
    ] as const) {
      expect(blocksSelfDeploy(makeRecord({ risk_level: level }))).toBe(true);
    }
  });
  it('D4_SELF_IMPROVEMENT_LAB_CONTRACT.self_deploy_blocked=true', () => {
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.self_deploy_blocked).toBe(true);
  });
});

// ── D4-UNIT-10: buildSelfImprovementSummary counts proposed/evaluated/approved/rejected/blocked
describe('D4-UNIT-10 — buildSelfImprovementSummary produces correct counts', () => {
  const records: SelfImprovementLabRecord[] = [
    makeRecord({ record_id: 'r1', state: 'observed' }),
    makeRecord({ record_id: 'r2', state: 'proposed' }),
    makeRecord({ record_id: 'r3', state: 'proposed' }),
    makeRecord({
      record_id: 'r4',
      state: 'approved',
      approval_gate: makeApprovedGate({ gate_id: 'g4' }),
    }),
    makeRecord({
      record_id: 'r5',
      state: 'rejected',
      approval_gate: makeApprovedGate({
        gate_id: 'g5',
        approval_status: 'rejected',
        rejected_reason: 'unsafe',
      }),
    }),
    makeRecord({ record_id: 'r6', state: 'blocked' }),
    makeRecord({ record_id: 'r7', state: 'observed', risk_level: 'identity_sensitive' }),
    makeRecord({ record_id: 'r8', state: 'observed', risk_level: 'runtime_sensitive' }),
  ];
  const summary = buildSelfImprovementSummary(records);

  it('total=8', () => expect(summary.total).toBe(8));
  it('observed=3 (r1 + r7 + r8)', () => expect(summary.observed).toBe(3));
  it('proposed=2 (r2 + r3)', () => expect(summary.proposed).toBe(2));
  it('approved=1 (r4)', () => expect(summary.approved).toBe(1));
  it('rejected=1 (r5)', () => expect(summary.rejected).toBe(1));
  it('blocked=1 (r6)', () => expect(summary.blocked).toBe(1));
  it('identity_sensitive=1 (r7)', () => expect(summary.identity_sensitive).toBe(1));
  it('runtime_sensitive=1 (r8)', () => expect(summary.runtime_sensitive).toBe(1));
  it('auto_merge_blocked=true always', () =>
    expect(summary.auto_merge_blocked).toBe(true));
  it('self_deploy_blocked=true always', () =>
    expect(summary.self_deploy_blocked).toBe(true));
  it('confidence_alone_approves=false always', () =>
    expect(summary.confidence_alone_approves).toBe(false));
});

// ── Additional v15 schema tests ──────────────────────────────────────────────
describe('v15 — ImprovementStateSchema (12 states)', () => {
  const states = [
    'observed',
    'hypothesis',
    'proposed',
    'sandboxed',
    'evaluated',
    'proof_ready',
    'approval_required',
    'approved',
    'rejected',
    'expired',
    'blocked',
    'unknown',
  ];
  it(`accepts all ${states.length} states`, () => {
    for (const s of states)
      expect(ImprovementStateSchema.safeParse(s).success).toBe(true);
  });
  it('rejects unknown state', () => {
    expect(ImprovementStateSchema.safeParse('unknown_state_xyz').success).toBe(false);
  });
});

describe('v15 — PromotionStatusSchema (5 statuses)', () => {
  const statuses = [
    'not_promotable',
    'approval_required',
    'approved_for_promotion',
    'rejected',
    'blocked',
  ];
  it(`accepts all ${statuses.length} statuses`, () => {
    for (const s of statuses)
      expect(PromotionStatusSchema.safeParse(s).success).toBe(true);
  });
  it('rejects invalid status', () => {
    expect(PromotionStatusSchema.safeParse('auto_approved').success).toBe(false);
  });
});

describe('v15 — ImprovementRiskLevelSchema (7 levels)', () => {
  const levels = [
    'low',
    'medium',
    'high',
    'identity_sensitive',
    'runtime_sensitive',
    'security_sensitive',
    'restricted',
  ];
  it(`accepts all ${levels.length} levels`, () => {
    for (const l of levels)
      expect(ImprovementRiskLevelSchema.safeParse(l).success).toBe(true);
  });
  it('rejects unknown level', () => {
    expect(ImprovementRiskLevelSchema.safeParse('ultra_safe').success).toBe(false);
  });
});

describe('v15 — canGenerateProposal / canRunSandbox / canCompareEvals lifecycle', () => {
  it('observed → canGenerateProposal=true', () => {
    expect(canGenerateProposal(makeRecord({ state: 'observed' }))).toBe(true);
  });
  it('hypothesis → canGenerateProposal=true', () => {
    expect(canGenerateProposal(makeRecord({ state: 'hypothesis' }))).toBe(true);
  });
  it('proposed → canRunSandbox=true', () => {
    expect(canRunSandbox(makeRecord({ state: 'proposed' }))).toBe(true);
  });
  it('rejected → canGenerateProposal=false', () => {
    expect(canGenerateProposal(makeRecord({ state: 'rejected' }))).toBe(false);
  });
  it('rejected → canRunSandbox=false', () => {
    expect(canRunSandbox(makeRecord({ state: 'rejected' }))).toBe(false);
  });
  it('evaluated → canCompareEvals=true', () => {
    expect(canCompareEvals(makeRecord({ state: 'evaluated' }))).toBe(true);
  });
  it('proof_ready → canCompareEvals=true', () => {
    expect(canCompareEvals(makeRecord({ state: 'proof_ready' }))).toBe(true);
  });
  it('observed → canCompareEvals=false', () => {
    expect(canCompareEvals(makeRecord({ state: 'observed' }))).toBe(false);
  });
});

describe('v15 — hasRequiredProof', () => {
  it('null gate → false', () => {
    expect(hasRequiredProof(makeRecord())).toBe(false);
  });
  it('gate with has_proof_pack=true → true', () => {
    expect(
      hasRequiredProof(
        makeRecord({ approval_gate: makeApprovedGate({ has_proof_pack: true }) })
      )
    ).toBe(true);
  });
  it('gate with has_proof_pack=false → false', () => {
    expect(
      hasRequiredProof(
        makeRecord({ approval_gate: makeApprovedGate({ has_proof_pack: false }) })
      )
    ).toBe(false);
  });
});

describe('v15 — D4_SELF_IMPROVEMENT_LAB_CONTRACT metadata', () => {
  it('active=false', () => expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.active).toBe(false));
  it('approval_required=true', () =>
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.approval_required).toBe(true));
  it('auto_merge_blocked=true', () =>
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.auto_merge_blocked).toBe(true));
  it('self_deploy_blocked=true', () =>
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.self_deploy_blocked).toBe(true));
  it('improvement_states=12', () =>
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.improvement_states).toBe(12));
  it('promotion_statuses=5', () =>
    expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.promotion_statuses).toBe(5));
  it('risk_levels=7', () => expect(D4_SELF_IMPROVEMENT_LAB_CONTRACT.risk_levels).toBe(7));
  it('has 6 known limits', () =>
    expect(D4_SELF_IMPROVEMENT_KNOWN_LIMITS.length).toBeGreaterThanOrEqual(6));
});

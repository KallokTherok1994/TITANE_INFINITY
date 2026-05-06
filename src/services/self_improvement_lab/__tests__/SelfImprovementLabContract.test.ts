/**
 * Lock D4 — Self-Improvement Lab Contract
 * Unit tests
 */

import { describe, it, expect } from 'vitest'
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
} from '../SelfImprovementLabContract'

describe('D4 — Self-Improvement Lab Contract', () => {
  // ── Enum Schemas ──────────────────────────────────────────────────────────
  describe('ImprovementDomainSchema', () => {
    it('accepts all 5 domains', () => {
      for (const d of ['response_quality', 'reasoning_accuracy', 'knowledge_gap', 'latency_optimization', 'prompt_calibration'] as const) {
        expect(() => ImprovementDomainSchema.parse(d)).not.toThrow()
      }
    })
    it('rejects unknown domain', () => {
      expect(() => ImprovementDomainSchema.parse('world_takeover')).toThrow()
    })
  })

  describe('PipelineStageSchema', () => {
    it('accepts all 5 stages', () => {
      for (const s of ['detect', 'propose', 'evaluate', 'approve', 'apply'] as const) {
        expect(() => PipelineStageSchema.parse(s)).not.toThrow()
      }
    })
    it('rejects unknown stage', () => {
      expect(() => PipelineStageSchema.parse('deploy')).toThrow()
    })
  })

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
    }
    it('accepts valid proposal', () => {
      expect(() => ImprovementProposalSchema.parse(valid)).not.toThrow()
    })
    it('rejects safety_score > 1', () => {
      expect(() => ImprovementProposalSchema.parse({ ...valid, safety_score: 1.1 })).toThrow()
    })
    it('rejects safety_score < 0', () => {
      expect(() => ImprovementProposalSchema.parse({ ...valid, safety_score: -0.1 })).toThrow()
    })
    it('rejects empty description', () => {
      expect(() => ImprovementProposalSchema.parse({ ...valid, description: '' })).toThrow()
    })
  })

  // ── LabSessionSchema ──────────────────────────────────────────────────────
  describe('LabSessionSchema', () => {
    it('requires total_applied=0 (scaffold invariant)', () => {
      expect(() =>
        LabSessionSchema.parse({
          session_id: 's', proposals: [], total_detected: 0, total_proposed: 0,
          total_evaluated: 0, total_blocked_at_t4: 0, total_applied: 1, flag_active: false,
        })
      ).toThrow()
    })
    it('accepts total_applied=0', () => {
      expect(() =>
        LabSessionSchema.parse({
          session_id: 's', proposals: [], total_detected: 0, total_proposed: 0,
          total_evaluated: 0, total_blocked_at_t4: 0, total_applied: 0, flag_active: false,
        })
      ).not.toThrow()
    })
  })

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
    })
    it('safe=true for score >= 0.8', () => {
      expect(evaluateProposalSafety(makeProposal(0.8)).safe).toBe(true)
      expect(evaluateProposalSafety(makeProposal(1.0)).safe).toBe(true)
    })
    it('safe=false for score < 0.8', () => {
      expect(evaluateProposalSafety(makeProposal(0.79)).safe).toBe(false)
      expect(evaluateProposalSafety(makeProposal(0.0)).safe).toBe(false)
    })
    it('blocking_reason null when safe', () => {
      expect(evaluateProposalSafety(makeProposal(0.9)).blocking_reason).toBeNull()
    })
    it('blocking_reason mentions threshold when unsafe', () => {
      expect(evaluateProposalSafety(makeProposal(0.5)).blocking_reason).toContain('threshold')
    })
    it('blocking_reason includes actual score', () => {
      const r = evaluateProposalSafety(makeProposal(0.55))
      expect(r.blocking_reason).toContain('0.55')
    })
  })

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
    }
    it('detected=false when flag=false', () => {
      expect(detectImprovement(params, false).detected).toBe(false)
    })
    it('proposal=null when flag=false', () => {
      expect(detectImprovement(params, false).proposal).toBeNull()
    })
    it('blocked_reason mentions flag=false', () => {
      expect(detectImprovement(params, false).blocked_reason).toContain('flag=false')
    })
  })

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
    }
    it('detected=true', () => {
      expect(detectImprovement(params, true).detected).toBe(true)
    })
    it('proposal is not null', () => {
      expect(detectImprovement(params, true).proposal).not.toBeNull()
    })
    it('proposal.stage=detect', () => {
      expect(detectImprovement(params, true).proposal?.stage).toBe('detect')
    })
    it('proposal.t4_blocked=true always', () => {
      expect(detectImprovement(params, true).proposal?.t4_blocked).toBe(true)
    })
  })

  // ── advancePipelineStage ──────────────────────────────────────────────────
  describe('advancePipelineStage — flag=false', () => {
    const detectProposal: ImprovementProposal = {
      proposal_id: 'p', domain: 'response_quality', description: 'd', detected_pattern: 'x',
      proposed_change: 'y', safety_score: 0.9, effectiveness_estimate: 0.8,
      stage: 'detect', t4_blocked: true, created_at_ms: 0,
    }
    it('blocked=true when flag=false', () => {
      expect(advancePipelineStage(detectProposal, false).blocked).toBe(true)
    })
    it('advanced=false when flag=false', () => {
      expect(advancePipelineStage(detectProposal, false).advanced).toBe(false)
    })
  })

  describe('advancePipelineStage — flag=true', () => {
    const makeProposal = (stage: ImprovementProposal['stage']): ImprovementProposal => ({
      proposal_id: 'p', domain: 'response_quality', description: 'd', detected_pattern: 'x',
      proposed_change: 'y', safety_score: 0.9, effectiveness_estimate: 0.8,
      stage, t4_blocked: true, created_at_ms: 0,
    })
    it('detect → propose advances', () => {
      const r = advancePipelineStage(makeProposal('detect'), true)
      expect(r.advanced).toBe(true)
      expect(r.new_stage).toBe('propose')
    })
    it('propose → evaluate advances', () => {
      const r = advancePipelineStage(makeProposal('propose'), true)
      expect(r.advanced).toBe(true)
      expect(r.new_stage).toBe('evaluate')
    })
    it('evaluate → approve advances', () => {
      const r = advancePipelineStage(makeProposal('evaluate'), true)
      expect(r.advanced).toBe(true)
      expect(r.new_stage).toBe('approve')
    })
    it('approve → apply is BLOCKED (T4 scaffold)', () => {
      const r = advancePipelineStage(makeProposal('approve'), true)
      expect(r.blocked).toBe(true)
      expect(r.advanced).toBe(false)
    })
    it('blocking_reason for approve mentions T4', () => {
      const r = advancePipelineStage(makeProposal('approve'), true)
      expect(r.blocking_reason).toContain('T4')
    })
  })

  // ── buildLabSession ───────────────────────────────────────────────────────
  describe('buildLabSession', () => {
    const makeProposal = (stage: ImprovementProposal['stage'], id: string): ImprovementProposal => ({
      proposal_id: id, domain: 'knowledge_gap', description: 'd', detected_pattern: 'x',
      proposed_change: 'y', safety_score: 0.9, effectiveness_estimate: 0.7,
      stage, t4_blocked: true, created_at_ms: 0,
    })
    it('total_applied always=0', () => {
      const session = buildLabSession('s', [makeProposal('detect', 'p1'), makeProposal('propose', 'p2')], true)
      expect(session.total_applied).toBe(0)
    })
    it('total_detected counts detect stage', () => {
      const session = buildLabSession('s', [makeProposal('detect', 'p1'), makeProposal('detect', 'p2'), makeProposal('propose', 'p3')], true)
      expect(session.total_detected).toBe(2)
    })
    it('total_blocked_at_t4 counts all t4_blocked=true', () => {
      const session = buildLabSession('s', [makeProposal('approve', 'p1'), makeProposal('evaluate', 'p2')], true)
      expect(session.total_blocked_at_t4).toBe(2)
    })
    it('empty session has all zeros', () => {
      const session = buildLabSession('s', [], false)
      expect(session.total_detected).toBe(0)
      expect(session.total_applied).toBe(0)
    })
    it('validates against LabSessionSchema', () => {
      const session = buildLabSession('s', [makeProposal('detect', 'p1')], true)
      expect(() => LabSessionSchema.parse(session)).not.toThrow()
    })
  })

  // ── getD4SelfImprovementLabContract ───────────────────────────────────────
  describe('getD4SelfImprovementLabContract', () => {
    it('lock=D4', () => expect(getD4SelfImprovementLabContract().lock).toBe('D4'))
    it('tier=T4', () => expect(getD4SelfImprovementLabContract().tier).toBe('T4'))
    it('flag_name correct', () => {
      expect(getD4SelfImprovementLabContract().flag_name).toBe('TITANE_D4_SELF_IMPROVEMENT_LAB')
    })
    it('improvement_domains=5', () => expect(getD4SelfImprovementLabContract().improvement_domains).toBe(5))
    it('pipeline_stages=5', () => expect(getD4SelfImprovementLabContract().pipeline_stages).toBe(5))
    it('apply_stage_blocked=true', () => {
      expect(getD4SelfImprovementLabContract().apply_stage_blocked).toBe(true)
    })
    it('safety_threshold=0.8', () => expect(getD4SelfImprovementLabContract().safety_threshold).toBe(0.8))
    it('t4_approval_required=true', () => {
      expect(getD4SelfImprovementLabContract().t4_approval_required).toBe(true)
    })
    it('total_applied_in_scaffold=0', () => {
      expect(getD4SelfImprovementLabContract().total_applied_in_scaffold).toBe(0)
    })
    it('validates against D4SelfImprovementLabContractSchema', () => {
      expect(() => D4SelfImprovementLabContractSchema.parse(getD4SelfImprovementLabContract())).not.toThrow()
    })
    it('flag_active reflects env', () => {
      expect(getD4SelfImprovementLabContract().flag_active).toBe(SELF_IMPROVEMENT_D4_FLAG)
    })
  })
})

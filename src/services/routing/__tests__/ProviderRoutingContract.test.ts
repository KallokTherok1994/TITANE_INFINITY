import { describe, it, expect, beforeEach } from 'vitest'
import {
  resolveOllamaModelC0,
  getC0ProviderRoutingContract,
  OllamaModelResolutionSchema,
  C0ProviderRoutingContractSchema,
  TITANE_PROD_OLLAMA_MODEL,
  TITANE_LEGACY_OLLAMA_FALLBACK,
  TITANE_DEV_OLLAMA_MODEL,
} from '../ProviderRoutingContract'

describe('ProviderRoutingContract — Lock C0', () => {
  // ── Constants ────────────────────────────────────────────────────────────────
  describe('Constants invariants', () => {
    it('PROD model must be gemma2:2b', () => {
      expect(TITANE_PROD_OLLAMA_MODEL).toBe('gemma2:2b')
    })
    it('Legacy fallback must be llama3.1:latest', () => {
      expect(TITANE_LEGACY_OLLAMA_FALLBACK).toBe('llama3.1:latest')
    })
    it('DEV model must be qwen2.5-coder', () => {
      expect(TITANE_DEV_OLLAMA_MODEL).toBe('qwen2.5-coder')
    })
    it('DEV model must never equal PROD model', () => {
      expect(TITANE_DEV_OLLAMA_MODEL).not.toBe(TITANE_PROD_OLLAMA_MODEL)
    })
    it('DEV model must never equal legacy fallback', () => {
      expect(TITANE_DEV_OLLAMA_MODEL).not.toBe(TITANE_LEGACY_OLLAMA_FALLBACK)
    })
  })

  // ── resolveOllamaModelC0 ────────────────────────────────────────────────────
  describe('resolveOllamaModelC0 — flag=false (legacy path)', () => {
    it('returns llama3.1:latest when no model requested and flag off', () => {
      const result = resolveOllamaModelC0(null, false)
      expect(result.resolved_model).toBe('llama3.1:latest')
      expect(result.resolution_path).toBe('legacy_fallback')
      expect(result.flag_active).toBe(false)
    })

    it('returns llama3.1:latest when undefined model and flag off', () => {
      const result = resolveOllamaModelC0(undefined, false)
      expect(result.resolved_model).toBe('llama3.1:latest')
      expect(result.resolution_path).toBe('legacy_fallback')
    })
  })

  describe('resolveOllamaModelC0 — flag=true (C0 canonical path)', () => {
    it('returns gemma2:2b when no model and flag enabled', () => {
      const result = resolveOllamaModelC0(null, true)
      expect(result.resolved_model).toBe('gemma2:2b')
      expect(result.resolution_path).toBe('c0_prod_canonical')
      expect(result.flag_active).toBe(true)
    })

    it('resolved_model equals TITANE_PROD_OLLAMA_MODEL constant', () => {
      const result = resolveOllamaModelC0(null, true)
      expect(result.resolved_model).toBe(TITANE_PROD_OLLAMA_MODEL)
    })
  })

  describe('resolveOllamaModelC0 — explicit model always wins', () => {
    it('respects explicit model when flag off', () => {
      const result = resolveOllamaModelC0('mistral:latest', false)
      expect(result.resolved_model).toBe('mistral:latest')
      expect(result.resolution_path).toBe('explicit')
    })

    it('respects explicit model when flag on', () => {
      const result = resolveOllamaModelC0('mistral:latest', true)
      expect(result.resolved_model).toBe('mistral:latest')
      expect(result.resolution_path).toBe('explicit')
    })

    it('DEV model explicitly requested is preserved (explicit path, not contamination)', () => {
      const result = resolveOllamaModelC0('qwen2.5-coder', false)
      expect(result.resolved_model).toBe('qwen2.5-coder')
      expect(result.resolution_path).toBe('explicit')
    })
  })

  // ── Schema validation ───────────────────────────────────────────────────────
  describe('OllamaModelResolutionSchema', () => {
    it('validates a valid legacy resolution', () => {
      const data = {
        requested_model: null,
        resolved_model: 'llama3.1:latest',
        flag_active: false,
        resolution_path: 'legacy_fallback' as const,
      }
      const result = OllamaModelResolutionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('validates a valid C0 canonical resolution', () => {
      const data = {
        requested_model: null,
        resolved_model: 'gemma2:2b',
        flag_active: true,
        resolution_path: 'c0_prod_canonical' as const,
      }
      const result = OllamaModelResolutionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects unknown resolution_path', () => {
      const data = {
        requested_model: null,
        resolved_model: 'gemma2:2b',
        flag_active: true,
        resolution_path: 'unknown_path',
      }
      const result = OllamaModelResolutionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  // ── getC0ProviderRoutingContract ────────────────────────────────────────────
  describe('getC0ProviderRoutingContract', () => {
    let contract: ReturnType<typeof getC0ProviderRoutingContract>
    beforeEach(() => {
      contract = getC0ProviderRoutingContract()
    })

    it('parses with C0ProviderRoutingContractSchema', () => {
      const result = C0ProviderRoutingContractSchema.safeParse(contract)
      expect(result.success).toBe(true)
    })

    it('lock must be C0', () => {
      expect(contract.lock).toBe('C0')
    })

    it('tier must be T3', () => {
      expect(contract.tier).toBe('T3')
    })

    it('prod_ollama_model must be gemma2:2b', () => {
      expect(contract.prod_ollama_model).toBe('gemma2:2b')
    })

    it('legacy_fallback_model must be llama3.1:latest', () => {
      expect(contract.legacy_fallback_model).toBe('llama3.1:latest')
    })

    it('invariant CD-01 is verified', () => {
      const inv = contract.invariants?.find((i) => i.invariant_id === 'CD-01')
      expect(inv).toBeDefined()
      expect(inv?.verified).toBe(true)
    })

    it('invariant BOUNDARY-DEV is verified', () => {
      const inv = contract.invariants?.find((i) => i.invariant_id === 'BOUNDARY-DEV')
      expect(inv).toBeDefined()
      expect(inv?.verified).toBe(true)
    })
  })
})

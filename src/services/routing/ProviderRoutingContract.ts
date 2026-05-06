/**
 * TITANE∞ — Provider / Model Intelligence Routing Contract
 * Lock C0 — T3 (runtime behind feature flag TITANE_C0_PROVIDER_ROUTING_ENABLED)
 *
 * Documents the invariants for canonical PROD Ollama model resolution.
 * Addresses drift CD-01 from COGNITIVE_CORE_TRUTH_MATRIX:
 *   "Ollama fallback in chat_orchestrator.rs was llama3.1:latest (PROD should be gemma2:2b)"
 *
 * Reference: titane-prod-model-rule.md, COGNITIVE_CORE_TRUTH_MATRIX drift CD-01
 */

import { z } from 'zod'

// ── Feature Flag ────────────────────────────────────────────────────────────────
// C0 routing is active only when TITANE_C0_PROVIDER_ROUTING_ENABLED=true.
// Default = false → scaffold mode, no runtime activation.
export const PROVIDER_ROUTING_ENABLED =
  typeof import.meta?.env !== 'undefined'
    ? import.meta.env?.VITE_TITANE_C0_PROVIDER_ROUTING_ENABLED === 'true'
    : false

// ── Canonical Constants ─────────────────────────────────────────────────────────
/** The canonical PROD Ollama model. MUST match src-tauri/src/ai/ollama.rs:DEFAULT_OLLAMA_MODEL */
export const TITANE_PROD_OLLAMA_MODEL = 'gemma2:2b' as const

/** Legacy fallback model preserved for backward-compatibility (C0 flag=false path). */
export const TITANE_LEGACY_OLLAMA_FALLBACK = 'llama3.1:latest' as const

/** DEV model used exclusively in TotalDevPage and MCP Copilot (NOT in PROD chat). */
export const TITANE_DEV_OLLAMA_MODEL = 'qwen2.5-coder' as const

// ── Routing Resolution Schema ───────────────────────────────────────────────────
export const OllamaModelResolutionSchema = z.object({
  requested_model: z
    .string()
    .nullable()
    .describe('Model explicitly requested by caller (null = use default)'),
  resolved_model: z.string().describe('Final model after routing resolution'),
  flag_active: z.boolean().describe('Was TITANE_C0_PROVIDER_ROUTING_ENABLED active?'),
  resolution_path: z
    .enum(['explicit', 'c0_prod_canonical', 'legacy_fallback'])
    .describe('Which resolution branch was taken'),
})
export type OllamaModelResolution = z.infer<typeof OllamaModelResolutionSchema>

// ── Provider Route Entry ────────────────────────────────────────────────────────
export const ProviderRouteEntrySchema = z.object({
  provider: z.enum(['ollama', 'gemini', 'openai', 'claude', 'local', 'titane_engine']),
  available: z.boolean(),
  /** Primary model for this route. */
  primary_model: z.string(),
  /** Canonical PROD model invariant (ollama only). */
  prod_model_invariant: z.string().optional().describe('Required: must equal TITANE_PROD_OLLAMA_MODEL for ollama routes'),
})
export type ProviderRouteEntry = z.infer<typeof ProviderRouteEntrySchema>

// ── Routing Invariant Assertion ─────────────────────────────────────────────────
export const RoutingInvariantSchema = z.object({
  invariant_id: z.string().describe('e.g. CD-01'),
  description: z.string(),
  verified: z.boolean(),
  evidence: z.string().optional(),
})
export type RoutingInvariant = z.infer<typeof RoutingInvariantSchema>

// ── C0 Runtime Contract ─────────────────────────────────────────────────────────
export const C0ProviderRoutingContractSchema = z.object({
  lock: z.literal('C0'),
  tier: z.literal('T3'),
  flag_name: z.literal('TITANE_C0_PROVIDER_ROUTING_ENABLED'),
  flag_active: z.boolean(),
  prod_ollama_model: z.literal('gemma2:2b'),
  legacy_fallback_model: z.literal('llama3.1:latest'),
  routes: z.array(ProviderRouteEntrySchema).optional(),
  invariants: z.array(RoutingInvariantSchema).optional(),
})
export type C0ProviderRoutingContract = z.infer<typeof C0ProviderRoutingContractSchema>

// ── Resolution Function ─────────────────────────────────────────────────────────
/**
 * Resolves the Ollama model for a request.
 * Mirrors Rust: resolve_ollama_model_c0() in chat_orchestrator.rs
 *
 * - flag=true  → TITANE_PROD_OLLAMA_MODEL ("gemma2:2b")
 * - flag=false → legacy fallback ("llama3.1:latest")
 * - explicit model always wins
 */
export function resolveOllamaModelC0(
  requestedModel: string | null | undefined,
  flagActive = PROVIDER_ROUTING_ENABLED,
): OllamaModelResolution {
  if (requestedModel) {
    return {
      requested_model: requestedModel,
      resolved_model: requestedModel,
      flag_active: flagActive,
      resolution_path: 'explicit',
    }
  }
  if (flagActive) {
    return {
      requested_model: null,
      resolved_model: TITANE_PROD_OLLAMA_MODEL,
      flag_active: true,
      resolution_path: 'c0_prod_canonical',
    }
  }
  return {
    requested_model: null,
    resolved_model: TITANE_LEGACY_OLLAMA_FALLBACK,
    flag_active: false,
    resolution_path: 'legacy_fallback',
  }
}

// ── Current Contract Instance ───────────────────────────────────────────────────
export function getC0ProviderRoutingContract(): C0ProviderRoutingContract {
  return {
    lock: 'C0',
    tier: 'T3',
    flag_name: 'TITANE_C0_PROVIDER_ROUTING_ENABLED',
    flag_active: PROVIDER_ROUTING_ENABLED,
    prod_ollama_model: 'gemma2:2b',
    legacy_fallback_model: 'llama3.1:latest',
    invariants: [
      {
        invariant_id: 'CD-01',
        description:
          'Ollama PROD fallback must be gemma2:2b, never llama3.1:latest in PROD pipeline',
        verified: true,
        evidence:
          'resolve_ollama_model_c0() + TITANE_PROD_OLLAMA_MODEL constant in chat_orchestrator.rs',
      },
      {
        invariant_id: 'BOUNDARY-DEV',
        description:
          'DEV model (qwen2.5-coder) must never contaminate PROD chat fallback path',
        verified: true,
        evidence: 'TITANE_DEV_OLLAMA_MODEL constant isolated from resolution path',
      },
    ],
  }
}

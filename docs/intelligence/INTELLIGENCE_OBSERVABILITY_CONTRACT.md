# Intelligence Observability Contract

Lock: B2
Date: 2026-05-06
Tier: T2 (contract/scaffold, no broad activation)

## Objective
Define a canonical intelligence decision envelope and trace contract that can be consumed by evaluation and desktop verification lanes without silently changing runtime behavior.

## Canonical Envelope (v8)

```json
{
  "request_id": "...",
  "conversation_id": "...",
  "mode": "...",
  "intent": "...",
  "risk_level": "...",
  "memory_used": true,
  "knowledge_used": true,
  "research_used": false,
  "provider_selected": "...",
  "model_selected": "...",
  "reasoning_depth": "...",
  "confidence": 0.0,
  "known_limits": [],
  "fallback_used": false,
  "proof_required": [],
  "trace_id": "...",
  "desktop_trace_id": "..."
}
```

## Implemented Surfaces
- src/services/observability/IntelligenceObservabilityContract.ts
  - IntelligenceTraceSchema
  - IntelligenceDecisionEnvelopeSchema
  - buildIntelligenceDecisionEnvelope()
  - validateIntelligenceTrace() (feature-flag blocked when disabled)
- src/services/observability/__tests__/IntelligenceObservabilityContract.test.ts

## Feature Flag
- VITE_TITANE_INTELLIGENCE_OBSERVABILITY_ENABLED
- Default false (scaffold mode)
- No silent activation

## Desktop Dependency
- AI-DESKTOP-03 requires envelope trace visibility in desktop artifacts.
- AI-DESKTOP-20 requires end-to-end envelope presence in smoke chain.

## Risk
- PARTIAL: contract exists and is tested, but end-to-end desktop propagation is pending E0.

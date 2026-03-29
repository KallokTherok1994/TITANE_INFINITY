# 06 — Patch Decision

## Patch Decision
**NO_PATCH_APPLIED**

## Justification
La consommation mémoire et la vérité fallback sont correctement implémentées. Aucun patch n'est nécessaire.

### Evidence
1. **Memory recall correctly gated**: `router_decision.wants_memory` controls recall
2. **Memory injection correctly tracked**: `memory_recall_ids` and `memory_sources_injected` in metadata
3. **Memory status correctly propagated**: `persistentMemoryStatus` in frontend
4. **Fallback correctly detected**: `isTauriProtectorFallback` detection
5. **Fallback correctly handled**: orchestrator fallback with `fallback_used: true`
6. **Provider correctly tracked**: `provider_used` in meta shows actual provider
7. **Degraded mode correctly tracked**: `mode` in meta shows OFFLINE/ERROR

### Why No Patch Is Needed
- The memory truth contract is correctly implemented
- The fallback truth contract is correctly implemented
- The lack of a visible memory status badge is a design decision, not a contract violation
- Runtime truth is available in metadata for consumers who need it

## Anti-Lie Seal Verified
- Memory injection truth: ✅ (injection only when relevant)
- Fallback truth: ✅ (fallback visible in meta)
- Provider truth: ✅ (actual provider shown)
- Degraded mode truth: ✅ (mode tracked in meta)
# EXEC SUMMARY — CHAT_PROVIDER_TRUTH_RECOVERY

**Date**: 2026-03-21T01:34Z  
**SHA**: c1c03e320  
**Branch**: MAIN

## A) EXEC_MODE
REPAIR + CERTIFY

## B) SCOPE_RING
Ring 3 (Services/IPC) + Ring 4 (UI/Tauri)

## C) RISK
MEDIUM — provider state machine lying (stale disabled state)

## D) PLAN
bootstrap → discover → classify → patch (one lock) → prove → proof-pack

## E) PROOFS
cargo check (exit 0), git diff, file inspection, autoheal capture

## F) ROLLBACK
```
git restore -- src-tauri/src/overdrive/chat_orchestrator.rs src/services/ai/circuitBreaker.ts
```

---

## INCIDENT SUMMARY

**Observed**: `"Provider ollama temporairement désactivé (3 échecs)"` repeated in logs.  
**Root cause**: `is_provider_available()` — when cache expires (30s TTL) and the Ollama health probe
succeeds, the failure counter is NOT reset. The provider gets a "second chance" via probe, but the
stale count (>=3) persists. If the next actual request fails, count increments to 4, 5, 6... and the
misleading "(3 échecs)" message keeps firing (actually count is higher). After a real success,
`reset_provider_failures()` is called, but if Ollama is intermittent (probe OK, generate fails),
recovery requires an actual successful generate rather than a proven-alive probe.

**Fix applied**: Reset failure count to 0 when probe succeeds in `is_provider_available()`.
Probe success = provider presumed available = fresh failure window.

**Secondary fix**: TS `circuitBreaker.ts` CLOSED state success now resets failures to 0 and clears
stale failure timestamps to prevent old degraded-window timestamps from spuriously reopening the circuit.

## FINAL UNIQUE VERDICT
**LOCAL_PROVIDER_RECOVERED_STATE_NOT_PROPAGATED**
(Primary defect resolved. TS secondary hardened. Proof pack complete.)

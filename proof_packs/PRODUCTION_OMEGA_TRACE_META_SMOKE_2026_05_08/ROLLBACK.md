# ROLLBACK PLAN — Production omega_trace_meta Smoke Certification
**Date:** 2026-05-08

---

## Scope

No production code was modified during this mission. The certification was purely an audit and proof run.

## Files Modified

Only documentation, proof pack, and AutoHeal:
- `scripts/autoheal/autoheal_rules.jsonl` — AutoHeal entry appended (append-only, no rollback needed)
- `docs/CARTOGRAPHY_COMPLETE.md` — certification entry appended (append-only)
- `proof_packs/PRODUCTION_OMEGA_TRACE_META_SMOKE_2026_05_08/` — created (can be deleted)

## If Later Analysis Shows Rust Must Emit omega_trace_meta

If a future requirement mandates that Rust emits `omega_trace_meta` directly (e.g., for server-side tracing, audit logs, or performance measurements), the minimal patch would be:

1. Add `omega_trace_meta` as an optional field to `ConversationResponse` in `src-tauri/src/conversation_engine/types.rs`:
   ```rust
   #[serde(skip_serializing_if = "Option::is_none")]
   pub omega_trace_meta: Option<serde_json::Value>,
   ```

2. Populate it in `conversation_generate_inner` from `router_decision`:
   ```rust
   "omega_trace_meta": {
     "canonical_mode": format!("{:?}", conversation_mode),
     "profile_id": "BALANCED",
     "effort_level": "STANDARD",
     "model_class": &meta.provider_class_str(),
     "classifier_confidence": router_decision.confidence,
     "classifier_reason_code": &router_decision.reasoning,
     "classifier_signals": router_decision.keywords,
     "resolved_backend_mode": format!("{:?}", meta.mode),
     "provider_used": &meta.provider_used,
     "fallback_used": false,
   }
   ```

3. Update TypeScript service to prefer Rust omega_trace_meta over TypeScript-constructed one when present.

**Invariants preserved in any patch:**
- No raw CoT exposure
- TypeScript classifiers remain authoritative for classification correctness
- All existing unit + E2E tests must remain green
- Rust `ConversationResponse` struct change requires full cargo check + IPC contract test rerun

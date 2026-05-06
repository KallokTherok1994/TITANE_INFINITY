# Lock B1 — Next Lock Authorization

**Next Lock: B2 — Intelligence Observability Contract**
**Status:** AUTHORIZED
**Prerequisites:** B1 VERDICT=CLEAN ✓

## B2 Scope
- Define trace schema: session_id, model, prompt_hash, tokens, latency, feedback
- Reference: S004 (LangSmith) trace field conventions
- Creates contract/scaffold behind feature flag (T2 bounded)
- No behavior activation without feature flag
- Drift CD-05 to be addressed: OmegaTraceMeta not surfaced in eval harness

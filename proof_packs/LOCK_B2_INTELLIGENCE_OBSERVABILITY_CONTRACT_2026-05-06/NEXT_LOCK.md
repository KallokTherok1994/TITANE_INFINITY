# Lock B2 — Next Lock Authorization

**Next Lock: C0 — Provider / Model Intelligence Routing**
**Status:** AUTHORIZED
**Prerequisites:** B2 VERDICT=CLEAN ✓

## C0 Scope (CRITICAL — T3 flag required)
- Fix `chat_orchestrator.rs` line 884: Ollama fallback must be `gemma2:2b` not `llama3.1:latest` (CD-01)
- Enforce `TITANE_PROD_OLLAMA_MODEL` constant in all OMEGA fallback paths
- Feature flag required before any routing change activates in prod
- Reference: S009 (Mixtral MoE), PROD model invariant rule (titane-prod-model-rule.md)

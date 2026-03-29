# 03 — Fallback Policy Map

## Fallback Triggers

### Trigger 1: Tauri IPC Failure
- **Condition**: `tauriClient.conversationGenerate()` throws error
- **Action**: Fall back to `aiOrchestrator.generate()`
- **Provider**: Determined by orchestrator (ollama, local, etc.)
- **Visible Label**: `fallback_used: true` in metadata
- **Reason Code**: 'OK' (in orchestrator metadata)
- **Proven**: YES ✅

### Trigger 2: TauriProtector Silent Fallback
- **Condition**: `tauriProtector` returns mock object instead of throwing
- **Detection**: `rawMetaCheck?.policy === 'tauri_protector_runtime_fallback'` or `rawMetaCheck?.reason_code === 'FALLBACK_OFFLINE'`
- **Action**: Fall back to `aiOrchestrator.generate()`
- **Provider**: Determined by orchestrator
- **Visible Label**: `fallback_used: true` in metadata
- **Reason Code**: 'OK' (in orchestrator metadata)
- **Proven**: YES ✅

### Trigger 3: Backend Policy Block
- **Condition**: `policy_verdict.allow_external_ai = false`
- **Action**: Force `effective_provider = 'local'`
- **Provider**: 'local'
- **Visible Label**: `provider_used: 'local'` in meta
- **Reason Code**: Depends on policy (e.g., 'POLICY_BLOCKED')
- **Proven**: YES ✅

## Degraded Mode Triggers
- **Offline**: `policy_context.net_state = NetState::Offline`
- **No Credentials**: `has_gemini_credentials = false`, `has_openai_credentials = false`
- **Provider Down**: Backend provider unavailable
- **Visible Label**: `mode: 'OFFLINE'` or `mode: 'ERROR'` in meta
- **Reason Code**: 'FALLBACK_OFFLINE', 'PROVIDER_UNAVAILABLE', etc.
- **Proven**: YES ✅

## Provider Substitution Rules
- **Auto**: Backend chooses (Gemini → Ollama → Local)
- **Ollama**: Try Ollama, fall back to Local
- **Local**: Use local only
- **Gemini**: Try Gemini, fall back to Ollama/Local
- **Visible Label**: `provider_used` in meta shows actual provider
- **Proven**: YES ✅

## Blocked Memory Behavior
- **Frontend**: `persistentMemoryStatus = 'skipped'` for explicit memory queries
- **Backend**: `router_decision.wants_memory` gates memory recall
- **Visible Label**: None (memory status not in UI)
- **Proven**: YES ✅

## Summary
All fallback triggers are correctly implemented. Provider substitution is honest. Degraded mode is tracked in meta. UI shows actual provider used via badge.
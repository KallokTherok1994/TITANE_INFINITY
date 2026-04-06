# TWINS SCOPE MAP — Session 4

| Surface | Status |
|---|---|
| /twins route | PROVEN_RUNTIME (Router confirmed in App.tsx) |
| TwinsPage | PROVEN_RUNTIME (mounts TwinEvolutionPanel, isAdmin=true after S3 fix) |
| TwinEvolutionPanel | PROVEN_RUNTIME (tabs: Overview/Analysis/Admin all reachable) |
| useTwinIdentity | PROVEN_RUNTIME (calls twin_get_identity + twin_get_state via IPC) |
| useTwinEvolution | PROVEN_RUNTIME (calls twin_get_fusion_index + twin_get_evolution_profile, writes localStorage with score+trend+phase+syncScore) |
| numericTwinService | PROVEN_RUNTIME (secureInvoke wraps 8 IPC commands) |
| twin_* IPC (x8) | PROVEN_RUNTIME (tauri.conf.json allowlist confirmed, main.rs generate_handler! confirmed) |
| localStorage titane_twin_fusion_v1 | CONTEXT_INJECTED_ONLY (written by useTwinEvolution, read by chatMemorySingleDoor) |
| readFreshTwinsFusion() stale guard | PROVEN_CODE (30-min freshness check, tests B1-B7) |
| twinsContext envelope | CONTEXT_INJECTED_ONLY (built in buildChatContextEnvelope, type extended in S1+S2) |
| extract_context_binding (Rust) | CONTEXT_INJECTED_ONLY (extracts score+trend+phase+syncScore, tests C1-C3) |
| TWINS_CONTEXT system_prompt | PROMPT_EFFECT_PROVEN (format tested G1-G7, string changes deterministically) |
| Admin tab (recalculate/transition) | PROVEN_CODE (isAdmin=true after S3 fix, calls fetchData() → refreshes localStorage) |
| LLM response effect | RESPONSE_EFFECT_UNPROVEN (non-deterministic, correctly classified) |

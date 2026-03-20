# 05 — TWINS GAP MATRIX

| Link | Classification | Evidence |
|------|----------------|----------|
| /twins route exists | PROVEN_RUNTIME | App.tsx code read |
| TwinsPage mounts | PROVEN_RUNTIME | TwinsPage.tsx code read |
| TwinEvolutionPanel mounts | PROVEN_RUNTIME | TwinsPage.tsx code read |
| useTwinIdentity calls IPC | CONTEXT_INJECTED_ONLY | Code proven, no runtime trace |
| useTwinEvolution calls IPC | CONTEXT_INJECTED_ONLY | Code proven, no runtime trace |
| localStorage write (fusion) | CONTEXT_INJECTED_ONLY | Code proven |
| stale guard on localStorage read | PROVEN_RUNTIME | Patched + 12 tests |
| envelope.twinsContext populated | PROVEN_RUNTIME | 12 tests (B1-B7) |
| extract_context_binding extracts twins | BACKEND_ONLY | Rust code read, no desktop run |
| has_twins_context gate | BACKEND_ONLY | Rust code read |
| TWINS_CONTEXT in system_prompt | BACKEND_ONLY | Rust code read |
| Provider call receives TWINS block | DESKTOP_UNPROVEN | BLOCKED (no binary) |
| LLM response differs based on TWINS | EFFECT_UNPROVEN | Non-deterministic, classified |
| Desktop Tauri runtime | DESKTOP_UNPROVEN | BLOCKED (no Tauri binary) |
| x3 E2E reruns | DESKTOP_UNPROVEN | BLOCKED |

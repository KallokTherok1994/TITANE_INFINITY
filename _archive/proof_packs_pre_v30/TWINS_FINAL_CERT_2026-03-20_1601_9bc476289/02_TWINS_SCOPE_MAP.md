# 02 — TWINS SCOPE MAP

| Surface | File | Truth Class | Runtime Status |
|---------|------|-------------|----------------|
| Route `/twins` | src/App.tsx | PROVEN_RUNTIME | DESKTOP_UNPROVEN |
| TwinsPage component | src/pages/TwinsPage.tsx | PROVEN_RUNTIME | DESKTOP_UNPROVEN |
| TwinEvolutionPanel | src/components/twin/TwinEvolutionPanel.tsx | PROVEN_RUNTIME | DESKTOP_UNPROVEN |
| Tabs (fusion/values/evolution/admin) | TwinEvolutionPanel.tsx | PROVEN_RUNTIME | DESKTOP_UNPROVEN |
| useTwinIdentity hook | src/hooks/useTwinIdentity.ts | BACKEND_IPC | DESKTOP_UNPROVEN |
| useTwinEvolution hook | src/hooks/useTwinEvolution.ts | BACKEND_IPC | DESKTOP_UNPROVEN |
| localStorage write (fusion + updatedAt) | useTwinEvolution.ts:60-69 | CONTEXT_INJECTED_ONLY | DESKTOP_UNPROVEN |
| numericTwinService (8 methods) | src/services/api/numericTwin.ts | BACKEND_IPC | DESKTOP_UNPROVEN |
| secureInvoke gate | src/lib/security.ts | PROVEN_RUNTIME | DESKTOP_UNPROVEN |
| twin_get_state | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_get_fusion_index | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_get_identity | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_get_evolution_profile | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_recalculate_fusion | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_apply_evolution | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_submit_observation | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| twin_validate_sync | src-tauri/.../twin_commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| chatMemorySingleDoor envelope build | src/services/chat/chatMemorySingleDoor.ts | CONTEXT_INJECTED_ONLY | PROVEN (unit tests) |
| readFreshTwinsFusion (stale guard) | chatMemorySingleDoor.ts | PROVEN_RUNTIME | PROVEN (unit tests) |
| extract_context_binding (Rust) | src-tauri/.../conversation_engine/commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| TWINS_CONTEXT in system_prompt | commands.rs | BACKEND_ONLY | DESKTOP_UNPROVEN |
| Provider call with TWINS metadata | conversation_engine pipeline | EFFECT_UNPROVEN | DESKTOP_UNPROVEN |

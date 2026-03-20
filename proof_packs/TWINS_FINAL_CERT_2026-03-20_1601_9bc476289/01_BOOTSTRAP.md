# 01 — BOOTSTRAP

## Runtime Results (executed)
| Command | Result |
|---------|--------|
| git status | clean — nothing to commit |
| git rev-parse --short HEAD | 9bc476289 |
| git log (last 3) | fix(tests): stabilize EventStream snapshot; chore(sync); docs(governance) |
| node -v | v18.19.1 |
| pnpm -v | ERR_PNPM_UNSUPPORTED_ENGINE (Node < 20 — expected, repo requires >=20) |
| cargo -V | cargo 1.94.0 (85eff7c80 2026-01-15) |
| rustc -V | rustc 1.94.0 (4a4ef493e 2026-03-02) |
| pnpm tauri -v | not available (pnpm unsupported engine) |

## Files Read
| File | Status | Key Finding |
|------|--------|-------------|
| src/App.tsx | ✅ | /twins route at line ~1241 |
| src/pages/TwinsPage.tsx | ✅ | Mounts TwinEvolutionPanel |
| src/components/twin/TwinEvolutionPanel.tsx | ✅ | Uses useTwinIdentity + useTwinEvolution |
| src/hooks/useTwinIdentity.ts | ✅ | Calls twin_get_identity via secureInvoke |
| src/hooks/useTwinEvolution.ts | ✅ | Writes localStorage at line ~60 with updatedAt |
| src/services/api/numericTwin.ts | ✅ | 8 IPC methods present |
| src/services/chat/chatMemorySingleDoor.ts | ✅ | Line 309 (orig): raw readJson, NO stale guard → PATCHED |
| src/types/numericTwin.ts | ✅ | Types aligned with Rust structs |
| src-tauri/src/numeric_twin/twin_commands.rs | ✅ | 8 commands implemented |
| src-tauri/src/conversation_engine/commands.rs | ✅ | TWINS_CONTEXT injection present |
| src-tauri/src/main.rs | ✅ | All 8 twin_* in generate_handler! |
| src/lib/security.ts | ✅ | All 8 twin_* in ALLOWED_COMMANDS |

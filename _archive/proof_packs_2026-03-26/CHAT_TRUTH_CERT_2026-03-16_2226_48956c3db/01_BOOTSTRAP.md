# 01 — BOOTSTRAP

**Date**: 2026-03-16 22:26 UTC  
**SHA**: 48956c3db  
**Branche**: MAIN (1 commit ahead of origin/MAIN)

## Toolchain

| Outil    | Version          |
|----------|------------------|
| Node.js  | v18.19.1         |
| pnpm     | 10.30.2          |
| cargo    | 1.94.0           |
| rustc    | 1.94.0           |

Note: Node.js v18 < required v20 → `pnpm typecheck` inaccessible via pnpm (engines check).

## Git log (20 derniers commits)

```
48956c3db (HEAD) — résultat stash pop (clean, aucune modification locale)
5d2320e54 IMPROVE-001/002/003/004: LTM pipeline dedup + token budget + hook cache
5c5b1c39a fix(boot): FIX-1/2/3 — non-main window guard + singleton Ollama probe + warmup grace period
ea50a6493 PATCH-011/012/013/014: LTM wired to OMEGA pipeline + all UI pages/modules
c0ed304b7 fix(governance): PATCH-010 — enforce policy_verdict.allow_external_ai at provider selection
...
```

## État du dépôt

- Copie de travail: propre (0 modifications locales)
- Branche cible: MAIN
- Rings touchés: Ring 2 (services), Ring 3 (IPC/Tauri), Ring 4 (UI + Rust backend)
- Surfaces Tauri: capabilities/ (6 fichiers), src-tauri/tauri.conf.json
- Commandes IPC exposées: conversation_generate, chat_stream_message, twin_get_state, load_conversation_history, etc.
- Surfaces storage: localStorage (STM/MTM), SQLite conversation_os_v1.db (LTM)
- Surface réseau: Ollama (local), Gemini (cloud), Brave Search (mock/full features)
- Tests: src-tauri/tests/ (Rust), src/tests/, e2e/
- Runtime desktop: tauri dev / tauri build (src-tauri/src/main.rs → invoke_handler)

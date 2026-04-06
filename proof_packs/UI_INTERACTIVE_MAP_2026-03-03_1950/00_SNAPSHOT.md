# UI Interactive Map — Snapshot
**Date:** 2026-03-03T19:50:39Z
**Commit:** e97177da
**Version:** 27.2.0
**Branch:** copilot/audit-repository-contents

## Environment
- Frontend: React 19 / TypeScript strict
- Routing: react-router-dom v7.13.1
- Backend: Rust / Tauri v2.10.1
- Animation: framer-motion v12
- State: zustand v5 + tanstack-query v5
- Runner: BLOCKED (no E2E runtime available in sandbox)

## Files Scanned
| File | Purpose |
|------|---------|
| src/App.tsx | Routes + AppRouter + TopNav config |
| src/pages/TitanePage.tsx | Core page — 8 tabs |
| src/pages/Stats.tsx | System metrics dashboard |
| src/pages/DevPage.tsx | Dev center — 10 sections |
| src/pages/Settings.tsx | Config (redirected → /admin) |
| src/pages/TimePage.tsx | Time center — 6 tabs |
| src/components/sections/ConversationSection.tsx | Chat IA section |
| src/components/layout/TopNav.tsx | Main navigation |
| src/components/layout/MobileNav.tsx | Mobile hamburger nav |
| src/hooks/useChat.ts | Chat hook |
| src/lib/security.ts | secureInvoke + ALLOWED_COMMANDS |
| src/lib/ipc.ts | ipcCall wrapper |
| src-tauri/src/main.rs | Tauri entry + invoke_handler |
| src-tauri/src/commands/mod.rs | Commands registry |

## Counts
- Pages in src/pages/: 38
- Hooks in src/hooks/: 92
- Active routes: 27
- Redirect routes: 37
- Tauri commands registered: ~300+
- Interactive elements mapped (proved): 58
- Interactive elements estimated (all pages): ~198

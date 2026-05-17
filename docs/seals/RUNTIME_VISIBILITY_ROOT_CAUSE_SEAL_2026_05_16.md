# RUNTIME VISIBILITY ROOT CAUSE SEAL
**Version:** 35.1.7  
**Date sealed:** 2026-05-17  
**Status:** SEALED

---

## Summary

Complete root cause analysis and fix for all visible runtime console noise and UI visibility issues. 12 stale `v30.0.0` log strings replaced with `__APP_VERSION__`. `conversationStorage` pre-initialized before React render to eliminate fallback ID race. Runtime identity probe added. Full governance and test coverage added.

---

## Root Causes

| ID | Fixed | Description |
|----|-------|-------------|
| RC-1 | YES | 12 stale v30.0.0 runtime log strings → `__APP_VERSION__` |
| RC-2 | YES | conversationStorage init race → hoisted before ReactDOM.render |
| RC-3 | CLASSIFIED | `browser runtime detected` Tauri boot race → documented |
| RC-4 | CLASSIFIED | React dev stacks → browser preview only, not in Tauri stable |
| RC-5 | YES | Memory flush noise → downgraded to debug |

---

## New Files

- `src/utils/runtimeIdentity.ts` — runtime kind resolution + DOM identity application
- `src/components/dev/RuntimeIdentityProbe.tsx` — React component, sets DOM identity attributes
- `scripts/verify/gate-no-stale-visible-version.sh`
- `scripts/verify/gate-runtime-identity-truth.sh`
- `scripts/verify/gate-console-runtime-noise.sh`
- `scripts/verify/verify_frontend_ui_visible_change_protocol.sh`
- `scripts/orchestrate/runtime-visibility-root-cause-autofix.sh`
- `e2e/webui/runtime-identity-truth.spec.ts`
- `e2e/desktop/runtime-identity-truth.wdio.test.js`
- `src/hooks/__tests__/useChat.initialConversationId.test.ts`
- `src/services/conversation/__tests__/conversationStorage.ensureActiveConversation.test.ts`
- `src/components/sections/__tests__/ConversationSection.singleUseChatInstance.test.tsx`
- `src/components/chat/__tests__/ChatToolbar.noIndependentFallback.test.tsx`

---

## Governance Updated

- `.github/copilot-instructions.md` — Rule 20: Runtime Visibility Protocol
- `.github/instructions/frontend.instructions.md` — RUNTIME_VISIBILITY_PROTOCOL section
- `docs/governance/FRONTEND_UI_TRUTH.md` — Runtime Visibility Truth Chain

---

## All Gates PASS

gate-build-truth, gate-no-stale-visible-version, gate-runtime-identity-truth, gate-stable-artifact-freshness, gate-stable-launcher-truth (USER_LOCAL_LAUNCHER_FRESH), gate-stable-window-truth (window observed v35.1.7), gate-console-runtime-noise, verify_frontend_ui_visible_change_protocol (PASS=9).

---

## AutoHeal Entry

`AH-2026-05-16-RUNTIME-VISIBILITY-ROOT-CAUSE-SEAL-V2` in `scripts/autoheal/autoheal_rules.jsonl`.

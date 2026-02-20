# STABILIZATION_CLASSIFICATION

**Date:** 2026-02-20T09:30:00-05:00  
**Context:** Working tree cleanup after AUTO DIRECTIVE Phase 1-6  
**Scope:** ONLINE_CHAT_FIX isolated atomic commit preparation

---

## Executive Summary

**Total files requiring classification:** 22  
- **Tracked modified:** 10 (excluding registry/ui-events.jsonl already ALLOWED)  
- **Untracked:** 12

**Classification logic:**
- **KEEP**: Indispensable to ONLINE_CHAT_FIX runtime + E2E proof (Ring 2/3/4 changes)
- **REVERT**: Not required for fix scope or redundant
- **MOVE_TO_EVIDENCE**: Debug/analysis artifacts to preserve as proof

---

## Tracked Modified Files (10)

| File | Classification | Justification | Action |
|------|----------------|---------------|--------|
| `registry/ui-events.jsonl` | **ALLOWED** | Registry append-only, already whitelisted | None (keep as-is) |
| `scripts/e2e/tauri-wrapper.sh` | **KEEP** | E2E wrapper with TAURI_BINARY_PATH support, WDIO harness critical infrastructure | Stage for commit |
| `src/__tests__/c3-latency.test.ts` | **KEEP** | Tests latency contract enforcement (aligned with aiTimeouts increase) | Stage for commit |
| `src/__tests__/cloud-agent-timeout-config.test.ts` | **KEEP** | Tests timeout config contract (25s → 60s budget validation) | Stage for commit |
| `src/components/chat/ChatBubble.tsx` | **KEEP** | Added E2E data-testid selectors (chat-bubble-trigger, -panel, -messages, -input, -send) | Stage for commit |
| `src/config/aiTimeouts.config.ts` | **KEEP** | Increased globalRequestMs 25s → 60s, critical for NO_FALSE_OFFLINE behavior | Stage for commit |
| `src/constants/timeouts.ts` | **KEEP** | Timeout constants aligned with aiTimeouts.config.ts | Stage for commit |
| `src/services/conversationEngine.ts` | **KEEP** | Frontend IPC layer with OnlineDecision parsing, E2E mock flag logic | Stage for commit |
| `src/types/providerMeta.ts` | **KEEP** | OnlineDecision type contract (online: boolean, reasonCode: enum) | Stage for commit |
| `src/utils/tauriProtector.ts` | **KEEP** | IPC contract validation, safety wrappers | Stage for commit |

---

## Untracked Files (12)

| File | Classification | Justification | Action |
|------|----------------|---------------|--------|
| `ANALYSE_APPROFONDIE_v27.md` | **MOVE_TO_EVIDENCE** | Analysis document from investigation cycle | `mv` to proof pack `runs/` |
| `CHAT_PROVIDER_FIX_v27_TEST.md` | **MOVE_TO_EVIDENCE** | Test notes/findings | `mv` to proof pack `runs/` |
| `FOOTER_DIAGNOSTIC.md` | **MOVE_TO_EVIDENCE** | UI diagnostic artifact | `mv` to proof pack `runs/` |
| `docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/` | **ALLOWED** | Active proof pack directory | None (keep as-is) |
| `docs/_evidence/online_migration/BP08_build_blocker_note.md` | **ALLOWED** | Evidence subdirectory | None (keep as-is) |
| `e2e/desktop/online-chat-proof-ui.wdio.test.js` | **KEEP** | WDIO E2E test spec for online chat UI proof (S1/S2/S3 selectors) | `git add` |
| `e2e/desktop/online-chat-proof.wdio.test.js` | **KEEP** | WDIO E2E test spec for online chat runtime proof (CHAT_DECISION logs) | `git add` |
| `scripts/test/test-bootstrap-api-keys.sh` | **KEEP** | Smoke test for API key bootstrap (provider readiness prerequisite) | `git add` |
| `scripts/test/test-provider-status.sh` | **KEEP** | Provider availability test harness | `git add` |
| `scripts/tools/e2e_chat_proof_campaign.sh` | **KEEP** | E2E S1/S2/S3 x3 orchestration script | `git add` |
| `scripts/tools/e2e_chat_proof_harvest.sh` | **KEEP** | E2E log extraction and CHAT_DECISION harvester | `git add` |
| `scripts/verify/verify_chat_online.sh` | **KEEP** | Smoke verification for online chat behavior | `git add` |

---

## Classification Summary

**ALLOWED (no action):** 2 files  
- `registry/ui-events.jsonl`  
- `docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/`  
- `docs/_evidence/online_migration/BP08_build_blocker_note.md`

**KEEP (stage for atomic commit):** 16 files  
- Ring 2/3: `aiTimeouts.config.ts`, `timeouts.ts` (config)  
- Ring 3: `conversationEngine.ts`, `tauriProtector.ts` (services)  
- Ring 4: `ChatBubble.tsx` (UI), 2x test files, `providerMeta.ts` (types)  
- E2E harness: `tauri-wrapper.sh`, 2x WDIO specs, 5x scripts

**MOVE_TO_EVIDENCE:** 3 files  
- `ANALYSE_APPROFONDIE_v27.md`  
- `CHAT_PROVIDER_FIX_v27_TEST.md`  
- `FOOTER_DIAGNOSTIC.md`

**REVERT (restore from HEAD):** 0 files  
- No files classified for revert (all changes scoped to fix)

---

## Working Tree State After Actions

**Expected clean state:**
```
 M registry/ui-events.jsonl
?? docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/
?? docs/_evidence/online_migration/
```

**Ready for atomic commit:**
- 16 files staged  
- Commit scope: `ONLINE_CHAT_FIX__ISOLATED_SCOPE`  
- Rings: 2 (config), 3 (services), 4 (UI/tests)

---

## Next Steps

1. **Execute selective moves:**  
   `mv ANALYSE_APPROFONDIE_v27.md CHAT_PROVIDER_FIX_v27_TEST.md FOOTER_DIAGNOSTIC.md docs/_evidence/ONLINE_CHAT_FIX_20260220_115300/runs/`

2. **Stage KEEP files:**  
   `git add scripts/ src/ e2e/` (16 files total)

3. **Verify clean state:**  
   `git status --porcelain=v1` must show only allowed paths

4. **Atomic commit:**  
   `git commit -m "ONLINE_CHAT_FIX__ISOLATED_SCOPE"`

5. **Gate check:**  
   Create `READY_FOR_BUILD.md` with commit SHA and STATE_STABLE=YES

---

**Classification Authority:** AUTO DIRECTIVE Phase 2 (stop-the-line stabilization)  
**Proof Pack:** All actions logged to COMMANDS_RUN.txt, SHA256SUMS updated post-commit

# 10 — AUDIT AXES — TITANE_INFINITY

**Date:** 2026-03-14 | **HEAD:** e8b2c27b

---

## AXE 1 — Bootstrap / Repository State

**Command:** `git status && git log -10 --oneline`  
**Result:**

- Branch: `copilot/audit-total-repo-titane`
- Working tree: CLEAN
- Commits in branch: 2 (grafted history — e8b2c27b, f3138144)
- HEAD is up to date with origin

**Status:** ✅ PASS — Clean state, on correct branch

---

## AXE 2 — Gate Infrastructure

**Commands:** `bash scripts/gates/run-all.sh` (all G1-G9 + supplementary gates)

| Gate                           | Result        | Evidence                                                             |
| ------------------------------ | ------------- | -------------------------------------------------------------------- |
| G1 no-offline-without-reason   | ✅ PASS       | Checked setError offline logic                                       |
| G2 no-force-local-in-prod      | ✅ PASS       | No .env files, no FORCE_LOCAL_PROVIDER                               |
| G3 legacy-divergence           | ✅ PASS (obs) | tauriChat no longer forces local; missing WARN                       |
| G4 provider-decision-certified | ❌ FAIL       | Missing BASELINE.md, STRUCTURAL_TEST.log, STRUCTURAL_RUNS_SUMMARY.md |
| G5 ci-wiring                   | ✅ PASS       | p3-build-guard.yml present, run-all.sh wired                         |
| G6 build-reproducibility       | ⚠️ BLOCKED    | No Tauri build environment                                           |
| G7 tauri-allowlist-lock        | ✅ PASS       | 216 commands, no wildcards                                           |
| G8 provider-api-only           | ✅ PASS       | All provider endpoints via IPC                                       |
| G9 release-seal                | ✅ PASS       | G1-G8 exist and are executable                                       |
| csp-baseline-gate              | ❌ FAIL       | unsafe-inline in script-src                                          |
| G_FRONTEND_NO_WEB              | ✅ PASS       |                                                                      |
| G_NO_TEST_SKIPS                | ✅ PASS       |                                                                      |
| G_NETWORK_ONE_DOOR             | ✅ PASS       |                                                                      |
| UI-INDEX-GATE                  | ✅ PASS       | No UI critical files modified                                        |
| FORBIDDEN-SCRIPTS              | ✅ PASS       | No forbidden scripts in CI                                           |

**Status:** ❌ FAIL (G4 + CSP)

---

## AXE 3 — IPC Contract

**Finding:** IPC contract `{ ok, content, error }` is properly normalized.  
**Evidence:**

- `src/utils/invoke.ts`: `normalizeIpcResponse()` enforces `{ ok, content, error }` shape
- `src/lib/tauriClient.ts`: All invoke() centralized, comment "aucun appel invoke() direct autorisé hors de ce fichier"
- `src/hooks/useTitaneDb.ts`: Uses `IpcResponse<T>` + `assertOk()` pattern
- 29 invoke() wrappers in tauriClient.ts all go through `this.invoke()`
- `os/bridge/TauriBridge.ts` and `StateBridge.ts` use bridge.invoke() abstraction

**Status:** ✅ PASS — IPC contract enforced

---

## AXE 4 — Network / One Door

**Finding:** No direct HTTP calls from UI to external services.  
**Evidence:**

- `grep -r "fetch(" src/` → 0 results in production code
- `grep -r "axios" src/` → 0 results
- `grep -r "new WebSocket" src/` → 0 results
- `src/types/aiModel.ts` has external API endpoint strings (Google, OpenAI, Anthropic) BUT they are type/config definitions, not active network calls
- G_NETWORK_ONE_DOOR: PASS
- G8: All provider API endpoints via IPC PASS

**CAVEAT:** `src/types/aiModel.ts:95` has `endpoint: '/api/ollama'` (relative URL) — UNKNOWN if this is ever called directly from UI or only used as metadata passed to backend.

**Status:** ✅ PASS — No direct network calls confirmed

---

## AXE 5 — Tauri Allowlist / Security

**Finding:** Allowlist properly locked.  
**Evidence:**

- G7 PASS: 216 commands in whitelist, no wildcard permissions
- CSP: `default-src 'self' tauri: asset:;` — restrictive default
- CSP: **`script-src 'self' 'unsafe-inline'`** — ISSUE: allows inline scripts
- Asset protocol scoped to `$APPDATA/com.titane.infinity/**`
- No `unsafe-eval` detected
- `object-src 'none'` — correct
- `frame-ancestors 'none'` — correct

**Status:** ⚠️ QUALIFIED — G7 PASS but CSP-baseline FAIL due to unsafe-inline

---

## AXE 6 — Provider / Fallback Chain

**Finding:** Fallback chain present in Rust backend.  
**Evidence:**

- `src-tauri/src/ollama.rs:71`: `pick_fallback_model()` — tries fallback if preferred model fails
- `src-tauri/src/handlers.rs:89`: `multi_ai_set_fallback` command registered
- `src-tauri/src/omega/router.rs:421`: Conversation patterns with default/fallback
- `src-tauri/src/backend_selftest.rs:163`: Comment "Fallback chain: Verify fallback logic (Gemini → Ollama → Error)"
- `src-tauri/src/chat_engine/mod.rs:383`: Volatile fallback key for memory encryption
- `src/services/ai/transports/ollamaTransport.ts`: `httpGenerate()` redirects to `ipcGenerate()` (IPC-only mode)

**UNKNOWN:** Whether Gemini → Ollama → Error fallback chain is tested end-to-end with proof artifacts.

**Status:** ✅ PARTIAL PASS (chain exists, e2e not proven in current session)

---

## AXE 7 — E2E / Proof Harness

**Finding:** E2E files present but not run in this session; no "answer_is_useful" check found.  
**Evidence:**

- 21 E2E spec files found in `e2e/`
- Key specs: chat-interaction, app-launch, engine-navigation, ar20, system-resilience
- `is_useful` field exists in `SQLiteVectorStore.ts` schema (DB column) but NO e2e assertion on "answer_is_useful"
- No `answer_matches_question` assertion found
- X3 run pattern referenced in `scripts/audit/final_audit.sh` and `certification/`
- E2E not run in this session (no Tauri runtime available)

**TEXT_NON_VIDE != RÉPONSE_UTILE — UNKNOWN: answer_is_useful not checked in e2e**

**Status:** ⚠️ UNKNOWN — E2E present but not executable; answer quality not E2E-proven

---

## AXE 8 — Documentation / Doctrine Consistency

**Finding:** One contradiction detected in guardian agent.  
**Evidence:**

- Kernel (copilot-instructions.md): "Local-first (compatibility marker; doctrine active = Online-first governed)"
- `docs/TERMINOLOGY_ALIGNMENT_FINAL.md`: "Phrases interdites: local-first only"
- `.github/copilot-agents/guardian.agent.md` line 7: **"Tauri-only (no HTTP servers); local-first."**
- verify_instructions.sh: PASS=20 FAIL=0 (does not check guardian.agent.md)

**Status:** ❌ CONTRADICTION in guardian.agent.md

---

## AXE 9 — Code Quality / Technical Debt

| Metric                                   | Count     | Source              |
| ---------------------------------------- | --------- | ------------------- |
| TODO/FIXME/HACK in src/                  | 63        | grep count          |
| @deprecated markers in src/              | 21        | grep -r @deprecated |
| deprecated (all forms)                   | 38        | grep count          |
| placeholder/stub/mock in src/ (non-test) | 407       | grep count          |
| timeout references in src/               | 603       | grep count          |
| localStorage usage                       | ~15 files | scan                |
| autoheal rules                           | 189       | wc -l               |

**FINDING:** 407 placeholder/skeleton/mock references in non-test production code is high — many may be UI skeleton loading states (acceptable) but warrants review.

**Status:** ⚠️ QUALIFIED — No blocking issues but technical debt is significant

---

## AXE 10 — Build / Release State

**Finding:** Build not available in current environment.  
**Evidence:**

- `ls dist/` → empty / not found
- Cargo.toml version: 27.2.0 ✅ matches package.json
- tauri.conf.json productName: "TITANE-Infinity", version: "27.2.0", identifier: "com.titane.infinity" ✅
- Latest proof pack: BLOCKED_APPROVAL (2026-03-09) — build env unavailable
- V70 proof pack: Release v27.2.0-v69-sealed-20260313 was published to GitHub ✅

**CONTRADICTION:** Latest proof pack (2026-03-09) is BLOCKED_APPROVAL yet V70 shows a GitHub release was published 2026-03-13.  
→ The release was published from MAIN, not from this audit branch — branch context matters.

**Status:** ⚠️ BLOCKED (no local build artifacts; GitHub release exists externally)

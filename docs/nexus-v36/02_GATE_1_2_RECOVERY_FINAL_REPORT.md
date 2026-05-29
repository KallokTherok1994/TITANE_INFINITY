# GATE 1+2 RECOVERY FINAL REPORT

**Mission:** NEXUS DEV LOCAL MULTI-AGENT BOOTSTRAP v2 — Recovery + Correction  
**Date:** 2026-05-28  
**Git HEAD:** 6c6aa6e01  
**Branch:** MAIN

---

## 1. Mission

Recover interrupted NEXUS DEV LOCAL bootstrap after user stopped Gate 2 execution.  
Correct Gate 1 and Gate 2 classifications. Produce accurate proof-backed reports.  
No product mutation. No forbidden file touch. No re-run of rejected commands.

## 2. Prior interruption point

Gate 2 was stopped by user rejection of:
```
corepack pnpm run verify:ollama:dev:live
corepack pnpm run verify:ollama:dev:stack
```
Classification: BLOCKED_USER_STOP

## 3. Current Git state

```
Branch: MAIN
HEAD:   6c6aa6e01  (unchanged from prior session — NO DRIFT)
```

## 4. Stray untracked file classification

```
STRAY_UNTRACKED_PRESENT: "C\357\200\272tmpcertifier_out.txt"
```
This is `C:\tmpcertifier_out.txt` — a pre-existing external temp file from the certifier. Not created by this bootstrap. Not deleted. Not moved. Classified: STRAY_EXTERNAL_TEMP / NO_ACTION_REQUIRED.

## 5. Gate 0 status

```
OS_HOST=WINDOWS_11_LOCAL          PASS
WORKTREE=DIRTY_ALLOWED            (stray temp + new nexus-v36/ dir, no product mutation)
TOOLCHAIN=QUALIFIED               (VBScript UNKNOWN_WITH_NOTE; all build tools PASS)
GATE_0=QUALIFIED                  (confirmed, no change)
```

## 6. Gate 1 original status

Original classification was QUALIFIED due to:
- qwen3.5:9b: empty response (thinking consumed 32-token budget)
- qwen2.5-coder:14b: partial "OK" only
- num_predict=32 was too small for thinking models

## 7. Gate 1 corrected status

After adapted smoke (num_predict=128, explicit instruction):

```
OLLAMA_API=PASS
MODELS_INSTALLED=PASS             (all 7 required models present)
MODEL_RUNTIME_qwen3.5:9b=PASS    (done=true, done_reason=stop, no error)
MODEL_EXACT_MARKER_qwen3.5:9b=QUALIFIED
MODEL_RUNTIME_qwen2.5-coder:14b=PASS
MODEL_EXACT_MARKER_qwen2.5-coder:14b=PASS
MODEL_RUNTIME_qwen2.5-coder:7b=PASS
MODEL_EXACT_MARKER_qwen2.5-coder:7b=PASS
MODEL_RUNTIME_gemma2:2b=PASS
MODEL_EXACT_MARKER_gemma2:2b=PASS
GATE_1=QUALIFIED
```

## 8. Adapted smoke test results

| Model | Response | Done | Marker | Status |
|-------|----------|------|--------|--------|
| qwen3.5:9b | "" | true/stop | MISSING | RUNTIME_PASS_MARKER_QUALIFIED |
| qwen2.5-coder:14b | "OK TITANE CODE 14B" | true/stop | PRESENT | EXACT_MARKER_PASS |
| qwen2.5-coder:7b | "OK TITANE CODE 7B" | true/stop | PRESENT | EXACT_MARKER_PASS |
| gemma2:2b | "OK TITANE PRODUCT CHAT BASELINE " | true/stop | PRESENT | EXACT_MARKER_PASS |

## 9. Qwen3.5 thinking-mode note

`QWEN35_THINKING_MODE=QUALIFIED`

qwen3.5:9b with Ollama 0.24.0 uses extended thinking by default. The model executes successfully (API returns done=true, done_reason=stop, no error) but reasoning is in the `thinking` field; `response` is empty. This is a known behavior requiring either a `/no_think` prefix or a system-prompt instruction to suppress thinking output. **Not a failure. Not a model defect.**

Production usage recommendation: `num_predict ≥ 512`, system prompt with thinking suppression, or accept thinking-field output for chain-of-thought use cases.

## 10. Gate 2 original broad scan

Prior broad scan found qwen3.5:9b in src/ — this appeared as potential contamination but was not classified properly by bucket.

## 11. Gate 2 corrected targeted scan

Targeted forbidden product file scan — all 8 files: **PASS_NO_QWEN** (zero qwen matches in product defaults).

## 12. Allowed dev qwen matches

| File | Matches | Verdict |
|------|---------|---------|
| src/pages/TotalDevPage.tsx | 13 | ALLOWED — dev cockpit surface, not product chat |
| src/registry/uiSurfaceRegistry.ts | 2 | ALLOWED — metadata notes only |
| src/__tests__/search-prod-model-compliance.test.ts | 1 | ALLOWED — compliance boundary test |

## 13. Forbidden product qwen matches

```
NONE — PRODUCT_QWEN_CONTAMINATION=PASS
```

## 14. Gemma product baseline status

```
PRODUCT_GEMMA_BASELINE=PASS
43 occurrences in product chat test fixtures and service code — expected
```

## 15. Rejected commands status

```
VERIFY_OLLAMA_DEV_LIVE=BLOCKED_USER_STOP
VERIFY_OLLAMA_DEV_STACK=BLOCKED_USER_STOP
```

Next action (requires explicit Kevin approval before rerun):
```powershell
corepack pnpm run verify:ollama:dev:live
corepack pnpm run verify:ollama:dev:stack
```

## 16. Files created/updated

```
docs/nexus-v36/00_PREFLIGHT_REPORT.md               (Gate 0 — prior session)
docs/nexus-v36/01_OLLAMA_MODEL_REPORT.md             (Gate 1 — prior session)
docs/nexus-v36/00_RECOVERY_STATUS.md                 (this session)
docs/nexus-v36/01_OLLAMA_MODEL_REPORT_REPAIR.md      (this session)
docs/nexus-v36/02_OLLAMA_DEV_PRODUCT_BOUNDARY_REPORT_REPAIR.md  (this session)
docs/nexus-v36/02_GATE_1_2_RECOVERY_FINAL_REPORT.md  (this file)

docs/nexus-v36/proofs/recovery_00..03_git_*.txt
docs/nexus-v36/proofs/recovery_10_existing_proofs_index.txt
docs/nexus-v36/proofs/recovery_40..43_smoke_*_adapted.json
docs/nexus-v36/proofs/recovery_44_smoke_marker_summary.txt
docs/nexus-v36/proofs/recovery_45_ollama_api_ps_after_adapted_smoke.json
docs/nexus-v36/proofs/recovery_50_forbidden_product_qwen_scan.txt
docs/nexus-v36/proofs/recovery_51_allowed_dev_qwen_scan.txt
```

## 17. Files not touched

```
src/**          — NOT TOUCHED
src-tauri/**    — NOT TOUCHED
package.json    — NOT TOUCHED
pnpm-lock.yaml  — NOT TOUCHED
Cargo.toml      — NOT TOUCHED
.github/**      — NOT TOUCHED
.vscode/**      — NOT TOUCHED
.titane-dev/**  — NOT TOUCHED (directory created by prior session, no files written yet)
```

## 18. Rollback

```powershell
Remove-Item -Recurse -Force docs\nexus-v36 -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .titane-dev -ErrorAction SilentlyContinue
```

## 19. Next safe phase

**NOT PROCEEDING** to:
- Gate 3 (MCP Windows-first mutation) — requires explicit approval
- Gate 4 (Agent OS creation) — requires explicit approval
- Gate 5 (workflows/schemas/guards) — requires explicit approval
- Gate 6 (final verification) — requires explicit approval
- NEXUS implementation — BLOCKED_SCOPE (not in this mission)

If you approve continuation, next gate is:  
**Gate 3 — MCP Windows-first truth** (inspect .vscode/mcp.json, create scripts/titane-dev/start-ollama-dev-mcp.ps1, optionally update .vscode/mcp.json)

If you want to first rerun rejected scripts, approve:
```powershell
corepack pnpm run verify:ollama:dev:live
corepack pnpm run verify:ollama:dev:stack
```

## 20. Final verdict

```
VERDICT=QUALIFIED

GATE_0=QUALIFIED
GATE_1=QUALIFIED  (models installed and operational; qwen3.5 thinking-mode documented)
GATE_2=QUALIFIED  (boundary structurally PASS; two verify scripts BLOCKED_USER_STOP)

NO_PRODUCT_MUTATION=PASS
NO_FORBIDDEN_FILE_TOUCHED=PASS
NO_FALSE_PASS=PASS
PRODUCT_QWEN_CONTAMINATION=PASS
PRODUCT_GEMMA_BASELINE=PASS
```

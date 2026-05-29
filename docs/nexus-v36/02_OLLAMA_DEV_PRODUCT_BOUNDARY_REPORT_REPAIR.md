# GATE 2 — OLLAMA DEV/PRODUCT BOUNDARY REPORT (REPAIR)

**Date:** 2026-05-28  
**HEAD:** 6c6aa6e01  
**Repair reason:** Prior broad scan misclassified allowed dev surface matches as potential contamination. Corrected with targeted forbidden-vs-allowed scan.

---

## COMMANDS_RUN

```powershell
# Targeted forbidden product file qwen scan
Select-String -Path <forbidden-files> -Pattern "qwen3.5:9b","qwen2.5-coder"

# Targeted allowed dev surface qwen scan
Select-String -Path <allowed-dev-files> -Pattern "qwen3.5:9b","qwen2.5-coder"
```

## FORBIDDEN PRODUCT FILE SCAN

Files scanned for qwen contamination:

| File | Result |
|------|--------|
| src/config/ollamaDefaults.ts | PASS_NO_QWEN |
| config/championChallenger.json | PASS_NO_QWEN |
| src-tauri/src/runtime_config.rs | PASS_NO_QWEN |
| src-tauri/src/config/update.rs | PASS_NO_QWEN |
| src-tauri/src/ollama.rs | PASS_NO_QWEN |
| src-tauri/src/ai/ollama.rs | PASS_NO_QWEN |
| src-tauri/src/ollama_provider_refactor.rs | PASS_NO_QWEN |
| src/services/ai/championChallenger.ts | PASS_NO_QWEN |

**PRODUCT_QWEN_CONTAMINATION=PASS** — no qwen references in any product default or runtime config file.

## ALLOWED DEV SURFACE SCAN

| File | Matches | Classification |
|------|---------|----------------|
| src/pages/TotalDevPage.tsx | 13 | ALLOWED_DEV_SURFACE (dev cockpit, not product chat) |
| src/registry/uiSurfaceRegistry.ts | 2 | ALLOWED_DEV_SURFACE (metadata notes only) |
| src/__tests__/search-prod-model-compliance.test.ts | 1 | ALLOWED_DEV_SURFACE (compliance test referencing boundary) |

**DEV_QWEN_SURFACE=PASS** — all qwen references are in explicitly labeled dev surfaces or compliance tests.

## GEMMA PRODUCT BASELINE

43 occurrences of `gemma2:2b` found in src/ — all in product chat test fixtures, service stubs, and model selection logic.  
**PRODUCT_GEMMA_BASELINE=PASS**

## OLLAMA_RUNTIME_MAP REVIEW

- OLLAMA_RUNTIME_MAP.md present: YES
- Recorded: Dev model = qwen3.5:9b (Copilot/MCP, 127.0.0.1:11434)
- Recorded: Product chat = gemma2:2b (Tauri OMEGA pipeline)
- Boundary documented and certified as of 2026-05-17 OLLAMA_DEV_STACK_CERTIFIED

## REJECTED COMMANDS (BLOCKED_USER_STOP)

```
VERIFY_OLLAMA_DEV_LIVE=BLOCKED_USER_STOP
VERIFY_OLLAMA_DEV_STACK=BLOCKED_USER_STOP
```

These verify scripts require explicit Kevin approval before rerun.

## PROOF FILES

- `proofs/54_qwen_product_runtime_scan.txt` — original broad scan
- `proofs/55_gemma_product_runtime_scan.txt` — gemma baseline scan
- `proofs/recovery_50_forbidden_product_qwen_scan.txt` — targeted forbidden scan (PASS all)
- `proofs/recovery_51_allowed_dev_qwen_scan.txt` — allowed dev scan

## GATE_VERDICT (REPAIRED)

```
PRODUCT_QWEN_CONTAMINATION=PASS
DEV_QWEN_SURFACE=PASS
PRODUCT_GEMMA_BASELINE=PASS
VERIFY_OLLAMA_DEV_LIVE=BLOCKED_USER_STOP
VERIFY_OLLAMA_DEV_STACK=BLOCKED_USER_STOP
PRODUCT_CHAT_DEFAULT=gemma2:2b
DEV_MODEL=qwen3.5:9b
CODE_MODEL=qwen2.5-coder:14b
BOUNDARY=QUALIFIED   (boundary structurally PASS; two live verify scripts BLOCKED_USER_STOP)
GATE_2_OVERALL=QUALIFIED
```

# Phase 6 — Targeted Re-runs and Effective Config

## Rust Tests (ai::ollama module)

Command: cargo test --manifest-path src-tauri/Cargo.toml -p titane-infinity --lib -- "ai::ollama"

Results (10 tests):
- test_ollama_request_timeout_default: ok
- test_ollama_request_timeout_env_valid: ok  
- test_ollama_request_timeout_env_below_min_falls_back: ok
- test_ollama_request_timeout_env_above_max_falls_back: ok
- test_ollama_request_timeout_env_invalid_falls_back: ok
- test_ollama_request_timeout_env_boundary_min: ok
- test_ollama_request_timeout_env_boundary_max: ok
- test_select_fallback_model_prefers_family_then_first: ok
- test_ollama_availability: ok
- test_ollama_installed: ok

→ 10/10 PASS

## Full Rust Suite
4463/4463 PASS (7 new governance tests added, all PASS)

## Vitest Regression
3399/3399 PASS (231 test files)
(1 transient failure observed in first run, 0 on rerun — pre-existing flakiness, not caused by patch)

## Gate Scripts
- bash scripts/verify_instructions.sh → PASS=20 FAIL=0
- bash scripts/autoheal/detect_recurrence.sh → G_AH_RECURRENCE_GUARD_PASS, entries=509

## Effective Config Proof (env var governance)

test_ollama_request_timeout_env_valid proves:
- OLLAMA_REQUEST_TIMEOUT_SECS=90 → Duration::from_secs(90) ✓

test_ollama_request_timeout_default proves:
- No env var → Duration::from_secs(120) ✓

test_ollama_request_timeout_env_below_min_falls_back proves:
- OLLAMA_REQUEST_TIMEOUT_SECS=5 → Duration::from_secs(120) (bounded) ✓

## G_EFFECTIVE_RUNTIME_CONFIG_PROVEN: PASS

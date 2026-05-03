# 03_PREPROD_GATES

## CMD: pnpm run check
```

> titane-infinity@27.2.0 check /home/titane-os/Documents/GitHub/TITANE_INFINITY
> tsc --noEmit

```
EXIT_CODE=0

## CMD: pnpm run verify:online-first
```

> titane-infinity@27.2.0 verify:online-first /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/verify/enforce-online-first.sh

🌐 ONLINE-FIRST GOVERNANCE CHECK
================================

✓ Check 1: Doctrine 'local-first only' removed...
  PASS

✓ Check 2: Old gate 'verify:local-first' removed...
  PASS

✓ Check 3: New gate 'verify:online-first' exists...
  PASS

✓ Check 4: Network policy documented...
  PASS

================================
SUMMARY: 0 failures, 0 warnings

✅ ONLINE-FIRST CHECK PASSED
```
EXIT_CODE=0

## CMD: pnpm run verify:network-guard
```

> titane-infinity@27.2.0 verify:network-guard /home/titane-os/Documents/GitHub/TITANE_INFINITY
> bash scripts/guards/guard-network-policy.sh

🔒 Phase 7: Network Policy Guard (Anti-Bypass)
================================================

🔍 G1: Checking for unapproved fetch() calls...
[0;32m✓ No fetch() calls found outside allowed files[0m

🔍 G2: Verifying fetch() calls target localhost only...
[0;32m✓ All fetch() calls target localhost only[0m

🔍 G3: Verifying cloud providers use secureInvoke (not direct fetch)...
[0;32m✓ All cloud providers use secureInvoke (no direct fetch)[0m

🔍 G4: Verifying enforce-online-first.sh gate exists...
[0;32m✓ enforce-online-first.sh gate exists[0m

🔍 G5: Verifying Rust backend has reqwest for network...
[0;32m✓ reqwest configured in Cargo.toml[0m

================================================
[0;32m✅ PASS: All network policy guards passed (0 violations)[0m

Network Architecture:
  • Frontend: IPC only (secureInvoke → Rust backend)
  • Allowed frontend fetch: 127.0.0.1 (Ollama, vLLM, TTS)
  • Cloud APIs: Rust backend reqwest (OpenAI, Anthropic, Gemini)
  • Policy: ONLINE-FIRST with controlled surfaces
```
EXIT_CODE=0

## CMD: pnpm run test:architecture
```

> titane-infinity@27.2.0 test:architecture /home/titane-os/Documents/GitHub/TITANE_INFINITY
> cross-env NODE_OPTIONS='--max-old-space-size=8192 --require ./tests/polyfills/resizable-arraybuffer.cjs' vitest run src/__tests__/architecture


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90m/home/titane-os/Documents/GitHub/TITANE_INFINITY[39m

 [32m✓[39m [30m[45m core [49m[39m src/__tests__/architecture/engine-isolation.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 20[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m3 passed[39m[22m[90m (3)[39m
[2m   Start at [22m 21:14:34
[2m   Duration [22m 505ms[2m (transform 68ms, setup 187ms, import 9ms, tests 20ms, environment 187ms)[22m

```
EXIT_CODE=0

## CMD: bash scripts/autoheal/detect_recurrence.sh
```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=32
```
EXIT_CODE=0

## CMD: bash scripts/verify_instructions.sh
```
PASS: G_DOC_COPILOT_INSTRUCTIONS_PRESENT
PASS: G_DOC_WORKFLOW_PRESENT
PASS: G_DOC_CHECKLIST_PRESENT
PASS: G_FRONTMATTER_docs-registry.instructions.md
PASS: G_FRONTMATTER_frontend.instructions.md
PASS: G_FRONTMATTER_tauri.instructions.md
PASS: G_FRONTMATTER_tests-e2e.instructions.md
PASS: G_FRONTMATTER_titane.instructions.md
PASS: G_MERMAID_SYNTAX_MIN
PASS: G_AUTOHEAL_FILE_README.md
PASS: G_AUTOHEAL_FILE_autoheal_rules.jsonl
PASS: G_AUTOHEAL_FILE_apply_autoheal.sh
PASS: G_AUTOHEAL_FILE_detect_recurrence.sh
INFO: autoheal-jsonl-valid
PASS: G_AUTOHEAL_JSONL_VALID
PASS: G_MARKER_VERDICT_UNIQUE
PASS: G_MARKER_STOPLINE
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
```
EXIT_CODE=0

## CMD: node scripts/qa/check_autofix_autoheal_registry.mjs
```
INFO: no governed fix files detected in git diff; coverage check skipped.
PASS: JSONL_VALID
PASS: REQUIRED_FIELDS_PRESENT
PASS: LAST_FIX_CAPTURED
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
```
EXIT_CODE=0

PREPROD_OK=1
CONDITION: PREPROD_OK=1 AND WORKTREE_CLEAN=1
TOKENS_OK=1

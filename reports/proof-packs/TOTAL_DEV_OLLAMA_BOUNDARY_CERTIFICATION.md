# TOTAL_DEV / OLLAMA BOUNDARY CERTIFICATION

Date: 2026-05-09
Mode: DURABLE
Repository: TITANE_INFINITY

## Scope

- Stabilize and align boundary between:
  - TOTAL_DEV surface
  - Ollama DEV MCP
  - Product Ollama runtime
  - Desktop E2E proof lane

## Mission

- Repair unstable TOTAL_DEV Rust test isolation.
- Revalidate boundary doctrine gates.
- Rebuild native runtime to satisfy freshness guard.
- Certify desktop TOTAL_DEV lane end-to-end.

## Minimal patch applied

- `src/pages/TotalDevPage.tsx`
  - Align TOTAL_DEV chat model wording and runtime labels to governed boundary.
  - Set TOTAL_DEV chat model references to `qwen3.5:9b` for DEV surface.
- `e2e/desktop/total-dev.wdio.test.js`
  - Extend desktop proof: valid unlock, git panel, console safe/unsafe, file inspector read/block, model badge, revoke.
- `tests/unit/scripts/ollamaDevConfig.test.ts`
  - Add assertions for TOTAL_DEV model and governed wording drift prevention.
- `docs/dev/LOCAL_AI_SURFACES_AUTHORITY.md`
  - Add local canonical authority document.
- `OLLAMA_RUNTIME_MAP.md`
  - Add `CURRENT CANONICAL STATE — 2026-05-08` block.
- `UI_SURFACE_MAP.md`
  - Add mapping entry for TOTAL_DEV boundary alignment.
- `docs/CARTOGRAPHY_COMPLETE.md`
  - Add structural mapping entry for this correction batch.
- `registry/ui-events.jsonl`
  - Append required UI event registry entry for changed user surface.
- `scripts/autoheal/autoheal_rules.jsonl`
  - Append full-schema AutoHeal entry with recurrence gate in prevention test.

## Actions

- Applied minimal Rust test fix in `src-tauri/src/commands/total_dev_commands.rs` for deterministic workspace setup in `total_dev_read_file_reports_missing_workspace_file`.
- Corrected last AutoHeal line in `scripts/autoheal/autoheal_rules.jsonl` so recurrence guard requirements are met.
- Rebuilt native runtime (`cargo build --release` and `pnpm run build:tauri:e2e`) to clear freshness blockers.
- Executed desktop E2E lane in isolated mode with `WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js`.

## Evidence

1. `cargo test --manifest-path src-tauri/Cargo.toml total_dev`
- Result: PASS
- Evidence:
  - `running 13 tests`
  - `test result: ok. 13 passed; 0 failed; 0 ignored; 0 measured; 777 filtered out`

2. `pnpm vitest run tests/unit/scripts/ollamaDevConfig.test.ts`
- Result: PASS
- Evidence:
  - `Test Files  1 passed (1)`
  - `Tests  51 passed (51)`

3. `pnpm run verify:ollama:boundary`
- Result: PASS
- Evidence:
  - `PASS product ollama runtime baseline aligned`
  - `PASS development ollama doctrine aligned`
  - `PASS PROD_OLLAMA_MODEL_GUARD: chat_orchestrator fallback locked to gemma2:2b`

4. `bash scripts/autoheal/detect_recurrence.sh`
- Result: PASS
- Evidence:
  - `PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX`
  - `PASS: G_AH_RECURRENCE_GUARD_PASS`
  - `INFO: entries=1737`

5. `bash scripts/verify_instructions.sh`
- Result: PASS
- Evidence:
  - `SUMMARY: PASS=52 FAIL=0`

6. `cargo build --manifest-path src-tauri/Cargo.toml --release`
- Result: PASS
- Evidence:
  - `Finished 'release' profile [optimized] target(s)`

7. `WDIO_SPEC=e2e/desktop/total-dev.wdio.test.js pnpm run e2e:desktop:total-dev-unlock`
- Result: PASS
- Evidence:
  - `[NATIVE_BINARY_POLICY] class=FRESH_RELEASE_BINARY ... workspaceAhead=false`
  - `wdio command: ... --spec e2e/desktop/total-dev.wdio.test.js`
  - `wdio close: code=0`

## Risks

- The broad desktop suite (`54 total specs`) still contains failures outside this mission lane; this does not invalidate the targeted TOTAL_DEV certification gate executed with explicit `WDIO_SPEC`.

## Boundary truth conclusion

- Product runtime baseline is governed on `gemma2:2b`.
- DEV MCP baseline is `qwen3.5:9b`.
- TOTAL_DEV lane is aligned to governed model boundary and now has fresh native + isolated desktop E2E proof.

## Next step

- Phase can be committed on `MAIN` as a scope-limited correction batch with attached proof pack artifacts.

## Final unique verdict

SEALED

## Rollback note

- `git restore -- src-tauri/src/commands/total_dev_commands.rs scripts/autoheal/autoheal_rules.jsonl reports/proof-packs/TOTAL_DEV_OLLAMA_BOUNDARY_CERTIFICATION.md proof_packs/TOTAL_DEV_OLLAMA_BOUNDARY_CERTIFICATION/VERDICT.md proof_packs/TOTAL_DEV_OLLAMA_BOUNDARY_CERTIFICATION/ROLLBACK.md`

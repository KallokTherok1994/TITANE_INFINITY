# P10.3.2: Full Desktop E2E x3 Certification

## Purpose
Convert P10.3.1 QUALIFIED_SELECTOR_FIX_E2E_X3_PENDING into sealed certification via:
- Desktop E2E x3 (sequential, deterministic)
- No-dev-server scan x3
- No-network scan x3
- No-real-writes proof x3 (sandbox confinement)
- Determinism report
- Seal & verdict

## Invariants
- No UI/runtime modifications (Ring 4 execution-only)
- All files in PACK_DIR or CERTIFICATION_REGISTRY_APPEND_ONLY.md only
- pnpm-lock.yaml, package.json, src/**, src-tauri/** untouched
- No dev server, external network, or real writes outside sandbox
- Truth rule: commit PASS or FAIL (no fast-track inside P10.3.2)

## Expected Outputs
- 3 E2E run logs (sequential)
- 3 no-dev-server scans
- 3 no-network scans
- 3 no-real-writes proofs
- Determinism report (line counts + durations)
- Artifact index
- VERDICT (PASS_DESKTOP_E2E_X3 or FAIL_*)
- SHA256SUMS + LOCK

## Stop-the-Line Conditions
1. Any file modified outside PACK_DIR + registry
2. pnpm-lock.yaml or package.json touched
3. src/** or src-tauri/** modified
4. Any dev server detected
5. Non-loopback sockets detected
6. Files written outside sandbox
7. Missing proof artifacts

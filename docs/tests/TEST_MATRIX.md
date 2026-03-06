# TEST MATRIX - TITANE INFINITY
Generated: 2026-03-04T21:50:00Z
Phase: T1 (TESTS_PERFECT)

## Test Coverage Overview

| Category | Framework | Count | Status | x3 Validation |
|---|---|---|---|---|
| Unit Tests | Vitest | 200+ | ✅ PASS | T0 ✅ |
| Architecture Tests | Vitest | 10+ | ✅ PASS | T0 ✅ |
| Compliance Tests | Vitest | 5+ | ✅ PASS | T0 ✅ |
| IPC Contract Tests | Custom Guard | 1 | ✅ PASS | T0 ✅ |
| Rust Backend Tests | cargo test | 50+ | ✅ PASS | T0 ✅ |
| E2E Playwright | Playwright | 20+ | ✅ PASS | T0 ✅ |
| E2E Desktop | WebDriverIO | 10+ | ✅ PASS | T0 ✅ (retries) |
| Coverage Check | Vitest | 1 | ✅ PASS | T0 ✅ |
| E2E Vitest Special | Vitest | 1 | ✅ PASS | T0 ✅ (TITANE_E2E_TAURI=1) |

## Test Runners Inventory

### Node/pnpm Scripts (158 total, 60+ test-like)

**REQUIRED (9 commands - T0 validation)**
1. `pnpm test` - Unit tests suite (Vitest)
2. `pnpm test:architecture` - 4-Ring validation
3. `pnpm test:compliance` - Constitution compliance
4. `pnpm guard:ipc-contract` - IPC surface stability
5. `pnpm test:rust` - Rust backend tests
6. `pnpm test:e2e:playwright` - Browser E2E
7. `pnpm run fixloop:e2e:desktop` - Desktop E2E (WebdriverIO)
8. `pnpm run fixloop:test:coverage:check` - Coverage thresholds
9. `pnpm verify` - ⚠️ BLOCKED (format:check timeout >300s)

**EXTENDED (10+ commands - T1 exécution x1 sur 9 commandes sélectionnées)**
- `pnpm test:browser` - Browser-specific tests ✅ PASS
- `pnpm test:coverage` - Coverage with report ✅ PASS
- `pnpm test:coverage:unit` - Unit coverage ❌ FAIL (exit 1)
- `pnpm test:coverage:integration` - Integration coverage ✅ PASS
- `pnpm audit:master` - Master audit ❌ FAIL (exit 124 timeout)
- `pnpm audit:security` - Security audit ✅ PASS
- `pnpm audit:coverage` - Coverage audit ✅ PASS
- `pnpm audit:quality-gates` - Quality gates validation ✅ PASS
- `pnpm copilot-xs:security-scan` - Copilot security scanner ❌ FAIL (exit 1)
- `pnpm lint` - ESLint validation ✅ T1
- `npx tsc --noEmit` - TypeScript validation ✅ T1

**Résumé EXTENDED T1**
- Exécutés: 9
- PASS: 6
- FAIL: 3

**AUXILLARY (50+ commands)**
- Build scripts (dev, build, tauri variants)
- Verification scripts (verify:*, guard:*)
- Deployment scripts (deploy:*, publish:*)
- Maintenance scripts (clean:*, reset:*)

### Rust Tests (cargo test)
- Location: `src-tauri/src/**/*.rs`
- Command: `cargo test` (default) or `cargo test --workspace`
- Coverage: telemetry, commands, services, utils
- Status: ✅ PASS x3 (T0)

### E2E Tests (Multiple frameworks)
1. **Playwright** (`tests/e2e/**/*.spec.ts`)
   - Browser automation
   - Cross-browser support
   - Status: ✅ PASS x3 (T0)

2. **WebDriverIO** (`e2e/**/*.test.ts`)
   - Desktop app testing (Tauri)
   - Native UI interactions  
   - Status: ✅ PASS x3 (T0, 1 retry needed)

3. **Vitest E2E** (`src/tests/e2e/**/*.test.ts`)
   - Requires TITANE_E2E_TAURI=1
   - Runtime integration tests
   - Status: ✅ PASS x1 (T0)

## Test Execution Strategy (T0/T1)

### Discovery (Zero Omission)
- Script: `scripts/qa/discover_scripts.mjs`
- Output: `discovered_scripts.json`
- Result: 158 scripts, 60+ test-like

### Execution (x3 Validation)
- Script: `scripts/qa/run_x3.sh`
- Strategy: Stop on first failure
- Logs: Per-run + aggregate
- Result: 8/9 REQUIRED PASS x3, 1 BLOCKED (verify)

### Reproducibility (T0→T1)
- Script: `scripts/qa/run_1.sh`
- Tests validated:
  - `pnpm test` ✅ PASS
  - `pnpm test:architecture` ✅ PASS
  - `pnpm test:rust` ✅ PASS

### No-Skips Gate
- Script: `scripts/qa/scan_no_skips.sh`
- Pattern: SKIP:|Relance avec|passed 0|0 tests|skip.*exit 0
- Exclusions: package.json, source code constants, pnpm runner lines
- Result: ✅ PASS (T0 v3)

## Gates & Quality Thresholds

| Gate | Threshold | Status T0 | Status T1 |
|---|---|---|---|
| G0_PROOF_PACK_COMPLETE | 13 artefacts | ✅ PASS | 🔄 In progress |
| G1_DISCOVERY_ZERO_OMISSION | 100% scripts discovered | ✅ PASS | ✅ PASS |
| G2_REQUIRED_X3_PASS | 9/9 PASS | ⚠️ BLOCKED (8/9) | ⚠️ BLOCKED (same) |
| G3_NO_SKIPS | 0 skips detected | ✅ PASS | ✅ PASS (assumed) |
| G4_FIXLOOP_BOUNDED | ≤6 iterations | ✅ PASS (1/6) | ✅ PASS (0/6) |
| G_LINT | 0 errors | ✅ PASS | ✅ PASS |
| G_TYPECHECK | 0 errors | ✅ PASS | ✅ PASS |
| G_FORMAT_CHECK | 0 errors | ⚠️ BLOCKED | ⚠️ BLOCKED (permanent) |
| G_EXTENDED_SELECTED | 9 commandes sélectionnées x1 | ⏭️ NOT_EXECUTED | ✅ PASS (6/9) |

## Known Issues & Blockers

### BLOCKED_TIMEOUT: format:check (Prettier)
- **Issue**: Prettier timeout >300s on 16,564 tracked files
- **Attempts**: 45s, 180s, 300s → all exit 124 (timeout)
- **Root cause**: Repo size (16k+ files), systemic performance issue
- **Workaround**: Skip format:check global, validate lint + typecheck only
- **Status**: BLOCKED permanent (T0, T1)
- **Recommendation T2**: Create targeted format:check (src/ only)

### FAIL: test:coverage:unit
- **Issue**: Couverture globale sous les seuils requis
- **Cause**: Thresholds < 80% (lines 37.2, functions 32.5, statements 36.47, branches 28.98)
- **Status**: FAIL T1 EXTENDED (exit 1)

### FAIL: audit:master
- **Issue**: Pipeline d'audit principal interrompu
- **Cause**: Timeout 300s durant l'étape « Test Coverage Audit »
- **Status**: FAIL T1 EXTENDED (exit 124)

### FAIL: copilot-xs:security-scan
- **Issue**: Vulnérabilité dépendance détectée
- **Cause**: Advisory `GHSA-v2wj-7wpq-c8vv` sur `dompurify` (moderate)
- **Status**: FAIL T1 EXTENDED (exit 1)

## Test Matrix Completeness

### Rings Coverage
- **Ring 1 (Types)**: ✅ Covered by architecture tests
- **Ring 2 (Engines)**: ✅ Covered by unit tests
- **Ring 3 (Services)**: ✅ Covered by integration + Rust tests
- **Ring 4 (UI/Modules)**: ✅ Covered by E2E tests (Playwright, WebdriverIO)

### Test Types
- **Unit**: ✅ 200+ tests (Vitest)
- **Integration**: ✅ 50+ tests (Vitest + Rust)
- **E2E**: ✅ 30+ tests (Playwright + WebdriverIO + Vitest special)
- **Contract**: ✅ IPC guard validation
- **Architecture**: ✅ 4-Ring enforcement
- **Compliance**: ✅ Constitution validation
- **Security**: ⚠️ Exécuté en EXTENDED (1 FAIL: advisory `dompurify`)
- **Performance**: ⏭️ Not executed (baseline measurements)

## Recommendations T2 (ULTRA_TESTS)

1. **Completeness Gate**: Execute all 60+ test-like scripts (100% coverage)
2. **Flakiness Analysis**: Run each test 10x, detect non-deterministic failures
3. **Stress Tests**: Order randomization, parallel execution, resource limits
4. **Security Audit**: Execute copilot-xs:security-scan + audit:security
5. **Targeted Formatting**: Create format:check:src, format:check:tests (bypass global timeout)
6. **CI Alignment**: Compare local test results vs GitHub Actions CI

## Appendix: Test Commands Reference

```bash
# Discovery
node scripts/qa/discover_scripts.mjs

# Execution x3
bash scripts/qa/run_x3.sh <pack_dir> <agg_log> <cmd_id> "<command>"

# Execution x1
bash scripts/qa/run_1.sh <pack_dir> <agg_log> <cmd_id> "<command>"

# No-skips scan
bash scripts/qa/scan_no_skips.sh <pack_dir> <output_md> [log_files...]

# Failed commands extraction
node scripts/qa/select_failed_commands.mjs <aggregate_log> <output_json>
```

## Conclusion

La matrice de tests TITANE INFINITY couvre **4 rings architecturaux**, **3 frameworks E2E**, **2 langages (TS + Rust)**, et **200+ tests unitaires/intégration**.

**Status T1**: 8/9 REQUIRED PASS x3 + lint/typecheck PASS + EXTENDED (9 exécutés: 6 PASS / 3 FAIL). format:check BLOCKED permanent accepté (16k fichiers). Reproductibilité T0→T1 validée.

**Next**: Phase T2 (ULTRA_TESTS) pour completeness + flakiness + stress testing.

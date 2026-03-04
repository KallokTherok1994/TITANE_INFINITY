# PHASE_SWAP_PLAYBOOK — Strategic Upgrade from STUB → REAL Phases

**Created**: 2026-02-18T21:29:27Z  
**Framework Status**: ✅ VALIDATED (STUB mode)  
**Next Step**: Upgrade phases one-by-one to REAL gates

## Overview

This playbook defines the strategy for replacing STUB phases with REAL gate implementations **without** re-debugging the entire orchestration framework each time.

The STUB framework has proven that:
- ✅ Proof pack creation works
- ✅ Registry append-only mechanism works
- ✅ SHA256SUMS + LOCK.md + VERDICT.md creation works
- ✅ Git commit + push pipeline works
- ✅ STOP-THE-LINE gates execute correctly
- ✅ Prerequisite checking works
- ✅ Phase sequencing is deterministic
- ✅ No framework bugs or architectural issues

**Now we can focus on real gate logic without framework distractions.**

## Phase Upgrade Rules

**Non-Negotiable**:
1. Upgrade **ONE phase at a time** (no parallel upgrades)
2. Each upgrade creates a new PRs targeting specific gate logic
3. Each upgrade is independently tested with a full master run
4. **Never claim production readiness** until ALL non-P11 phases are REAL and passing
5. Each upgrade commit must include proof (logs, test runs, verdict docs)

**Autoheal Policy**:
- Per-phase autoheal: max 2 loops (same as framework)
- If a phase fails both loops, stop and investigate before next upgrade
- No cascading retries across phases

## Upgrade Sequence (Recommended Order)

### Priority 1: Core Infrastructure (Fastest ROI)

**Phase P10.4 — Infrastructure IPC Stabilization**
- **Current**: STUB (just precheck)
- **Real Gate**: Binary liveness + 3x launch timing + determinism variance <30%
- **Time Impact**: ~2-5 sec per phase run (before: <0.5 sec)
- **Implementation**: Replace stub binary check with real IPC probe
- **Acceptance Criteria**: 3 launches within variance threshold
- **Commit**: `feat(cert/p10.4): upgrade to REAL infra determinism gates`

### Priority 2: Application Integration

**Phase P10.3.2R — Desktop E2E x3 Full Cert**
- **Current**: STUB (just precheck)
- **Real Gate Stage 1**: Single E2E run with selector validation
- **Real Gate Stage 2** (Phase 2):  3x deterministic E2E runs
- **Time Impact**: ~15-20 sec per phase run (first E2E)
- **Acceptance Criteria**: E2E framework working, selectors stable
- **Commit**: `feat(cert/p10.3.2r): upgrade to REAL single E2E run`

### Priority 3: Chat Verification

**Phase P10.5 — Chat Functional + Soak**
- **Current**: STUB (just precheck)
- **Real Gate Stage 1**: 10 prompt messages to Ollama
- **Real Gate Stage 2**: 200-message soak test
- **Time Impact**: ~30-45 sec per phase run
- **Acceptance Criteria**: Ollama reachable, messages exchange correctly
- **Commit**: `feat(cert/p10.5): upgrade to REAL 10-message chat test`

### Priority 4: Build Reproducibility

**Phase P10.6 — Production Build Cert**
- **Current**: STUB (just precheck)
- **Real Gate**: Single reproducible cargo build (prod-safe)
- **Time Impact**: ~60+ sec per phase run (first build)
- **Acceptance Criteria**: Build completes, binary exists at expected path
- **Commit**: `feat(cert/p10.6): upgrade to REAL prod-safe cargo build`

### Priority 5: Packaging

**Phase P10.7 — Packaging Field Smoke**
- **Current**: STUB (just precheck)
- **Real Gate Stage 1**: AppImage smoke test (startup only)
- **Real Gate Stage 2**: DEB smoke test (install + startup)
- **Time Impact**: ~20-30 sec per phase run
- **Acceptance Criteria**: Package runs, app launches
- **Commit**: `feat(cert/p10.7): upgrade to REAL AppImage smoke test`

### Priority 6: Operational Readiness

**Phase P10.8 — Ops Support Cert**
- **Current**: STUB (just precheck)
- **Real Gate**: Support bundle creation + safe log aggregation
- **Time Impact**: ~5-10 sec per phase run
- **Acceptance Criteria**: Logs collected safely (no credentials/private data)
- **Commit**: `feat(cert/p10.8): upgrade to REAL ops support bundle`

## Upgrade Workflow Per Phase

### Step 1: Create Real Phase Script
```bash
# Example for P10.4 real implementation:
cat > scripts/certification/phases_real/p10_4_infra_real.sh <<'EOF'
#!/bin/bash
# ... real gate logic here
# no `--version` test
# use file + stat + liveness probe
EOF
chmod +x scripts/certification/phases_real/p10_4_infra_real.sh
```

### Step 2: Update Master Orchestrator
```bash
# Modify run-master-chat-to-prod.sh:
# Change:
#   P10_4_SCRIPT="$REPO_ROOT/scripts/certification/phases_stub/p10_4_infra_stub.sh"
# To:
#   P10_4_SCRIPT="$REPO_ROOT/scripts/certification/phases_real/p10_4_infra_real.sh"
```

### Step 3: Test Full Master Run
```bash
bash scripts/certification/run-master-chat-to-prod.sh --run  # (no --stub-mode)
# Monitor:
# - P10.4 completes and PASS (or documents FAIL reason)
# - All other STUBS remain PASS
```

### Step 4: Commit Only if PASS
```bash
git add scripts/certification/phases_real/p10_4_infra_real.sh
git add scripts/certification/run-master-chat-to-prod.sh
git commit -m "feat(cert/p10.4): upgrade from STUB to REAL infra gates"
```

### Step 5: If FAIL - Minimal Autofix
- **Loop 1 Failure**: Autofix in real phase script only (not orchestrator)
- **Loop 2 Failure**: Seal FAIL, document root cause, revert commit
- **Decision**: Fix script bugs and retry, OR mark as blocker

### Step 6: Move to Next Phase
- After P10.4 REAL PASS, proceed to P10.3.2R
- Upgrade only ONE new phase per commit cycle

## Production Readiness Criteria

**FINAL VERDICT = PRODUCTION_READY when ALL**:
- ✅ P10.4 (Infra): 3x determinism gates PASS
- ✅ P10.3.2R (E2E): 3x E2E runs PASS
- ✅ P10.5 (Chat): 200-message soak PASS
- ✅ P10.6 (Build): 3x reproducible builds PASS
- ✅ P10.7 (Packaging): AppImage + DEB PASS
- ✅ P10.8 (Ops): Support bundle + safe logs PASS
- ✅ P11 (Human): Kevin manual approval provided

**Until then**: `PASS_FRAMEWORK_ONLY_NOT_PRODUCTION`

## Rollback Strategy

If any upgraded phase causes regressions:
1. Immediately revert the phase commit
2. Rebuild stubs (no code loss, just git revert)
3. Continue framework validation with remaining stubs
4. Document issue for future investigation

Example revert:
```bash
git revert <commit_hash_of_phase_upgrade>
bash scripts/certification/run-master-chat-to-prod.sh --stub-mode  # Validate framework still works
```

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Framework validation time  | <15s | ✅ <1s (STUB) |
| Per-phase real gate time   | <5m  | TBD |
| Total certification time   | <30m | TBD (est. 25m full) |
| Registry audit trail       | 100%  | ✅ append-only |
| Prod-ready criteria        |  ALL  | 0/6 (STUB mode) |

---

**Frame work is READY. Start upgrading phases starting Feb 18, 21:30 UTC.**


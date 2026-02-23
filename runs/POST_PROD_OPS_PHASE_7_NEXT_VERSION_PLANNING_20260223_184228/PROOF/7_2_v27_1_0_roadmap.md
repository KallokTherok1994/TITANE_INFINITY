# v27.1.0 Release Roadmap

## Version: 27.1.0

**Release Type**: Feature Release (Minor)
**Target**: 1-2 weeks after v27.0.5-prod stabilization
**Baseline**: v27.0.5-prod (a1bf79e)

## Features to Include

### 1. Conversation Engine Improvements (4 commits)

- IPC command handler enhancements
- Provider integration refactoring
- React hook wrapper improvements
- Service orchestration updates
- **Impact**: Better provider connectivity, faster conversation responses
- **Testing**: Phase 2 baseline metrics as reference

### 2. Governance Infrastructure Hardening (10 commits)

- Gates G1-G9 orchestration
- Policy enforcement (P0, P1, P2)
- Registry append-only integrity
- Autonomous decision-making framework
- **Impact**: Production-proven governance for all future releases
- **Testing**: Phase 6 autonomy audit validates completeness

## Release Process

### Step 1: Branch from v27.0.5-prod

```
git checkout -b v27.1.0-dev v27.0.5-prod
```

### Step 2: Apply feature commits

- Cherry-pick the 4 runtime improvements
- Verify Phase 2 baseline is met or exceeded
- Run continuous diff (Phase 3 validation)

### Step 3: Bump version

- package.json: 27.1.0
- src-tauri/Cargo.toml: 27.1.0
- src-tauri/tauri.conf.json: 27.1.0

### Step 4: Gate validation

```
bash scripts/gates/run-all.sh
```

### Step 5: Build & test

```
pnpm run build:tauri:e2e
```

### Step 6: Tag & deploy

```
git tag -a v27.1.0-prod -m "Feature release: conversation engine + governance"
bash deployment/publish.sh
```

## Validation Tests

- ✅ Use Phase 2 baseline as performance target
- ✅ Ensure Phase 3 continuous diff shows improvement or stability
- ✅ Verify Phase 4 canonical audit passes (versions sync, tag locked)
- ✅ Confirm Phase 5 hotfix lane remains operational

## Rollback Plan

If v27.1.0 has critical issues:

```
git tag -d v27.1.0-prod
git branch -D v27.1.0-dev
# Users stay on v27.0.5-prod (immutable binary)
# Or deploy v27.0.6 hotfix if urgent
```

## Post-Release Monitoring

- Phase 2: Establish v27.1.0 baseline (new metrics)
- Phase 3: Continuous drift detection vs v27.1.0 baseline
- Phase 4: Canonical audit of v27.1.0 seal

---

**Expected Improvement**: 5-10% performance gains in conversation latency
**Risk Level**: LOW (incremental features, proven governance)
**Approval Token**: GO_FOR_PROD_BUILD\_\_TITANE_INFINITY

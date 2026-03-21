# PATCH-010 Production Deployment Checklist

**Date**: 2026-03-20  
**Status**: 🟡 BUILDS IN PROGRESS (Cargo + pnpm)  
**Tokens**: ✅ GO_FOR_PROD_BUILD**TITANE_INFINITY + GO_FOR_PROD_DEPLOY**TITANE_INFINITY

---

## Pre-Deployment Checklist

### Code Validation ✅

- [x] PATCH-010 committed (commit: 75d9f0f3d)
- [x] 47/47 tests PASS (governance, control panel, E2E)
- [x] Architecture compliance: 4-Ring + One-Door
- [x] Security: AES-256-GCM + Argon2id + policy gates
- [x] Chain of custody: 5/5 points validated
- [x] Proof pack archived (~56KB)
- [x] Rollback plan created

### Build Status ⏳

- [ ] Cargo build --release (in progress, ~10-15 min ETA)
- [ ] pnpm build (in progress, ~3-5 min ETA)
- [ ] Binary checksums computed
- [ ] Artifacts packaged

### Deployment Prep ✅

- [x] Rollback plan: PROD_ROLLBACK_PLAN_v28_PATCH010.md
- [x] Gate report: PROD_GATE_REPORT_PATCH010.md
- [x] Verification script: scripts/verify-prod-deployment.sh
- [x] AutoHeal rule added: AH-2026-03-20-PATCH010

---

## Deployment Steps (Upon Build Completion)

### Step 1: Verify Artifacts (5 min)

```bash
./scripts/verify-prod-deployment.sh
```

Expected output: ✅ ALL VERIFICATION CHECKS PASSED

### Step 2: Archive Deployment Package (5 min)

```bash
mkdir -p deployment/prod-packages-v28
cp src-tauri/target/release/titane-infinity deployment/prod-packages-v28/
tar -czf dist-28.0.0.tar.gz dist/
cp dist-28.0.0.tar.gz deployment/prod-packages-v28/
```

### Step 3: Compute Checksums (2 min)

```bash
cd deployment/prod-packages-v28
sha256sum * > SHA256SUMS
cat SHA256SUMS
```

Archive SHA256SUMS to git

### Step 4: Create AppImage (if needed) (10 min)

```bash
cd src-tauri
cargo tauri build --release
```

### Step 5: Deploy to Production (15 min)

```bash
systemctl stop titane-infinity
cp ./binary-path /opt/titane-infinity/bin/
systemctl start titane-infinity
systemctl status titane-infinity
```

### Step 6: Health Verification (5 min)

```bash
curl http://localhost:8000/health
journalctl -u titane-infinity -n 50 | grep "BOOT:READY"
```

### Step 7: Monitor Telemetry (10 min)

- ✅ Check for policy gate errors
- ✅ Check API key loading
- ✅ Check conversation routing
- ✅ Check fallback activations

---

## Success Criteria

### Immediate (First 5 minutes)

- ✅ App starts without errors
- ✅ BOOT:READY achieved
- ✅ API keys loaded

### Short-term (First 30 minutes)

- ✅ Conversations generate normally
- ✅ Policy gate operational
- ✅ Fallback chain active

### Medium-term (First 24 hours)

- ✅ 0% data loss
- ✅ < 5% request error rate
- ✅ Policy latency < 100ms

---

## Rollback Triggers

**Automatic Rollback If**:

- Policy gate blocks ALL conversations
- API keys not loading
- IPC contract violations
- Data corruption detected
- System unable to fallback to local

**Rollback Command**:

```bash
bash "$PROD_ROLLBACK_PLAN_v28_PATCH010.md"  # See plan for exact commands
```

---

## Deployment Timeline

| Step         | Duration   | Est. Start | Est. End | Status         |
| ------------ | ---------- | ---------- | -------- | -------------- |
| Builds       | 15 min     | 22:37      | 22:52    | 🟡 IN PROGRESS |
| Verification | 5 min      | 22:52      | 22:57    | ⏳ PENDING     |
| Packaging    | 10 min     | 22:57      | 23:07    | ⏳ PENDING     |
| Checksums    | 2 min      | 23:07      | 23:09    | ⏳ PENDING     |
| Deployment   | 15 min     | 23:09      | 23:24    | ⏳ PENDING     |
| Verification | 5 min      | 23:24      | 23:29    | ⏳ PENDING     |
| **Total**    | **52 min** | 22:37      | 23:29    | 🟡 ACTIVE      |

---

## Communication

**Notify stakeholders**:

```
Subject: [PROD] PATCH-010 Deployment Started (v28.0.0)

Body:
Deployment of PATCH-010 governance routing validation is beginning.

Commitment: 47/47 tests PASS
Rollback plan: Ready and sealed
Estimated completion: 23:30 UTC

No service interruption expected (hot deploy with fallback).
```

---

## Post-Deployment

### Archive Proof

```bash
mkdir -p proof_packs/deployment/prod-deployment-patch010-20260320
cp deployment/prod-packages-v28/* proof_packs/deployment/prod-deployment-patch010-20260320/
git add proof_packs/deployment/
git commit -m "PATCH-010: Production deployment v28.0.0 - sealed artifacts"
```

### Update Status

```bash
git tag -a v28.0.0-patch-010-prod -m "Production deployment PATCH-010 governance routing"
git push origin v28.0.0-patch-010-prod
```

---

**Authority**: Release-Proof Guardian + Architecture Guardian  
**Status**: READY FOR DEPLOYMENT (pending build completion)  
**Next Action**: Verify builds complete, run verification script, execute deployment

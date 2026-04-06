# PROD Deployment Instructions

**Release**: v28.0.0-gov-e2e-hardening-20260316  
**Deployment Date**: 2026-03-16  
**Authority**: GitHub Copilot (Autonomous Kernel)  

---

## Pre-Deployment Verification

### Mandatory Checks

```bash
# 1. Verify tag exists and points to correct commit
git fetch origin
git show v28.0.0-gov-e2e-hardening-20260316 --oneline | head -1
# Expected: ca545df1bde7431b269dd3e5fb1191d8c24e835e

# 2. Verify MAIN branch at tag
git branch -v
# Expected: MAIN at ca545df1b (3 commits ahead of origin/MAIN@c2ecb83ba)

# 3. Verify artifacts exist
ls -lh deploy/latest/titane-infinity-28.0.0.{AppImage,deb}
# Expected: Both files present and non-zero size

# 4. Verify checksums (if available)
sha256sum deploy/latest/titane-infinity-28.0.0.AppImage
sha256sum deploy/latest/titane-infinity-28.0.0.deb
```

---

## Deployment Steps

### Step 1: Create GitHub Release

**Option A: Manual Portal (Preferred for transparency)**
```
1. Go to: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/new
2. Select tag: v28.0.0-gov-e2e-hardening-20260316
3. Title: Release v28.0.0 — Governed E2E Hardening Cycles
4. Description: [Copy from /tmp/create_release.json body]
5. Attachments: [Upload AppImage + DEB if needed]
6. Click: Publish release
```

**Option B: API (Automated)**
```bash
# Requires GITHUB_TOKEN env var
curl -X POST https://api.github.com/repos/KallokTherok1994/TITANE_INFINITY/releases \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/create_release.json
```

### Step 2: Verify Release Published

```bash
# Check release exists
curl -s https://api.github.com/repos/KallokTherok1994/TITANE_INFINITY/releases/tags/v28.0.0-gov-e2e-hardening-20260316 | jq .name

# Expected: "Release v28.0.0 — Governed E2E Hardening Cycles"
```

### Step 3: Deploy Artifacts

**Production Deployment Channels**:

| Channel | Path | Status |
|---|---|---|
| **Linux AppImage** | `deploy/latest/titane-infinity-28.0.0.AppImage` | Ready |
| **Linux DEB** | `deploy/latest/titane-infinity-28.0.0.deb` | Ready |

```bash
# Example: Deploy to web server
# (adjust paths based on your infrastructure)

# Option 1: Copy to web root (if hosted locally)
cp deploy/latest/titane-infinity-28.0.0.AppImage /var/www/titane-releases/
cp deploy/latest/titane-infinity-28.0.0.deb /var/www/titane-releases/

# Option 2: Upload to cloud storage (AWS S3, etc.)
aws s3 cp deploy/latest/titane-infinity-28.0.0.AppImage s3://titane-releases/
aws s3 cp deploy/latest/titane-infinity-28.0.0.deb s3://titane-releases/

# Option 3: Update package repository (if using apt/snap)
# (depends on your CI/CD pipeline)
```

### Step 4: Post-Deployment Smoke Test

**Quick E2E Validation** (30 seconds):

```bash
# 1. Install AppImage (optional test)
chmod +x deploy/latest/titane-infinity-28.0.0.AppImage
# ./deploy/latest/titane-infinity-28.0.0.AppImage --version

# 2. Run single diagnostic E2E spec
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
WDIO_SPEC=e2e/desktop/diagnostic-tauri-api.wdio.test.js \
  timeout 60 pnpm run e2e:desktop 2>&1 | tail -50

# Expected: Test passes without 'script timed out' or 'invalid session id'
```

### Step 5: Verification & Monitoring

```bash
# 1. Check deploy logs
tail -f /var/log/titane-deployment.log

# 2. Monitor production error rates
# (from your logging infrastructure)

# 3. Confirm users can download/install
# Test AppImage download link works
curl -I https://<your-domain>/titane-releases/titane-infinity-28.0.0.AppImage

# Expected: HTTP 200 OK
```

---

## Rollback Procedures

### If Deployment Fails

**Option 1: Fast Revert** (< 1 minute)

```bash
# 1. Delete the release
# (Manual: GitHub portal Releases tab → Delete release)

# 2. Revert artifacts to previous version
rm deploy/latest/titane-infinity-28.0.0.AppImage
rm deploy/latest/titane-infinity-28.0.0.deb

# (Restore previous version from backup if needed)

# 3. Revert git tag (optional; keep for history)
git push origin --delete v28.0.0-gov-e2e-hardening-20260316
```

**Option 2: Full Revert** (if production deployed)

```bash
# 1. Reset MAIN to parent commit
git reset --hard c2ecb83ba  # (origin/MAIN before this release)

# 2. Create revert commit (optional; for documentation)
git revert ca545df1b -m "Revert: v28.0.0 deployment issue"
git push origin MAIN

# 3. Deploy previous stable version
# (from v27.2.0 or earlier stable tag)
```

### Rollback Success Criteria

- ✅ Release deleted from GitHub
- ✅ Artifacts removed or reverted
- ✅ Git history updated (if applicable)
- ✅ Users can re-download previous version
- ✅ E2E tests pass on previous version

---

## Deployment Validation Checklist

| Step | Task | Status |
|---|---|---|
| 1 | Pre-deployment checks pass | ⬜ |
| 2 | GitHub release created | ⬜ |
| 3 | Artifacts deployed (AppImage + DEB) | ⬜ |
| 4 | Download links validated | ⬜ |
| 5 | Smoke test (1 E2E spec) passes | ⬜ |
| 6 | Production logs clean (no errors) | ⬜ |
| 7 | User download/install confirms | ⬜ |
| 8 | Release notes visible on GitHub | ⬜ |

---

## Support Information

**If issues occur during deployment**:

1. Check error logs
2. Verify commit is correct: `git show ca545df1b --oneline`
3. Verify artifacts exist: `ls -la deploy/latest/`
4. Review proof-pack: `less proof_packs/prod_release_v28_20260316_ca545df1b/00_PROD_RELEASE_GOVERNANCE.md`
5. Contact: GitHub Copilot (automation support)

---

**Deployment Instructions**: COMPLETE  
**Authority**: Governed PROD kernel  
**Status**: READY FOR EXECUTION ✅

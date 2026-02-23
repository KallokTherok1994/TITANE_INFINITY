# Version Plan: v27.0.6 Hotfix

## Release Track Decision

### Chantier Nature: API Documentation Sync

- **Category**: Docs-only (zero runtime impact)
- **Risk**: MINIMAL (P2 policy)
- **Rollback**: Trivial (git revert)

### Version Selection: v27.0.6 (Hotfix)

**Rationale**:

- Documentation sync = patch-level change (docs fix)
- No feature additions, no breaking changes
- No version bump in package.json/Cargo.toml/tauri.conf.json needed
- Can deploy to users immediately after Wave 1 validation

**Version Track Decision**: ✅ v27.0.6-hotfix-docs-sync

---

## Deployment Strategy

### Wave Strategy (Conservative)

**Wave 1**: 5% early adopters (today)
**Wave 2**: 25% mainstream (after 24h verification)
**Wave 3**: 100% GA (after 48h full validation)

### Build Artifacts

- AppImage (unified)
- DEB (Ubuntu/Debian)
- RPM (RHEL/Fedora compatible)

### Timeline

1. **Now**: Merge perfection/lane-optimization → main
2. **+5 min**: Git tag v27.0.6
3. **+15 min**: Build artifacts (AppImage + DEB)
4. **+30 min**: SHA256 verification
5. **+45 min**: Deploy Wave 1 (5%)
6. **+24h**: Verify Wave 1 metrics
7. **+48h**: Deploy Wave 2 (25%)
8. **+72h**: Full GA (Wave 3, 100%)

---

## Critical Path

### Merge & Tag

```bash
git checkout main
git merge perfection/lane-optimization
git tag -a v27.0.6 -m "Hotfix: API documentation sync"
git push origin main v27.0.6
```

### Build Sequence

```bash
GO_FOR_PROD_BUILD__TITANE_INFINITY=APPROVED pnpm run build:tauri:e2e
```

### Deployment Gate

All 9 governance gates: ✅ PASS (verified in Phase 7)

---

## Success Metrics

| Metric         | Baseline     | Target  |
| -------------- | ------------ | ------- |
| Build time     | ~45 min      | <50 min |
| Artifact size  | 86M AppImage | ±2%     |
| Test pass rate | 100%         | 100%    |
| Deployment lag | N/A          | <2h     |

---

## Rollback Plan

**If issues detected**:

```bash
git revert v27.0.6
git tag -d v27.0.6
git push origin :v27.0.6
```

Rollback time: <10 min (docs revert)

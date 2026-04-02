# 10 Distribution Correction Loop

## Iteration 1

1. Cause dominante: artifacts latest stale and manifest drift.
2. Proof: missing 27.2.0 files in latest + stale 26.4.0 files present.
3. SAFE_AUTO_FIX eligibility: YES (bounded to distribution/package/install lane).
4. Fix minimal:
   - build bundles (`deb`, `appimage`)
   - refresh `deployment/latest`
   - regenerate manifest/checksums
5. Post-package rerun:
   - AppImage WDIO x3 PASS
   - deb payload WDIO PASS
6. Captures/logs: stored in `artifacts/` and `raw/`.
7. Expected vs observed: all HIGH markers PASS except privileged deb system install.
8. Reclassification: distribution integrity PASS; environment install privilege BLOCKED.

## Stop condition

- No critical FAIL remains in scope distribution/package/runtime from distributed artifacts.

# Post-Sealed Monitoring Plan

## Available Verification Commands (existing — not invented)

### Artifact Integrity
```bash
# Verify AppImage checksum matches sealed reference
sha256sum src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage
# Expected: 27692dd09bc0024982eb86c6dd2588cd01390a5e0870ac64a401ecdaa0b619c2
cat RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt
```

### Governance Integrity
```bash
bash scripts/verify_instructions.sh        # expect PASS=20 FAIL=0
bash scripts/autoheal/detect_recurrence.sh # expect G_AH_RECURRENCE_GUARD_PASS
bash scripts/verify/verify-native-binary-freshness.sh  # expect VERDICT=PASS
```

### Test Integrity
```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20 --silent
pnpm test          # expect 3399/3399 PASS (1 known flaky: DesignCenter)
cd src-tauri && cargo test --lib  # expect 4463/4463 PASS
```

### Version Consistency
```bash
grep '"version"' package.json          # expect 28.6.0
grep '^version' src-tauri/Cargo.toml  # expect 28.6.0
grep "Version" README.md | head -2     # expect v28.6.0
head -1 docs/README.md                 # expect # TITANE∞ v28.6.0
```

### Git State
```bash
git status --porcelain   # expect empty (clean)
git rev-parse --short HEAD  # expect current sealed tip
git log --oneline -5        # expect only governance/proof commits after b93675c91
```

## What to Observe if a Real Prod Issue Appears
1. Checksum mismatch → immediate BLOCKING_SEALED — reopen policy triggered
2. Binary missing or corrupt → rollback to v28.5.0 AppImage immediately
3. Sealed version contradiction (package.json ≠ sealed doc) → stop, investigate
4. User-visible crash in sealed binary → document, classify, reopen only if reproduced

## Monitoring Gap (honest classification)
- No automated health-check running continuously: NON_BLOCKING_MONITOR
- No GitHub Actions smoke test on prod binary: NON_BLOCKING_MONITOR
- Desktop E2E requires local Ollama env (not CI-automated): NON_BLOCKING_MONITOR

These gaps are documented, not hidden.

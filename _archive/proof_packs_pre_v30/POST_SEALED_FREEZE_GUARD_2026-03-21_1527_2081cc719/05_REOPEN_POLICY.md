# Reopen Policy

## Product work may be reopened ONLY if one of these is proven

| Trigger | Evidence Required | Action |
|---------|------------------|--------|
| Real prod crash | Stack trace or reproducible crash in sealed binary | Classify defect, minimal patch, new version |
| Checksum mismatch | sha256sum output ≠ RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | Halt, investigate, do not distribute |
| Release artifact corruption | AppImage/deb fails to execute or extract | Rollback to v28.5.0 immediately |
| Sealed version contradiction | package.json ≠ RELEASE_SEALED.txt version | Investigate commit history, classify |
| Rollback failure | git revert fails or prior version non-functional | Escalate, manual recovery |
| Critical user-visible defect | Reproducible functional failure in sealed UI | One-lock patch, new version tag |
| Release mismatch signal | Deployed tag ≠ HEAD release line | Investigate silently, classify before acting |

## Everything Else → Deferred to Next Cycle
- Flaky test improvements
- CI automation for monitoring
- deployment/latest/ AppImage copy
- docs/90_release/ v28.6.0 doc
- ESLint 10 peer unblock
- Desktop E2E full automation
- Any "nice to have" cleanup

## Reopen Forbidden For
- Style changes
- Performance hunches without measurement
- Documentation cosmetic rewrites
- Adding new features to the sealed version
- Any work that cannot be described as "fixing a proven production defect"

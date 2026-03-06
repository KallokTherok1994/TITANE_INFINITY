# Release Note v27.2.0 Post-Deploy (2026-03-06)

Date: 2026-03-06
Status: READY_FOR_TAG
Target branch: MAIN
Target commit: 0118dcccf

## Scope

This note captures the post-deploy stabilization wave executed on 2026-03-06 after the existing `v27.2.0` release.
No version bump was introduced.

## Included Commits

- 79ff75016 - fix(smoke): stabilize integer counters in appimage analyzer
- 43c35be3f - fix(smoke): harden installed runtime counters
- be5ced801 - chore(deploy): resync latest v27.2.0 metadata
- 0118dcccf - docs(deploy): resync release metadata and live references

## Runtime Validation

- `scripts/smoke/smoke_stable_appimage.sh`: PASS
  - Log: `runtime/stable/logs/smoke-appimage-20260306-115647.log`
- `scripts/smoke/smoke_stable_installed.sh`: PASS
  - Log: `/tmp/smoke-installed-20260306-115823.log`

## Artifact Integrity (deployment/latest)

- `TITANE-Infinity_27.2.0_amd64.AppImage`
  - size: 91970040 bytes (88M)
  - sha256: `0e7bfe39ea96cb22445eb0dd7ca38b429de6cc8a203b946a447a6b555deb4bdc`
- `TITANE-Infinity_27.2.0_amd64.deb`
  - size: 16830756 bytes (17M)
  - sha256: `1c1f15dee313b97cc7d128dcb6597acd7aa43987b73393e29345605a2919eff3`
- `TITANE-Infinity-27.2.0-1.x86_64.rpm`
  - size: 16815048 bytes (17M)
  - sha256: `4a1601a790cadd94bc19730ae6a175b9c27338d215d5323784b4ede66a08bd79`

## Metadata Synced

- `deployment/latest/MANIFEST.json`
- `deployment/latest/MANIFEST_v27.2.0.json`
- `deployment/latest/SHA256SUMS.txt`
- `deployment/latest/CHECKSUMS.sha256`
- `deployment/latest/SIZES.txt`

## Suggested Tag (Preparation)

Suggested tag name:
- `v27.2.0-main-sync-20260306`

Suggested commands (not executed here):

```bash
git tag -a v27.2.0-main-sync-20260306 0118dcccf -m "v27.2.0 post-deploy sync 2026-03-06"
git push origin v27.2.0-main-sync-20260306
```

## Notes

- This is a post-deploy stabilization and metadata coherence note.
- Existing historical release tag `v27.2.0` remains unchanged.

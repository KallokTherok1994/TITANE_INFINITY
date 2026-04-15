# WINDOWS MSI RELEASE REPORT — TITANE∞ v30.1.25

Date: 2026-04-15
Session: WINDOWS_MSI_RELEASE_30_1_25
Verdict candidate: PASS

## Scope

- Verify the rerun Windows MSI lane after the workflow action refresh
- Confirm the Node 20 deprecation annotation is gone from the watcher summary
- Publish the validated MSI and checksum as GitHub release assets for `v30.1.25`

## Executed Commands

1. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24466843763 --jq '{status: .status, conclusion: .conclusion, html_url: .html_url, updated_at: .updated_at}'`
2. `GH_PAGER=cat gh run view 24466843763 --repo KallokTherok1994/TITANE_INFINITY`
3. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24466843763/artifacts --jq '{total_count: .total_count, artifacts: [.artifacts[] | {id, name, size_in_bytes, expired, created_at, archive_download_url}]}'`
4. `GH_PAGER=cat gh run download 24466843763 --repo KallokTherok1994/TITANE_INFINITY -n windows-msi-4 -D /tmp/titane-win-release-24466843763`
5. `cd /tmp/titane-win-release-24466843763 && cat SHA256SUMS.txt && sha256sum -c SHA256SUMS.txt`
6. `GH_PAGER=cat gh release create v30.1.25 "TITANE Infinity_30.1.25_x64_en-US.msi" "SHA256SUMS.txt" --repo KallokTherok1994/TITANE_INFINITY --title "TITANE∞ v30.1.25" --notes "..."`
7. `GH_PAGER=cat gh release view v30.1.25 --repo KallokTherok1994/TITANE_INFINITY --json tagName,name,isDraft,isPrerelease,url,assets`

## Proof Summary

- Rerun `24466843763` completed with `success`.
- The watcher summary for the rerun completed without the previous `ANNOTATIONS` section that had reported forced execution of Node 20-based actions.
- Published workflow artifact:
  - name: `windows-msi-4`
  - size: `16997550` bytes
- Downloaded rerun payload:
  - `TITANE Infinity_30.1.25_x64_en-US.msi` — `17211392` bytes
  - `SHA256SUMS.txt` — `105` bytes
- Verified checksum before release upload:
  - `31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8  TITANE Infinity_30.1.25_x64_en-US.msi`
  - `sha256sum -c SHA256SUMS.txt` returned `Réussi`
- GitHub release created:
  - tag: `v30.1.25`
  - name: `TITANE∞ v30.1.25`
  - URL: `https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.1.25`
- Published release assets:
  - `TITANE.Infinity_30.1.25_x64_en-US.msi` — `17211392` bytes — digest `sha256:31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8`
  - `SHA256SUMS.txt` — `105` bytes — digest `sha256:44700487df5b477e2128ce8ded08e05b527124712680d201b1c170e3d30f88be`

## Residual Limits

- The release asset filename for the MSI was normalized by GitHub to `TITANE.Infinity_30.1.25_x64_en-US.msi`; this report preserves both the local pre-upload name and the published release name.
- This report does not claim Linux or Android release publication for v30.1.25, only the Windows MSI release assets.
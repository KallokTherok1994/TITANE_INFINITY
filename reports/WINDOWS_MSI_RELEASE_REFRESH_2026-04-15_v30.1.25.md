# WINDOWS MSI RELEASE REFRESH REPORT — TITANE∞ v30.1.25

Date: 2026-04-15
Session: WINDOWS_MSI_RELEASE_REFRESH_30_1_25
Verdict candidate: PASS

## Scope

- Refresh the Windows MSI release assets for `v30.1.25`
- Reuse the last already validated Windows artifact as the deterministic source of truth
- Avoid leaving a second in-progress rerun able to overwrite the same release assets later

## Executed Commands

1. `GH_PAGER=cat gh workflow run .github/workflows/windows-msi-on-demand.yml --repo KallokTherok1994/TITANE_INFINITY --ref MAIN -f release_tag=v30.1.25`
2. `GH_PAGER=cat gh run cancel 24470399167 --repo KallokTherok1994/TITANE_INFINITY`
3. `GH_PAGER=cat gh run download 24466843763 --repo KallokTherok1994/TITANE_INFINITY --name windows-msi-4 --dir /tmp/titane-win-release-refresh`
4. `cd /tmp/titane-win-release-refresh && cat SHA256SUMS.txt && sha256sum -c SHA256SUMS.txt`
5. `cd /tmp/titane-win-release-refresh && GH_PAGER=cat gh release upload v30.1.25 --repo KallokTherok1994/TITANE_INFINITY "TITANE Infinity_30.1.25_x64_en-US.msi" "SHA256SUMS.txt" --clobber`
6. `GH_PAGER=cat gh release view v30.1.25 --repo KallokTherok1994/TITANE_INFINITY --json tagName,name,isDraft,isPrerelease,assets`
7. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24470399167 --jq '{status: .status, conclusion: .conclusion, html_url: .html_url}'`

## Proof Summary

- Last validated source artifact reused for the refresh:
  - run: `24466843763`
  - artifact: `windows-msi-4`
  - payload files:
    - `TITANE Infinity_30.1.25_x64_en-US.msi` — `17211392` bytes
    - `SHA256SUMS.txt` — `105` bytes
- Local checksum verification before refresh:
  - `31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8  TITANE Infinity_30.1.25_x64_en-US.msi`
  - `sha256sum -c SHA256SUMS.txt` returned `Réussi`
- Release assets refreshed successfully with `gh release upload --clobber`
- Published release state after refresh:
  - tag: `v30.1.25`
  - name: `TITANE∞ v30.1.25`
  - MSI asset: `TITANE.Infinity_30.1.25_x64_en-US.msi`
    - digest: `sha256:31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8`
    - createdAt: `2026-04-15T18:20:31Z`
    - updatedAt: `2026-04-15T18:20:33Z`
  - checksum asset: `SHA256SUMS.txt`
    - digest: `sha256:44700487df5b477e2128ce8ded08e05b527124712680d201b1c170e3d30f88be`
    - createdAt: `2026-04-15T18:20:31Z`
    - updatedAt: `2026-04-15T18:20:32Z`
- Redundant rerun state:
  - run: `24470399167`
  - final status: `completed`
  - conclusion: `cancelled`
  - URL: `https://github.com/KallokTherok1994/TITANE_INFINITY/actions/runs/24470399167`

## Residual Limits

- This refresh reused the already validated Windows payload from run `24466843763`; it does not claim that the canceled rerun `24470399167` produced a new MSI.
- GitHub normalized the uploaded MSI asset filename from spaces to dots in the published release asset name, but the asset digest stayed identical to the verified local payload.
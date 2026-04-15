# WINDOWS MSI CI REPORT — TITANE∞ v30.1.25

Date: 2026-04-15
Session: WINDOWS_MSI_CI_30_1_25
Verdict candidate: PASS

## Scope

- Verify the canonical GitHub Windows MSI lane for v30.1.25
- Capture the exact published artifact and checksum proof
- Remove the known Node 20 action-runtime warning from future Windows workflow runs

## Executed Commands

1. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24465327619 --jq '{status: .status, conclusion: .conclusion, html_url: .html_url, updated_at: .updated_at}'`
2. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24465327619/artifacts --jq '{total_count: .total_count, artifacts: [.artifacts[] | {id, name, size_in_bytes, expired, created_at, updated_at, archive_download_url}]}'`
3. `GH_PAGER=cat gh api repos/KallokTherok1994/TITANE_INFINITY/actions/runs/24465327619/jobs --jq '{jobs: [.jobs[] | {name, status, conclusion, started_at, completed_at, current_step: ([.steps[] | select(.status=="in_progress") | .name] | .[0]), last_completed_step: ([.steps[] | select(.status=="completed")][-1].name)}]}'`
4. `GH_PAGER=cat GH_FORCE_TTY=0 gh run watch 24465327619 --repo KallokTherok1994/TITANE_INFINITY --interval 15 --exit-status`
5. `rm -rf /tmp/titane-win-24465327619 && mkdir -p /tmp/titane-win-24465327619 && GH_PAGER=cat gh run download 24465327619 --repo KallokTherok1994/TITANE_INFINITY -n windows-msi-3 -D /tmp/titane-win-24465327619 && find /tmp/titane-win-24465327619 -maxdepth 2 -type f -printf '%P|%s bytes\n' | sort`
6. `cd /tmp/titane-win-24465327619 && cat SHA256SUMS.txt && sha256sum -c SHA256SUMS.txt`
7. `GH_PAGER=cat gh api repos/actions/checkout/releases/latest --jq '{tag_name: .tag_name, name: .name}'`
8. `GH_PAGER=cat gh api repos/actions/upload-artifact/releases/latest --jq '{tag_name: .tag_name, name: .name}'`

## Proof Summary

- GitHub Actions run `24465327619` completed with `status=completed` and `conclusion=success`.
- The Windows job `Build Windows MSI` passed all gating steps:
  - Checkout
  - Setup Node.js
  - Install JS dependencies
  - Setup Rust
  - Frontend build
  - Build MSI
  - Generate MSI checksums
  - Upload artifact
- Published artifact bundle:
  - GitHub artifact name: `windows-msi-3`
  - GitHub artifact payload size: `16997560` bytes
- Downloaded artifact contents:
  - `TITANE Infinity_30.1.25_x64_en-US.msi` — `17211392` bytes
  - `SHA256SUMS.txt` — `105` bytes
- Verified checksum:
  - `f8f602231bd41169dc218aeb9e06e173f769cc80708835f9903b7a0444e634c6  TITANE Infinity_30.1.25_x64_en-US.msi`
  - `sha256sum -c SHA256SUMS.txt` returned `Réussi`
- Workflow maintenance hardening prepared locally:
  - `actions/checkout` latest release observed: `v6.0.2`
  - `actions/upload-artifact` latest release observed: `v7.0.1`
  - `.github/workflows/windows-msi-on-demand.yml` updated accordingly for future runs

## Residual Limits

- The completed run `24465327619` still emitted the historical GitHub annotation about Node 20-based actions because it executed before the local workflow patch was pushed.
- No release-tag upload is claimed here; the workflow uploaded only a GitHub Actions artifact.
- The workflow patch is validated locally by governance checks only until it is committed, pushed, and rerun remotely.
# PR Fix Playbook (Mermaid Governance)

## Quick repair path

- Run: `pnpm run op:mermaid`
- Then: `bash scripts/verify/mermaid-proof-pack.sh`

## Failure map

- Change request guard FAIL
  - Create `docs/diagrams/CHANGE_REQUEST.md` from template and list modified `.mmd`

- Registry check FAIL
  - Run `bash scripts/verify/mermaid-hash-registry.sh`
  - Commit updated registry (append-only)

- Drift strict FAIL
  - Update `docs/diagrams/sources/network_surface_online_first.mmd` or adjust allowlist with justification

- Baseline guard FAIL
  - Re-anchor via official process (V6/V7), then regenerate status report and proof pack

## Recommended sequence

1) `pnpm run op:mermaid`
2) `bash scripts/verify/mermaid-baseline-guard.sh`
3) `bash scripts/verify/mermaid-status-report.sh`
4) `bash scripts/verify/mermaid-proof-pack.sh`

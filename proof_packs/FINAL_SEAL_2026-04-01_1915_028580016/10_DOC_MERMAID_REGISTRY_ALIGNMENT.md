# 10 DOC MERMAID REGISTRY ALIGNMENT

## Verification results

- `bash scripts/verify/verify-mermaid-diagrams.sh`: PASS
- `pnpm -s verify:registry`: PASS
- `bash scripts/verify/verify-copilot-instructions.sh`: PASS

## Version authority drift discovered

| Surface | Observed version | Status |
| --- | --- | --- |
| `package.json` | `28.88.0` | authority candidate |
| `src-tauri/tauri.conf.json` | `28.88.0` | aligned with app authority |
| `runtime/stable/tauri.conf.json` | `28.0.0` | DRIFT |
| `deployment/latest/MANIFEST.json` | `28.44.0` | DRIFT |
| `VERSION_AUTHORITY_MAP.md` | `28.5.0` era content | DRIFT |

## Alignment verdict

Instruction and registry integrity are green.
Documentation and deployment version authority are not green because of multi-surface drift.

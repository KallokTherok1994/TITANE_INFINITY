# FINAL_VERIFY_PREFLIGHT

Date (UTC): 2026-02-08

## Commandes exécutées

```
date -u
git rev-parse --short HEAD
ls -la docs/reference/agentgpt-ui/ANALYSE-AGENTGPT.pdf
ls -la docs/reference/ui-carto-v4/TITANE_UI_CARTOGRAPHY_v4.zip
ls -la docs/reference/kevin-v5/ || true
find docs/ui-carto-copilot -maxdepth 3 -type f | sort
find docs/reference/kevin-v5 -maxdepth 1 -type f (md|pdf|zip|docx) excl. spec/checklist/example | wc -l
```

## Preuve brute
- [docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/preflight-raw.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/preflight-raw.txt)

## Résumé
- Inputs présents (AgentGPT PDF + V4 zip).
- Gate F: BLOCKED_BASELINE_MISSING (0 baseline admissible dans kevin-v5).

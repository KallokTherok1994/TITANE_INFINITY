# DELTA_RUN_LOG — Kevin V5 vs UI Cartography

Date (UTC): 2026-02-08  
Commit: 2dde4f14  
Authority: TITANE∞ Governance

## Commandes exécutées (preuves)

### Extraction baseline
```
mkdir -p docs/reference/kevin-v5/_normalized/v4_zip_extracted
unzip -o docs/reference/kevin-v5/TITANE_UI_CARTOGRAPHY_v4.zip -d docs/reference/kevin-v5/_normalized/v4_zip_extracted
pdftotext -layout docs/reference/kevin-v5/ANALYSE-AGENTGPT.pdf - | rg -n "AppShell|AppLayout|Sidebar|TitanePage|MessageList|ErrorBoundary|Menu" -m 50
```

### Preuves Kevin V5 (line refs)
```
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/00_README.md | sed -n '1,200p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/01_NAVIGATION_MAP.md | sed -n '1,200p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/NAVIGATION_ROUTES.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/SHELL_GLOBAL.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/CONTRACTS_UI_BACKEND.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/architecture/OBSERVABILITY.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/05_COMPONENT_SYSTEM.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/06_STATE_FLOWS.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/07_ERRORS_WARNINGS_BLOCKERS.md | sed -n '1,220p'
nl -ba docs/reference/kevin-v5/_normalized/v4_zip_extracted/data/routes_map.json | sed -n '1,160p'
```

### Preuves cartographie actuelle (line refs)
```
nl -ba docs/ui-carto-copilot/10-navigation/11-sections-map.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/10-navigation/12-routes-map.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/10-navigation/13-layout-shell.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/10-navigation/14-persistent-widgets.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/35-states/38-empty-loading-error-catalog.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/40-observability/40-boot-pipeline.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/40-observability/41-error-boundaries.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/50-audit/50-issues-register.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/30-contracts/30-ipc-invocations-index.md | sed -n '1,220p'
nl -ba docs/ui-carto-copilot/09_MANIFEST.json | sed -n '1,260p'
rg -n "TitanePage|MessageList" docs/ui-carto-copilot -g "*.md"
```

## Sorties clés
- Normalisation: [docs/ui-carto-copilot/VERIFICATION/KEVIN_V5_NORMALIZED.md](docs/ui-carto-copilot/VERIFICATION/KEVIN_V5_NORMALIZED.md)
- Delta report: [docs/ui-carto-copilot/DELTA_REPORT.md](docs/ui-carto-copilot/DELTA_REPORT.md)
- Delta issues: [docs/ui-carto-copilot/DELTA_ISSUES.md](docs/ui-carto-copilot/DELTA_ISSUES.md)
- Gate summary: [docs/ui-carto-copilot/DELTA_GATE_SUMMARY.md](docs/ui-carto-copilot/DELTA_GATE_SUMMARY.md)

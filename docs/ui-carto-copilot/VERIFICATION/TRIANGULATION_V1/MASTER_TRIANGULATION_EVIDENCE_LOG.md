# MASTER_TRIANGULATION_EVIDENCE_LOG

## Commandes exécutées (triangulation V1)

### Préflight
```
date -u
git rev-parse --short HEAD
ls -la docs/reference/agentgpt-ui/ANALYSE-AGENTGPT.pdf
ls -la docs/reference/ui-carto-v4/TITANE_UI_CARTOGRAPHY_v4.zip
test -d docs/ui-carto-copilot && echo "OK: ui-carto-copilot exists"
```
Preuve: [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/MASTER_TRIANGULATION_PREFLIGHT.md](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/MASTER_TRIANGULATION_PREFLIGHT.md)

### Extraction v4
```
mkdir -p docs/reference/ui-carto-v4/extracted
unzip -o docs/reference/ui-carto-v4/TITANE_UI_CARTOGRAPHY_v4.zip -d docs/reference/ui-carto-v4/extracted
find docs/reference/ui-carto-v4/extracted -type f | sort > docs/reference/ui-carto-v4/EXTRACTED_FILELIST.txt
```
Preuve: [docs/reference/ui-carto-v4/EXTRACTED_FILELIST.txt](docs/reference/ui-carto-v4/EXTRACTED_FILELIST.txt)

### Scans requis (outputs stockés)
```
find docs/ui-carto-copilot -maxdepth 4 -type f | sort
find docs/reference/ui-carto-v4/extracted -type f | sort | head -n 200
rg -n "invoke\(|secureInvoke|fetch\(\"ipc://" src || true
rg -n "useEffect\(|useMemo\(|useCallback\(" src/pages src/components src/features || true
rg -n "createBrowserRouter|BrowserRouter|<Routes|<Route" src || true
```
Outputs:
- [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/carto-filelist.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/carto-filelist.txt)
- [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/v4-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/v4-filelist-head-200.txt)
- [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/ipc-usage.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/ipc-usage.txt)
- [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/hooks-usage.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/hooks-usage.txt)
- [docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/router-usage.txt](docs/ui-carto-copilot/VERIFICATION/TRIANGULATION_V1/SCANS/router-usage.txt)

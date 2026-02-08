# FINAL_VERIFY_REGISTRY_DIFF

Comparaison doc V4 (extrait) vs registre Copilot.

## Present in V4 but missing in registry

| V4 Item | Proof (V4) | Note |
|---|---|---|
| pages/DEV/01_OVERVIEW.md | [v4-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/v4-filelist-head-200.txt#L20) | Page-level doc absent en registry (non listée dans carto filelist). |
| pages/TITANE/01_CHAT.md | [v4-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/v4-filelist-head-200.txt#L31) | Page-level doc absent en registry (non listée dans carto filelist). |

## Present in registry but not in V4

| Registry Item | Proof (Registry) | Note |
|---|---|---|
| 10-navigation/11-sections-map.md | [carto-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/carto-filelist-head-200.txt#L5) | Carto V6/V7 navigation détaillée non présente en V4. |
| 30-contracts/30-ipc-invocations-index.md | [carto-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/carto-filelist-head-200.txt#L13) | Index IPC détaillé non présent en V4. |

## Conflicts (same topic, differing statements)

| Topic | V4 Proof | Registry Proof | Conflict |
|---|---|---|---|
| Issues register naming | [v4-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/v4-filelist-head-200.txt#L19) | [carto-filelist-head-200.txt](docs/ui-carto-copilot/VERIFICATION/FINAL_VERIFY_V1/SCANS/carto-filelist-head-200.txt#L18) | V4 uses issues/ISSUES_REGISTER.md; registry uses 50-audit/50-issues-register.md. |
| UI nav labels | [docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md](docs/ui-carto-copilot/VERIFICATION/V7_V4_KEYPOINTS.md#L13-L19) | [docs/ui-carto-copilot/09_MANIFEST.json](docs/ui-carto-copilot/09_MANIFEST.json#L100-L127) | V4 lists “Plus”; registry lists “PLUS” and “MORE”. |

## Notes
- Aucune comparaison Kevin V5 réalisée (Gate F bloqué).
- Les items “missing” indiquent un delta documentaire, pas un bug runtime.

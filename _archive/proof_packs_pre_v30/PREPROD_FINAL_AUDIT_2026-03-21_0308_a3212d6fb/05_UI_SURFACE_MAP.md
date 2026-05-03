# 05_UI_SURFACE_MAP

Status vocabulary for surfaces:
- PROVEN_RUNTIME
- PROVEN_VISIBLE_ONLY
- STATIC_ONLY
- PARTIAL_CHAIN
- BLOCKED
- FAIL

| Surface | Visible | Reachable | Interactive | Runtime proven | Desktop proven | Status |
|---|---|---|---|---|---|---|
| Shell boot | yes | yes | yes | yes | yes | PROVEN_RUNTIME |
| Top navigation | yes | yes | yes | yes | yes | PROVEN_RUNTIME |
| Chat (titane) | yes | yes | yes | partial in this session | not rerun fully in this session | PARTIAL_CHAIN |
| Memory page | yes | yes | partial | partial | not rerun this session | PARTIAL_CHAIN |
| Omega/conversation engine surfaces | yes | yes | yes | partial | not rerun full matrix | PARTIAL_CHAIN |
| System/Dev/Health | yes | yes | yes | partial (prior proofs exist) | not rerun full matrix | PARTIAL_CHAIN |
| Admin/settings/design | yes | yes | yes | browser proof sample only this session | no native full retest this session | PROVEN_VISIBLE_ONLY |
| TOTAL_DEV page | yes | yes | yes | yes | yes x3 fresh native | PROVEN_RUNTIME |
| Unified centers pages | yes | yes | partial | static + prior proofs | not rerun all | PARTIAL_CHAIN |
| Error/degraded states | yes | yes | yes | partial | partial | PARTIAL_CHAIN |

Note: This preprod final audit focused on latest critical lock and native authority chain; not all historical surfaces were re-executed end-to-end in this single run.

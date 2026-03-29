# Core / Labs / Ops Map

| Surface/Path | Current role | Target class | Reason | Risk | Action |
| --- | --- | --- | --- | --- | --- |
| src/ | Frontend runtime | KEEP_CORE | Active product code | P0 | Keep core |
| src-tauri/src/ | Backend runtime | KEEP_CORE | Active product backend | P0 | Keep core |
| src/main.tsx | Entry point | KEEP_CORE | Boot + shell entry | P0 | Keep core |
| src/App.tsx | App shell | KEEP_CORE | Shell boundary (see shell doc) | P1 | Keep core |
| src/_deprecated/ | Legacy router | HISTORICAL_KEEP | Deprecated surface in core tree | P2 | Keep isolated |
| docs/governance/ | Governance policies | GOVERNANCE_ONLY | Authority docs | P2 | Keep governance |
| .clinerules/ | Governance rules | GOVERNANCE_ONLY | Execution rules | P2 | Keep governance |
| proof_packs/ | Evidence artifacts | PROOF_ONLY | Proof lineage only | P2 | Keep proof-only |
| scripts/ | Dev/ops tooling | MOVE_TO_OPS | Tooling, not runtime | P2 | Ops-only |
| .github/ | CI/workflows | MOVE_TO_OPS | Ops/CI boundary | P2 | Ops-only |
| docs/ops/ | Operational notes | MOVE_TO_OPS | Ops documentation | P2 | Ops-only |
| docs/90_release/ | Release reports | HISTORICAL_KEEP | Release evidence | P2 | Historical |
| evals/ | Evaluation harness | MOVE_TO_LABS | Experimentation | P2 | Labs-only |
| documentation/ | External docs | MOVE_TO_LABS | Non-runtime docs | P2 | Labs-only |
| docs/ui-carto-copilot/ | UI analysis | MOVE_TO_LABS | Research/analysis | P2 | Labs-only |
| docs/audit/ | Audit evidence | GOVERNANCE_ONLY | Proof-backed audits | P2 | Governance |
| docs/architecture/ | Architecture notes | GOVERNANCE_ONLY | Design reference | P2 | Governance |
| registry/ | Change/event logs | PROOF_ONLY | Audit trail | P2 | Proof-only |
| _archive/ | Historical storage | HISTORICAL_KEEP | Legacy | P3 | Historical |

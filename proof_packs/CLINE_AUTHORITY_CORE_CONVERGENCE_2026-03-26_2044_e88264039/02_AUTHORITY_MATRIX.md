# AUTHORITY MATRIX

## Canonical Authority Sources

| File/Surface | Claim | Proof | Drift | Severity | Canonical? | Decision |
|---|---|---|---|---|---|---|
| package.json | version 28.88.0 | npm manifest | NONE | - | YES | KEEP_CANONICAL |
| src-tauri/Cargo.toml | version 28.88.0 | Cargo manifest | NONE | - | YES | KEEP_CANONICAL |
| src-tauri/tauri.conf.json | version 28.88.0 | Tauri config | NONE | - | YES | KEEP_CANONICAL |
| src/App.tsx | header v28.88.0 | source header | NONE | - | YES | KEEP_CANONICAL |
| RELEASE_v28.88.0_SEALED.txt | v28.88.0 sealed | release artifact | NONE | - | YES | KEEP_CANONICAL |
| .github/copilot-instructions.md | Constitutional kernel | governance layer | NONE | - | YES | KEEP_CANONICAL |
| .clinerules/00-kernel.md | Mirrors copilot | operational layer | NONE | - | YES | KEEP_CANONICAL |

## Drift Detected and Fixed

| File/Surface | Before | After | Severity | Decision |
|---|---|---|---|---|
| src/services/ai/orchestrator.ts | v37.0.0 | v28.88.0 | P1 | REALIGNED |
| src/services/conversationEngine.ts | v∞ | v28.88.0 | P1 | REALIGNED |

## Surfaces Requiring Review

| File/Surface | Issue | Severity | Decision |
|---|---|---|---|
| .github/workflows/ (33 files) | Gate authority unknown | P1 | REVIEW_REQUIRED |
| src/App.tsx | Shell overload (30+ lazy centers) | P1 | SHELL_OVERWEIGHT_CONFIRMED |
| proof_packs/ (15+ dirs) | Archive surface proliferation | P2 | REVIEW_REQUIRED |
| docs/ (100+ files) | Documentation authority drift risk | P2 | REVIEW_REQUIRED |
# TITANE Advanced Intelligence Registry

Lock: B1.5
Date: 2026-05-06

| id | name | lock | surface | files | owner_agent | status | proof_pack | validators | autoheal_entry | desktop_e2e_coverage | risk | rollback | next_dependency |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REG-AI-B1 | Cognitive Core Truth Matrix | B1 | docs | docs/reports/COGNITIVE_CORE_TRUTH_MATRIX.md; docs/cognitive/* | titane-conductor | DRIFT_FOUND_FIXED | proof_packs/LOCK_B1_COGNITIVE_CORE_TRUTH_MATRIX_2026-05-06/ | verify_instructions; verify_evals_scaffold; detect_recurrence | LOCK_B1_COMPLETION_EXTENSION_2026_05_06 | linked (deps only) | docs drift | git restore docs + proof pack + autoheal row | B1.5 |
| REG-AI-B1.5 | Cartography and Registry | B1.5 | docs/scripts | docs/cartography/TITANE_ADVANCED_INTELLIGENCE_MAP.md; docs/registry/TITANE_*; scripts/verify/verify_advanced_intelligence_registry.sh | titane-conductor | CLEAN | proof_packs/LOCK_B1_5_ADVANCED_INTELLIGENCE_CARTOGRAPHY_REGISTRY_2026-05-06/ | verify_instructions; verify_advanced_intelligence_registry; detect_recurrence | LOCK_B1_5_REGISTRY_CARTOGRAPHY_2026_05_06 | indexed (registry-level) | registry drift | git restore docs/registry docs/cartography scripts/verify + autoheal row | B2 |

# TITANE Test Registry

Lock: B1.5
Date: 2026-05-06

| id | name | lock | surface | files | status | proof_pack | validators | desktop_e2e_coverage | risk |
|---|---|---|---|---|---|---|---|---|---|
| TREG-001 | Instruction governance gate | global | scripts | scripts/verify_instructions.sh | ACTIVE | lock proof packs | PASS=51 baseline | n/a | low |
| TREG-002 | AutoHeal recurrence gate | global | scripts | scripts/autoheal/detect_recurrence.sh | ACTIVE | lock proof packs | entries monotonic | n/a | low |
| TREG-003 | Eval scaffold gate | B-phase | scripts/evals | scripts/verify/verify_evals_scaffold.sh | ACTIVE | B1/B1I | PASS=42 baseline | indirect | medium |
| TREG-004 | Advanced intelligence registry gate | B1.5 | scripts/docs | scripts/verify/verify_advanced_intelligence_registry.sh | ACTIVE | B1.5 | existence + consistency checks | indirect | low |

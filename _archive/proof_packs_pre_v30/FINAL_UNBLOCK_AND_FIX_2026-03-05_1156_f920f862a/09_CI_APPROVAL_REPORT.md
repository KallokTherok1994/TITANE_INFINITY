# CI Approval Report

## Sources

- `gh run list --status action_required --limit 30`
- `gh run list --branch MAIN --limit 20`

## Observation

- Plusieurs workflows apparaissent en `action_required`.
- Selon la constitution v3, ce cas se classe `BLOCKED_APPROVAL` si le code local est vert.

## Classification

- Local code/runtime gates: PASS (voir logs x3 et scans after).
- GitHub approvals/security externes: `BLOCKED_APPROVAL`.

## Next actions <= 30 min

1. Ouvrir les runs `action_required` critiques (security/release).
2. Appliquer approbation/review requise.
3. Relancer les runs requis puis confirmer `completed/success`.

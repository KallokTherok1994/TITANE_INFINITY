# 04_TARGET_SPEC

## Architecture cible des instructions

1. **Constitution unique**: `.github/copilot-instructions.md`
   - Définit doctrine, gates globales, verdict unique, stop-the-line.
2. **Satellites path-specific**: `.github/instructions/*.instructions.md`
   - Spécialisation sans dupliquer les règles globales.
3. **Checklist setup/session**: `.github/copilot-setup-checklist.md`
   - Opérationnalise les prérequis.
4. **Workflow mermaid**: `.github/copilot-workflow.mermaid`
   - Reflète exactement le pipeline gouverné.
5. **Système AutoFix/AutoHeal**: `scripts/autoheal/*`
   - Append-only + scripts de détection/prévention.

## Pipeline canonique attendu

`Bootstrap -> Inventory -> Contradictions -> Patch -> Verify -> AutoHeal Append -> Proof-pack -> Verdict`

## Règles de rédaction

- Formulations mesurables, testables, sans ambiguïté.
- Chaque gate a des critères PASS/FAIL/BLOCKED et une preuve associée.
- Toute obligation inclut commande(s) et artefact(s).
- Aucune duplication non nécessaire entre constitution et satellites.

## Règle majeure obligatoire (à intégrer)

"À chaque fix réalisé par Copilot, ajouter une entrée append-only dans `scripts/autoheal/autoheal_rules.jsonl` (problème -> cause racine -> correction -> test anti-récurrence -> rollback). Aucun fix n'est terminé sans entrée AutoHeal + garde-fou."

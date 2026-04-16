# ROLLBACK

Si cette consolidation doit etre retiree:

1. Restaurer les AGENTS locaux modifies:
   - `git restore -- src/AGENTS.md src-tauri/AGENTS.md e2e/AGENTS.md docs/AGENTS.md scripts/AGENTS.md`
2. Restaurer le rapport et l'entree AutoHeal:
   - `git restore -- reports/AUDIT_ANTIDRIFT_2026-04-16.md scripts/autoheal/autoheal_rules.jsonl`
3. Supprimer le proof pack de cette session:
   - `rm -rf proof_packs/AUDIT_ANTIDRIFT_2026-04-16_1600_anti_drift`

Rollback scope: documentation gouvernee et regles locales uniquement; aucun code runtime ou build artifact n'est modifie par cette phase.
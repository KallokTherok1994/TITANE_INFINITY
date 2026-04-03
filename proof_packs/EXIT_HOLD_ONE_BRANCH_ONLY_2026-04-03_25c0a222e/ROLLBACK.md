# ROLLBACK — EXIT_HOLD_ONE_BRANCH_ONLY cycle (2026-04-03)

## Mutations produit

**AUCUNE** — Ce cycle est NO_VALID_TRIGGER → MODE=HOLD.
Aucun fichier produit, workflow, ou source n'a été modifié.

## Fichiers créés dans ce cycle

```
proof_packs/EXIT_HOLD_ONE_BRANCH_ONLY_2026-04-03_25c0a222e/VERDICT.md
proof_packs/EXIT_HOLD_ONE_BRANCH_ONLY_2026-04-03_25c0a222e/ROLLBACK.md
scripts/autoheal/autoheal_rules.jsonl  (entrée AH-2026-04-03-EXIT-HOLD-007 ajoutée)
```

## Commandes rollback (si nécessaire)

```bash
# Supprimer ce proof pack
rm -rf proof_packs/EXIT_HOLD_ONE_BRANCH_ONLY_2026-04-03_25c0a222e/

# Restaurer l'entrée autoheal (retirer la dernière ligne)
head -n -1 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_tmp && \
mv /tmp/ah_tmp scripts/autoheal/autoheal_rules.jsonl
```

## Note de sécurité

- Aucune famille scellée (CHAT_CORE/MEMORY/OMEGA) touchée.
- Aucun workflow modifié.
- Aucun code source modifié.
- Verdict préservé : QUALIFIED_PARTIAL.

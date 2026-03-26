# 11_ROLLBACK

## Rollback complet de la session

```bash
# 1. Restaurer les fichiers sources modifiés
git restore -- \
  src/ui/pages/Chat.tsx \
  src/features/chat/ThinkingPanel.tsx \
  src/features/chat/ThinkingPanel.css

# 2. Tronquer les 5 entrées autoheal ajoutées (283 → 278 lignes)
head -n 278 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_rollback.jsonl
mv /tmp/ah_rollback.jsonl scripts/autoheal/autoheal_rules.jsonl

# 3. Supprimer le proof pack
rm -rf proof_packs/OMEGA_JOURNAL_FIX_2026-03-15_1214_773f2a89/
```

## Vérification post-rollback

```bash
git status
wc -l scripts/autoheal/autoheal_rules.jsonl  # doit retourner 278
bash scripts/verify_instructions.sh
```

## Risques

- Aucun changement Rust → pas de rollback back-end requis
- autoheal_rules.jsonl : append-only — le tronquage est réversible localement mais non recommandé si poussé
- Les bugs OMEGA_JOURNAL réapparaissent tels quels (état pré-session)

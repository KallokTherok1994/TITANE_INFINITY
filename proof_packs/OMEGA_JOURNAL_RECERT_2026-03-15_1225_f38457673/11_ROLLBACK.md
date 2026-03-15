# 11_ROLLBACK

## Rollback complet de la recertification (+ session #1)

```bash
# 1. Restaurer les fichiers sources modifiés par sessions #1 + recert
git restore -- \
  src/ui/pages/Chat.tsx \
  src/features/chat/ThinkingPanel.tsx \
  src/features/chat/ThinkingPanel.css

# 2. Désindexer les fichiers mis en stage
git restore --staged \
  src/ui/pages/Chat.tsx \
  src/features/chat/ThinkingPanel.tsx \
  src/features/chat/ThinkingPanel.css

# 3. Tronquer les 6 entrées autoheal ajoutées (284 → 278 lignes)
head -n 278 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_rollback.jsonl
mv /tmp/ah_rollback.jsonl scripts/autoheal/autoheal_rules.jsonl

# 4. Supprimer les proof packs (conservatoire optionnel)
# rm -rf proof_packs/OMEGA_JOURNAL_FIX_2026-03-15_1214_773f2a89/
# rm -rf proof_packs/OMEGA_JOURNAL_RECERT_2026-03-15_1225_f38457673/
```

## Rollback partiel (recertification uniquement)

```bash
# Uniquement le patch résiduel RECERT-P2 (XP runtime grid)
git restore -- src/features/chat/ThinkingPanel.tsx

# Retirer l'entrée autoheal AH-006 uniquement
head -n 283 scripts/autoheal/autoheal_rules.jsonl > /tmp/ah_partial.jsonl
mv /tmp/ah_partial.jsonl scripts/autoheal/autoheal_rules.jsonl
```

## Vérification post-rollback

```bash
git status
wc -l scripts/autoheal/autoheal_rules.jsonl  # doit retourner 278 (rollback complet)
pnpm exec tsc --noEmit
bash scripts/verify_instructions.sh
```

## Risques

- Aucun changement Rust → pas de rollback back-end requis
- autoheal_rules.jsonl : append-only — le tronquage reste réversible localement
- Les bugs OMEGA_JOURNAL réapparaissent (état pré-session #1) après rollback complet
- Après rollback partiel : XP runtime grid redevient hardcodé +5

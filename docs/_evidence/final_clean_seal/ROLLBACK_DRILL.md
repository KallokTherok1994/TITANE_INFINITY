# ROLLBACK DRILL — FINAL CLEAN SEAL

## Objectif : prouver que le rollback est reproductible

### Commandes exactes

```bash
# 1. Annuler docs ce cycle
git restore -- README.md
git rm docs/TERMINOLOGY_ALIGNMENT_FINAL.md

# 2. Annuler la dernière entrée registry
head -n -1 registry/ui-events.jsonl > /tmp/ui-tmp.jsonl
mv /tmp/ui-tmp.jsonl registry/ui-events.jsonl

# 3. Supprimer le proof pack
git rm -r docs/_evidence/final_clean_seal/

# 4. Commit rollback
git commit -m "revert(final-seal): rollback FINAL_CLEAN_SEAL"
```

### Vérification post-rollback attendue

```bash
# Tests doivent passer (Truth Contract conservé depuis sessions précédentes)
NODE_OPTIONS='--max-old-space-size=4096 --require ./tests/polyfills/resizable-arraybuffer.cjs' \
  ./node_modules/.bin/vitest run src/__tests__/online-availability.test.ts src/__tests__/provider-decision-invariants.test.ts
# Expected: 29 passed (29), 0 failures
```

### Preuve minimale (log attendu)
```
Tests  29 passed (29)
Test Files  2 passed (2)
```

### Note de rollback sécurisé
- Le rollback de ce cycle n'affecte PAS les corrections P0 runtime (online_first_vΩ + online_final cycles) — ceux-ci resteraient en place.
- Pour rollback total, voir `ROLLBACK.md` section "Rollback complet".

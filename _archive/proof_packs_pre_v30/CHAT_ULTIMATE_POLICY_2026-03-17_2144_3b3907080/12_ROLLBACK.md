# 12_ROLLBACK

## Rollback complet — commandes exactes

```bash
# Rollback des fichiers modifiés/créés
git restore -- src/services/ai/chatEngine.ts

# Supprimer les nouveaux fichiers
rm -f src/services/ai/responsePolicy.ts
rm -f src/__tests__/responsePolicy.unit.test.ts

# Preuve de rollback
git status --porcelain
git diff --stat src/services/ai/chatEngine.ts
```

## Impact du rollback

- `chatEngine.ts` retourne à son état HEAD (3b3907080)
- `responsePolicy.ts` supprimé
- `responsePolicy.unit.test.ts` supprimé
- Aucun effet sur le runtime (le patch était additive-only dans le fallback chain)
- Aucun effet sur les E2E existants (non modifiés)

## Note régression

Le rollback restaure le comportement d'avant : modes omega/audit/brainstorming capés silencieusement à 2048 tokens au lieu de leur maxTokens configuré (4000). Ce n'est pas une régression visible en surface mais une perte de profondeur silencieuse.

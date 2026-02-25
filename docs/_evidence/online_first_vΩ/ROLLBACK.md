# ROLLBACK — ONLINE-FIRST vΩ

## Rollback complet (annule tous les changements de ce cycle)

```bash
# Restaurer les fichiers runtime modifiés
git restore -- src/types/providerMeta.ts
git restore -- src/services/conversationEngine.ts
git restore -- src/hooks/useConversationEngine.ts

# Supprimer les nouveaux fichiers
git rm src/types/providerDecisionMeta.ts
git rm src/__tests__/provider-decision-invariants.test.ts
git rm docs/_evidence/online_first_vΩ/ -r
git rm docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md

git commit -m "revert(online-first): rollback Truth Contract vΩ"
```

## Rollback partiel — uniquement le fix conversationEngine.ts

```bash
git restore -- src/services/conversationEngine.ts
```

## Rollback partiel — uniquement le guard frontend

```bash
git restore -- src/hooks/useConversationEngine.ts
```

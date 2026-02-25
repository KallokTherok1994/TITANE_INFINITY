# ROLLBACK — ONLINE-FINAL

## Rollback complet (annule tous les changements de ce cycle)

```bash
# Fichiers runtime modifiés dans cette session
git restore -- src-tauri/src/conversation_engine/commands.rs

# Fichiers ajoutés dans cette session
git rm src/__tests__/online-availability.test.ts
git rm docs/_evidence/online_final/ -r

git commit -m "revert(online-final): rollback ONLINE-FINAL cycle"
```

## Rollback session précédente (online_first_vΩ)

```bash
git restore -- src/types/providerMeta.ts
git restore -- src/services/conversationEngine.ts
git restore -- src/hooks/useConversationEngine.ts
git rm src/types/providerDecisionMeta.ts
git rm src/__tests__/provider-decision-invariants.test.ts
git rm docs/_evidence/online_first_vΩ/ -r
git rm docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md
git commit -m "revert(online-first): rollback Truth Contract vΩ"
```

## Rollback patch minimal uniquement (backend commands.rs)

```bash
git restore -- src-tauri/src/conversation_engine/commands.rs
```

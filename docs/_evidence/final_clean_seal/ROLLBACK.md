# ROLLBACK — FINAL CLEAN SEAL

## Rollback docs (ce cycle uniquement)

```bash
# Annuler la section Truth & Proof dans README
git restore -- README.md

# Supprimer la terminologie
git rm docs/TERMINOLOGY_ALIGNMENT_FINAL.md

# Supprimer le proof pack final
git rm -r docs/_evidence/final_clean_seal/

# Commit
git commit -m "revert(final-seal): rollback FINAL_CLEAN_SEAL cycle"
```

## Rollback registry (annuler FINAL_SEAL_APPLIED)

```bash
# Supprimer la dernière ligne de registry/ui-events.jsonl
head -n -1 registry/ui-events.jsonl > /tmp/ui-events-tmp.jsonl
mv /tmp/ui-events-tmp.jsonl registry/ui-events.jsonl
git add registry/ui-events.jsonl
git commit -m "revert(registry): remove FINAL_SEAL_APPLIED entry"
```

## Rollback complet (tous les cycles de cette branche)

```bash
# Revenir au commit HEAD de la branche avant les sessions Copilot
git revert --no-commit <first-copilot-commit>..HEAD
git commit -m "revert: rollback all Copilot sessions"
```

## Rollback cycle online_final uniquement

```bash
git restore -- src-tauri/src/conversation_engine/commands.rs
git rm src/__tests__/online-availability.test.ts
git rm -r docs/_evidence/online_final/
```

## Rollback cycle online_first_vΩ uniquement

```bash
git restore -- src/services/conversationEngine.ts
git restore -- src/hooks/useConversationEngine.ts
git restore -- src/types/providerMeta.ts
git rm src/types/providerDecisionMeta.ts
git rm src/__tests__/provider-decision-invariants.test.ts
git rm -r docs/_evidence/online_first_vΩ/
git rm docs/01_architecture/NETWORK_DIAGNOSTIC_ENGINE_4RING.md
```

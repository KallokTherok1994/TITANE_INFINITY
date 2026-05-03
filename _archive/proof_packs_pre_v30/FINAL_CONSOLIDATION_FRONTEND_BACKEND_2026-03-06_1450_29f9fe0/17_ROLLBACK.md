# 17 — ROLLBACK
## FINAL_CONSOLIDATION_FRONTEND_BACKEND_2026-03-06_1450_29f9fe0

---

## Rollback complet (toutes les sessions)

```bash
# Restaurer tous les fichiers modifiés dans ce PR
git restore -- src-tauri/src/main.rs
git restore -- src-tauri/capabilities/chat_ai.json
git restore -- scripts/autoheal/autoheal_rules.jsonl

# Vérifier
git status --porcelain=v1
# Doit retourner vide (sauf proof_packs/ qui sont append-only et restent)
```

## Rollback session 3 uniquement (chat_generate)

```bash
git restore -- src-tauri/capabilities/chat_ai.json
# Vérifier
grep chat_generate src-tauri/capabilities/chat_ai.json
# Doit retourner: "chat_generate",
```

## Rollback session 2 uniquement (selfheal/identity/audio)

```bash
git restore -- src-tauri/src/main.rs
# Vérifier
grep selfheal_clear_cache src-tauri/src/main.rs  # → rien
grep identity_get_matrix src-tauri/src/main.rs  # → rien
grep "audio::commands::speak" src-tauri/src/main.rs  # → rien
```

## Conditions de rollback

Effectuer un rollback uniquement si :
1. La CI échoue avec une erreur liée à nos modifications
2. Un conflit de types est détecté pour `IdentityEngineState`
3. Une regression de test est tracée à nos changements

## Note

Les proof packs sont append-only et ne sont jamais rollbackés.
Les entrées AutoHeal sont append-only et ne sont jamais rollbackées.

# ROLLBACK — FRONTEND_BACKEND_FUSION_CONTINUE_2026-03-06_1439

## Procédure de rollback

```bash
# Restaurer main.rs (annule les 23 nouvelles commandes + IdentityEngineState)
git restore -- src-tauri/src/main.rs

# Vérifier l'état
git --no-pager diff src-tauri/src/main.rs

# Note: Le proof pack et l'entrée AutoHeal sont append-only et ne sont pas annulés.
```

## Effets du rollback

- Les 14 commandes `selfheal_*` seront à nouveau non-enregistrées
- L'`IdentityEngineState` ne sera plus managé
- Les 4 commandes `identity_*` seront à nouveau non-enregistrées
- Les commandes audio (`speak`, `start_recording`, etc.) seront à nouveau non-enregistrées
- `validate_chat_message` sera à nouveau non-enregistrée

## Conditions de rollback

Effectuer ce rollback uniquement si :
1. La compilation Rust échoue (ex: conflit de types pour `IdentityEngineState`)
2. Un état managé redondant est détecté
3. La feature flag `mock` interfère avec les nouvelles commandes

## Vérification post-rollback

```bash
grep -c "selfheal_clear_cache\|identity_get_matrix\|audio::commands::speak" src-tauri/src/main.rs
# Doit retourner 0 si le rollback est correct
```

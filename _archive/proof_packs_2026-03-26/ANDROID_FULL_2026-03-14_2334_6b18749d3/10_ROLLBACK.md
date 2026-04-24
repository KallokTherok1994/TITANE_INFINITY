# 10_ROLLBACK.md

## Rollback complet de cette session

### Commandes de rollback

```bash
# Rollback des changements code
git restore -- src-tauri/src/main.rs
git restore -- src-tauri/src/commands/devops.rs

# Vérification état propre
git status

# Rollback proof pack (si nécessaire — généralement conservé append-only)
# git restore -- proof_packs/ANDROID_FULL_2026-03-14_2334_6b18749d3/
```

## Impact du rollback

- Restaure STOPLINE #4 (hardcoded path) — intentionnel si rollback requis
- Ne casse aucun build existant
- Ne touche aucune fonctionnalité utilisateur

## Rollback prérequis Android (si init effectué ultérieurement)

```bash
# Si tauri android init a été exécuté et doit être annulé
rm -rf src-tauri/android/
rm -rf src-tauri/gen/android/
git restore -- src-tauri/tauri.conf.json  # si modifié
```

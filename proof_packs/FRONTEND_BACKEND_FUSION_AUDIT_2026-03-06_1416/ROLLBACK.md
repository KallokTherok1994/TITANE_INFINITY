# ROLLBACK — FRONTEND_BACKEND_FUSION_AUDIT_2026-03-06_1416

## Procédure de rollback

```bash
# Restaurer main.rs (annule l'enregistrement des 7 commandes cp_*)
git restore -- src-tauri/src/main.rs

# Vérifier l'état
git --no-pager diff src-tauri/src/main.rs

# Note: Le proof pack est append-only et ne doit pas être supprimé.
# Pour annuler l'entrée AutoHeal : éditer scripts/autoheal/autoheal_rules.jsonl
# (NOTE: le fichier est append-only selon la constitution — ne pas supprimer les entrées)
```

## Effets du rollback

- Les 7 commandes `cp_*` seront à nouveau non-enregistrées dans le handler
- Le Control Panel (sections AI, Design, Modules) sera à nouveau non-fonctionnel
- L'entrée AutoHeal reste dans le registre (append-only)

## Conditions de rollback

Effectuer ce rollback uniquement si :
1. La compilation Rust échoue après la modification de `main.rs`
2. Des conflits de types sont détectés entre `control_panel_commands.rs` et le handler
3. Un état managé requis est manquant au runtime

## Vérification post-rollback

```bash
# Vérifier que le build compile
cargo build --manifest-path src-tauri/Cargo.toml 2>&1 | tail -20

# Vérifier que les tests architecture passent
node --experimental-vm-modules node_modules/.bin/vitest run tests/architecture/
```

## Date d'expiration

Ce rollback est valide jusqu'à la prochaine release de production.
Après release, le rollback nécessite une review complète.

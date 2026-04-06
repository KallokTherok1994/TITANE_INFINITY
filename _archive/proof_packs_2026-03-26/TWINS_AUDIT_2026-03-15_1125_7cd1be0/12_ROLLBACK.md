# 12_ROLLBACK

## Rollback complet (inverser tous les patches)

```bash
# Rollback patch P-001 + P-002 (main.rs)
git restore -- src-tauri/src/main.rs

# Rollback patch P-003 (tauri.conf.json)
git restore -- src-tauri/tauri.conf.json

# Rollback autoheal entry
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Rollback minimal (seulement enlever twin commands)

Édition manuelle de `src-tauri/src/main.rs`:
1. Supprimer la ligne `.manage(titane_infinity::numeric_twin::twin_commands::NumericTwinState::default())`
2. Supprimer le bloc `// NUMERIC TWIN COMMANDS` dans generate_handler![]

Édition manuelle de `src-tauri/tauri.conf.json`:
1. Supprimer les 8 entrées `twin_*` de l'array `allow`

## Vérification rollback
```bash
cargo check --manifest-path=src-tauri/Cargo.toml
# Must succeed (EXIT 0) — le module numeric_twin reste déclaré dans lib.rs
# mais les commandes ne sont plus accessibles depuis le frontend
```

## Impact rollback
- Régression: les 8 commandes twin_* redeviennent inaccessibles depuis le frontend
- Aucune autre fonctionnalité affectée (patches purement additifs)

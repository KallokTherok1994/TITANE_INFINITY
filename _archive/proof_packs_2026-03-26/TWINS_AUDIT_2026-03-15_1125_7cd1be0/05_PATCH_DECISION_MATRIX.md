# 05_PATCH_DECISION_MATRIX

| PATCH_ID | Finding | Root Cause Confirmed | Safe to Apply | Décision |
|---|---|---|---|---|
| P-001 | F-001: handlers manquants dans generate_handler![] | OUI | OUI | APPLIQUÉ |
| P-002 | F-002: NumericTwinState non managé | OUI | OUI | APPLIQUÉ |
| P-003 | F-003: allow list absente | OUI | OUI | APPLIQUÉ |
| P-004 | F-004: pas de page/route | OUI | NON — hors scope minimal | NON APPLIQUÉ |
| P-005 | F-005: export type syntax | OUI | NON — valide en TS, cosmétique | NON APPLIQUÉ |

## Détail des patches appliqués

### P-001 (RC-001) — generate_handler![] registration
Fichier: `src-tauri/src/main.rs`
Localisation: avant `secure_commands::validate_chat_message`
Ajout:
```rust
titane_infinity::numeric_twin::twin_commands::twin_get_state,
titane_infinity::numeric_twin::twin_commands::twin_get_fusion_index,
titane_infinity::numeric_twin::twin_commands::twin_submit_observation,
titane_infinity::numeric_twin::twin_commands::twin_apply_evolution,
titane_infinity::numeric_twin::twin_commands::twin_validate_sync,
titane_infinity::numeric_twin::twin_commands::twin_get_evolution_profile,
titane_infinity::numeric_twin::twin_commands::twin_get_identity,
titane_infinity::numeric_twin::twin_commands::twin_recalculate_fusion,
```

### P-002 (RC-002) — NumericTwinState manage
Fichier: `src-tauri/src/main.rs`
Localisation: après `let builder = builder.manage(ExpFusionState::new());`
Ajout:
```rust
let builder = builder.manage(titane_infinity::numeric_twin::twin_commands::NumericTwinState::default());
```

### P-003 (RC-003) — tauri.conf.json allow list
Fichier: `src-tauri/tauri.conf.json`
8 entrées ajoutées à `app.security.capabilities[0].allow[]`:
twin_get_state, twin_get_fusion_index, twin_submit_observation, twin_apply_evolution,
twin_validate_sync, twin_get_evolution_profile, twin_get_identity, twin_recalculate_fusion

## Justification "faux positifs" rejetés
- F-005: `export type { default as TwinEvolutionPanelType }` est syntaxe TypeScript valide avec `isolatedModules`. Patch cosmétique refusé (Rule 1: minimal patch).

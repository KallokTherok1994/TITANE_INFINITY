# 11_DIFF_FILES

## Patches intégrés dans HEAD (7cd1be0 + session courante)

### src-tauri/src/main.rs — Patch P-001 + P-002

```diff
+    // NUMERIC TWIN ENGINE — TWINS_AUDIT 2026-03-15 (RC-002 fix)
+    let builder = builder.manage(titane_infinity::numeric_twin::twin_commands::NumericTwinState::default());

...

+            // ═══════════════════════════════════════════════════════════════
+            // NUMERIC TWIN COMMANDS — TWINS_AUDIT 2026-03-15 (RC-001 fix)
+            // twin_* IPC suite — requires NumericTwinState managed above
+            // ═══════════════════════════════════════════════════════════════
+            titane_infinity::numeric_twin::twin_commands::twin_get_state,
+            titane_infinity::numeric_twin::twin_commands::twin_get_fusion_index,
+            titane_infinity::numeric_twin::twin_commands::twin_submit_observation,
+            titane_infinity::numeric_twin::twin_commands::twin_apply_evolution,
+            titane_infinity::numeric_twin::twin_commands::twin_validate_sync,
+            titane_infinity::numeric_twin::twin_commands::twin_get_evolution_profile,
+            titane_infinity::numeric_twin::twin_commands::twin_get_identity,
+            titane_infinity::numeric_twin::twin_commands::twin_recalculate_fusion,
```

### src-tauri/tauri.conf.json — Patch P-003 (8 entrées added)

```diff
+    {"command": "twin_get_state"},
+    {"command": "twin_get_fusion_index"},
+    {"command": "twin_submit_observation"},
+    {"command": "twin_apply_evolution"},
+    {"command": "twin_validate_sync"},
+    {"command": "twin_get_evolution_profile"},
+    {"command": "twin_get_identity"},
+    {"command": "twin_recalculate_fusion"},
```

### scripts/autoheal/autoheal_rules.jsonl — AutoHeal entry

AH-2026-03-15-TWINS-001 ajoutée (mise à jour prevention_test dans session courante).

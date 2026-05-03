# AUDIT COMMANDES TAURI — VÉRITÉ FRONTEND vs BACKEND
## Surface A : Enregistrement des commandes

---

## Méthodologie

```bash
# Backend : extraction des fonctions #[tauri::command]
grep -r '#\[tauri::command\]' src-tauri/src/ --include="*.rs" -A1 \
  | grep 'pub async fn\|pub fn' \
  | sed 's/.*pub async fn //;s/.*pub fn //' | sed 's/(.*//' \
  | sort -u > /tmp/backend_commands_unique.txt

# Frontend : extraction des valeurs de chaîne dans tauriCommands.ts
grep -oE "'[a-z_]+'" src/lib/tauriCommands.ts | tr -d "'" \
  | sort -u > /tmp/frontend_commands.txt

# Commandes enregistrées : extract depuis generate_handler! dans main.rs
grep -A2000 "generate_handler\!" src-tauri/src/main.rs \
  | grep -v "^[[:space:]]*//" \
  | grep -oE '[a-z][a-z_]+[a-z],' | sed 's/,$//' \
  | sort -u > /tmp/registered_final.txt
```

---

## Résultats quantitatifs

| Périmètre | Nombre |
|-----------|--------|
| Fonctions `#[tauri::command]` dans les fichiers Rust | **1138** |
| Commandes déclarées dans `tauriCommands.ts` | **469** |
| Commandes enregistrées dans `generate_handler!` | **386** |
| Commandes frontend absentes du handler | **297** |
| Commandes backend (fichiers) absentes du frontend | **809** |

---

## P1 — Commandes du Control Panel utilisées en production mais non enregistrées

### Preuve d'utilisation frontend

```
src/ui/pages/ControlPanel/sections/AISection.tsx
  → tauriClient.cpGetAiConfig()       // cp_get_ai_config
  → tauriClient.cpSetAiConfig(...)    // cp_set_ai_config

src/ui/pages/ControlPanel/sections/ModulesSection.tsx
  → tauriClient.cpToggleModule(...)   // cp_toggle_module

src/ui/pages/ControlPanel/sections/AppearanceSection.tsx
  → tauriClient.cpSetDesignConfig(...)  // cp_set_design_config

src/components/ChatDiagnostic.tsx
  → safeInvoke('cp_get_ai_config')    // cp_get_ai_config
```

### Commandes concernées

| Commande | Implémentée dans | Enregistrée dans handler | Managed State requis |
|----------|-----------------|--------------------------|----------------------|
| `cp_get_ai_config` | `control_panel_commands.rs` | ❌ NON | `SecureSecretsEngine` ✅ managé |
| `cp_set_ai_config` | `control_panel_commands.rs` | ❌ NON | `SecureSecretsEngine` + `ChatOrchestratorState` ✅ managés |
| `cp_get_design_config` | `control_panel_commands.rs` | ❌ NON | Aucun |
| `cp_set_design_config` | `control_panel_commands.rs` | ❌ NON | Aucun |
| `cp_get_modules_status` | `control_panel_commands.rs` | ❌ NON | Aucun |
| `cp_toggle_module` | `control_panel_commands.rs` | ❌ NON | Aucun |
| `cp_check_for_updates` | `control_panel_commands.rs` | ❌ NON | Aucun |

### Cause racine

`control_panel_commands.rs` est déclaré dans `lib.rs` :
```rust
pub mod control_panel_commands; // ✅ Control Panel
```

Il est référencé dans `handlers.rs` (macro `generate_titane_handlers!`) **qui n'est jamais appelée**. 
Les commandes ne sont donc **pas incluses** dans le `generate_handler!` de `main.rs`.

### Correction appliquée

Ajout dans `src-tauri/src/main.rs` :
```rust
// Control Panel Commands (v27 FIX - 7 commandes)
titane_infinity::control_panel_commands::cp_get_ai_config,
titane_infinity::control_panel_commands::cp_set_ai_config,
titane_infinity::control_panel_commands::cp_get_design_config,
titane_infinity::control_panel_commands::cp_set_design_config,
titane_infinity::control_panel_commands::cp_get_modules_status,
titane_infinity::control_panel_commands::cp_toggle_module,
titane_infinity::control_panel_commands::cp_check_for_updates,
```

---

## P2 — Commandes frontend déclarées mais non enregistrées (dette connue)

Les tests existants tolèrent un seuil de 250 noms incohérents et 520 commandes orphelines.
La dette de 297 commandes non-enregistrées rentre dans ce budget toléré.

### Catégories principales de la dette

| Catégorie | Exemples | Raison probable |
|-----------|---------|-----------------|
| Cloud sync | `cloud_*` (14 cmds) | Fonctionnalité non implémentée |
| Evolution | `evolution_*`, `hyper_*` | Module expérimental non activé |
| DevMode Engines | `engines_devmode_*` (12 cmds) | Developer Mode stub |
| Autonomy | `autonomy_*` (5 cmds) | Référencé dans self_heal.json mais non enregistré |
| QA extra | `qa_create_monitor`, `qa_delete_monitor`, etc. | Subset non exposé du module QA |
| Memory advanced | `memory_cluster`, `memory_grow`, etc. | API interne non exposée |

---

## Commandes OMEGA v2 — PASS

| Commande | Statut |
|----------|--------|
| `conversation_generate` | ✅ Enregistré + validé dans contract tests |
| `create_new_conversation` | ✅ Enregistré |
| `conversation_health_check` | ✅ Enregistré |
| `conversation_memory_stats` | ✅ Enregistré |

---

## PROGRESSION_STATUS

- STEP 1/7 — PASS
- CURRENT_GATE: G_COMMANDS_TRUTH
- STATUS: **PASS (P1 corrigé, P2 documenté)**

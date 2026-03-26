# AUDIT ROUTES / FEATURES — VÉRITÉ DES FONCTIONNALITÉS UI
## Surface D : Features UI vs Capacités backend réelles

---

## Méthodologie

Analyse des pages UI et de leurs dépendances backend pour identifier :
- Les features UI qui appellent des commandes non enregistrées
- Les features UI qui présentent des fonctionnalités comme actives alors qu'elles sont stubs

---

## Features ACTIVES et FONCTIONNELLES (PASS)

### 1. Chat IA OMEGA v2

- **Page** : `src/ui/pages/Chat/`
- **Commandes** : `conversation_generate`, `create_new_conversation`, `chat_get_providers_status`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

### 2. TTS / Voice Pipeline

- **Page** : `src/ui/pages/Voice/`  
- **Commandes** : `tts_speak`, `tts_stop`, `voice_start_listening`, `voice_stop_listening`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

### 3. Singularity State

- **Page** : `src/ui/pages/Singularity/`
- **Commandes** : `singularity_get_state`, `singularity_get_full_state`, `singularity_update_*`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

### 4. Avatar Engine

- **Commandes** : `avatar_get_state`, `avatar_prepare_speech`, `avatar_finish_speech`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

### 5. Persistence System

- **Commandes** : `titan_persistence_init`, `titan_persist_event`, `titan_force_snapshot`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

### 6. Auth OS

- **Commandes** : `auth_get_status`, `auth_generate_dev_token`, `auth_validate_dev_token`
- **État** : Toutes enregistrées ✅
- **Verdict** : PASS

---

## Control Panel — CORRIGÉ (P1 → PASS)

### Avant correction

Les sections suivantes du Control Panel étaient non-fonctionnelles au runtime :
- **AISection** : `cp_get_ai_config`, `cp_set_ai_config` → IPC error
- **AppearanceSection** : `cp_set_design_config` → IPC error
- **ModulesSection** : `cp_toggle_module` → IPC error

Ces pages affichaient des éléments UI actifs (formulaires, boutons) mais les commandes 
IPC échouaient systématiquement → violation du principe **anti-silence**.

### Après correction

7 commandes `control_panel_commands` enregistrées → fonctionnalité rétablie.

---

## Features STUBS / NON IMPLÉMENTÉES (P2 — documenté)

Ces features sont déclarées dans `tauriCommands.ts` mais non enregistrées.
Elles doivent être présentées comme **experimentales ou désactivées** dans l'UI.

| Feature | Commandes frontend | Statut backend |
|---------|-------------------|----------------|
| Cloud Sync | `cloud_init`, `cloud_sync_push/pull`, etc. | NON IMPLÉMENTÉ |
| Evolution System | `evolution_save_state`, `evolution_run_cycle` | NON ENREGISTRÉ |
| Hyper Intelligence | `hyper_*` (11 commandes) | NON ENREGISTRÉ |
| DevMode Engines | `engines_devmode_*` (12 commandes) | Stub — allowlisté mais non enregistré |
| Camera | `camera_start` | NON IMPLÉMENTÉ |
| Execute Shell | `execute_shell_command` | NON ENREGISTRÉ (sécurité: normal) |

**Note** : Ces commandes non-enregistrées ne constituent pas une violation de sécurité —
un appel frontend vers une commande non enregistrée est simplement rejeté par Tauri.
Le frontend doit cependant indiquer clairement que ces features sont indisponibles.

---

## Commandes dangereuses — PASS

La constitution interdit l'enregistrement de commandes dangereuses :
- `exec_shell` → non enregistré ✅
- `run_system_command` → non enregistré ✅  
- `delete_filesystem` → non enregistré ✅
- `access_network` → non enregistré ✅
- `execute_shell_command` (frontend) → non enregistré ✅

**Verdict : PASS — deny-by-default respecté**

---

## Commande legacy retirée (PASS)

```
// [RETRAIT v27.0.5-prod] Legacy chat command removed (use conversation_generate)
```

La commande `chat_send_message` est commentée et absente du handler.
Elle n'est pas non plus dans `tauriCommands.ts`. **Migration OMEGA v2 complète.**

**Verdict : PASS**

---

## Tableau de vérité features

| Page/Feature | Commandes clés | Registered | Verdict |
|-------------|---------------|------------|---------|
| Chat OMEGA | `conversation_generate` | ✅ | PASS |
| TTS/Voice | `tts_speak`, `voice_*` | ✅ | PASS |
| Avatar | `avatar_get_state`, `avatar_*` | ✅ | PASS |
| Control Panel AI | `cp_get_ai_config` | ✅ (corrigé) | PASS |
| Control Panel Design | `cp_get_design_config` | ✅ (corrigé) | PASS |
| Control Panel Modules | `cp_get_modules_status` | ✅ (corrigé) | PASS |
| Cloud Sync | `cloud_*` | ❌ | P2 (stub, non exposé) |
| Evolution | `evolution_*` | ❌ | P2 (expérimental) |
| Onboarding | `complete_onboarding`, `is_onboarding_complete` | ✅ | PASS |
| Persistence | `titan_*` | ✅ | PASS |
| Singularity | `singularity_*` | ✅ | PASS |
| Auth | `auth_*` | ✅ | PASS |

**GATE G_FEATURES_ROUTES_TRUTH : PASS (P1 corrigé, P2 documenté)**

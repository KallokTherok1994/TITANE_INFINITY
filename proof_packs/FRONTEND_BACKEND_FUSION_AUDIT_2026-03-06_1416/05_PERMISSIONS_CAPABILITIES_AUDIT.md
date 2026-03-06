# AUDIT PERMISSIONS / CAPABILITIES — SURFACE DE SÉCURITÉ
## Surface E : Allowlists vs Commandes enregistrées

---

## Méthodologie

Comparaison des fichiers de capabilities Tauri v2 avec les commandes réellement enregistrées 
dans `generate_handler!` de `main.rs`.

---

## Fichiers de capabilities analysés

| Fichier | Identifiant | Commandes allowlistées |
|---------|-------------|----------------------|
| `chat_ai.json` | `chat-ai` | 13 commandes |
| `audio_tts.json` | `audio-tts` | 39 commandes |
| `self_heal.json` | `self-heal` | 30 commandes |
| `singularity.json` | `singularity` | 25 commandes |
| `persistence.json` | `persistence` | 27 commandes |
| `developer_mode.json` | `developer-mode` | 12 commandes |

---

## chat_ai.json — Analyse

Commandes allowlistées :
```json
["chat_generate", "chat_stream_message", "chat_create_conversation",
 "chat_get_conversation", "chat_delete_conversation", "conversation_generate",
 "chat_get_providers_status", "chat_set_gemini_key", "chat_check_providers",
 "ai_query", "cp_get_ai_config", "cp_set_ai_config", "validate_chat_message"]
```

| Commande | Enregistrée | Remarque |
|----------|-------------|----------|
| `chat_stream_message` | ✅ | |
| `conversation_generate` | ✅ | OMEGA v2 |
| `chat_get_providers_status` | ✅ | |
| `chat_set_gemini_key` | ✅ | |
| `chat_check_providers` | ✅ | |
| `cp_get_ai_config` | ✅ (corrigé) | P1 corrigé |
| `cp_set_ai_config` | ✅ (corrigé) | P1 corrigé |
| `chat_generate` | ❌ | Alias legacy non enregistré |
| `ai_query` | ❌ | Non enregistré dans handler principal |
| `validate_chat_message` | ❌ | Non implémenté/enregistré |

**Note** : `chat_generate` est un alias de `chat_generate_gemini/openai/claude` — 
la commande générique n'existe pas. Risque P2 : si le frontend appelle `chat_generate` 
génériquement, l'appel échoue.

---

## self_heal.json — Analyse

```json
["autonomy_ping", "autonomy_log_report", "autonomy_fix_tts_sync",
 "autonomy_resync_singularity_state", "autonomy_clean_memory", ...]
```

| Commande | Enregistrée | Remarque |
|----------|-------------|----------|
| `get_system_health` | ✅ | |
| `memory_repair` | ✅ | |
| `system_optimize` | ✅ | |
| `check_system_integrity` | ✅ | |
| `autofix_*` (8 cmds) | ✅ | |
| `autonomy_ping` | ❌ | Non enregistré |
| `autonomy_log_report` | ❌ | Non enregistré |
| `autonomy_fix_tts_sync` | ❌ | Non enregistré |
| `autonomy_resync_singularity_state` | ❌ | Non enregistré |
| `autonomy_clean_memory` | ❌ | Non enregistré |

**Verdict** : Les commandes `autonomy_*` sont dans l'allowlist mais pas dans le handler.
Sévérité P2 : ces commandes, si appelées, échoueront proprement (rejetées par Tauri).
Le risque est l'affichage d'une erreur UI non contextualisée.

---

## singularity.json — Analyse

Commandes allowlistées non enregistrées :
- `singularity_get` (alias simplifié → non enregistré)
- `singularity_set`, `singularity_diff`, `singularity_hash`
- `singularity_sync`, `singularity_meta`, `singularity_integrity`
- `singularity_repair`, `singularity_export_json`, `singularity_snapshot`
- `singularity_selftest_full`
- `toggle_singularity`

Enregistrées :
- `singularity_get_full_state` ✅
- `singularity_get_state` ✅ (via `state_bridge_commands`)
- `singularity_update_*` ✅
- `singularity_save_state`, `singularity_load_state` ✅

**Verdict** : Les commandes génériques (`singularity_get`) sont dans l'allowlist
mais le backend expose des commandes typées (`singularity_get_full_state`).
Risque P2 : désynchronisation frontend ↔ backend si le frontend utilise les noms courts.

---

## developer_mode.json — Analyse

Toutes les commandes `engines_devmode_*` sont dans l'allowlist mais **aucune n'est enregistrée** 
dans `generate_handler!`. Ces commandes font partie de la dette P2 documentée dans l'audit #1.

**Verdict** : P2 — fonctionnalité stub non implémentée.

---

## Résumé de sécurité

### Deny-by-default — PASS

Aucune commande dangereuse n'est dans une allowlist :
- `exec_shell` : absent ✅
- `delete_filesystem` : absent ✅
- `access_network` direct : absent ✅

### Surface réseau — PASS

Seules les URLs gouvernées sont dans les `remote.urls` :
- `chat_ai.json` : `https://generativelanguage.googleapis.com/**`, `http://localhost:11434/**`
- Aucun wildcard global `*` ✅

### Déclaration de capabilities dans tauri.conf.json

Les capabilities sont correctement référencées dans `app.security.capabilities`.

---

## Tableau récapitulatif

| Capability | Commandes manquantes dans handler | Sévérité |
|------------|----------------------------------|---------|
| chat_ai | `chat_generate`, `ai_query`, `validate_chat_message` | P2 |
| self_heal | `autonomy_*` (5 commandes) | P2 |
| singularity | Aliases courts non enregistrés | P2 |
| developer_mode | Toutes `engines_devmode_*` | P2 |
| audio_tts | Alignement quasi-complet | PASS |
| persistence | Alignement complet | PASS |

**GATE G_PERMISSIONS_CAPABILITIES : PASS (P1 corrigé, P2 documenté, deny-by-default respecté)**

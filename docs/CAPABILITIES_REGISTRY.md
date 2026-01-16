# CAPABILITIES_REGISTRY

**PHASE_5 BLOC D — Registre des capacités TITANE∞**

Version: 1.0.0  
Date: 2026-01-15  
Status: SEALED

---

## Table des matières

1. [Objectif](#objectif)
2. [Structure du registre](#structure-du-registre)
3. [Couche STABLE](#couche-stable)
4. [Couche DEV (hors production)](#couche-dev)
5. [Statuts](#statuts)
6. [Références](#références)
7. [Maintenance](#maintenance)

---

## Objectif

Ce registre liste **toutes les capacités exposées** par TITANE∞ :

- **Commands Tauri** (couche stable vs dev)
- **Permissions associées** (filesystem, memory, network, etc.)
- **Status** : experimental / qualified / stable
- **Preuves** : tests contractuels, CI gates, documentation

**Toute command ajoutée à `allowlist.whitelist.stable.json` DOIT:**
1. Être enregistrée ici (section [Couche STABLE](#couche-stable))
2. Avoir documentation surface mise à jour (`docs/API_SURFACE.md` ou équivalent)
3. Avoir tests contractuels (`tests/contract/tauri.contract.test.ts` ou équivalent)

Le **CI drift check** (`scripts/ci/check-capabilities-drift.sh`) échoue si une de ces 3 conditions n'est pas remplie.

---

## Structure du registre

Chaque command est documentée avec:

```yaml
command: <nom>
  status: experimental | qualified | stable
  permissions: [filesystem, memory, network, ...]
  layer: stable | dev
  contract_test: <chemin relatif test>
  doc_ref: <chemin relatif doc>
  added: <version>
  notes: <description courte>
```

---

## Couche STABLE

**Total commands stable**: 53 (au 2026-01-15)

### Runtime & Configuration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `get_runtime_config` | stable | memory | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.0.0 | Config runtime initiale |
| `get_system_info` | stable | system | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.0.0 | Informations système |
| `get_system_health` | stable | system | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.3.0 | Santé système (PHASE_5) |

### Onboarding

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `is_onboarding_complete` | stable | memory | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | Check état onboarding |
| `complete_onboarding` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | Marque onboarding complété |
| `get_onboarding_preferences` | stable | memory | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | Récupère préférences utilisateur |

### Helios (State principal)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `get_helios_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/HELIOS_STATE.md | v26.2.0 | État Helios unifié |

### Memory & Persistence

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `get_memory_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | État memory core (ancien) |
| `memory_get_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | Alias get_memory_state |
| `write_snapshot` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | Sauvegarde snapshot |
| `read_snapshot` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | Lecture snapshot |

### Timeline & Projects

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `add_timeline_event` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/TIMELINE.md | v26.0.0 | Ajoute événement timeline |
| `get_timeline` | stable | memory | tests/contract/tauri.contract.test.ts | docs/TIMELINE.md | v26.0.0 | Récupère timeline complète |
| `get_active_projects` | stable | memory | tests/contract/tauri.contract.test.ts | docs/PROJECTS.md | v26.0.0 | Projets actifs utilisateur |
| `get_recent_decisions` | stable | memory | tests/contract/tauri.contract.test.ts | docs/DECISIONS.md | v26.0.0 | Décisions récentes |
| `get_knowledge` | stable | memory | tests/contract/tauri.contract.test.ts | docs/KNOWLEDGE.md | v26.0.0 | Base connaissances |
| `get_active_rituals` | stable | memory | tests/contract/tauri.contract.test.ts | docs/RITUALS.md | v26.0.0 | Rituels actifs |

### Chat & AI Integration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `save_chat_interaction` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.0.0 | Sauvegarde historique chat |
| `chat_generate` | stable | network, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.1.0 | Génération chat (Ollama) |
| `chat_stream_message` | stable | network, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.1.0 | Streaming chat |
| `cp_get_ai_config` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AI_CONFIG.md | v26.1.0 | Config AI (Control Panel) |
| `cp_set_ai_config` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/AI_CONFIG.md | v26.1.0 | Set config AI |

### File Management

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `memory_ingest_file` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | Ingestion fichiers memory |
| `import_file` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | Import fichier utilisateur |
| `upload_and_process_file` | stable | filesystem, network, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | Upload + traitement |
| `file_analyze` | stable | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.1.0 | Analyse fichier |

### Orchestration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `orchestration_get_cognitive_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/ORCHESTRATION.md | v26.2.0 | État cognitif orchestrateur |
| `orchestration_get_unified_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/ORCHESTRATION.md | v26.2.0 | État unifié orchestrateur |

### Singularity (État complexe)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `get_singularity_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | État Singularity unifié |
| `singularity_get` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Lecture valeur Singularity |
| `singularity_set` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Écriture valeur Singularity |
| `singularity_sync` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Synchronisation état |
| `sync_singularity` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Alias sync |
| `singularity_get_adaptive` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Composante adaptative |
| `singularity_get_cognitive` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Composante cognitive |
| `singularity_get_physical` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Composante physique |
| `singularity_get_symbolic` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Composante symbolique |
| `singularity_get_meta` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Métadonnées |
| `singularity_get_full_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | État complet |
| `singularity_get_global_coherence` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Cohérence globale |
| `singularity_is_critical` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Check état critique |
| `singularity_export_json` | stable | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | Export JSON complet |

### Experience & Avatar

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `experience_get_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/EXPERIENCE.md | v26.2.0 | État expérience utilisateur |
| `experience_update_state` | stable | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/EXPERIENCE.md | v26.2.0 | Mise à jour expérience |
| `avatar_get_expression` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | Expression avatar actuelle |
| `fullbody_get_state` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | État fullbody avatar |
| `fullbody_init` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | Init fullbody |
| `fullbody_update_expression` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | Update expression |
| `fullbody_update_pose` | stable | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | Update pose |

### TTS (Text-to-Speech)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `tts_speak_parler` | stable | network, audio | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | TTS avec Parler |
| `tts_get_status` | stable | memory | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | Status TTS |
| `tts_is_speaking` | stable | memory | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | Check TTS actif |
| `tts_stop` | stable | memory, audio | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | Arrêt TTS |

---

## Couche DEV

**Commands disponibles uniquement en mode développement** (non incluses dans allowlist.whitelist.stable.json).

| Command | Status | Permissions | Contract Test | Doc Ref | Notes |
|---------|--------|-------------|---------------|---------|-------|
| `debug_memory_dump` | experimental | filesystem, memory | tests/dev/debug.test.ts | docs/DEBUG.md | Dump mémoire complète |
| `debug_reset_all_state` | experimental | filesystem, memory | tests/dev/debug.test.ts | docs/DEBUG.md | Reset complet (dangereux) |
| `dev_reload_config` | experimental | filesystem | tests/dev/config.test.ts | docs/DEBUG.md | Reload config sans restart |

**Note**: Ces commands ne sont **jamais** exposées en production (stable build).

---

## Statuts

| Status | Description | Critères |
|--------|-------------|----------|
| **experimental** | Command en développement, peut changer | - Pas de garantie API<br>- Tests unitaires seulement<br>- Non documentée publiquement |
| **qualified** | Command testée, API gelée, non critique | - Tests contractuels PASS<br>- Documentation complète<br>- Pas encore en production |
| **stable** | Command production-ready, garantie | - Dans allowlist stable<br>- Tests contractuels + CI gates<br>- Documentation scellée<br>- Backward compatibility garantie |

**Toute command en status `stable` DOIT être dans allowlist.whitelist.stable.json**.

---

## Références

- **Allowlist stable**: `src-tauri/allowlist.whitelist.stable.json`
- **Tests contractuels**: `tests/contract/tauri.contract.test.ts`
- **Documentation API**: `docs/API_SURFACE.md`
- **CI drift check**: `scripts/ci/check-capabilities-drift.sh`
- **Workflow CI**: `.github/workflows/constitution-audit.yml` ou équivalent

---

## Maintenance

### Ajouter une nouvelle command stable

1. **Implémenter la command** dans `src-tauri/src/commands/`
2. **Ajouter à allowlist stable**: `src-tauri/allowlist.whitelist.stable.json`
3. **Ajouter au registre**: Ce fichier (section [Couche STABLE](#couche-stable))
4. **Documenter**: `docs/API_SURFACE.md` (ou doc spécifique)
5. **Tests contractuels**: `tests/contract/tauri.contract.test.ts`
6. **CI validation**: Lancer `scripts/ci/check-capabilities-drift.sh`

**Le CI drift check échoue si steps 3, 4, ou 5 sont oubliés**.

### Retirer une command stable

**⚠️ INTERDIT** sans processus de dépréciation (backward compatibility).

Si absolument nécessaire:
1. Marquer `@deprecated` dans code + doc (≥ 2 versions)
2. Ajouter warning runtime
3. Retirer après 6 mois minimum
4. Bumper version majeure

### Changer status command

**experimental → qualified**:
- Ajouter tests contractuels
- Documenter API complètement
- Geler signature

**qualified → stable**:
- Ajouter à allowlist stable
- Mettre à jour ce registre
- Valider CI drift check

---

**SCELLÉ** : PHASE_5 BLOC D (2026-01-15)  
**Mainteneur** : Kevin Thibault (TITANE∞)  
**Prochaine révision** : À chaque ajout command stable

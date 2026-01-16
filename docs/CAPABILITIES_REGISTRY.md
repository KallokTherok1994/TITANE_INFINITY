# CAPABILITIES_REGISTRY

**PHASE_6 ÉVOLUTIF — Registre des capacités TITANE∞**

Version: 2.0.0  
Date: 2026-01-15  
Status: ÉVOLUTIF (PHASE 6)

---

## Table des matières

1. [Objectif](#objectif)
2. [Lifecycle PHASE 6](#lifecycle-phase-6)
3. [Structure du registre](#structure-du-registre)
4. [Dashboard par statut](#dashboard-par-statut)
5. [Couche STABLE](#couche-stable)
6. [Couche DEV (hors production)](#couche-dev)
7. [Statuts](#statuts)
8. [Références](#références)
9. [Maintenance](#maintenance)

---

## Objectif

Ce registre liste **toutes les capacités exposées** par TITANE∞ avec leur statut dans le **lifecycle PHASE 6** :

- **Commands Tauri** (couche stable vs dev)
- **Permissions associées** (filesystem, memory, network, etc.)
- **Status** : EXPERIMENTAL → QUALIFIED → STABLE → DEPRECATED → REMOVED
- **Preuves** : tests contractuels, CI gates, documentation

**Toute command ajoutée à `allowlist.whitelist.stable.json` DOIT:**
1. Être enregistrée ici (section [Couche STABLE](#couche-stable))
2. Avoir documentation surface mise à jour (`docs/API_SURFACE.md` ou équivalent)
3. Avoir tests contractuels (`tests/contract/tauri.contract.test.ts` ou équivalent)
4. **NOUVEAU PHASE 6**: Respecter le lifecycle avec checklist qualification complète

Le **CI drift check** (`scripts/ci/check-capabilities-drift.sh`) échoue si une de ces conditions n'est pas remplie.
Le **promotion gate** (`scripts/ci/check-promotion-stable.sh`) bloque les promotions non-qualifiées.

---

## Lifecycle PHASE 6

**Évolution consciente des capacités** avec gates obligatoires :

```
EXPERIMENTAL ──→ QUALIFIED ──→ STABLE ──→ DEPRECATED ──→ REMOVED
      ▲              ▲            ▲           ▲
      │              │            │           │
   Dev-only      API frozen   Production   Marked for  
   API change     Tests 90%    ready       removal
   allowed        CI PASS      Compat      (6mo min)
                  Review OK    required    
```

### Statuts détaillés

- **EXPERIMENTAL**: Dev uniquement, API peut changer, surface instable
- **QUALIFIED**: API figée, tests 90%+, CI PASS, review technique OK
- **STABLE**: Production-ready, rétrocompatibilité requise, docs complètes
- **DEPRECATED**: Marqué obsolète, migration path documentée, 6 mois minimum
- **REMOVED**: Retiré du système, traces archivées

### Gates automatisés

- **QUALIFIED → STABLE**: `scripts/ci/check-promotion-stable.sh` (checklist 11 items)
- **CI validation**: `.github/workflows/capability-qualification.yml` (5 jobs)
- **Drift prevention**: Alignment registry obligatoire

---

## Dashboard par statut

**Répartition des capabilities** par statut PHASE 6 (au 2026-01-15):

| Statut | Count | Détail |
|--------|-------|--------|
| **STABLE** | 53 | Commands production-ready avec rétrocompatibilité |
| **QUALIFIED** | 0 | Commands avec API figée, tests complets, prêts pour STABLE |
| **EXPERIMENTAL** | 2 | Commands en développement, API instable |
| **DEPRECATED** | 0 | Commands marqués obsolètes, migration path définie |
| **REMOVED** | 0 | Commands retirés (archives seulement) |

### Évolution tracking

| Version | STABLE | QUALIFIED | EXPERIMENTAL | DEPRECATED | Notes |
|---------|--------|-----------|-------------|------------|-------|
| v26.3.0 | 53 | 0 | 0 | 0 | État initial PHASE 6 (migration depuis PHASE 5) |
| v26.3.0+ | 53 | 0 | 2 | 0 | Première capability PHASE 6: memory-core-encryption |

**Migration PHASE 5 → PHASE 6**: Toutes les capabilities PHASE 5 "stable" sont automatiquement promues **STABLE** PHASE 6 avec grandfathering (pas de re-qualification requise).

---

## Structure du registre

Chaque command est documentée avec:

```yaml
command: <nom>
  status: EXPERIMENTAL | QUALIFIED | STABLE | DEPRECATED | REMOVED
  permissions: [filesystem, memory, network, ...]
  layer: stable | dev
  contract_test: <chemin relatif test>
  doc_ref: <chemin relatif doc>
  added: <version>
  qualified_at: <version> (si QUALIFIED+)
  stable_at: <version> (si STABLE+)
  deprecated_at: <version> (si DEPRECATED+)
  notes: <description courte>
  phase6_migration: <true si grandfathered depuis PHASE 5>
```

---

## Couche STABLE

**Total commands stable**: 53 (au 2026-01-15) - **Grandfathered PHASE 5 → PHASE 6**

*Note: Toutes les commands ci-dessous ont été automatiquement promues **STABLE** lors de la migration PHASE 5 → PHASE 6 avec grandfathering. Aucune re-qualification requise.*

### Runtime & Configuration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `get_runtime_config` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.0.0 | v26.3.0 | Config runtime initiale (P5→P6) |
| `get_system_info` | **STABLE** | system | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.0.0 | v26.3.0 | Informations système (P5→P6) |
| `get_system_health` | **STABLE** | system | tests/contract/tauri.contract.test.ts | docs/API_SURFACE.md | v26.3.0 | v26.3.0 | Santé système PHASE_5 (P5→P6) |

### Onboarding

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `is_onboarding_complete` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | v26.3.0 | Check état onboarding (P5→P6) |
| `complete_onboarding` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | v26.3.0 | Marque onboarding complété (P5→P6) |
| `get_onboarding_preferences` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/ONBOARDING.md | v26.0.0 | v26.3.0 | Récupère préférences utilisateur (P5→P6) |

### Helios (State principal)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `get_helios_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/HELIOS_STATE.md | v26.2.0 | v26.3.0 | État Helios unifié (P5→P6) |

### Memory & Persistence

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `get_memory_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | v26.3.0 | État memory core ancien (P5→P6) |
| `memory_get_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | v26.3.0 | Alias get_memory_state (P5→P6) |
| `write_snapshot` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | v26.3.0 | Sauvegarde snapshot (P5→P6) |
| `read_snapshot` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/MEMORY_CORE.md | v26.0.0 | v26.3.0 | Lecture snapshot (P5→P6) |

### Timeline & Projects

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `add_timeline_event` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/TIMELINE.md | v26.0.0 | v26.3.0 | Ajoute événement timeline (P5→P6) |
| `get_timeline` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/TIMELINE.md | v26.0.0 | v26.3.0 | Récupère timeline complète (P5→P6) |
| `get_active_projects` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/PROJECTS.md | v26.0.0 | v26.3.0 | Projets actifs utilisateur (P5→P6) |
| `get_recent_decisions` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/DECISIONS.md | v26.0.0 | v26.3.0 | Décisions récentes (P5→P6) |
| `get_knowledge` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/KNOWLEDGE.md | v26.0.0 | v26.3.0 | Base connaissances (P5→P6) |
| `get_active_rituals` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/RITUALS.md | v26.0.0 | v26.3.0 | Rituels actifs (P5→P6) |

### Chat & AI Integration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `save_chat_interaction` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.0.0 | v26.3.0 | Sauvegarde historique chat (P5→P6) |
| `chat_generate` | **STABLE** | network, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.1.0 | v26.3.0 | Génération chat Ollama (P5→P6) |
| `chat_stream_message` | **STABLE** | network, memory | tests/contract/tauri.contract.test.ts | docs/CHAT_ENGINE.md | v26.1.0 | v26.3.0 | Streaming chat (P5→P6) |
| `cp_get_ai_config` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AI_CONFIG.md | v26.1.0 | v26.3.0 | Config AI Control Panel (P5→P6) |
| `cp_set_ai_config` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/AI_CONFIG.md | v26.1.0 | v26.3.0 | Set config AI (P5→P6) |

### File Management

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `memory_ingest_file` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | v26.3.0 | Ingestion fichiers memory (P5→P6) |
| `import_file` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | v26.3.0 | Import fichier utilisateur (P5→P6) |
| `upload_and_process_file` | **STABLE** | filesystem, network, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.0.0 | v26.3.0 | Upload + traitement (P5→P6) |
| `file_analyze` | **STABLE** | filesystem, memory | tests/contract/tauri.contract.test.ts | docs/FILE_INGESTION.md | v26.1.0 | v26.3.0 | Analyse fichier (P5→P6) |

### Orchestration

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `orchestration_get_cognitive_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/ORCHESTRATION.md | v26.2.0 | v26.3.0 | État cognitif orchestrateur (P5→P6) |
| `orchestration_get_unified_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/ORCHESTRATION.md | v26.2.0 | v26.3.0 | État unifié orchestrateur (P5→P6) |

### Singularity (État complexe)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `get_singularity_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | État Singularity unifié (P5→P6) |
| `singularity_get` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Lecture valeur Singularity (P5→P6) |
| `singularity_set` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Écriture valeur Singularity (P5→P6) |
| `singularity_sync` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Synchronisation état (P5→P6) |
| `sync_singularity` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Alias sync (P5→P6) |
| `singularity_get_adaptive` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Composante adaptative (P5→P6) |
| `singularity_get_cognitive` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Composante cognitive (P5→P6) |
| `singularity_get_physical` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Composante physique (P5→P6) |
| `singularity_get_symbolic` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Composante symbolique (P5→P6) |
| `singularity_get_meta` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Métadonnées (P5→P6) |
| `singularity_get_full_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | État complet (P5→P6) |
| `singularity_get_global_coherence` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Cohérence globale (P5→P6) |
| `singularity_is_critical` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Check état critique (P5→P6) |
| `singularity_export_json` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/SINGULARITY.md | v26.2.0 | v26.3.0 | Export JSON complet (P5→P6) |

### Experience & Avatar

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `experience_get_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/EXPERIENCE.md | v26.2.0 | v26.3.0 | État expérience utilisateur (P5→P6) |
| `experience_update_state` | **STABLE** | memory, filesystem | tests/contract/tauri.contract.test.ts | docs/EXPERIENCE.md | v26.2.0 | v26.3.0 | Mise à jour expérience (P5→P6) |
| `avatar_get_expression` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | v26.3.0 | Expression avatar actuelle (P5→P6) |
| `fullbody_get_state` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | v26.3.0 | État fullbody avatar (P5→P6) |
| `fullbody_init` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | v26.3.0 | Init fullbody (P5→P6) |
| `fullbody_update_expression` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | v26.3.0 | Update expression (P5→P6) |
| `fullbody_update_pose` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/AVATAR.md | v26.2.0 | v26.3.0 | Update pose (P5→P6) |

### TTS (Text-to-Speech)

### TTS (Text-to-Speech)

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Stable At | Notes |
|---------|--------|-------------|---------------|---------|-------|-----------|-------|
| `tts_speak_parler` | **STABLE** | network, audio | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | v26.3.0 | TTS avec Parler (P5→P6) |
| `tts_get_status` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | v26.3.0 | Status TTS (P5→P6) |
| `tts_is_speaking` | **STABLE** | memory | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | v26.3.0 | Check TTS actif (P5→P6) |
| `tts_stop` | **STABLE** | memory, audio | tests/contract/tauri.contract.test.ts | docs/TTS.md | v26.1.0 | v26.3.0 | Arrêt TTS (P5→P6) |

---

## Couche EXPERIMENTAL

**Capabilities en développement** - API instable, tests unitaires seulement, dev workspace uniquement.

### Security & Privacy

| Command | Status | Permissions | Contract Test | Doc Ref | Added | Notes |
|---------|--------|-------------|---------------|---------|-------|-------|
| `unlock_memory_vault` | **EXPERIMENTAL** | memory, filesystem | tests/experimental/memory-encryption.test.ts | docs/capabilities/memory-core-encryption.md | v26.3.0+ | Déchiffrement vault utilisateur |
| `lock_memory_vault` | **EXPERIMENTAL** | memory, filesystem | tests/experimental/memory-encryption.test.ts | docs/capabilities/memory-core-encryption.md | v26.3.0+ | Chiffrement vault utilisateur |

---

## Couche DEV

**Commands disponibles uniquement en mode développement** (non incluses dans allowlist.whitelist.stable.json).

| Command | Status | Permissions | Contract Test | Doc Ref | Notes |
|---------|--------|-------------|---------------|---------|-------|
| `debug_memory_dump` | **EXPERIMENTAL** | filesystem, memory | tests/dev/debug.test.ts | docs/DEBUG.md | Dump mémoire complète |
| `debug_reset_all_state` | **EXPERIMENTAL** | filesystem, memory | tests/dev/debug.test.ts | docs/DEBUG.md | Reset complet (dangereux) |
| `dev_reload_config` | **EXPERIMENTAL** | filesystem | tests/dev/config.test.ts | docs/DEBUG.md | Reload config sans restart |

**Note**: Ces commands ne sont **jamais** exposées en production (stable build).

---

## Statuts

**PHASE 6 Lifecycle** - Évolution consciente avec gates automatisés :

| Status | Description | Critères | Transition |
|--------|-------------|----------|------------|
| **EXPERIMENTAL** | Command dev-only, API instable | - Aucune garantie API<br>- Tests unitaires seulement<br>- Dev workspace uniquement | Manuel → QUALIFIED |
| **QUALIFIED** | API figée, tests complets, pas encore prod | - Tests contractuels 90%+ PASS<br>- CI gates PASS<br>- Review technique OK<br>- Documentation complète | Gate automatique → STABLE |
| **STABLE** | Production-ready, rétrocompatibilité garantie | - Dans allowlist stable<br>- Tests contractuels + CI gates<br>- Documentation scellée<br>- Backward compatibility obligatoire | Manuel → DEPRECATED |
| **DEPRECATED** | Marqué obsolète, migration path définie | - Migration path documentée<br>- Warning logs activés<br>- 6 mois minimum avant REMOVED | Automatique → REMOVED |
| **REMOVED** | Retiré du système, traces archivées | - Command supprimée<br>- Documentation archivée<br>- Breaking change acceptable | N/A |

**Gates automatisés** :
- **QUALIFIED → STABLE** : `scripts/ci/check-promotion-stable.sh` (checklist 11 items obligatoire)
- **CI validation** : `.github/workflows/capability-qualification.yml` (drift + promotion + tests + build + audit)
- **Migration PHASE 5→6** : Grandfathering automatique (stable → STABLE)

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

### Ajouter une nouvelle capability PHASE 6

**Process complet** (EXPERIMENTAL → QUALIFIED → STABLE) :

#### 1. EXPERIMENTAL (Dev workspace)
1. **Implémenter capability** dans `src-tauri/src/commands/`
2. **Créer documentation** avec template `docs/capabilities/_TEMPLATE.md`
3. **Tests unitaires** de base
4. **Status EXPERIMENTAL** (dev-only, API peut changer)

#### 2. Promotion QUALIFIED
1. **API figée** (pas de changements breaking)
2. **Tests contractuels 90%+** dans `tests/contract/tauri.contract.test.ts`
3. **Documentation complète** (11 sections obligatoires)
4. **Review technique** approuvée
5. **CI gates PASS** (tests + build + audit)

#### 3. Promotion STABLE (Gate automatisé)
1. **Exécuter gate** : `./scripts/ci/check-promotion-stable.sh docs/capabilities/<nom>.md`
2. **Checklist 11 items** validée automatiquement :
   - Justification technique et métier
   - Surface exposition minimale
   - Validation inputs/outputs contrats
   - Tests automatisés 90%+ coverage
   - Gates CI PASS
   - Observabilité configurée
   - Rollback testé
   - Mode dégradé local-first
   - Documentation complète
   - Review approuvée  
   - Validation sécurité/privacy
3. **Ajout automatique** à `allowlist.whitelist.stable.json`
4. **Mise à jour registry** (ce fichier)

#### 4. Outils PHASE 6
- **Drift check** : `scripts/ci/check-capabilities-drift.sh`
- **Promotion gate** : `scripts/ci/check-promotion-stable.sh <capability.md>`
- **CI workflow** : `.github/workflows/capability-qualification.yml`
- **Template** : `docs/capabilities/_TEMPLATE.md`
- **Protocol** : `docs/CAPABILITY_QUALIFICATION_PROTOCOL.md`

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

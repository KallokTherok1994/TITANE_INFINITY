# MEMORY_GOVERNANCE_LEDGER.md — Ledger de Gouvernance Mémoire

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Classification:** CANON — append-only

---

## Fichiers Mémoire Actifs

### Runtime State (memory/)

| Fichier | Rôle | Gouvernance |
|---------|------|-------------|
| `memory/cognitive.json` | État cognitif courant de TITANE | Read/Write via Memory API |
| `memory/harmonics.json` | Fréquences harmoniques, résonance | Read/Write via Memory API |
| `memory/memory_core_state.json` | État core mémoire consolidé | Read/Write via Memory API |
| `memory/singularity.json` | État singularité globale | Read/Write via Memory API |
| `memory/system_state.json` | État système OS | Read/Write via Memory API |

### Registry Actif (registry/)

| Fichier | Entrées | Gouvernance |
|---------|---------|-------------|
| `registry/repo-events.jsonl` | 139 | APPEND-ONLY (I14) |
| `registry/ui-events.jsonl` | 119 | APPEND-ONLY (I14) |
| `registry/autofix-autoheal-rules.jsonl` | 22 | APPEND-ONLY (I14) |
| `registry/proofpack-index.jsonl` | 36 | APPEND-ONLY (I14) |
| `registry/chat-events.jsonl` | actif | APPEND-ONLY |
| `registry/chat-mem-phases.jsonl` | actif | APPEND-ONLY |
| `registry/closure-events.jsonl` | actif | APPEND-ONLY |
| `registry/heavy-artifacts-manifest.jsonl` | actif | APPEND-ONLY |
| `registry/local-only-historical-residue.jsonl` | actif | READ-ONLY (historique) |
| `registry/canon-events.jsonl` | 1 (après cette session) | APPEND-ONLY (nouveau) |

---

## Invariant I14 — Append-Only

```
Règle: Tout registre actif est append-only.
Aucune ligne existante ne peut être modifiée ou supprimée.
Les corrections se font par ajout d'une nouvelle entrée avec statut "superseded".
```

---

## Index Proof Packs

| Attribut | Valeur |
|----------|--------|
| Répertoire | `proof_packs/` |
| Total packs | 160+ |
| Source d'index | `registry/proofpack-index.jsonl` (36 entrées indexées) |
| Plus récent avant cette session | `V70_GITHUB_RELEASE_PUBLICATION_20260313_234139_ced624c8c7` |
| Nouveau ce cycle | `MASTER_AUDIT_CANON_2026-03-15_1332_c59e9b5b3` |

---

## Commandes Mémoire Registered (proof = CODE)

| Commande | Domaine |
|----------|---------|
| `get_memory_state` | Memory API |
| `write_snapshot` | Memory API |
| `read_snapshot` | Memory API |
| `write_log` | Memory API |
| `read_logs` | Memory API |
| `add_timeline_event` | Memory API |
| `memory_get_active_projects` | Memory API |
| `memory_get_recent_decisions` | Memory API |
| `memory_store` | Unified Memory |
| `memory_recall` | Unified Memory |
| `memory_get_stats` | Unified Memory |
| `memory_get_state` | Unified Memory |
| `memory_initialize` | Unified Memory |
| `memory_tick` | Unified Memory |
| `persistent_memory_read` | Persistent Memory v19.2Ω |
| `persistent_memory_write_entry` | Persistent Memory v19.2Ω |
| + 10 autres persistent_memory_* | Persistent Memory v19.2Ω |
| `titan_persistence_init` | Titan Persistence |
| + 26 autres titan_* | Titan Persistence |

---

## AutoHeal Governance

| Fichier | Rôle |
|---------|------|
| `scripts/autoheal/autoheal_rules.jsonl` | Règles autoheal opérationnelles |
| `scripts/autoheal/detect_recurrence.sh` | Détecteur de récurrence |
| `scripts/autoheal/apply_autoheal.sh` | Application des règles |
| `registry/autofix-autoheal-rules.jsonl` | Registre canonique AutoFix/AutoHeal |

---

## Données Sensibles — Gestion Sécurisée

Toutes les API keys et secrets sont gérés via `SecureSecretsEngine` (AES-256-GCM).
Aucune clé en clair dans les fichiers mémoire ou registry.
Commandes de gestion : `secure_store_secret`, `has_secret`, `delete_secret`, `get_secrets_status`.

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*

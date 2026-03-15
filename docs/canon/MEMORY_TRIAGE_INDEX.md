# MEMORY_TRIAGE_INDEX.md — Index de Triage Mémoire

**Version:** 28.0.0 | **SHA:** c59e9b5b3 | **Date:** 2026-03-15T13:32:00Z
**Classification:** CANON

---

## Classification des Sources Mémoire

### A. CANON_ACTIVE — Sources de vérité actives, append-only

| Fichier | Contenu | Entrées | Gouvernance |
|---------|---------|---------|-------------|
| `registry/repo-events.jsonl` | Événements dépôt | 139 | APPEND-ONLY (I14) |
| `registry/ui-events.jsonl` | Événements UI | 119 | APPEND-ONLY (I14) |
| `registry/autofix-autoheal-rules.jsonl` | Règles AutoFix/AutoHeal | 22 | APPEND-ONLY (I14) |
| `registry/proofpack-index.jsonl` | Index proof packs | 36 | APPEND-ONLY (I14) |
| `registry/chat-events.jsonl` | Événements chat | actif | APPEND-ONLY |
| `registry/chat-mem-phases.jsonl` | Phases mémoire chat | actif | APPEND-ONLY |
| `registry/closure-events.jsonl` | Événements closure | actif | APPEND-ONLY |
| `registry/canon-events.jsonl` | Événements canonisation | 1 (cette session) | APPEND-ONLY |
| `memory/cognitive.json` | État cognitif TITANE | actif | IPC Memory API |
| `memory/harmonics.json` | État harmonique | actif | IPC Memory API |
| `memory/memory_core_state.json` | État mémoire core | actif | IPC Memory API |
| `memory/singularity.json` | État singularité | actif | IPC Memory API |
| `memory/system_state.json` | État système | actif | IPC Memory API |
| `docs/canon/` | Documents canoniques | 12 fichiers (cette session) | APPEND-ONLY |

### B. HISTORICAL_VALID — Preuves historiques valides

| Source | Description | Note |
|--------|-------------|------|
| `proof_packs/` (160+ packs) | Preuves d'audit cumulées | Valides, immuables |
| `V70_GITHUB_RELEASE_PUBLICATION_20260313_234139_ced624c8c7` | Preuve release GitHub | Plus récente release |
| `V69_POST_PROD_TRUTH_CLOSURE_20260313` | Post-prod closure | Valide |
| `FINAL_PREPROD_UI_RUNTIME_CERTIFICATION` | Certification UI runtime | Valide |
| `VISIBLE_REAL_CHAT_FUNCTIONAL_TRUTH_V25` | Chat fonctionnel proof | Valide |
| `registry/heavy-artifacts-manifest.jsonl` | Manifeste artefacts lourds | Référence |

### C. LEGACY_SUPERSEDED — Remplacés, ne plus utiliser comme source active

| Source | Remplacé par | Raison |
|--------|-------------|--------|
| `handlers.rs` blocs v14/v16 | `main.rs` invoke_handler v28 | Architecture v28 active |
| `REGISTRY_APPEND_TITANE_FINAL.jsonl` | `registry/*.jsonl` actifs | Fichier unique → distribution |
| `REGISTRY_APPEND_TITANE_Ω∞.jsonl` | `registry/*.jsonl` actifs | Fichier unique → distribution |
| `chat_send_message` command | `conversation_generate` | Retirée v27.0.5-prod |
| `voice_synthesize_speech` | `speak()` dans ai_chat.rs | Dépréciée |
| `legacy_ai_bridge` (mock) | `conversation_engine` OMEGA | Legacy compat seulement |

### D. UNKNOWN_UNPROVEN — Statut indéterminé

| Source | Raison d'incertitude |
|--------|---------------------|
| `docs/*.md` (hors docs/canon/) | Non canonisés dans cette session |
| `_archive/` | Contenu non inspecté |
| `legacy/` | Contenu non inspecté |
| `docs/99_ARCHIVE/` | Archivé, non vérifié |
| `scripts/**` (non exécutés) | Présents mais non validés cette session |

---

## Sortie Mémoire Finale

```json
{
  "vision_confirmee": "TITANE_INFINITY = OS cognitif Tauri-only, Online-first gouverné, 401 commandes IPC (SHA c59e9b5b3)",
  "priorite_actuelle": [
    "Stabiliser build (git restore tauri.conf.json)",
    "Confirmer cargo check (résoudre C003 handlers.rs shadowing)",
    "Lancer E2E suite x3"
  ],
  "vigilance": [
    "C003: handlers.rs blocs legacy — risque shadowing P1",
    "C001: beforeBuildCommand=true bloque build prod P1",
    "C004: web_research stub dans liste production P2"
  ],
  "progres": {
    "version": "28.0.0",
    "proof_packs": 160,
    "commandes_ipc": "401 (SHA c59e9b5b3) / 408 (actuel)",
    "registry_actif": true,
    "docs_canon_crees": 12
  },
  "axes_a_preserver": [
    "IPC canonical contract (safeInvokeCanonical)",
    "One Door network policy",
    "4-Ring integrity",
    "Append-only registry"
  ]
}
```

---

*Autorité : Kevin Thibault — TITANE Team | 2026-03-15T13:32:00Z*

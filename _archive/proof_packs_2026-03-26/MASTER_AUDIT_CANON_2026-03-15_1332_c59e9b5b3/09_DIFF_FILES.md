# 09_DIFF_FILES.md — Fichiers Dirty

## Fichiers Modified (2 fichiers dirty — git status)

### 1. src-tauri/tauri.conf.json

**Problèmes identifiés :**
- `beforeBuildCommand="true"` — override local (empêche build production)
- Unicode escape sequences dans les chaînes (non-standard)

**Diff extrait :**
```
-    "beforeBuildCommand": "corepack pnpm exec vite build",
+    "beforeBuildCommand": "true",
-    "copyright": "Copyright © 2025 TITANE",
+    "copyright": "Copyright \u00a9 2025 TITANE",
-    "shortDescription": "TITANE∞ v27.2.0 - Stable Release",
+    "shortDescription": "TITANE\u221e v27.2.0 - Stable Release",
```

**Sévérité :** P1 — bloque build production
**Contradiction :** C001 OPEN
**Action :** `git restore -- src-tauri/tauri.conf.json`

### 2. src-tauri/gen/android/gradle.properties

**Problèmes identifiés :**
- Fichier dirty — diff exact à inspecter
- Cause probable : modification lors du bootstrap Android (commit c1b5c5d23)

**Sévérité :** P2 — bloque build Android
**Contradiction :** C002 OPEN
**Action :** `git restore -- src-tauri/gen/android/gradle.properties`

---

## Fichiers Créés Cette Session (docs/canon/ + proof_pack)

Ces fichiers sont nouveaux — aucun code existant modifié.

| Fichier | Type |
|---------|------|
| docs/canon/REPO_TRUTH_REPORT.md | NOUVEAU |
| docs/canon/ARCHITECTURE_TRUTH.md | NOUVEAU |
| docs/canon/CAPABILITY_REGISTRY_CANON.md | NOUVEAU |
| docs/canon/COMMANDS_SOURCE_OF_TRUTH.md | NOUVEAU |
| docs/canon/TRUTH_MATRIX.md | NOUVEAU |
| docs/canon/GATES_REPORT_CANON.md | NOUVEAU |
| docs/canon/CONTRADICTION_MATRIX.md | NOUVEAU |
| docs/canon/MEMORY_TRIAGE_INDEX.md | NOUVEAU |
| docs/canon/MEMORY_EVOLUTION_CANON.md | NOUVEAU |
| docs/canon/HISTORICAL_SUPERSESSION_LOG.md | NOUVEAU |
| docs/canon/MEMORY_GOVERNANCE_LEDGER.md | NOUVEAU |
| docs/canon/TITANE_BRAIN_CANON.md | NOUVEAU |
| registry/canon-events.jsonl | NOUVEAU (append) |
| scripts/autoheal/autoheal_rules.jsonl | APPEND (1 entrée) |

---

## Commande de Restauration (dirty files uniquement)

```bash
git restore -- src-tauri/tauri.conf.json src-tauri/gen/android/gradle.properties
```

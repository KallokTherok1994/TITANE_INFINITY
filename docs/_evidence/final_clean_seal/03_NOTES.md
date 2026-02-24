# 03_NOTES — CORRECTIONS MINIMALES

## Changements appliqués dans ce cycle (Phase 3)

### 1. README.md — Section "Truth & Proof" ajoutée

**Cause :** La mission exige une section expliquant "où trouver les preuves". Absente dans README.
**Fix :** Ajout de `## 🔍 Truth & Proof` avec table des chemins evidence et règles Truth Contract.
**Preuve :** `docs/_evidence/final_clean_seal/03_PATCH_DIFF.patch`
**Rollback :** `git restore -- README.md`
**Ring :** Doc uniquement — zéro impact runtime.

### 2. docs/TERMINOLOGY_ALIGNMENT_FINAL.md — Création (nouveau fichier)

**Cause :** Phase 5 de la mission demande ce fichier. Absent dans le repo.
**Fix :** Création du fichier avec définitions canoniques : Online-First Governed, Tauri-Only, 4-Ring, Stop-the-Line, Proof Pack, Seal, Truth Contract, REMOTE/LOCAL/OFFLINE, POLICY_BLOCKED.
**Preuve :** Fichier créé visible dans git status.
**Rollback :** `git rm docs/TERMINOLOGY_ALIGNMENT_FINAL.md`
**Ring :** Doc uniquement — zéro impact runtime.

## Changements NON appliqués (hors scope)

- `src/services/ai/providers/ollama.ts:631` TODO — roadmap non bloquante, hors scope
- `src-tauri/src/audio/streaming_engine.rs:446` FIXME — correctif ciblé, non P0
- `docs/archive/` — HISTORY, immuable
- `scripts/verify/enforce-tauri-only.sh` faux positif — pré-existant hors scope

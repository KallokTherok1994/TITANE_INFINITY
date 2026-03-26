# REGISTRE DES FINDINGS EXHAUSTIFS

**Session:** GITHUB_AGENT_EXHAUSTIVE_REPO_TRUTH_2026-03-07_1502_d783dcd  
**Date:** 2026-03-07

---

## P0/P1 — AUCUN FINDING ACTIF

✅ Aucun P0/P1 détecté dans cette session exhaustive.

---

## P2 — FINDINGS NON-BLOQUANTS

### EXH-P2-001 (NOUVEAU — CORRIGÉ)
**Titre:** Build artifacts Rust committés dans git  
**Symptôme:** 410 fichiers `deployment/latest/builds/target-run-1/**` (binaires cargo, fingerprints) committés dans session précédente  
**Cause racine:** `deployment/latest/builds/target-run-*/` absent du `.gitignore`; `cargo check` a écrit dans ce dossier  
**Fix appliqué:** `deployment/latest/builds/target-run-*/` ajouté à `.gitignore` + `git rm -r --cached` pour 410 fichiers  
**AutoHeal:** AH-2026-03-07-0082  
**Statut:** CORRIGÉ ✅

### EXH-P2-002 (HÉRITÉ — DOCUMENTÉ)
**Titre:** G4 provider-decision-certified FAIL local (non CI)  
**Symptôme:** `docs/_evidence/FIX_CHAT_PROVIDER_GOV_P3_YYYYMMDD_HHMMSS` manquant  
**Cause racine:** Evidence directory du programme de certification 2026-02-27 jamais créé pour ce pattern  
**Impact CI:** NULS — `scripts/gates/g4-provider-decision-certified.sh` non référencé dans `.github/workflows/`  
**AutoHeal:** AH-2026-03-07-0083  
**Statut:** DOCUMENTÉ — non bloquant (I9: no broad refactor, I18: no destructive cleanup)

### EXH-P2-003 (HÉRITÉ — DOCUMENTÉ)
**Titre:** proof-requirements-v2.sh FAIL local / chaos-lab scorecard=0  
**Symptôme:** `docs/_evidence/program_max_iq_20260227_151711/` partielle (5 fichiers requis manquants sur 6; phases pI-pQ absentes)  
**Cause racine:** Ces preuves sont de la certification 2026-02-27, pas entièrement régénérées  
**Impact CI:** NULS — `scripts/verify/proof-requirements-v2.sh` et `scripts/verify/scorecard-ci-gate-v2.sh` absents des workflows  
**AutoHeal:** AH-2026-03-07-0083  
**Statut:** DOCUMENTÉ — non bloquant

### EXH-P2-004 (HÉRITÉ — DOCUMENTÉ)
**Titre:** CSP unsafe-inline présent dans tauri.conf.json  
**Symptôme:** `csp-baseline-gate.js` FAIL local car `unsafe-inline` sans CSP_ALLOW_UNSAFE=1  
**Cause racine:** CSP Tauri contient `'unsafe-inline'` pour `script-src` et `style-src` — requis pour Vite/React dev  
**Impact CI:** WAIVÉ — `ci-unified.yml` exécute la gate avec `CSP_ALLOW_UNSAFE: '1'`  
**Statut:** WAIVÉ DOCUMENTÉ — waiver dans CI prouvé

### EXH-P2-005/P2-006/P2-007 (HÉRITÉS)
Hérités des sessions précédentes: 268 stubs, BLOCKED_ENV tests, 5 dev-only commands hors allowlist  
**Statut:** NOTED — hérités, non aggravés

---

## CORRECTIONS APPORTÉES CETTE SESSION

| Fix | AutoHeal | Fichiers modifiés |
|-----|---------|-------------------|
| .gitignore: + `deployment/latest/builds/target-run-*/` | AH-0082 | `.gitignore` |
| git rm 410 build artifacts | AH-0082 | (purgés de git) |

# Roadmap Canonique — TITANE∞

**Date mise à jour:** 2026-03-09  
**Version produit:** v27.2.0  
**Session:** phase_preparation_20260309  
**Verdict actuel:** BLOCKED_APPROVAL

---

## Statut Global

| Phase | Statut | Preuve |
|-------|--------|--------|
| INT-0 Bootstrap | ✅ PASS | `docs/_evidence/integration_closure/INT-0_INT-1_proof.md` |
| INT-1 Commit Inventory | ✅ PASS | 3 commits scope-qualified (R3/docs) |
| INT-2 Kernel Certification | ✅ PASS | `docs/_evidence/integration_closure/INT-2_kernel_cert.md` |
| INT-3 Mainline Revalidation | ✅ PASS | PR#176 merged to MAIN 2026-03-09 |
| G6 Hardening | ✅ PASS | AH-2026-03-09-0109 — strip-unneeded + objcopy |
| TERM-1 P8 Install | ⏳ PENDING | Environnement build requis |
| TERM-2 P9 Reproducible Build | ⏳ PENDING | G6 runs #2 et #3 requis |
| TERM-3 P10 Certification Freeze | 🔴 BLOCKED_APPROVAL | Dépend de P8+P9 |
| H4 Production Deploy | 🔒 LOCKED | Tokens PROD requis |

---

## Jalons Complétés

### 2026-03-07
- Stabilité CI/CD établie (PR175): rust.yml, prettier, Tauri deps
- verify:final100 = PASS
- AutoHeal: AH-2026-03-07-0088 → AH-2026-03-07-0091 (103→131 entrées)
- Baseline tests: Vitest 3288 tests PASS, TypeScript exit 0, ESLint 0 warnings

### 2026-03-08
- Rust workflow path fix (AH-2026-03-08-0092)
- AutoHeal ID uniqueness enforcement (AH-2026-03-08-0093)

### 2026-03-09 (PR176)
- G6 hash normalization hardenée (AH-2026-03-09-0109)
- INT-2 kernel certification PASS (gates PASS=20)
- MAIN merger PR176 — gouvernance intégration fermée
- AutoHeal: 145 entrées, detect_recurrence PASS

---

## Roadmap Forward (H1 → H4)

### H1 TERMINAL — Compléter P9 + P8
**Objectif:** Reprendre G6 run #2 et #3, finaliser P8  
**Durée estimée:** 60–90 min  
**Prérequis:** Environnement build Tauri (H2 si non disponible)  
**Livrables:**
- `deployment/latest/builds/BUILD_REPRODUCIBILITY.md` (3× hashes identiques)
- `deployment/latest/builds/P8_INSTALL_VERIFICATION.md` (mis à jour PASS)
- `proof_packs/P9_P8_RESOLUTION_20260309/VERDICT.md`
- AutoHeal AH-2026-03-09-0110

### H2 — Provision Environnement Build
**Objectif:** Provisionner Tauri deps + Rust + pnpm pour exécution P8/P9  
**Durée estimée:** 30 min  
**Prérequis:** Aucun  
**Livrables:**
- Confirmation dpkg Tauri deps
- `docs/plans/phase_preparation_20260309/H2_ENV_PROOF.md`

### H3 — P10 Certification Freeze
**Objectif:** Gel de certification avant déploiement production  
**Durée estimée:** 15–30 min  
**Prérequis:** P8 PASS + P9 PASS + token `GO_FOR_PROD_BUILD__TITANE_INFINITY`  
**Livrables:**
- `proof_packs/P10_CERTIFICATION_FREEZE_20260309/VERDICT.md`
- Tag git: `CERT-FREEZE-v27.2.0-20260309`

### H4 — Release + Production Deploy
**Objectif:** Déploiement production v27.2.0  
**Durée estimée:** Variable  
**Prérequis:** P10 PASS + `GO_FOR_PROD_BUILD__TITANE_INFINITY` + `GO_FOR_PROD_DEPLOY__TITANE_INFINITY`  
**Livrables:**
- Artefacts tauri build (.AppImage, .deb, .msi)
- `deployment/latest/DEPLOYMENT_COMPLETE_20260309.md`
- Tag git release
- CHANGELOG mis à jour

---

## Architecture Rings (Rappel)

| Ring | Scope | Impact PR176 |
|------|-------|-------------|
| R1 — Core/Types | Types, interfaces | ✅ Non impacté |
| R2 — Engines/Services | Business logic | ✅ Non impacté |
| R3 — Docs/Scripts | Docs, gates, autoheal | ✅ Modifié (G6, evidence) |
| R4 — UI/Tauri | Interface, runtime | ✅ Non impacté |

> Invariant: Pas d'imports inverses. R1 n'importe pas R2/R3/R4.  
> PR176 scope = R3 uniquement (docs + gate scripts).

---

## Gouvernance

### Gates Actifs

| Gate | Statut | Notes |
|------|--------|-------|
| verify_instructions.sh | ✅ PASS=20 | Contrôle permanent |
| detect_recurrence.sh | ✅ PASS | 145 entrées clean |
| G7 tauri-allowlist-lock | ✅ PASS | Allowlist stable |
| G_NETWORK_ONE_DOOR | ✅ PASS | IPC only |
| G_FRONTEND_NO_WEB | ✅ PASS | Pas de fetch direct |
| G_NO_TEST_SKIPS | ✅ PASS | Aucun skip |
| G6 reproducibility | ⏳ PENDING | P9 à compléter |
| CSP baseline | ⚠️ P2 | Local FAIL, CI waivé |

### AutoHeal

- **Dernier ID:** AH-2026-03-09-0109
- **Total entrées:** 145
- **Prochain ID:** AH-2026-03-09-0110 (pour P9 résolution)
- **Règle:** ID unique séquentiel, `files_changed` non-vide, `prevention_test` doit mentionner `detect_recurrence`

### Politique PROD

```
Aucune action PROD sans tokens explicites:
  GO_FOR_PROD_BUILD__TITANE_INFINITY
  GO_FOR_PROD_DEPLOY__TITANE_INFINITY
```

---

## Rollback Global

```bash
# Rollback docs préparation
git restore -- docs/plans/phase_preparation_20260309/

# Rollback preuves integration (si nécessaire)
git restore -- docs/_evidence/integration_closure/
git restore -- proof_packs/integration_closure_kernel_cert_20260309/

# Rollback G6 (si régression)
git restore -- scripts/gates/g6-build-reproducibility.sh

# Rollback autoheal (si corruption)
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

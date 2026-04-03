# 14 — DELETE_DISCIPLINE_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle fondamentale

**Jamais supprimer sans prouver : no-import, no-runtime, no-route, no-validator, no-proof-authority, no-release-role, rollback simple.**

---

## Classification des zones

| Zone | Classification | Justification | Suppression autorisée ? |
|------|---------------|---------------|------------------------|
| `src/` | KEEP_CORE | Produit actif | ❌ |
| `src-tauri/` | KEEP_CORE | Runtime Tauri | ❌ |
| `scripts/gates/` | KEEP_SUPPORT | Gates G1-G9 | ❌ |
| `scripts/autoheal/` | KEEP_SUPPORT | Registre 583 entrées | ❌ |
| `scripts/verify/` | KEEP_SUPPORT | verify_instructions | ❌ |
| `proof_packs/` | KEEP_PROOF_AUTHORITY | Preuve historique | ❌ |
| `docs/` | KEEP_HISTORICAL_AUTHORITY | Matrices d'audit | ❌ |
| `.github/` | KEEP_SUPPORT | CI/Security | ❌ |
| `.github/workflows/archive/` | KEEP_ARCHIVE | Référence historique | ⚠️ MOVE_OUT possible |
| `governance/` | KEEP_HISTORICAL_AUTHORITY | Historique gouvernance | ❌ |
| `src/_deprecated/` | QUARANTINE | Marqué deprecated | ⚠️ DELETE_CANDIDATE si no-ref |

---

## Code suspect

| Fichier/Zone | Classification | Justification |
|-------------|---------------|---------------|
| `src/services/conversationEngine.ts` mock path | SAFE_BUT_RISKY | Flag E2E explicite |
| `src/services/api/chat.ts` mock path | SAFE_BUT_RISKY | Flag E2E explicite |
| `src/tauri-protection-patch.ts` | UNKNOWN | Non audité |
| `src/tauri-init-fix.ts` | UNKNOWN | Non audité |

---

## Résumé

Aucune suppression n'est autorisée lors de cette session d'audit. Les zones deprecated nécessitent une analyse d'import avant toute action.

Session précédente (2026-03-22) : 19 fichiers morts supprimés avec preuve d'absence de référence.

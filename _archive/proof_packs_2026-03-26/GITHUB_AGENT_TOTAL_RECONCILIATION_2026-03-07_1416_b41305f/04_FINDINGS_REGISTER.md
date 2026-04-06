# REGISTRE DES FINDINGS

**Session:** GITHUB_AGENT_TOTAL_RECONCILIATION_2026-03-07_1416_b41305f  
**Date:** 2026-03-07

---

## FINDINGS ACTIFS

### P0/P1 — Aucun finding actif

### P2 — Findings non-bloquants (hérités + nouveaux)

| ID | Gravité | Description | Statut |
|----|---------|-------------|--------|
| P2-REC-001 | P2 | enforce-online-first.sh: faux négatif local car `rg` absent. Contenu doctrinaire présent. Script non-inclus dans CI PR. | NOTED — non-bloquant |
| P2-REC-002 | P2 | validate-architecture.sh: 2 warnings pré-existants (.eslintrc.json manquant, architecture tests non-exécutés localement) | NOTED — hérité |
| P2-REC-003 | P2 | 5 commands dans capabilities registry mais hors allowlist stable (dev-only) | NOTED — hérité |
| P2-003 | P2 | 268 stubs P2-budget non enregistrés (hors périmètre minimal) | NOTED — hérité |
| P2-004 | P2 | dual TAURI_COMMANDS.ts | NOTED — hérité |
| P2-005 | P2 | BLOCKED_ENV tests | NOTED — hérité |

### FINDINGS PRÉCÉDENTS — RÉSOLUS (session b41305f)

| ID | Description | Résolution |
|----|-------------|-----------|
| F-001 | rust.yml: cargo build sans working-directory | FIXED — working-directory: src-tauri |
| F-002 | rust.yml: Prettier non-conforme | FIXED — npx prettier --write |
| F-003 | python-package-conda.yml: Prettier non-conforme | FIXED — npx prettier --write |
| F-004 | Registry Guard: workflow non enregistré | FIXED — log-event + snapshot + dashboard |

---

## OBSERVATIONS SPÉCIALES

### Clone superficiel (shallow)

**Symptôme:** `mermaid-status-report.sh --check` échoue localement car `git merge-base --is-ancestor <baseline_sha> HEAD` retourne `fatal: Not a valid commit name` dans un clone shallow.  
**Impact:** LINEAGE_STATUS = FAIL → tout le rapport de statut échoue.  
**Résolution:** `git fetch --unshallow origin` rétablit l'accès à l'historique complet.  
**Note CI:** Ce problème n'existe pas dans les runners GitHub Actions (full checkout avec `fetch-depth: 0` dans mermaid.yml).  
**AutoHeal:** AH-2026-03-07-0081 ajouté.

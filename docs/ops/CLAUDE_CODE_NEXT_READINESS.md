# CLAUDE_CODE_NEXT_READINESS
**Date**: 2026-03-26 | **Scope**: Claude Code automation readiness post-consolidation

Évaluation honnête de ce qui est stable pour Claude Code vs prématuré.

---

## PRÊT MAINTENANT

### Commandes ciblées (sûres, rapides, réversibles)

| Commande | Usage | Verdict |
|----------|-------|---------|
| `pnpm run check` | Validation types TS | STABLE — < 30s |
| `pnpm run lint` | Style ESLint | STABLE — < 30s |
| `pnpm vitest run` | Suite complète (3518 tests) | STABLE — ~130s |
| `pnpm run build` | Bundle Vite | STABLE — ~60s |
| `cargo check --manifest-path src-tauri/Cargo.toml` | Types Rust | STABLE — ~20s |
| `pnpm run verify` | Suite CI (lint+check+tests) | STABLE — use for full gate |

### Mémoire projet (MEMORY.md)

Claude Code peut maintenant opérer avec:
- `docs/governance/EXECUTION_GUARDRAILS.md` — règles opérationnelles
- `docs/architecture/CONSOLIDATED_AUTHORITY_STATE.md` — carte des autorités
- `docs/architecture/VALIDATION_CERTIFICATION_BASELINE.md` — hiérarchie preuves
- `docs/architecture/UNKNOWN_REDUCTION_PLAN.md` — statut des UNKNOWN

### Contexte de lecture avant modification

Avant de toucher un composant:
1. Lire `docs/architecture/CONSOLIDATED_AUTHORITY_STATE.md` (autorités verrouillées)
2. Vérifier le ring scope (R1-R4) dans `EXECUTION_GUARDRAILS.md`
3. Grep imports entrants sur le fichier cible

---

## UTILE BIENTÔT (dès que STABLE maintenu)

### Hook pre-commit (léger)

```bash
# .git/hooks/pre-commit
pnpm run check --noEmit 2>&1 | tail -5
```

Bloque un commit si tsc échoue. Coût bas, rendement élevé.

**Condition**: garder le hook simple — pas de lint ni vitest en pre-commit (trop lent).

### Commande verify-gates (alias rapide)

```bash
# package.json scripts
"gates": "pnpm run check && pnpm run lint && pnpm vitest run --reporter=verbose 2>&1 | tail -20"
```

Séquence standard avant verdict STABLE.

### Lecture des docs d'autorité en début de session

Pattern: commencer chaque session de modification avec:
```
Read: docs/governance/EXECUTION_GUARDRAILS.md
Read: docs/architecture/CONSOLIDATED_AUTHORITY_STATE.md
```

---

## PRÉMATURÉ (ne pas faire maintenant)

| Item | Pourquoi prématuré | Gate requise |
|------|-------------------|--------------|
| Agents autonomes spécialisés | Système pas encore SEALED — les agents peuvent casser des invariants non documentés | SEALED verdict + desktop E2E |
| Hooks complexes (auto-refactor, auto-migration) | Trop de DEFERRED P2/P3 en cours — risque de drift | Physical moves + baseline 100% |
| Auto-suppression de fichiers | L'audit CENTERS_AUDIT est QUALIFIED, pas STABLE — suppressions nécessitent grep + vitest | vitest ≥ 3518 après chaque suppression |
| CI automation complète | playwright + wdio+tauri-driver sont BLOCKED_ENV | Desktop E2E unblocked |
| Migration automatique features/conversation | ALIAS_COMPAT utile, migration P2 nécessite session dédiée | tsc + vitest gate dédiée |

---

## DÉPENDANCES PRÉALABLES POUR AUTOMATION AVANCÉE

1. **SEALED verdict** (wdio+tauri-driver PASS) — débloque agents autonomes et CI complète
2. **Test baseline 100%** avec regression suite — débloque physical Core/Labs/Ops moves
3. **Desktop E2E environment** — débloque playwright + wdio

---

## COMMANDES DE RÉFÉRENCE RAPIDE

```bash
# Gate STABLE locale (quotidien)
pnpm run check && pnpm run lint

# Suite tests (avant commit R2/R3)
pnpm vitest run 2>&1 | tail -5

# Gate STABLE complète (avant merge)
pnpm run check && pnpm run lint && pnpm vitest run && pnpm run build && cargo check --manifest-path src-tauri/Cargo.toml

# Rollback ciblé
git log --oneline -5
git revert <sha>
```

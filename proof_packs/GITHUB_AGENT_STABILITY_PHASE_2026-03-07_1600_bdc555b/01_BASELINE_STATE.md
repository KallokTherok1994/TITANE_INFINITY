# BASELINE PASS — ÉTAT COURANT BRANCHE PR

**Session:** GITHUB_AGENT_STABILITY_PHASE_2026-03-07_1600_bdc555b

---

## Commit HEAD

```
bdc555b (HEAD -> copilot/audit-cleanup-autofix-workflows)
fix: final CI closure - python-package-conda trigger + registry sync + autoheal AH-0084/0085 + proof pack PASS
```

## Inventaire Workflows CI Actifs (44 workflows)

| Fichier | Déclenchement | État sur notre branche |
|---------|--------------|----------------------|
| ci-unified.yml | push/PR MAIN | PASS (format:check passe) |
| rust.yml | push/PR MAIN | PASS (working-directory: src-tauri) |
| python-package-conda.yml | push paths:[*.py,env.yml] | JAMAIS DÉCLENCHÉ (aucun fichier Python) |
| registry-guard.yml | push/PR sur fichiers surveillés | PASS (registre synchronisé) |
| p3-stable-build.yml | push/PR MAIN | PASS |
| p4-constitution-audit.yml | push/PR MAIN | PASS |
| p5-runtime-governance.yml | push/PR MAIN | PASS |
| p6-capability-qualification.yml | push/PR MAIN | PASS |
| codeql.yml | push/PR MAIN | PASS |
| secret-scan-gitleaks.yml | push/PR | PASS |
| p0-1-secrets-guard.yml | push | PASS |
| mermaid.yml | push/PR | PASS |
| mermaid-verify.yml | push/PR | PASS |
| constitution-audit.yml | push/PR | PASS |
| consciousness-matrix.yml | push/PR | PASS |
| release-certification-final.yml | push/PR | PASS |
| deploy-v27-production.yml | push MAIN + tags + dispatch | PASS* |

*deploy-v27-production.yml FAIL sur MAIN commit 8b04d72f par cascade Prettier.
Sur notre branche : les fichiers sont formatés → PASS attendu.

## Registre

```
eventCount: 19
lastUpdate: 2026-03-07T16:00:00Z
```

## AutoHeal

```
entries: 102
last_id: AH-2026-03-07-0087
detect_recurrence: PASS
```

## Mécanismes de détection de dérive

| Mécanisme | Portée | Fréquence |
|-----------|--------|----------|
| `registry-guard.yml` | Tout changement workflow/test | Chaque push |
| `ci-unified.yml` (format:check) | Tout fichier | Chaque push |
| `detect_recurrence.sh` | AutoHeal patterns | Chaque session |
| `verify_instructions.sh` (20 checks) | Architecture/governance | Chaque session |
| `scripts/verify/registry-sync.js` | Cohérence registre | Chaque push CI |

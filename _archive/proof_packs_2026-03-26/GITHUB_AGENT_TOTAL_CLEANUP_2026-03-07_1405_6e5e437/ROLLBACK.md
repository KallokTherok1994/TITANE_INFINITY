# PLAN DE ROLLBACK

**Session:** GITHUB_AGENT_TOTAL_CLEANUP_2026-03-07_1405_6e5e437

---

## Rollback complet (revert commit)

```bash
git revert 6e5e437 --no-edit
git push origin copilot/audit-cleanup-autofix-workflows
```

## Rollback sélectif par correction

### FIX-001 + FIX-002 (rust.yml)
```bash
git restore -- .github/workflows/rust.yml
```

### FIX-003 (python-package-conda.yml Prettier)
```bash
git restore -- .github/workflows/python-package-conda.yml
```

### FIX-004 (Registry)
```bash
git restore -- runtime/registry/events.jsonl runtime/registry/snapshot.json runtime/registry/dashboard.md
```

## Impact du rollback

- Le CI `Rust` redeviendra en échec (no Cargo.toml)
- Le CI `TITANE∞ CI/CD Unified` redeviendra en échec (Prettier warn)
- Le Registry Guard redeviendra en échec
- Aucun autre workflow ou fonctionnalité n'est affecté

# Rollback Plan — BUILD ALL v33.0.18 — 2026-05-12

## Trigger conditions
- Format:check FAIL after bump
- Vitest < 9057 tests PASS
- System binary hash mismatch après dpkg install
- Desktop launcher affiche mauvaise version

## Rollback steps

### 1. Revert commits (si nécessaire)
```bash
git log --oneline -5  # identifier les commits BUILD ALL 33.0.18
git revert HEAD       # revert commit D (artifacts)
git revert HEAD~1     # revert commit C (bump)
git revert HEAD~2     # revert commit B (fixes)
```

### 2. Reinstaller l'ancienne version système
```bash
sudo dpkg -i deployment/latest/titane-infinity_33.0.17_amd64.deb
bash scripts/post-build/update-desktop-icons.sh
```

### 3. Vérifier le rollback
```bash
dpkg -s titane-infinity | grep Version  # doit afficher 33.0.17
pnpm run format:check                   # doit PASS
pnpm vitest run --reporter=dot 2>&1 | grep "Tests"  # doit afficher 9057 PASS
```

## Commits à reverter (session 2026-05-12)
- `319b911f4`: fix: workflow STORE_PATH + RELEASE_SURFACE_INVENTORY + prettier KB
- `d2e12c9ff`: build(33.0.18): version bump 33.0.17 → 33.0.18
- Phase D commit (artifacts + deployment/latest) — sha à renseigner après build

## Artifacts précédents disponibles
- `deployment/latest/titane-infinity_33.0.17_amd64.deb` (24M, sha256: 78dbc164aa3c9d7129e7ab221f2c7ad40d090ccef63e3fad665d4f45e56d82b4)
- `deployment/latest/titane-infinity_33.0.17_amd64.AppImage` (95M, sha256: 6356181854dbef7b4a29fa1764df519e218ebd0c720ab47eecb6d16d793ce4e0)

# RELEASE — TITANE∞ Production

**Version**: 26.3.0  
**Date**: 2026-01-15  
**Status**: SEALED  
**Type**: Production-ready Certified Release

---

## Table des matières

1. [Processus de release](#processus-de-release)
2. [Checklist pré-release](#checklist-pré-release)
3. [Artefacts](#artefacts)
4. [Updater (opt-in)](#updater-opt-in)
5. [Smoke tests](#smoke-tests)
6. [Rollback](#rollback)
7. [Post-release](#post-release)

---

## Processus de release

### Étape 1: Validation gates

**Toutes les gates DOIVENT être PASS** :

```bash
# Health check
bash scripts/health/health_check.sh --format both
# Résultat attendu: 15/16 PASS minimum (93%+ compliance)

# Capabilities drift
bash scripts/ci/check-capabilities-drift.sh
# Résultat attendu: GATE PASS ✅

# Constitution audit
bash scripts/audit/constitution-audit.sh --format both
# Résultat attendu: AUDIT PASS (0 FAIL)

# Tests contractuels
pnpm test -- tests/contract/tauri.contract.test.ts
# Résultat attendu: All tests passed

# Build stable
bash runtime/stable/build.sh
# Résultat attendu: AppImage + DEB créés, 0 secrets, whitelist respectée
```

**Si une gate échoue** : STOP. Corriger avant de continuer.

### Étape 2: Build artefacts production

```bash
# Clean workspace
git status --porcelain  # Doit être vide
bash scripts/maintenance/safe-run.sh clean-caches

# Build stable (production)
bash runtime/stable/build.sh

# Vérifier artefacts
ls -lah runtime/stable/*.AppImage
ls -lah runtime/stable/*.deb
sha256sum runtime/stable/*.AppImage runtime/stable/*.deb
```

**Artefacts attendus** :
- `Titan-Stable_<VERSION>_amd64.AppImage`
- `Titan-Stable_<VERSION>_amd64.deb`
- Pas de .env, .tunnel-access.txt, ou secrets

### Étape 3: Smoke tests

```bash
# Smoke test AppImage (90s keepalive)
bash scripts/smoke/smoke_stable_appimage.sh

# Smoke test DEB installed (si applicable)
bash scripts/smoke/smoke_stable_installed.sh

# Résultat attendu: exit 0, app reste alive timeout, 0 ERROR logs
```

### Étape 4: Tagging & versioning

```bash
# Tag release
git tag -a v26.3.0 -m "Release v26.3.0 - Production Certified"

# Push tag
git push origin v26.3.0

# Vérifier tag distant
git ls-remote --tags origin | grep v26.3.0
```

### Étape 5: Publish artefacts

```bash
# Copier vers deployment/latest
cp runtime/stable/Titan-Stable_26.3.0_amd64.AppImage deployment/latest/
cp runtime/stable/Titan-Stable_26.3.0_amd64.deb deployment/latest/

# Mettre à jour MANIFEST.json
bash scripts/release/update-manifest.sh 26.3.0

# Commit deployment
git add deployment/latest/
git commit -m "publish(latest): v26.3.0"
git push origin MAIN
```

### Étape 6: Release notes

Créer release GitHub avec:
- Version number (v26.3.0)
- Changelog (depuis CHANGELOG.md)
- Artefacts attachés (AppImage, DEB)
- SHA256 checksums
- Installation instructions

---

## Checklist pré-release

**Phase 0: Security** ✅
- [ ] Secret scan PASS (no secrets versionnés)
- [ ] Surface stable locked (allowlist.whitelist.stable.json)
- [ ] API_SURFACE.md à jour

**Phase 2: Contract** ✅
- [ ] tauriClient.ts centralized
- [ ] No direct invoke() hors client
- [ ] Tests contractuels PASS

**Phase 3: Stable Build** ✅
- [ ] Build stable reproductible
- [ ] Artefacts propres (no secrets)
- [ ] Staging validé

**Phase 4: Constitution** ✅
- [ ] Constitution audit PASS
- [ ] CI constitution-audit PASS

**Phase 5: Runtime Governance** ✅
- [ ] Health check opérationnel (<2s, 16 checks)
- [ ] Observabilité standard (logs, rotation)
- [ ] Self-healing catalog (16 actions, playbook)
- [ ] Capabilities drift check PASS

**Release Production** 🎯
- [ ] All gates PASS
- [ ] Smoke tests PASS
- [ ] Git clean (no uncommitted changes)
- [ ] Tag créé
- [ ] Artefacts publiés

---

## Artefacts

### AppImage (portable)

**Fichier** : `Titan-Stable_<VERSION>_amd64.AppImage`  
**Taille** : ~100-150 MB  
**Usage** :

```bash
# Download
wget https://github.com/KallokTherok1994/TITANE_INFINITY/releases/download/v26.3.0/Titan-Stable_26.3.0_amd64.AppImage

# Make executable
chmod +x Titan-Stable_26.3.0_amd64.AppImage

# Run
./Titan-Stable_26.3.0_amd64.AppImage
```

**Avantages** :
- ✅ Portable (no system dependencies)
- ✅ Self-contained
- ✅ Run from any location

### DEB (system install)

**Fichier** : `Titan-Stable_<VERSION>_amd64.deb`  
**Taille** : ~100-150 MB  
**Usage** :

```bash
# Install
sudo dpkg -i Titan-Stable_26.3.0_amd64.deb

# Run
titane-infinity
# ou via application menu: "TITANE∞ Stable"

# Uninstall
sudo dpkg -r titan-stable
```

**Avantages** :
- ✅ System integration (menus, autostart)
- ✅ Updates via package manager
- ✅ Desktop entry included

### Checksums

**Fichier** : `deployment/latest/MANIFEST.json`

```json
{
  "version": "26.3.0",
  "release_date": "2026-01-15",
  "artifacts": {
    "appimage": {
      "filename": "Titan-Stable_26.3.0_amd64.AppImage",
      "sha256": "<hash>",
      "size_bytes": 123456789
    },
    "deb": {
      "filename": "Titan-Stable_26.3.0_amd64.deb",
      "sha256": "<hash>",
      "size_bytes": 123456789
    }
  }
}
```

---

## Updater (opt-in)

**Status actuel** : Manual updates only  
**Futur** : Opt-in auto-updater (v27.0.0+)

### Gouvernance updater (quand implémenté)

**Principes** :
- ✅ Opt-in (user consent required)
- ✅ Pubkey signature verification
- ✅ Rollback automatique si crash post-update
- ✅ Bandwidth-friendly (delta updates si possible)

**Endpoints** :
- `https://releases.titane-infinity.com/latest.json` (metadata)
- `https://releases.titane-infinity.com/v<VERSION>/` (artefacts)

**Pubkey** : (à générer avec Tauri updater)

**Rollback automatique** :
- Si app crash < 5min post-update → restaure version précédente
- Snapshot state avant update → restore si rollback
- User notification : "Update failed, rolled back to v26.2.0"

---

## Smoke tests

### smoke_stable_appimage.sh

**Durée** : 90s  
**Test** : AppImage keepalive + log scan

```bash
#!/usr/bin/env bash
set -euo pipefail

APP=$(ls -1 runtime/stable/*.AppImage | head -n 1)
LOG="runtime/stable/logs/smoke-$(date +%Y%m%d-%H%M%S).log"

echo "[SMOKE] Starting AppImage: $APP"

timeout 90s "$APP" >>"$LOG" 2>&1 || EC=$?

if [[ "${EC:-0}" -eq 124 ]]; then
  echo "✅ PASS: AppImage stayed alive 90s"
  exit 0
else
  echo "❌ FAIL: AppImage exited early (exit=$EC)"
  tail -n 100 "$LOG"
  exit 1
fi
```

### smoke_stable_installed.sh

**Durée** : 180s  
**Test** : DEB installé keepalive + log scan

```bash
#!/usr/bin/env bash
set -euo pipefail

LOG="/tmp/smoke-installed-$(date +%Y%m%d-%H%M%S).log"

echo "[SMOKE] Starting installed titane-infinity"

timeout 180s titane-infinity >>"$LOG" 2>&1 || EC=$?

if [[ "${EC:-0}" -eq 124 ]]; then
  echo "✅ PASS: Installed app stayed alive 180s"
  exit 0
else
  echo "❌ FAIL: Installed app exited early (exit=$EC)"
  tail -n 100 "$LOG"
  exit 1
fi
```

---

## Rollback

### Scénario 1: Rollback avant tag

**Situation** : Build échoue ou smoke tests FAIL avant tag créé.

**Action** :
```bash
# Revert uncommitted changes
git restore runtime/stable/*.AppImage runtime/stable/*.deb

# Clean artefacts
rm -f runtime/stable/*.AppImage runtime/stable/*.deb

# Re-run build après fix
bash runtime/stable/build.sh
```

### Scénario 2: Rollback après tag

**Situation** : Release publiée mais crash reports en production.

**Action** :
```bash
# Retirer tag distant
git push origin :refs/tags/v26.3.0

# Supprimer tag local
git tag -d v26.3.0

# Revert release commit si applicable
git revert <commit-sha>
git push origin MAIN

# Publier hotfix ou restaurer version précédente
git checkout v26.2.0
bash runtime/stable/build.sh
# Tag hotfix: v26.2.1
```

### Scénario 3: User rollback (manuel)

**AppImage** :
```bash
# User keeps old versions
./Titan-Stable_26.2.0_amd64.AppImage  # Revert to previous
```

**DEB** :
```bash
# Downgrade via dpkg
sudo dpkg -i Titan-Stable_26.2.0_amd64.deb
```

---

## Post-release

### Monitoring (48h post-release)

- [ ] GitHub Issues: Check crash reports
- [ ] Logs: Review runtime logs (si telemetry opt-in implémenté)
- [ ] Community feedback: Discord, GitHub Discussions

### Hotfix criteria

**Créer hotfix (v26.3.1) si** :
- ❌ Crash rate > 5% des users
- ❌ Data loss possible
- ❌ Security vulnerability critique

**Ne PAS créer hotfix pour** :
- ✅ UI minor bugs (attendre next minor)
- ✅ Feature requests (backlog)
- ✅ Performance non-critiques

### Version suivante

**v26.4.0** (minor) :
- Nouvelles commands stables (opt)
- Améliorations non-breaking

**v27.0.0** (major) :
- Breaking changes allowlist
- Command dépréciation (>6 mois)
- Architecture changes

---

## Références

- **Build stable** : `runtime/stable/build.sh`
- **Smoke tests** : `scripts/smoke/`
- **Manifest** : `deployment/latest/MANIFEST.json`
- **Changelog** : `CHANGELOG.md`
- **Constitution audit** : `scripts/audit/constitution-audit.sh`
- **Health check** : `scripts/health/health_check.sh`

---

**SEALED** : RELEASE_PRODUCTION (2026-01-15)  
**Mainteneur** : Kevin Thibault (TITANE∞)  
**Prochaine release** : v26.4.0 (date TBD)

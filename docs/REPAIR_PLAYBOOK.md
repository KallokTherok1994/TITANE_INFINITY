# TITANE∞ — Repair Playbook

**Phase** : PHASE_5 (Runtime Governance & Operational Integrity)  
**Version** : 1.0.0  
**Date** : 16 janvier 2026  

---

## 🎯 Objectif

Ce playbook définit **10 scénarios de réparation** avec diagnostic guidé et actions safe-run.

**Principe** : *Pas d'improvisation. Chaque symptôme → diagnostic → action vérifiable.*

---

## 🛠️ Scénarios de Réparation

### Scénario 1 : Dépendances corrompues / obsolètes

**Symptômes** :
```bash
$ pnpm run dev
Error: Cannot find module 'vite'
```

**Diagnostic** :
```bash
# Health check
bash scripts/health/health_check.sh --format text

# Vérifier node_modules
ls -la node_modules/ | head -n 20

# Vérifier pnpm-lock.yaml
git status pnpm-lock.yaml
```

**Action safe-run** :
```bash
scripts/maintenance/safe-run.sh install-deps
```

**Résultat attendu** :
```
✓ node_modules/ recréé avec toutes dépendances
✓ pnpm install exit 0
✓ Health check: toolchain PASS
```

**Durée estimée** : 2-5 minutes

---

### Scénario 2 : Tests échouent (régression)

**Symptômes** :
```bash
$ pnpm test
FAIL tests/contract/tauri.contract.test.ts
  Expected 247, got 246
```

**Diagnostic** :
```bash
# Lancer health check + constitution audit
scripts/maintenance/safe-run.sh health-check
scripts/maintenance/safe-run.sh constitution-audit

# Vérifier derniers commits
git log -5 --oneline

# Identifier tests échoués
pnpm test -- --run --reporter=verbose 2>&1 | grep FAIL
```

**Action safe-run** :
```bash
# Re-run tests avec détails
scripts/maintenance/safe-run.sh test-contract
scripts/maintenance/safe-run.sh test-gate-p3
scripts/maintenance/safe-run.sh test-gate-p4
```

**Résultat attendu** :
```
✓ Tests passent 100%
✓ Constitution audit: 13/13 checks PASS
✓ Git bisect identifie commit régressif (si persistant)
```

**Durée estimée** : 5-10 minutes

---

### Scénario 3 : Ports dev bloqués (Vite/Tauri ne démarrent pas)

**Symptômes** :
```bash
$ pnpm run dev:tauri
Error: Address already in use: 127.0.0.1:5173
```

**Diagnostic** :
```bash
# Check ports explicite
scripts/maintenance/safe-run.sh ports-check-explicit

# Identifier PIDs
pgrep -af 'vite|tauri dev'

# Logs Vite/Tauri
tail -n 50 runtime/dev/logs/vite.log
tail -n 50 runtime/dev/logs/tauri.log
```

**Action safe-run** :
```bash
# Stop processus dev
scripts/maintenance/safe-run.sh stop-dev

# Vérifier ports libérés
scripts/maintenance/safe-run.sh check-dev-ports
```

**Résultat attendu** :
```
✓ Aucun processus vite/tauri dev
✓ Ports 4000, 5173, 4173, 1430 libres
✓ Logs cleanup effectué
```

**Durée estimée** : 1-2 minutes

---

### Scénario 4 : Build stable échoue (compilation Rust/Tauri)

**Symptômes** :
```bash
$ TITANE_PROD_OK=1 scripts/maintenance/safe-run.sh build-stable
ERROR: Compiling failed
error[E0425]: cannot find function `chat_generate`
```

**Diagnostic** :
```bash
# Vérifier derniers logs build
LOG=$(ls -t runtime/stable/logs/stable-build-*.log | head -n 1)
grep -nE 'ERROR|error\[E' "$LOG" | tail -n 50

# Health check pre-build
scripts/maintenance/safe-run.sh health-check

# Constitution audit
scripts/maintenance/safe-run.sh constitution-audit

# Vérifier allowlist stable
jq '.app.security.capabilities[0].allow | length' \
   src-tauri/allowlist.whitelist.stable.json
```

**Action safe-run** :
```bash
# Nettoyer caches build
scripts/maintenance/safe-run.sh clean-caches

# Si allowlist modifiée, valider contrat
scripts/maintenance/safe-run.sh test-contract

# Re-build
TITANE_PROD_OK=1 scripts/maintenance/safe-run.sh build-stable
```

**Résultat attendu** :
```
✓ Compilation Rust success
✓ AppImage généré: runtime/stable/Titan-Stable_*.AppImage
✓ Build manifest créé avec hash SHA256
✓ Logs sans ERROR/panic
```

**Durée estimée** : 15-25 minutes (build complet)

---

### Scénario 5 : Secrets exposés dans logs

**Symptômes** :
```bash
# Audit trouve secrets
$ grep -rE 'api[_-]?key.*[:=].*[A-Za-z0-9+/]{20,}' runtime/stable/logs/
runtime/stable/logs/stable-build-20260116.log:ERROR Failed: GEMINI_API_KEY=AIzaSy...
```

**Diagnostic** :
```bash
# Identifier fichiers compromis
grep -rl 'api[_-]?key\|token\|password' runtime/stable/logs/

# Vérifier si secrets actifs
# (si oui, rotation immédiate requise hors playbook)
```

**Action safe-run** :
```bash
# Purger logs compromis (MANUEL, pas via safe-run)
rm -f runtime/stable/logs/stable-build-20260116.log

# Re-valider sécurité
scripts/maintenance/safe-run.sh health-check
grep 'No .env secrets' docs/_evidence/health/latest.txt
```

**Résultat attendu** :
```
✓ Logs compromis supprimés
✓ Health check: No .env secrets PASS
✓ Secrets rotés (manuel, hors playbook)
✓ Code corrigé pour redaction (si applicable)
```

**Durée estimée** : 10-30 minutes (+ rotation secrets)

**⚠️ CRITIQUE** : Si secrets actifs exposés, **rotation immédiate** requise avant toute autre action.

---

### Scénario 6 : Git working tree dirty (bloque safe-run)

**Symptômes** :
```bash
$ scripts/maintenance/safe-run.sh validate
ERROR: git working tree is dirty; commit/stash or re-run with --force
```

**Diagnostic** :
```bash
# Voir changements
git status --porcelain=v1 -b

# Voir diff
git diff --stat
git diff --cached --stat

# Identifier fichiers temporaires
git status --ignored
```

**Action safe-run** :
```bash
# Option 1: Commit changements
git add <files>
git commit -m "fix: ..."

# Option 2: Stash temporaire
git stash push -m "temp: safe-run prereq"

# Option 3: Force (si changements non-critiques)
scripts/maintenance/safe-run.sh validate --force
```

**Résultat attendu** :
```
✓ git status --porcelain=v1 vide
✓ safe-run actions acceptent clean_git check
```

**Durée estimée** : 1-5 minutes

---

### Scénario 7 : Caches corrompus (builds lents/échecs)

**Symptômes** :
```bash
$ pnpm run dev
[vite] Internal server error: Transform failed
```

**Diagnostic** :
```bash
# Vérifier taille caches
du -sh node_modules/.cache .vite-cache

# Logs Vite
tail -n 100 runtime/dev/logs/vite.log | grep -i error
```

**Action safe-run** :
```bash
# Stop dev runtime
scripts/maintenance/safe-run.sh stop-dev

# Clean caches
scripts/maintenance/safe-run.sh clean-caches

# Re-launch dev
scripts/maintenance/safe-run.sh launch-dev
```

**Résultat attendu** :
```
✓ Caches supprimés (node_modules/.cache, .vite-cache)
✓ Dev runtime redémarre proprement
✓ Vite/Tauri logs sans erreur
```

**Durée estimée** : 2-5 minutes

---

### Scénario 8 : Constitution audit échoue (non-compliance)

**Symptômes** :
```bash
$ scripts/maintenance/safe-run.sh constitution-audit
❌ AUDIT FAILED: 1 check failed
FAIL [PHASE_2] No direct invoke() calls: 3 violations
```

**Diagnostic** :
```bash
# Voir rapport détaillé
cat reports/constitution-audit-*.json | jq '.results[] | select(.status == "FAIL")'

# Identifier fichiers violant
rg "invoke\(" src/ --files-with-matches \
   --glob='!src/lib/tauriClient.ts' \
   --glob='!src/lib/invoke.ts' \
   --glob='!src/__tests__/**'
```

**Action safe-run** :
```bash
# Re-run tests contractuels
scripts/maintenance/safe-run.sh test-contract

# Si tests passent, problème exclusion audit
# → Ajuster constitution-audit.sh exclusions (manuel)

# Re-audit
scripts/maintenance/safe-run.sh constitution-audit
```

**Résultat attendu** :
```
✓ Audit: 13/13 checks PASS
✓ Compliance: 100%
✓ Aucune violation contrat TS ↔ Tauri
```

**Durée estimée** : 5-15 minutes

---

### Scénario 9 : Health check échoue (toolchain manquant)

**Symptômes** :
```bash
$ scripts/maintenance/safe-run.sh health-check
✗ [Toolchain] Node.js version: Expected v20+, got NOT_FOUND
```

**Diagnostic** :
```bash
# Vérifier Node bundled
ls -la .tools/node/current/bin/node

# Vérifier PATH
echo $PATH | grep -o '.tools/node'

# Vérifier pnpm bundled
.tools/node/current/bin/pnpm --version
```

**Action safe-run** :
```bash
# Si toolchain bundled absent, réinstaller (MANUEL)
# Voir docs/SETUP.md ou équivalent

# Si PATH incorrect, fix shell
export PATH="$PWD/.tools/node/current/bin:$PATH"

# Re-check
scripts/maintenance/safe-run.sh health-check
```

**Résultat attendu** :
```
✓ Node.js: v24.0.0
✓ pnpm: 10.28.0
✓ Rust: 1.91.1
✓ Health compliance: 93.8%+
```

**Durée estimée** : 5-10 minutes

---

### Scénario 10 : Staging stable plein (>100GB)

**Symptômes** :
```bash
$ du -sh src-tauri/target/
87G     src-tauri/target/

$ df -h .
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       500G  480G   20G  96% /
```

**Diagnostic** :
```bash
# Identifier taille artifacts
du -sh src-tauri/target/release/bundle
du -sh runtime/stable/logs/

# Compter logs anciens
find runtime/stable/logs -name 'stable-build-*.log' -mtime +30 | wc -l
```

**Action safe-run** :
```bash
# Clean staging (PRODUCTION ACTION)
TITANE_PROD_OK=1 scripts/maintenance/safe-run.sh reset-staging-stable

# Vérifier gain espace
du -sh src-tauri/target/
```

**Résultat attendu** :
```
✓ src-tauri/target/release/bundle supprimé
✓ Logs >30 jours supprimés
✓ Espace disque récupéré: ~70GB
✓ Prêt pour nouveau build stable
```

**Durée estimée** : 2-5 minutes

---

## 📋 Diagnostic Rapide (Flowchart)

```
START
  │
  ├─> Symptôme: Tests FAIL
  │   └─> Action: test-contract / test-gate-p3 / test-gate-p4
  │
  ├─> Symptôme: Build FAIL
  │   └─> Action: clean-caches → build-stable
  │
  ├─> Symptôme: Ports bloqués
  │   └─> Action: stop-dev → check-dev-ports
  │
  ├─> Symptôme: Deps manquantes
  │   └─> Action: install-deps
  │
  ├─> Symptôme: Audit non-compliant
  │   └─> Action: constitution-audit → fix code → re-audit
  │
  ├─> Symptôme: Secrets exposés
  │   └─> Action: PURGE logs + rotation secrets (MANUEL)
  │
  ├─> Symptôme: Git dirty
  │   └─> Action: commit/stash → retry
  │
  ├─> Symptôme: Caches corrompus
  │   └─> Action: stop-dev → clean-caches → launch-dev
  │
  ├─> Symptôme: Toolchain absent
  │   └─> Action: health-check → reinstall toolchain (MANUEL)
  │
  └─> Symptôme: Espace disque plein
      └─> Action: reset-staging-stable (TITANE_PROD_OK=1)
```

---

## ✅ Validation Post-Réparation

Après toute action de réparation, **valider** :

```bash
# 1. Health check
scripts/maintenance/safe-run.sh health-check
cat docs/_evidence/health/latest.txt | grep 'Status:'
# → HEALTHY

# 2. Constitution audit
scripts/maintenance/safe-run.sh constitution-audit
cat reports/constitution-audit-*.json | jq '.summary.compliance_percentage'
# → 100.0

# 3. Tests contractuels
scripts/maintenance/safe-run.sh test-contract
# → All tests PASS

# 4. Git propre
git status --porcelain=v1
# → (vide)

# 5. Ports dev fermés (si non-dev)
scripts/maintenance/safe-run.sh check-dev-ports
# → OK: no dev ports
```

---

## 🔗 Références

- **Actions catalog** : `scripts/maintenance/actions.yml`
- **Safe-run script** : `scripts/maintenance/safe-run.sh`
- **Health check** : `scripts/health/health_check.sh`
- **Constitution audit** : `scripts/audit/constitution-audit.sh`
- **Logging standard** : `runtime/LOGGING_STANDARD.md`
- **Observability guide** : `docs/RUNTIME_OBSERVABILITY.md`

---

## 📞 Escalade

Si aucun scénario ne correspond **ET** safe-run bloque :

1. **Documenter symptômes** : Logs, error messages, état système
2. **Health check + audit** : Capturer état complet
3. **Git status** : Vérifier changements récents
4. **Logs runtime** : Inspecter runtime/dev/logs/, runtime/stable/logs/
5. **Créer issue GitHub** : Avec tous contextes collectés

**⚠️ Ne JAMAIS** :
- Exécuter shell arbitraire hors safe-run
- Modifier configs production (allowlist, tauri.conf) sans approval
- Supprimer artefacts production sans backup

---

**Version** : 1.0.0  
**Last Updated** : 16 janvier 2026  
**Maintainer** : TITANE∞ Core Team  
**Status** : ✅ SEALED (PHASE_5 BLOC C)

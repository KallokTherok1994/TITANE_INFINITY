# Stopline Rebuild Proof - Documentation

**Ring**: Governance  
**Status**: STABLE  
**Version**: 1.0.0

## Overview

Workflow 100% automatisé pour générer une preuve complète (proof pack) qu'un build d'artefacts a été exécuté sur HEAD avec succès, sans actions manuelles.

## Objectif

Éliminer toute friction manuelle dans la validation de release :
- **Zéro** copier-coller
- **Zéro** vérification manuelle de timestamps
- **Zéro** calculation manuelle de SHA256
- **100%** traçabilité automatique avec sceau d'intégrité

## Usage

### Commande principale

```bash
TARGET_VERSION=v27.0.6-hotfix.2 \
CANON_CMD="pnpm run tauri:build" \
pnpm run stopline:rebuild-proof
```

Ou via script direct :

```bash
TARGET_VERSION=v27.0.6-hotfix.2 \
CANON_CMD="pnpm run tauri:build" \
bash scripts/stopline_rebuild_proof.sh
```

### Variables d'environnement

| Variable | Requis | Description | Exemple |
|----------|--------|-------------|---------|
| `TARGET_VERSION` | ✅ | Version cible à valider | `v27.0.6-hotfix.2` |
| `CANON_CMD` | ✅ | Commande de build canonique | `pnpm run tauri:build` |

**Alternative** : Créer `scripts/_canon_build_cmd.txt` avec la commande de build (1 ligne).

### Commandes associées

```bash
# Localiser le dernier rapport généré
pnpm run stopline:latest

# Afficher le statut du dernier rapport
cat "$(pnpm run -s stopline:latest)/STATUS.md"

# Afficher la demande de stopline clear
cat "$(pnpm run -s stopline:latest)/F_STOPLINE_CLEAR_REQUEST.txt"

# Vérifier l'intégrité du rapport
cd "$(pnpm run -s stopline:latest)" && sha256sum -c CHECKSUMS.sha256
```

## Validation Gates

Le script applique 4 gates stop-the-line :

| Gate | Description | Échec si... |
|------|-------------|-------------|
| **A - HEAD Clean** | Worktree sans modifications | `git status --porcelain` non vide |
| **B - Build OK** | Build complété avec succès | Exit code ≠ 0 |
| **C - Fresh Artifacts** | Artefacts générés après le build | mtime < build start timestamp |
| **D - SHA256 Complete** | Au moins 1 artefact validé | Aucun artefact trouvé |

## Outputs

Le script génère un rapport horodaté dans :

```
reports/FRESH_BUILD_PROOF_<VERSION>_<TIMESTAMP>/
├── 0_CANON_CMD.txt               # Commande de build utilisée
├── A_HEAD_LOCK.txt               # Commit SHA + état worktree
├── B_CLEANROOM.txt               # État avant build (artefacts existants)
├── C_BUILD.txt                   # Log de build (tail -100)
├── D_ARTEFACTS_MTIMES.txt        # Inventaire + validation freshness
├── E_SHA256.txt                  # SHA256 de tous les artefacts
├── F_STOPLINE_CLEAR_REQUEST.txt  # Demande formelle de stopline clear
├── STATUS.md                     # Verdict final (READY / BLOCKED)
└── CHECKSUMS.sha256              # Sceau d'intégrité (tous les fichiers ci-dessus)
```

## Exit Codes

| Code | Signification |
|------|---------------|
| `0` | ✅ **READY_FOR_STOPLINE_CLEAR** : tous les gates passés |
| `1` | ❌ **BLOCKED** : au moins un gate a échoué |

## Workflow Complet

```bash
# 1. Préparer HEAD (commit propre requis)
git status --porcelain  # doit être vide

# 2. Exécuter le rebuild avec proof
TARGET_VERSION=v27.0.6-hotfix.2 \
CANON_CMD="pnpm run tauri:build" \
pnpm run stopline:rebuild-proof

# 3. Vérifier le verdict
echo $?  # doit être 0

# 4. Consulter le rapport
pnpm run -s stopline:latest

# 5. Valider l'intégrité
cd "$(pnpm run -s stopline:latest)" && sha256sum -c CHECKSUMS.sha256

# 6. Lire la demande de stopline clear
cat "$(pnpm run -s stopline:latest)/F_STOPLINE_CLEAR_REQUEST.txt"
```

## Exemple de Sortie (Succès)

```
ℹ️  Block 0️⃣: Canon Build Command
ℹ️  Block A: HEAD lock + worktree clean check
✅ HEAD clean: c9adfd3ec2daa14475d7693022d388d3a4b95f6d on hotfix/v27.0.6-hotfix.1
ℹ️  Block B: Cleanroom preparation
✅ Cleanroom prepared: /path/to/.build_cleanroom/20260224_143522
ℹ️  Block C: Build execution
ℹ️  Running: pnpm run tauri:build
ℹ️  Log: /path/to/.build_cleanroom/20260224_143522/build.log
✅ Build succeeded (exit 0)
ℹ️  Block D: Artifacts inventory + mtime validation
✅ All 2 artifacts are fresh
ℹ️  Block E: SHA256 provenance
✅ SHA256 provenance recorded
ℹ️  Block F: Stopline clear request
✅ Stopline clear request generated
ℹ️  Generating STATUS.md
ℹ️  Sealing report checksums...
✅ Sealed: 9 files in CHECKSUMS.sha256
✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Stopline Rebuild Proof Complete
✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅
✅ Version:      v27.0.6-hotfix.2
✅ HEAD:         c9adfd3ec2daa14475d7693022d388d3a4b95f6d
✅ Fresh count:  2 artifacts
✅
✅ Report directory:
✅   /path/to/reports/FRESH_BUILD_PROOF_v27.0.6-hotfix.2_20260224_143522
✅
✅ Verdict: READY_FOR_STOPLINE_CLEAR ✅
✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Architecture

```
┌──────────────────────────────────────────┐
│ Operator                                 │
└──────────────┬───────────────────────────┘
               │
               │ TARGET_VERSION + CANON_CMD
               ▼
┌──────────────────────────────────────────┐
│ stopline_rebuild_proof.sh                │
├──────────────────────────────────────────┤
│ A. Gate: HEAD Clean?                     │
│ B. Cleanroom: Backup old artifacts       │
│ C. Execute: CANON_CMD (full env)         │
│ D. Gate: Fresh artifacts? (mtime)        │
│ E. Provenance: SHA256 all artifacts      │
│ F. Generate: Stopline clear request      │
│ G. Seal: CHECKSUMS.sha256                │
└──────────────┬───────────────────────────┘
               │
               │ Exit 0 (READY) / 1 (BLOCKED)
               ▼
┌──────────────────────────────────────────┐
│ reports/FRESH_BUILD_PROOF_<ver>_<ts>/    │
│ - 0_CANON_CMD.txt                        │
│ - A_HEAD_LOCK.txt                        │
│ - B_CLEANROOM.txt                        │
│ - C_BUILD.txt                            │
│ - D_ARTEFACTS_MTIMES.txt                 │
│ - E_SHA256.txt                           │
│ - F_STOPLINE_CLEAR_REQUEST.txt           │
│ - STATUS.md                              │
│ - CHECKSUMS.sha256 (seal)                │
└──────────────────────────────────────────┘
```

## Intégration CI/CD

```bash
#!/usr/bin/env bash
set -euo pipefail

VERSION="v27.0.6-hotfix.2"
CANON_CMD="pnpm run tauri:build"

if ! TARGET_VERSION="$VERSION" CANON_CMD="$CANON_CMD" pnpm run stopline:rebuild-proof; then
  echo "❌ Stopline rebuild proof FAILED"
  exit 1
fi

echo "✅ Stopline rebuild proof PASSED"
PROOF_DIR="$(pnpm run -s stopline:latest)"
echo "📁 Proof pack: $PROOF_DIR"

# Archive proof pack for CI artifacts
tar -czf "proof_pack_${VERSION}.tar.gz" "$PROOF_DIR"
```

## Troubleshooting

### Erreur : Worktree not clean

```
❌ GATE FAIL: Worktree not clean. Commit or stash changes.
```

**Solution** : Committer ou stasher toutes les modifications.

```bash
git status
git add . && git commit -m "chore: prepare for release"
# OU
git stash
```

### Erreur : Build failed

```
❌ GATE FAIL: Build failed with exit 1. Check log: /path/to/build.log
```

**Solution** : Vérifier le log de build pour identifier l'erreur.

```bash
less /path/to/.build_cleanroom/<timestamp>/build.log
```

### Erreur : Stale artifacts

```
❌ GATE FAIL: Found 2 stale artifacts. Build may not have regenerated all files.
```

**Solution** : Nettoyer le dossier bundle avant rebuild.

```bash
rm -rf src-tauri/target/release/bundle
```

### Erreur : No fresh artifacts found

```
❌ GATE FAIL: No fresh artifacts found. Build did not produce expected outputs.
```

**Solution** : Vérifier que CANON_CMD est correct et génère bien des artefacts.

```bash
# Tester manuellement
pnpm run tauri:build
ls -lah src-tauri/target/release/bundle/
```

## Security

**Aucun secret ne doit apparaître dans les rapports.**

Les logs de build peuvent contenir :
- Variables d'environnement non sensibles
- Paths locaux
- Noms de fichiers

**Le script filtre automatiquement** :
- Aucun env var secret n'est propagé dans les logs visibles
- Seul `tail -100` du build log est inclus dans le rapport

**Vérification manuelle recommandée** avant commit du proof pack.

## Changelog

### v1.0.0 (2026-02-24)
- ✨ Initial release
- 🎯 100% automated proof workflow
- 🔒 4 validation gates (HEAD clean, build OK, fresh artifacts, SHA256)
- 📦 Auto-generated timestamped reports in `reports/`
- 🔐 Sealed with CHECKSUMS.sha256
- 🚀 pnpm integration via `stopline:rebuild-proof` and `stopline:latest`

## See Also

- [AUDIT_GATES_CHECKLIST.md](91_reports/AUDIT_GATES_CHECKLIST.md) : Liste complète des gates de validation
- [AUTHORIZATION_PRODUCTION_DEPLOYMENT.md](01_misc/AUTHORIZATION_PRODUCTION_DEPLOYMENT_v27.0.1.md) : Processus d'autorisation PROD
- [scripts/stopline_rebuild_proof.sh](../scripts/stopline_rebuild_proof.sh) : Script principal
- [scripts/stopline_latest_report.sh](../scripts/stopline_latest_report.sh) : Helper pour localiser le dernier rapport

---

**Maintenu par** : TITANE∞ Governance  
**Dernière mise à jour** : 2026-02-24

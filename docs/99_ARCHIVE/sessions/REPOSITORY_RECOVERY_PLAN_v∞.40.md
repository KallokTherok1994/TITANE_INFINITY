# 🔥 TITANE∞ v∞.40 — REPOSITORY RECOVERY PLAN

**Date**: 5 décembre 2025
**Objectif**: Réduire le dépôt de **21 Go → < 1 Go**
**Stratégie**: Nettoyage agressif + Git LFS + Restructuration

---

## 📊 DIAGNOSTIC COMPLET

### État Initial

| Composant | Taille | Statut | Action |
|-----------|--------|--------|--------|
| `.git/` | 5,9 Go | 🔴 Historique pollué | CLEAN |
| `tts-service/venv-parler-tts/` | 15 Go | 🔴 Python venv versionné | REMOVE |
| `src-tauri/target/` | 8,9 Go | 🔴 Build artifacts Rust | REMOVE |
| `node_modules/` | 1,3 Go | 🔴 NPM packages versionnés | REMOVE |
| `release/` | 255 Mo | ⚠️ Binaires versionnés | CLEAN |
| `TITANE_INFINITY-main.zip` | 98 Mo | ⚠️ Archive versionnée | REMOVE |
| Source code | ~20 Mo | ✅ Légitime | KEEP |

**Total actuel**: ~21 Go
**Total cible**: < 1 Go (idéalement 100-300 Mo)

---

## 🎯 PLAN D'ACTION

### Phase 1: Backup Critique (SÉCURITÉ)

```bash
# Créer backup complet AVANT toute opération
cd /home/titane/Documents/
tar -czf TITANE_INFINITY_BACKUP_$(date +%Y%m%d_%H%M%S).tar.gz TITANE_INFINITY/
# ⚠️ NE PAS committer ce backup
```

---

### Phase 2: Nettoyage Working Directory

#### 2.1 Supprimer fichiers lourds illégitimes

```bash
cd /home/titane/Documents/TITANE_INFINITY

# Supprimer Python venv (15 Go)
rm -rf tts-service/venv-parler-tts/
rm -rf tts-service/venv/

# Supprimer Rust target (8,9 Go)
rm -rf src-tauri/target/

# Supprimer node_modules (1,3 Go)
rm -rf node_modules/

# Supprimer releases versionnées (255 Mo)
rm -rf release/

# Supprimer archives (98 Mo)
rm -f TITANE_INFINITY-main.zip
rm -f *.zip
rm -f *.tar.gz

# Supprimer backups versionnés
rm -rf backup_*/

# Supprimer caches
rm -rf .vite/
rm -rf .cache/
rm -rf dist/
rm -rf playwright-report/
```

**Gain estimé**: ~25 Go libérés du working directory

---

### Phase 3: Configuration Git LFS

```bash
# Initialiser Git LFS
git lfs install

# Les règles LFS sont déjà dans .gitattributes
# Vérifier:
cat .gitattributes

# Migrer fichiers existants vers LFS (si nécessaire)
# Note: Actuellement aucun gros fichier légitime à garder
```

---

### Phase 4: Nettoyage Historique Git

#### Option A: Reconstruction propre (RECOMMANDÉE)

**Justification**: L'historique contient 5,9 Go de pollution (venv, target, node_modules versionnés)

```bash
cd /home/titane/Documents/TITANE_INFINITY

# 1. Sauvegarder remote URL
git remote get-url origin > .git_remote_backup.txt

# 2. Créer nouveau repo propre
rm -rf .git
git init

# 3. Ajouter tous les fichiers propres (respectant .gitignore)
git add .

# 4. Commit initial propre
git commit -m "TITANE∞ v∞.40 - Clean repository rebuild

- Removed: Python venvs (15 Go)
- Removed: Rust target artifacts (8.9 Go)
- Removed: node_modules (1.3 Go)
- Removed: Release binaries (255 Mo)
- Configured: Git LFS for large files
- Added: Professional .gitignore (2025)
- Result: Repository reduced from 21 Go to < 100 Mo

This is a clean rebuild preserving all source code and documentation.
Previous history archived externally."

# 5. Reconnecter remote
git remote add origin $(cat .git_remote_backup.txt)

# 6. Force push (⚠️ DESTRUCTIF)
git push -f origin main
```

**Résultat attendu**: Dépôt réduit à **50-100 Mo** (code source uniquement)

---

#### Option B: Nettoyage sélectif (Si historique à préserver)

```bash
# Installer git-filter-repo
pip install git-filter-repo

# Analyser gros fichiers
git-filter-repo --analyze

# Supprimer chemins spécifiques de l'historique
git-filter-repo --path tts-service/venv-parler-tts --invert-paths
git-filter-repo --path src-tauri/target --invert-paths
git-filter-repo --path node_modules --invert-paths
git-filter-repo --path release --invert-paths

# Force garbage collect
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Note**: Option B complexe, risque de casser l'historique. **Option A recommandée**.

---

### Phase 5: Optimisation Post-nettoyage

```bash
# Garbage collection agressive
git gc --aggressive --prune=now

# Vérifier taille finale
du -sh .git
git count-objects -vH

# Repack optimisé
git repack -a -d --depth=250 --window=250

# Vérifier intégrité
git fsck --full
```

---

### Phase 6: Validation & Test

```bash
# 1. Vérifier .gitignore
git status --ignored

# 2. Vérifier que les fichiers lourds sont ignorés
ls -lh tts-service/ 2>/dev/null || echo "✅ venv supprimé"
ls -lh src-tauri/target/ 2>/dev/null || echo "✅ target supprimé"
ls -lh node_modules/ 2>/dev/null || echo "✅ node_modules supprimé"

# 3. Test build
pnpm install  # Recrée node_modules LOCALEMENT
pnpm run type-check
pnpm run build

# 4. Vérifier taille totale
du -sh . --exclude='.git'
du -sh .git

# 5. Test commit
git add .
git commit -m "Test commit after cleanup"
git push origin main
```

---

## 📋 RÉSUMÉ DES CHANGEMENTS

### Fichiers créés/modifiés

1. ✅ `.gitignore` (nouveau) — 200+ lignes, exhaustif
2. ✅ `.gitattributes` (nouveau) — Git LFS configuration
3. ✅ `REPOSITORY_RECOVERY_PLAN_v∞.40.md` (ce document)

### Fichiers supprimés (working directory)

- ❌ `tts-service/venv-parler-tts/` (15 Go)
- ❌ `src-tauri/target/` (8,9 Go)
- ❌ `node_modules/` (1,3 Go)
- ❌ `release/` (255 Mo)
- ❌ `*.zip`, `*.tar.gz` (98 Mo)
- ❌ `backup_*/` (plusieurs Mo)
- ❌ Caches divers (dist/, .vite/, etc.)

### Historique Git

**Option A (recommandée)**: Reconstruit proprement
**Option B (alternative)**: Nettoyé sélectivement avec git-filter-repo

---

## 🎯 RÉSULTAT ATTENDU

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Working directory** | 21 Go | 50 Mo | 99,8% |
| **.git size** | 5,9 Go | 20 Mo | 99,7% |
| **Total** | ~27 Go | ~70 Mo | **99,7%** |
| **Push time** | ∞ (échec) | < 10s | ✅ |
| **Clone time** | ∞ (échec) | < 5s | ✅ |

---

## 🔒 SÉCURITÉ & ROLLBACK

### Backup créé

```bash
/home/titane/Documents/TITANE_INFINITY_BACKUP_<timestamp>.tar.gz
```

**⚠️ IMPORTANT**: Conserver ce backup au moins 30 jours.

### Rollback d'urgence

```bash
cd /home/titane/Documents/
rm -rf TITANE_INFINITY/
tar -xzf TITANE_INFINITY_BACKUP_<timestamp>.tar.gz
```

---

## 🚀 WORKFLOW POST-NETTOYAGE

### Règles strictes (à respecter)

1. ❌ **JAMAIS** commit `node_modules/` → Toujours dans `.gitignore`
2. ❌ **JAMAIS** commit `src-tauri/target/` → Build artifacts locaux
3. ❌ **JAMAIS** commit `venv/`, `venv-*/` → Python venvs locaux
4. ❌ **JAMAIS** commit modèles IA (*.gguf, *.bin, *.pt) → Trop lourds
5. ✅ **TOUJOURS** vérifier `git status --ignored` avant commit
6. ✅ **TOUJOURS** utiliser Git LFS pour fichiers > 10 Mo

### Installation environnement local

```bash
# NPM packages
pnpm install

# Rust dependencies (auto lors du build Tauri)
cd src-tauri
cargo build

# Python venv (TTS service)
cd tts-service
python3 -m venv venv-parler-tts
source venv-parler-tts/bin/activate
pip install -r requirements.txt
```

**Note**: Ces commandes **recréent** les environnements localement. Ne JAMAIS commit le résultat.

---

## 📈 MONITORING POST-CLEANUP

### Vérifications quotidiennes (1 semaine)

```bash
# Taille repo
du -sh .git

# Fichiers staging suspects
git status --ignored

# Taille derniers commits
git log --oneline -5 --format="%h %s" | while read hash msg; do
  size=$(git cat-file -s $hash 2>/dev/null || echo 0)
  echo "$hash: $size bytes - $msg"
done
```

### Alertes à mettre en place

- Si `.git/` > 500 Mo → Enquête
- Si working directory > 2 Go → Vérifier .gitignore
- Si push time > 30s → Fichier lourd potentiel

---

## 🔮 ARCHITECTURE LONG TERME

### Séparation données / code

**Recommandation**: Externaliser données lourdes

```bash
# Créer structure externe
mkdir -p /data/titane/{models,datasets,memory,logs,assets}

# Liens symboliques
ln -s /data/titane/models tts-service/models
ln -s /data/titane/memory memory
ln -s /data/titane/logs logs
```

**Avantages**:
- Dépôt Git ultra-léger
- Backup données séparé du code
- Déploiement plus rapide
- Scalabilité

### Git LFS Storage externe

Pour projets nécessitant versioning de gros fichiers:
- **Option 1**: GitHub LFS (payant, 50 Go inclus dans Pro)
- **Option 2**: Gitea + LFS Server (self-hosted, gratuit)
- **Option 3**: DVC (Data Version Control, pour ML)

---

## ✅ CHECKLIST FINALE

Avant de considérer le nettoyage terminé:

- [ ] Backup créé et vérifié
- [ ] `.gitignore` et `.gitattributes` committés
- [ ] Fichiers lourds supprimés du working directory
- [ ] Historique Git nettoyé (Option A ou B)
- [ ] `git gc --aggressive` exécuté
- [ ] Taille `.git/` < 100 Mo validée
- [ ] `pnpm install` + `pnpm run build` réussi
- [ ] Test commit + push réussi
- [ ] Documentation mise à jour
- [ ] Équipe notifiée (si travail en équipe)

---

## 🎉 CONCLUSION

Ce plan transforme un dépôt **non-maintenable de 27 Go** en un dépôt **professionnel de < 100 Mo**.

**Prochaines étapes après nettoyage**:
1. ✅ Phase 7: Consistency Engine (Goals & Facts)
2. ✅ Phase 8: Voice complete (STT/VAD/TTS tests)
3. ✅ Phase 9: Tests E2E complets
4. ✅ Phase 10: Observabilité & Self-heal

🚀 **TITANE∞ prêt pour production et collaboration professionnelle.**

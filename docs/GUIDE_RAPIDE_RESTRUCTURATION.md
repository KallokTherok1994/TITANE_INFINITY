# 🚀 Guide Rapide - Restructuration Documentation v26.2

**Objectif:** Passer de 282 → 7 fichiers .md à la racine  
**Temps:** ~10 minutes  
**Risque:** Faible (backup automatique + git history préservé)

---

## 📋 Pré-requis

- [x] Git propre (pas de modifications non committées)
- [x] Backup externe recommandé (optionnel)
- [x] Accès en écriture au repository

---

## ⚡ Méthode Rapide (Automatisée)

### Étape 1: Lancer le Script de Migration

```bash
# À la racine du projet
cd /home/titane-os/Documents/GitHub/TITANE_INFINITY

# Exécuter le script de migration
bash scripts/docs/migrate-v26.2.sh
```

**Le script va:**
1. Créer une branche `feature/docs-restructure-v26.2`
2. Créer un backup dans `docs/backup_YYYYMMDD/`
3. Déplacer les fichiers (git mv)
4. Créer la nouvelle structure
5. Générer les fichiers INDEX.md
6. Afficher les statistiques

### Étape 2: Valider la Structure

```bash
# Vérifier que tout est OK
bash scripts/docs/validate-structure.sh
```

**Vérifications:**
- ✅ Fichiers racine ≤ 10
- ✅ Pas de versions obsolètes dans docs/current
- ✅ Structure docs/ complète
- ✅ Fichiers INDEX.md présents

### Étape 3: Review & Commit

```bash
# Voir les changements
git status
git diff --stat

# Tester le build
pnpm run build

# Commit avec template
git add .
git commit -F .git/COMMIT_EDITMSG_TEMPLATE

# Push
git push origin feature/docs-restructure-v26.2
```

### Étape 4: Créer PR

1. Aller sur GitHub
2. Créer Pull Request depuis `feature/docs-restructure-v26.2` → `MAIN`
3. Titre: `refactor(docs): restructuration v26.2 - 282→7 fichiers racine`
4. Description: Copier contenu de `.git/COMMIT_EDITMSG_TEMPLATE`
5. Demander review (2+ reviewers recommandés)

---

## 🔧 Méthode Manuelle (Si Script Échoue)

### 1. Créer Branche

```bash
git checkout -b feature/docs-restructure-v26.2
```

### 2. Créer Structure

```bash
mkdir -p docs/current/{audits,phases/completed,guides,architecture,performance}
mkdir -p docs/archive/{v24,v25,sessions}
mkdir -p docs/backup_$(date +%Y%m%d)
```

### 3. Backup

```bash
cp *.md docs/backup_$(date +%Y%m%d)/
```

### 4. Déplacer Fichiers

```bash
# Archives v24
git mv *v24*.md docs/archive/v24/

# Archives v25
git mv *v25*.md docs/archive/v25/

# Sessions
git mv AUTO_*.md RAPPORT_*.md REFLEXION_*.md SESSION_*.md SUPER_PROMPT_*.md docs/archive/sessions/

# Audits v26
git mv AUDIT_*v26*.md docs/current/audits/

# Phases
git mv PHASE_*.md docs/current/phases/completed/
```

### 5. Fichiers INDEX

Copier depuis `ANALYSE_REFLEXION_DOCUMENTATION_v26.2_OPTIMISATION.md` (Annexe B)

---

## 🎯 Résultat Attendu

### Avant

```
TITANE_INFINITY/
├── README.md
├── AUDIT_FINAL_13.md
├── AUDIT_FINAL_v26.2_COMPLETE.md
├── AUDIT_HOOKS_v26.2_COMPLETE.md
├── AUTO_ALL_v26.2_COMPLETE.md
├── PHASE_1_COMPLETE.md
├── ... (277 autres fichiers .md)
└── docs/
```

### Après

```
TITANE_INFINITY/
├── README.md                    ✅
├── QUICKSTART_UBUNTU_24.04.md  ✅
├── CHANGELOG.md                 ✅
├── CONTRIBUTING.md              ✅
├── CODE_STYLE.md                ✅
├── LICENSE.md                   ✅
├── ARCHITECTURE.md              ✅
└── docs/
    ├── current/                 ✅ Documentation v26 active
    │   ├── INDEX.md
    │   ├── audits/
    │   ├── phases/
    │   ├── guides/
    │   ├── architecture/
    │   └── performance/
    └── archive/                 ✅ Legacy versions
        ├── v24/
        ├── v25/
        └── sessions/
```

---

## 🔍 Vérification Rapide

### Compteur Fichiers

```bash
# Devrait afficher ~7
ls -1 *.md | wc -l

# Devrait afficher 37+
ls -1 docs/archive/v24/*.md | wc -l

# Devrait afficher 118+
ls -1 docs/archive/v25/*.md | wc -l
```

### Test Navigation

```bash
# Ouvrir documentation actuelle
cat docs/current/INDEX.md

# Ouvrir audit hooks v26
cat docs/current/audits/AUDIT_HOOKS_v26.2_COMPLETE.md
```

---

## ❓ FAQ

### Q: Puis-je annuler la migration ?

**Oui, facilement:**

```bash
# Revenir à la branche précédente
git checkout MAIN

# Supprimer branche migration (si pas mergée)
git branch -D feature/docs-restructure-v26.2

# Restaurer depuis backup si nécessaire
cp docs/backup_YYYYMMDD/*.md .
```

### Q: Les liens internes vont-ils casser ?

**Partiellement, mais:**
- Git history préservé (git mv, pas de suppression)
- Fichiers toujours accessibles
- TODO: Script `scripts/docs/update-links.sh` à créer pour migration automatique

**Action manuelle temporaire:** Mettre à jour liens dans code si nécessaire

### Q: Que faire des fichiers exclus du script ?

**Fichiers non déplacés automatiquement:**
- Vérifier s'ils sont essentiels (garder racine) ou legacy (archiver)
- Déplacer manuellement: `git mv FICHIER.md docs/current/CATEGORY/`

### Q: Combien de temps pour migrer ?

**Automatique:** 2-3 minutes (script)  
**Manuelle:** 15-20 minutes  
**Validation:** 5 minutes  
**Total:** ~10-30 minutes

### Q: Dois-je mettre à jour README.md ?

**Oui, recommandé:** Ajouter section "Documentation" pointant vers `docs/current/INDEX.md`

```markdown
## 📚 Documentation

- [Documentation Actuelle v26.2](docs/current/INDEX.md)
- [Quick Start](QUICKSTART_UBUNTU_24.04.md)
- [Architecture](ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)
```

---

## 🆘 Support

### Problème: Script bloqué

```bash
# Ctrl+C pour arrêter
# Vérifier git status
git status

# Reset si nécessaire
git reset --hard HEAD
```

### Problème: Fichiers manquants

```bash
# Restaurer depuis backup
cp docs/backup_YYYYMMDD/FICHIER.md .

# Ou depuis git history
git checkout HEAD~1 -- FICHIER.md
```

### Problème: Build échoue

```bash
# Vérifier erreurs
pnpm run build 2>&1 | tee build.log

# Si liens cassés, restaurer temporairement
git stash
pnpm run build
git stash pop
```

---

## 📊 Checklist Validation

- [ ] Script exécuté sans erreur
- [ ] Validation structure passée (`validate-structure.sh`)
- [ ] Fichiers racine ≤ 10
- [ ] Build réussi (`pnpm run build`)
- [ ] Git status propre
- [ ] Backup vérifié
- [ ] INDEX.md présents dans archives
- [ ] Documentation v26 dans `docs/current/`
- [ ] Commit créé avec template
- [ ] Branche pushée
- [ ] PR créée

---

## 🎉 Succès !

**Si tous les checks passent:**

✅ Migration réussie !  
✅ Documentation structurée  
✅ Navigation simplifiée  
✅ Maintenance facilitée

**Next:** Demander review PR → Merge → Communiquer changements équipe

---

**Guide:** `docs/GUIDE_RAPIDE_RESTRUCTURATION.md`  
**Script:** `scripts/docs/migrate-v26.2.sh`  
**Validation:** `scripts/docs/validate-structure.sh`  
**Rapport:** `ANALYSE_REFLEXION_DOCUMENTATION_v26.2_OPTIMISATION.md`

**TITANE∞ v26.2 | © 2025 TITANE Team**

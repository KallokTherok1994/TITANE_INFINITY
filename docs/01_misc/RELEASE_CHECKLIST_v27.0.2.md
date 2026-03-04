# ✅ Checklist - GitHub Release v27.0.2

**URL**: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/new

---

## 📋 Étapes à Suivre

### 1️⃣ Ouvrir la Page de Création
```
https://github.com/KallokTherok1994/TITANE_INFINITY/releases/new
```

### 2️⃣ Sélectionner le Tag
- **Choose a tag**: `v27.0.2` ✅ (déjà créé et pushé)
- Le tag devrait apparaître dans la liste déroulante

### 3️⃣ Titre de la Release
```
TITANE∞ v27.0.2 - Production Release
```

### 4️⃣ Description (Release Notes)
Copier tout le contenu du fichier **RELEASE_NOTES_v27.0.2.md**

📎 Fichier disponible à la racine du projet

### 5️⃣ Upload des Artifacts (4 fichiers)

#### AppImage (96 MB)
```
src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.0.2_amd64.AppImage
```
SHA256: `4c28e8fe0051a8b535ad6dc21841a781dffcfe7028d706439e9f1b9d943c6b8a`

#### DEB Package (26 MB)
```
src-tauri/target/release/bundle/deb/TITANE-Infinity_27.0.2_amd64.deb
```
SHA256: `ed09a5d3b526b83e2ab90b4832c596449c27dd8e12c09ccecca71f59be9572fd`

#### RPM Package (26 MB)
```
src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.0.2-1.x86_64.rpm
```
SHA256: `87f088890b115b2974200733f56460fb038ec116afebe92af5c8913054b2c669`

#### Checksums
```
reports/ARTIFACTS_SHA256_v27.0.2.txt
```

### 6️⃣ Options de Publication
- ✅ **Cocher**: "Set as the latest release"
- ❌ **NE PAS cocher**: "Set as a pre-release" (c'est une version stable)

### 7️⃣ Publier
Cliquer sur **"Publish release"**

---

## ✅ Vérification Post-Publication

Après publication, vérifier:

1. **URL de la release**: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.2

2. **4 fichiers uploadés** (148 MB total):
   - [ ] TITANE-Infinity_27.0.2_amd64.AppImage (96 MB)
   - [ ] TITANE-Infinity_27.0.2_amd64.deb (26 MB)
   - [ ] TITANE-Infinity-27.0.2-1.x86_64.rpm (26 MB)
   - [ ] ARTIFACTS_SHA256_v27.0.2.txt (< 1 KB)

3. **Release notes** complètes et formatées en Markdown

4. **Badge "Latest"** visible en vert

5. **Downloads** accessibles depuis la page principale des releases

---

## 📦 Localisation des Fichiers

Tous les fichiers sont dans votre dossier de travail:

```bash
# Vérifier que tous les fichiers existent
ls -lh \
  src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.0.2_amd64.AppImage \
  src-tauri/target/release/bundle/deb/TITANE-Infinity_27.0.2_amd64.deb \
  src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.0.2-1.x86_64.rpm \
  reports/ARTIFACTS_SHA256_v27.0.2.txt \
  RELEASE_NOTES_v27.0.2.md
```

---

## 🚀 Après la Release

Une fois publiée:

1. **Annoncer** sur:
   - GitHub Discussions
   - Discord/Slack (si applicable)
   - README.md (mettre à jour lien download)

2. **Partager** avec beta testeurs

3. **Monitorer**:
   - Statistiques de téléchargement
   - Issues/bugs reportés
   - Feedback utilisateurs

---

**Ready to go! 🎉**

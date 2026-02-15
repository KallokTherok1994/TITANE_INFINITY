# GitHub Release v27.0.2 - Instructions Manuelles

**Status**: ⚠️ GitHub CLI non authentifié - Créer la release manuellement

---

## Option 1: Interface Web GitHub (Recommandé)

### Étapes:

1. **Aller sur**: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/new

2. **Choose a tag**: Sélectionner `v27.0.2` (déjà créé et pushé)

3. **Release title**: 
   ```
   TITANE∞ v27.0.2 - Production Release
   ```

4. **Description**: Copier le contenu de `RELEASE_NOTES_v27.0.2.md`

5. **Upload artifacts** (glisser-déposer):
   - `src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.0.2_amd64.AppImage` (96 MB)
   - `src-tauri/target/release/bundle/deb/TITANE-Infinity_27.0.2_amd64.deb` (26 MB)
   - `src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.0.2-1.x86_64.rpm` (26 MB)
   - `reports/ARTIFACTS_SHA256_v27.0.2.txt` (checksums)

6. **Options**:
   - ✅ Cocher "Set as the latest release"
   - ❌ Ne PAS cocher "Set as a pre-release" (c'est stable)

7. **Publish release**

---

## Option 2: GitHub CLI (Après Authentification)

### Authentification:
```bash
gh auth login
```

Suivre les instructions interactives.

### Créer la release:
```bash
gh release create v27.0.2 \
  --title "TITANE∞ v27.0.2 - Production Release" \
  --notes-file RELEASE_NOTES_v27.0.2.md \
  src-tauri/target/release/bundle/appimage/TITANE-Infinity_27.0.2_amd64.AppImage \
  src-tauri/target/release/bundle/deb/TITANE-Infinity_27.0.2_amd64.deb \
  src-tauri/target/release/bundle/rpm/TITANE-Infinity-27.0.2-1.x86_64.rpm \
  reports/ARTIFACTS_SHA256_v27.0.2.txt \
  --repo KallokTherok1994/TITANE_INFINITY
```

---

## Vérification Post-Release

Après création de la release, vérifier:

1. **URL de la release**: https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.2

2. **Artifacts uploadés** (4 fichiers):
   - ✅ AppImage (96 MB)
   - ✅ DEB (26 MB)
   - ✅ RPM (26 MB)
   - ✅ SHA256 checksums

3. **Release notes** complètes et formatées

4. **Badge "Latest"** visible sur la release

---

## État Actuel

✅ **Tag créé**: v27.0.2 (commit e3aade8a)  
✅ **Tag pushé**: origin/v27.0.2  
✅ **Artifacts locaux**: Tous présents dans src-tauri/target/release/bundle/  
✅ **Checksums calculés**: reports/ARTIFACTS_SHA256_v27.0.2.txt  
✅ **Release notes**: RELEASE_NOTES_v27.0.2.md  
⚠️ **GitHub Release**: À créer manuellement (CLI non auth)

---

## Prochaines Étapes Après Release

1. **Annoncer la release**:
   - GitHub Discussions
   - README.md (mise à jour lien download)
   - Discord/Slack/etc.

2. **Distribution beta testeurs**:
   - Partager lien de la release
   - Demander feedback sur AppImage/DEB/RPM
   - Suivre les issues

3. **Monitoring**:
   - Vérifier downloads
   - Suivre les issues reportées
   - Préparer hotfixes si nécessaire


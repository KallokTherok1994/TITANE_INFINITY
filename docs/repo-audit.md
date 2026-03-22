# Rapport d'audit du dépôt TITANE_INFINITY

> **Date** : 2026-03-22  
> **Branche** : `MAIN` / `copilot/audit-repository-size-and-language-distribution`  
> **Objectif** : Expliquer la taille du dépôt (~1,8 Go sur disque, ~24 000 fichiers trackés) et la prédominance du C (~59 % selon GitHub Linguist).

---

## 1. Synthèse exécutive

| Indicateur | Valeur |
|---|---|
| Fichiers trackés (`git ls-files`) | ~24 000 |
| Taille disque totale | ~1,8 Go |
| Langage C (GitHub Linguist) | ~59 % |
| Cause principale du C | Node.js v20 vendorisé dans `.tools/node/_extract/` (2 363 fichiers `.h`) |
| Plus gros dossier | `deployment/` (373 Mo, binaires AppImage/deb + logs CI) |
| Archives binaires committées | `.tools/node/_tmp/*.tar.xz` (25 Mo), `TITANE_INFINITY-main.zip` (95 Mo) |

**Conclusion** : le code source légitime (`src/`, `src-tauri/`, `e2e/`, `scripts/`) représente moins de **30 Mo** et moins de **4 000 fichiers**. Le reste (≈ 94 % de la taille) est constitué d'artefacts générés, de binaires, de logs CI/preuve, et d'un runtime Node.js vendorisé.

---

## 2. Répartition par dossier (fichiers trackés + taille disque)

| Dossier | Fichiers trackés | Taille disque | Catégorie |
|---|---|---|---|
| `docs/` | 7 929 | 180 Mo | Documentation + archives + rapports |
| `proof_packs/` | 5 091 | 239 Mo | Preuves de session CI/E2E (logs, scans) |
| `.tools/` | 2 465 | 174 Mo | **Node.js v20 vendorisé** (binaires + headers C) |
| `deployment/` | 2 341 | 373 Mo | **Binaires de release** (AppImage, .deb, exécutables) |
| `src/` | 1 833 | 24 Mo | Code source frontend (TypeScript) ✅ |
| `reports/` | 1 816 | 15 Mo | Rapports générés |
| `src-tauri/` | 1 140 | 15 Mo | Code source Tauri/Rust ✅ |
| `scripts/` | 556 | 5 Mo | Scripts de gouvernance ✅ |
| `runtime/` | 23 | 21 Mo | Binaire compilé + config runtime |
| `e2e/` | 64 | 0,8 Mo | Tests E2E ✅ |

---

## 3. Pourquoi ~59 % de C ?

GitHub Linguist compte **tous les fichiers trackés** dans Git. Il exclut les chemins listés dans `.gitattributes linguist-vendored` ou `.gitignore`, **mais uniquement pour les fichiers NON trackés**.

### Cause identifiée : `.tools/node/_extract/`

Le dossier `.tools/node/_extract/node-v20.19.6-linux-x64/` contient la distribution complète de Node.js v20 pour Linux x64 **committée dans Git**, incluant :

- **2 362 fichiers `.h`** (headers C/C++ : V8, libuv, OpenSSL, cppgc, etc.)
- Le binaire `node` (~93 Mo ELF x86-64)
- Les binaires npm, corepack, pnpm, yarn

Ces headers `.h` sont reconnus par Linguist comme du code **C**, ce qui fait passer le pourcentage de C de ~0 % à ~59 %.

> ℹ️ Le `.gitignore` contient déjà la règle `# Cline CLI binaries (legacy global install)` / `.tools/node/_extract/`, mais puisque les fichiers avaient déjà été committés avant cette règle, ils restent dans l'index Git et sont comptés par Linguist.

### Autres contributions aux stats de langage

| Artefact | Impact |
|---|---|
| `.tools/node/_extract/` | +2 363 fichiers `.h` → 59 % C |
| `deployment/` | Binaires ELF/AppImage non reconnus comme langage |
| `proof_packs/` | Texte/Markdown, pas de langage détecté |
| `tts-service/` | Python (~24 fichiers `.py`) → minoritaire |

---

## 4. Plus gros fichiers individuels

| Fichier | Taille | Raison |
|---|---|---|
| `TITANE_INFINITY-main.zip` | ~95 Mo | Archive du dépôt lui-même |
| `.tools/node/_extract/.../bin/node` | ~93 Mo | Binaire Node.js |
| `deployment/latest/TITANE-Infinity_28.0.0_amd64.AppImage` | ~90 Mo | Release AppImage |
| `deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage` | ~84 Mo | Release AppImage |
| `deployment/latest/titane-infinity` | ~40 Mo | Exécutable ELF compilé |
| `deployment/v27.0.0-PRODUCTION/titane-infinity` | ~21 Mo | Exécutable ELF compilé |
| `runtime/stable/titane-infinity-v26.3.1` | ~21 Mo | Exécutable ELF compilé |
| `.tools/node/_tmp/node-v20.19.6-linux-x64.tar.xz` | ~25 Mo | Archive tar.xz de Node.js |
| `deployment/latest/builds/titane-infinity.run1.normalized` | ~25 Mo | Build normalisé |
| `docs/01_misc/SCANS_ALLOWLIST.md` | ~25 Mo | Fichier scan de grande taille |

---

## 5. Impact sur les stats GitHub

### Code Frequency Graph

Le graphe "code frequency" peut afficher des milliers d'additions/suppressions en une semaine si :
- Un gros dossier vendorisé a été commité d'un coup (ex: `.tools/node/_extract/`)
- Un binaire (AppImage, `.deb`) a été ajouté ou remplacé

### Linguist Language Detection

GitHub Linguist **exclut** automatiquement les chemins marqués `linguist-vendored=true` dans `.gitattributes`. Sans cette configuration, tout fichier `.h` committé est compté comme C.

---

## 6. Actions correctives

### 6.1 Retrait de l'index Git (safe, sans réécriture d'historique)

Ces commandes retirent les artefacts de l'index Git sans supprimer les fichiers locaux ni réécrire l'historique.

```bash
# 1. Node.js vendorisé (cause principale des 59% C)
git rm -r --cached .tools/node/_extract/
git rm --cached .tools/node/_tmp/node-v20.19.6-linux-x64.tar.xz
git rm --cached .tools/node/_tmp/SHASUMS256.txt

# 2. Archive de dépôt (inutile dans Git)
git rm --cached TITANE_INFINITY-main.zip

# 3. Binaires de release (déjà dans .gitignore mais encore trackés)
git rm --cached deployment/latest/TITANE-Infinity_27.2.0_amd64.AppImage
git rm --cached deployment/latest/TITANE-Infinity_28.0.0_amd64.AppImage
git rm --cached deployment/latest/TITANE-Infinity_27.2.0_amd64.deb
git rm --cached deployment/latest/TITANE-Infinity_28.0.0_amd64.deb
git rm --cached deployment/v26.4.0/TITANE-Infinity_26.4.0_amd64.deb
git rm --cached deployment/latest/titane-infinity
git rm --cached deployment/latest/builds/titane-infinity.run1.normalized
git rm --cached deployment/v27.0.0-PRODUCTION/titane-infinity
git rm --cached runtime/stable/titane-infinity-v26.3.1

git commit -m "chore(audit): remove tracked vendor/binary artifacts from git index"
```

> ⚠️ Ces fichiers resteront dans l'historique Git. Pour purger l'historique et réduire la taille du dépôt (`.git/`), voir section 6.3.

### 6.2 Améliorations `.gitignore`

Les règles suivantes sont à ajouter si elles ne couvrent pas déjà ces cas :

```gitignore
# Node.js runtime vendorisé (ne pas committer le binaire ou les headers)
.tools/node/_extract/
.tools/node/_tmp/*.tar.xz
.tools/node/_tmp/*.tar.gz
.tools/node/_tmp/SHASUMS256.txt

# Archive du dépôt lui-même
TITANE_INFINITY-main.zip
*.zip  # (optionnel, si aucun zip source n'est légitime)

# Binaires de release (complément)
deployment/latest/titane-infinity
deployment/v*/titane-infinity
runtime/stable/titane-infinity*
deployment/latest/builds/*.normalized
```

### 6.3 Option avancée : réécriture d'historique (git-filter-repo)

> ⚠️ **Destructif** — nécessite force-push et coordination avec tous les collaborateurs.

```bash
# Installer git-filter-repo
pip install git-filter-repo

# Purger les gros blobs par chemin
git filter-repo --path .tools/node/_extract/ --invert-paths
git filter-repo --path .tools/node/_tmp/ --invert-paths
git filter-repo --path TITANE_INFINITY-main.zip --invert-paths
git filter-repo --path-glob 'deployment/latest/*.AppImage' --invert-paths
git filter-repo --path-glob 'deployment/latest/*.deb' --invert-paths

# Vérifier la réduction
git count-objects -vH

# Force-push (coordination requise)
git push origin MAIN --force-with-lease
```

### 6.4 Marquer le dossier `.tools/` comme vendorisé (Linguist)

Même sans retrait de l'index, on peut exclure des dossiers des stats GitHub via `.gitattributes` :

```
# .gitattributes
.tools/** linguist-vendored=true
deployment/** linguist-vendored=true
proof_packs/** linguist-generated=true
reports/** linguist-generated=true
```

---

## 7. Politique de stockage des artefacts

### Ce qui ne doit PAS être commité

| Type | Exemples | Stockage alternatif |
|---|---|---|
| Binaires de release | `.AppImage`, `.deb`, `.exe`, `.dmg` | GitHub Releases |
| Runtime Node.js | `.tools/node/_extract/`, `_tmp/*.tar.xz` | Téléchargé à la demande par scripts CI |
| Logs CI/E2E | `*.log`, `*.exit`, `*.exitcode` | GitHub Actions Artifacts |
| Archives de dépôt | `TITANE_INFINITY-main.zip` | Jamais committer |
| Cache audio | `tts-service/cache/audio/*.wav` | `.gitignore` local |
| Bytecode Python | `__pycache__/*.pyc` | `.gitignore` local |

### Ce qui doit rester dans Git

| Type | Exemples |
|---|---|
| Code source | `src/`, `src-tauri/`, `e2e/`, `scripts/` |
| Configuration | `*.json`, `*.toml`, `*.yaml` (configs) |
| Documentation courante | `docs/*.md` (docs actives, pas archives) |
| Scripts de release | `scripts/deployment/*.sh` |
| Preuves de gouvernance | `proof_packs/*/VERDICT.md` (VERDICT uniquement, pas les raw) |

### Où stocker logs/rapports/releases

- **Releases binaires** → [GitHub Releases](https://github.com/KallokTherok1994/TITANE_INFINITY/releases)
- **Artifacts CI** → GitHub Actions → Artifacts (rétention 30-90 jours)
- **Logs de run** → GitHub Actions → Job logs (pas dans Git)
- **Proof packs complets** → Réduire à `VERDICT.md` + `ROLLBACK.md` uniquement (sans `raw/`)

---

## 8. Commandes d'audit utiles

Voir aussi `scripts/audit-repo.sh` pour un rapport reproductible automatisé.

```bash
# Fichiers les plus lourds trackés
git ls-files -z | xargs -0 du -sk 2>/dev/null | sort -rn | head -20

# Répartition par dossier de premier niveau
git ls-files | awk -F'/' '{print $1}' | sort | uniq -c | sort -rn

# Répartition par extension
git ls-files | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20

# Nombre total de fichiers trackés
git ls-files | wc -l

# Plus gros blobs dans l'historique Git
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | sed -n 's/^blob //p' \
  | sort -k2 -nr \
  | head -20 \
  | awk '{print $2" "$3}' | numfmt --field=2 --to=iec

# Taille du dépôt Git (objets packés)
git count-objects -vH
```

---

## 9. Rollback

```bash
# Annuler le retrait de l'index (avant commit)
git checkout HEAD -- .tools/ deployment/ runtime/ TITANE_INFINITY-main.zip

# Restaurer ce fichier
git restore -- docs/repo-audit.md
```

---

*Rapport généré le 2026-03-22 — Session audit copilot/audit-repository-size-and-language-distribution*

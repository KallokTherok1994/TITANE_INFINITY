# 🔧 INSTALLATION DÉPENDANCES WEBKIT - Ubuntu/Pop!_OS

## ❌ PROBLÈME ACTUEL

```bash
error: unable to find library -lwebkit2gtk-4.1
error: unable to find library -ljavascriptcoregtk-4.1
```

**Cause** : Bibliothèques WebKit système manquantes pour Tauri

## ✅ SOLUTION : Installer les dépendances

### 1. Installation des dépendances Tauri

```bash
# Mise à jour des packages
pkexec apt update

# Installation des dépendances WebKit et GTK
pkexec apt install -y \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libgdk-pixbuf-2.0-dev \
  libpango1.0-dev \
  libcairo2-dev \
  libatk1.0-dev
```

**OU** si webkit2gtk-4.1 n'est pas disponible, utiliser la version 4.0 :

```bash
pkexec apt install -y \
  libwebkit2gtk-4.0-dev \
  libjavascriptcoregtk-4.0-dev \
  libgtk-3-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### 2. Vérification de l'installation

```bash
# Vérifier que pkg-config trouve les packages
pkg-config --modversion webkit2gtk-4.1
# OU
pkg-config --modversion webkit2gtk-4.0

pkg-config --modversion javascriptcoregtk-4.1
# OU
pkg-config --modversion javascriptcoregtk-4.0
```

**Sortie attendue** : Version number (ex: `2.42.5`)

### 3. Relancer la compilation

```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm tauri dev
```

## 🎯 ALTERNATIVE : Mode Mock Backend sans WebView

Si l'installation échoue, vous pouvez créer un build "headless" (sans UI) :

### Option 1 : Build CLI uniquement

```bash
# Compiler juste la lib Rust sans l'app Tauri
cd src-tauri
cargo build --lib

# Utiliser le frontend via pnpm dev (sans Tauri)
cd ..
pnpm dev
```

### Option 2 : Mock Frontend complet

Utiliser uniquement le frontend avec des données mockées côté TS :

```bash
# Lancer uniquement Vite
pnpm dev

# Dans le code TS, mocker les appels invoke :
window.__TAURI__ = {
  invoke: async (cmd: string) => {
    return { status: "mock", data: null };
  }
};
```

## 📋 DÉPENDANCES COMPLÈTES TAURI (Référence)

Liste complète des dépendances recommandées par Tauri pour Linux :

```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev
```

## 🚀 PROCHAINES ÉTAPES

Après installation des dépendances :

1. ✅ **Vérifier pkg-config**
   ```bash
   pkg-config --list-all | grep webkit
   ```

2. ✅ **Clean + Rebuild**
   ```bash
   cd src-tauri
   cargo clean
   cd ..
   pnpm tauri dev
   ```

3. ✅ **Test l'app**
   - UI devrait s'ouvrir
   - Données mockées affichées
   - DevTools actives

## 📊 STATUS ACTUEL

| Composant | Status | Bloqueur |
|-----------|--------|----------|
| **Frontend Build** | ✅ OK | Aucun |
| **Rust Compile** | ✅ OK | Aucun |
| **Mock Backend** | ✅ OK | Aucun |
| **Linker** | ❌ KO | libwebkit2gtk-4.1 manquante |
| **Tauri Dev** | ⏳ Bloqué | Installation dépendances requise |

## 🎉 SUCCÈS PARTIEL

Même sans pouvoir lancer l'app, nous avons :

- ✅ **0 erreurs Rust** (compilation réussie)
- ✅ **0 erreurs TypeScript**
- ✅ **Mock backend fonctionnel**
- ✅ **Architecture simplifiée**
- ⏳ **Manque juste les libs système** pour lancer

---

*Guide généré le: 23 novembre 2025 17:15*
*Système: Ubuntu/Pop!_OS 22.04+*
*Version Tauri: 2.9.3*

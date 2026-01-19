# 🔧 INSTALLATION WEBKIT - Guide Rapide

## 📋 Dépendances Manquantes

L'application nécessite les bibliothèques WebKit système pour fonctionner.

## ✅ Installation Automatique

Un script d'installation a été créé pour vous faciliter la tâche.

### Option 1 : Exécution directe avec privilèges

```bash
# Ouvrir un terminal HORS de VS Code
cd /home/titane/Documents/TITANE_INFINITY
sudo bash install_webkit_deps.sh
```

**Entrez votre mot de passe administrateur quand demandé.**

### Option 2 : Installation manuelle

Si le script ne fonctionne pas, installez manuellement :

```bash
# Ouvrir un terminal système (GNOME Terminal, Konsole, etc.)
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libgtk-3-dev \
    libsoup-3.0-dev \
    build-essential \
    libssl-dev \
    patchelf
```

## 🔍 Vérification

Après installation, vérifiez que tout est OK :

```bash
pkg-config --modversion webkit2gtk-4.1
pkg-config --modversion javascriptcoregtk-4.1
```

Vous devriez voir des numéros de version s'afficher.

## 🚀 Lancer l'Application

Une fois les dépendances installées :

```bash
cd /home/titane/Documents/TITANE_INFINITY
pnpm tauri dev
```

L'application devrait se lancer avec :
- ✅ Interface UI fonctionnelle
- ✅ Mock backend actif
- ✅ DevTools ouvertes (mode debug)
- ✅ Données simulées affichées

## ⚠️ Notes Importantes

### Pourquoi ces dépendances ?

Tauri utilise WebView natif pour afficher l'interface. Sur Linux, cela nécessite WebKit2GTK.

### Terminal VS Code vs Terminal Système

**Important** : L'installation nécessite des privilèges administrateur (`sudo`), qui peuvent ne pas être disponibles dans le terminal intégré de VS Code.

**Solution** : Ouvrez un **terminal système** (en dehors de VS Code) :
- Pop!_OS : `Super + T` (Terminal)
- Ubuntu : Cherchez "Terminal" dans les applications

### Si webkit2gtk-4.1 n'existe pas

Sur certains systèmes, utilisez la version 4.0 :

```bash
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    libjavascriptcoregtk-4.0-dev
```

## 🎯 Status Actuel

| Composant | Status |
|-----------|--------|
| Code Rust | ✅ Compilé |
| Code TypeScript | ✅ Validé |
| Mock Backend | ✅ Fonctionnel |
| WebKit Libs | ⏳ **À installer** |

## 📞 Dépannage

### Erreur : "commande introuvable: sudo"

Vous êtes dans un environnement restreint (Flatpak VS Code).
→ Ouvrez un **terminal système normal**.

### Erreur : "Package 'webkit2gtk-4.1' not found"

Votre distribution n'a pas la version 4.1.
→ Installez la version 4.0 (voir ci-dessus).

### Erreur : "Could not get lock /var/lib/dpkg/lock"

Un autre processus apt est en cours.
→ Attendez qu'il se termine ou redémarrez le système.

---

**Une fois installé, l'app sera lancable avec `pnpm tauri dev` !**

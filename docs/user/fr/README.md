# TITANE∞ — Documentation Utilisateur (FR)

**Version :** 30.0.0  
**Statut :** PRODUCTION READY  
**Date :** 2026-04-10

> Guide canonique pour les utilisateurs finaux de TITANE∞.

---

## Navigation

| Document | Description |
|---|---|
| [Installation](./installation.md) | Comment installer TITANE∞ |
| [Démarrage rapide](./demarrage-rapide.md) | Premier lancement et configuration initiale |
| [Guide d'utilisation](./guide-utilisation.md) | Utilisation quotidienne de TITANE∞ |
| [Fonctionnalités et centres](./fonctionnalites-et-centres.md) | Description des capacités disponibles |
| [Paramètres, sécurité et confidentialité](./parametres-securite-et-confidentialite.md) | Configuration et données personnelles |
| [FAQ](./faq.md) | Questions fréquentes |
| [Dépannage](./depannage.md) | Résolution des problèmes courants |

---

## Qu'est-ce que TITANE∞ ?

TITANE∞ est une **application desktop** construite avec Tauri (Rust + React) qui vous permet d'interagir avec des modèles d'IA (OpenAI, Claude, Gemini, Ollama) via une interface unifiée.

**Ce que TITANE∞ est :**
- Une application desktop Tauri (Linux, Windows, macOS) — PROVEN
- Un frontal d'interaction avec plusieurs fournisseurs IA — PROVEN
- Un outil avec mémoire conversationnelle hiérarchique (STM/MTM/LTM) — PARTIAL
- Un outil avec mode vocal/TTS — PROVEN

**Ce que TITANE∞ n'est PAS :**
- Ce n'est pas un service entièrement local ou hors ligne — la connectivité réseau est nécessaire pour les fournisseurs cloud (OpenAI, Claude, Gemini)
- Ce n'est pas "100% local" — cette description dans d'anciens documents est obsolète (LEGACY)
- Ce n'est pas une simple application web navigateur — le runtime de production est Tauri desktop et la release binaire Linux courante est `v30.0.0`

---

## Statut de la version courante

- **Version repo :** 30.0.0 (autorité : `package.json` + `CHANGELOG.md`)
- **Release binaire publiée courante :** v30.0.0 (Linux : AppImage/DEB via `deployment/latest/`)
- **Systèmes supportés :** Ubuntu 20.04+ | Debian 11+ | Linux Mint 20+ | Pop!_OS 20.04+ (PROVEN sur le flux V30)
- **Politique d'archive :** les matériaux historiques restent conservés sous `docs/99_ARCHIVE/` et `_archive/` et ne font plus autorité pour l'usage courant.

---

*Pour la documentation en anglais : [docs/user/en/README.md](../en/README.md)*

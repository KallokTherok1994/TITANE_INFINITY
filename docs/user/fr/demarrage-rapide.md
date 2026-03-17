# TITANE∞ — Démarrage Rapide (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Étapes de premier lancement

### 1. Installer TITANE∞

→ Voir [Installation](./installation.md)

### 2. Lancer l'application

```bash
# Si AppImage :
./Titan-Stable_27.0.5_amd64.AppImage

# Si DEB installé :
titane-infinity  # Ou via le lanceur d'applications

# Depuis les sources :
pnpm run dev
```

### 3. Configurer un fournisseur IA

Au premier lancement, vous devez configurer au moins un fournisseur d'IA :

| Fournisseur | Type | Clé API nécessaire | Hors-ligne |
|---|---|---|---|
| OpenAI | Cloud | OUI | NON |
| Claude (Anthropic) | Cloud | OUI | NON |
| Gemini (Google) | Cloud | OUI | NON |
| Ollama | Local | NON | OUI (si modèle téléchargé) |

> **Politique réseau :** TITANE∞ est une application **online-first** — les fournisseurs cloud nécessitent une connexion Internet. Ollama peut fonctionner localement si le serveur est démarré.

### 4. Démarrer une conversation

1. Sélectionnez le centre "Chat IA" dans l'interface
2. Choisissez votre fournisseur actif
3. Tapez votre premier message
4. La réponse IA s'affiche dans la bulle de conversation

### 5. Avec Ollama (optionnel — modèles locaux)

```bash
# Démarrer Ollama
pnpm run ollama:start
# ou
ollama serve

# Télécharger un modèle
pnpm run ollama:pull
# ou
ollama pull llama3.2:latest

# Vérifier que Ollama est actif
pnpm run ollama:status
```

---

## Ce que vous pouvez faire dès le départ

| Fonctionnalité | Disponible | Statut |
|---|---|---|
| Chat IA multi-fournisseurs | OUI | PROVEN |
| Mode vocal (TTS) | OUI | PROVEN |
| Mémoire conversationnelle | OUI | PARTIAL |
| Modèles locaux (Ollama) | OUI (si configuré) | QUALIFIED |
| DevTools / monitoring | OUI | PROVEN |
| Audio / microphone | OUI | PROVEN |

---

## Suite

- [Guide d'utilisation](./guide-utilisation.md) — Utilisation approfondie
- [Fonctionnalités et centres](./fonctionnalites-et-centres.md) — Toutes les capacités
- [FAQ](./faq.md) — Questions fréquentes

---

*Documentation en anglais : [docs/user/en/quick-start.md](../en/quick-start.md)*

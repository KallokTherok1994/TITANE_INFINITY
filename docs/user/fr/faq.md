# TITANE∞ — FAQ (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Questions générales

### Pour qui est TITANE∞ ?

TITANE∞ est destiné aux développeurs, chercheurs et utilisateurs avancés qui souhaitent une interface unifiée pour interagir avec plusieurs modèles d'IA, avec des fonctionnalités de mémoire conversationnelle, de mode vocal, et d'observabilité.

### Fonctionne-t-il hors ligne ?

**Partiellement.** TITANE∞ est une application **online-first** :
- Les fournisseurs cloud (OpenAI, Claude, Gemini) nécessitent une connexion Internet
- Ollama (modèles locaux) fonctionne hors ligne si le serveur est démarré et un modèle téléchargé
- Un fallback local est prévu mais son état est PARTIAL

### Est-ce gratuit ?

TITANE∞ est un logiciel propriétaire. L'utilisation des fournisseurs IA cloud (OpenAI, Claude, Gemini) est soumise aux tarifs de ces services. Ollama est gratuit et open-source.

### Sur quels systèmes fonctionne TITANE∞ ?

- **Linux** : Ubuntu 20.04+, Debian 11+, Linux Mint 20+, Pop!_OS 20.04+ — PROVEN (binaire v27.0.5)
- **Windows** : PARTIAL (non prouvé en CI)
- **macOS** : PARTIAL (non prouvé en CI)

---

## Installation et configuration

### Quelle version télécharger ?

La dernière release binaire publique est **v27.0.5** (Linux). La version repo courante est 28.0.0 mais sans binaire public disponible à ce jour.

### Comment configurer mes clés API ?

Dans le centre **Paramètres** de l'application, entrez vos clés API pour les fournisseurs souhaités. Les clés sont stockées localement et ne quittent jamais votre machine (sauf vers le fournisseur concerné lors des requêtes).

### TITANE∞ installe-t-il autre chose sur mon système ?

Le binaire DEB installe l'application standard. Aucun serveur de fond n'est installé. Si vous utilisez Ollama, vous devez l'installer séparément.

---

## Utilisation

### Pourquoi n'ai-je pas de réponse ?

Causes possibles :
1. Le fournisseur IA est indisponible (vérifiez votre connexion)
2. Votre clé API est expirée ou incorrecte
3. Le timeout de 30 secondes a été atteint — cliquez "Réessayer"
4. Ollama n'est pas démarré (si vous utilisez Ollama)

### Comment accéder à l'historique de conversation ?

L'historique est accessible via l'interface de chat. Il est persisté dans le localStorage de l'application.

### Comment utiliser le mode vocal ?

1. Cliquez sur l'icône microphone dans le chat
2. Autorisez l'accès au microphone si demandé
3. Parlez normalement — la détection vocale est automatique
4. Pour le TTS, cliquez sur l'icône haut-parleur

---

## Problèmes connus

### L'application ne démarre pas

→ Consultez [Dépannage](./depannage.md) — section "Problèmes au lancement"

### Le mode vocal ne fonctionne pas

→ Consultez [Dépannage](./depannage.md) — section "Problèmes audio"

### Les messages ne s'affichent pas

→ Vérifiez que le fournisseur est bien configuré et que la connexion Internet est active

---

## Où obtenir de l'aide ?

- Issues GitHub : https://github.com/KallokTherok1994/TITANE_INFINITY/issues
- Logs applicatifs : Consultez le centre DevTools → Logs
- Documentation : Ce guide et les autres documents dans `docs/user/fr/`

---

*Documentation en anglais : [docs/user/en/faq.md](../en/faq.md)*

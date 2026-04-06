# TITANE∞ — Fonctionnalités et Centres (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Vue d'ensemble des centres

TITANE∞ est organisé en **centres fonctionnels**. Chaque centre correspond à une zone de l'interface avec des capacités spécifiques.

---

## Centre 1 — Chat IA

**Statut :** PROVEN

**Ce que ça fait :** Interface principale d'interaction avec les modèles IA.

**Fournisseurs supportés :**
- OpenAI (GPT-4, GPT-3.5, etc.) — connexion Internet requise
- Claude (Anthropic) — connexion Internet requise
- Gemini (Google) — connexion Internet requise
- Ollama (modèles locaux : Llama, Mistral, etc.) — optionnel, serveur local requis

**Contraintes :**
- Timeout de 30 secondes par requête
- L'historique de conversation est persisté localement
- Chaque message requiert que le fournisseur soit joignable

---

## Centre 2 — Audio / Voix

**Statut :** PROVEN (core), PARTIAL (certaines fonctionnalités avancées)

**Ce que ça fait :** Mode vocal avec reconnaissance vocale (VAD), TTS, et profils vocaux.

**Capacités :**
- Détection d'activité vocale (VAD) automatique
- Text-to-Speech (TTS) pour les réponses IA
- Profil vocal synchronisé depuis le backend
- Machine à états audio (idle → parole → traitement → IA parle)

**Contraintes :**
- Nécessite accès au microphone (permission système)
- Le TTS peut nécessiter un serveur de synthèse vocale configuré
- Anti-écho activé automatiquement pendant la lecture TTS

---

## Centre 3 — Mémoire

**Statut :** PARTIAL

**Ce que ça fait :** Consultation et gestion de la mémoire conversationnelle hiérarchique.

**Niveaux de mémoire :**
- **STM** : Session courante (messages récents)
- **MTM** : Résumés des sessions passées
- **LTM** : Connaissances persistées à long terme

**Contraintes :**
- La synchronisation complète STM/MTM/LTM est en cours de stabilisation
- La consultation de la mémoire est possible mais l'édition manuelle est limitée

---

## Centre 4 — DevTools

**Statut :** PROVEN

**Ce que ça fait :** Outils de monitoring et de debug intégrés à l'interface.

**Outils disponibles :**
- **Helios** : Métriques système en temps réel
- **Nexus** : Graphe de dépendances
- **Logs** : Journal d'événements
- **Watchdog** : Surveillance des processus
- **Monitoring** : Dashboard de performance

**Contraintes :**
- DevTools est destiné aux développeurs et mainteneurs
- N'affecte pas le comportement de l'application en production

---

## Centre 5 — Paramètres

**Statut :** PROVEN

**Ce que ça fait :** Configuration des fournisseurs IA, préférences utilisateur, gestion des clés API.

**Capacités :**
- Configuration des clés API par fournisseur
- Sélection du fournisseur par défaut
- Paramètres audio et vocaux
- Préférences d'interface

**Contraintes :**
- Les clés API sont stockées localement (voir [Paramètres, sécurité et confidentialité](./parametres-securite-et-confidentialite.md))
- Certains paramètres avancés nécessitent un redémarrage de l'application

---

## Fonctionnalités en statut PLANNED

Les fonctionnalités suivantes sont documentées comme intentions futures mais ne sont pas encore disponibles ou entièrement vérifiées :

| Fonctionnalité | Statut | Notes |
|---|---|---|
| UnifiedMemory OS complet | DOC_ONLY | Architecture documentée, implémentation partielle |
| Auto-réparation runtime complète | DOC_ONLY | Scripts de gouvernance présents, runtime self-healing non prouvé |
| Pipeline OMEGA v2 complet (10 étapes) | PARTIAL | Partiellement implémenté dans `conversationEngine.ts` |
| Multimodal (images, audio avancé) | PLANNED | Spécifications présentes, implémentation incomplète |

---

*Documentation en anglais : [docs/user/en/features-and-centers.md](../en/features-and-centers.md)*

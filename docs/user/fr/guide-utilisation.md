# TITANE∞ — Guide d'Utilisation (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## L'interface principale

TITANE∞ propose une interface centrée sur les interactions IA avec plusieurs centres fonctionnels accessibles depuis la navigation principale.

### Navigation principale

| Centre | Fonction | Statut |
|---|---|---|
| Chat IA | Conversations avec les fournisseurs IA | PROVEN |
| Audio / Voix | Mode vocal, TTS, microphone | PROVEN |
| Mémoire | Consultation de la mémoire conversationnelle | PARTIAL |
| DevTools | Monitoring, logs, debug | PROVEN |
| Paramètres | Configuration des fournisseurs et de l'application | PROVEN |

---

## Chat IA

### Envoyer un message

1. Saisissez votre message dans le champ de saisie
2. Appuyez sur Entrée ou cliquez "Envoyer"
3. Attendez la réponse IA (timeout : 30 secondes maximum)
4. En cas d'erreur : un bouton "Réessayer" s'affiche

### Changer de fournisseur

- Utilisez le sélecteur de fournisseur dans l'interface chat
- Les fournisseurs configurés apparaissent dans la liste
- Le changement de fournisseur n'efface pas l'historique de conversation

### Historique de conversation

- Les messages sont persistés localement (localStorage)
- La mémoire STM/MTM/LTM est activée si configurée
- L'historique est accessible entre les sessions

---

## Mode Vocal

### Activer le mode vocal

1. Cliquez sur l'icône microphone dans l'interface chat
2. Autorisez l'accès au microphone si demandé
3. Parlez — la détection d'activité vocale (VAD) est automatique
4. La transcription et la réponse IA s'affichent

### TTS (Text-to-Speech)

- Les réponses IA peuvent être lues à voix haute
- Cliquez sur l'icône haut-parleur pour activer/désactiver
- Le profil vocal actif est synchronisé depuis le backend

---

## Mémoire

> **Statut :** PARTIAL — la mémoire hiérarchique est en cours de stabilisation.

- **STM (Short-Term Memory)** : Contexte de la session courante
- **MTM (Medium-Term Memory)** : Résumés de sessions récentes
- **LTM (Long-Term Memory)** : Connaissances persistées à long terme

---

## DevTools

> Accessible via le panneau DevTools dans l'interface.

| Outil | Fonction |
|---|---|
| Helios | Métriques système |
| Nexus | Graphe de dépendances |
| Logs | Journal en temps réel |
| Watchdog | Monitoring des processus |
| Monitoring | Dashboard de performance |

---

## Limites connues

- La connectivité Internet est requise pour les fournisseurs cloud (OpenAI, Claude, Gemini)
- Le full E2E est désactivé par défaut en développement
- Certaines fonctionnalités avancées (OMEGA pipeline complet) sont en statut PARTIAL

---

*Documentation en anglais : [docs/user/en/user-guide.md](../en/user-guide.md)*

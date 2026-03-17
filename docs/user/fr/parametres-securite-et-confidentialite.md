# TITANE∞ — Paramètres, Sécurité et Confidentialité (FR)

**Version :** 28.0.0  
**Statut :** PARTIAL  
**Date :** 2026-03-17

---

## Ce qui est local

| Donnée | Stockage | Notes |
|---|---|---|
| Historique de conversation | Local (localStorage) | Reste sur votre machine |
| Clés API des fournisseurs | Local (stockage sécurisé Tauri) | Ne transitent pas vers les serveurs TITANE |
| Profil vocal | Local (backend Tauri) | Synchronisé via IPC |
| Préférences utilisateur | Local | Ne sont pas partagées |
| Logs applicatifs | Local | Dans le répertoire de données de l'app |

---

## Ce qui est distant / réseau

| Opération | Données envoyées | Destinataire | Notes |
|---|---|---|---|
| Messages chat (OpenAI) | Contenu du message + contexte | Serveurs OpenAI | Selon politique OpenAI |
| Messages chat (Claude) | Contenu du message + contexte | Serveurs Anthropic | Selon politique Anthropic |
| Messages chat (Gemini) | Contenu du message + contexte | Serveurs Google | Selon politique Google |
| Messages chat (Ollama) | Contenu du message | Serveur Ollama local | Aucun envoi externe |

> **Politique réseau :** TITANE∞ est **online-first** — les fournisseurs cloud envoient vos données à leurs serveurs respectifs. TITANE∞ lui-même ne collecte pas vos données.

---

## Clés API

### Configuration

Les clés API sont configurées dans le centre **Paramètres** de l'application.

| Fournisseur | Où obtenir la clé | Clé stockée où |
|---|---|---|
| OpenAI | https://platform.openai.com/api-keys | Stockage local Tauri |
| Claude | https://console.anthropic.com/ | Stockage local Tauri |
| Gemini | https://aistudio.google.com/app/apikey | Stockage local Tauri |
| Ollama | N/A (pas de clé) | N/A |

### Sécurité des clés

- Les clés ne sont **jamais** envoyées à des serveurs TITANE
- Les clés ne sont **pas** commitées dans le dépôt Git
- Le fichier `.env` (si utilisé) est dans `.gitignore`

---

## Fichiers de configuration sensibles

| Fichier | Contenu | Action recommandée |
|---|---|---|
| `.env` | Variables d'environnement (clés API) | Ne jamais commiter |
| `.env.example` | Template sans valeurs réelles | Sûr à commiter |
| `.titane-security-config.json` | Config de sécurité | Ne jamais modifier sans compréhension |

---

## Sécurité de l'application

- **Runtime Tauri-only** : pas de serveur web exposé, pas d'Electron
- **IPC gouvernée** : toutes les communications frontend/backend passent par l'IPC Tauri avec allowlist stricte
- **CSP** : Content Security Policy configurée dans `tauri.base.json`
- **No silent failure** : les erreurs sont toujours reportées à l'utilisateur

---

## Limites de confidentialité connues

- Les données envoyées aux fournisseurs cloud (OpenAI, Claude, Gemini) sont soumises à leurs politiques de confidentialité respectives
- TITANE∞ ne peut pas garantir la confidentialité des données transmises aux fournisseurs cloud
- Pour une confidentialité maximale : utilisez **Ollama** avec des modèles locaux

---

*Documentation en anglais : [docs/user/en/settings-security-and-privacy.md](../en/settings-security-and-privacy.md)*

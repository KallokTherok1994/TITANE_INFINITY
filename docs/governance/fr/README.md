# TITANE∞ — Gouvernance (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

> Définit les règles, gates, disciplines de preuve et standards documentaires qui régissent TITANE∞.

---

## Navigation

| Document | Description |
|---|---|
| [Gates](./gates.md) | Gates de vérification et stop-the-line |
| [Politiques](./politiques.md) | Politiques de développement et d'opération |
| [Versioning, release et canons](./versioning-release-et-canons.md) | Autorité de version et processus de release |
| [Registre et proof packs](./registry-et-proof-packs.md) | Gestion des preuves et du registre |
| [Rollback](./rollback.md) | Procédures de rollback |

---

## Principes fondamentaux

### Online-first gouverné (PROVEN — par définition dans les instructions kernel)

TITANE∞ est une application **online-first gouvernée** :
- La connectivité réseau est supposée et requise pour les opérations primaires
- Un fallback local obligatoire doit être disponible (PARTIAL)
- Le label "local-first" dans certains fichiers est un **marqueur de compatibilité uniquement**

### Tauri-only runtime (PROVEN)

- L'application s'exécute exclusivement comme application desktop Tauri
- Pas de serveur web exposé
- Tout I/O passe par l'IPC Tauri avec allowlist stricte

### Contrat IPC (PROVEN)

- Payload : `{ ok, content, error }`
- Zéro échec silencieux
- Toutes les erreurs reportées à l'utilisateur

### Stop-the-line (PROVEN — par gate)

- Tout gate FAIL déclenche un arrêt obligatoire
- Toute violation d'invariant déclenche un arrêt
- Toute contradiction non résolue déclenche un BLOCKED

---

## Hiérarchie des autorités documentaires

```
1. Fichier kernel (.github/copilot-instructions.md)
2. Instructions path-spécifiques (.github/instructions/)
3. Agents sélectionnés (.github/agents/)
4. Fichiers prompts (.github/prompts/)
5. Contexte de tâche
6. Vérité de runtime / validators
```

---

*Documentation en anglais : [docs/governance/en/README.md](../en/README.md)*

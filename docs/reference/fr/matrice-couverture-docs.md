# TITANE∞ — Matrice de Couverture Documentaire

**Date :** 2026-03-17  
**Statut :** PARTIAL (nouvelle structure documentaire en cours d'établissement)

---

| Zone de documentation | Couverture FR | Couverture EN | Source canonique | Statut de preuve | Contradictions ouvertes | Action requise |
|---|---|---|---|---|---|---|
| **README (racine)** | PROVEN | PROVEN | `README.md` | PROVEN | NON | Labels de statut mineurs nécessaires |
| **CHANGELOG** | PROVEN | PROVEN | `CHANGELOG.md` | PROVEN | NON | — |
| **Utilisateur : Installation** | PARTIAL (`docs/user/README.md` v19.4.3) | PARTIAL (`docs/user/en/installation.md`) | `docs/user/fr/installation.md` | PARTIAL | OUI — doc v19.4.3 obsolète | Fichiers canoniques créés |
| **Utilisateur : Démarrage rapide** | PARTIAL (`docs/QUICKSTART_CHAT_IA.md`) | PARTIAL (`docs/user/en/quick-start.md`) | `docs/user/fr/demarrage-rapide.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Utilisateur : Guide** | PARTIAL (`docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md`) | PARTIAL | `docs/user/fr/guide-utilisation.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Utilisateur : Fonctionnalités** | PARTIAL (`docs/user/features/`) | PARTIAL | `docs/user/fr/fonctionnalites-et-centres.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Utilisateur : Paramètres/Confidentialité** | PARTIAL | PARTIAL | `docs/user/fr/parametres-securite-et-confidentialite.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Utilisateur : FAQ** | PARTIAL (`docs/user/faq.md`) | PARTIAL (`docs/user/en/faq.md`) | `docs/user/fr/faq.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Utilisateur : Dépannage** | PARTIAL (`docs/BETA_TROUBLESHOOTING.md`) | PARTIAL | `docs/user/fr/depannage.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Installation environnement** | PARTIAL (`docs/GETTING_STARTED.md` v24.2.0) | PARTIAL (`docs/dev/en/environment-setup.md`) | `docs/dev/fr/setup-environnement.md` | PARTIAL | OUI — ancien guide obsolète | Fichiers canoniques créés |
| **Dev : Architecture** | PROVEN (`docs/ARCHITECTURE.md`, `docs/MAP_ARCHITECTURE_4RING.md`) | PARTIAL | `docs/dev/fr/architecture.md` | QUALIFIED | NON | Fichiers canoniques créés |
| **Dev : Structure du dépôt** | PARTIAL | PARTIAL | `docs/dev/fr/structure-du-repo.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Commandes** | PROVEN (`docs/reference/fr/commandes-reference.md`) | PROVEN (`docs/reference/en/commands-reference.md`) | Fichiers référence | PROVEN | NON | — |
| **Dev : Workflows** | PARTIAL | PARTIAL | `docs/dev/fr/workflows.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Tests & Gates** | PARTIAL (`docs/TESTING_STRATEGY.md`, `docs/MAP_TESTS_GATES.md`) | PARTIAL | `docs/dev/fr/tests-preuves-et-gates.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Build & Release** | PARTIAL (`docs/BUILD_RELEASE_OPTIMIZATION.md`) | PARTIAL | `docs/dev/fr/build-release-et-rollback.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Observabilité** | PARTIAL (`docs/RUNTIME_OBSERVABILITY.md`) | PARTIAL | `docs/dev/fr/observabilite-et-debug.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Conventions** | PARTIAL | PARTIAL | `docs/dev/fr/conventions.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Dev : Dépannage** | PARTIAL (`docs/REPAIR_PLAYBOOK.md`) | PARTIAL | `docs/dev/fr/depannage-dev.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Gouvernance : Gates** | PARTIAL (`docs/MAP_GATES.md`) | PARTIAL | `docs/governance/fr/gates.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Gouvernance : Politiques** | PARTIAL (instructions kernel) | PARTIAL | `docs/governance/fr/politiques.md` | DOC_ONLY | NON | Fichiers canoniques créés |
| **Gouvernance : Versioning** | PROVEN (`docs/reference/fr/rapport-autorite-version.md`) | PROVEN (`docs/reference/en/version-authority-report.md`) | Fichiers référence | PROVEN | NON | — |
| **Gouvernance : Registre & Proof Packs** | PARTIAL (`docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md`) | PARTIAL | `docs/governance/fr/registry-et-proof-packs.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Gouvernance : Rollback** | PARTIAL (`docs/ROLLBACK_INSTRUCTIONS_UPDATE.md`) | PARTIAL | `docs/governance/fr/rollback.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Référence : Glossaire** | PROVEN (`docs/reference/fr/glossaire.md`) | PROVEN (`docs/reference/en/glossary.md`) | Fichiers référence | DOC_ONLY | NON | — |
| **Référence : Commandes** | PROVEN (`docs/reference/fr/commandes-reference.md`) | PROVEN (`docs/reference/en/commands-reference.md`) | Fichiers référence | PROVEN | NON | — |
| **Référence : Matrice de vérité** | PROVEN (`docs/reference/fr/matrice-verite-docs.md`) | PROVEN (`docs/reference/en/docs-truth-matrix.md`) | Fichiers référence | PARTIAL | NON | — |
| **Référence : Autorité de version** | PROVEN (`docs/reference/fr/rapport-autorite-version.md`) | PROVEN (`docs/reference/en/version-authority-report.md`) | Fichiers référence | PROVEN | NON | — |
| **Référence : Matrice de couverture** | PROVEN (ce fichier) | PROVEN (`docs/reference/en/docs-coverage-matrix.md`) | Fichiers référence | PARTIAL | NON | — |
| **Contrat IPC** | PROVEN (`docs/IPC_CONTRACT.md`) | PROVEN (`docs/IPC_CONTRACT.md`) | `docs/IPC_CONTRACT.md` | PROVEN | NON | FR uniquement, version EN nécessaire |
| **Sécurité** | PARTIAL (`docs/SECURITY.md`) | PARTIAL | `docs/governance/en/policies.md` | PARTIAL | NON | Fichiers canoniques créés |
| **Architecture : 4-Ring** | PROVEN (`docs/MAP_ARCHITECTURE_4RING.md`) | PARTIAL | Docs dev architecture | QUALIFIED | NON | — |
| **Fournisseurs / Config IA** | PROVEN (`docs/PROVIDERS.md`, `docs/AI_PROVIDERS.md`) | PARTIAL | Docs fournisseurs | PARTIAL | NON | — |
| **Audio / Voix** | PARTIAL (`docs/CHAT_IA_VOICE_MODE_GUIDE.md`) | PARTIAL | Docs audio | PARTIAL | NON | — |
| **Déploiement** | PARTIAL (`docs/DEPLOYMENT.md`) | PARTIAL | Docs déploiement | PARTIAL | NON | — |
| **Index docs (FR)** | PROVEN (`docs/INDEX_FR.md`) | PROVEN (`docs/INDEX_EN.md`) | Fichiers index | PROVEN | NON | — |

---

## Résumé

| Statut de couverture | Nombre |
|---|---|
| PROVEN FR+EN | 8 |
| PROVEN l'un, PARTIAL l'autre | 5 |
| PARTIAL les deux | 21 |
| DOC_ONLY | 2 |
| BLOCKED | 0 |

**Contradictions ouvertes :** 2 (incompatibilité version ancien README utilisateur, ancien guide getting-started)

---

*Généré : 2026-03-17*

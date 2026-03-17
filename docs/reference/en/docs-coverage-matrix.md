# TITANE∞ — Documentation Coverage Matrix

**Date:** 2026-03-17  
**Status:** PARTIAL (new doc structure being established)

---

| Documentation area | FR coverage | EN coverage | Canonical source | Proof status | Contradictions open | Action required |
|---|---|---|---|---|---|---|
| **README (root)** | PROVEN | PROVEN | `README.md` | PROVEN | NO | Minor status labels needed |
| **CHANGELOG** | PROVEN | PROVEN | `CHANGELOG.md` | PROVEN | NO | — |
| **User: Installation** | PARTIAL (`docs/user/README.md` v19.4.3) | PARTIAL (`docs/user/en/installation.md`) | `docs/user/fr/installation.md` | PARTIAL | YES — v19.4.3 doc outdated | Canonical files created |
| **User: Quick Start** | PARTIAL (`docs/QUICKSTART_CHAT_IA.md`) | PARTIAL (`docs/user/en/quick-start.md`) | `docs/user/fr/demarrage-rapide.md` | PARTIAL | NO | Canonical files created |
| **User: Guide** | PARTIAL (`docs/USER_MANUAL_COMPLETE_v27.0.0_EN.md`) | PARTIAL | `docs/user/fr/guide-utilisation.md` | PARTIAL | NO | Canonical files created |
| **User: Features** | PARTIAL (`docs/user/features/`) | PARTIAL | `docs/user/fr/fonctionnalites-et-centres.md` | PARTIAL | NO | Canonical files created |
| **User: Settings/Privacy** | PARTIAL | PARTIAL | `docs/user/fr/parametres-securite-et-confidentialite.md` | PARTIAL | NO | Canonical files created |
| **User: FAQ** | PARTIAL (`docs/user/faq.md`) | PARTIAL (`docs/user/en/faq.md`) | `docs/user/fr/faq.md` | PARTIAL | NO | Canonical files created |
| **User: Troubleshooting** | PARTIAL (`docs/BETA_TROUBLESHOOTING.md`) | PARTIAL | `docs/user/fr/depannage.md` | PARTIAL | NO | Canonical files created |
| **Dev: Environment Setup** | PARTIAL (`docs/GETTING_STARTED.md` v24.2.0) | PARTIAL (`docs/dev/en/environment-setup.md`) | `docs/dev/fr/setup-environnement.md` | PARTIAL | YES — old guide outdated | Canonical files created |
| **Dev: Architecture** | PROVEN (`docs/ARCHITECTURE.md`, `docs/MAP_ARCHITECTURE_4RING.md`) | PARTIAL | `docs/dev/fr/architecture.md` | QUALIFIED | NO | Canonical files created |
| **Dev: Repo Structure** | PARTIAL | PARTIAL | `docs/dev/fr/structure-du-repo.md` | PARTIAL | NO | Canonical files created |
| **Dev: Commands** | PARTIAL (`docs/COMMANDES_TAURI_COMPLETE_v26.3.0.md`) | PROVEN (`docs/reference/en/commands-reference.md`) | `docs/reference/en/commands-reference.md` | PROVEN | NO | — |
| **Dev: Workflows** | PARTIAL | PARTIAL | `docs/dev/fr/workflows.md` | PARTIAL | NO | Canonical files created |
| **Dev: Tests & Gates** | PARTIAL (`docs/TESTING_STRATEGY.md`, `docs/MAP_TESTS_GATES.md`) | PARTIAL | `docs/dev/fr/tests-preuves-et-gates.md` | PARTIAL | NO | Canonical files created |
| **Dev: Build & Release** | PARTIAL (`docs/BUILD_RELEASE_OPTIMIZATION.md`) | PARTIAL | `docs/dev/fr/build-release-et-rollback.md` | PARTIAL | NO | Canonical files created |
| **Dev: Observability** | PARTIAL (`docs/RUNTIME_OBSERVABILITY.md`) | PARTIAL | `docs/dev/fr/observabilite-et-debug.md` | PARTIAL | NO | Canonical files created |
| **Dev: Conventions** | PARTIAL | PARTIAL | `docs/dev/fr/conventions.md` | PARTIAL | NO | Canonical files created |
| **Dev: Troubleshooting** | PARTIAL (`docs/REPAIR_PLAYBOOK.md`) | PARTIAL | `docs/dev/fr/depannage-dev.md` | PARTIAL | NO | Canonical files created |
| **Governance: Gates** | PARTIAL (`docs/MAP_GATES.md`) | PARTIAL | `docs/governance/fr/gates.md` | PARTIAL | NO | Canonical files created |
| **Governance: Policies** | PARTIAL (kernel instructions) | PARTIAL | `docs/governance/fr/politiques.md` | DOC_ONLY | NO | Canonical files created |
| **Governance: Versioning** | PROVEN (`docs/reference/fr/rapport-autorite-version.md`) | PROVEN (`docs/reference/en/version-authority-report.md`) | Reference files | PROVEN | NO | — |
| **Governance: Registry & Proof Packs** | PARTIAL (`docs/CERTIFICATION_REGISTRY_APPEND_ONLY.md`) | PARTIAL | `docs/governance/fr/registry-et-proof-packs.md` | PARTIAL | NO | Canonical files created |
| **Governance: Rollback** | PARTIAL (`docs/ROLLBACK_INSTRUCTIONS_UPDATE.md`) | PARTIAL | `docs/governance/fr/rollback.md` | PARTIAL | NO | Canonical files created |
| **Reference: Glossary** | PROVEN (`docs/reference/fr/glossaire.md`) | PROVEN (`docs/reference/en/glossary.md`) | Reference files | DOC_ONLY | NO | — |
| **Reference: Commands** | PROVEN (`docs/reference/fr/commandes-reference.md`) | PROVEN (`docs/reference/en/commands-reference.md`) | Reference files | PROVEN | NO | — |
| **Reference: Truth Matrix** | PROVEN (`docs/reference/fr/matrice-verite-docs.md`) | PROVEN (`docs/reference/en/docs-truth-matrix.md`) | Reference files | PARTIAL | NO | — |
| **Reference: Version Authority** | PROVEN (`docs/reference/fr/rapport-autorite-version.md`) | PROVEN (`docs/reference/en/version-authority-report.md`) | Reference files | PROVEN | NO | — |
| **Reference: Coverage Matrix** | PROVEN (`docs/reference/fr/matrice-couverture-docs.md`) | PROVEN (this file) | Reference files | PARTIAL | NO | — |
| **IPC Contract** | PROVEN (`docs/IPC_CONTRACT.md`) | PROVEN (`docs/IPC_CONTRACT.md`) | `docs/IPC_CONTRACT.md` | PROVEN | NO | FR-only, needs EN version |
| **Security** | PARTIAL (`docs/SECURITY.md`) | PARTIAL | `docs/governance/en/policies.md` | PARTIAL | NO | Canonical files created |
| **Architecture: 4-Ring** | PROVEN (`docs/MAP_ARCHITECTURE_4RING.md`) | PARTIAL | Dev architecture docs | QUALIFIED | NO | — |
| **Providers / AI config** | PROVEN (`docs/PROVIDERS.md`, `docs/AI_PROVIDERS.md`) | PARTIAL | Provider docs | PARTIAL | NO | — |
| **Audio / Voice** | PARTIAL (`docs/CHAT_IA_VOICE_MODE_GUIDE.md`) | PARTIAL | Audio docs | PARTIAL | NO | — |
| **Deployment** | PARTIAL (`docs/DEPLOYMENT.md`) | PARTIAL | Deployment docs | PARTIAL | NO | — |
| **Docs Index (FR)** | PROVEN (`docs/INDEX_FR.md`) | PROVEN (`docs/INDEX_EN.md`) | Index files | PROVEN | NO | — |

---

## Summary

| Coverage status | Count |
|---|---|
| PROVEN both FR+EN | 8 |
| PROVEN one, PARTIAL other | 5 |
| PARTIAL both | 21 |
| DOC_ONLY | 2 |
| BLOCKED | 0 |

**Open contradictions:** 2 (old user README version mismatch, old getting-started guide version)

---

*Generated: 2026-03-17*

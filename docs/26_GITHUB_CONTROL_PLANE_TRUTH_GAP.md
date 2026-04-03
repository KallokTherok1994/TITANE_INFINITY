# 26 — GITHUB_CONTROL_PLANE_TRUTH_GAP — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle

Pour les contrôles qui ne peuvent pas être prouvés depuis les fichiers repo seuls, classifier explicitement.

Classes : REPO_PROVED / API_PROVED / UI_ONLY_PENDING / EXTERNAL_CONFIRMATION_REQUIRED / UNKNOWN

---

## Classification par contrôle

| Contrôle | Classe | Justification | Source de vérité requise |
|---------|--------|---------------|------------------------|
| Branch protection active state (MAIN) | EXTERNAL_CONFIRMATION_REQUIRED | Impossible à prouver depuis les fichiers repo | GitHub Settings > Branches ou API `/repos/{owner}/{repo}/branches/{branch}/protection` |
| Rulesets enforced | EXTERNAL_CONFIRMATION_REQUIRED | ruleset JSON non trouvé dans repo; UI/API requis | GitHub Settings > Rulesets |
| Secret scanning enabled state | EXTERNAL_CONFIRMATION_REQUIRED | Aucun fichier repo ne peut confirmer l'état natif GitHub | GitHub Security tab |
| Push protection enabled | EXTERNAL_CONFIRMATION_REQUIRED | Idem | GitHub Security tab |
| Required status check names (match CI jobs) | UI_ONLY_PENDING | Les noms de jobs CI existent (✅) mais l'enforcement branch protection non confirmé | GitHub Settings > Branches |
| Environment protection rules | UNKNOWN | Aucun environment GitHub trouvé dans workflows | GitHub Settings > Environments |
| Code scanning effective coverage | REPO_PROVED + UI_ONLY_PENDING | `codeql.yml` présent (REPO_PROVED); alert triage (UI_ONLY_PENDING) | GitHub Security > Code scanning |
| Dependabot alert presence/triage | EXTERNAL_CONFIRMATION_REQUIRED | `dependabot.yml` présent (REPO_PROVED); alertes actives inconnues | GitHub Security > Dependabot |
| OIDC identity provider configuration | REPO_PROVED | `id-token: write` dans workflows (REPO_PROVED); exécution non vérifiée | Release run |
| CODEOWNERS enforcement | REPO_PROVED + UI_ONLY_PENDING | Fichier présent (REPO_PROVED); enforcement dépend branch protection | Branch protection review requirement |
| Attestation verification | UI_ONLY_PENDING | Step dans workflow mais jamais exécuté | GitHub Actions release run |

---

## Actions propriétaire requises

| Action | Priorité | Délai recommandé |
|--------|----------|-----------------|
| Confirmer branch protection MAIN (required reviews + status checks) | HIGH | Immédiat |
| Activer secret scanning natif + push protection | HIGH | Immédiat |
| Confirmer rulesets actifs | MEDIUM | < 1 semaine |
| Triager alertes Dependabot npm + cargo | MEDIUM | < 1 semaine |
| Déclencher release tag v29.0.0 pour valider attestation | LOW | Prochaine release |

---

## Résumé gap total

| Classe | Nombre de contrôles |
|--------|---------------------|
| REPO_PROVED | 4 |
| REPO_PROVED + UI_ONLY_PENDING | 3 |
| EXTERNAL_CONFIRMATION_REQUIRED | 6 |
| UI_ONLY_PENDING | 1 |
| UNKNOWN | 1 |

**Total contrôles non prouvés depuis repo seul** : 10/15 — Gap significatif, entièrement dépendant de l'owner GitHub.

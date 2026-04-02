# 18 — SINGLE_REAL_LOCK — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle : UN SEUL VRAI LOCK À LA FOIS

---

## CURRENT_REAL_LOCK

```
LOCK_ID    : MANIFEST_VERSION_SYNC
LOCK_CLASS : LOCAL
SCOPE      : deployment/latest/MANIFEST.json
ROOT_CAUSE : Deployment metadata version 28.88.0 ne correspond pas à package.json 29.0.0
TRIGGER    : PROUVÉ (G9 log: "Deployment metadata version mismatch: 28.88.0 vs 29.0.0")
FAMILIES   : RELEASE_TRUTH, GATES_MONOTONICITY
PATCH      : Mettre à jour .deployment.version et .version → "29.0.0" dans MANIFEST.json
ROLLBACK   : git restore -- deployment/latest/MANIFEST.json
MAX_ITER   : 1 (patch minimal, vérification G9)
```

---

## Pourquoi ce lock et pas un autre

| Candidat lock | Raison d'exclusion |
|---------------|-------------------|
| SECRET_SCANNING | EXTERNAL — nécessite owner GitHub UI |
| PUSH_PROTECTION | EXTERNAL — nécessite owner GitHub UI |
| ATTESTATION_VERIFICATION | ENV — nécessite release réelle déclenchée |
| SBOM_EXPORT | LOCAL mais hors scope session actuelle (complexité workflow) |
| RULESETS | EXTERNAL — nécessite owner confirmation |
| VITEST re-run | Non justifié — aucune régression détectée |

---

## Séquence après résolution du lock courant

1. ✅ **MANIFEST_VERSION_SYNC** (session actuelle — si justifié)
2. ⏳ SBOM_EXPORT (prochaine session — ajouter step SPDX)
3. ⏳ RULESETS_CONFIRMATION (owner action requise)
4. ⏳ ATTESTATION_VERIFICATION (première release tag v*)

---

## Note importante

La décision d'ouvrir le patch MANIFEST appartient au gestionnaire du repo.
Ce document identifie le lock, pas l'autorisation.
Le kernel interdit d'ouvrir plusieurs locks simultanément.

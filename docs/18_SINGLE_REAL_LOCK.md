# 18 — SINGLE_REAL_LOCK — TITANE_INFINITY

> Updated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL (vΩ.FINAL)

---

## Règle : UN SEUL VRAI LOCK À LA FOIS

---

## LOCK RÉSOLU — Session précédente

```
LOCK_ID    : MANIFEST_VERSION_SYNC
STATUS     : RÉSOLU ✅
PATCH      : deployment/latest/MANIFEST.json → 29.0.0
G9         : PASS
```

---

## CURRENT_REAL_LOCK — Session vΩ.FINAL

```
LOCK_ID    : SBOM_EXPORT
LOCK_CLASS : LOCAL
SCOPE      : sbom/, scripts/sbom/generate-sbom.sh, .github/workflows/release-unified.yml
ROOT_CAUSE : SBOM stale (28.88.0 vs 29.0.0) + pas de format SPDX + pas d'automation CI
TRIGGER    : PROUVÉ (sbom-header.json: version 28.88.0; package.json: 29.0.0; SPDX absent)
FAMILIES   : SBOM_EXPORT, ARTIFACT_ATTESTATIONS (matrix 22 stale post-attestation ajout)
PATCH      :
  1. generate-sbom.sh — ajout SPDX 2.3 JSON via jq
  2. SBOM régénéré localement (103 composants, version 29.0.0)
  3. release-unified.yml — step SBOM generation + artifacts upload
ROLLBACK   : git restore -- scripts/sbom/generate-sbom.sh sbom/ .github/workflows/release-unified.yml
STATUS     : RÉSOLU ✅
```

---

## Séquence des locks (mise à jour)

1. ✅ **MANIFEST_VERSION_SYNC** (session 2026-04-02 matin)
2. ✅ **SBOM_EXPORT** (session 2026-04-02 vΩ.FINAL)
3. ⏳ RULESETS_CONFIRMATION (owner action requise)
4. ⏳ ATTESTATION_VERIFICATION (première release tag v*)
5. ⏳ SECRET_SCANNING / PUSH_PROTECTION (owner GitHub Settings)

---

## Prochain lock

**NEXT_LOCK** : RULESETS_CONFIRMATION (EXTERNAL) ou ATTESTATION_VERIFICATION (ENV)
Aucun lock local restant identifié.

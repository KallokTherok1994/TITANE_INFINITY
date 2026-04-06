# 08 — CLAIM_OVERREACH_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Définition

Un overreach existe quand une revendication dépasse le niveau de preuve disponible.

---

## Matrice

| Surface | Claim exact | Source de la claim | Niveau de preuve | Contradiction | Sévérité | Action |
|---------|-------------|-------------------|-----------------|---------------|----------|--------|
| `deployment/latest/MANIFEST.json` | version 28.88.0 + `"release_gate_status": "PENDING"` + tokens PROD | MANIFEST.json | DECLARED_ONLY | Package = 29.0.0; G9 FAIL | HIGH | ALIGN_AUTHORITIES |
| `MANIFEST.json` field `"tokens": ["GO_FOR_PROD_BUILD__TITANE_INFINITY", ...]` | Tokens PROD présents dans MANIFEST | MANIFEST.json | DECLARED_ONLY | Tokens dans un fichier JSON ≠ autorisation d'exécution | HIGH | DOWNGRADE — tokens sont narrative, pas executables |
| `"security_posture": "MAXIMUM_HARDENED"` | Sécurité maximale durcie | MANIFEST.json | FALSE_GREEN_RISK | Secret scanning/push protection UNKNOWN | HIGH | DOWNGRADE → PARTIAL_HARDENED |
| `"production_readiness": "PENDING_BINARY_PROOF"` | Attente preuve binaire | MANIFEST.json | PARTIAL | Consistent avec G9 FAIL | MEDIUM | KEEP (honnête) |
| G9 verdict | FAIL (release seal incomplete) | gate run | LOCAL_RUNTIME_PROVEN | Cohérent avec version mismatch | INFO | KEEP |
| `verify_instructions PASS=23` | 23 checks OK | scripts/verify_instructions.sh | LOCAL_RUNTIME_PROVEN | Pas de faux positif détecté | LOW | KEEP |
| `attestation step` dans release-unified.yml | Provenance SLSA Build L2 | workflow YAML | DECLARED_ONLY | Jamais exécutée sans vraie release | MEDIUM | DOWNGRADE → ENABLED_UNVERIFIED |
| `CODEOWNERS` present | Review routing actif | .github/CODEOWNERS | ENABLED_UNVERIFIED | Nécessite branch protection pour enforcement | MEDIUM | KEEP + note |
| `cargo audit` dans ci-unified.yml | Audit Rust actif | workflow YAML | DECLARED_ONLY | Exécuté uniquement en CI | LOW | KEEP |
| `pnpm audit` dans ci-unified.yml | Audit npm actif | workflow YAML | DECLARED_ONLY | continue-on-error: true | LOW | KEEP (noted) |

---

## Résumé des actions

| Action | Nombre | Cibles principales |
|--------|--------|-------------------|
| DOWNGRADE | 3 | MANIFEST security_posture, PROD tokens narrative, attestation |
| ALIGN_AUTHORITIES | 1 | MANIFEST version |
| KEEP | 6 | G9 FAIL, verify_instructions, production_readiness, gates |

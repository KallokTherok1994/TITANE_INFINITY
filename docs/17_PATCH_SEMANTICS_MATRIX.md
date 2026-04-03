# 17 — PATCH_SEMANTICS_MATRIX — TITANE_INFINITY

> Generated: 2026-04-02 | Mode: AUDIT_PLUS_SENTINEL

---

## Règle

Un patch n'est pas prouvé parce que YAML parse, un diff est cohérent, ou un script sort 0 une fois.
La validation sémantique est obligatoire.

---

## Patches de la session courante et sessions précédentes

### P1 — SHA pinning (AH-2026-04-02-SHA-PINNING-003)

| Aspect sémantique | Validé ? | Preuve |
|------------------|----------|--------|
| YAML valide (35 fichiers) | ✅ | python3 yaml.safe_load() sur tous les fichiers |
| Inputs actions compatibles | ✅ | dtolnay avec toolchain: stable explicite |
| Permissions compatibility | ✅ | release-unified.yml id-token+attestations ajoutés |
| actions/attest-build-provenance subject-path | ⚠️ PARTIAL | Chemin `artifacts/**/*.deb` valide sémantiquement mais jamais exécuté |
| Job names vs required status checks | UNKNOWN | Branch protection non confirmée → noms non vérifiés |
| Trigger context compatibility | ✅ | release job conditionnel correct |
| Release assumptions | ✅ | workflow structure cohérente |
| Branch/ruleset/check names alignment | UNKNOWN | EXTERNAL |

**Verdict sémantique P1** : PARTIAL_RUNTIME (structure valide, exécution non prouvée)

### P2 — actions-rs replacement (même session)

| Aspect sémantique | Validé ? | Preuve |
|------------------|----------|--------|
| dtolnay équivalent fonctionnel à actions-rs | ✅ | dtolnay est le remplacement recommandé officiel |
| profile: minimal / override: true omis | ✅ | Ces params non supportés par dtolnay (intentionnel) |
| toolchain: stable préservé | ✅ | Input explicit |
| YAML valide | ✅ | yaml.safe_load |

**Verdict sémantique P2** : PASS_SEMANTIC

### P3 — cargo test --locked

| Aspect sémantique | Validé ? | Preuve |
|------------------|----------|--------|
| Cargo.lock présent | ✅ | src-tauri/Cargo.lock présent |
| --locked compatible Cargo.toml | ✅ | Standard Cargo flag |
| Non breaking pour tests | ✅ | Flag préventif, pas restrictif si lockfile à jour |

**Verdict sémantique P3** : PASS_SEMANTIC

---

## Résumé

| Patch | Verdict sémantique |
|-------|--------------------|
| SHA pinning | PARTIAL_RUNTIME |
| actions-rs remplacement | PASS_SEMANTIC |
| cargo test --locked | PASS_SEMANTIC |
| attestation step | ENABLED_UNVERIFIED |
| dependency review | ENABLED_UNVERIFIED |

**Global patch semantics** : PARTIAL_RUNTIME (attestation + dependency-review nécessitent exécution réelle)

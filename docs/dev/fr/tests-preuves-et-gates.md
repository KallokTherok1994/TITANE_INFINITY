# TITANE∞ — Tests, Preuves et Gates (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

> Voir aussi : `docs/TESTING_STRATEGY.md`, `docs/MAP_TESTS_GATES.md`, `docs/MAP_GATES.md`

---

## Catégories de tests

| Catégorie | Outil | Répertoire | Commande | Statut |
|---|---|---|---|---|
| Tests unitaires | Vitest | `tests/` | `pnpm run test` | PROVEN |
| Tests d'intégration | Vitest | `tests/` | `pnpm run test` | PROVEN |
| Tests E2E navigateur | Playwright | `e2e/` | `pnpm run test:e2e:playwright` | PROVEN |
| Tests E2E desktop | WDIO (WebdriverIO) | `e2e/desktop/` | `pnpm run e2e:desktop` | QUALIFIED |
| Tests Rust | cargo test | `src-tauri/` | `pnpm run test:rust` | PROVEN |
| Tests d'architecture | Vitest custom | `tests/` | `pnpm run test:architecture` | PROVEN |
| Tests de conformité | Vitest custom | `tests/` | `pnpm run test:compliance` | QUALIFIED |
| Tests OMEGA | Vitest custom | `tests/` | `pnpm run test:omega` | PARTIAL |

### Notes importantes

- **Full E2E désactivé par défaut** : `FULL_E2E_ENABLED=false` dans `e2e/chat-provider-decision-certification.spec.ts`
- Le mode mock E2E (`window.__TITANE_E2E_CHAT_MOCK__`) est activable pour les tests qui contournent les vrais fournisseurs

---

## Gates de gouvernance

| Gate | Script | Critère de succès | Audience |
|---|---|---|---|
| G1 — Pas d'offline sans raison | `scripts/gates/g1-no-offline-without-reason.sh` | Exit 0 | CI |
| G2 — Conformité IPC | `scripts/guard/guard-ipc-only-tests.sh` | Exit 0 | CI |
| G3 — Divergence legacy | `scripts/gates/g3-legacy-divergence.sh` | Exit 0 | CI |
| rc-network-surface | `scripts/gates/rc-network-surface-gate.sh` | Exit 0 | CI |
| verify_instructions | `scripts/verify_instructions.sh` | PASS=20, FAIL=0 | dev/CI |
| detect_recurrence | `scripts/autoheal/detect_recurrence.sh` | G_AH_RECURRENCE_GUARD_PASS | dev/CI |
| tauri-only | `scripts/verify/enforce-tauri-only.sh` | Exit 0 | CI |
| online-first | `scripts/verify/enforce-online-first.sh` | Exit 0 | CI |
| tauri-configs | `scripts/verify/validate-tauri-configs.sh` | Exit 0 | CI |
| prod-boot | `scripts/gates/vite-base-relative-gate.cjs` | Exit 0 | CI |

---

## Ce que signifient les verdicts

| Verdict | Signification |
|---|---|
| PASS | Gate passé, vérification réussie |
| FAIL | Gate échoué — STOP-THE-LINE obligatoire |
| BLOCKED | Impossible d'exécuter le gate — action requise |
| QUALIFIED | Partiellement vérifié — incertitude mineure |
| PARTIAL | Certains aspects vérifiés, d'autres non |

---

## Quand les proof packs sont requis

Un proof pack est requis pour :
- Toute session de fix P0 (bug critique)
- Toute modification de la surface IPC
- Toute modification des capabilities Tauri
- Toute release ou pre-release
- Toute opération de gouvernance majeure

**Format :** `proof_packs/[SESSION_NAME]_[DATE]/` avec `VERDICT.md` et `ROLLBACK.md`

---

## Exécution des gates obligatoires

```bash
# Après toute modification de code
bash scripts/verify_instructions.sh
bash scripts/autoheal/detect_recurrence.sh
```

Résultat attendu :
```
verify_instructions: PASS=20 FAIL=0
detect_recurrence: G_AH_RECURRENCE_GUARD_PASS
```

---

*Documentation en anglais : [docs/dev/en/tests-proofs-and-gates.md](../en/tests-proofs-and-gates.md)*

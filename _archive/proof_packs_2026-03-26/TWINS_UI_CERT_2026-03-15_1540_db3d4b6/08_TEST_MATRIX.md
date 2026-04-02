# 08 — MATRICE DE TESTS

| Test | Type | Exécuté | Résultat |
|------|------|---------|---------|
| `npx tsc --noEmit` | Compilation TS | OUI | EXIT 0 ✅ |
| `cargo check` | Compilation Rust | OUI | EXIT 0 ✅ |
| `detect_recurrence.sh` | AutoHeal | OUI | G_AH_RECURRENCE_GUARD_PASS ✅ |
| `verify_instructions.sh` | Gouvernance | OUI | PASS=20 FAIL=0 ✅ |
| E2E desktop Tauri | Runtime | NON | BLOCKED_BY_DESKTOP_RUNTIME |
| Tests unitaires vitest | Unit | NON applicable | Pas de tests unitaires pour ce composant |

## Sortie tsc

```
(aucune sortie — EXIT 0)
```

## Sortie cargo check

```
Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.34s
```

## Sortie detect_recurrence.sh

```
PASS: G_AH_RULE_CAPTURED_FOR_EACH_FIX
PASS: G_AH_RECURRENCE_GUARD_PASS
INFO: entries=275
```

## Sortie verify_instructions.sh

```
PASS: G_MARKER_NO_SKIPS
PASS: G_MARKER_PROOF_PACK
PASS: G_MARKER_AUTOHEAL_CANONICAL_PATH
PASS: G_AH_RECURRENCE_GUARD_PASS
SUMMARY: PASS=20 FAIL=0
```

# 03_INVARIANTS_CHECK.md — Vérification des Invariants

| # | Invariant | Statut | Note |
|---|-----------|--------|------|
| I1 | Tauri-only — commandes dans main.rs invoke_handler | PASS | 378 cmds vérifiées CODE |
| I2 | Online-first gouverné — doctrine active | PASS | Policy documentée et active |
| I3 | UI sans fetch/axios direct non gouverné | QUALIFIED | httpClient.ts désactivé, pas de fetch() direct trouvé dans src/ |
| I4 | 4-Ring strict | QUALIFIED | Structure 4-ring présente structurellement, pas d'analyse statique complète |
| I5 | One Door Network | QUALIFIED | Tous providers via backend, vérifié structurellement |
| I6 | Allowlist deny-by-default | PARTIAL | capabilities/ présent, src-tauri/capabilities/, non audité runtime |
| I7 | IPC canonique avec erreurs catégorisées | PASS | safeInvokeCanonical + CanonicalIpcResult {ok,content,error} |
| I8 | No silent fallback | PARTIAL | Non vérifiable sans runtime |
| I9 | No unbounded retry / no infinite loops | PARTIAL | safeInvokeWithRetry présent (3 tentatives), non vérifié backend |
| I10 | No refactor gratuit | PASS | Session doc-only, aucun code modifié |
| I11 | No fake green | PASS | Aucune gate artificiellement PASS sans preuve |
| I12 | No doc truth over code truth | PASS | Source of truth = main.rs invoke_handler |
| I13 | No multiple active truths | PARTIAL | C003 OPEN (handlers.rs blocs legacy) |
| I14 | Append-only registries | PASS | 22 règles autoheal, registries actifs, append-only confirmé |
| I15 | Aucun verdict fort sans preuves adaptées | PASS | Verdict QUALIFIED, non STABLE/SEALED |

## Violations Actives

- **I13 PARTIAL → RESOLVED** → C003 DOWNGRADED: handlers.rs contient un macro `generate_titane_handlers!` non invoqué. Aucun shadowing réel. Dead code v16 seulement.

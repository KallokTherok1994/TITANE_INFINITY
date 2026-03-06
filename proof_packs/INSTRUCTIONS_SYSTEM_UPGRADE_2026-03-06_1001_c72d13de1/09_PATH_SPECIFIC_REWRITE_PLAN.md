# 09_PATH_SPECIFIC_REWRITE_PLAN

## frontend.instructions.md
- current role: regles UI Ring4 + anti-silence
- target role: invariants UI strictement locaux
- sections to keep: erreurs visibles, selectors stables, no direct network UI, preuves e2e UI
- sections to move: doctrine online/local generale -> kernel
- sections to delete: repetitions status/prod globales
- sections to mechanize: verifier absence direct fetch UI (script guard)
- minimal diff strategy: trim 20-30%, conserver structure DO/DONT/Gates

## tauri.instructions.md
- current role: Tauri-only, capabilities, IPC contract
- target role: discipline tauri locale
- sections to keep: allowlist/capabilities, IPC contract local, bounded I/O, config proofs
- sections to move: doctrine transversale online/local -> kernel
- sections to delete: repetitions globales non tauri
- sections to mechanize: verify_tauri_configs + enforce-tauri-only
- minimal diff strategy: conserver ossature, remplacer redondances par references kernel

## tests-e2e.instructions.md
- current role: wrapper/guard/exports + autoheal requirement
- target role: discipline e2e deterministe
- sections to keep: wrapper obligatoire, exports requis, anti-flake, recurrence guard
- sections to move: politique globale fix capture -> kernel canonical
- sections to delete: formulations dupliquees non e2e
- sections to mechanize: verifier exports obligatoires en script
- minimal diff strategy: garder high-signal, normaliser noms gates

## docs-registry.instructions.md
- current role: append-only docs/reports/proofs
- target role: gouvernance documentation locale
- sections to keep: append-only, preuves minimales, rollback docs
- sections to move: aucun
- sections to delete: ambiguite reports-only si proof_packs utilises
- sections to mechanize: verify proof-pack mandatory files
- minimal diff strategy: patch terminologie preuves

## titane.instructions.md
- current role: macro doctrine + fast path + quality/prod/architecture
- target role: regles surface transversales minimales (ou split en prompts)
- sections to keep: uniquement contraintes non couvertes ailleurs et localement necessaires
- sections to move: fast path/heavy workflows -> prompts
- sections to delete: duplications kernel status/prod/doctrine
- sections to mechanize: verify kernel references, no duplicate doctrine
- minimal diff strategy: split fichier en surfaces + prompts, puis reduire volume

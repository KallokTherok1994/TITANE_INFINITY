# 12 — AUTOHEAL ENTRY

## Entree appliquee
Fichier: scripts/autoheal/autoheal_rules.jsonl
Contenu: voir doc ci-dessous

## Regle enregistree
Pattern: TDZ runtime dans bundle Vite production (services-ai*.js)
Cause: manualChunks separes avec imports circulaires inter-chunks
Fix: fusionner /services/* dans un chunk unique (core-runtime)
Prevention: verifier vite.config.ts manualChunks avant chaque tauri build

## Gates
- detect_recurrence.sh: execute (voir raw/gate_detect_recurrence.log)
- verify_instructions.sh: execute (voir raw/gate_verify_instructions.log)

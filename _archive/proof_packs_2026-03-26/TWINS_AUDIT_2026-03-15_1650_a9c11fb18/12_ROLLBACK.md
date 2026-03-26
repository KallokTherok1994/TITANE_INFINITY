# 12 — ROLLBACK

## Rollback complet de cette session

```bash
git restore -- src/components/twin/TwinEvolutionPanel.tsx
```

## Rollback sessions antérieures (TWINS-001, TWINS-002)

```bash
git restore -- src-tauri/src/main.rs src-tauri/tauri.conf.json
git restore -- src/components/twin/TwinEvolutionPanel.tsx
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

## Vérification post-rollback

```bash
cargo check --manifest-path=src-tauri/Cargo.toml
npx tsc --noEmit --project tsconfig.json
bash scripts/autoheal/detect_recurrence.sh
```

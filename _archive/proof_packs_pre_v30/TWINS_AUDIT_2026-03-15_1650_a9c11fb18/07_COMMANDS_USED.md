# 07 — COMMANDS USED

## Phase 0 — Bootstrap

```
git status --short                     EXIT 0
git rev-parse --short HEAD             → ca268bad8 (initial), a9c11fb18 (final)
git branch --show-current              → MAIN
git log -20 --oneline                  EXIT 0
grep -n "twin*" src-tauri/src/lib.rs   EXIT 0
grep -n "twin*" src-tauri/src/main.rs  EXIT 0
```

## Phase 1 — Discovery

```
grep -i "twins|twin" -rl src/ src-tauri/    EXIT 0
find src/ -name "*twin*" -o -name "*Twin*"  EXIT 0
grep -rln "twin|Twin" src/components/ ...   EXIT 0
```

## Phase 2 — Call Chain

```
cat src/pages/TwinsPage.tsx             EXIT 0
grep -n "TwinsPage|/twins|twin" src/App.tsx  EXIT 0
cat src/services/api/numericTwin.ts     EXIT 0
cat src/hooks/useTwinIdentity.ts        EXIT 0
cat src/hooks/useTwinEvolution.ts       EXIT 0
cat src-tauri/src/numeric_twin/twin_commands.rs  EXIT 0
```

## Phase 3 — Audit

```
grep -n "data-testid|aria-|role=" src/components/twin/TwinEvolutionPanel.tsx  EXIT 0 (vide → F-004/F-005)
grep -n "fusionIndex|return null|admin|isAdmin" src/.../TwinEvolutionPanel.tsx  EXIT 0
grep -n "milestonesCount|milestones_count" src/types/ src-tauri/...  EXIT 0
grep "twin" scripts/autoheal/autoheal_rules.jsonl  EXIT 0
```

## Phase 7 — Tests/Checks

```
cargo check --manifest-path=src-tauri/Cargo.toml   EXIT 0 ✅
npx tsc --noEmit --project tsconfig.json           EXIT 0 ✅ (avant patches)
npx tsc --noEmit --project tsconfig.json           EXIT 0 ✅ (après patches)
```

## Commandes NON exécutées (BLOCKED/DEFERRED)

```
pnpm exec playwright ...   BLOCKED — runtime Tauri non disponible en CI pur
pnpm run test              DEFERRED — no twin tests exist
```

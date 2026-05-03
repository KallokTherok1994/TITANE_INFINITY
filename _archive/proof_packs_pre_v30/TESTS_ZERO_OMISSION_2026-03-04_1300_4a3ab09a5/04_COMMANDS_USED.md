]633;E;{   echo "\\n## Bootstrap executed"\x3b   echo "- $TS git status"\x3b   echo "- $TS git rev-parse --short HEAD"\x3b   echo "- $TS git log -1 --oneline"\x3b   echo "- $TS node -v"\x3b   echo "- $TS pnpm -v"\x3b   echo "- $TS rustc -V"\x3b   echo "- $TS cargo -V"\x3b   echo "- $TS pnpm tauri -v || tauri -V || echo TAURI_MISSING"\x3b } >> "$CMDS";4a32d084-ebc3-40d0-a337-66c1b6517978]633;C\n## Bootstrap executed
- 2026-03-04T18:00:58Z git status
- 2026-03-04T18:00:58Z git rev-parse --short HEAD
- 2026-03-04T18:00:58Z git log -1 --oneline
- 2026-03-04T18:00:58Z node -v
- 2026-03-04T18:00:58Z pnpm -v
- 2026-03-04T18:00:58Z rustc -V
- 2026-03-04T18:00:58Z cargo -V
- 2026-03-04T18:00:58Z pnpm tauri -v || tauri -V || echo TAURI_MISSING

## Canonical REQUIRED vs EXTENDED
- Timestamp UTC: 2026-03-04T18:05:00Z
- Source of truth: proof_packs/TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/discovered_scripts.json
- coverageActive: true

### REQUIRED (x3)
- pnpm test | exists=true
- pnpm test:architecture | exists=true
- pnpm test:compliance | exists=true
- pnpm guard:ipc-contract | exists=true
- pnpm test:rust | exists=true
- pnpm test:e2e:playwright | exists=true
- pnpm e2e:desktop | exists=true
- pnpm test:coverage:check | exists=true
- pnpm verify | exists=true

### EXTENDED (x1 par défaut)
- pnpm test:browser | exists=true
- pnpm test:coverage | exists=true
- pnpm test:coverage:unit | exists=true
- pnpm test:coverage:integration | exists=true
- pnpm audit:master | exists=true
- pnpm audit:security | exists=true
- pnpm audit:coverage | exists=true
- pnpm audit:quality-gates | exists=true
- pnpm copilot-xs:security-scan | exists=true
]633;E;{   echo "\\n## Discovery executed"\x3b   echo "- $TS node scripts/qa/discover_scripts.mjs"\x3b   echo "- $TS rg -n pattern package.json scripts tests src e2e src-tauri .github || true"\x3b   echo "- $TS ls -la e2e tests src/__tests__ src/tests src-tauri scripts || true"\x3b } >> "$PACK_DIR/04_COMMANDS_USED.md";4a32d084-ebc3-40d0-a337-66c1b6517978]633;C\n## Discovery executed
- 2026-03-04T18:03:33Z node scripts/qa/discover_scripts.mjs
- 2026-03-04T18:03:33Z rg -n pattern package.json scripts tests src e2e src-tauri .github || true
- 2026-03-04T18:03:33Z ls -la e2e tests src/__tests__ src/tests src-tauri scripts || true

## Canonical REQUIRED vs EXTENDED
- Timestamp UTC: 2026-03-04T18:03:58.213Z
- Source of truth: proof_packs/TESTS_ZERO_OMISSION_2026-03-04_1300_4a3ab09a5/discovered_scripts.json
- coverageActive: true

### REQUIRED (x3)
- pnpm test | exists=true
- pnpm test:architecture | exists=true
- pnpm test:compliance | exists=true
- pnpm test:rust | exists=true
- pnpm test:e2e:playwright | exists=true
- pnpm e2e:desktop | exists=true
- pnpm guard:ipc-contract | exists=true
- pnpm test:coverage:check | exists=true
- pnpm verify | exists=true

### EXTENDED (x1 par défaut)
- pnpm test:browser | exists=true
- pnpm test:coverage | exists=true
- pnpm test:coverage:unit | exists=true
- pnpm test:coverage:integration | exists=true
- pnpm audit:master | exists=true
- pnpm audit:security | exists=true
- pnpm audit:coverage | exists=true
- pnpm audit:quality-gates | exists=true
- pnpm copilot-xs:security-scan | exists=true

### REQUIRED Selected (exists=true)
- pnpm test
- pnpm test:architecture
- pnpm test:compliance
- pnpm test:rust
- pnpm test:e2e:playwright
- pnpm e2e:desktop
- pnpm guard:ipc-contract
- pnpm test:coverage:check
- pnpm verify

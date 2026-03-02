]633;E;{   echo "# BOOTSTRAP"\x3b   echo\x3b   echo "- generated_at: $(date -Iseconds)"\x3b   echo "- repo: TITANE_INFINITY"\x3b   echo "- branch: $(git branch --show-current)"\x3b   echo\x3b   echo "## git status --porcelain"\x3b   echo '```'\x3b   git status --porcelain || true\x3b   echo '```'\x3b   echo\x3b   echo "## git rev-parse --short HEAD"\x3b   echo '```'\x3b   git rev-parse --short HEAD || true\x3b   echo '```'\x3b   echo\x3b   echo "## git log -20 --oneline"\x3b   echo '```'\x3b   git log -20 --oneline || true\x3b   echo '```'\x3b   echo\x3b   echo "## node -v"\x3b   echo '```'\x3b   node -v || true\x3b   echo '```'\x3b   echo\x3b   echo "## pnpm -v || npm -v"\x3b   echo '```'\x3b   pnpm -v || npm -v || true\x3b   echo '```'\x3b   echo\x3b   echo "## rustc -V"\x3b   echo '```'\x3b   rustc -V || true\x3b   echo '```'\x3b   echo\x3b   echo "## cargo -V"\x3b   echo '```'\x3b   cargo -V || true\x3b   echo '```'\x3b } > "$PACK/01_BOOTSTRAP.md";82d7c740-33bc-4493-bbfa-fbe9001b1573]633;C# BOOTSTRAP

- generated_at: 2026-03-01T15:36:49-05:00
- repo: TITANE_INFINITY
- branch: MAIN

## git status --porcelain
```
 M e2e/chat-provider-decision-certification.spec.ts
 M e2e/critical/app-launch.spec.ts
 M e2e/critical/chat-interaction.spec.ts
 M e2e/critical/engine-navigation.spec.ts
 M e2e/critical/system-resilience.spec.ts
 M e2e/critical/visual-engine.spec.ts
 M e2e/features/audio-center.spec.ts
 M e2e/features/governance-center.spec.ts
 M e2e/features/memory-tree-viewer.spec.ts
 M e2e/features/production-health.spec.ts
 M e2e/feedback-loop.spec.ts
 M e2e/omega-pipeline-e2e.spec.ts
 M e2e/runtime-validation/chat-ar20.spec.ts
 M e2e/smoke.test.ts
 M e2e/user-flows.test.ts
 M package.json
 M playwright.config.ts
 M scripts/e2e/vite-e2e-watch.cjs
 M src/hooks/useChat.ts
?? .last_omega_pack
?? .last_prod_infinite_pack
?? .last_vnext_pack
?? proof_packs/
```

## git rev-parse --short HEAD
```
6c47b0253
```

## git log -20 --oneline
```
6c47b0253 test(e2e): harden Playwright webServer node path
9383521a1 docs(registry): append structure reorg seal event
760e75bd3 docs(structure): canonical rules, target and migration plan
846e05b38 docs(registry): append structure audit seal event
f1b5eb378 docs(evidence): add seal tag trace to structure verdict
c83f07f75 docs(structure): audit gouvernance + gate anti-drift
429d6b457 docs: canonical markdown reorg (inventory + index + evidence)
d43248367 chore: quarantine working tree before docs reorg
8d4d43e10 docs(governance): seal V3 mapping canon and proof-pack sync
c1a781b2a docs(seal): append cleanup addendum and include remaining map docs
81ccac554 docs(map): add generated architecture/network indexes
701721835 chore(scripts): add map refresh helper
ec1592abe chore(vscode): deduplicate task labels
1b29a7fd6 chore(vscode): harden remaining pnpm tasks
88c713817 chore(vscode): use bundled pnpm for copilot architecture task
28bd77099 docs(proof): append post-seal hardening validation snapshot
16f3f00d4 fix(verify): enforce post-certification sections in RC seal proof packs
1cb9276b7 chore(ops): standardize run_x3 profiles for tests build network
d57a32b37 fix(ci): add blocking IPC-only legacy test guard
4ffc81f5b fix(gates): harden RC network surface gate quoting
```

## node -v
```
v24.0.0
```

## pnpm -v || npm -v
```
10.30.2
```

## rustc -V
```
rustc 1.91.1 (ed61e7d7e 2025-11-07)
```

## cargo -V
```
cargo 1.91.1 (ea2d97820 2025-10-10)
```

]633;E;{   echo "# Bootstrap"\x3b   echo\x3b   echo "- Date: $(date -Is)"\x3b   echo "- Branch: $(git rev-parse --abbrev-ref HEAD)"\x3b   echo "- Commit: $(git rev-parse --short HEAD)"\x3b   echo\x3b   echo '```bash'\x3b   echo '$ git status --porcelain=v1'\x3b   git status --porcelain=v1 || true\x3b   echo\x3b   echo '$ git rev-parse --short HEAD'\x3b   git rev-parse --short HEAD || true\x3b   echo\x3b   echo '$ node -v \x3b pnpm -v'\x3b   node -v \x3b pnpm -v || true\x3b   echo\x3b   echo '$ rustc -V \x3b cargo -V'\x3b   rustc -V \x3b cargo -V || true\x3b   echo\x3b   echo '$ pnpm exec playwright --version || echo PLAYWRIGHT_MISSING'\x3b   pnpm exec playwright --version || echo PLAYWRIGHT_MISSING\x3b   echo\x3b   echo '$ pnpm exec wdio --version || echo WDIO_MISSING'\x3b   pnpm exec wdio --version || echo WDIO_MISSING\x3b   echo '```'\x3b } > "$PACK_DIR/01_BOOTSTRAP.md";29349c1c-5169-4cc7-830b-e2b68990cca9]633;C# Bootstrap

- Date: 2026-03-04T22:12:12-05:00
- Branch: seal/vΩ5-20260303-98262da88
- Commit: 749530729

```bash
$ git status --porcelain=v1
?? proof_packs/UI_E2E_ULTRA_2026-03-04_2212_749530729/

$ git rev-parse --short HEAD
749530729

$ node -v ; pnpm -v
v24.0.0
10.30.2

$ rustc -V ; cargo -V
rustc 1.91.1 (ed61e7d7e 2025-11-07)
cargo 1.91.1 (ea2d97820 2025-10-10)

$ pnpm exec playwright --version || echo PLAYWRIGHT_MISSING
Version 1.58.2

$ pnpm exec wdio --version || echo WDIO_MISSING
9.24.0
```

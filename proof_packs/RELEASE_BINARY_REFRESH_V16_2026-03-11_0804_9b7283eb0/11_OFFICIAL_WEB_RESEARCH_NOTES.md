# 11 Official Web Research Notes

## Source: https://v2.tauri.app/distribute/

### Key Findings

1. **Build command**: `cargo tauri build` — produces binary + bundles (DEB, AppImage)
2. **Raw binary only**: `cargo build --release` in src-tauri/ → `target/release/<app>` (no bundle)
3. **TAURI_BINARY_PATH**: Supported env var to override which binary WDIO/tauri-driver uses
4. **Bundle formats**: `--bundles deb,appimage,updater` (subset possible)
5. **No-bundle option**: `cargo tauri build --no-bundle` → binary only, faster

### V16 Decision

We use `cargo build --release` directly (not `cargo tauri build`) because:
- Faster (no bundling overhead)
- We only need the binary for WDIO TAURI_BINARY_PATH proof
- We don't need DEB/AppImage for this proof session
- Full bundle can be done separately for deployment/latest refresh

### Risk Note

The binary built with `cargo build --release` does NOT embed the frontend assets differently
than `cargo tauri build`. Both embed `dist/` via Tauri's `frontendDist` configuration.
The V12/V13 fixes in dist/ will be properly embedded in either case.

## Verdict

RESEARCH_CONFIRMED — cargo build --release is sufficient for WDIO binary proof

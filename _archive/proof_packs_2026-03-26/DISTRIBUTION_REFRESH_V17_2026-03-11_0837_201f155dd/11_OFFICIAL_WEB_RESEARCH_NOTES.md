# 11 Official Web Research Notes

Sources:

- `https://v2.tauri.app/reference/cli/`
- `https://v2.tauri.app/distribute/`

Key confirmations:

- `tauri build` generates release build and bundles/installers.
- CLI option `--bundles` supports Linux values: `deb`, `rpm`, `appimage`.
- Build uses `build.frontendDist` and executes `build.beforeBuildCommand`.
- Split model exists: `tauri build --no-bundle` then `tauri bundle --bundles ...`.

Applied decision in V17:

- Use `cargo tauri build --bundles deb` and `cargo tauri build --bundles appimage`.
- Refresh `deployment/latest` with these exact generated artifacts.
- Validate checksums against deployed files.

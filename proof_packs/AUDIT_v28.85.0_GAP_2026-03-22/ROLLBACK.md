# ROLLBACK — AUDIT_v28.85.0_GAP 2026-03-22

No tracked source files were modified in this session.

To revert the existing uncommitted version bump (28.84.0 → 28.85.0):
```
git restore -- CHANGELOG.md README.md docs/README.md package.json src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.conf.json
```

To restore this proof pack (append-only, no deletion):
```
git restore -- proof_packs/AUDIT_v28.85.0_GAP_2026-03-22/
```

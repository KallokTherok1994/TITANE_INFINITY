# NEXT ACTIONS

IMMEDIATE (done in this session):
  ✅ capabilities/chat_ai.json patched (+3 entries)
  ✅ CHANGELOG.md updated (5-commit section)
  ✅ AutoHeal AH-2026-03-21-CAPS appended
  ✅ cargo check x3 EXIT 0
  ✅ verify_instructions PASS=20 FAIL=0

BEFORE PROD BUILD (require prod tokens):
  1. Provide token: GO_FOR_PROD_BUILD__TITANE_INFINITY
  2. Ensure Node ≥20 build environment
  3. Ensure display server for Tauri build
  4. Run: pnpm build && pnpm tauri build --release
  5. Verify SHA256 of generated AppImage + deb

BEFORE PROD DEPLOY (require prod + deploy tokens):
  1. Provide token: GO_FOR_PROD_DEPLOY__TITANE_INFINITY
  2. Verify updater signing keys
  3. Generate SBOM
  4. Generate artifact attestation (GitHub Actions)
  5. Publish to GitHub Release with signed artifacts

OPTIONAL HARDENING:
  - Add capability coverage script (detect invoke_handler! commands not in any capability JSON)
  - Upgrade CI to Node ≥20
  - Add desktop smoke test to CI (display server via Xvfb)

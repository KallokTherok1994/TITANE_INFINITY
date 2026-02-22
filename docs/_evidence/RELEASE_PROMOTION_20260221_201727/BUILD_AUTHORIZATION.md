# Controlled Build Authorization (Session-Only)

Allowed commands:
- pnpm run build
- pnpm run tauri build

Purpose:
- Release promotion proof pack only

Token gate:
- Requires GO_FOR_PROD_BUILD__TITANE_INFINITY=YES

Expiry:
- This session only. No standing permission.

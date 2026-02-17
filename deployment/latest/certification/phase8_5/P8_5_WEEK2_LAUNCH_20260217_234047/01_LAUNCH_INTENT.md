# 01_LAUNCH_INTENT.md

Timestamp: 2026-02-17T23:40:47Z
Planned time (UTC): 2026-02-25 06:00
Cohort size target: 10 testers
Channels: A (primary), B (fallback)

Artifacts (v27.0.0, unchanged):
- AppImage: titane-infinity-27.0.0.AppImage
  SHA256: 3a419526b59c3dd83455586d03d0dc28c08d0ca9737c66585fe6de3527b89214
- DEB: titan-stable-27.0.0.deb
  SHA256: 3c346782dd3a42dc0cfacf0f1e9f2c8d79acc6f17c9b6af49ac77f4ae24b7da8

Stop criteria:
- P0 incident => rollback immediate
- Token missing => stop-the-line (exit 10)
- Preflight != 0 => stop-the-line
- Git dirty => stop-the-line
- SHA mismatch => stop-the-line
- Dev ports detected => stop-the-line

Human approval required: YES (P8_APPROVAL_TOKEN)
Invariants: no rebuild, no mutation of sealed archives, append-only logs only

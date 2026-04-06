# Docs / README / Registry Changes

## README.md
- Version: 28.5.0 → 28.6.0
- Status line updated
- Release artifacts section updated (TITANE-Infinity_28.6.0 AppImage/deb/rpm)
- Docs reference updated to RELEASE_v28.6.0_SEALED.txt
- GitHub release link updated to v28.6.0

## CHANGELOG.md
- Added [28.6.0] entry documenting: Vite 8, deps recert, governance timeout, provider reliability

## registry/ui-events.jsonl
- No UI-visible truth changed this session — no new registry entry required.
  (Append-only policy: entry only required when UI truth changes)

## scripts/autoheal/autoheal_rules.jsonl
- Appended AH-2026-03-21-NATIVE-FRESHNESS-DIST-INPUT (entry 510)
- Appended AH-2026-03-21-RUST-VERSION-HARDCODED (entry 511)
- Total: 511 entries, append-only integrity PASS

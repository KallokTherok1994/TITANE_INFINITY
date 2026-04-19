# ROLLBACK

git restore -- scripts/update-desktop-icon.sh scripts/post-build/update-desktop-icons.sh tests/unit/scripts/updateDesktopIconScripts.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md RELEASE_SURFACE_INVENTORY.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/DESKTOP_ICON_DOCK_REFRESH_2026-04-19.md proof_packs/DESKTOP_ICON_DOCK_REFRESH_2026-04-19/GATE_REPORT.md proof_packs/DESKTOP_ICON_DOCK_REFRESH_2026-04-19/VERDICT.md proof_packs/DESKTOP_ICON_DOCK_REFRESH_2026-04-19/ROLLBACK.md

Notes:

- La couche systeme sous `/usr/share` n a pas ete modifiee dans cette session faute de sudo interactif.
- Le drift deja present dans `src-tauri/tauri.conf.json` reste hors scope et n entre pas dans ce rollback.
# ROLLBACK

git restore -- scripts/update-desktop-icon.sh tests/unit/scripts/updateDesktopIconScripts.test.ts UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md RELEASE_SURFACE_INVENTORY.md registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl reports/DESKTOP_LAUNCHER_SUDO_HOME_FIX_2026-04-19.md proof_packs/DESKTOP_LAUNCHER_SUDO_HOME_FIX_2026-04-19/GATE_REPORT.md proof_packs/DESKTOP_LAUNCHER_SUDO_HOME_FIX_2026-04-19/VERDICT.md proof_packs/DESKTOP_LAUNCHER_SUDO_HOME_FIX_2026-04-19/ROLLBACK.md

Notes:

- Le launcher systeme actuellement installe restera sur `/root/.titane` tant qu un rerun sudo n est pas effectue.
- Les autres drifts deja presents dans le worktree restent hors scope.
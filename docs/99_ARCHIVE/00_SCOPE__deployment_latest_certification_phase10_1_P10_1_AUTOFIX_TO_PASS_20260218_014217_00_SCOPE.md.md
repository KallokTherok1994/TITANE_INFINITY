]633;E;{   echo "# P10.1 AUTOFIX TO PASS - SCOPE"\x3b   echo ""\x3b   echo "## Done Criteria"\x3b   echo "- UNIT_X3=PASS"\x3b   echo "- INTEGRATION_X3=PASS"\x3b   echo "- DESKTOP_E2E_X3=PASS"\x3b   echo "- NO_DEV_SERVER_X3=PASS"\x3b   echo "- NO_NETWORK_X3=PASS"\x3b   echo "- NO_REAL_WRITES=PASS"\x3b   echo "- SHA256SUMS + LOCK + VERDICT + ROLLBACK"\x3b   echo "- Registry append-only (P10.1 + P10 rerun)"\x3b   echo ""\x3b   echo "## Allowed Paths (Ring 4)"\x3b   echo "- tests/**"\x3b   echo "- e2e/desktop/**"\x3b   echo "- scripts/certification/**"\x3b   echo "- scripts/e2e/**"\x3b   echo "- wdio*.conf.* / vitest*.config.* / package.json (scripts only)"\x3b   echo "- docs/** + deployment/latest/certification/** (proof packs only)"\x3b   echo ""\x3b   echo "## Forbidden (Stop-the-line)"\x3b   echo "- src/**, src-tauri/**, tauri.conf.*, allowlist, providers, routing, UI runtime"\x3b   echo "- dependencies add/remove"\x3b   echo "- pnpm-lock.yaml changes"\x3b   echo ""\x3b   echo "## Loop Bounds"\x3b   echo "- Integration loop: max 3"\x3b   echo "- E2E loop: max 5"\x3b } > "${P10_1_DIR}/00_SCOPE.md";cabcb7b7-7dc1-4b49-ba75-a9bc95b60115]633;C# P10.1 AUTOFIX TO PASS - SCOPE

## Done Criteria
- UNIT_X3=PASS
- INTEGRATION_X3=PASS
- DESKTOP_E2E_X3=PASS
- NO_DEV_SERVER_X3=PASS
- NO_NETWORK_X3=PASS
- NO_REAL_WRITES=PASS
- SHA256SUMS + LOCK + VERDICT + ROLLBACK
- Registry append-only (P10.1 + P10 rerun)

## Allowed Paths (Ring 4)
- tests/**
- e2e/desktop/**
- scripts/certification/**
- scripts/e2e/**
- wdio*.conf.* / vitest*.config.* / package.json (scripts only)
- docs/** + deployment/latest/certification/** (proof packs only)

## Forbidden (Stop-the-line)
- src/**, src-tauri/**, tauri.conf.*, allowlist, providers, routing, UI runtime
- dependencies add/remove
- pnpm-lock.yaml changes

## Loop Bounds
- Integration loop: max 3
- E2E loop: max 5

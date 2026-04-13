# Phase P8 — Seal & Release

<!-- APPEND-ONLY -->

## Objectives

- Final verification before PROD release
- Supply chain signed (G12)
- Support bundle exportable (G13)
- All gates PASS or documented BLOCKED

## Checklist

- [ ] `bash scripts/run_all.sh` — all gates PASS (BLOCKED documented)
- [ ] `bash checks/check_G12_SUPPLY_CHAIN_SIGNED.sh` — PASS/BLOCKED
- [ ] `bash checks/check_G13_SUPPORT_BUNDLE_EXPORTABLE.sh` — PASS
- [ ] `bash scripts/collect_support_bundle.sh` — bundle created
- [ ] `VERDICT_GLOBAL.md` completed
- [ ] Version gate: package.json = Cargo.toml = tauri.conf.json
- [ ] Production build authorized on demand (Rule 11)

## PROD Gate

> Production builds are executed on user request or via BUILD ALL command (Rule 14).

## Evidence

> Paste final run_all.sh output and support bundle path.

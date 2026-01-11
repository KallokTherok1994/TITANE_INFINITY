# COPILOT-XS (Repo-local)

IP / Attribution:

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot (GPT-5.2)
- Licensing: governed by repository LICENSE.md

This folder contains repo-local automation scripts used as a lightweight gate:

- `pnpm run copilot-xs:validate` — scan for prohibited markers and likely secrets
- `pnpm run copilot-xs:status` — verify the COPILOT-XS scaffolding is present
- `pnpm run copilot-xs:precommit` — validate + `pnpm run test:all` (unless `COPILOT_XS_SKIP_TESTS=1`)
- `pnpm run copilot-xs:security-scan` — dependency security scan (`pnpm audit` + `cargo audit` strict)

Validator knobs:

- Full scan: `COPILOT_XS_SCOPE=all pnpm run copilot-xs:validate`
- Disable secret scan: `COPILOT_XS_SECRET_SCAN=0 pnpm run copilot-xs:validate`
- Scan secrets in tests too: `COPILOT_XS_SECRET_SCAN_IN_TESTS=1 pnpm run copilot-xs:validate`
- Reduce false positives: `COPILOT_XS_SECRET_MIN_CHARS=64 pnpm run copilot-xs:validate`
- Allowlist lines: `COPILOT_XS_SECRET_ALLOW_REGEX='example|dummy' pnpm run copilot-xs:validate`

Security scan knobs:

- Report output directory: `COPILOT_XS_SECURITY_REPORT_DIR=reports/security pnpm run copilot-xs:security-scan`
  - writes `pnpm-audit.json`
  - writes `cargo-audit.sarif`

RustSec baseline:

- File: `.github/copilot-xs/cargo-audit-ignores.txt`
- Purpose: keep `cargo audit --deny warnings` actionable by ignoring known transitive advisories (fail only on new advisories).
- Format: one `RUSTSEC-YYYY-NNNN` per line; `#` comments are allowed.

Install/refresh:

- `./scripts/init-copilot-xs.sh`

# COPILOT-XS (Repo-local)

IP / Attribution:

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot (GPT-5.2)
- Licensing: governed by repository LICENSE.md

This folder contains repo-local automation scripts used as a lightweight gate:

- `npm run copilot-xs:validate` — scan for prohibited markers and likely secrets
- `npm run copilot-xs:status` — verify the COPILOT-XS scaffolding is present
- `npm run copilot-xs:precommit` — validate + `npm run test:all` (unless `COPILOT_XS_SKIP_TESTS=1`)

Validator knobs:

- Full scan: `COPILOT_XS_SCOPE=all npm run copilot-xs:validate`
- Disable secret scan: `COPILOT_XS_SECRET_SCAN=0 npm run copilot-xs:validate`
- Scan secrets in tests too: `COPILOT_XS_SECRET_SCAN_IN_TESTS=1 npm run copilot-xs:validate`
- Reduce false positives: `COPILOT_XS_SECRET_MIN_CHARS=64 npm run copilot-xs:validate`
- Allowlist lines: `COPILOT_XS_SECRET_ALLOW_REGEX='example|dummy' npm run copilot-xs:validate`

Install/refresh:

- `./scripts/init-copilot-xs.sh`

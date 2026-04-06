# Optional CI Bootstrap (Non-blocking, separate certified phase)
Goal: introduce minimal GitHub Actions CI without retroactively invalidating local certification.

Principles:
- Hermetic: no side-effects, no tagging, no release actions.
- Explicit timeouts; caching allowed.
- Must not modify runtime behavior.
- Proof-driven: append CI_INFRA_DEPLOYED=YES, then CI_VERIFIED=PASS/FAIL per commit.

Suggested minimal workflow (.github/workflows/ci.yml):
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: env NPM_CONFIG_IGNORE_SCRIPTS=1 pnpm run build
```

Next steps (separate governance phase):
- Create .github/workflows/ci.yml
- Create docs/CI_CONTRACT.md (defines PASS criteria)
- Run first CI build to produce baseline
- Append registry: CI_INFRA_DEPLOYED=YES + CI_BASELINE_PASS=YES

# Trial Plan

## Decision: NO_TRIAL_JUSTIFIED

**Reason**: Two hard peer blockers have no upstream workaround.

`eslint-plugin-react@7.37.5` (latest) peer caps at `^9.7` — no version supports ESLint 10.
`eslint-plugin-react-hooks@7.0.1` (latest) peer caps at `^9.0.0` — no version supports ESLint 10.

A trial cannot succeed without compatible plugin versions. Installing ESLint 10 with these plugins
would produce peer conflicts and likely runtime failures. No isolated trial is justified.

---

## What a future trial would require (for tracking)

When the blockers are resolved, a trial would need:

1. **Plugin upgrades** (once published with ESLint 10 peer support):
   - `eslint-plugin-react` → version with `|| ^10` in peerDeps
   - `eslint-plugin-react-hooks` → version with `|| ^10` in peerDeps

2. **Config migration** (`.eslintrc.cjs` → native flat config):
   - Remove `FlatCompat` from `eslint.config.js`
   - Rewrite all `plugin:*/recommended` extends into flat config `rules` objects
   - Rewrite all `overrides` into separate flat config array entries
   - Update `parser` to flat-config `languageOptions.parser`

3. **Trial success criteria**:
   - `pnpm exec eslint src --max-warnings=999` exits 0
   - No new rule violations compared to champion baseline
   - `pnpm tsc --noEmit` exits 0
   - All governance gates PASS

4. **Estimated effort**: Medium (config migration is non-trivial due to FlatCompat removal + complex overrides)

---

## Re-evaluation trigger

Monitor:
- `eslint-plugin-react` npm releases for `^10` peer support
- `eslint-plugin-react-hooks` npm releases for `^10` peer support (React team ships this)
- ESLint 10 adoption curve in major React projects

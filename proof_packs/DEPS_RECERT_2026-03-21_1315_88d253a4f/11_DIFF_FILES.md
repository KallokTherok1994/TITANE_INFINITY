# Diff Files — Changed in Dependency Update Rounds

**Date:** 2026-03-21

---

## Round 3 (commit 60c11fdf1)

**Commit:** `chore(deps): update round 3 - jsdom 29.0.1, eslint 9.39.4 (eslint 10 incompatible with eslint-plugin-react)`

```
 package.json   |   6 +-
 pnpm-lock.yaml | 261 ++++++++++++++++++++++++++++++++-------------------------
 2 files changed, 148 insertions(+), 119 deletions(-)
```

**Changes:**
- `package.json`: jsdom ^28 → ^29.0.1, eslint ^9.39.3 → ^9.39.4, @eslint/js ^9.39.3 → ^9.39.4
- `pnpm-lock.yaml`: lockfile updated to reflect resolved versions

**Note:** eslint 10 attempted and rolled back — eslint-plugin-react@7.37.5 crashes on eslint 10 (peer constraint: `^9.7`)

---

## Round 2 (commit e9ee8efb8)

**Commit:** `chore(deps): update round 2 - vitest 4.1, storybook 10.3, @types/node 25.5, eslint-plugin-react-refresh 0.5.2`

```
 package.json   |  14 +-
 pnpm-lock.yaml | 437 +++++++++++++++++++++++++++++----------------------------
 2 files changed, 226 insertions(+), 225 deletions(-)
```

**Changes:**
- `package.json`: vitest 4.1.0, @vitest/* 4.1.0, storybook 10.3.1, @storybook/* 10.3.1, @types/node 25.5.0, eslint-plugin-react-refresh 0.5.2
- `pnpm-lock.yaml`: lockfile updated

---

## Round 1

Part of earlier patch/minor updates commit (9b50cc67e).

---

## Files Touched Summary

| File | Rounds | Nature |
|------|--------|--------|
| package.json | 1, 2, 3 | Dep version bumps |
| pnpm-lock.yaml | 1, 2, 3 | Lockfile updates |
| No src/ changes | — | Pure dep updates, no code changes |

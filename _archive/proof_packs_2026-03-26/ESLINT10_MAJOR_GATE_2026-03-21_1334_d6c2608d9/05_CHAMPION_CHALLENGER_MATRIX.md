# Champion vs Challenger Matrix

## Champion (Current Stack)

| Package | Version | Status |
|---------|---------|--------|
| eslint | 9.39.4 | ✅ CERTIFIED STABLE |
| @eslint/js | 9.39.4 | ✅ |
| eslint-plugin-react | 7.37.5 | ✅ |
| eslint-plugin-react-hooks | 7.0.1 | ✅ |
| @typescript-eslint/eslint-plugin | 8.57.1 | ✅ |
| @typescript-eslint/parser | 8.57.1 | ✅ |
| eslint-plugin-react-refresh | 0.4.26 | ✅ |
| eslint-plugin-storybook | 10.2.12 | ✅ |
| Config format | FlatCompat + .eslintrc.cjs | ✅ FUNCTIONAL |

**Champion lint**: EXIT 0
**Champion tsc**: EXIT 0

---

## Challenger (ESLint 10 Target)

| Package | Would Need | ESLint 10 Ready? | Status |
|---------|-----------|-----------------|--------|
| eslint | 10.1.0 | ✅ | Available |
| @eslint/js | 10.0.1 | ✅ | Available |
| eslint-plugin-react | needs `^10` peer | ❌ NOT PUBLISHED | **BLOCKED** |
| eslint-plugin-react-hooks | needs `^10` peer | ❌ NOT PUBLISHED | **BLOCKED** |
| @typescript-eslint/eslint-plugin | 8.57.1 (unchanged) | ✅ | Ready |
| @typescript-eslint/parser | 8.57.1 (unchanged) | ✅ | Ready |
| eslint-plugin-react-refresh | 0.4.26 (unchanged) | ✅ | Ready |
| eslint-plugin-storybook | latest (unchanged) | ✅ | Ready |
| Config format | Native flat-config rewrite | ⚠️ MIGRATION NEEDED | Effort required |

---

## Decision

**CHAMPION RETAINED**

Challenger (ESLint 10) cannot be deployed because two required plugins have no published version
supporting ESLint 10. The challenger is not a viable contender at this time.

The champion (eslint 9.39.4) is certified stable with zero lint errors and zero tsc errors.
No action required until upstream plugins publish ESLint 10–compatible releases.

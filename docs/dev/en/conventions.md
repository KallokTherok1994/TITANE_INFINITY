# TITANE∞ — Conventions (EN)

**Version:** 28.0.0  
**Status:** DOC_ONLY  
**Date:** 2026-03-17

---

## Naming

| Element | Convention | Example |
|---|---|---|
| TypeScript files | camelCase | `conversationEngine.ts` |
| React components | PascalCase | `ChatPanel.tsx` |
| Test files | `.test.ts` or `.spec.ts` | `chat.test.ts` |
| Shell scripts | kebab-case or snake_case | `detect_recurrence.sh` |
| Directories | kebab-case or snake_case | `audio-center/`, `proof_packs/` |
| AutoHeal IDs | `AH-YYYY-MM-DD-[DESCRIPTION]` | `AH-2026-03-17-FIX-001` |

---

## Code conventions

### TypeScript

- Strict mode enabled (`tsconfig.json`)
- No implicit `any`
- No circular imports between rings
- Prefer `const` over `let`
- Error handling: always return a user-readable error

### Rust

- Edition 2021
- No uncontrolled `unwrap()` — use `expect()` with message or propagate error
- All IPC handlers return `{ ok: bool, content?, error? }`
- Arc<Mutex<T>> for shared concurrent state

---

## Documentation discipline

### No-fiction rule

Never write that a feature is:
- stable
- complete
- production-ready
- self-healing
- synced
- secure
- automated
- validated

...unless that claim is directly supported by proof in the repository.

**Always use status labels:** PROVEN | QUALIFIED | PARTIAL | BLOCKED | LEGACY | DOC_ONLY | PLANNED

### Version update

1. Modify `package.json` → `version`
2. Modify `src-tauri/Cargo.toml` → `version`
3. Add entry to `CHANGELOG.md`
4. Update `README.md` if needed

### Bilingual discipline

- Each FR document must link to its EN equivalent
- Each EN document must link to its FR equivalent
- No silent semantic divergence between language versions

---

## AutoHeal discipline

For each applied fix:

1. Add entry to `scripts/autoheal/autoheal_rules.jsonl`
2. The `prevention_test` field MUST contain the substring `detect_recurrence`
3. Run `bash scripts/autoheal/detect_recurrence.sh`
4. Run `bash scripts/verify_instructions.sh`

---

## Commit conventions

```
type(scope): short description

feat: new feature
fix: bug fix
docs: documentation only
refactor: refactoring without behavior change
test: add/modify tests
ci: CI/CD changes
chore: maintenance tasks
seal: governed sealing session
```

---

*French documentation: [docs/dev/fr/conventions.md](../fr/conventions.md)*

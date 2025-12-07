---
name: TITANE Global Instructions
version: 19.4.3+
updated: 2025-12-06
---

# 📚 TITANE Project — Global Development Instructions

## 🎯 Project Overview

**TITANE_INFINITY** : Architecture logicielle cognitive locale avec 9 moteurs interconnectés.

- **Frontend** : React 18 + Vite 6 + TypeScript (strict)
- **Backend** : Tauri v2 + Rust (async)
- **Philosophy** : Local-first, privacy-first, self-healing, cognitive

## 🏗️ Architecture — 9 Moteurs (DÉFINITIVE)

```
┌─────────────────────────────────────────────────────┐
│                  TITANE Singularity                  │
│              (Arc<RwLock<SingularityState>>)         │
└─────────────────────────────────────────────────────┘
    │
    ├─── #0: Orchestrator ─── Master coordination
    │
    ├─── #1: Style Engine ─── Conversational consistency
    │
    ├─── #2: CoherenceEngine ────┐
    │    (Fusion: Nexus +         │ COMPLETE ✅
    │     ConsistencyEngine)      │ (3 fusions = 9/9)
    │
    ├─── #3: Reflection Engine ─ Self-analysis
    │
    ├─── #4: Emotion Engine ─── Emotional dimension
    │
    ├─── #5: UnifiedMemory ──────┐
    │    (Fusion: Memory #5 +     │ COMPLETE ✅
    │     MemoryModule +          │
    │     Singularity Memory)     │
    │    [STM/MTM/LTM + AES-256]  │
    │
    ├─── #6: Behavior Engine ── Behavioral patterns
    │
    ├─── #7: Adaptation Engine - Contextual evolution
    │
    └─── #8: SystemHealth ──────┐
         (Fusion: Helios +       │ COMPLETE ✅
          Sentinel +             │
          Self-Heal)             │
         [Monitoring + Self-Heal] │
```

**⚠️ RÈGLE ABSOLUE** : Ne JAMAIS réintroduire les 14 anciens composants.
Architecture 9 moteurs = **DÉFINITIVE ET IMMUABLE**.

## 🛠️ Stack Technique

### Frontend
```json
{
  "react": "^18.3",
  "vite": "^6.0",
  "typescript": "^5.4",
  "vite-plugin-react": "^4.3",
  "tailwindcss": "^3.4",
  "axios": "^1.7"
}
```

**Standards** :
- TypeScript `strict: true` (OBLIGATOIRE)
- `no-any` ESLint rule (ZÉRO exceptions)
- Async/await pour promises (TOUJOURS)
- Try/catch pour error handling (OBLIGATOIRE)
- React hooks + context (NO classes)

### Backend
```toml
[dependencies]
tauri = { version = "2", features = ["all"] }
tokio = { version = "1.40", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
aes-gcm = "0.10"  # For encryption
```

**Standards** :
- async/await PARTOUT (NO sync I/O)
- `Result<T, Error>` pour erreurs (OBLIGATOIRE)
- ZÉRO `unwrap()` / `panic!()` / `expect()`
- Unit tests pour fonctions publiques (OBLIGATOIRE)
- Documentation `///` comments (OBLIGATOIRE)

## 📋 Coding Conventions

### Rust Async Pattern (MANDATORY)
```rust
// ✅ CORRECT
pub async fn fetch_data(id: &str) -> Result<Data, Error> {
    let response = client.get(url).await?;
    let data: Data = response.json().await?;
    Ok(data)
}

#[tokio::test]
async fn test_fetch_data() {
    let result = fetch_data("123").await;
    assert!(result.is_ok());
}

// ❌ FORBIDDEN
pub fn fetch_data(id: &str) -> Data {
    client.get(url).unwrap()     // ❌ CRASH
    panic!("error")               // ❌ FORBIDDEN
    expect("msg")                 // ❌ FORBIDDEN
}
```

### TypeScript Strict Pattern (MANDATORY)
```typescript
// ✅ CORRECT
interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const user: User = await response.json();
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    throw error;
  }
}

// ❌ FORBIDDEN
function fetchUser(id: any): any {              // ❌ any
  return fetch(`/api/users/${id}`)              // ❌ No error handling
    .then(r => r.json());
}
```

### Module Organization
```
src-tauri/src/
├── core/
│   ├── state.rs           (SingularityState def)
│   ├── types.rs           (Shared types)
│   ├── error.rs           (Error definitions)
│   ├── engine.rs          (Engine trait)
│   └── modules/           (9 motors)
│       ├── mod.rs
│       ├── coherence.rs           ✅ Fusion #1
│       ├── unified_memory.rs      ✅ Fusion #2
│       └── system_health.rs       ✅ Fusion #3
├── commands/              (Tauri commands)
│   ├── coherence_commands.rs      ✅ 5 commands
│   ├── unified_memory_commands.rs ✅ 6 commands
│   └── system_health_commands.rs  ✅ 6 commands
├── persistence/           (State persistence)
├── main.rs                (Tauri setup)
└── lib.rs                 (Library exports)

src/
├── components/            (React components)
├── hooks/                 (Custom hooks)
├── store/                 (State management)
├── services/              (API services)
├── types/                 (TypeScript types)
└── App.tsx
```

## 🧪 Testing Requirements

### Rust (MANDATORY)
```rust
// Every public function MUST have at least one test
#[test]
fn test_function_name() {
    // Arrange
    let input = "test";
    
    // Act
    let result = function_under_test(input);
    
    // Assert
    assert!(result.is_ok());
    assert_eq!(result.unwrap(), "expected");
}

// Async functions use #[tokio::test]
#[tokio::test]
async fn test_async_function() {
    let result = async_function().await;
    assert!(result.is_ok());
}
```

**Coverage** :
- Happy path (primary scenario)
- Edge cases (empty, None, 0)
- Error handling (invalid input)
- Minimum : 80% coverage

### TypeScript (MANDATORY)
```typescript
// Use Jest or Vitest
describe('ModuleName', () => {
  it('should handle happy path', () => {
    const result = functionUnderTest('input');
    expect(result).toBe('expected');
  });

  it('should handle edge case', () => {
    const result = functionUnderTest('');
    expect(result).toBeUndefined();
  });
});
```

**Coverage** :
- Component rendering
- User interactions
- State changes
- Error boundaries
- Minimum : 70% coverage

## 🔄 Git Workflow

### Commit Messages (Conventional Commits)
```
feat: Add new feature description
  - Details about what was added
  - Files modified
  - Tests added

fix: Fix bug in module
  - Describe the bug
  - How it was fixed
  - Tests validating fix

refactor: Restructure module X
  - What was changed
  - Why
  - No functional changes

docs: Update README and guides

perf: Improve performance of function X
  - Before: O(n²)
  - After: O(n log n)

test: Add tests for feature Y
  - Coverage improved from 70% to 85%
```

### Branch Naming
```
feature/describe-feature-name
bugfix/describe-bug-name
refactor/describe-refactor
docs/what-updated
```

### Before Committing
```bash
# Format code
cargo fmt
npx prettier --write src/

# Lint
cargo clippy -- -W clippy::all
npx eslint src/ --fix

# Test
cd src-tauri && cargo test --all
npm test

# Check build
cargo build --lib --release
npm run build
```

## 📊 Code Quality Standards

### Rust Checklist
- [ ] ZERO `unwrap()` / `panic!()` / `expect()` (except tests)
- [ ] All public functions have `Result<T, Error>`
- [ ] All public functions have `///` documentation
- [ ] All public functions have `#[test]`
- [ ] `cargo clippy -- -W clippy::all` passes
- [ ] `cargo fmt` passes
- [ ] Tests pass : `cargo test --all`

### TypeScript Checklist
- [ ] ZERO `any` (zero exceptions)
- [ ] ZERO `!` non-null assertions
- [ ] All functions have explicit return types
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint src/ --max-warnings 0` passes
- [ ] `npx prettier --check src/` passes
- [ ] Tests pass : `npm test`

## 🚀 Development Workflow

### 1. Start New Task
```bash
git checkout -b feature/your-feature
```

### 2. Write Tests First (TDD)
Create `.test.rs` or `.test.ts` files BEFORE implementation.

### 3. Implement Code
Write minimal code to pass tests.

### 4. Refactor & Cleanup
Optimize, document, improve.

### 5. Verify Quality
```bash
cargo fmt && cargo clippy
npx prettier --write src/ && npx eslint src/ --fix
cargo test --all && npm test
cargo build --lib --release
npm run build
```

### 6. Commit
```bash
git add .
git commit -m "feat: Add feature description"
```

### 7. Review
Use review checklist from review-subagent.agent.md

### 8. Merge
```bash
git push origin feature/your-feature
# Create PR in GitHub, get approval, merge
```

## 🔒 Security Standards

- [ ] No hardcoded secrets
- [ ] Input validation on all user input
- [ ] SQL injection protection (if using DB)
- [ ] CSRF protection (if needed)
- [ ] XSS protection in React
- [ ] HTTPS only in production
- [ ] Secrets in `.env` files (never committed)
- [ ] Dependency audit : `npm audit` + `cargo audit`

## 📖 Documentation

Every public function/component MUST have documentation:

### Rust
```rust
/// Summarizes text to single sentence
/// 
/// # Arguments
/// * `text` - Input text to summarize
/// * `max_length` - Maximum length of summary
///
/// # Returns
/// Result containing summary or error
///
/// # Errors
/// Returns error if text is empty or invalid
///
/// # Example
/// ```
/// let summary = summarize_text("Hello. World.", 50)?;
/// assert!(!summary.is_empty());
/// ```
pub fn summarize_text(text: &str, max_length: usize) -> Result<String, Error> { }
```

### TypeScript
```typescript
/**
 * Summarizes text to single sentence
 * 
 * @param text - Input text to summarize
 * @param maxLength - Maximum length of summary
 * @returns Promise resolving to summary
 * @throws Error if text is empty
 * 
 * @example
 * ```ts
 * const summary = await summarizeText("Hello. World.", 50);
 * console.log(summary); // "Hello."
 * ```
 */
export async function summarizeText(
  text: string,
  maxLength: number
): Promise<string> { }
```

## 🎯 Non-Negotiable Rules

1. **Tests First** : Write tests BEFORE code (TDD)
2. **No Unwrap** : ZERO `unwrap()` / `panic!()` / `expect()` in production
3. **Type Safe** : ZERO `any` in TypeScript
4. **Documentation** : Every public function documented
5. **Quality First** : Clippy/ESLint/TypeScript all pass before commit
6. **9 Motors Only** : NEVER reintroduce old components
7. **Async Everywhere** : All I/O must use async/await

## 📞 Getting Help

1. Check ARCHITECTURE.md for design patterns
2. Search CHANGELOG.md for similar changes
3. Ask team in #development channel
4. Request review from senior dev

## 🎓 Learning Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Docs](https://react.dev)
- [Tauri Docs](https://tauri.app/en/guides/)

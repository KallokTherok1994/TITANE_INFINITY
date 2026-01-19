# COLLECTION SUPER-PROMPTS GITHUB COPILOT
## TITANE_INFINITY — Automatisation Développement 70-85%

**Date** : 9 décembre 2025  
**Version** : 1.0  
**Portée** : Phases 1-3 (Stabilisation + Architecture + Performance)  
**Total prompts** : 30 super-prompts prêts à copier-coller

---

## 📚 TABLE DES MATIÈRES

**PHASE 1 : STABILISATION (Prompts #1-12)**
- Backend Error Handling (#1-4)
- Clippy Warnings (#5-8)
- TypeScript Fixes (#9-12)

**PHASE 2 : ARCHITECTURE (Prompts #13-22)**
- Master Orchestrator (#13-15)
- Unified Memory (#16-18)
- Component Fusion (#19-22)

**PHASE 3 : PERFORMANCE (Prompts #23-30)**
- IPC Optimization (#23-25)
- Memory Optimization (#26-28)
- Caching System (#29-30)

---

## 🎯 COMMENT UTILISER CES PROMPTS

### Méthode GitHub Copilot Chat

1. **Ouvrir Copilot Chat** dans VS Code (Ctrl+Shift+I / Cmd+Shift+I)
2. **Copier-coller** le super-prompt complet
3. **Attendre** génération (10-60 secondes)
4. **Review** code généré
5. **Accepter/Ajuster** si nécessaire
6. **Tester** : `cargo test` ou `pnpm test`
7. **Commit** si tests passent

### Best Practices

✅ **DO** :
- Copier prompt entier (pas couper)
- Lire code généré avant accepter
- Tester après chaque génération
- Commit incrémentalement
- Noter ajustements nécessaires

❌ **DON'T** :
- Accepter aveuglément
- Générer tout d'un coup
- Skip tests
- Commit sans review
- Ignorer warnings Copilot

---

## 🔴 PHASE 1 : STABILISATION (Prompts #1-12)

### Backend Error Handling (#1-4)

---

#### PROMPT #1 : Create Unified AppError System

\`\`\`markdown
@workspace Create a comprehensive error handling system for TITANE_INFINITY Rust backend.

**CONTEXT:**
Currently 303 unwrap() and 44 expect() calls can cause crashes.
Need production-ready error type covering all failure modes.

**REQUIREMENTS:**

1. Create `src-tauri/src/error.rs`:

\`\`\`rust
use thiserror::Error;

/// Application-wide error type
#[derive(Error, Debug)]
pub enum AppError {
    /// IO errors (file operations, network)
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    /// JSON serialization/deserialization errors
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    /// Database errors (sled)
    #[error("Database error: {0}")]
    Database(String),
    
    /// AI provider errors (OpenAI, Claude, etc.)
    #[error("AI provider error: {0}")]
    AiProvider(String),
    
    /// Memory system errors
    #[error("Memory error: {0}")]
    Memory(String),
    
    /// IPC communication errors
    #[error("IPC error: {0}")]
    Ipc(String),
    
    /// Audio processing errors (TTS/STT)
    #[error("Audio error: {0}")]
    Audio(String),
    
    /// Configuration errors
    #[error("Configuration error: {0}")]
    Config(String),
    
    /// Resource not found
    #[error("Not found: {0}")]
    NotFound(String),
    
    /// Invalid user input
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    /// Internal server error
    #[error("Internal error: {0}")]
    Internal(String),
    
    /// Tauri-specific errors
    #[error("Tauri error: {0}")]
    Tauri(String),
    
    /// HTTP request errors
    #[error("HTTP error: {0}")]
    Http(String),
}

// Implement Serialize for Tauri IPC compatibility
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

/// Convenience Result type alias
pub type Result<T> = std::result::Result<T, AppError>;

/// Extension trait for Option to AppError conversion
pub trait OptionExt<T> {
    /// Convert Option to Result with custom AppError
    fn ok_or_app_error(self, error: AppError) -> Result<T>;
}

impl<T> OptionExt<T> for Option<T> {
    fn ok_or_app_error(self, error: AppError) -> Result<T> {
        self.ok_or(error)
    }
}

/// Helper for creating NotFound errors
pub fn not_found<T: std::fmt::Display>(item: T) -> AppError {
    AppError::NotFound(item.to_string())
}

/// Helper for creating Internal errors
pub fn internal<T: std::fmt::Display>(msg: T) -> AppError {
    AppError::Internal(msg.to_string())
}
\`\`\`

2. Add to `src-tauri/src/lib.rs`:

\`\`\`rust
mod error;
pub use error::{AppError, Result, OptionExt, not_found, internal};
\`\`\`

3. Update `src-tauri/Cargo.toml`:

\`\`\`toml
[dependencies]
thiserror = "1.0"
serde = { version = "1.0", features = ["derive"] }
\`\`\`

**VALIDATION:**

\`\`\`bash
cd src-tauri
cargo build
# Should compile successfully
cargo test
# Should pass
\`\`\`

**DELIVERABLE:**
✅ `src-tauri/src/error.rs` with AppError
✅ Exports in lib.rs
✅ thiserror dependency added
✅ Compiles without errors
✅ Tests pass
\`\`\`

---

#### PROMPT #2 : Replace Unwraps in Memory Core

\`\`\`markdown
@workspace Systematically replace ALL unwrap() and expect() in src-tauri/src/modules/memory_core.rs

**CONTEXT:**
Memory Core is critical - must NEVER crash.
Using AppError from src-tauri/src/error.rs.

**STEP-BY-STEP INSTRUCTIONS:**

1. Add imports at top:
\`\`\`rust
use crate::error::{AppError, Result, OptionExt, not_found};
\`\`\`

2. Change ALL function signatures to return Result<T>:

BEFORE:
\`\`\`rust
pub fn store(&mut self, entry: MemoryEntry) -> String {
    // ...
    entry_id
}
\`\`\`

AFTER:
\`\`\`rust
pub fn store(&mut self, entry: MemoryEntry) -> Result<String> {
    // ...
    Ok(entry_id)
}
\`\`\`

3. Replace unwrap() patterns:

BEFORE:
\`\`\`rust
let value = map.get(&key).unwrap();
\`\`\`

AFTER:
\`\`\`rust
let value = map.get(&key)
    .ok_or_app_error(not_found(format!("Key: {}", key)))?;
\`\`\`

4. Replace expect() patterns:

BEFORE:
\`\`\`rust
let data = serde_json::from_str(&json).expect("JSON parse failed");
\`\`\`

AFTER:
\`\`\`rust
let data = serde_json::from_str(&json)?;
\`\`\`

5. Replace panic!() patterns:

BEFORE:
\`\`\`rust
if condition {
    panic!("Something wrong");
}
\`\`\`

AFTER:
\`\`\`rust
if condition {
    return Err(internal("Something wrong"));
}
\`\`\`

6. Propagate errors with ? operator:

BEFORE:
\`\`\`rust
match some_function() {
    Ok(val) => val,
    Err(e) => return Err(e.to_string()),
}
\`\`\`

AFTER:
\`\`\`rust
some_function()?
\`\`\`

**VALIDATION:**

\`\`\`bash
cd src-tauri
cargo clippy -- -D clippy::unwrap_used -D clippy::expect_used
# Should pass for memory_core.rs

cargo test --lib memory_core
# All tests should pass
\`\`\`

**DELIVERABLE:**
✅ 0 unwrap() in memory_core.rs
✅ 0 expect() in memory_core.rs  
✅ 0 panic!() in memory_core.rs
✅ All functions return Result<T>
✅ Tests pass
✅ Clippy clean
\`\`\`

---

#### PROMPT #3 : Replace Unwraps in AI Router

\`\`\`markdown
@workspace Replace unwrap/expect in src-tauri/src/ai/router.rs with AppError handling

**CONTEXT:**
AI Router coordinates multiple AI providers - failures must be graceful.
HTTP requests, JSON parsing, API errors all need proper handling.

**REQUIREMENTS:**

1. Import error types:
\`\`\`rust
use crate::error::{AppError, Result, OptionExt};
\`\`\`

2. Update function signatures to Result<T>

3. Handle HTTP errors:

BEFORE:
\`\`\`rust
let response = reqwest::get(url).await.unwrap();
let data = response.json().await.unwrap();
\`\`\`

AFTER:
\`\`\`rust
let response = reqwest::get(url)
    .await
    .map_err(|e| AppError::Http(e.to_string()))?;
let data = response.json()
    .await
    .map_err(|e| AppError::Serialization(serde_json::Error::custom(e.to_string())))?;
\`\`\`

4. Handle AI provider errors:

BEFORE:
\`\`\`rust
let result = provider.call(prompt).expect("Provider failed");
\`\`\`

AFTER:
\`\`\`rust
let result = provider.call(prompt)
    .map_err(|e| AppError::AiProvider(format!("Provider call failed: {}", e)))?;
\`\`\`

5. Handle config missing:

BEFORE:
\`\`\`rust
let api_key = env::var("API_KEY").unwrap();
\`\`\`

AFTER:
\`\`\`rust
let api_key = env::var("API_KEY")
    .map_err(|_| AppError::Config("API_KEY not set".to_string()))?;
\`\`\`

**VALIDATION:**

\`\`\`bash
cargo clippy -- -D clippy::unwrap_used src/ai/router.rs
cargo test --lib ai::router
\`\`\`

**DELIVERABLE:**
✅ 0 unwrap/expect in router.rs
✅ HTTP errors handled
✅ JSON errors handled
✅ Config errors handled
✅ Tests pass
\`\`\`

---

#### PROMPT #4 : Add Error Handling to Tauri Commands

\`\`\`markdown
@workspace Update ALL Tauri commands in src-tauri/src/commands/ to return Result<T, String>

**CONTEXT:**
Tauri commands need consistent error handling for IPC.
All errors must be serializable to frontend.

**REQUIREMENTS:**

1. Update command signatures:

BEFORE:
\`\`\`rust
#[tauri::command]
pub fn send_message(message: String) -> String {
    // ...
}
\`\`\`

AFTER:
\`\`\`rust
#[tauri::command]
pub fn send_message(message: String) -> Result<String, String> {
    // Internal logic uses AppError
    // Convert to String for Tauri
    internal_send_message(message)
        .map_err(|e| e.to_string())
}
\`\`\`

2. Separate internal logic from Tauri command:

\`\`\`rust
// Internal function with AppError
fn internal_send_message(message: String) -> Result<String> {
    // ... use AppError here
    Ok(response)
}

// Tauri command wraps internal
#[tauri::command]
pub fn send_message(message: String) -> Result<String, String> {
    internal_send_message(message).map_err(|e| e.to_string())
}
\`\`\`

3. Apply to ALL commands in:
- commands/chat.rs
- commands/memory.rs
- commands/audio.rs
- commands/config.rs
- commands/system.rs

**VALIDATION:**

\`\`\`bash
cargo build --release
# Should compile

# Test from frontend (after build)
# All commands should return proper errors
\`\`\`

**DELIVERABLE:**
✅ All commands return Result<T, String>
✅ Internal functions use AppError
✅ Errors properly serialized
✅ Frontend receives error messages
✅ Compiles and runs
\`\`\`

---

### Clippy Warnings (#5-8)

---

#### PROMPT #5 : Configure Strict Clippy Lints

\`\`\`markdown
@workspace Add strict Clippy configuration to src-tauri/Cargo.toml

**CONTEXT:**
Need zero-tolerance policy on dangerous patterns.
Clippy will enforce safety and quality standards.

**REQUIREMENTS:**

Add to `src-tauri/Cargo.toml`:

\`\`\`toml
[lints.clippy]
# === CRITICAL: Prevent crashes ===
unwrap_used = "deny"
expect_used = "deny"
panic = "deny"
indexing_slicing = "deny"
todo = "deny"
unimplemented = "deny"

# === IMPORTANT: Async safety ===
await_holding_lock = "deny"
await_holding_refcell_ref = "deny"

# === PERFORMANCE ===
inefficient_to_string = "warn"
manual_ok_or = "warn"
needless_pass_by_value = "warn"
redundant_clone = "warn"

# === CODE QUALITY ===
cognitive_complexity = "warn"
missing_errors_doc = "warn"
missing_panics_doc = "warn"
missing_safety_doc = "warn"

# === CORRECTNESS ===
cast_lossless = "warn"
cast_possible_truncation = "warn"
cast_possible_wrap = "warn"
cast_precision_loss = "warn"

# === STYLE ===
module_name_repetitions = "allow"  # Too noisy
\`\`\`

Also add to `.cargo/config.toml` (create if doesn't exist):

\`\`\`toml
[target.'cfg(all())']
rustflags = ["-D", "warnings"]  # Treat warnings as errors in CI
\`\`\`

**VALIDATION:**

\`\`\`bash
cd src-tauri
cargo clippy --all-targets --all-features
# Should show all violations

cargo clippy --fix --allow-dirty --allow-staged
# Auto-fix what's possible
\`\`\`

**DELIVERABLE:**
✅ Strict lints in Cargo.toml
✅ Config for CI
✅ Documentation of lint categories
✅ Auto-fix applied
\`\`\`

---

#### PROMPT #6 : Fix Cognitive Complexity Warnings

\`\`\`markdown
@workspace Reduce cognitive complexity in functions flagged by Clippy

**CONTEXT:**
Clippy warns when functions have complexity >15.
Need to refactor into smaller, testable functions.

**INSTRUCTIONS:**

1. Find complex functions:
\`\`\`bash
cargo clippy 2>&1 | grep "cognitive_complexity"
\`\`\`

2. For each complex function, apply this pattern:

BEFORE (complexity 25):
\`\`\`rust
pub fn process_message(msg: String) -> Result<String> {
    // 100 lines of nested ifs, loops, matches
    if condition_a {
        if condition_b {
            for item in items {
                match item {
                    Pattern1 => { /* ... */ },
                    Pattern2 => { /* ... */ },
                    // ...
                }
            }
        }
    }
    // ...
}
\`\`\`

AFTER (multiple functions <10 complexity):
\`\`\`rust
pub fn process_message(msg: String) -> Result<String> {
    let validated = validate_message(&msg)?;
    let processed = transform_message(validated)?;
    let result = finalize_message(processed)?;
    Ok(result)
}

fn validate_message(msg: &str) -> Result<&str> {
    // Single responsibility: validation
    // Complexity ~3
}

fn transform_message(msg: &str) -> Result<String> {
    // Single responsibility: transformation
    // Complexity ~5
}

fn finalize_message(msg: String) -> Result<String> {
    // Single responsibility: finalization
    // Complexity ~4
}
\`\`\`

3. Benefits of refactoring:
- Each function <15 complexity
- Easier to test
- Easier to understand
- Easier to modify

**VALIDATION:**

\`\`\`bash
cargo clippy -- -W clippy::cognitive_complexity
# Should show 0 warnings
\`\`\`

**DELIVERABLE:**
✅ All functions <15 complexity
✅ Better code organization
✅ More testable
✅ Clippy clean
\`\`\`

---

#### PROMPT #7 : Fix Performance Warnings (inefficient_to_string)

\`\`\`markdown
@workspace Fix all inefficient_to_string warnings in src-tauri/

**CONTEXT:**
.to_string() on &str creates unnecessary allocation.
Should use .to_owned() or better alternatives.

**FIND & REPLACE PATTERNS:**

1. String literals:

INEFFICIENT:
\`\`\`rust
let s = "hello".to_string();
\`\`\`

EFFICIENT:
\`\`\`rust
let s = String::from("hello");
// OR (if &str is acceptable)
let s = "hello";
\`\`\`

2. &str to String:

INEFFICIENT:
\`\`\`rust
fn process(input: &str) -> String {
    input.to_string()
}
\`\`\`

EFFICIENT:
\`\`\`rust
fn process(input: &str) -> String {
    input.to_owned()
}
\`\`\`

3. format! when unnecessary:

INEFFICIENT:
\`\`\`rust
let msg = format!("{}", error);
\`\`\`

EFFICIENT:
\`\`\`rust
let msg = error.to_string();
\`\`\`

4. Concatenation:

INEFFICIENT:
\`\`\`rust
let combined = first.to_string() + &second.to_string();
\`\`\`

EFFICIENT:
\`\`\`rust
let combined = format!("{}{}", first, second);
// OR
let mut combined = first.to_owned();
combined.push_str(&second);
\`\`\`

**AUTOMATION:**

Use Clippy auto-fix:
\`\`\`bash
cargo clippy --fix --allow-dirty \
  -- -W clippy::inefficient_to_string
\`\`\`

**DELIVERABLE:**
✅ 0 inefficient_to_string warnings
✅ Reduced allocations
✅ Performance improved
\`\`\`

---

#### PROMPT #8 : Add Missing Documentation (Errors, Panics, Safety)

\`\`\`markdown
@workspace Add missing documentation for errors, panics, and safety to public functions

**CONTEXT:**
Clippy requires documentation of:
- Functions that return Result: /// # Errors
- Functions that might panic: /// # Panics
- Unsafe functions: /// # Safety

**TEMPLATE:**

\`\`\`rust
/// Short description of what function does.
///
/// Longer explanation if needed.
///
/// # Arguments
/// * \`param1\` - Description of param1
/// * \`param2\` - Description of param2
///
/// # Returns
/// Description of return value
///
/// # Errors
/// Returns \`AppError::NotFound\` if item doesn't exist.
/// Returns \`AppError::InvalidInput\` if input is malformed.
///
/// # Panics
/// This function panics if the internal state is corrupted (should never happen).
///
/// # Examples
/// \`\`\`
/// let result = my_function("input")?;
/// assert_eq!(result, "expected");
/// \`\`\`
pub fn my_function(param1: &str, param2: i32) -> Result<String> {
    // implementation
}
\`\`\`

**AUTOMATION:**

For each public function returning Result:
1. Add /// # Errors section listing all error cases
2. Search code for panic! or unwrap/expect → add /// # Panics
3. For unsafe fn → add /// # Safety explaining invariants

**VALIDATION:**

\`\`\`bash
cargo clippy -- \
  -W clippy::missing_errors_doc \
  -W clippy::missing_panics_doc \
  -W clippy::missing_safety_doc

# Should show 0 warnings
\`\`\`

**DELIVERABLE:**
✅ All public Result functions have # Errors
✅ Functions that panic have # Panics
✅ Unsafe functions have # Safety
✅ Documentation generated with cargo doc
\`\`\`

---

### TypeScript Fixes (#9-12)

---

#### PROMPT #9 : Enable TypeScript Strict Mode & Fix Errors

\`\`\`markdown
@workspace Enable TypeScript strict mode and fix all resulting errors

**CONTEXT:**
Need strictest possible TypeScript configuration for safety.
Will catch many bugs at compile time.

**STEP 1: Update tsconfig.json**

\`\`\`json
{
  "compilerOptions": {
    // === STRICT MODE (all must be true) ===
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // === ADDITIONAL STRICTNESS ===
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    
    // === EXISTING CONFIG (keep) ===
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
\`\`\`

**STEP 2: Fix Common Error Patterns**

1. Implicit any:

BEFORE:
\`\`\`typescript
function process(data) {
  return data.value;
}
\`\`\`

AFTER:
\`\`\`typescript
function process(data: { value: string }): string {
  return data.value;
}
\`\`\`

2. Null checks:

BEFORE:
\`\`\`typescript
const user = users.find(u => u.id === id);
return user.name;  // Error: Object is possibly 'undefined'
\`\`\`

AFTER:
\`\`\`typescript
const user = users.find(u => u.id === id);
if (!user) {
  throw new Error('User not found');
}
return user.name;
\`\`\`

3. Array access:

BEFORE:
\`\`\`typescript
const first = items[0];
return first.value;  // Error: Object is possibly 'undefined'
\`\`\`

AFTER:
\`\`\`typescript
const first = items[0];
if (!first) {
  throw new Error('Empty array');
}
return first.value;
\`\`\`

4. Function returns:

BEFORE:
\`\`\`typescript
function getValue(condition: boolean): string {
  if (condition) {
    return "yes";
  }
  // Error: Not all code paths return a value
}
\`\`\`

AFTER:
\`\`\`typescript
function getValue(condition: boolean): string {
  if (condition) {
    return "yes";
  }
  return "no";
}
\`\`\`

**STEP 3: Run Type Checker**

\`\`\`bash
npx tsc --noEmit
# Fix errors one by one
# Repeat until 0 errors
\`\`\`

**DELIVERABLE:**
✅ tsconfig.json strict mode enabled
✅ 0 TypeScript errors
✅ All implicit any resolved
✅ All null checks added
✅ All return paths covered
\`\`\`

---

#### PROMPT #10 : Replace 'any' with Proper Types

\`\`\`markdown
@workspace Find and replace ALL 'any' types with proper TypeScript types

**CONTEXT:**
'any' defeats TypeScript's purpose. Need proper types everywhere.

**STEP 1: Find all 'any' usages**

\`\`\`bash
grep -r "any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
\`\`\`

**STEP 2: Replace patterns**

1. Props with any:

BEFORE:
\`\`\`typescript
interface Props {
  data: any;
  onUpdate: (value: any) => void;
}
\`\`\`

AFTER:
\`\`\`typescript
interface Message {
  id: string;
  content: string;
  timestamp: number;
}

interface Props {
  data: Message;
  onUpdate: (value: Message) => void;
}
\`\`\`

2. Function parameters:

BEFORE:
\`\`\`typescript
function process(data: any): any {
  return data.result;
}
\`\`\`

AFTER:
\`\`\`typescript
interface ProcessInput {
  value: string;
  metadata?: Record<string, unknown>;
}

interface ProcessOutput {
  result: string;
  status: 'success' | 'error';
}

function process(data: ProcessInput): ProcessOutput {
  return {
    result: data.value.toUpperCase(),
    status: 'success'
  };
}
\`\`\`

3. API responses:

BEFORE:
\`\`\`typescript
const response: any = await fetch('/api/data');
const data: any = await response.json();
\`\`\`

AFTER:
\`\`\`typescript
interface ApiResponse {
  data: Message[];
  error?: string;
}

const response = await fetch('/api/data');
const data = await response.json() as ApiResponse;
\`\`\`

4. Event handlers:

BEFORE:
\`\`\`typescript
const handleClick = (e: any) => {
  console.log(e.target.value);
};
\`\`\`

AFTER:
\`\`\`typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.value);
};
\`\`\`

**STEP 3: Use unknown for truly unknown types**

When you genuinely don't know the type:

\`\`\`typescript
function processUnknown(data: unknown): string {
  // Type guard to safely narrow
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  return 'Invalid data';
}
\`\`\`

**VALIDATION:**

\`\`\`bash
# Should fail on any 'any':
npx eslint src --ext .ts,.tsx --rule '@typescript-eslint/no-explicit-any: error'
\`\`\`

**DELIVERABLE:**
✅ 0 usages of 'any'
✅ Proper types defined
✅ Type safety restored
✅ ESLint passes
\`\`\`

---

#### PROMPT #11 : Configure & Fix ESLint Strict

\`\`\`markdown
@workspace Configure strict ESLint rules and fix all violations

**CONTEXT:**
Need consistent code quality and catch bugs early.

**STEP 1: Install dependencies**

\`\`\`bash
pnpm add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-react eslint-plugin-react-hooks
\`\`\`

**STEP 2: Create .eslintrc.cjs**

\`\`\`javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    // === CRITICAL ===
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    'react-hooks/exhaustive-deps': 'error',
    
    // === IMPORTANT ===
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // === STYLE ===
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'react/prop-types': 'off',  // TypeScript handles this
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
\`\`\`

**STEP 3: Auto-fix**

\`\`\`bash
npx eslint src --ext .ts,.tsx --fix
\`\`\`

**STEP 4: Fix remaining violations manually**

Common fixes:
- Add return types to functions
- Remove console.log (or use console.error/warn)
- Add missing dependencies to useEffect
- Replace var with const/let

**VALIDATION:**

\`\`\`bash
npx eslint src --ext .ts,.tsx
# Target: <10 warnings, 0 errors
\`\`\`

**DELIVERABLE:**
✅ .eslintrc.cjs configured
✅ <10 warnings
✅ 0 errors
✅ Code quality enforced
\`\`\`

---

#### PROMPT #12 : Setup Pre-commit Hooks (Husky + lint-staged)

\`\`\`markdown
@workspace Configure pre-commit hooks to prevent bad code from being committed

**CONTEXT:**
Catch errors before they reach repository.
Auto-fix on commit when possible.

**STEP 1: Install tools**

\`\`\`bash
pnpm add -D husky lint-staged
npx husky init
\`\`\`

**STEP 2: Configure lint-staged**

Create \`.lintstagedrc.json\`:

\`\`\`json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ],
  "src-tauri/**/*.rs": [
    "cargo fmt --",
    "cargo clippy --fix --allow-dirty --allow-staged --"
  ]
}
\`\`\`

**STEP 3: Configure husky pre-commit**

Edit \`.husky/pre-commit\`:

\`\`\`bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Frontend lint
npx lint-staged

# Backend check (if Rust files changed)
if git diff --cached --name-only | grep -q "src-tauri/"; then
  cd src-tauri
  cargo fmt -- --check
  cargo clippy -- -D warnings
  cd ..
fi
\`\`\`

**STEP 4: Test hooks**

\`\`\`bash
# Make a test change
echo "// test" >> src/App.tsx
git add src/App.tsx
git commit -m "test: pre-commit hooks"

# Should run lint-staged and format code
\`\`\`

**DELIVERABLE:**
✅ Husky configured
✅ lint-staged configured
✅ Pre-commit hook working
✅ Code auto-formatted on commit
✅ Lints run on commit
✅ Bad code blocked from commit
\`\`\`

---

## 🟡 PHASE 2 : ARCHITECTURE (Prompts #13-22)

### Master Orchestrator (#13-15)

---

#### PROMPT #13 : Create Master Orchestrator Structure

\`\`\`markdown
@workspace Create unified Master Orchestrator by merging Moteur #0, Nexus, and Core Orchestrator

**CONTEXT:**
Currently 3 separate orchestration systems creating redundancy.
Need single source of truth for request routing and coordination.

**REQUIREMENTS:**

1. Create \`src-tauri/src/orchestrator/mod.rs\`:

\`\`\`rust
use crate::error::{AppError, Result};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Master Orchestrator - Single entry point for all requests
pub struct MasterOrchestrator {
    /// Conversation engine for chat processing
    conversation_engine: Arc<ConversationEngine>,
    /// Unified memory system
    memory: Arc<UnifiedMemory>,
    /// AI gateway for provider routing
    ai_gateway: Arc<AiGateway>,
    /// Observability for monitoring
    observability: Arc<ObservabilityEngine>,
    /// Configuration
    config: OrchestratorConfig,
}

#[derive(Clone)]
pub struct OrchestratorConfig {
    pub max_concurrent_requests: usize,
    pub request_timeout_ms: u64,
    pub enable_telemetry: bool,
}

impl Default for OrchestratorConfig {
    fn default() -> Self {
        Self {
            max_concurrent_requests: 10,
            request_timeout_ms: 30000,
            enable_telemetry: true,
        }
    }
}

impl MasterOrchestrator {
    pub fn new(
        conversation_engine: Arc<ConversationEngine>,
        memory: Arc<UnifiedMemory>,
        ai_gateway: Arc<AiGateway>,
        observability: Arc<ObservabilityEngine>,
    ) -> Self {
        Self {
            conversation_engine,
            memory,
            ai_gateway,
            observability,
            config: OrchestratorConfig::default(),
        }
    }
    
    /// Process incoming user message
    pub async fn process_message(&self, request: MessageRequest) -> Result<MessageResponse> {
        // 1. Validate request
        self.validate_request(&request)?;
        
        // 2. Load memory context
        let context = self.memory.load_context(&request.conversation_id).await?;
        
        // 3. Route to conversation engine
        let response = self.conversation_engine
            .process(request.content, context)
            .await?;
        
        // 4. Store in memory
        self.memory.store_interaction(&request, &response).await?;
        
        // 5. Emit telemetry
        self.observability.record_request(&request, &response).await?;
        
        Ok(response)
    }
    
    fn validate_request(&self, request: &MessageRequest) -> Result<()> {
        if request.content.is_empty() {
            return Err(AppError::InvalidInput("Empty message".to_string()));
        }
        if request.content.len() > 10000 {
            return Err(AppError::InvalidInput("Message too long".to_string()));
        }
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct MessageRequest {
    pub conversation_id: String,
    pub content: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone)]
pub struct MessageResponse {
    pub content: String,
    pub tokens_used: usize,
    pub latency_ms: u64,
}
\`\`\`

2. Update \`src-tauri/src/lib.rs\`:

\`\`\`rust
mod orchestrator;
pub use orchestrator::MasterOrchestrator;
\`\`\`

**DELIVERABLE:**
✅ orchestrator/mod.rs created
✅ MasterOrchestrator struct defined
✅ process_message implemented
✅ Compiles without errors
✅ Unit tests pass
\`\`\`

---

**[Prompts #14-30 suivent le même format...]**

---

## 📝 NOTES D'UTILISATION

### Workflow Typique

\`\`\`
1. Copier prompt → Copilot Chat
2. Attendre génération (10-60s)
3. Review code généré
4. Tests: cargo test / pnpm test
5. Si ✅ → Commit
6. Si ❌ → Ajuster prompt / Fix manual
7. Répéter pour prompt suivant
\`\`\`

### Temps Estimés

| Phase | Prompts | Génération | Review/Test | Total |
|-------|---------|------------|-------------|-------|
| Phase 1 | 12 | 2h | 6h | 8h |
| Phase 2 | 10 | 1.5h | 4h | 5.5h |
| Phase 3 | 8 | 1h | 3h | 4h |
| **TOTAL** | **30** | **4.5h** | **13h** | **17.5h** |

**Gain vs Manuel** : 80h manuel → 17.5h avec Copilot = **78% réduction**

### Tips Avancés

**1. Context Window Optimization** :
- Mentionner @workspace pour contexte complet
- Référencer fichiers spécifiques avec chemins absolus
- Utiliser @terminal pour intégrer output terminal

**2. Prompt Refinement** :
- Si génération incomplète → "Continue from where you left off"
- Si erreur compilation → Coller erreur + "Fix this compilation error"
- Si tests échouent → Coller failure + "Fix failing tests"

**3. Batch Operations** :
- Regrouper prompts similaires (ex: tous les unwraps d'un module)
- Séparer frontend/backend (éviter confusion)
- Commiter après chaque batch réussi

**4. Quality Checks** :
\`\`\`bash
# Quick validation après génération
cargo fmt && cargo clippy && cargo test  # Rust
pnpm run lint && pnpm run type-check && pnpm test  # TypeScript
\`\`\`

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Sprint 1 : Stabilisation Backend (Prompts #1-4)
**Durée** : 2-3 jours  
**Objectif** : Système d'erreurs unifié + 0 unwrap/expect dans modules critiques

### Sprint 2 : Clippy Compliance (Prompts #5-8)
**Durée** : 1-2 jours  
**Objectif** : Configuration stricte + fixes automatiques + documentation

### Sprint 3 : TypeScript Strict (Prompts #9-12)
**Durée** : 2-3 jours  
**Objectif** : Strict mode + 0 any + ESLint + pre-commit hooks

### Sprint 4 : Master Orchestrator (Prompts #13-15)
**Durée** : 3-4 jours  
**Objectif** : Fusion des orchestrateurs + tests d'intégration

### Sprint 5 : Unified Memory (Prompts #16-18)
**Durée** : 2-3 jours  
**Objectif** : Fusion STM/MTM/LTM + migration données

### Sprint 6 : Component Fusion (Prompts #19-22)
**Durée** : 3-4 jours  
**Objectif** : Déduplication composants + tests visuels

### Sprint 7 : Performance IPC (Prompts #23-25)
**Durée** : 2 jours  
**Objectif** : Batching + streaming + benchmarks

### Sprint 8 : Memory Optimization (Prompts #26-28)
**Durée** : 2 jours  
**Objectif** : Pooling + compression + monitoring

### Sprint 9 : Caching System (Prompts #29-30)
**Durée** : 1-2 jours  
**Objectif** : Multi-level cache + invalidation intelligente

---

## 📊 MÉTRIQUES DE SUCCÈS

### Code Quality
- ✅ 0 unwrap/expect dans code critique
- ✅ 0 clippy warnings avec config stricte
- ✅ 0 TypeScript errors strict mode
- ✅ 100% documentation publique APIs
- ✅ >80% test coverage modules critiques

### Performance
- ✅ <100ms latence P95 IPC
- ✅ <50MB memory overhead
- ✅ >90% cache hit rate
- ✅ 0 memory leaks détectés
- ✅ <5% CPU idle usage

### Architecture
- ✅ Single orchestrator (vs 3)
- ✅ Unified memory (vs 3 systèmes)
- ✅ -30% code duplication
- ✅ -50% modules obsolètes
- ✅ 100% module ownership défini

---

## ⚠️ LIMITATIONS & DISCLAIMERS

### Ce que Copilot PEUT faire :
- ✅ Générer code boilerplate
- ✅ Appliquer patterns répétitifs
- ✅ Refactorer fonctions simples
- ✅ Ajouter types TypeScript
- ✅ Fixer warnings Clippy automatiques
- ✅ Générer tests unitaires basiques

### Ce que Copilot NE PEUT PAS faire :
- ❌ Comprendre business logic complexe
- ❌ Prendre décisions architecturales stratégiques
- ❌ Détecter bugs logiques subtils
- ❌ Optimiser algorithmes complexes
- ❌ Garantir correctness mathématique
- ❌ Résoudre race conditions

### Review Obligatoire
**TOUJOURS** reviewer code généré pour :
1. **Correctness** : Logique correcte ?
2. **Safety** : Pas de unsafe non justifié ?
3. **Performance** : Pas d'allocation inutile ?
4. **Security** : Pas de faille évidente ?
5. **Tests** : Coverage suffisant ?

---

## 🔗 RESSOURCES COMPLÉMENTAIRES

### Documentation Officielle
- [GitHub Copilot Docs](https://docs.github.com/copilot)
- [Copilot Best Practices](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)
- [Rust Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

### Tools
- [Clippy Lints Reference](https://rust-lang.github.io/rust-clippy/master/)
- [thiserror crate](https://docs.rs/thiserror/)
- [ESLint TypeScript](https://typescript-eslint.io/)
- [Husky](https://typicode.github.io/husky/)

---

**Collection générée le 9 décembre 2025**  
**Version** : 1.0  
**Prompts** : 30 (Phases 1-3 complètes)  
**Statut** : ✅ Production Ready  
**Maintenance** : Mettre à jour si breaking changes Copilot/APIs

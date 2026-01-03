# 🤖 COPILOT SUPER-PROMPTS - TITANE∞ Transformation

**Version**: 1.0.0 | **OMEGA v2 Enhanced**

---

## 📋 Table of Contents

1. [DevTools Fusion (P0)](#1-devtools-fusion-p0)
2. [Chat Consolidation (P0)](#2-chat-consolidation-p0)
3. [Audio Services Merge (P1)](#3-audio-services-merge-p1)
4. [AI Services Unification (P1)](#4-ai-services-unification-p1)
5. [Unwrap Elimination (P0)](#5-unwrap-elimination-p0)
6. [Tests P0 (Critical)](#6-tests-p0-critical)
7. [Import Optimization (P1)](#7-import-optimization-p1)
8. [Documentation Cleanup (P2)](#8-documentation-cleanup-p2)
9. [CI/CD Pipeline (P1)](#9-cicd-pipeline-p1)
10. [Master Template](#10-master-template)

---

## 1. DevTools Fusion (P0)

### Context

Multiple DevTools implementations exist (`devtools/` and `DevTools/`), causing build confusion and duplication.

### Prompt

```
Consolidate TITANE∞ DevTools into a single module:

**Audit Phase**:
1. Compare `src/devtools/` and `src/DevTools/` (case-sensitive!)
2. List all exported components, hooks, and utilities from each
3. Identify duplications and unique features
4. Check imports across the project

**Consolidation Plan**:
1. Create unified structure in `src/modules/devtools/`:
```

devtools/
├── index.ts # Main exports
├── DevToolsPanel.tsx # Main component
├── components/ # Sub-components
├── hooks/ # useDevTools, etc.
├── services/ # Debug services
└── types.ts # TypeScript types

```

2. Merge best implementation from both directories
3. Update ALL imports project-wide (search: `from.*devtools|from.*DevTools`)
4. Delete duplicate directories
5. Verify build passes

**Test Plan**:
- [ ] DevTools panel opens correctly
- [ ] All debug features functional
- [ ] No console errors
- [ ] Build successful

**Estimated Time**: 2 hours
**Priority**: P0 (Critical - causes build issues)
```

---

## 2. Chat Consolidation (P0)

### Context

Chat code scattered across `components/chat/`, `features/chat/`, and 8+ hook variations.

### Prompt

```
Unify TITANE∞ Chat into a single coherent module:

**Current State Analysis**:
1. Find ALL chat-related files:
   - Search: `find src -iname "*chat*"`
   - List hooks: useChat, useChatMemory, useGlobalAIChat, useAIChatStreaming, etc.
2. Identify responsibilities of each implementation
3. Detect duplications and conflicts

**Target Architecture**:
```

src/modules/chat/
├── index.ts # Public API
├── ChatInterface.tsx # Main component
├── ui/ # React components
│ ├── ChatMessage.tsx
│ ├── ChatInput.tsx
│ └── ChatHistory.tsx
├── hooks/ # Custom hooks
│ ├── useChat.ts # Unified hook
│ └── useChatStreaming.ts # Streaming logic
├── services/ # Business logic
│ ├── ChatService.ts
│ └── MessageFormatter.ts
├── store/ # State management
│ └── chatStore.ts
└── types.ts # TypeScript types

```

**Migration Steps**:
1. Create new `src/modules/chat/` structure
2. Merge best code from all existing implementations
3. Create unified `useChat()` hook with all features
4. Update all imports (search: `from.*chat|useChatMemory|useGlobalAIChat`)
5. Move tests to `src/modules/chat/__tests__/`
6. Delete old implementations
7. Verify ALL chat functionality works

**Test Checklist**:
- [ ] Send message
- [ ] Receive AI response
- [ ] Streaming works
- [ ] Memory persistence
- [ ] History navigation
- [ ] Multiple conversations
- [ ] No regressions

**Estimated Time**: 3 hours
**Priority**: P0 (Core feature)
```

---

## 3. Audio Services Merge (P1)

### Context

Audio/Voice/TTS services scattered across multiple directories.

### Prompt

```
Consolidate TITANE∞ Audio/Voice services into unified module:

**Audit**:
1. Find: `find src -iname "*audio*" -o -iname "*voice*" -o -iname "*tts*"`
2. List all audio-related services
3. Identify TTS providers (Parler-TTS, browser TTS, etc.)

**Target Structure**:
```

src/services/voice/
├── index.ts # Unified API
├── VoiceService.ts # Main service
├── providers/ # TTS providers
│ ├── ParlerTTS.ts
│ ├── BrowserTTS.ts
│ └── types.ts
├── prosody/ # Prosody engine
│ └── ProsodyEngine.ts
├── hooks/ # React hooks
│ └── useVoice.ts
└── types.ts

````

**Unified API**:
```typescript
interface VoiceService {
  speak(text: string, options?: SpeakOptions): Promise<void>;
  stop(): void;
  setProsody(config: ProsodyConfig): void;
  setProvider(provider: 'parler' | 'browser'): void;
}
````

**Tasks**:

1. Create unified VoiceService
2. Implement provider pattern for TTS engines
3. Migrate all audio code
4. Update imports
5. Test all voice features
6. Delete old directories

**Test Plan**:

- [ ] Parler-TTS works
- [ ] Browser TTS fallback
- [ ] Prosody adjustments
- [ ] Stop/pause functionality
- [ ] Provider switching

**Estimated Time**: 2 hours
**Priority**: P1 (High - reduces complexity)

```

---

## 4. AI Services Unification (P1)

### Context
OpenAI, Gemini, Ollama in separate directories with inconsistent APIs.

### Prompt
```

Unify TITANE∞ AI Services under single interface:

**Inventory**:

1. List all AI service directories
2. Document current APIs for each provider
3. Identify common patterns

**Target Architecture**:

```
src/services/ai/
├── index.ts                    # Public API
├── AIService.ts                # Main service
├── providers/                  # Provider implementations
│   ├── OpenAIProvider.ts
│   ├── GeminiProvider.ts
│   └── OllamaProvider.ts
├── types.ts                    # Common types
└── config.ts                   # Provider configs
```

**Unified Interface**:

```typescript
interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  stream(messages: Message[], onChunk: (chunk: string) => void): Promise<void>;
  embeddings(text: string): Promise<number[]>;
}

class AIService {
  setProvider(provider: 'openai' | 'gemini' | 'ollama'): void;
  chat(messages: Message[]): Promise<string>;
  stream(messages: Message[], onChunk: (chunk: string) => void): Promise<void>;
}
```

**Implementation**:

1. Create provider abstraction
2. Migrate each AI service to provider pattern
3. Implement fallback mechanism (OpenAI → Gemini → Ollama)
4. Update all AI calls in the app
5. Add provider switching in settings
6. Test all providers

**Test Matrix**:

- [ ] OpenAI chat
- [ ] OpenAI streaming
- [ ] Gemini chat
- [ ] Gemini streaming
- [ ] Ollama local
- [ ] Provider fallback
- [ ] Error handling

**Estimated Time**: 2 hours
**Priority**: P1 (High - critical service)

```

---

## 5. Unwrap Elimination (P0)

### Context
20+ `unwrap()` calls in Rust code causing panic risk.

### Prompt
```

Eliminate ALL unwrap() and expect() calls in TITANE∞ Rust code:

**Scan**:

```bash
grep -r "\.unwrap()" src-tauri/src/ --include="*.rs"
grep -r "\.expect(" src-tauri/src/ --include="*.rs"
```

**Current Hotspots** (from audit):

- `ollama.rs`: 3 unwrap() calls
- `harmonic_os/mod.rs`: 2 unwrap() calls
- `kernel/watchdog.rs`: 1 unwrap() call
- `harmonic_gravity_integration.rs`: 5 unwrap() calls

**Replacement Strategy**:

1. **Replace with proper error handling**:

```rust
// ❌ BEFORE
let value = some_option.unwrap();

// ✅ AFTER
let value = some_option.ok_or_else(|| {
    Error::new(ErrorKind::NotFound, "Value not found")
})?;
```

2. **Use match for complex logic**:

```rust
// ❌ BEFORE
let result = risky_operation().unwrap();

// ✅ AFTER
let result = match risky_operation() {
    Ok(val) => val,
    Err(e) => {
        error!("Operation failed: {}", e);
        return Err(e);
    }
};
```

3. **Return Result<T, E>**:

```rust
// ❌ BEFORE
fn process() {
    let data = get_data().unwrap();
}

// ✅ AFTER
fn process() -> Result<(), Box<dyn Error>> {
    let data = get_data()?;
    Ok(())
}
```

**Process**:

1. Start with `ollama.rs` (3 unwrap)
2. Move to `harmonic_gravity_integration.rs` (5 unwrap)
3. Fix `harmonic_os/mod.rs` (2 unwrap)
4. Complete `kernel/watchdog.rs` (1 unwrap)
5. Scan for any remaining unwrap/expect
6. Run `cargo test` after each file
7. Verify no panics in dev runtime

**Test Plan**:

- [ ] All tests pass
- [ ] Dev runtime starts successfully
- [ ] No panics in logs
- [ ] Error handling functional
- [ ] grep returns 0 unwrap/expect

**Estimated Time**: 3 hours (30min per hotspot)
**Priority**: P0 (Critical - production stability)

```

---

## 6. Tests P0 (Critical)

### Context
0% test coverage on critical paths (ConversationManager, IPC, Security).

### Prompt
```

Add P0 (Critical) test coverage to TITANE∞:

**P0 Test Requirements** (100% coverage mandatory):

### 1. ConversationManager Tests

```typescript
// src/core/memory/ConversationManager.test.ts
describe('ConversationManager', () => {
  describe('save()', () => {
    it('should save conversation to storage');
    it('should handle save errors gracefully');
    it('should validate conversation format');
  });

  describe('load()', () => {
    it('should load existing conversation');
    it('should return null for non-existent conversation');
    it('should handle corrupted data');
  });

  describe('get()', () => {
    it('should retrieve conversation by ID');
    it('should return undefined for invalid ID');
  });

  describe('integration', () => {
    it('should save and load conversation correctly');
    it('should persist across sessions');
  });
});
```

### 2. Tauri Commands Tests

```rust
// src-tauri/src/commands/tests.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_tauri_commands() {
        // Test each #[tauri::command] function
    }

    #[test]
    fn test_ipc_error_handling() {
        // Verify errors are properly returned
    }

    #[test]
    fn test_input_validation() {
        // Ensure malicious inputs are rejected
    }
}
```

### 3. Security Tests

```typescript
// src/security/security.test.ts
describe('Security', () => {
  it('should sanitize user input');
  it('should prevent XSS attacks');
  it('should validate CSRF tokens');
  it('should enforce CSP headers');
  it('should reject invalid commands');
});
```

### 4. State Persistence Tests

```typescript
// src/core/state/persistence.test.ts
describe('State Persistence', () => {
  it('should save state to disk');
  it('should load state on startup');
  it('should handle corrupted state');
  it('should merge state correctly');
});
```

**Implementation Order**:

1. ConversationManager (2h) - Most critical
2. Tauri commands (3h) - IPC layer
3. Security (2h) - Attack prevention
4. State persistence (1h) - Data integrity

**Success Criteria**:

- [ ] All P0 tests passing
- [ ] Coverage > 95% for P0 code
- [ ] No skipped tests
- [ ] CI gate enforced

**Estimated Time**: 8 hours
**Priority**: P0 (Critical - prevents regressions)

```

---

## 7. Import Optimization (P1)

### Context
Many wildcard imports (`import * as`) and deep imports (`../../../`) causing bundle bloat.

### Prompt
```

Optimize TITANE∞ imports for better tree-shaking:

**Scan**:

```bash
# Find wildcard imports
grep -r "import \* as" src/ --include="*.ts" --include="*.tsx"

# Find deep imports
grep -r "from.*\.\./\.\./\.\." src/ --include="*.ts" --include="*.tsx"
```

**Optimization Patterns**:

1. **Replace Wildcard Imports**:

```typescript
// ❌ BEFORE
import * as React from 'react';
import * as Icons from 'lucide-react';

// ✅ AFTER
import { useState, useEffect } from 'react';
import { Heart, Star, Code } from 'lucide-react';
```

2. **Reduce Import Depth**:

```typescript
// ❌ BEFORE
import { helper } from '../../../utils/helpers/string';

// ✅ AFTER (use path aliases)
import { helper } from '@/utils/helpers/string';
```

3. **Avoid Barrel Imports**:

```typescript
// ❌ BEFORE (barrel file)
export * from './component1';
export * from './component2';
// (prevents tree-shaking)

// ✅ AFTER (direct imports)
import { Component1 } from '@/components/Component1';
```

**Implementation**:

1. Setup path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/services/*": ["src/services/*"],
      "@/hooks/*": ["src/hooks/*"]
    }
  }
}
```

2. Replace ALL wildcard imports
3. Replace deep imports with aliases
4. Remove unnecessary barrel files
5. Run bundle analyzer to verify size reduction

**Test**:

- [ ] Build passes
- [ ] No missing imports
- [ ] Bundle size reduced
- [ ] Tree-shaking effective

**Estimated Time**: 2 hours
**Priority**: P1 (Performance impact)

```

---

## 8. Documentation Cleanup (P2)

### Context
Scattered documentation, outdated files, inconsistent formatting.

### Prompt
```

Clean and organize TITANE∞ documentation:

**Audit**:

1. Find all markdown files: `find . -name "*.md"`
2. Identify outdated/duplicate docs
3. Check for broken links

**Target Structure**:

```
docs/
├── README.md                   # Project overview
├── ARCHITECTURE.md             # System architecture (4-Ring)
├── CONTRIBUTING.md             # Contribution guide
├── CODE_STYLE.md               # Coding standards
├── api/                        # API documentation
│   ├── tauri-commands.md
│   └── frontend-api.md
├── guides/                     # User guides
│   ├── getting-started.md
│   ├── development.md
│   └── deployment.md
└── transformation/             # Transformation docs
    ├── MASTER_GUIDE.md
    ├── AUDIT_REPORTS.md
    └── ROADMAP.md
```

**Cleanup Tasks**:

1. Remove outdated files (versions < v20)
2. Consolidate duplicate docs
3. Fix broken links
4. Standardize formatting (use Prettier)
5. Update outdated information
6. Add missing API documentation
7. Generate API docs from code (TypeDoc/Rustdoc)

**Quality Checks**:

- [ ] No broken links
- [ ] Consistent formatting
- [ ] Up-to-date information
- [ ] Complete API coverage
- [ ] Clear navigation

**Estimated Time**: 3 hours
**Priority**: P2 (Important for maintainability)

```

---

## 9. CI/CD Pipeline (P1)

### Context
No automated testing, no deployment pipeline, manual quality checks.

### Prompt
```

Setup comprehensive CI/CD pipeline for TITANE∞:

**Pipeline Architecture**:

### 1. GitHub Actions Workflows

**`.github/workflows/test.yml`**:

```yaml
name: Tests & Coverage

on:
  push:
    branches: [main, dev]
  pull_request:

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --coverage
      - run: pnpm run test:e2e
      - uses: codecov/codecov-action@v3

  rust-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
      - run: cd src-tauri && cargo test
      - run: cd src-tauri && cargo clippy

  coverage-gate:
    needs: [frontend-tests, rust-tests]
    runs-on: ubuntu-latest
    steps:
      - name: Check Coverage Threshold
        run: |
          if [ "$COVERAGE" -lt "80" ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

**`.github/workflows/build.yml`**:

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions-rs/toolchain@v1
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build:production
      - uses: actions/upload-artifact@v3
```

**`.github/workflows/audit.yml`**:

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: ./scripts/audit/01-security-audit.sh
      - run: ./scripts/audit/02-architecture-audit.sh
      - run: ./scripts/audit/03-performance-measure.sh
      - run: ./scripts/audit/04-test-coverage.sh
```

### 2. Quality Gates

**Branch Protection**:

- Require PR reviews (2 approvals)
- Require status checks (tests, coverage)
- Require up-to-date branches
- No force push to main

**Coverage Threshold**: 80%
**Performance Budget**: Build < 60s, Bundle < 10MB

### 3. Deployment

**Staging**: Auto-deploy `dev` branch to staging
**Production**: Manual approval for `main` releases

**Implementation Steps**:

1. Create `.github/workflows/` directory
2. Add all workflow files
3. Configure branch protection on GitHub
4. Setup secrets (CODECOV_TOKEN, etc.)
5. Enable workflows
6. Test with dummy PR

**Estimated Time**: 2 hours
**Priority**: P1 (Essential for quality)

```

---

## 10. Master Template

### General-Purpose Transformation Prompt

```

Transform [COMPONENT/MODULE] in TITANE∞ following OMEGA v2 standards:

**Analysis Phase**:

1. Current State:
   - Find all related files
   - Document current architecture
   - Identify issues/duplications
   - List dependencies

2. Requirements:
   - What needs to be achieved?
   - What are the constraints?
   - What are the success criteria?

**Design Phase**:

1. Target Architecture:
   - Define new structure
   - Design interfaces/APIs
   - Plan migration path
   - Identify risks

2. Implementation Plan:
   - Break into phases
   - Estimate time per phase
   - Define test strategy
   - Plan rollback if needed

**Implementation Phase**:

1. Create new structure
2. Migrate code incrementally
3. Update imports/references
4. Add tests (P0 first)
5. Verify functionality
6. Delete old code
7. Update documentation

**Validation Phase**:

1. Run all tests
2. Manual testing
3. Performance check
4. Security review
5. Code review

**Success Criteria**:

- [ ] All tests passing
- [ ] No regressions
- [ ] Performance maintained/improved
- [ ] Documentation updated
- [ ] Code review approved

**Rollback Plan**:

- Git commit before changes
- Keep old code until validation
- Document migration steps

**Estimated Time**: [X hours]
**Priority**: P[0/1/2]
**Risk Level**: [Low/Medium/High]

```

---

## 🎯 Usage Guidelines

### How to Use These Prompts

1. **Copy entire prompt** (including code blocks)
2. **Paste into GitHub Copilot Chat** or your AI assistant
3. **Review the plan** before execution
4. **Execute phase by phase** (don't rush)
5. **Test after each major change**
6. **Commit frequently** for rollback safety

### Priority Order

**Week 1-2** (P0 - Critical):
1. DevTools Fusion
2. Chat Consolidation
3. Unwrap Elimination
4. Tests P0

**Week 3-4** (P1 - High):
1. Audio Services Merge
2. AI Services Unification
3. Import Optimization
4. CI/CD Pipeline

**Week 5-6** (P2 - Medium):
1. Documentation Cleanup
2. Performance optimizations
3. Final polish

### Tips for Success

- ✅ **One prompt at a time** - Don't mix multiple transformations
- ✅ **Test frequently** - Run tests after each phase
- ✅ **Commit often** - Git is your safety net
- ✅ **Review changes** - Don't blindly accept AI suggestions
- ✅ **Use audits** - Run audit scripts before/after transformations

---

**Version**: 1.0.0 - OMEGA v2
**Last Updated**: 2024-12-XX
**Maintainer**: TITANE∞ Core Team
```

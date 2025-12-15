# 🧪 TITANE∞ — Guide de Tests

**Version:** v24.2.0  
**Date:** 15 décembre 2025  
**Coverage Objective:** 80%+

---

## 📋 Table des Matières

1. [Stratégie de Tests](#stratégie-de-tests)
2. [Tests Frontend](#tests-frontend)
3. [Tests Backend](#tests-backend)
4. [Tests E2E](#tests-e2e)
5. [Coverage & Qualité](#coverage--qualité)
6. [CI/CD](#cicd)

---

## 🎯 Stratégie de Tests

### Pyramide de Tests

```
        /\
       /  \      E2E (5%)
      /    \     - Tests utilisateur complets
     /------\    
    /        \   Integration (15%)
   /          \  - Tests modules interconnectés
  /------------\ 
 /              \ Unit (80%)
/________________\ - Tests unitaires isolés
```

### Objectifs Coverage

| Type | Target | Actuel |
|------|--------|--------|
| **Unit Tests** | 80%+ | ~75% |
| **Integration** | 60%+ | ~55% |
| **E2E** | 40%+ | ~30% |
| **Overall** | 70%+ | ~65% |

### Tools Stack

**Frontend:**
- **Runner:** Vitest
- **Assertions:** Vitest expect
- **Mocking:** vi (Vitest)
- **Component Testing:** @testing-library/react
- **Coverage:** v8 (native Vitest)

**Backend:**
- **Runner:** Cargo test
- **Assertions:** assert!, assert_eq!
- **Mocking:** mockall, wiremock
- **Coverage:** tarpaulin, llvm-cov

**E2E:**
- **Runner:** Playwright
- **Browser:** Chromium, Firefox, WebKit
- **Screenshots:** Automatic on failure

---

## ⚛️ Tests Frontend

### Configuration

**`vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}'
      ]
    }
  }
});
```

**`src/test/setup.ts`:**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Tauri API
global.window.__TAURI__ = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn()
  }
};
```

---

### Tests Unitaires (Components)

**Exemple: `ChatInput.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders input field', () => {
    render(<ChatInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText(/type a message/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onSend with message on submit', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const submitBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitBtn);
    
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears input after send', () => {
    render(<ChatInput onSend={vi.fn()} />);
    
    const input = screen.getByPlaceholderText(/type a message/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const submitBtn = screen.getByRole('button', { name: /send/i });
    fireEvent.click(submitBtn);
    
    expect(input.value).toBe('');
  });
});
```

---

### Tests Unitaires (Hooks)

**Exemple: `useChat.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty messages', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
  });

  it('adds message on sendMessage', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello AI');
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Hello AI');
  });

  it('handles error on failed send', async () => {
    const { result } = renderHook(() => useChat());
    
    // Mock Tauri invoke to fail
    vi.mocked(window.__TAURI__.invoke).mockRejectedValueOnce(
      new Error('Network error')
    );
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.error).toBe('Network error');
  });
});
```

---

### Tests Stores (Zustand)

**Exemple: `chatStore.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store
    useChatStore.setState({
      messages: [],
      isLoading: false,
      error: null
    });
  });

  it('adds message', () => {
    const { addMessage } = useChatStore.getState();
    
    addMessage({
      id: '1',
      role: 'user',
      content: 'Hello'
    });
    
    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Hello');
  });

  it('sets loading state', () => {
    const { setLoading } = useChatStore.getState();
    
    setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);
    
    setLoading(false);
    expect(useChatStore.getState().isLoading).toBe(false);
  });
});
```

---

### Lancer Tests Frontend

```bash
# Tous les tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Tests spécifiques
npm test -- ChatInput

# UI mode (interactif)
npm run test:ui
```

---

## 🦀 Tests Backend

### Tests Unitaires (Rust)

**Exemple: `omega/router_test.rs`**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_intent_detection() {
        let router = Router::new();
        let message = "What is TITANE?";
        
        let intent = router.detect_intent(message);
        
        assert_eq!(intent, Intent::Question);
    }
    
    #[test]
    fn test_route_selection() {
        let router = Router::new();
        let context = Context {
            intent: Intent::Question,
            complexity: Complexity::Medium,
            ..Default::default()
        };
        
        let route = router.select_route(&context).unwrap();
        
        assert!(matches!(route, Route::SingleProvider));
    }
}
```

---

### Tests Intégration (Rust)

**Exemple: `tests/omega_pipeline_test.rs`**

```rust
use titane_infinity::omega::*;

#[tokio::test]
async fn test_full_pipeline() {
    // Setup
    let config = OmegaConfig::default();
    let pipeline = OmegaPipeline::new(config);
    
    // Input
    let request = ConversationRequest {
        message: "Hello".to_string(),
        context: vec![],
        ..Default::default()
    };
    
    // Execute
    let response = pipeline.process(request).await.unwrap();
    
    // Assert
    assert!(!response.content.is_empty());
    assert_eq!(response.status, ResponseStatus::Success);
}

#[tokio::test]
async fn test_pipeline_timeout() {
    let config = OmegaConfig {
        timeout_ms: 100, // Very short timeout
        ..Default::default()
    };
    let pipeline = OmegaPipeline::new(config);
    
    let request = ConversationRequest {
        message: "Complex query requiring long processing".to_string(),
        ..Default::default()
    };
    
    let result = pipeline.process(request).await;
    
    assert!(matches!(result, Err(PipelineError::Timeout)));
}
```

---

### Tests avec Mocks (mockall)

**Exemple: `ai_providers/ollama_test.rs`**

```rust
use mockall::predicate::*;
use mockall::mock;

mock! {
    OllamaClient {
        async fn generate(&self, prompt: String) -> Result<String, Error>;
    }
}

#[tokio::test]
async fn test_ollama_provider() {
    let mut mock_client = MockOllamaClient::new();
    
    // Setup expectation
    mock_client
        .expect_generate()
        .with(eq("Hello"))
        .times(1)
        .returning(|_| Ok("Hi there!".to_string()));
    
    // Test
    let provider = OllamaProvider::new_with_client(mock_client);
    let response = provider.chat("Hello").await.unwrap();
    
    assert_eq!(response, "Hi there!");
}
```

---

### Lancer Tests Backend

```bash
cd src-tauri

# Tous les tests
cargo test

# Tests spécifiques
cargo test omega::

# Avec logs
cargo test -- --nocapture

# Tests parallèles (plus rapide)
cargo test -- --test-threads=4

# Coverage (avec tarpaulin)
cargo tarpaulin --out Html
```

---

## 🎭 Tests E2E

### Configuration Playwright

**`playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev:tauri',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

---

### Test E2E Exemple

**`tests/e2e/chat.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Chat IA', () => {
  test('send message and receive response', async ({ page }) => {
    // Navigate to Chat page
    await page.goto('/chat');
    
    // Select provider
    await page.selectOption('[data-testid="provider-select"]', 'ollama');
    
    // Type message
    await page.fill('[data-testid="chat-input"]', 'Hello TITANE');
    
    // Send
    await page.click('[data-testid="send-button"]');
    
    // Wait for response
    await page.waitForSelector('[data-testid="assistant-message"]', {
      timeout: 10000
    });
    
    // Assert
    const messages = await page.$$('[data-testid="assistant-message"]');
    expect(messages.length).toBeGreaterThan(0);
  });
  
  test('switch providers mid-conversation', async ({ page }) => {
    await page.goto('/chat');
    
    // Send with Ollama
    await page.selectOption('[data-testid="provider-select"]', 'ollama');
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');
    await page.waitForSelector('[data-testid="assistant-message"]');
    
    // Switch to Gemini
    await page.selectOption('[data-testid="provider-select"]', 'gemini');
    await page.fill('[data-testid="chat-input"]', 'Another message');
    await page.click('[data-testid="send-button"]');
    
    // Should still work
    await page.waitForSelector('[data-testid="assistant-message"]:nth-child(4)');
    
    const messages = await page.$$('[data-testid="assistant-message"]');
    expect(messages.length).toBe(2);
  });
});
```

---

### Lancer Tests E2E

```bash
# Installer Playwright
npm run test:e2e:install

# Lancer tests E2E
npm run test:e2e

# Mode UI (interactif)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Tests spécifiques
npx playwright test chat.spec.ts

# Génerer rapport
npx playwright show-report
```

---

## 📊 Coverage & Qualité

### Frontend Coverage

```bash
# Générer rapport coverage
npm run test:coverage

# Ouvrir rapport HTML
open coverage/index.html
```

**Seuils minimums (`vite.config.ts`):**

```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
    statements: 70
  }
}
```

---

### Backend Coverage

```bash
cd src-tauri

# Avec tarpaulin (recommandé)
cargo install cargo-tarpaulin
cargo tarpaulin --out Html

# Ou avec llvm-cov
cargo install cargo-llvm-cov
cargo llvm-cov --html

# Ouvrir rapport
open tarpaulin-report.html
```

---

### Analyse Qualité Code

#### ESLint (Frontend)

```bash
# Linter
npm run lint

# Auto-fix
npm run lint:fix

# Strictness level
npm run lint -- --max-warnings 0
```

#### Clippy (Backend)

```bash
cd src-tauri

# Linter
cargo clippy

# Mode strict
cargo clippy -- -D warnings

# Toutes les features
cargo clippy --all-features
```

---

## 🔄 CI/CD

### GitHub Actions Workflow

**`.github/workflows/tests.yml`:**

```yaml
name: Tests

on:
  push:
    branches: [MAIN]
  pull_request:
    branches: [MAIN]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cd src-tauri && cargo test
      - run: cd src-tauri && cargo clippy -- -D warnings

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📝 Bonnes Pratiques

### Tests Unitaires

✅ **DO:**
- Tester un comportement par test
- Nommer tests clairement: `it('should add message when sendMessage called')`
- Utiliser AAA pattern: Arrange, Act, Assert
- Mocker dépendances externes (API, Tauri)
- Tester cas edge (null, undefined, empty, large data)

❌ **DON'T:**
- Tester implémentation (tester comportement)
- Dépendre de l'ordre des tests
- Utiliser `setTimeout` (flaky tests)
- Ignorer warnings dans tests

---

### Tests Intégration

✅ **DO:**
- Tester interactions entre modules
- Utiliser vraies dépendances quand possible
- Setup/teardown propres (cleanup)
- Vérifier side effects

❌ **DON'T:**
- Re-tester fonctionnalités unitaires
- Ignorer performances (timeouts raisonnables)

---

### Tests E2E

✅ **DO:**
- Tester workflows utilisateur complets
- Utiliser data-testid pour sélecteurs
- Prendre screenshots sur erreur
- Tester sur navigateurs multiples

❌ **DON'T:**
- Sur-utiliser E2E (lents, fragiles)
- Tester logique métier (unit tests)
- Hardcoder timeouts courts

---

## 🚨 Debugging Tests

### Frontend (Vitest)

```bash
# Debug mode
npm run test:debug

# Dans VSCode
# 1. Placer breakpoint
# 2. Run Test > Debug Test (CodeLens)
```

### Backend (Rust)

```bash
# Avec logs
RUST_LOG=debug cargo test -- --nocapture

# Dans VSCode avec rust-analyzer
# 1. Placer breakpoint
# 2. Run Test > Debug Test
```

### E2E (Playwright)

```bash
# UI mode (step-by-step)
npm run test:e2e:ui

# Debug specific test
npx playwright test chat.spec.ts --debug

# Headed mode (voir browser)
npx playwright test --headed
```

---

## 📚 Ressources

### Documentation

- **Vitest:** https://vitest.dev/
- **Testing Library:** https://testing-library.com/
- **Cargo Test:** https://doc.rust-lang.org/book/ch11-00-testing.html
- **Playwright:** https://playwright.dev/

### Guides Internes

- **[SETUP.md](./SETUP.md)** - Configuration développement
- **[Architecture](../../01_architecture/ARCHITECTURE_CURRENT_v24.md)** - Architecture système

---

## 🎯 Checklist Tests

Avant de commit:

- [ ] `npm run lint` passe
- [ ] `npm test` passe (100% success rate)
- [ ] `cd src-tauri && cargo test` passe
- [ ] `cd src-tauri && cargo clippy` sans warnings
- [ ] Coverage reste > 70%
- [ ] E2E critiques passent (si modifs UI)

---

**© 2025 TITANE∞ — Testing Guide**  
**Version:** v24.2.0 | **License:** Proprietary

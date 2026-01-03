# 📐 TITANE∞ Code Style Guide

Ce guide définit les conventions de code pour **TITANE∞**. Respecter ces règles garantit la cohérence, la maintenabilité et la qualité du projet.

---

## 🎯 TypeScript/JavaScript

### Naming Conventions

```typescript
// ✅ Classes: PascalCase
class CognitiveKernel {}
class UnifiedIdentityKernel {}

// ✅ Functions/Methods: camelCase
function processUserInput() {}
async function sendAIMessage() {}

// ✅ Variables: camelCase
const maxTokens = 4096;
let currentState = 'idle';

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_CONTEXT_LENGTH = 16000;
const DEFAULT_TEMPERATURE = 0.7;

// ✅ Interfaces/Types: PascalCase
interface ConversationMessage {}
type EngineState = 'idle' | 'running' | 'paused';

// ✅ Enums: PascalCase (keys UPPER_CASE)
enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  NEUTRAL = 'neutral',
}

// ❌ Éviter les noms courts/cryptiques
const x = getUserData(); // BAD
const userData = getUserData(); // GOOD
```

---

### Type Annotations

```typescript
// ✅ Toujours typer les paramètres et retours de fonction
function calculateScore(value: number, weight: number): number {
  return value * weight;
}

// ✅ Typer les variables complexes
const config: ConversationConfig = {
  maxContextLength: 16000,
  temperature: 0.7,
};

// ✅ Utiliser `unknown` au lieu de `any`
function parseUnknown(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  throw new Error('Invalid type');
}

// ❌ JAMAIS utiliser `any`
function badFunction(data: any) {
  // INTERDIT
}
```

---

### Exports

```typescript
// ✅ Named exports (préféré)
export class CognitiveKernel {}
export function processInput() {}
export const MAX_TOKENS = 4096;

// ⚠️ Default exports (éviter si possible)
export default class MyClass {} // OK mais named export préféré
```

---

### Imports

```typescript
// ✅ Grouper et trier les imports
// 1. External libraries
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// 2. Internal modules (absolute paths avec @/)
import { conversationManager } from '@/services/ai/ConversationManager';
import type { ConversationMessage } from '@/types/conversation';

// 3. Relative imports (local files)
import { helper } from './utils/helper';

// ❌ Imports désorganisés
import { helper } from './utils/helper';
import { useState } from 'react';
import type { ConversationMessage } from '@/types/conversation';
```

---

### Async/Await

```typescript
// ✅ Toujours utiliser async/await (pas de .then())
async function fetchData(): Promise<Data> {
  try {
    const response = await invoke<Data>('get_data');
    return response;
  } catch (error) {
    console.error('[fetchData] Error:', error);
    throw error;
  }
}

// ❌ Éviter .then() chains
function badFetchData() {
  return invoke('get_data')
    .then(response => response)
    .catch(error => console.error(error));
}
```

---

### Error Handling

```typescript
// ✅ Try/catch avec logs descriptifs
async function sendMessage(text: string): Promise<Response> {
  try {
    const response = await conversationManager.sendMessage({
      role: 'user',
      content: text,
      timestamp: Date.now(),
    });
    return response;
  } catch (error) {
    console.error('[sendMessage] Failed to send message:', error);
    throw new Error(`Message sending failed: ${error}`);
  }
}

// ✅ Type guards pour error handling
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

try {
  riskyOperation();
} catch (e) {
  if (isError(e)) {
    console.error(e.message);
  }
}
```

---

### Comments & Documentation

```typescript
/**
 * 🧠 Cognitive Kernel
 *
 * Orchestre la cognition autonome de TITANE∞:
 * - Perception (inputs multimodaux)
 * - Décision (multi-agents coordination)
 * - Action (outputs unifiés)
 *
 * @example
 * const kernel = new CognitiveKernel(config);
 * kernel.start();
 */
export class CognitiveKernel {
  private state: KernelState;

  /**
   * Initialize cognitive kernel
   *
   * @param config - Kernel configuration
   * @throws Error if config is invalid
   */
  constructor(config: KernelConfig) {
    this.validateConfig(config);
    this.state = this.initializeState(config);
  }

  /**
   * Process user input through cognitive pipeline
   *
   * @param input - User input (text, voice, gesture)
   * @returns Processed cognitive response
   */
  async processInput(input: CognitiveInput): Promise<CognitiveResponse> {
    // Implementation
  }
}

// ✅ Inline comments pour clarifications complexes
const score = calculateEmotionalScore(
  message,
  0.8 // Emotion weight (0-1)
);

// ❌ Éviter les comments évidents
const x = 5; // Assign 5 to x (INUTILE)
```

---

### React Components

```tsx
// ✅ Functional components avec TypeScript
import React, { useState, useEffect } from 'react';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`message message-${role} ${isVisible ? 'visible' : ''}`}>
      <p>{content}</p>
      <span className="timestamp">{new Date(timestamp).toLocaleTimeString()}</span>
    </div>
  );
}

// ❌ Éviter les class components (legacy React)
class BadComponent extends React.Component {
  // INTERDIT
}
```

---

## 🦀 Rust

### Naming Conventions

```rust
// ✅ Modules: snake_case
mod conversation_manager;
mod voice_engine;

// ✅ Functions: snake_case
fn process_user_input(data: String) -> Result<String, String> {}

// ✅ Structs/Enums: PascalCase
struct ConversationState {}
enum EmotionType {
    Joy,
    Sadness,
    Neutral,
}

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_BUFFER_SIZE: usize = 8192;
const DEFAULT_TIMEOUT: u64 = 30;

// ✅ Variables: snake_case
let user_input = "Hello";
let max_tokens = 4096;
```

---

### Error Handling

```rust
// ✅ Toujours utiliser Result<T, E>
#[tauri::command]
pub fn secure_command(data: String) -> Result<String, String> {
    if !validate_input(&data) {
        return Err("Invalid input format".to_string());
    }

    match process_data(&data) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Processing failed: {}", e)),
    }
}

// ❌ JAMAIS utiliser unwrap() en production
pub fn bad_command(data: String) -> String {
    process_data(&data).unwrap() // INTERDIT (panic)
}

// ✅ Utiliser expect() seulement si panic justifié
let config = load_config()
    .expect("Critical: Config file must exist for app to run");
```

---

### Ownership & Borrowing

```rust
// ✅ Passer par référence si pas besoin d'ownership
fn process_text(text: &str) -> String {
    text.to_uppercase()
}

// ✅ Prendre ownership si nécessaire
fn consume_data(data: Vec<u8>) {
    // data est consommé ici
}

// ✅ Utiliser &mut pour mutations
fn append_suffix(text: &mut String) {
    text.push_str(" [PROCESSED]");
}
```

---

### Tauri Commands

```rust
// ✅ Typer strictement les commandes Tauri
#[tauri::command]
pub async fn conversation_send_message(
    message: String,
    conversation_id: String,
) -> Result<ConversationResponse, String> {
    // Validation
    if message.is_empty() {
        return Err("Message cannot be empty".to_string());
    }

    // Processing
    let response = conversation_manager
        .send_message(message, conversation_id)
        .await
        .map_err(|e| format!("Send failed: {}", e))?;

    Ok(response)
}

// ✅ Ajouter logging pour debug
#[tauri::command]
pub fn logged_command(data: String) -> Result<String, String> {
    println!("[logged_command] Processing: {}", data);

    let result = process(data)?;

    println!("[logged_command] Success");
    Ok(result)
}
```

---

## 🎨 CSS/SCSS

```css
/* ✅ BEM Naming Convention */
.chat-message {
  padding: 1rem;
}

.chat-message__content {
  font-size: 1rem;
}

.chat-message__timestamp {
  color: gray;
}

.chat-message--user {
  background-color: #e3f2fd;
}

/* ✅ CSS Variables pour thèmes */
:root {
  --color-primary: #3b82f6;
  --color-background: #0a0a0a;
  --font-size-base: 16px;
}

.button-primary {
  background-color: var(--color-primary);
  font-size: var(--font-size-base);
}

/* ❌ Éviter les styles inline (sauf nécessité React) */
/* Préférer classes CSS */
```

---

## 📏 Formatting Rules

### Indentation

- **TypeScript/JavaScript**: 2 spaces
- **Rust**: 4 spaces
- **JSON**: 2 spaces

### Line Length

- **Maximum**: 100 caractères (soft limit)
- **Hard limit**: 120 caractères

### Quotes

- **TypeScript**: Single quotes `'...'` (sauf JSX: double quotes)
- **Rust**: Double quotes `"..."`
- **JSON**: Double quotes `"..."`

### Semicolons

- **TypeScript**: Oui (toujours)
- **Rust**: Non (sauf nécessité)

---

## 🔧 Tools

### Auto-formatting

```bash
# TypeScript/JavaScript
pnpm run format

# Rust
cd src-tauri && cargo fmt

# Vérifier sans modifier
pnpm run format:check
```

### Linting

```bash
# TypeScript
pnpm run lint

# Rust
cd src-tauri && cargo clippy
```

---

## ✅ Checklist avant commit

- [ ] Code formaté (`pnpm run format`)
- [ ] Linting passé (`pnpm run lint`)
- [ ] Tests passés (`pnpm test`)
- [ ] Types stricts (pas de `any`)
- [ ] Documentation ajoutée (JSDoc/Rustdoc)
- [ ] Logs ajoutés pour fonctions critiques
- [ ] Error handling robuste (try/catch, Result)

---

**Respecter ce guide garantit un code TITANE∞ de qualité professionnelle ! 🚀**

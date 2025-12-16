# 🎯 PLAN D'ACTION CORRECTION — TITANE∞ v24.4.0

**Date:** 2025-12-15  
**Objectif:** Assainissement, Réorganisation, Application Règles Tauri-only/Local-first  
**Basé sur:** v24.3.0 (Conformité 98/100)

---

## 📊 AUDIT INITIAL — État Actuel

### 1. Scripts NPM (46 total)

**Problèmes identifiés:**

#### Scripts Redondants (14 à fusionner/simplifier)

```json
// Build scripts (4)
"build": "vite build"
"build:compressed": "vite build && npm run compress"
"build:prod": "npm run prebuild && npm run tauri build"
"build:watch": "vite build --watch"

// Test scripts (11)
"test": "node ./scripts/run-vitest.mjs"
"test:ui": "vitest --config vitest.unit.config.ts --ui"
"test:coverage": "vitest run --coverage --config vitest.unit.config.ts"
"test:unit": "cross-env... vitest run --config vitest.unit.config.ts"
"test:integration": "cross-env... vitest run --config vitest.integration.config.ts"
"test:e2e": "playwright test"
"test:e2e:ui": "playwright test --ui"
"test:e2e:debug": "playwright test --debug"
"test:rust": "cd src-tauri && cargo test"
"test:tauri": "npm run test:rust"
"test:all": "npm run test && npm run test:e2e && cargo test"
"test:ci": "npm run lint && npm run type-check && npm run test && npm run test:e2e && npm run test:rust"

// Dev scripts (3)
"dev": "npm run dev:tauri"
"dev:tauri": "tauri dev"
"vite:dev": "vite --port 5173 --host 0.0.0.0"
```

#### Scripts Non-conformes Tauri-only (2 - BON ✅)

```json
"preview": "echo '🔒 TAURI-ONLY MODE' && exit 1"  ✅
"start": "echo '🔒 TAURI-ONLY MODE: Use npm run dev instead' && exit 1"  ✅
"docs:serve": "echo '🔒 TAURI-ONLY MODE' && exit 1"  ✅
```

#### Scripts Manquants

- ❌ `verify` unique (lint + type-check + tests + rust)
- ❌ `build:production` (simplifié, sans prebuild)
- ❌ `test:watch` (Vitest watch mode)

---

### 2. Structure src/ (Complexité Excessive)

#### Problème: Duplication Engines/Core

```
src/
├── engines/          ← 25 engines (aura, cognitive, coherence...)
├── core/engines/     ← DUPLICATION ❌
├── services/         ← 30+ services
├── core/services/    ← DUPLICATION ❌
└── core/             ← Mélange responsibilities
```

#### Problème: Pas de Legacy Clair

```
src/
├── legacy/           ← Existe mais incomplet
├── components/       ← Contient du code legacy non marqué
├── modules/          ← Mélange v15/v16
└── hooks/archived/   ← Archive partielle
```

---

### 3. Structure src-tauri/src/ (Fragmentation)

#### Problème: Versions Multiples Non-séparées

```
src-tauri/src/
├── cognitive/           ← Version ?
├── omega/               ← v2
├── legacy/              ← Ancien code
├── digital_twin_v14_1/  ← v14.1
├── engines/             ← Version ?
└── conversation_engine/ ← Quelle version?
```

#### Commands Dépréciées Encore Exposées

```rust
// src-tauri/tauri.conf.json
{ "command": "chat_send_message" }  ❌ DEPRECATED
```

---

### 4. Configuration Tauri (3 fichiers)

#### Fichiers Trouvés

```
./src-tauri/tauri.conf.json         (base)
./runtime/stable/tauri.conf.json    (production)
./runtime/dev/tauri.conf.json       (development)
```

#### Problème: Pas de Stratégie Overlay Claire

- ❓ Divergences non documentées entre dev/stable
- ❓ Pas de validation automatique coherence
- ❌ `chat_send_message` encore dans allowlist

---

### 5. Scripts de Validation (20+ trouvés)

#### Scripts Existants

```bash
scripts/validate-tauri-only.sh          ✅
scripts/test/verify_version_coherence.sh ✅
scripts/verify_*_v14.sh                  ❓ (multiples versions)
scripts/diagnostic/diagnostic_script.sh   ❌ (cherche chat_send_message)
scripts/validate-chat-pipeline.sh         ❌ (teste chat_send_message)
```

#### Problème: Validation Obsolète

- Scripts cherchent `chat_send_message` (deprecated)
- Pas de validation `conversationId` mandatory
- Pas de check OMEGA v2 compliance

---

### 6. .gitignore (Incomplet)

#### Manquants

```ignore
# ❌ Caches Vite non couverts
.vite-cache/  ✅ Présent
.turbo/       ❌ MANQUANT

# ❌ Outputs temporaires
*.log.*
.vscode-test/
playwright-report/
test-results/

# ❌ Binaires spécifiques
*.AppImage
*.exe
*.dmg
*.deb
```

---

## 🎯 PLAN DE CORRECTION

### Phase 1: Assainissement Scripts NPM (4h)

#### 1.1 Fusionner Scripts Build

```json
{
  "scripts": {
    // ✅ APRÈS: 2 scripts build clairs
    "build": "vite build",
    "build:production": "npm run lint && vite build && tauri build",

    // ❌ SUPPRIMER
    "build:compressed": "...",
    "build:watch": "...",
    "build:prod": "...",
    "prebuild": "..."
  }
}
```

#### 1.2 Unifier Scripts Test

```json
{
  "scripts": {
    // ✅ APRÈS: 6 scripts test essentiels
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:rust": "cd src-tauri && cargo test",
    "test:all": "npm run test && npm run test:e2e && npm run test:rust",

    // ❌ SUPPRIMER (redondants)
    "test:ui": "...",
    "test:unit": "...",
    "test:integration": "...",
    "test:tauri": "...",
    "test:ci": "..."
  }
}
```

#### 1.3 Créer Script Verify Unique

```json
{
  "scripts": {
    "verify": "npm run lint && npm run format:check && npm run check && npm run test:all"
  }
}
```

**Résultat:** 46 → 20 scripts (~57% réduction)

---

### Phase 2: Réorganisation Dépôt (8h)

#### 2.1 Séparer Code Legacy

**Déplacement vers `legacy/`:**

```bash
# Frontend
src/modules/talkToTitane.disabled/  → legacy/frontend/modules/
src/hooks/archived/                  → legacy/frontend/hooks/
src/components/**/*_v15.tsx          → legacy/frontend/components/

# Backend
src-tauri/src/digital_twin_v14_1/    → legacy/backend/digital_twin_v14_1/
src-tauri/src/api/chat_commands.rs   → legacy/backend/commands/ (si deprecated)
```

**Créer `legacy/README.md`:**

```markdown
# Legacy Code Policy

## Critères

- Code v15 ou antérieur
- API dépréciées (chat_send_message)
- Modules .disabled

## Processus

1. Marquer @deprecated (avec date)
2. Migration guide créé
3. Déplacement vers legacy/ après 2 sprints
4. Suppression après 6 mois

## Inventaire

- digital_twin_v14_1/ — Deprecated v24.0.0
- chat_send_message — Deprecated v24.3.0 (removal v25.0.0)
```

#### 2.2 Regrouper Moteurs v16

**Backend:**

```rust
// src-tauri/src/cognitive/mod.rs
pub mod v16 {
    pub mod analyse;
    pub mod coherence;
    pub mod evolution;
    pub mod integration;
}

// Exposition unique
pub use v16::*;
```

**Frontend:**

```typescript
// src/engines/cognitive/v16/index.ts
export * from './analyseEngine';
export * from './coherenceEngine';
export * from './evolutionEngine';
export * from './integrationEngine';
```

#### 2.3 Éliminer Duplications

**Avant:**

```
src/
├── engines/coherence/
├── core/engines/coherence/  ❌
└── services/coherence/
```

**Après (Architecture 4-Ring):**

```
src/
├── types/           (Ring 1: Core)
├── engines/         (Ring 2: Pure Logic)
├── services/        (Ring 3: I/O)
└── components/      (Ring 4: UI)
```

**Règle:** 1 feature = 1 emplacement selon son ring

---

### Phase 3: Nettoyage Artefacts (2h)

#### 3.1 Compléter .gitignore

```ignore
# Ajouts nécessaires
.turbo/
playwright-report/
test-results/
.vscode-test/
storybook-static/

# Logs étendus
*.log.*
npm-debug*.log
yarn-debug*.log
pnpm-debug*.log

# Build artifacts
*.AppImage
*.exe
*.dmg
*.deb
*.rpm

# Caches supplémentaires
.eslintcache
.stylelintcache
```

#### 3.2 Harmoniser Configurations Tauri

**Créer `src-tauri/tauri.base.json`:**

```json
{
  "build": { "distDir": "../dist" },
  "package": { "productName": "TITANE∞" },
  "tauri": {
    "allowlist": {
      "protocol": { "asset": true },
      "fs": { "scope": ["$APPDATA/*"] },
      "shell": { "open": false }
    }
  }
}
```

**`runtime/dev/tauri.conf.json`:**

```json
{
  "extends": "../../src-tauri/tauri.base.json",
  "tauri": {
    "bundle": { "active": false } // Dev only
  }
}
```

**`runtime/stable/tauri.conf.json`:**

```json
{
  "extends": "../../src-tauri/tauri.base.json",
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["appimage", "deb"]
    }
  }
}
```

#### 3.3 Valider Cohérence Configs

**Créer `scripts/verify/validate-tauri-configs.sh`:**

```bash
#!/bin/bash

BASE="src-tauri/tauri.base.json"
DEV="runtime/dev/tauri.conf.json"
STABLE="runtime/stable/tauri.conf.json"

# Vérifier allowlist identiques
jq -S '.tauri.allowlist' "$BASE" > /tmp/base_allowlist
jq -S '.tauri.allowlist' "$DEV" > /tmp/dev_allowlist

if ! diff /tmp/base_allowlist /tmp/dev_allowlist; then
    echo "❌ Allowlist diverge entre base et dev"
    exit 1
fi

echo "✅ Configurations cohérentes"
```

---

### Phase 4: Application Règles Absolues (6h)

#### 4.1 Tauri-Only Enforcement

**Créer `scripts/verify/enforce-tauri-only.sh`:**

```bash
#!/bin/bash

# Interdire serveurs HTTP
if grep -r "express\|koa\|fastify" src/ --include="*.ts" --include="*.tsx"; then
    echo "❌ Serveur HTTP détecté (violation Tauri-only)"
    exit 1
fi

# Interdire vite preview
if grep "vite preview" package.json; then
    echo "❌ vite preview trouvé (violation Tauri-only)"
    exit 1
fi

# Vérifier scripts npm
FORBIDDEN=("start" "serve" "preview")
for script in "${FORBIDDEN[@]}"; do
    if jq -e ".scripts[\"$script\"] | select(. != null and (contains(\"exit 1\") | not))" package.json > /dev/null; then
        echo "❌ Script $script autorisé (violation Tauri-only)"
        exit 1
    fi
done

echo "✅ Tauri-only enforced"
```

#### 4.2 Local-First Verification

**Créer `scripts/verify/enforce-local-first.sh`:**

```bash
#!/bin/bash

# Vérifier fonts embarquées
if grep -r "fonts.googleapis.com\|fonts.gstatic.com" src/ --include="*.html" --include="*.css"; then
    echo "❌ Google Fonts CDN détecté (violation Local-first)"
    exit 1
fi

# Vérifier CDN JS
if grep -r "cdn.jsdelivr.net\|unpkg.com\|cdnjs.cloudflare.com" src/ --include="*.html"; then
    echo "❌ CDN JavaScript détecté (violation Local-first)"
    exit 1
fi

# Vérifier requêtes réseau automatiques
NETWORK_CALLS=$(grep -r "fetch\|axios\|XMLHttpRequest" src/ --include="*.ts" --include="*.tsx" | grep -v "// @network-allowed" | wc -l)
if [ "$NETWORK_CALLS" -gt 0 ]; then
    echo "⚠️ $NETWORK_CALLS appels réseau non annotés"
    echo "Ajouter // @network-allowed pour appels intentionnels"
fi

echo "✅ Local-first enforced"
```

#### 4.3 Gestion Sessions Mandatory

**Créer `src/lib/sessions/conversationManager.ts`:**

```typescript
import { v4 as uuidv4 } from 'uuid';

export class ConversationManager {
  private static activeConversation: string | null = null;

  static createConversation(): string {
    const conversationId = `conv-${uuidv4()}`;
    this.activeConversation = conversationId;
    return conversationId;
  }

  static getActive(): string {
    if (!this.activeConversation) {
      throw new Error('No active conversation. Call createConversation() first.');
    }
    return this.activeConversation;
  }

  static setActive(conversationId: string): void {
    this.activeConversation = conversationId;
  }
}
```

**Usage obligatoire:**

```typescript
// ❌ INTERDIT (session implicite)
await invoke('conversation_generate', {
  userMessage: 'Hello',
});

// ✅ REQUIS (session explicite)
const conversationId = ConversationManager.getActive();
await invoke('conversation_generate', {
  conversationId,
  userMessage: 'Hello',
  mode: 'chat',
});
```

#### 4.4 Supprimer chat_send_message

**Backend:**

```rust
// src-tauri/src/api/chat_commands.rs
#[tauri::command]
pub async fn chat_send_message() -> Result<String, String> {
    Err("chat_send_message removed in v24.4.0. Use conversation_generate.".to_string())
}
```

**Retirer de allowlist:**

```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "invoke": {
        "commands": [
          "conversation_generate" // ✅
          // "chat_send_message"   ❌ SUPPRIMER
        ]
      }
    }
  }
}
```

---

### Phase 5: Documentation et Prompts (3h)

#### 5.1 Créer CONTRIBUTING.md

````markdown
# Contributing to TITANE∞

## Architecture 4-Ring Model

### Ring 1: Core (src/types/)

- Pure TypeScript types
- Zero imports
- Examples: EmotionalState, ConversationMode

### Ring 2: Engines (src/engines/)

- Pure logic, no I/O
- Imports: Ring 1 only
- Examples: CoherenceEngine, EmotionEngine

### Ring 3: Services (src/services/)

- I/O orchestration
- Imports: Ring 1 + Ring 2
- Examples: AgendaService, CognitiveLayoutService

### Ring 4: OS/UI (src/components/, src-tauri/)

- UI React, Tauri backend
- Imports: All rings

## Rules

### Tauri-Only

- ❌ No HTTP servers (express, koa, etc.)
- ❌ No `vite preview`
- ✅ Use `tauri dev` for development

### Local-First

- ❌ No CDN (Google Fonts, unpkg, etc.)
- ❌ No automatic network requests
- ✅ All assets embedded or local

### Sessions

- ❌ No implicit conversations
- ✅ Use ConversationManager.getActive()
- ✅ conversationId mandatory

## Testing

- Unit: `npm run test`
- E2E: `npm run test:e2e`
- Rust: `npm run test:rust`
- All: `npm run test:all`

## Verification

```bash
npm run verify  # Lint + Type-check + Tests
```
````

````

#### 5.2 Créer CODE_STYLE.md
```markdown
# Code Style Guide

## TypeScript

### Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
````

### Zero `any`

```typescript
// ❌ INTERDIT
function process(data: any) {}

// ✅ REQUIS
interface ProcessData {
  userId: string;
  message: string;
}
function process(data: ProcessData) {}
```

### Imports Ring Enforcement

```typescript
// Engine (Ring 2)
// ✅ AUTORISÉ
import { EmotionalState } from '@/types/voice';

// ❌ INTERDIT
import { AgendaService } from '@/services/agenda';
```

## Rust

### Zero unwrap()

```rust
// ❌ INTERDIT
let value = option.unwrap();

// ✅ REQUIS
let value = option.expect("Value should exist");
```

### Error Handling

```rust
// ✅ REQUIS
pub async fn load_memory(id: &str) -> Result<Memory, MemoryError> {
    let data = db.get(id)
        .await
        .map_err(|e| MemoryError::Database(e))?;
    Ok(data)
}
```

## Logging

### No Direct Console

```typescript
// ❌ INTERDIT (Engine)
console.log('Processing...');

// ✅ REQUIS (Service/OS only)
import { logger } from '@/lib/logging';
logger.info('Processing started', { userId });
```

````

#### 5.3 Mettre à Jour .github/instructions/titane.instructions.md

**Ajouts nécessaires:**
```markdown
## Règles Absolues

### 1. Tauri-Only
- ❌ INTERDIT: HTTP servers, vite preview, standalone web apps
- ✅ REQUIS: tauri dev, embedded assets

### 2. Local-First
- ❌ INTERDIT: CDN (fonts, JS libs), automatic network calls
- ✅ REQUIS: Embedded fonts, local dependencies
- ⚠️ EXCEPTION: API calls (OpenAI, Gemini) conditionnés par user

### 3. Session Management
- ❌ INTERDIT: Implicit conversations, optional conversationId
- ✅ REQUIS: ConversationManager.getActive(), conversationId mandatory

### 4. Legacy Code
- Location: legacy/ folder
- Marking: @deprecated with date
- Removal: After 6 months

### 5. Logging
- ❌ INTERDIT: console.log in engines/core
- ✅ REQUIS: logger service in OS/Services layer

## Verification Commands

```bash
# Full validation
npm run verify

# Tauri-only enforcement
./scripts/verify/enforce-tauri-only.sh

# Local-first enforcement
./scripts/verify/enforce-local-first.sh

# Architecture validation
npm run test:architecture
````

````

---

### Phase 6: Tests de Stabilité (3h)

#### 6.1 Tests OMEGA v2 Compliance

**Créer `src/__tests__/omega/conversation-manager.test.ts`:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationManager } from '@/lib/sessions/conversationManager';

describe('ConversationManager', () => {
  beforeEach(() => {
    ConversationManager.setActive(null);
  });

  it('should throw when no active conversation', () => {
    expect(() => ConversationManager.getActive()).toThrow(
      'No active conversation'
    );
  });

  it('should create valid conversation ID', () => {
    const id = ConversationManager.createConversation();
    expect(id).toMatch(/^conv-[a-f0-9-]{36}$/);
  });

  it('should set and retrieve active conversation', () => {
    const id = ConversationManager.createConversation();
    expect(ConversationManager.getActive()).toBe(id);
  });
});
````

#### 6.2 Tests Architecture Rings

**Mettre à jour `src/__tests__/architecture/engine-isolation.test.ts`:**

```typescript
// Ajouter vérification logging
it('engines should not call console.log directly', async () => {
  const files = await findTypeScriptFiles('src/engines');
  const violations: string[] = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const matches = content.matchAll(/console\.(log|info|warn|error)/g);

    for (const match of matches) {
      violations.push(`${file}:${match.index} (${match[0]})`);
    }
  }

  expect(violations).toEqual([]);
});
```

#### 6.3 Tests Tauri-Only

**Créer `src/__tests__/compliance/tauri-only.test.ts`:**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Tauri-Only Compliance', () => {
  it('package.json should block preview/start/serve', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

    expect(pkg.scripts.preview).toContain('exit 1');
    expect(pkg.scripts.start).toContain('exit 1');
  });

  it('should not have HTTP server dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(deps.express).toBeUndefined();
    expect(deps.koa).toBeUndefined();
    expect(deps.fastify).toBeUndefined();
  });
});
```

---

## 📋 RÉSUMÉ DES TÂCHES

| Phase     | Tâche                      | Durée   | Priorité |
| --------- | -------------------------- | ------- | -------- |
| **1**     | Assainissement scripts NPM | 4h      | P0       |
| **2**     | Réorganisation dépôt       | 8h      | P0       |
| **3**     | Nettoyage artefacts        | 2h      | P1       |
| **4**     | Application règles         | 6h      | P0       |
| **5**     | Documentation              | 3h      | P1       |
| **6**     | Tests stabilité            | 3h      | P0       |
| **TOTAL** |                            | **26h** |          |

---

## ✅ CRITÈRES DE SUCCÈS

### Scripts

- ✅ 46 → 20 scripts NPM (~57% réduction)
- ✅ `verify` unique fonctionnel
- ✅ Tous scripts alignés Tauri-only

### Structure

- ✅ legacy/ contient 100% code deprecated
- ✅ Zero duplication engines/core/services
- ✅ Architecture 4-Ring respectée

### Configuration

- ✅ .gitignore complet (caches, artifacts)
- ✅ tauri.base.json + overlays dev/stable
- ✅ Validation automatique coherence

### Règles

- ✅ enforce-tauri-only.sh passing
- ✅ enforce-local-first.sh passing
- ✅ ConversationManager mandatory
- ✅ chat_send_message supprimé allowlist

### Tests

- ✅ Architecture tests 3/3 passing
- ✅ OMEGA v2 compliance tests passing
- ✅ Tauri-only compliance tests passing

---

**Prêt à démarrer Phase 1?**

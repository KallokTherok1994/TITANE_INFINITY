# 🔄 OMEGA Pipeline v2 — Migration Guide

**Version:** 24.2.0  
**Date:** Janvier 2025  
**Auteur:** Architecture Team TITANE∞  
**Status:** ✅ STABLE (tech-ready (dev))

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Pourquoi migrer?](#pourquoi-migrer)
3. [Breaking Changes](#breaking-changes)
4. [Migration Frontend](#migration-frontend)
5. [Migration Backend](#migration-backend)
6. [Migration E2E Tests](#migration-e2e-tests)
7. [Troubleshooting](#troubleshooting)
8. [Checklist](#checklist)

---

## 📊 Vue d'ensemble

### OMEGA v1 (DEPRECATED v24.2.0)
```rust
// ❌ ANCIEN: chat_send_message
invoke('chat_send_message', { 
    message: "Hello",
    // conversationId implicite (session auto)
})
```

### OMEGA v2 (CURRENT)
```rust
// ✅ NOUVEAU: conversation_generate
invoke('conversation_generate', {
    message: "Hello",
    conversationId: "conv-123",  // OBLIGATOIRE
    mode: "coach"                 // OBLIGATOIRE
})
```

---

## 🎯 Pourquoi migrer?

### Problèmes OMEGA v1
1. **Sessions implicites** → État global non maîtrisé
2. **Mode unique** → Pas de coach/synthesis/detective
3. **Orchestration monolithique** → Couplage chat_orchestrator.rs
4. **Mémoire fragmentée** → Pas de conversation_engine unifiée

### Avantages OMEGA v2
1. ✅ **Conversations explicites** → `conversationId` requis
2. ✅ **Multi-modes** → coach, synthesis, detective, creative
3. ✅ **Pipeline modulaire** → router → executor → merger → guardrails
4. ✅ **MemoryOS intégré** → Persistent, archival, medium, short tiers
5. ✅ **Fallback robuste** → Si conversation_engine fail → basic_responder

---

## 🚨 Breaking Changes

### 1. `conversationId` OBLIGATOIRE
```diff
- invoke('chat_send_message', { message })
+ invoke('conversation_generate', { message, conversationId: 'conv-001' })
```

### 2. `mode` OBLIGATOIRE
```diff
- // Mode implicite (toujours "chat")
+ invoke('conversation_generate', { 
+   message, 
+   conversationId, 
+   mode: 'coach' // ou 'synthesis', 'detective', 'creative'
+ })
```

### 3. Structure de réponse changée
```typescript
// ❌ ANCIEN (OMEGA v1)
interface ChatResponse {
    response: string;
    timestamp: number;
}

// ✅ NOUVEAU (OMEGA v2)
interface ConversationResponse {
    content: string;           // Réponse textuelle
    mode: string;              // Mode utilisé
    conversationId: string;    // ID conversation
    metadata: {
        tokens_used?: number;
        processing_time_ms?: number;
        engines_used: string[];
    };
}
```

---

## 🖥️ Migration Frontend

### Étape 1: Importer le bon type
```diff
- import type { ChatMessage } from '@/types/chat';
+ import type { ConversationMessage, ConversationMode } from '@/types/conversation';
```

### Étape 2: Gérer conversationId
```typescript
// Option A: ID unique par session utilisateur
const conversationId = `user-${userId}-${Date.now()}`;

// Option B: ID persisté (localStorage)
const conversationId = localStorage.getItem('activeConversationId') 
    || `conv-${crypto.randomUUID()}`;

// Option C: ID par feature
const conversationId = `onboarding-legal-designer`;
```

### Étape 3: Remplacer invoke()
```diff
- const response = await invoke<string>('chat_send_message', { 
-     message: userInput 
- });

+ const response = await invoke<ConversationResponse>('conversation_generate', {
+     message: userInput,
+     conversationId: conversationId,
+     mode: 'coach' as ConversationMode
+ });

- console.log(response); // string
+ console.log(response.content); // string
+ console.log(response.metadata.engines_used); // ['conversation_engine']
```

### Étape 4: Hook personnalisé (recommandé)
```typescript
// src/hooks/useConversation.ts
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { ConversationResponse, ConversationMode } from '@/types/conversation';

export function useConversation(conversationId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const sendMessage = async (message: string, mode: ConversationMode = 'coach') => {
        setLoading(true);
        setError(null);

        try {
            const response = await invoke<ConversationResponse>('conversation_generate', {
                message,
                conversationId,
                mode,
            });

            return response;
        } catch (err) {
            const error = err as Error;
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { sendMessage, loading, error };
}

// Utilisation
const { sendMessage, loading } = useConversation('conv-123');
await sendMessage("Explain quantum computing", "synthesis");
```

---

## ⚙️ Migration Backend

### Étape 1: Ajouter deprecation warning
```diff
// src-tauri/src/api/chat_commands.rs

+ #[deprecated(
+     since = "24.2.0",
+     note = "Use conversation_generate from OMEGA Pipeline v2 instead. \
+             Migration guide: docs/guides/MIGRATION_OMEGA_V2.md"
+ )]
#[tauri::command]
pub async fn chat_send_message(
    message: String,
    state: State<'_, ChatState>,
) -> Result<String, String> {
+     log::warn!(
+         "[DEPRECATED] chat_send_message called. Migrate to conversation_generate. \
+          See: docs/guides/MIGRATION_OMEGA_V2.md"
+     );
+
    // ... ancien code ...
}
```

### Étape 2: Rediriger vers OMEGA v2 (transition douce)
```rust
// Option: Redirection automatique
#[tauri::command]
pub async fn chat_send_message(
    message: String,
    state: State<'_, ChatState>,
) -> Result<String, String> {
    log::warn!("[DEPRECATED] Redirecting to conversation_generate");

    // Générer conversationId temporaire
    let conversation_id = format!("legacy-{}", uuid::Uuid::new_v4());

    // Appeler OMEGA v2
    conversation_generate(
        message,
        conversation_id,
        "coach".to_string(), // Mode par défaut
        state,
    )
    .await
    .map(|resp| resp.content) // Retourner juste le content (compatibilité)
}
```

### Étape 3: Planifier suppression (v25.0.0)
```rust
// src-tauri/src/api/chat_commands.rs

/// ⚠️ SCHEDULED FOR REMOVAL in v25.0.0
/// Migrate to conversation_generate before upgrading.
#[deprecated(since = "24.2.0", note = "REMOVED in v25.0.0")]
#[tauri::command]
pub async fn chat_send_message(...) -> Result<String, String> {
    Err("chat_send_message removed. Use conversation_generate.".to_string())
}
```

---

## 🧪 Migration E2E Tests

### Playwright (TypeScript)
```diff
// src/tests/e2e/titane_e2e.test.ts

test('Scenario 1: Onboarding Legal Designer', async ({ page }) => {
    await page.goto('http://localhost:1420');

-   const response = await page.evaluate(async () => {
-       return await (window as any).__TAURI__.invoke('chat_send_message', {
-           message: 'Je veux concevoir une interface juridique'
-       });
-   });

+   const response = await page.evaluate(async () => {
+       return await (window as any).__TAURI__.invoke('conversation_generate', {
+           message: 'Je veux concevoir une interface juridique',
+           conversationId: 'onboarding-001',
+           mode: 'coach'
+       });
+   });

-   expect(response).toContain('interface');
+   expect(response.content).toContain('interface');
+   expect(response.mode).toBe('coach');
});
```

### Vitest (Unit/Integration)
```typescript
// src/__tests__/omega/conversation.test.ts

import { describe, it, expect, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';

vi.mock('@tauri-apps/api/core');

describe('OMEGA v2: conversation_generate', () => {
    it('should require conversationId', async () => {
        await expect(
            invoke('conversation_generate', { 
                message: 'test' 
                // conversationId manquant
            })
        ).rejects.toThrow();
    });

    it('should return ConversationResponse structure', async () => {
        const mockResponse = {
            content: 'Hello!',
            mode: 'coach',
            conversationId: 'conv-123',
            metadata: {
                engines_used: ['conversation_engine'],
                processing_time_ms: 42,
            },
        };

        (invoke as any).mockResolvedValue(mockResponse);

        const result = await invoke('conversation_generate', {
            message: 'Hi',
            conversationId: 'conv-123',
            mode: 'coach',
        });

        expect(result).toMatchObject(mockResponse);
        expect(result.metadata.engines_used).toContain('conversation_engine');
    });
});
```

---

## 🔍 Troubleshooting

### Erreur: "conversationId is required"
```rust
// CAUSE: conversationId manquant
invoke('conversation_generate', { message: 'test' })

// FIX: Ajouter conversationId
invoke('conversation_generate', { 
    message: 'test',
    conversationId: 'conv-001',
    mode: 'coach'
})
```

### Erreur: "Invalid mode"
```rust
// CAUSE: Mode invalide ou manquant
invoke('conversation_generate', { 
    message: 'test',
    conversationId: 'conv-001',
    mode: 'invalid' // ❌
})

// FIX: Utiliser mode valide
mode: 'coach' | 'synthesis' | 'detective' | 'creative'
```

### Erreur: "Property 'content' does not exist on type 'string'"
```typescript
// CAUSE: Type ancien (string) au lieu de ConversationResponse
const response = await invoke<string>('conversation_generate', ...);
console.log(response.content); // ❌ response est string, pas object

// FIX: Utiliser bon type
const response = await invoke<ConversationResponse>('conversation_generate', ...);
console.log(response.content); // ✅
```

### Fallback: conversation_engine non disponible
```rust
// OMEGA v2 a un fallback automatique
// Si conversation_engine.rs n'est pas compilé ou crash:
// → basic_responder.rs prend le relais

// Vérifier les logs:
log::warn!("conversation_engine failed, using basic_responder");

// Fix: Activer conversation_engine dans Cargo.toml features
[features]
default = ["conversation-engine"]
conversation-engine = []
```

---

## ✅ Checklist Migration

### Frontend
- [ ] Importer `ConversationResponse` et `ConversationMode` depuis `@/types/conversation`
- [ ] Remplacer tous `invoke('chat_send_message', ...)` par `invoke('conversation_generate', ...)`
- [ ] Ajouter `conversationId` (généré ou persisté)
- [ ] Ajouter `mode` explicite (`coach`, `synthesis`, etc.)
- [ ] Adapter structure réponse (`response` → `response.content`)
- [ ] Tester avec Vitest: `pnpm run test`

### Backend
- [ ] Ajouter `#[deprecated]` à `chat_send_message`
- [ ] Ajouter `log::warn!()` dans `chat_send_message`
- [ ] (Optionnel) Rediriger `chat_send_message` → `conversation_generate` (transition douce)
- [ ] Vérifier `conversation_engine.rs` activé dans features
- [ ] Tester avec `cargo test`

### Tests E2E
- [ ] Migrer tous scénarios Playwright vers `conversation_generate`
- [ ] Ajouter `conversationId` unique par scénario
- [ ] Vérifier structure réponse (`response.content`, `response.mode`)
- [ ] Tester avec `pnpm run test:e2e`

### Documentation
- [ ] Mettre à jour README.md avec exemples OMEGA v2
- [ ] Ajouter commentaires dans code expliquant migration
- [ ] Documenter conversationId strategy (UUID vs feature-based)

### CI/CD
- [ ] Vérifier que tests passent après migration
- [ ] Ajouter lint rule bloquant `chat_send_message` (ESLint deprecated API)
- [ ] Planifier suppression `chat_send_message` (milestone v25.0.0)

---

## 📚 Ressources

- [ARCHITECTURE_RINGS.md](../ARCHITECTURE_RINGS.md) — Modèle 4 anneaux
- [src-tauri/src/omega/](../../src-tauri/src/omega/) — Code OMEGA v2
- [src/types/conversation.ts](../../src/types/conversation.ts) — Types OMEGA v2
- [CHANGELOG.md](../../CHANGELOG.md) — Historique versions

---

**Questions?** Ouvrir une issue GitHub ou consulter [docs/FAQ.md](../FAQ.md)

**Besoin d'aide?** Tag `@architecture-team` dans votre PR.

---

**Status:** ✅ OMEGA v2 tech-ready (dev) depuis v24.2.0  
**Deadline migration:** v25.0.0 (suppression chat_send_message)

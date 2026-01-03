# NEXT STEPS — Implémentation Backend & Tests

**Date:** 2025-01-03  
**État:** Phase 2 complétée (60%), Phase 3 à implémenter  
**Objectif:** Guider l'implémentation finale du provider GitHub Copilot

---

## 🎯 État Actuel: 60% Complete

### ✅ Complété (Phases 0-2)
- **Documentation:** 106KB (5 fichiers)
- **Architecture:** Types unifiés, interface AIProviderAdapter
- **Frontend:** Hooks, services, types mis à jour
- **UI Governance:** Carte GitHub Copilot ajoutée avec formulaire
- **Tests:** Stratégie définie

### ⏳ À Implémenter (Phases 3-6)
- **Backend Rust:** CopilotClient + Commands Tauri
- **Frontend Adapter:** copilot.ts
- **Chat Integration:** Provider selector + routing
- **Tests:** Unit + Integration + E2E

---

## 🚀 Plan d'Implémentation (Étapes Détaillées)

### STEP 1: Recherche API GitHub Copilot (30min) ⏱️ P0

**Objectif:** Confirmer endpoint exact et format authentification

**Actions:**
1. Rechercher documentation officielle:
   - https://docs.github.com/en/copilot
   - https://github.com/marketplace/models
   - https://docs.github.com/en/rest

2. Tester endpoint avec curl:
```bash
# Test 1: GitHub Models API
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://models.github.com/chat/completions \
     -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'

# Test 2: GitHub Copilot API
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
     https://api.github.com/copilot/chat/completions \
     -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'
```

3. Documenter findings:
   - Endpoint exact confirmé
   - Format requête/réponse
   - Headers requis
   - Scopes token nécessaires
   - Rate limits

**Mettre à jour:** `docs/ai/PROVIDER_COPILOT.md` section 2.1

---

### STEP 2: Implémenter Backend Rust (2h) ⏱️ P0

**Fichiers à créer/modifier:**

#### A. Créer `src-tauri/src/api_hub/copilot.rs`

**Source:** Copier code de `docs/ai/PROVIDER_COPILOT.md` section 3.1

**Actions:**
1. Copier le code complet (~250 lignes)
2. Adapter `COPILOT_API_BASE` avec endpoint confirmé à STEP 1
3. Ajuster format requête si nécessaire (selon findings STEP 1)

**Commandes:**
```bash
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY/src-tauri

# Créer le fichier
cat > src/api_hub/copilot.rs << 'EOF'
[COPIER LE CODE DE PROVIDER_COPILOT.md SECTION 3.1]
EOF

# Ajouter au mod.rs
echo "pub mod copilot;" >> src/api_hub/mod.rs
```

**Validation:**
```bash
cargo check --manifest-path=src-tauri/Cargo.toml
```

#### B. Créer `src-tauri/src/commands/copilot_commands.rs`

**Source:** Copier code de `docs/ai/PROVIDER_COPILOT.md` section 3.3

**Actions:**
1. Copier le code complet (~300 lignes)
2. S'assurer que les imports correspondent au projet

**Commandes:**
```bash
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY/src-tauri

# Créer le fichier
cat > src/commands/copilot_commands.rs << 'EOF'
[COPIER LE CODE DE PROVIDER_COPILOT.md SECTION 3.3]
EOF

# Ajouter au mod.rs
echo "pub mod copilot_commands;" >> src/commands/mod.rs
```

#### C. Modifier `src-tauri/src/security/secrets_engine.rs`

**Source:** `docs/ai/PROVIDER_COPILOT.md` section 3.2

**Actions:**
1. Ajouter constante `KEY_COPILOT`
2. Mettre à jour `get_provider_key()`
3. Mettre à jour `set_provider_key()`

**Patch à appliquer:**
```rust
// Ajouter après KEY_GEMINI
pub const KEY_COPILOT: &str = "copilot_api_key";

// Dans get_provider_key(), ajouter case:
"copilot" => KEY_COPILOT,

// Dans set_provider_key(), ajouter case:
"copilot" => KEY_COPILOT,
```

#### D. Modifier `src-tauri/src/main.rs`

**Actions:**
1. Importer les commands Copilot
2. Créer CopilotState
3. Enregistrer dans `.manage()`
4. Ajouter à `invoke_handler!`

**Patch à appliquer:**
```rust
// Imports
use crate::commands::copilot_commands::{
    chat_generate_copilot,
    chat_set_copilot_key,
    get_copilot_key_status,
    test_copilot_connection,
    CopilotState,
};

// Dans fn main(), après secrets_engine init:
let copilot_state = CopilotState {
    api_key: Arc::new(RwLock::new(None)),
    secrets_engine: secrets_engine.clone(),
};

// Dans Builder:
.manage(copilot_state)
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    chat_generate_copilot,
    chat_set_copilot_key,
    get_copilot_key_status,
    test_copilot_connection,
])
```

**Validation:**
```bash
cd src-tauri
cargo build
# Devrait compiler sans erreurs
```

**Tests unitaires:**
```bash
cargo test copilot
```

---

### STEP 3: Implémenter Frontend Adapter (1h) ⏱️ P1

**Fichier à créer:** `src/services/ai/providers/copilot.ts`

**Source:** Copier code de `docs/ai/PROVIDER_COPILOT.md` section 4.1

**Actions:**
1. Créer le fichier
2. Copier le code complet (~250 lignes)
3. Vérifier imports

**Commandes:**
```bash
cd /home/runner/work/TITANE_INFINITY/TITANE_INFINITY

cat > src/services/ai/providers/copilot.ts << 'EOF'
[COPIER LE CODE DE PROVIDER_COPILOT.md SECTION 4.1]
EOF
```

**Validation:**
```bash
# Vérifier imports
pnpm run lint src/services/ai/providers/copilot.ts

# Tests unitaires
pnpm run test src/services/ai/providers/copilot.test.ts
```

**Créer test:** `src/services/ai/providers/copilot.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { copilotAdapter, copilotProvider } from './copilot';

describe('Copilot Provider', () => {
  it('should have correct id', () => {
    expect(copilotAdapter.id).toBe('copilot');
  });

  it('should have correct capabilities', () => {
    expect(copilotAdapter.capabilities.textGeneration).toBe(true);
    expect(copilotAdapter.capabilities.codeGeneration).toBe(true);
  });

  it('should return default model', () => {
    expect(copilotAdapter.getDefaultModel()).toBe('gpt-4');
  });
});
```

---

### STEP 4: Intégrer Chat UI (1h) ⏱️ P1

**Fichiers à modifier:**

#### A. Mettre à jour provider selector

**Fichier:** `src/ui/pages/Chat.tsx` (ou similaire)

**Actions:**
1. Trouver le provider selector dropdown
2. Ajouter option "GitHub Copilot"

**Exemple:**
```tsx
<select value={selectedProvider} onChange={handleProviderChange}>
  <option value="auto">Auto</option>
  <option value="openai">OpenAI</option>
  <option value="anthropic">Anthropic Claude</option>
  <option value="gemini">Google Gemini</option>
  <option value="ollama">Ollama (Local)</option>
  <option value="copilot">GitHub Copilot</option> {/* NOUVEAU */}
</select>
```

#### B. Router vers Copilot adapter

**Fichier:** `src/hooks/useChat.ts`

**Actions:**
1. Importer `copilotProvider`
2. Ajouter case dans routing

**Patch:**
```typescript
import { copilotProvider } from '@/services/ai/providers/copilot';

// Dans sendMessage() ou équivalent:
let provider: AIProvider;
switch (preferredProvider) {
  case 'openai':
    provider = openaiProvider;
    break;
  case 'anthropic':
    provider = claudeProvider;
    break;
  case 'gemini':
    provider = geminiProvider;
    break;
  case 'copilot':
    provider = copilotProvider; // NOUVEAU
    break;
  // ... autres cases
}
```

---

### STEP 5: Tests Complets (2h) ⏱️ P1

#### A. Tests Unitaires Backend (30min)

**Fichier:** `src-tauri/tests/copilot_test.rs`

```rust
#[cfg(test)]
mod copilot_tests {
    use super::*;

    #[tokio::test]
    async fn test_copilot_client_creation() {
        let client = CopilotClient::new("test_key".to_string());
        assert!(client.is_ok());
    }

    #[tokio::test]
    async fn test_secrets_engine_copilot_key() {
        let engine = SecureSecretsEngine::new(Some("test_pass".to_string())).unwrap();
        engine.set_secret(KEY_COPILOT, "test_value").unwrap();
        let retrieved = engine.get_secret(KEY_COPILOT).unwrap();
        assert_eq!(retrieved, Some("test_value".to_string()));
    }
}
```

**Exécuter:**
```bash
cd src-tauri
cargo test copilot
```

#### B. Tests Unitaires Frontend (30min)

**Fichier:** `src/__tests__/services/ai/providers/copilot.test.ts`

```typescript
describe('Copilot Adapter', () => {
  it('should implement AIProviderAdapter', () => {
    expect(copilotAdapter).toHaveProperty('id');
    expect(copilotAdapter).toHaveProperty('capabilities');
    expect(copilotAdapter).toHaveProperty('testConnection');
    expect(copilotAdapter).toHaveProperty('listModels');
    expect(copilotAdapter).toHaveProperty('generate');
  });

  it('should handle errors gracefully', async () => {
    // Mock secureInvoke to fail
    vi.mock('@/lib/security', () => ({
      secureInvoke: vi.fn().mockRejectedValue(new Error('Network error')),
    }));

    await expect(copilotAdapter.generate('test')).rejects.toThrow();
  });
});
```

**Exécuter:**
```bash
pnpm run test copilot
```

#### C. Tests E2E Playwright (1h)

**Fichier:** `e2e/copilot-governance-chat.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('GitHub Copilot Integration', () => {
  test('should configure Copilot key in Governance', async ({ page }) => {
    await page.goto('/governance-center');
    await page.click('text=Secrets');
    
    // Trouver carte Copilot
    const copilotCard = page.locator('text=GitHub Copilot');
    await expect(copilotCard).toBeVisible();
    
    // Entrer clé
    await page.fill('input[placeholder*="token GitHub"]', 'ghp_test_key_12345678');
    await page.click('button:has-text("Sauvegarder")');
    
    // Vérifier succès
    await expect(page.locator('text=Clé Copilot sécurisée')).toBeVisible();
  });

  test('should send message with Copilot', async ({ page }) => {
    // Pré-requis: clé configurée
    await page.goto('/chat');
    
    // Sélectionner Copilot
    await page.selectOption('select[aria-label="Provider"]', 'copilot');
    
    // Envoyer message
    await page.fill('textarea', 'Explain async/await');
    await page.click('button:has-text("Envoyer")');
    
    // Vérifier réponse
    await expect(page.locator('text=Copilot')).toBeVisible({ timeout: 30000 });
  });
});
```

**Exécuter:**
```bash
npx playwright test e2e/copilot-governance-chat.spec.ts
```

---

### STEP 6: Documentation Finale (30min) ⏱️ P2

**Fichiers à créer/mettre à jour:**

#### A. Créer `docs/ai/CHAT_PROVIDER_ROUTING.md`

**Contenu:**
- Sequence diagram: User → Chat UI → useChat → copilotAdapter → Tauri → Backend
- Points d'extension
- Error handling flow
- Streaming support (si implémenté)

#### B. Créer `docs/ai/PROVIDERS_AUDIT_REPORT.md`

**Contenu:**
Tableau comparatif:

| Provider   | Key Mgmt | Test Conn | Models | Chat Routing | Streaming | Status |
|------------|----------|-----------|--------|--------------|-----------|--------|
| OpenAI     | ✅       | ✅        | ✅     | ✅           | ✅        | OK     |
| Anthropic  | ✅       | ✅        | ✅     | ✅           | ✅        | OK     |
| Gemini     | ✅       | ✅        | ✅     | ✅           | ✅        | OK     |
| Ollama     | N/A      | ✅        | ✅     | ✅           | ✅        | OK     |
| **Copilot**| ✅       | ✅        | ✅     | ✅           | ⏳        | **NEW**|

#### C. Mettre à jour README.md

Ajouter section:
```markdown
### GitHub Copilot Integration

TITANE∞ supporte GitHub Copilot comme provider IA.

**Configuration:**
1. Ouvrir Centre Gouvernance → Secrets
2. Carte "GitHub Copilot"
3. Générer token: https://github.com/settings/tokens
4. Scopes: `read:user`, `copilot`
5. Sauvegarder → Test connexion

**Utilisation:**
- Chat: Sélectionner "GitHub Copilot" dans le provider selector
- Modèles disponibles: GPT-4, GPT-3.5 Turbo
```

---

## 📊 Checklist Complétude

### Backend
- [ ] `copilot.rs` créé (250 lignes)
- [ ] `copilot_commands.rs` créé (300 lignes)
- [ ] `secrets_engine.rs` modifié (+5 lignes)
- [ ] `main.rs` modifié (+15 lignes)
- [ ] Compile: `cargo build` ✅
- [ ] Tests: `cargo test copilot` ✅

### Frontend
- [ ] `copilot.ts` créé (250 lignes)
- [ ] Tests: `pnpm run test copilot` ✅
- [ ] Lint: `pnpm run lint` ✅

### UI
- [x] Carte Copilot dans SecretsTab ✅ (déjà fait)
- [ ] Provider selector Chat mis à jour
- [ ] Test E2E: config key → send message → receive response ✅

### Documentation
- [ ] `CHAT_PROVIDER_ROUTING.md`
- [ ] `PROVIDERS_AUDIT_REPORT.md`
- [ ] README.md mis à jour
- [ ] PROVIDER_COPILOT.md finalisé (endpoint confirmé)

### Tests
- [ ] Unit tests backend ✅
- [ ] Unit tests frontend ✅
- [ ] Integration tests ✅
- [ ] E2E Playwright ✅
- [ ] Manual smoke test ✅

### Quality
- [ ] ESLint pass
- [ ] Cargo clippy pass
- [ ] Build production OK
- [ ] CodeQL scan OK

---

## 🐛 Troubleshooting

### Problème: Compilation Rust échoue

**Symptôme:**
```
error[E0432]: unresolved import `crate::api_hub::copilot`
```

**Solution:**
1. Vérifier que `copilot.rs` existe dans `src-tauri/src/api_hub/`
2. Vérifier `mod.rs` contient `pub mod copilot;`
3. `cargo clean && cargo build`

### Problème: Frontend ne trouve pas le module

**Symptôme:**
```
Cannot find module '@/services/ai/providers/copilot'
```

**Solution:**
1. Vérifier path import (alias `@` = `src/`)
2. Vérifier extension `.ts` présente
3. Redémarrer TypeScript server

### Problème: Test connexion échoue

**Symptôme:**
```
Erreur: Network error
```

**Solutions:**
1. Vérifier endpoint API (STEP 1)
2. Vérifier token GitHub valide
3. Vérifier scopes token
4. Logs backend: `tauri dev` console

### Problème: Clé non sauvegardée

**Symptôme:**
UI affiche "non configuré" après sauvegarde

**Solutions:**
1. Vérifier backend command enregistrée
2. Logs Tauri: permissions, encryption
3. Tester command directement: `secureInvoke('chat_set_copilot_key', ...)`

---

## 🎯 Objectif Final

**MVP Fonctionnel:**
- ✅ UI Governance: Sauvegarder clé Copilot
- ✅ Backend: Clé chiffrée, stockée, récupérable
- ✅ Test connexion: OK avec token valide
- ✅ Chat: Sélectionner Copilot → Envoyer message → Recevoir réponse
- ✅ Tests: Unit + Integration + E2E passent
- ✅ Docs: Complètes et à jour

**Temps estimé total:** ~6.5h
- STEP 1: 30min
- STEP 2: 2h
- STEP 3: 1h
- STEP 4: 1h
- STEP 5: 2h
- STEP 6: 30min

**Priorisation:**
- P0 (Bloquant): STEP 1, 2, 3
- P1 (Critique): STEP 4, 5
- P2 (Important): STEP 6

---

**Prochaine action:** Exécuter STEP 1 (Recherche API)

**Maintenu par:** TITANE∞ Development Team  
**Dernière mise à jour:** 2025-01-03

# 🤝 Contributing to TITANE∞

Bienvenue dans le projet **TITANE∞** — un OS cognitif vivant, 100% local-first, construit sur Tauri.

---

## 📜 Règles Absolues (Non-Négociables)

### 🔒 1. Tauri-Only Philosophy

**TITANE∞ est une application Tauri native, PAS une application web.**

- ✅ **Autorisé**: `tauri dev`, `tauri build`
- ❌ **Interdit**: `vite preview`, serveurs HTTP autonomes (Express, Koa, etc.)
- ❌ **Interdit**: Mode SPA standalone (Next.js, Create React App, Remix, Gatsby)

**Pourquoi ?**  
TITANE∞ doit fonctionner 100% offline, sans dépendance réseau. Le frontend React est servi PAR Tauri, jamais par un serveur HTTP externe.

**Validation**:

```bash
pnpm run verify  # Exécute enforce-tauri-only.sh
```

---

### 🏠 2. Local-First Principle

**Toutes les ressources doivent être embarquées localement.**

- ✅ **Autorisé**: Fonts locales, assets locaux, dépendances npm embarquées
- ❌ **Interdit**: Google Fonts CDN, CDN JavaScript (unpkg, jsdelivr, cdnjs)
- ⚠️ **Exception**: APIs IA externes (OpenAI, Gemini) doivent être annotées `// @network-allowed`

**Validation**:

```bash
pnpm run verify  # Exécute enforce-local-first.sh
```

---

### 🧠 3. OMEGA v2 Conversation Standard

**Toute conversation IA passe par `ConversationManager`.**

- ✅ **Autorisé**: `conversationManager.sendMessage()`, `sendAIMessage()`
- ❌ **Interdit**: `chat_send_message` (Tauri command legacy, @deprecated)

**Pourquoi ?**  
ConversationManager centralise:

- Multi-agents orchestration
- Memory persistence
- Context window management
- Streaming responses
- Tool invocation (function calling)

**Code Example**:

```typescript
import { sendAIMessage } from '@/services/ai/ConversationManager';

const response = await sendAIMessage('Hello TITANE∞', 'my-conversation-id');
console.log(response.content);
```

---

## 🏗️ Architecture 4-Ring Model

TITANE∞ respecte un modèle en **4 anneaux concentriques** (du plus critique au plus périphérique):

```
┌───────────────────────────────────────────────────────┐
│ Ring 0: CORE (Singularity, Kernel, State)            │
│  └─ Invariants critiques, immutabilité, sécurité     │
├───────────────────────────────────────────────────────┤
│ Ring 1: ENGINES (Identity, Expression, Presence)     │
│  └─ Moteurs cognitifs autonomes, isolation stricte   │
├───────────────────────────────────────────────────────┤
│ Ring 2: SERVICES (AI, Voice, Memory, Consistency)    │
│  └─ Services applicatifs, orchestration              │
├───────────────────────────────────────────────────────┤
│ Ring 3: OS INTERFACE (UI, Modules, Components)       │
│  └─ Interface utilisateur, React components          │
└───────────────────────────────────────────────────────┘
```

**Règles de dépendances**:

- ✅ Ring 3 → Ring 2 → Ring 1 → Ring 0 (flux descendant OK)
- ❌ Ring 0 → Ring 3 (flux inverse INTERDIT)

**Tests d'isolation**:

```bash
pnpm run test:architecture  # Vérifie les dépendances entre rings
```

---

## 🧪 Testing Requirements

### Tests obligatoires avant merge:

1. **Tests unitaires** (Ring 0-1-2):

   ```bash
   pnpm run test
   ```

2. **Tests d'architecture**:

   ```bash
   pnpm run test:architecture
   ```

3. **Tests de conformité**:

   ```bash
   pnpm run test:compliance
   ```

4. **Tests Rust (Tauri backend)**:

   ```bash
   cd src-tauri && cargo test
   ```

5. **Linting + Formatting**:
   ```bash
   pnpm run lint
   pnpm run format:check
   ```

### Coverage minimal:

- Ring 0 (Core): **90%+**
- Ring 1 (Engines): **80%+**
- Ring 2 (Services): **70%+**
- Ring 3 (UI): **60%+**

---

## 📝 Code Style

### TypeScript

- **Strict mode**: `"strict": true` activé
- **Naming**: PascalCase pour classes, camelCase pour fonctions/variables
- **Types**: Pas de `any`, utiliser `unknown` si type vraiment inconnu
- **Exports**: Exports nommés préférés aux default exports

**Example**:

```typescript
// ✅ Good
export class CognitiveKernel {
  private state: KernelState;

  constructor(config: KernelConfig) {
    this.state = this.initializeState(config);
  }
}

// ❌ Bad
export default class cognitive_kernel {
  state: any; // INTERDIT
}
```

### Rust

- **Ownership**: Respecter ownership rules strictement
- **Error handling**: Toujours utiliser `Result<T, E>`, jamais `panic!` en production
- **Tauri commands**: Tous les commands doivent être sécurisés (whitelist)

**Example**:

```rust
// ✅ Good
#[tauri::command]
pub fn secure_command(data: String) -> Result<String, String> {
    if !validate_input(&data) {
        return Err("Invalid input".to_string());
    }
    Ok(process_data(data))
}

// ❌ Bad
#[tauri::command]
pub fn insecure_command(data: String) -> String {
    process_data(data).unwrap() // INTERDIT (panic)
}
```

---

## 🔐 Security Guidelines

1. **Tauri Allowlist**: Tous les Tauri commands doivent être dans `allowlist` (src-tauri/tauri.conf.json)
2. **Content Security Policy**: Pas de `eval()`, inline scripts, ou `unsafe-inline`
3. **Secrets**: Jamais de hardcoded API keys (utiliser env variables)
4. **Input validation**: Toujours valider inputs côté Rust (backend)

---

## 🚀 Development Workflow

### 1. Créer une branche feature

```bash
git checkout -b feature/my-feature
```

### 2. Développer avec hot-reload

```bash
pnpm run dev  # Lance Tauri dev (Vite + Rust)
```

### 3. Tester rigoureusement

```bash
pnpm run verify  # Lint + format + tests + compliance
```

### 4. Commit avec message descriptif

```bash
git commit -m "feat(engines): Add neural prosody blending to voiceEngine"
```

**Format des commits** (Conventional Commits):

- `feat(scope):` Nouvelle feature
- `fix(scope):` Bug fix
- `docs(scope):` Documentation
- `refactor(scope):` Refactoring sans changement fonctionnel
- `test(scope):` Ajout de tests
- `chore(scope):` Maintenance (deps, scripts, etc.)

### 5. Pull Request

- Décrire le problème résolu
- Lister les changements majeurs
- Ajouter screenshots si UI
- S'assurer que `pnpm run verify` passe ✅

---

## 📚 Resources

- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Code Style**: [CODE_STYLE.md](CODE_STYLE.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Legacy Policy**: [legacy/README.md](legacy/README.md)

---

## 🌟 Philosophie TITANE∞

> "TITANE∞ n'est pas une application web. C'est un OS cognitif vivant, local-first, qui respecte l'autonomie et la vie privée de l'utilisateur."

**Principes fondateurs**:

- 🔒 **Tauri-only**: Pas de serveurs HTTP
- 🏠 **Local-first**: Toutes ressources embarquées
- 🧠 **OMEGA v2**: Conversation centralisée via ConversationManager
- 🏗️ **Architecture 4-Ring**: Isolation stricte des responsabilités
- 🧪 **Tests rigoureux**: 70%+ coverage, compliance validée
- 🔐 **Sécurité par défaut**: Whitelist, CSP, input validation

---

**Merci de contribuer à TITANE∞ avec rigueur et passion ! 🚀**

# 🤝 Contributing to TITANE∞

**Bienvenue !** Nous sommes ravis que vous souhaitiez contribuer à TITANE∞.

**Version:** v24.2.0  
**Mise à jour:** 15 décembre 2025

---

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Standards de Code](#standards-de-code)
4. [Documentation](#documentation)
5. [Tests](#tests)
6. [Process de Review](#process-de-review)
7. [Conventions Git](#conventions-git)

---

## 🌟 Code de Conduite

**Nous valorisons:**

- ✅ Respect mutuel et collaboration
- ✅ Feedback constructif et bienveillant
- ✅ Diversité des perspectives
- ✅ Apprentissage continu

**Nous refusons:**

- ❌ Harcèlement ou discrimination
- ❌ Commentaires destructifs
- ❌ Spam ou self-promotion

---

## 🚀 Comment Contribuer

### 1. Types de Contributions

**Code (Backend Rust):**

- Bug fixes (modules OMEGA, Memory, Singularity)
- Nouvelles features (cognitive engines, AI routing)
- Performance optimizations
- Security improvements

**Code (Frontend TypeScript/React):**

- UI/UX improvements
- Performance optimizations (rendering, state management)
- Accessibility features
- New components

**Documentation:**

- Corrections typos
- Nouveaux guides (troubleshooting, deployment)
- Amélioration exemples code
- Traductions (EN, ES, etc.)

**Tests:**

- Unit tests (Rust: `cargo test`, TypeScript: `npm test`)
- Integration tests (E2E avec Playwright)
- Performance benchmarks

---

### 2. Workflow Contribution

**Étape 1 — Fork & Clone:**

```bash
# Fork le repo via GitHub UI
git clone https://github.com/YOUR_USERNAME/TITANE_INFINITY.git
cd TITANE_INFINITY
git remote add upstream https://github.com/KallokTherok1994/TITANE_INFINITY.git
```

**Étape 2 — Créer Branche:**

```bash
# Sync avec MAIN
git checkout MAIN
git pull upstream MAIN

# Créer branche feature
git checkout -b feat/my-awesome-feature
# OU bug fix
git checkout -b fix/issue-123
# OU documentation
git checkout -b docs/improve-setup-guide
```

**Conventions nommage branches:**

- `feat/` — Nouvelle feature
- `fix/` — Bug fix
- `docs/` — Documentation
- `perf/` — Performance optimization
- `refactor/` — Code refactoring
- `test/` — Tests ajouts/corrections
- `chore/` — Maintenance (deps, config)

**Étape 3 — Développer:**

```bash
# Installer dépendances
npm install
cd src-tauri && cargo build

# Développer feature
npm run dev  # Frontend Vite dev server
cargo run    # Backend Tauri (dans src-tauri/)

# Tests réguliers
npm test
cargo test
```

**Étape 4 — Commit:**

```bash
# Suivre convention Conventional Commits
git add .
git commit -m "feat(omega): add streaming support for embeddings"

# OU
git commit -m "fix(memory): resolve STM cache overflow issue #123"
```

**Étape 5 — Push & PR:**

```bash
# Push branche
git push origin feat/my-awesome-feature

# Créer Pull Request via GitHub UI
# Remplir template PR (description, tests, breaking changes)
```

---

## 🛠️ Standards de Code

### Backend (Rust)

**Style:**

- **Rustfmt** — `cargo fmt` (auto-formatting)
- **Clippy** — `cargo clippy` (linting)
- **Conventions** — Suivre [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)

**Exemple:**

```rust
// ✅ BON
pub struct VectorStore {
    db: Arc<RwLock<Database>>,
    config: VectorStoreConfig,
}

impl VectorStore {
    /// Creates a new VectorStore instance
    pub fn new(config: VectorStoreConfig) -> Result<Self> {
        // Implementation
    }

    /// Inserts a vector entry
    pub async fn insert(&self, entry: VectorEntry) -> Result<String> {
        // Implementation
    }
}

// ❌ MAUVAIS
pub fn InsertVector(db:Database,vector:Vec<f32>)->String {
    // Pas de snake_case, pas de types précis, pas de Result
}
```

**Tests:**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_vector_store_insert() {
        let config = VectorStoreConfig::default();
        let store = VectorStore::new(config).unwrap();

        let entry = VectorEntry {
            id: "test-1".to_string(),
            embedding: vec![0.1, 0.2, 0.3],
            metadata: HashMap::new(),
        };

        let result = store.insert(entry).await;
        assert!(result.is_ok());
    }
}
```

---

### Frontend (TypeScript/React)

**Style:**

- **ESLint** — `npm run lint` (linting)
- **Prettier** — Auto-formatting (VSCode extension)
- **TypeScript Strict** — Pas de `any`, types explicites

**Exemple:**

```typescript
// ✅ BON
interface ChatMessage {
  id: string;
  content: string;
  timestamp: number;
  role: 'user' | 'assistant';
}

const ChatWindow: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
  const [input, setInput] = useState<string>('');

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  }, [input]);

  return (
    <div className="chat-window">
      {messages.map(msg => (
        <Message key={msg.id} {...msg} />
      ))}
    </div>
  );
};

// ❌ MAUVAIS
const ChatWindow = (props: any) => {
  // Pas de types, pas de memoization, pas de validation
  return <div>{props.messages}</div>;
};
```

**Tests:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';

describe('ChatWindow', () => {
  it('renders messages correctly', () => {
    const messages = [
      { id: '1', content: 'Hello', timestamp: Date.now(), role: 'user' }
    ];

    render(<ChatWindow messages={messages} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

---

## 📚 Documentation

### Contribuer Documentation

**Types de docs:**

1. **Modules API** — `docs/05_modules/backend/` ou `frontend/`
2. **Guides** — `docs/04_guides/` (quickstart, development, features, advanced)
3. **Architecture** — `docs/02_ARCHITECTURE/` (flows, pipelines)

**Template Module (docs/05_modules/):**

```markdown
# MODULE_NAME.md

**Module Path:** `src-tauri/src/...` ou `src/services/...`  
**Description:** Brief description  
**Responsibility:** What this module does

## 📋 Module Overview

**Purpose:**

- Responsibility 1
- Responsibility 2

**Key Components:**

- Component 1 (path)
- Component 2 (path)

## 🏗️ Architecture

[Flow diagram or architecture description]

## 🔧 API Reference

### Backend (Rust)

\`\`\`rust
pub struct ModuleName {
// Fields
}

impl ModuleName {
pub fn new() -> Self { }
pub fn method_name(&self) -> Result<T> { }
}
\`\`\`

### Frontend (TypeScript)

\`\`\`typescript
interface ModuleConfig { }
class ModuleName { }
\`\`\`

## 💾 Data Structures

## 🧪 Testing

## ⚡ Performance

## 🔗 Integrations

## 📚 Cross-References
```

**Principes Documentation:**

- ✅ **Factualité FIRST** — Code réel v24.2.0 (pas d'intentions)
- ✅ **Code examples validés** — Compilent + executent
- ✅ **Cross-references** — Module ↔ module, module ↔ architecture
- ✅ **Clarity** — Exemples pratiques, diagrammes flows

**Voir:** [docs/00_core/DOCUMENTATION_EXECUTIVE_SUMMARY.md](docs/00_core/DOCUMENTATION_EXECUTIVE_SUMMARY.md) pour guidelines complètes

---

## 🧪 Tests

### Backend Tests (Rust)

**Commandes:**

```bash
# Run all tests
cargo test

# Run specific module
cargo test omega::

# Run with output
cargo test -- --nocapture

# Run benchmarks
cargo bench
```

**Coverage minimale:**

- ✅ **Unit tests** — Chaque fonction publique testée
- ✅ **Integration tests** — Cross-module interactions
- ✅ **Performance tests** — Benchmarks critiques (OMEGA, Memory)

---

### Frontend Tests (TypeScript)

**Commandes:**

```bash
# Run all tests
npm test

# Run specific test file
npm test ChatWindow

# Coverage report
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e
```

**Coverage minimale:**

- ✅ **Component tests** — Rendering, props, events
- ✅ **Hook tests** — Custom hooks logic
- ✅ **Integration tests** — Tauri commands integration
- ✅ **E2E tests** — Critical user flows

---

## 🔍 Process de Review

### Pull Request Checklist

**Avant PR:**

- [ ] Code compile sans erreurs (`cargo build` + `npm run build`)
- [ ] Tests passent (`cargo test` + `npm test`)
- [ ] Linting OK (`cargo clippy` + `npm run lint`)
- [ ] Documentation mise à jour (si API change)
- [ ] CHANGELOG.md mis à jour (si feature majeure)

**Template PR:**

```markdown
## 📝 Description

[Describe votre changement]

## 🎯 Motivation

[Pourquoi ce changement est nécessaire]

## 🧪 Tests

- [ ] Unit tests ajoutés
- [ ] Integration tests ajoutés
- [ ] Tests manuels effectués

## 📸 Screenshots (si UI)

[Ajouter screenshots si changement UI]

## ⚠️ Breaking Changes

[Lister breaking changes si applicable]

## 📚 Documentation

- [ ] README.md mis à jour
- [ ] Module docs mis à jour
- [ ] CHANGELOG.md mis à jour
```

**Review Process:**

1. **Automated checks** — CI/CD (tests, linting)
2. **Code review** — 2 maintainers minimum
3. **Manual testing** — Reviewer teste feature localement
4. **Approval** — 2 approvals requis
5. **Merge** — Squash merge vers MAIN

---

## 📝 Conventions Git

### Commit Messages (Conventional Commits)

**Format:**

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat` — Nouvelle feature
- `fix` — Bug fix
- `docs` — Documentation only
- `style` — Formatting (no code change)
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `test` — Tests ajouts/corrections
- `chore` — Maintenance (deps, config)
- `ci` — CI/CD changes

**Scopes (exemples):**

- `omega` — OMEGA pipeline
- `memory` — UnifiedMemory
- `singularity` — Singularity module
- `chat` — ChatEngine
- `ui` — Frontend UI
- `tauri` — Tauri backend
- `docs` — Documentation

**Exemples:**

```bash
# Feature
git commit -m "feat(omega): add streaming embeddings support"

# Bug fix
git commit -m "fix(memory): resolve STM cache overflow #123"

# Documentation
git commit -m "docs(modules): add VECTOR_STORE.md API reference"

# Performance
git commit -m "perf(singularity): optimize cognitive state updates"

# Breaking change
git commit -m "feat(api)!: change AI router cascade logic

BREAKING CHANGE: ai_router_config now requires explicit provider order"
```

---

## 🏗️ Architecture Contribution Guidelines

### Avant Changement Architecture

**1. Lire documentation architecture:**

- [docs/00_core/DOCUMENTATION_EXECUTIVE_SUMMARY.md](docs/00_core/DOCUMENTATION_EXECUTIVE_SUMMARY.md)
- [docs/05_modules/INDEX.md](docs/05_modules/INDEX.md) — Modules dependencies
- [docs/02_ARCHITECTURE/DATA_FLOW_CHAT.md](docs/02_ARCHITECTURE/DATA_FLOW_CHAT.md)

**2. Vérifier impact cross-module:**

```bash
# Chercher usages fonction/struct
grep -r "VectorStore" src-tauri/src/
grep -r "VectorStore" src/

# Voir tests existants
cargo test vector_store::
```

**3. Proposer RFC (Request for Comments):**

- Créer GitHub Issue avec label `rfc`
- Décrire changement proposé
- Impact cross-module
- Alternatives considérées
- Plan migration si breaking change

---

## 🎯 Domaines Prioritaires (Contributeurs Recherchés)

### Backend (Rust)

**High Priority:**

- 🔴 **Performance optimizations** — OMEGA pipeline (<100ms target)
- 🔴 **Vector Store HNSW** — Replace linear search avec HNSW (>10K vectors)
- 🟡 **Memory persistence** — PostgreSQL backend option
- 🟡 **AI Router caching** — LRU cache improvements

**Medium Priority:**

- 🟢 **Observability** — Tracing, metrics (OpenTelemetry)
- 🟢 **Security** — Auth improvements, rate limiting
- 🟢 **Testing** — Increase coverage (target >80%)

---

### Frontend (TypeScript/React)

**High Priority:**

- 🔴 **Performance** — Render optimizations (React.memo, useMemo)
- 🔴 **Accessibility** — WCAG 2.1 AA compliance
- 🟡 **Mobile responsive** — Adaptive layouts
- 🟡 **Offline support** — Service workers, IndexedDB

**Medium Priority:**

- 🟢 **Theming** — Dark/Light mode improvements
- 🟢 **i18n** — Internationalization (EN, ES, DE)
- 🟢 **Testing** — E2E coverage increase

---

### Documentation

**High Priority:**

- 🔴 **EN Translations** — 14 modules core (Phase 8)
- 🟡 **Advanced guides** — Deployment, monitoring, troubleshooting
- 🟡 **Video tutorials** — Top 5 modules complexes

**Medium Priority:**

- 🟢 **Interactive diagrams** — Mermaid live
- 🟢 **Code playgrounds** — REPL integration
- 🟢 **Auto-generation** — Rustdoc + TypeDoc sync (Phase 10)

---

## 📞 Support & Questions

**Questions contribution?**

- 💬 **GitHub Discussions** — [Lien discussions](https://github.com/KallokTherok1994/TITANE_INFINITY/discussions)
- 🐛 **GitHub Issues** — [Lien issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)
- 📧 **Email Team** — dev@titane-infinity.ai (fictif)

**Resources:**

- 📚 [Documentation Executive Summary](docs/00_core/DOCUMENTATION_EXECUTIVE_SUMMARY.md)
- 📖 [Developer Guide](DEVELOPER_GUIDE.md)
- 🏗️ [Architecture](docs/02_ARCHITECTURE/)
- 🔧 [Modules API](docs/05_modules/)

---

## 🎉 Reconnaissance Contributeurs

**Hall of Fame** visible dans [README.md](README.md) section Contributors.

**Niveaux contributeurs:**

- 🥉 **Bronze** — 1-5 PRs merged
- 🥈 **Silver** — 6-15 PRs merged
- 🥇 **Gold** — 16+ PRs merged
- 💎 **Diamond** — Core maintainer

**Rewards:**

- ✅ Nom dans README.md
- ✅ Badge Discord (si applicable)
- ✅ Invitation équipe core (Diamond level)

---

## 📜 Licence

**En contribuant à TITANE∞, vous acceptez que vos contributions soient licenciées sous la même licence que le projet.**

Voir [LICENSE.md](LICENSE.md) pour détails.

---

## ✨ Merci !

**Votre contribution rend TITANE∞ meilleur pour tous.** 🙏

Que vous corrigiez un typo, ajoutiez une feature majeure, ou amélioriez la documentation — **chaque contribution compte**.

**Happy coding!** 🚀🧠⚡

---

**Document généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Team

---

_Contributing Guide — Build the Future Together_ 🔮

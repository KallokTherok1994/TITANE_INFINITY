# 🚀 TITANE∞ — Guide de Contribution v24.2.0

**Bienvenue contributeur !** Ce guide vous accompagne pour contribuer efficacement au projet TITANE∞.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Setup Environnement](#setup-environnement)
3. [Workflow de Développement](#workflow-de-développement)
4. [Standards de Code](#standards-de-code)
5. [Tests](#tests)
6. [Pull Requests](#pull-requests)
7. [Architecture](#architecture)

---

## ✅ Prérequis

### Systèmes Supportés

- **Linux** : Ubuntu 24.04 LTS (recommandé)
- **macOS** : 13+ (Ventura+)
- **Windows** : WSL2 Ubuntu 24.04

### Outils Requis

```bash
# Node.js & Package Manager
node >= 20.0.0
pnpm >= 9.0.0

# Rust & Tauri
rustc >= 1.70.0
cargo >= 1.70.0
tauri-cli >= 2.0.0

# Git
git >= 2.40.0
```

### Vérification

```bash
./scripts/verify/check-prerequisites.sh
```

---

## 🔧 Setup Environnement

### 1. Clone du Repository

```bash
git clone https://github.com/KallokTherok1994/TITANE_INFINITY.git
cd TITANE_INFINITY
```

### 2. Installation des Dépendances

```bash
# Frontend (React + TypeScript)
pnpm install

# Backend (Rust + Tauri)
cd src-tauri
cargo build
cd ..
```

### 3. Configuration Environnement

```bash
# Copier .env.example
cp .env.example .env

# Configurer variables (optionnel)
nano .env
```

### 4. Vérification Build

```bash
# Build complet
pnpm build

# Tests
pnpm test

# Linting
pnpm lint
```

---

## 🔄 Workflow de Développement

### Structure des Branches

```
MAIN
├── dev (développement actif)
│   ├── feature/nom-feature (nouvelles features)
│   ├── fix/nom-bug (corrections bugs)
│   └── refactor/nom-refactor (refactoring)
└── stable-runtime (production utilisateur)
```

### Créer une Feature Branch

```bash
# Depuis dev
git checkout dev
git pull origin dev

# Créer feature branch
git checkout -b feature/ma-nouvelle-feature

# Ou via script
./scripts/git/new-feature.sh ma-nouvelle-feature
```

### Développement avec Titan-Dev

```bash
# Lancer environnement dev
./runtime/dev/run-dev.sh

# Pendant le développement:
# - Modifier code dans VS Code
# - Ctrl+R dans Titan-Dev pour reload React
# - F12 pour DevTools
# - Consulter logs: runtime/dev/logs/
```

### Commits

**Format** : [Conventional Commits](https://www.conventionalcommits.org/)

```bash
# Types de commits
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
refactor: Refactoring (pas de changement fonctionnel)
docs:     Documentation
test:     Tests
chore:    Maintenance (deps, config)
perf:     Performance
style:    Formatage code

# Exemples
git commit -m "feat(chat): ajouter support streaming GPT-4"
git commit -m "fix(memory): corriger fuite mémoire STM"
git commit -m "docs(omega): documenter pipeline v2"
```

### Pre-commit Hooks

Le projet utilise `husky` pour validation automatique :

- ✅ ESLint (pas d'erreurs)
- ✅ Prettier (formatage)
- ✅ TypeScript (pas d'erreurs compilation)
- ✅ Tests unitaires (passent)

---

## 📐 Standards de Code

### TypeScript

**Style Guide** : [CODE_STYLE.md](CODE_STYLE.md)

```typescript
// ✅ BON
export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  importance: number;
}

export async function storeMemory(entry: MemoryEntry): Promise<void> {
  await invokeTauriCommand('memory_store', { entry });
}

// ❌ MAUVAIS
export function storeMemory(entry) {
  // Pas de types
  return invokeTauriCommand('memory_store', { entry }); // Pas async/await
}
```

### Rust

**Conventions** :

- Snake_case pour variables/fonctions
- PascalCase pour types/structs
- SCREAMING_SNAKE_CASE pour constantes

```rust
// ✅ BON
#[derive(Debug, Clone, Serialize)]
pub struct MemoryEntry {
    pub id: String,
    pub content: String,
    pub importance: f32,
}

#[tauri::command]
pub async fn memory_store(entry: MemoryEntry) -> Result<(), String> {
    // Implementation
    Ok(())
}
```

### Sécurité

**CRITICAL** : Toujours utiliser `secureInvoke()` :

```typescript
// ✅ BON - Avec validation sécurité
import { secureInvoke } from '@/lib/security';

const result = await secureInvoke('chat_send_message', { message });

// ❌ INTERDIT - Direct invoke bypass sécurité
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('chat_send_message', { message });
```

---

## 🧪 Tests

### Exécuter les Tests

```bash
# Tests unitaires (Vitest)
pnpm test

# Tests E2E (Playwright)
pnpm test:e2e

# Tests Rust
cd src-tauri && cargo test

# Tous les tests
pnpm test:all

# Coverage
pnpm test:coverage
```

### Écrire des Tests

**Frontend** (`*.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { unifiedMemory } from '@/engines/memory';

describe('UnifiedMemoryEngine', () => {
  it('should store and recall memory', async () => {
    const id = await unifiedMemory.store('Test content');
    const memories = await unifiedMemory.recall('Test');

    expect(memories).toHaveLength(1);
    expect(memories[0].content).toBe('Test content');
  });
});
```

**Backend** (Rust):

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_memory_store() {
        let entry = MemoryEntry {
            id: "test".to_string(),
            content: "Test".to_string(),
            importance: 0.8,
        };

        let result = memory_store(entry).await;
        assert!(result.is_ok());
    }
}
```

---

## 🔀 Pull Requests

### Avant de Soumettre

**Checklist** :

- [ ] Code formaté (`pnpm format`)
- [ ] Pas d'erreurs linting (`pnpm lint`)
- [ ] Pas d'erreurs TypeScript (`pnpm check`)
- [ ] Tous tests passent (`pnpm test:all`)
- [ ] Documentation mise à jour (si nécessaire)
- [ ] Commits suivent convention
- [ ] Branch à jour avec `dev`

### Template PR

```markdown
## Description

[Description claire de la fonctionnalité/fix]

## Type de Changement

- [ ] 🆕 Feature (nouvelle fonctionnalité)
- [ ] 🐛 Fix (correction bug)
- [ ] 📚 Documentation
- [ ] ⚡ Performance
- [ ] ♻️ Refactoring

## Tests

- [ ] Tests unitaires ajoutés/modifiés
- [ ] Tests E2E ajoutés/modifiés
- [ ] Testé manuellement dans Titan-Dev

## Screenshots

[Si changement UI]

## Checklist

- [ ] Code review self-performed
- [ ] Pas de breaking changes
- [ ] Documentation à jour
```

### Processus de Review

1. **Automated Checks** : CI/CD valide build + tests
2. **Code Review** : 1+ reviewer approuve
3. **Testing** : Validation fonctionnelle
4. **Merge** : Squash merge vers `dev`

---

## 🏗️ Architecture

### Structure du Projet

```
TITANE_INFINITY/
├── src/                    # Frontend React + TypeScript
│   ├── engines/            # 14 moteurs cognitifs
│   ├── services/           # Services (Tauri bridge, etc.)
│   ├── components/         # Composants UI
│   └── pages/              # Pages routes
│
├── src-tauri/              # Backend Rust + Tauri
│   ├── src/
│   │   ├── omega/          # Pipeline OMEGA v2
│   │   ├── memory/         # UnifiedMemory OS
│   │   ├── singularity/    # Singularity State
│   │   └── commands/       # Tauri commands
│   └── Cargo.toml
│
├── runtime/
│   ├── dev/                # Titan-Dev (environnement dev)
│   └── stable/             # Titan-Stable (production)
│
├── docs/                   # Documentation
│   ├── 01_architecture/    # Architecture technique
│   └── 99_ARCHIVE/         # Archives
│
└── scripts/                # Scripts utilitaires
```

### Composants Clés

**Frontend** :

- `tauriBridge.ts` : Hub central 100+ commandes Tauri
- `UnifiedMemoryEngine.ts` : Mémoire STM/MTM/LTM
- Cognitive Engines : 14 moteurs de raisonnement

**Backend** :

- `omega/pipeline.rs` : Pipeline 4-stage (Router → Executor → Merger → Guardrails)
- `memory/unified_memory.rs` : Système mémoire 3-tier
- `overdrive/chat_orchestrator.rs` : Multi-provider AI (OpenAI, Claude, Gemini, Ollama)

### Documentation Technique

- [ARCHITECTURE_CURRENT_v24.md](docs/01_architecture/ARCHITECTURE_CURRENT_v24.md)
- [OMEGA_PIPELINE_DETAILED.md](docs/01_architecture/OMEGA_PIPELINE_DETAILED.md)
- [GLOSSARY.md](docs/00_core/GLOSSARY.md)

---

## 🆘 Besoin d'Aide ?

- **Issues** : [GitHub Issues](https://github.com/KallokTherok1994/TITANE_INFINITY/issues)
- **Discussions** : [GitHub Discussions](https://github.com/KallokTherok1994/TITANE_INFINITY/discussions)
- **Email** : [Voir LICENSE.md pour contact]

---

## 📜 License

Voir [LICENSE.md](LICENSE.md) pour détails.

---

**Merci de contribuer à TITANE∞ ! 🚀**

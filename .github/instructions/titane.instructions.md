# TITANE_INFINITY — Instructions Globales

## Vision

Assistant IA local-first, privacy-first, cognitif.

## Stack

- React 18 + Vite 6 + TypeScript
- Tauri v2 + Rust async
- Zustand state
- Vitest + cargo test

## Architecture 9 Moteurs

1. Orchestrator
2. Style Engine
3. CoherenceEngine
4. Reflection Engine
5. Emotion Engine
6. UnifiedMemory
7. Behavior Engine
8. Adaptation Engine
9. SystemHealth

**Architecture DÉFINITIVE.**

## Conventions

### Rust

- async/await obligatoire
- Result<T, E>
- ZERO unwrap()
- Tests unitaires

### TypeScript

- Strict mode
- Types explicites
- ZERO any
- try/catch
- Composants purs

## Communication

IPC Tauri uniquement.

## Commits

```
<type>(<scope>): <desc>

- Point 1

Task: <id>
```

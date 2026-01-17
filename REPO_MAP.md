# REPO MAP - TITANE∞ v26.3.0

**Architecture :** 4-Ring stricte (Types → Engines → Services → Modules/UI)

## 🏗️ STRUCTURE GÉNÉRALE

```
TITANE_INFINITY/
├── src/                    # Frontend TypeScript/React (Ring 4)
├── src-tauri/              # Backend Rust/Tauri (Rings 1-3)
├── docs/                   # Documentation
├── scripts/                # Scripts d'automatisation
├── tests/                  # Tests unitaires/intégration
├── runtime/                # Configuration runtime
├── _archive/               # Archive gouvernée
└── [config files]          # Fichiers de configuration
```

## 🎯 RING 1 - TYPES (src-tauri/src/types/)

### Core Types
- `error.rs` - Types d'erreur
- `state.rs` - Types d'état système
- `system_state.rs` - État système complet

### AI Types
- `ai/types.rs` - Types IA génériques
- `cognitive/types.rs` - Types cognitifs
- `memory/types.rs` - Types mémoire

## ⚙️ RING 2 - ENGINES (src-tauri/src/engines/)

### AI Engines
- `ai/` - Moteurs IA (GLM46V, Ollama, etc.)
- `cognitive/` - Moteurs cognitifs
- `evolution/` - Moteurs d'évolution
- `hypervision/` - Moteurs hypervision

### Core Engines
- `memory/` - Moteurs mémoire
- `singularity/` - Moteurs singularité
- `security/` - Moteurs sécurité
- `performance/` - Moteurs performance

### Communication Engines
- `chat_engine/` - Moteur chat
- `audio/` - Moteurs audio (VAD, TTS, Whisper)
- `multimodal/` - Fusion multimodale

## 🔧 RING 3 - SERVICES (src-tauri/src/services/)

### System Services
- `persistence/` - Services persistance
- `monitoring/` - Services monitoring
- `selfheal/` - Services auto-guérison
- `updates/` - Services mises à jour

### AI Services
- `agents/` - Services agents
- `knowledge/` - Services connaissance
- `orchestration/` - Services orchestration

## 🎨 RING 4 - MODULES/UI (src/)

### UI Modules
- `components/` - Composants React
- `pages/` - Pages applicatives
- `layouts/` - Layouts UI

### Logic Modules
- `hooks/` - Hooks React personnalisés
- `services/` - Services frontend
- `stores/` - Stores d'état (Zustand)
- `utils/` - Utilitaires frontend

### Configuration
- `config/` - Configuration applicative
- `types/` - Types TypeScript
- `constants/` - Constantes

## 📊 MÉTRIQUES STRUCTURELLES

### Répartition par Ring
- Ring 1 (Types) : ~50 fichiers Rust
- Ring 2 (Engines) : ~200 fichiers Rust
- Ring 3 (Services) : ~80 fichiers Rust
- Ring 4 (UI) : ~300 fichiers TypeScript/React

### Langages
- Rust : ~330 fichiers (src-tauri/)
- TypeScript : ~280 fichiers (src/)
- JavaScript : ~20 fichiers (scripts/)
- Configuration : ~50 fichiers (JSON, YAML, etc.)

### Tests
- Tests Rust : ~15 fichiers (src-tauri/tests/)
- Tests TypeScript : ~50 fichiers (src/__tests__/, tests/)
- Tests E2E : ~10 fichiers (tests/e2e/)

## 🔗 DÉPENDANCES CROISÉES

### Frontend → Backend
- IPC via Tauri commands
- Contrat défini dans `src/lib/ipc.ts`
- Allowlist dans `src-tauri/allowlist.whitelist.stable.json`

### Backend → Frontend
- Événements Tauri
- State synchronization
- File system access (scoped)

## 📁 DOSSIERS SPÉCIALISÉS

### Documentation
- `docs/` - Documentation complète (~150 fichiers)
- `docs/_evidence/` - Évidences automatiques
- `docs/capabilities/` - Documentation capacités

### Scripts
- `scripts/` - Scripts d'automatisation (~100 fichiers)
- `scripts/security/` - Scripts sécurité
- `scripts/build/` - Scripts build
- `scripts/verify/` - Scripts vérification

### Runtime
- `runtime/` - Configuration runtime
- `runtime/dev/` - Config développement
- `runtime/stable/` - Config production

### Tests
- `tests/` - Tests organisés par phase
- `src/__tests__/` - Tests composants
- `src-tauri/tests/` - Tests backend

## 🚨 POINTS CRITIQUES

### Sécurité
- `src-tauri/src/security/` - Module sécurité
- `scripts/security/` - Scripts sécurité
- Permissions Tauri strictes

### Performance
- Lazy loading implémenté
- Memory pooling
- Optimisations build

### Observabilité
- Logging standardisé
- Monitoring intégré
- Diagnostics automatiques

## ✅ COMPLIANCE ARCHITECTURALE

- ✅ Séparation 4-Ring respectée
- ✅ Tauri-only (pas de serveur)
- ✅ Local-first absolu
- ✅ Allowlist minimale
- ✅ Build reproductible

**Mise à jour :** Structure validée pour v26.3.0

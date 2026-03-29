# BOOTSTRAP RESULTS

## Git State

- **HEAD**: e88264039
- **Branch**: MAIN
- **Working tree**: ~25 modified files (Rust mostly)
- **Untracked**: .claude/, proof, proof_p (staging artifacts)

## Repo Structure

- TS/TSX files: 1,581
- Rust files: 961
- AI Providers: 9 (claude, copilot, fallback, gemini, glm46v, ollama, openai, tauriChat, titaneLocal)
- Conversation Engine modules: 20 Rust files in src-tauri/src/conversation_engine/
- Tauri commands: 73 .rs files in src-tauri/src/commands/
- CI workflows: 33+ in .github/workflows/
- Release seals: 16 (v27.0.3 through v28.88.0)
- Proof packs: 15+ existing

## Version Surfaces Checked

| Surface | Version Claim | Status |
|---|---|---|
| package.json | 28.88.0 | CANONICAL |
| src-tauri/Cargo.toml | 28.88.0 | CANONICAL |
| src-tauri/tauri.conf.json | 28.88.0 | CANONICAL |
| src/App.tsx header | v28.88.0 | CANONICAL |
| src/services/ai/orchestrator.ts | v37.0.0 | DRIFT (fixed) |
| src/services/conversationEngine.ts | v∞ | DRIFT (fixed) |
| RELEASE_v28.88.0_SEALED.txt | v28.88.0 | CANONICAL |

## Dependencies

### package.json
- 31 production dependencies
- 68 devDependencies
- 140+ npm scripts
- Key deps: react, zustand, react-router-dom, framer-motion, recharts, zod, three, @xenova/transformers

### Cargo.toml
- 40+ Rust dependencies
- Features: custom-protocol, mock, full, ollama, audio-capture, onnx
- Key deps: tauri 2.0, tokio 1.35, serde 1.0, reqwest 0.11, rusqlite 0.37, hnsw_rs 0.3

## Suspected Authority Baseline

Canonical version: 28.88.0 (from package.json, Cargo.toml, tauri.conf.json, App.tsx, release seals)

## Current Single Biggest Risk

AUTHORITY_DRIFT_CONFIRMED in core services (orchestrator.ts v37.0.0, conversationEngine.ts v∞)

## Next Action

Patch authority realignment (completed)
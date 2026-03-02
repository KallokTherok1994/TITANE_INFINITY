# OMEGA SCOPE MAP

## Rings / Surfaces
- Ring1 Types: src/types/**, src/constants/**
- Ring2 Engines: src/engines/**, src/core/** (pure segments to verify)
- Ring3 Services: src/services/**
- Ring4 UI/OS: src/** (components/hooks/pages), src-tauri/**

## Boot / Ready Points
- UI boot: src/main.tsx, src/App.tsx
- Chat state machine: src/hooks/useChat.ts
- IPC canonical client: src/lib/tauriClient.ts, src/lib/serviceInvoker.ts
- Backend bootstrap: src-tauri/src/main.rs

## Orchestrator / Providers
- Orchestrator: src/services/ai/orchestrator.ts
- Providers: src/services/ai/providers/*.ts
- Fallback/local: src/services/ai/providers/fallback.ts, titaneLocal.ts, ollama.ts

## Tauri configs/capabilities
- Config: src-tauri/tauri.conf.json, src-tauri/tauri.base.json
- Capabilities: src-tauri/capabilities/*.json

## Critical Commands
- canonical_prod_build: pnpm run build:production
- tests: runTests(mode=run)

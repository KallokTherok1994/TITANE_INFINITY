# UI Index

Last Updated: 2026-02-09

UI registry: every UI change requires an append-only entry in [registry/ui-events.jsonl](../../registry/ui-events.jsonl).

## Entry Points
- src/main.tsx (UI bootstrap)
- src/App.tsx (routing + shell)

## Pages (src/pages)
- AdaptiveEngine.tsx
- AgendaPage.tsx
- CameraPage.tsx
- ChatPage.tsx
- CognitivePage.tsx
- ConfigurationHub.tsx
- DashboardPage.tsx
- DesignSystemPage.tsx
- DevPage.tsx
- DevTools.tsx
- EvoPage.tsx
- EvolutionCenterPage.tsx
- Experience.tsx
- Harmonia.tsx
- Helios.tsx
- Memory.tsx
- MonitoringDashboard.tsx
- Nexus.tsx
- OrchestrationMetaCenter.tsx
- PerformanceTest.tsx
- ProgressionPage.tsx
- SecureSettings.tsx
- SelfHeal.tsx
- Sentinel.tsx
- Settings.tsx
- Stats.tsx
- TimeNavigator.tsx
- TimePage.tsx
- TitanePage.tsx
- Watchdog.tsx

## Features (src/features)
- admin/
- audio-center/
- chat/
- cognitive/
- conversation/
- dashboard/
- design-center/
- developer-mode/
- evolution/
- governance-center/
- identity/
- kernel/
- memory/
- menu-editor/
- meta-dashboard/
- one-core/
- progression/
- qa-monitoring/
- system-center/
- transformation/
- vision/

## Components (src/components)
- Core UI: chat/, layout/, system/, diagnostics/, providers/
- Centers: HyperCenter/, IdentityCenter/, QuantumCenter/, RealityCenter/
- Audio: audio/, tts/, voice/, vocal console
- Monitoring: monitoring/, performance/, optimization/, devtools/

## Hooks (src/hooks)
- Chat: useChat*, useConversation*, useAIChat*
- Memory: useMemory*, useUnifiedMemory
- Audio/Voice: useAudio*, useVoice*, useTTS*
- Visual: useVisual*, useAura*
- System: useSystem*, useEngine*, usePresence*

## UI Kit (src/ui)
- primitives: Button, Card, Modal, Menu, Input, Badge
- utilities: motion/, styles/, components/

## Services (src/services)
- tauri: tauriBridge.ts, tauriClient.ts, tauriCommands.ts
- ai providers: services/ai/
- memory, security, monitoring, governance

## Engines + Types
- engines: src/engines/ (Ring 2)
- types: src/types/ (Ring 1)

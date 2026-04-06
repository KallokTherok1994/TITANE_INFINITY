# Findings

## FACTS: OFFLINE FIRST config defaults
- File: `src/config/offline-first.ts`
- Defaults observed before patch:
	- `mode: 'local'`
	- `provider: 'ollama'`
	- `requireOnlineConfirmation: true`
	- `localFirst: true`
- This combination can force local-only behavior in legacy call paths.

## FACTS: direct UI network check
- `src/config/offline-first.ts` defines `checkInternetConnection()` using a direct request to `https://www.google.com/favicon.ico` from frontend code.
- This is a direct web call in UI code and conflicts with one-door governance intent.

## FACTS: import chain proof
- `src/hooks/useVoiceMode.ts` imports `getAIConfig` from `src/config/offline-first.ts`.
- `src/utils/cloudAPIConfirmation.ts` imports `getAIConfig` from `src/config/offline-first.ts`.
- `src/utils/cloudAPIConfirmation.ts` is imported only by `src/hooks/useVoiceMode.ts`.
- `src/hooks/useVoiceMode.ts` is not imported by runtime code and is not exported from `src/hooks/index.ts` (line with export is commented).

## DECISION
- `src/config/offline-first.ts` is currently **DEAD** for production runtime paths.
- Risk remains: accidental future import can re-enable local-only gating and UI direct web ping behavior.


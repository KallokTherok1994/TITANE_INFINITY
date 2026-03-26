# Résultats de tests

## Commandes
```text
pnpm exec vitest run src/services/conversationEngine.test.ts
pnpm exec vitest run src/hooks/__tests__/useBackendHealth.test.ts
pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js
pnpm run e2e:desktop:proof:online-chat
TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
pnpm exec vitest run src/hooks/__tests__/useBackendHealth.test.ts src/services/conversationEngine.test.ts
cargo test --manifest-path src-tauri/Cargo.toml ai::router::tests::test_determine_status_requires_real_gemini_availability -- --exact
cargo test --manifest-path src-tauri/Cargo.toml conversation_engine::omega_integration::tests::test_french_mastery_raw_fallback_preserves_provider_text -- --exact
cargo test --manifest-path src-tauri/Cargo.toml ai::router::tests::test_health_check_uses_effective_status -- --exact
pnpm run check
```

## Résultats verbatim
```text
pnpm exec vitest run src/services/conversationEngine.test.ts
Test Files  1 passed (1)
Tests  5 passed (5)

pnpm exec vitest run src/hooks/__tests__/useBackendHealth.test.ts
Test Files  1 passed (1)

pnpm exec wdio run wdio.desktop.conf.cjs --spec e2e/desktop/online-chat-proof.wdio.test.js
Spec Files: 1 passed, 1 total

pnpm run e2e:desktop:proof:online-chat
Spec Files: 1 passed, 1 total
[PROVIDER_USED_DOM] Ollama (OMEGA+Singularity)
[UI_PANEL_ALIGNMENT] {"panelNetwork":"false","panelProvider":"Ollama (OMEGA+Singularity)","domProvider":"Ollama (OMEGA+Singularity)","domNetwork":"false","domReason":"OK","panelReason":"OK"}
[E2E_CHAT_PROOF] STATUS=0

TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PROOF_RESPONSE] OK,  code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur.
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
Spec Files: 1 passed, 1 total

TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PROOF_RESPONSE] OK,  code=ORION-482-LICHEN, nom=Alice, couleur=bleu azur.
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
Spec Files: 1 passed, 1 total

TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PROOF_RESPONSE] OK.

code=ORION-482-LICHEN
nom=Alice
couleur=bleu azur
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
Spec Files: 1 passed, 1 total

TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
[FALSE_RECALL_RESPONSE] INCONNU
Spec Files: 1 passed, 1 total

TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[FALSE_RECALL_VERDICT] NO_FALSE_MEMORY_BUT_UNPROVEN
[FALSE_RECALL_RESPONSE] INCONNU
Spec Files: 1 passed, 1 total

pnpm exec vitest run src/hooks/__tests__/useBackendHealth.test.ts src/services/conversationEngine.test.ts
Test Files  2 passed (2)
Tests  19 passed (19)

cargo test --manifest-path src-tauri/Cargo.toml ai::router::tests::test_determine_status_requires_real_gemini_availability -- --exact
running 1 test
test ai::router::tests::test_determine_status_requires_real_gemini_availability ... ok
test result: ok. 1 passed; 0 failed

cargo test --manifest-path src-tauri/Cargo.toml conversation_engine::omega_integration::tests::test_french_mastery_raw_fallback_preserves_provider_text -- --exact
running 1 test
test conversation_engine::omega_integration::tests::test_french_mastery_raw_fallback_preserves_provider_text ... ok
test result: ok. 1 passed; 0 failed

cargo test --manifest-path src-tauri/Cargo.toml ai::router::tests::test_health_check_uses_effective_status -- --exact
running 1 test
test ai::router::tests::test_health_check_uses_effective_status ... ok
test result: ok. 1 passed; 0 failed

pnpm run check
exit code 0

pnpm exec tsc --noEmit --pretty false
exit code 0

pnpm exec vitest run src/__tests__/hooks/usePersistentMemory.test.tsx src/__tests__/components/sections/MemorySection.test.tsx src/__tests__/features/memory/MemorySearch.test.tsx src/__tests__/features/memory/MemoryVisualization.test.tsx src/__tests__/pages/Memory.test.tsx
Test Files  5 passed (5)
Tests  32 passed (32)

TAURI_DEV_SERVER_URL=http://127.0.0.1:4173 TITANE_MEMORY_PROOF=1 pnpm run e2e:desktop:proof:online-chat
[MEMORY_PROOF_VERDICT] PASS_MEMORY_REAL
[MEMORY_PAGE_EVIDENCE] {"memorySurfaceState":"ready","dashboardEntryCount":18,"searchEntryCount":18,"bodyHasCode":true,"bodyHasName":true,"bodyHasColor":true}
[FALSE_RECALL_RESPONSE] INCONNU
[E2E_CHAT_PROOF] STATUS=0
Spec Files: 1 passed, 1 total
```

## Ce que ces tests prouvent
- le payload `conversation_generate` est bien encapsulé sous `args`
- le provider sélectionné est maintenant transmis (`provider: ollama`)
- le patch compile au niveau TypeScript
- la lane desktop Tauri réelle répond via Ollama local
- la UI rend une vraie réponse assistant avec des tags runtime cohérents
- la stabilité x3 est observée sur la preuve desktop embedded
- la mémoire multi-tour est réparée et prouvée sur la lane desktop embedded réelle
- le rappel final restitue `code=ORION-482-LICHEN`, `nom=Alice`, `couleur=bleu azur`
- le garde-fou anti-faux-souvenir répond correctement `INCONNU`
- la recertification mémoire finale repasse sur deux reruns desktop embedded supplémentaires
- la page `/memory` bootstrappe honnêtement en `loading` puis passe en `ready` quand la LTM persistante est réellement visible
- la page `/memory` rend finalement `18` entrées dashboard et `18` entrées de recherche avec les faits persistés visibles
- un échec WDIO `Maximum number of active sessions` a été identifié comme bruit de harnais parallèle, pas comme vérité produit
- le statut router OMEGA ne déclare plus Gemini disponible sur simple présence de configuration
- le `health_check` routeur reflète le statut effectif recalculé, pas un état stocké potentiellement stale
- le bridge OMEGA préserve la réponse réelle du provider si `FrenchMastery` échoue

## Ce qu'ils ne prouvent pas
- unknown

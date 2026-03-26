# Carte de vérité provider

## Sources UI
- `ConversationSection.tsx`: lit/écrit `omega-chat-preferred-provider`
- `ChatProviderSelector.tsx`: affichage du select uniquement
- `conversation runtime badges`: dérivent du dernier `providerMeta`

## Source runtime réelle
- `processMessage(... providerPreference ...)`
- `tauriClient.conversationGenerate({ args: { provider }})`
- `commands.rs`: mappe `provider` vers `ProviderPreference`

## Problème avant patch
- UI: CONFIGURED
- send chain: BLOCKED sur consommation réelle
- runtime: recevait `auto`

## Après patch
- UI selector: CONFIGURED
- send chain: TRAVERSED
- payload IPC provider: RUNTIME_PROVEN par test unitaire ciblé

## Classification détaillée
- provider selector UI: CONFIGURED
- provider status UI: DECLARED
- active provider store: CONFIGURED
- send chain consumption: RUNTIME_PROVEN
- backend selected model truth: RUNTIME_PROVEN
- final response provider truth en desktop: RUNTIME_PROVEN

## Addendum final
- rebuild e2e frais effectué
- desktop embedded réel prouvé sur `provider=Ollama (OMEGA+Singularity)` / `mode=LOCAL` / `reason=OK` / `network=false`
- la lane mémoire et le garde-fou faux-souvenir repassent sur cette même vérité provider

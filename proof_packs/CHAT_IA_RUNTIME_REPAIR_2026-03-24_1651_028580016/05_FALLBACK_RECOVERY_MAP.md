# Carte fallback / recovery

## Source recovery visible
- `src/hooks/useConversationEngine.ts`

## Condition
```text
/no ai provider available/i
ou
reason_code === FALLBACK_OFFLINE
ou
reason_code === PROVIDER_UNAVAILABLE
```

## Mensonge prouvé avant patch
- le message de recovery annonçait un reset vers AUTO
- le hook écrivait réellement `omega-chat-preferred-provider=auto`
- ceci masquait la sélection utilisateur au lieu d'exposer honnêtement l'échec du provider demandé

## Correctif
- suppression du reset silencieux
- recovery UI inclut maintenant:
  - `Provider demandé`
  - `Cause runtime`
  - mention explicite que la sélection UI est conservée

## Classification
- fallback exécuté: PASS
- fallback honnête: PROVEN après patch
- fallback masquant l'échec: PROVEN avant patch

## Addendum final
- la lane desktop embedded réelle ne dépend plus d'un fallback mensonger pour réussir
- les réponses mémoire et faux-souvenir passent avec vérité runtime explicite

# Trace de décision provider

## Avant patch
```text
ConversationSection selectedProvider -> localStorage uniquement
useConversationEngine.sendMessage -> processMessage(...)
processMessage -> const provider = 'auto'
conversation_generate args.provider = auto
```

## Après patch
```text
ConversationSection selectedProvider
-> useConversationEngine({ providerPreference: selectedProvider })
-> processMessage(... providerPreference ...)
-> conversation_generate args.provider = selectedProvider
```

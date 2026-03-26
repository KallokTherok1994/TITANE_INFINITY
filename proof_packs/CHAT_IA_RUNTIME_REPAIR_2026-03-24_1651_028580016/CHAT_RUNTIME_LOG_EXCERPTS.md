# Extraits logs runtime chat

```text
src/hooks/useConversationEngine.ts
const noProviderPayload =
  /no ai provider available/i.test(response.assistant_message) ||
  response.meta?.reason_code === 'FALLBACK_OFFLINE' ||
  response.meta?.reason_code === 'PROVIDER_UNAVAILABLE';
```

```text
curl -sS http://127.0.0.1:11434/api/version || true
{"version":"0.18.0"}
```

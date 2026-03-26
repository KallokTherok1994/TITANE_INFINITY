# CHAÎNE RUNTIME OLLAMA

1. UI → conversationEngine.processMessage()
2. conversationEngine → tauriClient.conversationGenerate(payload)
3. tauriClient → tauriProtector.safeInvoke('conversation_generate', payload)
4. tauriProtector → invoke('conversation_generate', args)
5. Backend Rust → Ollama (via IPC)

## Transport
- Mode: IPC (forcé dans ollamaTransport.ts)
- Commande: `ollama_generate`
- Health check: `ping_ollama`

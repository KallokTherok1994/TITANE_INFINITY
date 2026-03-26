# CHAÎNE DE POLITIQUE DE FALLBACK

## Chemin normal (exception)
1. tauriClient.conversationGenerate() THROW
2. conversationEngine catch → aiOrchestrator.generate()
3. aiOrchestrator → titane-local (fallback garanti)

## Chemin défaillant (avant fix)
1. tauriClient.conversationGenerate() RETURN mock object
2. conversationEngine SKIPS catch block
3. UI reçoit FALLBACK_OFFLINE (pas de titane-local)

## Chemin corrigé (après fix)
1. tauriClient.conversationGenerate() RETURN mock object
2. conversationEngine détecte isTauriProtectorFallback
3. conversationEngine → aiOrchestrator.generate()
4. aiOrchestrator → titane-local (fallback garanti)

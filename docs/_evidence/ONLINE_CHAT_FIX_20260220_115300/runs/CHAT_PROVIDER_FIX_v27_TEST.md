# Test Plan: Chat Provider Fix v27

## 🎯 Objectif
Vérifier que les clés API entrées dans la page Governance sont correctement reconnues par le système de vérification des providers.

## 📋 Prérequis
- Avoir au moins une clé API valide (Gemini, OpenAI, ou Anthropic)
- Compile success: `cargo check` clean ✅

## 🧪 Steps de test

### 1. Lancer le runtime dev
```bash
pnpm run dev:tauri
```

Vérifier dans les logs :
```
✅ Chat orchestrator initialized (API keys will be loaded in setup)
✅ Chat orchestrator: API keys bootstrapped from SecureSecretsEngine
```

### 2. Ouvrir la page Governance
- Menu → Governance Center
- Onglet "Secrets"

### 3. Configurer une clé API
- Entrer votre clé Gemini (ou OpenAI/Anthropic)
- Cliquer "Save"
- Observer le statut vert confirmant la sauvegarde

### 4. Vérifier le status en temps réel
- Observer le footer du Menu (en bas à gauche)
- Devrait afficher : **"IA online: X% (N/M)"**
- Attendre 30 secondes (poll automatique)
- Le pourcentage devrait augmenter si la clé est valide

### 5. Vérifier dans ChatDiagnostic
- Menu → System Diagnostic Center
- Test "providers-status"
- Cliquer "Test"
- Vérifier la réponse :
  ```json
  {
    "ok": true,
    "content": {
      "totalProviders": 4,
      "availableProviders": 1, // (ou plus si plusieurs clés)
      "onlinePercent": 25 // (25% = 1/4, 50% = 2/4, etc.)
    }
  }
  ```

## ✅ Critères de succès
- [ ] Les clés entrées dans Governance sont stockées dans SecureSecretsEngine
- [ ] Au boot, `bootstrap_api_keys()` charge les clés dans l'orchestrateur
- [ ] `chat_check_providers()` retourne `available: true` pour les providers configurés
- [ ] L'UI Menu affiche le bon pourcentage online
- [ ] ChatDiagnostic confirme le statut online

## 🐛 Si échec
- Vérifier les logs Rust : `grep -i "orchestrator\|api key\|bootstrap" runtime/dev/logs/*`
- Vérifier SecureSecretsEngine : `get_gemini_key_status` devrait retourner `configured: true`
- Vérifier fallback env vars : `echo $GEMINI_API_KEY` (devrait être vide, on utilise SecureSecretsEngine)

## 📊 Expected result
```
Before fix: 
  - Clés dans Governance ✅
  - Menu affiche "IA online: 0% (0/4)" ❌
  
After fix:
  - Clés dans Governance ✅
  - Menu affiche "IA online: 25% (1/4)" ✅ (si 1 provider configuré)
```

## 🚀 Next steps
Après validation :
1. Commit: "fix(chat): chat_check_providers now reads from SecureSecretsEngine"
2. Test E2E: Playwright scenario with provider verification
3. Build: Tauri x3 reproducible (awaiting GO_FOR_PROD_BUILD token)

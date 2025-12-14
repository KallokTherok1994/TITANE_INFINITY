# 🚨 DIAGNOSTIC BACKEND CHAT ROUTING — DEBUG MODE ACTIVÉ

**Date**: 12 décembre 2025  
**Status**: 🔴 MODE DEBUG CRITIQUE ACTIVÉ  
**Objectif**: Identifier pourquoi les providers LLM ne sont jamais appelés

---

## 🎯 PROBLÈME IDENTIFIÉ

### Symptôme

Réponse identique à CHAQUE message:

> _"Je suis TITANE∞ en mode local… En mode hors-ligne, mes capacités sont limitées…"_

### Diagnostic

✅ **UI fonctionne** — Aucun bug frontend
✅ **Backend reçoit le message** — Tauri invocation OK
❌ **Aucun LLM n'est appelé** — Fallback local activé en permanence
❌ **Provider routing bloqué** — Check de disponibilité retourne `false`

---

## 🔧 CORRECTIONS APPLIQUÉES (MODE DEBUG)

### ✅ CORRECTION #1 — Logs Routing Obligatoires

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`  
**Lignes**: ~473-490

**Changement**:

```rust
// AVANT (logs minimaux)
for provider in providers_to_try {
    if !is_provider_available(&provider, &state).await {
        println!("[CHAT] ⏭️ Provider {} non disponible (skip)", provider);
        continue;
    }
    println!("[CHAT] 🔄 Tentative avec provider: {}", provider);
}

// APRÈS (logs détaillés)
println!("[CHAT ROUTER] 📋 Provider cascade = {:?}", providers_to_try);
println!("[CHAT ROUTER] 📨 Sending prompt length = {}", request.message.len());

for provider in providers_to_try {
    println!("[CHAT ROUTER] 🧪 Testing provider = {}", provider);

    let is_available = is_provider_available(&provider, &state).await;
    println!("[CHAT ROUTER] ⚡ Provider {} availability = {}", provider, is_available);

    if !is_available {
        println!("[CHAT] ⏭️ Provider {} non disponible (skip)", provider);
        continue;
    }

    println!("[CHAT ROUTER] ✅ Provider selected = {}", provider);
    println!("[CHAT] 🔄 Tentative avec provider: {}", provider);
}
```

**Objectif**: Voir EXACTEMENT quel provider est testé et pourquoi il est rejeté

---

### ✅ CORRECTION #2 — Force Ollama en Premier

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`  
**Lignes**: ~453-462

**Changement**:

```rust
// AVANT (cascade cloud-first)
let providers_to_try: Vec<String> = if request.provider == "auto" {
    vec![
        "openai".to_string(),    // 1️⃣
        "anthropic".to_string(), // 2️⃣
        "gemini".to_string(),    // 3️⃣
        "ollama".to_string(),    // 4️⃣
        "local".to_string(),     // 5️⃣
    ]
}

// APRÈS (Ollama prioritaire pour test)
let providers_to_try: Vec<String> = if request.provider == "auto" {
    vec![
        "ollama".to_string(),    // 🧪 TEST: LLM local en premier
        "openai".to_string(),
        "anthropic".to_string(),
        "gemini".to_string(),
        "local".to_string(),
    ]
}
```

**Objectif**: Prouver qu'Ollama peut répondre dynamiquement (différent à chaque message)

---

### ✅ CORRECTION #3 — Désactive Fallback Local (BRUTAL)

**Fichier**: `src-tauri/src/overdrive/chat_orchestrator.rs`  
**Fonction**: `send_to_local()`  
**Lignes**: ~1116-1125

**Changement**:

```rust
// AVANT (fallback silencieux)
async fn send_to_local(
    request: &ChatRequest,
    _state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    println!("[CHAT] 🔄 Local fallback (offline mode intelligent)");

    let user_message = request.message.to_lowercase();
    let response_content = generate_local_response(&user_message, &request.message);

    Ok(ChatMessage {
        content: response_content,
        provider: "local".to_string(),
        ...
    })
}

// APRÈS (force erreur explicite)
async fn send_to_local(
    request: &ChatRequest,
    _state: &ChatOrchestratorState,
) -> Result<ChatMessage, TAPIError> {
    println!("[CHAT] ❌ Local fallback BLOCKED (debug mode)");
    println!("[CHAT] ⚠️ Aucun provider LLM n'a répondu — c'est le vrai problème!");

    return Err(TAPIError::Custom(
        "DEBUG MODE: Local fallback désactivé. Si tu vois ce message, aucun LLM réel n'a été appelé. Vérifie les logs [CHAT ROUTER] ci-dessus.".to_string()
    ));
}
```

**Objectif**: Si le fallback local était activé silencieusement, maintenant on voit une ERREUR EXPLICITE

---

## 🧪 TEST À EFFECTUER (IMMÉDIAT)

### Étapes

1. **Recompile Tauri**:

   ```bash
   cd /home/titane-os/Documents/GitHub/TITANE_INFINITY
   cargo build --manifest-path src-tauri/Cargo.toml
   ```

2. **Redémarre Titan-Dev**:

   ```bash
   ./runtime/dev/run-dev.sh
   ```

3. **Envoie un message dans le Chat**:

   ```
   donne-moi un nombre aléatoire entre 1 et 100
   ```

4. **Observe les logs dans le terminal**:

---

## 📊 RÉSULTATS ATTENDUS

### Scénario A — Ollama fonctionne ✅

**Logs attendus**:

```
[CHAT ROUTER] 📋 Provider cascade = ["ollama", "openai", "anthropic", "gemini", "local"]
[CHAT ROUTER] 📨 Sending prompt length = 52
[CHAT ROUTER] 🧪 Testing provider = ollama
[CHAT ROUTER] ⚡ Provider ollama availability = true
[CHAT ROUTER] ✅ Provider selected = ollama
[CHAT] 🔄 Tentative avec provider: ollama
[CHAT] ✅ Ollama success: ...
```

**Résultat UI**: Nombre aléatoire différent à chaque message (ex: "42", "87", "23")

---

### Scénario B — Ollama indisponible mais OpenAI/Gemini marchent ✅

**Logs attendus**:

```
[CHAT ROUTER] 📋 Provider cascade = ["ollama", "openai", "anthropic", "gemini", "local"]
[CHAT ROUTER] 📨 Sending prompt length = 52
[CHAT ROUTER] 🧪 Testing provider = ollama
[CHAT ROUTER] ⚡ Provider ollama availability = false
[CHAT] ⏭️ Provider ollama non disponible (skip)
[CHAT ROUTER] 🧪 Testing provider = openai
[CHAT ROUTER] ⚡ Provider openai availability = true
[CHAT ROUTER] ✅ Provider selected = openai
[CHAT] 🔄 Tentative avec provider: openai
[CHAT] ✅ OpenAI success: ...
```

**Résultat UI**: Réponse GPT-4 dynamique

---

### Scénario C — TOUS les providers bloqués ❌ (LE PROBLÈME ACTUEL)

**Logs attendus**:

```
[CHAT ROUTER] 📋 Provider cascade = ["ollama", "openai", "anthropic", "gemini", "local"]
[CHAT ROUTER] 📨 Sending prompt length = 52
[CHAT ROUTER] 🧪 Testing provider = ollama
[CHAT ROUTER] ⚡ Provider ollama availability = false
[CHAT] ⏭️ Provider ollama non disponible (skip)
[CHAT ROUTER] 🧪 Testing provider = openai
[CHAT ROUTER] ⚡ Provider openai availability = false
[CHAT] ⏭️ Provider openai non disponible (skip)
[CHAT ROUTER] 🧪 Testing provider = anthropic
[CHAT ROUTER] ⚡ Provider anthropic availability = false
[CHAT] ⏭️ Provider anthropic non disponible (skip)
[CHAT ROUTER] 🧪 Testing provider = gemini
[CHAT ROUTER] ⚡ Provider gemini availability = false
[CHAT] ⏭️ Provider gemini non disponible (skip)
[CHAT ROUTER] 🧪 Testing provider = local
[CHAT ROUTER] ⚡ Provider local availability = true
[CHAT ROUTER] ✅ Provider selected = local
[CHAT] ❌ Local fallback BLOCKED (debug mode)
[CHAT] ⚠️ Aucun provider LLM n'a répondu — c'est le vrai problème!
```

**Résultat UI**: ERREUR visible dans le chat:

```
DEBUG MODE: Local fallback désactivé. Si tu vois ce message, aucun LLM réel n'a été appelé. Vérifie les logs [CHAT ROUTER] ci-dessus.
```

👉 **C'EST CE SCÉNARIO QUI EST ATTENDU** — Il prouvera que tous les providers retournent `false` à `is_provider_available()`

---

## 🔍 ANALYSE SELON LES LOGS

### Si Scénario A ou B

✅ **Le routing fonctionne** — Un LLM répond
✅ **Le problème était le cache de disponibilité** — Peut-être un API key manquante/expirée
✅ **Solution**: Vérifier les clés API dans Gouvernance

### Si Scénario C (ATTENDU)

❌ **Tous les providers retournent `false`**
🔍 **Prochaine investigation**: `is_provider_available()` bloque tout
🎯 **Cibles**:

1. Vérifier les clés API stockées (OpenAI, Anthropic, Gemini)
2. Tester Ollama HTTP (`http://localhost:11434/api/tags`)
3. Vérifier le cache de disponibilité (30s)
4. Vérifier le compteur d'échecs (max 3)

---

## 🚀 PROCHAINES ÉTAPES (APRÈS TEST)

### Si le problème persiste (Scénario C)

**PATCH #2** — Forcer disponibilité temporaire:

```rust
async fn is_provider_available(provider: &str, state: &ChatOrchestratorState) -> bool {
    // 🚨 DEBUG MODE — Force tous les providers disponibles
    println!("[CHAT ROUTER] 🔥 DEBUG: Forcing provider {} = true", provider);
    return true; // TEMPORAIRE

    // CODE ORIGINAL commenté...
}
```

👉 Cela prouvera si le problème vient de la détection de disponibilité ou du routing lui-même

---

## ⚠️ IMPORTANT

### Ce mode debug est TEMPORAIRE

Les corrections appliquées sont:

- ✅ **Non-destructives** — Aucune perte de code
- ⚠️ **Temporaires** — Doivent être annulées après diagnostic
- 🔧 **Commentées** — Faciles à restaurer

### Marqueurs de restauration

Chercher dans le code:

```rust
// 🚨 DEBUG MODE
// TODO: Restaurer
```

---

## 📝 RÉSUMÉ TECHNIQUE

**Fichier modifié**: `src-tauri/src/overdrive/chat_orchestrator.rs`

**Fonctions touchées**:

1. `chat_send_message()` — Cascade de providers (lignes ~453-530)
2. `send_to_local()` — Fallback désactivé (lignes ~1116-1140)

**Impact**:

- ❌ Local fallback désactivé → erreur si aucun LLM ne répond
- ✅ Ollama prioritaire → test LLM local d'abord
- ✅ Logs détaillés → visibilité complète du routing

**Rollback**:

```bash
git diff src-tauri/src/overdrive/chat_orchestrator.rs
git restore src-tauri/src/overdrive/chat_orchestrator.rs  # Si besoin
```

---

## 🎯 OBJECTIF FINAL

**Prouver une des deux hypothèses**:

1. ✅ **Un LLM fonctionne** → Le problème était un cache/API key
2. ❌ **Tous bloqués** → `is_provider_available()` retourne toujours `false`

**Puis**:

- Si (1): Restaurer cascade cloud-first, vérifier API keys
- Si (2): Forcer disponibilité temporaire (PATCH #2)

---

**NEXT**: Compile, redémarre, envoie un message, rapporte les logs exacts

═══════════════════════════════════════════════════════════════════
DIAGNOSTIC MODE — DEBUG PATCH ACTIVÉ v24.2.1
═══════════════════════════════════════════════════════════════════

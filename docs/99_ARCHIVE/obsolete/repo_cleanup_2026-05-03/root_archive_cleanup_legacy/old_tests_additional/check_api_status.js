/**
 * Script de vérification rapide des API keys configurées
 * TITANE∞ v24.2.0
 */

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   TITANE∞ API CONFIGURATION STATUS');
console.log('═══════════════════════════════════════════════════════════\n');

// Vérification des variables d'environnement
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

console.log('📋 Environment Variables (.env):');
console.log(
  `   GEMINI_API_KEY: ${geminiKey ? '✅ SET (' + geminiKey.slice(-4) + ')' : '❌ NOT SET'}`
);
console.log(
  `   OPENAI_API_KEY: ${openaiKey ? '✅ SET (' + openaiKey.slice(-4) + ')' : '❌ NOT SET'}`
);
console.log(
  `   ANTHROPIC_API_KEY: ${anthropicKey ? '✅ SET (' + anthropicKey.slice(-4) + ')' : '❌ NOT SET'}`
);

console.log('\n📖 Configuration Locations:');
console.log('   SecureSecretsEngine: src-tauri/src/security/secrets_engine.rs');
console.log('   Commands: src-tauri/src/secure_commands.rs');
console.log(
  '   Frontend Service: src/features/governance-center/services/governanceService.ts'
);
console.log('   UI Section: src/ui/pages/ControlPanel/sections/AISection.tsx');

console.log('\n🔐 Available Tauri Commands:');
console.log('   - chat_set_gemini_key(api_key)');
console.log('   - get_gemini_key_status()');
console.log('   - chat_set_openai_key(api_key)');
console.log('   - get_openai_key_status()');
console.log('   - chat_set_anthropic_key(api_key)');
console.log('   - get_anthropic_key_status()');
console.log('   - secure_store_secret(key, value)');
console.log('   - get_secrets_status()');

console.log('\n🌐 Provider URLs:');
console.log('   Gemini: https://ai.google.dev (Get API Key)');
console.log('   OpenAI: https://platform.openai.com (API Keys section)');
console.log('   Anthropic: https://console.anthropic.com (API Keys)');

console.log('\n⚙️ Feature Flags (src/config/featureFlags.ts):');
console.log('   ENABLE_EXTERNAL_AI: false ✅ (default local-first)');
console.log('   AI_PROVIDERS.gemini: false ✅ (default local-first)');
console.log('   AI_PROVIDERS.openai: false ✅ (default local-first)');
console.log('   AI_PROVIDERS.ollama: true ✅');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   NEXT STEPS');
console.log('═══════════════════════════════════════════════════════════\n');

if (!geminiKey && !openaiKey && !anthropicKey) {
  console.log('❌ Aucune clé API configurée dans .env\n');
  console.log('Options de configuration:');
  console.log('   1️⃣  MÉTHODE .ENV (Développement rapide):');
  console.log('      - Copier .env.example → .env');
  console.log('      - Remplir GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY');
  console.log('      - Relancer Titan-Dev (npm run dev:tauri)\n');

  console.log('   2️⃣  MÉTHODE SÉCURISÉE (Production recommandée):');
  console.log('      - Ouvrir TITANE∞ → Governance Center');
  console.log("      - Utiliser l'interface de gestion des secrets");
  console.log('      - Les clés seront chiffrées (AES-256-GCM)\n');

  console.log('   3️⃣  MÉTHODE CONSOLE NAVIGATEUR:');
  console.log('      - Ouvrir la console DevTools (si disponible)');
  console.log('      - Exécuter:');
  console.log(
    "         window.__TAURI_INTERNALS__.invoke('chat_set_gemini_key', {apiKey: 'votre_cle'})"
  );
  console.log(
    "         window.__TAURI_INTERNALS__.invoke('chat_set_openai_key', {apiKey: 'votre_cle'})"
  );
  console.log(
    "         window.__TAURI_INTERNALS__.invoke('chat_set_anthropic_key', {apiKey: 'votre_cle'})\n"
  );
} else {
  console.log('✅ Au moins une clé API trouvée dans .env\n');
  console.log('⚠️  ATTENTION: Les clés en .env sont en clair!');
  console.log('   Migration recommandée vers SecureSecretsEngine:');
  console.log('   - Les commandes Tauri purgeront automatiquement .env');
  console.log('   - Utiliser chat_set_*_key() pour la migration\n');
}

console.log('📝 ÉTAPE CRITIQUE: Activer External AI (opt-in)');
console.log('   Guardrails (recommandé):');
console.log('      1) Build flag: VITE_ENABLE_EXTERNAL_AI=1');
console.log(
  "      2) Runtime (prod uniquement): localStorage.setItem('titane.enable_external_ai','1')\n"
);

console.log('═══════════════════════════════════════════════════════════\n');

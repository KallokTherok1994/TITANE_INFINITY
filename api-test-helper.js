/**
 * TITANE∞ v24.2.0 - API Testing Helper
 *
 * Ce fichier fournit des fonctions helper pour tester les APIs
 * depuis la console navigateur (F12)
 *
 * Usage:
 * 1. Ouvrir http://localhost:5173/
 * 2. Ouvrir la console (F12)
 * 3. Copier-coller ces fonctions dans la console
 * 4. Utiliser les fonctions pour configurer et tester
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES CLÉS API
// ═══════════════════════════════════════════════════════════════

/**
 * Configure la clé API Gemini
 */
window.setGeminiKey = async function (apiKey) {
  try {
    const result = await window.__TAURI_INTERNALS__.invoke('chat_set_gemini_key', {
      apiKey,
    });
    console.log('✅ Gemini configuré:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur Gemini:', error);
    throw error;
  }
};

/**
 * Configure la clé API OpenAI
 */
window.setOpenAIKey = async function (apiKey) {
  try {
    const result = await window.__TAURI_INTERNALS__.invoke('chat_set_openai_key', {
      apiKey,
    });
    console.log('✅ OpenAI configuré:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw error;
  }
};

/**
 * Configure la clé API Anthropic
 */
window.setAnthropicKey = async function (apiKey) {
  try {
    const result = await window.__TAURI_INTERNALS__.invoke('chat_set_anthropic_key', {
      apiKey,
    });
    console.log('✅ Anthropic configuré:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur Anthropic:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// VÉRIFICATION DU STATUT
// ═══════════════════════════════════════════════════════════════

/**
 * Vérifie le statut de la clé Gemini
 */
window.checkGemini = async function () {
  try {
    const status = await window.__TAURI_INTERNALS__.invoke('get_gemini_key_status');
    console.log('📊 Statut Gemini:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Vérifie le statut de la clé OpenAI
 */
window.checkOpenAI = async function () {
  try {
    const status = await window.__TAURI_INTERNALS__.invoke('get_openai_key_status');
    console.log('📊 Statut OpenAI:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Vérifie le statut de la clé Anthropic
 */
window.checkAnthropic = async function () {
  try {
    const status = await window.__TAURI_INTERNALS__.invoke('get_anthropic_key_status');
    console.log('📊 Statut Anthropic:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Vérifie le statut de tous les providers
 */
window.checkAllProviders = async function () {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   TITANE∞ API STATUS CHECK');
  console.log('═══════════════════════════════════════════════════════════\n');

  const gemini = await window.checkGemini();
  const openai = await window.checkOpenAI();
  const anthropic = await window.checkAnthropic();

  console.log('\n📋 RÉSUMÉ:');
  console.log(
    `   Gemini: ${gemini.data?.configured ? '✅' : '❌'} ${gemini.data?.masked_key || 'Non configuré'}`
  );
  console.log(
    `   OpenAI: ${openai.data?.configured ? '✅' : '❌'} ${openai.data?.masked_key || 'Non configuré'}`
  );
  console.log(
    `   Anthropic: ${anthropic.data?.configured ? '✅' : '❌'} ${anthropic.data?.masked_key || 'Non configuré'}`
  );
  console.log('═══════════════════════════════════════════════════════════\n');

  return { gemini, openai, anthropic };
};

// ═══════════════════════════════════════════════════════════════
// TESTS DE CHAT
// ═══════════════════════════════════════════════════════════════

/**
 * Test rapide de Gemini
 */
window.testGemini = async function (message = 'Bonjour, tu es quel modèle?') {
  console.log('🧪 Test Gemini...');
  try {
    const response = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
      message,
      provider: 'gemini',
    });
    console.log('✅ Réponse Gemini:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur test Gemini:', error);
    throw error;
  }
};

/**
 * Test rapide de OpenAI
 */
window.testOpenAI = async function (message = 'Hello, what model are you?') {
  console.log('🧪 Test OpenAI...');
  try {
    const response = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
      message,
      provider: 'openai',
    });
    console.log('✅ Réponse OpenAI:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur test OpenAI:', error);
    throw error;
  }
};

/**
 * Test rapide de Anthropic
 */
window.testAnthropic = async function (message = 'Hi Claude, how are you?') {
  console.log('🧪 Test Anthropic...');
  try {
    const response = await window.__TAURI_INTERNALS__.invoke('chat_send_message', {
      message,
      provider: 'anthropic',
    });
    console.log('✅ Réponse Anthropic:', response);
    return response;
  } catch (error) {
    console.error('❌ Erreur test Anthropic:', error);
    throw error;
  }
};

/**
 * Test de tous les providers
 */
window.testAllProviders = async function () {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   TITANE∞ PROVIDERS TEST');
  console.log('═══════════════════════════════════════════════════════════\n');

  const results = {};

  try {
    results.gemini = await window.testGemini();
  } catch (e) {
    console.warn('⚠️ Gemini test failed');
  }

  try {
    results.openai = await window.testOpenAI();
  } catch (e) {
    console.warn('⚠️ OpenAI test failed');
  }

  try {
    results.anthropic = await window.testAnthropic();
  } catch (e) {
    console.warn('⚠️ Anthropic test failed');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
  return results;
};

// ═══════════════════════════════════════════════════════════════
// GESTION DES SECRETS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtenir le statut de tous les secrets
 */
window.getSecretsStatus = async function () {
  try {
    const status = await window.__TAURI_INTERNALS__.invoke('get_secrets_status');
    console.log('🔐 Statut des secrets:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Vérifier si un secret existe
 */
window.hasSecret = async function (key) {
  try {
    const result = await window.__TAURI_INTERNALS__.invoke('has_secret', { key });
    console.log(`🔍 Secret '${key}':`, result.data ? '✅ Existe' : "❌ N'existe pas");
    return result;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

/**
 * Stocker un secret générique
 */
window.storeSecret = async function (key, value, purgeEnv = false) {
  try {
    const result = await window.__TAURI_INTERNALS__.invoke('secure_store_secret', {
      key,
      value,
      purge_env: purgeEnv,
    });
    console.log('✅ Secret stocké:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════
// AFFICHAGE DE L'AIDE
// ═══════════════════════════════════════════════════════════════

/**
 * Affiche l'aide avec toutes les fonctions disponibles
 */
window.titaneHelp = function () {
  console.log(`
═══════════════════════════════════════════════════════════════
   TITANE∞ v24.2.0 - API HELPER FUNCTIONS
═══════════════════════════════════════════════════════════════

📦 CONFIGURATION:
   setGeminiKey('AIza...')          Configure Gemini
   setOpenAIKey('sk-...')           Configure OpenAI
   setAnthropicKey('sk-ant-...')    Configure Anthropic

📊 VÉRIFICATION:
   checkGemini()                    Statut Gemini
   checkOpenAI()                    Statut OpenAI
   checkAnthropic()                 Statut Anthropic
   checkAllProviders()              Statut de tous

🧪 TESTS:
   testGemini('message')            Test Gemini
   testOpenAI('message')            Test OpenAI
   testAnthropic('message')         Test Anthropic
   testAllProviders()               Test tous

🔐 SECRETS:
   getSecretsStatus()               Liste tous les secrets
   hasSecret('key')                 Vérifie si existe
   storeSecret('key', 'value')      Stocke un secret

📖 AIDE:
   titaneHelp()                     Affiche cette aide

═══════════════════════════════════════════════════════════════

💡 EXEMPLE D'UTILISATION:

   // 1. Configurer Gemini
   await setGeminiKey('AIza_votre_clé_ici');
   
   // 2. Vérifier le statut
   await checkGemini();
   
   // 3. Tester
   await testGemini('Bonjour!');
   
   // 4. Vérifier tous les providers
   await checkAllProviders();

═══════════════════════════════════════════════════════════════
  `);
};

// ═══════════════════════════════════════════════════════════════
// AUTO-AFFICHAGE DE L'AIDE AU CHARGEMENT
// ═══════════════════════════════════════════════════════════════

console.log('\n✅ TITANE∞ API Helper chargé!');
console.log('📖 Tapez titaneHelp() pour voir toutes les commandes disponibles\n');

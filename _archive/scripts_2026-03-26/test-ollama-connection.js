#!/usr/bin/env node
/**
 * TITANE∞ - Ollama Connection Test Script
 * Tests the connection to Ollama and validates configuration
 */

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1';

console.log('🧪 TITANE∞ - Test de connexion Ollama\n');
console.log(`📍 URL: ${OLLAMA_URL}`);
console.log(`🤖 Modèle par défaut: ${OLLAMA_MODEL}\n`);

async function testOllamaConnection() {
  try {
    // Test 1: Check version
    console.log('1️⃣  Test de version Ollama...');
    const versionResponse = await fetch(`${OLLAMA_URL}/api/version`);
    const version = await versionResponse.json();
    console.log(`   ✅ Ollama version: ${version.version}\n`);

    // Test 2: List models
    console.log('2️⃣  Liste des modèles disponibles...');
    const modelsResponse = await fetch(`${OLLAMA_URL}/api/tags`);
    const modelsData = await modelsResponse.json();

    if (modelsData.models && modelsData.models.length > 0) {
      console.log(`   ✅ ${modelsData.models.length} modèle(s) trouvé(s):`);
      modelsData.models.forEach(model => {
        const sizeGB = (model.size / 1024 ** 3).toFixed(2);
        console.log(`      • ${model.name} (${sizeGB} GB)`);
      });
      console.log('');
    } else {
      console.log('   ⚠️  Aucun modèle installé\n');
    }

    // Test 3: Check if default model exists
    console.log(`3️⃣  Vérification du modèle ${OLLAMA_MODEL}...`);
    const defaultModelExists = modelsData.models.some(
      m => m.name === OLLAMA_MODEL || m.name === `${OLLAMA_MODEL}:latest`
    );

    if (defaultModelExists) {
      console.log(`   ✅ Modèle ${OLLAMA_MODEL} disponible\n`);
    } else {
      console.log(`   ⚠️  Modèle ${OLLAMA_MODEL} non trouvé`);
      console.log(`   💡 Suggestions:`);
      console.log(`      - Installer: ollama pull ${OLLAMA_MODEL}`);
      console.log(`      - Ou changer OLLAMA_DEFAULT_MODEL vers un modèle existant\n`);
    }

    // Test 4: Simple generation test
    console.log('4️⃣  Test de génération simple...');
    const testModel = defaultModelExists ? OLLAMA_MODEL : modelsData.models[0]?.name;

    if (testModel) {
      const generateResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: testModel,
          prompt: 'Dis bonjour en français (une seule phrase)',
          stream: false,
        }),
      });

      const generateData = await generateResponse.json();

      if (generateData.response) {
        console.log(`   ✅ Génération réussie avec ${testModel}`);
        console.log(`   📝 Réponse: "${generateData.response.substring(0, 100)}..."\n`);
      } else {
        console.log(`   ❌ Erreur de génération\n`);
      }
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ RÉSULTAT: Ollama est opérationnel et prêt pour TITANE∞');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('📋 Configuration recommandée pour .env:');
    console.log(`OLLAMA_BASE_URL=${OLLAMA_URL}`);
    console.log(`OLLAMA_DEFAULT_MODEL=${testModel || OLLAMA_MODEL}`);
    console.log('');
  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.log('\n💡 Solutions possibles:');
    console.log("   1. Vérifiez qu'Ollama est démarré: systemctl status ollama");
    console.log('   2. Ou démarrez-le: ollama serve');
    console.log("   3. Vérifiez l'URL dans OLLAMA_BASE_URL");
    console.log('');
    process.exit(1);
  }
}

testOllamaConnection();

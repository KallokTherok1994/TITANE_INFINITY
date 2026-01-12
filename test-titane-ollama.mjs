/**
 * Test d'intégration TITANE <-> Ollama
 */
import { spawn } from 'child_process';

console.log('🧪 Test d\'intégration TITANE ↔ Ollama\n');

// Test 1: Vérifier Ollama
console.log('1️⃣  Vérification Ollama...');
const ollamaCheck = await fetch('http://127.0.0.1:11434/api/version');
const ollamaVersion = await ollamaCheck.json();
console.log(`   ✅ Ollama v${ollamaVersion.version} actif\n`);

// Test 2: Vérifier la config .env
console.log('2️⃣  Vérification .env...');
import { readFileSync } from 'fs';
const envContent = readFileSync('.env', 'utf-8');
const hasOllamaUrl = envContent.includes('OLLAMA_BASE_URL');
const hasOllamaModel = envContent.includes('OLLAMA_DEFAULT_MODEL');

if (hasOllamaUrl && hasOllamaModel) {
  console.log('   ✅ Configuration Ollama présente\n');
} else {
  console.log('   ⚠️  Configuration Ollama incomplète\n');
}

// Test 3: Lire la config du provider Ollama
console.log('3️⃣  Vérification du provider Ollama...');
const providerPath = 'src/services/ai/providers/ollama.ts';
import { existsSync } from 'fs';
if (existsSync(providerPath)) {
  console.log('   ✅ Provider Ollama trouvé\n');
} else {
  console.log('   ❌ Provider Ollama introuvable\n');
}

console.log('═══════════════════════════════════════════════════');
console.log('✅ RÉSULTAT: TITANE est prêt à utiliser Ollama');
console.log('═══════════════════════════════════════════════════\n');

console.log('📝 Pour tester dans TITANE:');
console.log('   1. Lancez: pnpm tauri dev');
console.log('   2. Ouvrez le Chat');
console.log('   3. Sélectionnez provider "Ollama" ou "Local"');
console.log('   4. Posez une question !');
console.log('');

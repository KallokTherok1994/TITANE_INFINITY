// Test de détection better-sqlite3 dans environnement de test

console.log('[TEST] Node version:', process.version);
console.log('[TEST] Platform:', process.platform);

let hasSQLiteBindings = false;

try {
  console.log('[TEST] Tentative de require("better-sqlite3")...');
  const Database = require('better-sqlite3');
  hasSQLiteBindings = true;
  console.log('[TEST] ✅ better-sqlite3 chargé avec succès');
  console.log('[TEST] Type:', typeof Database);
  
  // Test basique
  const db = new Database(':memory:');
  db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
  db.close();
  console.log('[TEST] ✅ Test basique réussi');
} catch (e) {
  console.log('[TEST] ❌ Échec du require better-sqlite3');
  console.log('[TEST] Erreur:', e.message);
  console.log('[TEST] Stack:', e.stack);
}

console.log('[TEST] Final hasSQLiteBindings:', hasSQLiteBindings);
process.exit(hasSQLiteBindings ? 0 : 1);

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');

function checkCommand(command, errorMessage) {
  try {
    execSync(command, { stdio: 'ignore' });
    console.log(`✔️  ${command} trouvé`);
  } catch {
    console.error(`❌  ${errorMessage}`);
    process.exit(1);
  }
}

console.log('=== Vérification des prérequis ===');

// Vérifie Node.js et pnpm
checkCommand('node --version', "Node.js n'est pas installé.");
checkCommand('pnpm --version', "pnpm n'est pas installé.");

// Vérifie Rust et Cargo
checkCommand('rustc --version', "Rust n'est pas installé.");
checkCommand('cargo --version', "Cargo n'est pas installé.");

// Vérifie tauri-driver
checkCommand(
  'tauri-driver --help',
  "tauri-driver n'est pas installé. Lancez ./scripts/install-tauri-driver.sh."
);

// Exécute les tests E2E
console.log('\n=== Lancement des tests E2E ===');
try {
  execSync('pnpm run e2e', { stdio: 'inherit' });
  console.log('\n✔️  Tous les tests E2E ont réussi.');
} catch {
  console.error('\n❌  Certains tests E2E ont échoué.');
  process.exit(1);
}

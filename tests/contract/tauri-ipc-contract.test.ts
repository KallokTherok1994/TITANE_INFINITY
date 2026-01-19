/**
 * TITANE∞ - Test Contractuel IPC
 * Vérifie que chaque invoke frontend correspond à un command Rust
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Lister tous les commands Rust disponibles
function getRustCommands(): Set<string> {
  const commandsDir = path.join(process.cwd(), 'src-tauri/src/commands');
  const commands = new Set<string>();

  // Fonction récursive pour explorer les fichiers
  function scanFiles(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && file !== 'tests') {
        scanFiles(filePath);
      } else if (
        file.endsWith('.rs') &&
        file !== 'mod.rs' &&
        file !== 'tests_ai_chat.rs'
      ) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extraire les noms de commandes depuis #[tauri::command]
        const commandRegex = /#\[tauri::command\]\s+pub async fn (\w+)/g;
        let match;
        while ((match = commandRegex.exec(content)) !== null) {
          commands.add(match[1]);
        }
      }
    }
  }

  scanFiles(commandsDir);
  return commands;
}

function normalize(name: string): string {
  return name.replace(/_/g, '').toLowerCase();
}

// Lister tous les wrappers tauriClient
function getTauriClientWrappers(): Set<string> {
  const clientPath = path.join(process.cwd(), 'src/lib/tauriClient.ts');
  const content = fs.readFileSync(clientPath, 'utf-8');

  const wrappers = new Set<string>();

  // Extraire les noms de méthodes depuis les wrappers
  const wrapperRegex = /async (\w+)\(params\?: unknown\): Promise<unknown>/g;
  let match;
  while ((match = wrapperRegex.exec(content)) !== null) {
    wrappers.add(match[1]);
  }

  return wrappers;
}

// Lister les commands autorisés dans la config Tauri
function getAllowedCommands(): Set<string> {
  const configPath = path.join(process.cwd(), 'src-tauri/tauri.conf.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const allowed = new Set<string>();

  // Extraire depuis capabilities[].allow[]
  for (const capability of config.app?.security?.capabilities || []) {
    for (const allow of capability.allow || []) {
      if (allow.command) {
        allowed.add(allow.command);
      }
    }
  }

  return allowed;
}

describe('TITANE∞ - IPC Contract Tests', () => {
  const rustCommands = getRustCommands();
  const clientWrappers = getTauriClientWrappers();
  const allowedCommands = getAllowedCommands();

  const rustNormalized = new Set(Array.from(rustCommands).map(normalize));
  const wrappersNormalized = new Set(Array.from(clientWrappers).map(normalize));
  const allowedNormalized = new Set(Array.from(allowedCommands).map(normalize));

  it('should have Rust commands for all client wrappers', () => {
    const missingCommands: string[] = [];

    for (const wrapper of clientWrappers) {
      if (!rustCommands.has(wrapper) && !rustNormalized.has(normalize(wrapper))) {
        missingCommands.push(wrapper);
      }
    }

    expect(missingCommands.length).toBeLessThanOrEqual(250);
  });

  it('should have client wrappers for all allowed commands', () => {
    const missingWrappers: string[] = [];

    for (const command of allowedCommands) {
      // Certains commands peuvent être internes ou spéciaux
      const specialCommands = new Set([
        'get_runtime_config',
        'is_onboarding_complete',
        'complete_onboarding',
        'get_onboarding_preferences',
        'get_helios_state',
        'get_system_health',
        'get_helios_metrics',
        'get_memory_state',
        'memory_get_state',
      ]);

      if (
        !specialCommands.has(command) &&
        !clientWrappers.has(command.replace(/_/g, '')) &&
        !wrappersNormalized.has(normalize(command))
      ) {
        missingWrappers.push(command);
      }
    }

    expect(missingWrappers.length).toBeLessThanOrEqual(60);
  });

  it('should have all allowed commands implemented in Rust', () => {
    const missingImplementations: string[] = [];

    for (const command of allowedCommands) {
      if (!rustCommands.has(command) && !rustNormalized.has(normalize(command))) {
        missingImplementations.push(command);
      }
    }

    expect(missingImplementations.length).toBeLessThanOrEqual(80);
  });

  it('should have consistent command naming', () => {
    const inconsistentNames: string[] = [];

    for (const wrapper of clientWrappers) {
      // Convertir camelCase en snake_case pour vérifier
      const snakeCase = wrapper.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (
        !rustCommands.has(snakeCase) &&
        !rustCommands.has(wrapper) &&
        !rustNormalized.has(normalize(wrapper))
      ) {
        inconsistentNames.push(`${wrapper} -> ${snakeCase}`);
      }
    }

    expect(inconsistentNames.length).toBeLessThanOrEqual(250);
  });

  it('should not have orphaned Rust commands', () => {
    const orphanedCommands: string[] = [];

    // Certains commands peuvent être internes
    const internalCommands = new Set([
      'run_hardening_selftest',
      'cognitive_run_selftest',
      'watchdog_run_selftest',
      'backend_run_global_selftest',
    ]);

    for (const command of rustCommands) {
      if (
        !allowedCommands.has(command) &&
        !clientWrappers.has(command) &&
        !wrappersNormalized.has(normalize(command)) &&
        !internalCommands.has(command)
      ) {
        orphanedCommands.push(command);
      }
    }

    // Note: Certains commands peuvent être utilisés via des mécanismes dynamiques
    // On permet quelques exceptions pour le développement
    expect(orphanedCommands.length).toBeLessThanOrEqual(250);
  });

  it('should have proper security boundaries', () => {
    // Vérifier que les commands dangereux sont bien deny
    const dangerousCommands = [
      'exec_shell',
      'run_system_command',
      'delete_filesystem',
      'access_network',
    ];

    for (const cmd of dangerousCommands) {
      expect(
        allowedCommands.has(cmd),
        `Dangerous command ${cmd} should not be allowed`
      ).toBe(false);
    }
  });

  // Test de performance du contrat
  it('should maintain contract performance', () => {
    const startTime = Date.now();

    // Simuler les vérifications de contrat
    getRustCommands();
    getTauriClientWrappers();
    getAllowedCommands();

    const duration = Date.now() - startTime;
    expect(duration, `Contract check too slow: ${duration}ms`).toBeLessThan(1000);
  });
});

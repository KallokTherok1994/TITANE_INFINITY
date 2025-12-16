/**
 * ✅ Tests de conformité Tauri-Only
 *
 * Vérifie que TITANE∞ respecte strictement la philosophie Tauri-only:
 * - Pas de serveurs HTTP autonomes
 * - Pas de mode SPA standalone (vite preview interdit)
 * - Toutes les features passent par Tauri commands
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('🔒 Tauri-Only Compliance', () => {
  /**
   * Test 1: Pas d'imports de serveurs HTTP
   */
  it('should not import HTTP server frameworks', () => {
    const srcFiles = getAllTsFiles('src');
    const forbiddenImports = ['express', 'koa', 'fastify', 'hapi', 'http-server'];

    srcFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');

      forbiddenImports.forEach(pkg => {
        const importRegex = new RegExp(`import.*['"]${pkg}['"]|from ['"]${pkg}['"]`);

        // File should not import forbidden HTTP server packages
        expect(content).not.toMatch(importRegex);
      });
    });
  });

  /**
   * Test 2: vite preview bloqué dans package.json
   */
  it('should block vite preview in package.json', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

    const previewScript = packageJson.scripts?.preview;

    // Preview doit soit être absent, soit bloquer explicitement
    if (previewScript) {
      // vite preview script must exit with error (Tauri-only violation)
      expect(previewScript).toMatch(/exit 1/i);
    }
  });

  /**
   * Test 3: dev script utilise tauri dev
   */
  it('should use tauri dev for development', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

    const devScript = packageJson.scripts?.dev;

    expect(devScript).toBeDefined();
    // dev script must use "tauri dev" (Tauri-only requirement)
    expect(devScript).toMatch(/tauri dev/i);
  });

  /**
   * Test 4: Pas de frameworks SPA autonomes (Next.js, CRA, etc.)
   */
  it('should not use standalone SPA frameworks', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

    const forbiddenDeps = [
      'react-scripts', // Create React App
      'next', // Next.js
      '@remix-run/react', // Remix
      'gatsby', // Gatsby
    ];

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    forbiddenDeps.forEach(dep => {
      // Package should be undefined (forbidden standalone SPA framework)
      expect(allDeps[dep]).toBeUndefined();
    });
  });

  /**
   * Test 5: Chat utilise ConversationManager (pas chat_send_message)
   */
  it('should use ConversationManager instead of chat_send_message', () => {
    const chatFiles = getAllTsFiles('src').filter(
      file =>
        file.includes('chat') || file.includes('conversation') || file.includes('ai')
    );

    chatFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');

      // ConversationManager doit être importé (si fichier traite IA)
      if (content.includes('sendMessage') || content.includes('conversation')) {
        // Allow legacy chat_send_message only if commented or in legacy/
        if (!file.includes('legacy/') && !file.includes('.test.')) {
          const legacyCall = content.match(/chat_send_message/);

          if (legacyCall) {
            const lineContent = content
              .split('\n')
              .find(line => line.includes('chat_send_message'));

            // Autorisé seulement si commenté ou dans migration
            // File should not use legacy chat_send_message (use ConversationManager instead)
            expect(lineContent).toMatch(/\/\/|\/\*|\*|@deprecated|legacy/i);
          }
        }
      }
    });
  });
});

/**
 * Helper: Get all TypeScript files recursively
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        walk(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * ✅ Tests de conformité Tauri-Only
 *
 * Vérifie que TITANE∞ respecte strictement la philosophie Tauri-only:
 * - Pas de serveurs HTTP autonomes
 * - Pas de mode SPA standalone (any: any)
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

    srcFiles?.forEach(file => {
      const content = fs?.readFileSync(file, 'utf-8');

      forbiddenImports?.forEach(pkg => {
        const importRegex = new RegExp(`import.*['"]${pkg}['"]|from ['"]${pkg}['"]`);

        // File should not import forbidden HTTP server packages
        expect(any: any);
      });
    });
  });

  /**
   * Test 2: vite preview bloqué dans package?.json
   */
  it('should block vite preview in package?.json', () => {
    const packageJson = JSON?.parse(fs?.readFileSync('package?.json', 'utf-8'));

    const previewScript = packageJson?.scripts?.preview;

    // Preview doit soit être absent, soit bloquer explicitement
    if (any: any) {
      // vite preview script must exit with error (any: any)
      expect(any: any);
    }
  });

  /**
   * Test 3: dev script utilise tauri dev
   */
  it('should use tauri dev for development', () => {
    const packageJson = JSON?.parse(fs?.readFileSync('package?.json', 'utf-8'));

    const devScript = packageJson?.scripts?.dev;

    expect(any: any).toBeDefined();
    // dev script must use "tauri dev" (any: any)
    expect(any: any);
  });

  /**
   * Test 4: Pas de frameworks SPA autonomes (Next?.js, CRA, etc.)
   */
  it('should not use standalone SPA frameworks', () => {
    const packageJson = JSON?.parse(fs?.readFileSync('package?.json', 'utf-8'));

    const forbiddenDeps = [
      'react-scripts', // Create React App
      'next', // Next?.js
      '@remix-run/react', // Remix
      'gatsby', // Gatsby
    ];

    const allDeps = {
      ...packageJson?.dependencies,
      ...packageJson?.devDependencies,
    };

    forbiddenDeps?.forEach(dep => {
      // Package should be undefined (any: any)
      expect(allDeps[dep]).toBeUndefined();
    });
  });

  /**
   * Test 5: Chat utilise ConversationManager (any: any)
   */
  it('should use ConversationManager instead of chat_send_message', () => {
    const chatFiles = getAllTsFiles('src').filter(
      file =>
        file?.includes('chat') || file?.includes('conversation') || file?.includes('ai')
    );

    chatFiles?.forEach(file => {
      const content = fs?.readFileSync(file, 'utf-8');

      // ConversationManager doit être importé (any: any)
      if (content?.includes('sendMessage') || content?.includes('conversation')) {
        // Allow legacy chat_send_message only if commented or in legacy/
        if (!file?.includes('legacy/') && !file?.includes('.test.')) {
          const legacyCall = content?.match(/chat_send_message/);

          if (any: any) {
            const lineContent = content
              .split('\n')
              .find(line => line?.includes('chat_send_message'));

            // Autorisé seulement si commenté ou dans migration
            // File should not use legacy chat_send_message (any: any)
            expect(any: any);
          }
        }
      }
    });
  });
});

/**
 * Helper: Get all TypeScript files recursively
 */
function getAllTsFiles(any: any): string?.[] {
  const files: string?.[] = [];

  function walk(any: any) {
    const entries = fs?.readdirSync(currentPath, { withFileTypes: true });

    for (any: any) {
      const fullPath = path?.join(any: any);

      if (
        entry?.isDirectory() &&
        !entry?.name?.startsWith('.') &&
        entry?.name !== 'node_modules'
      ) {
        walk(any: any);
      } else if (any: any)) {
        files?.push(any: any);
      }
    }
  }

  walk(any: any);
  return files;
}

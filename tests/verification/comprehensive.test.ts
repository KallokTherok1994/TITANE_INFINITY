import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('🔍 Comprehensive Project Verification', () => {
  describe('📁 File Structure', () => {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'src-tauri/Cargo.toml',
      'src-tauri/tauri.conf.json',
      'src/main.tsx',
      'src/App.tsx',
      'README.md',
    ];

    it.each(requiredFiles)('should have %s', file => {
      expect(fs.existsSync(file)).toBe(true);
    });

    const requiredDirs = ['src', 'src-tauri/src', 'tests', 'docs', 'config'];

    it.each(requiredDirs)('should have %s directory', dir => {
      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.statSync(dir).isDirectory()).toBe(true);
    });
  });

  describe('📦 Dependencies', () => {
    let packageJson: any;

    beforeAll(() => {
      packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    });

    it('should have required dependencies', () => {
      const required = ['react', 'react-dom', 'i18next', 'react-i18next', 'dompurify'];

      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      required.forEach(dep => {
        expect(deps).toHaveProperty(dep);
      });
    });

    it('should have test scripts', () => {
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts).toHaveProperty('test:e2e');
      expect(packageJson.scripts).toHaveProperty('test:a11y');
    });

    it('should have build scripts', () => {
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('dev');
    });
  });

  describe('🔐 Security Files', () => {
    it('should have security module', () => {
      expect(fs.existsSync('src-tauri/src/security/mod.rs')).toBe(true);
      expect(fs.existsSync('src-tauri/src/security/validation.rs')).toBe(true);
      expect(fs.existsSync('src-tauri/src/security/rate_limit.rs')).toBe(true);
    });

    it('should have frontend sanitizer', () => {
      expect(fs.existsSync('src/security/Sanitizer.ts')).toBe(true);
    });

    it('should have security config', () => {
      expect(fs.existsSync('config/security.toml')).toBe(true);
    });
  });

  describe('♿ Accessibility Files', () => {
    it('should have a11y modules', () => {
      expect(fs.existsSync('src/a11y/FocusManager.tsx')).toBe(true);
      expect(fs.existsSync('src/a11y/ScreenReader.tsx')).toBe(true);
      expect(fs.existsSync('src/a11y/KeyboardShortcuts.tsx')).toBe(true);
    });

    it('should have a11y styles', () => {
      expect(fs.existsSync('src/styles/a11y.css')).toBe(true);

      const css = fs.readFileSync('src/styles/a11y.css', 'utf-8');
      expect(css).toContain('.sr-only');
      expect(css).toContain('focus-visible');
      expect(css).toContain('prefers-reduced-motion');
    });
  });

  describe('🌍 i18n Files', () => {
    it('should have i18n setup', () => {
      expect(fs.existsSync('src/i18n/index.ts')).toBe(true);
    });

    it('should have translation files', () => {
      expect(fs.existsSync('src/i18n/locales/fr.json')).toBe(true);
      expect(fs.existsSync('src/i18n/locales/en.json')).toBe(true);
    });

    it('should have matching translation keys', () => {
      const fr = JSON.parse(fs.readFileSync('src/i18n/locales/fr.json', 'utf-8'));
      const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf-8'));

      const frKeys = Object.keys(fr);
      const enKeys = Object.keys(en);

      expect(frKeys.sort()).toEqual(enKeys.sort());
    });
  });

  describe('📚 Documentation', () => {
    const requiredDocs = [
      'README.md',
      'docs/PRODUCTION_READY.md',
      'docs/SECURITY_HARDENING.md',
      'docs/ACCESSIBILITY.md',
      'docs/I18N.md',
      'docs/TESTING.md',
      'docs/DEPLOYMENT.md',
    ];

    it.each(requiredDocs)('should have %s', doc => {
      expect(fs.existsSync(doc)).toBe(true);
      const content = fs.readFileSync(doc, 'utf-8');
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('🧪 Test Coverage', () => {
    it('should have test files for critical modules', () => {
      const criticalModules = [
        'tests/security.test.ts',
        'tests/a11y.test.tsx',
        'tests/e2e/chat.spec.ts',
      ];

      criticalModules.forEach(test => {
        expect(fs.existsSync(test)).toBe(true);
      });
    });
  });

  describe('⚙️ Configuration', () => {
    it('should have CI/CD config', () => {
      expect(fs.existsSync('.github/workflows/ci.yml')).toBe(true);
      expect(fs.existsSync('.github/workflows/release.yml')).toBe(true);
    });

    it('should have Playwright config', () => {
      expect(fs.existsSync('playwright.config.ts')).toBe(true);
    });

    it('should have TypeScript config', () => {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
  });
});

/**
 * TITANE∞ Deployment & AppImage Configuration Tests
 *
 * @description Tests de vérification pour la configuration de déploiement,
 * les méthodes de build et la génération d'AppImage
 *
 * @version 26.2.0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Project root path
const PROJECT_ROOT = process.cwd();

// Helper constants
const CARGO_VERSION_REGEX = /^version\s*=\s*"([^"]+)"/m;

/**
 * Extract version from Cargo.toml content
 */
function extractCargoVersion(content: string): string {
  const match = content.match(CARGO_VERSION_REGEX);
  return match ? match[1] : '';
}

/**
 * Create regex pattern for command detection in case statements
 */
function createCommandPattern(cmd: string): RegExp {
  return new RegExp(`^\\s*${cmd}\\)`, 'm');
}

describe('🚀 Deployment Configuration Verification', () => {
  describe('📦 Build Configuration', () => {
    let packageJson: Record<string, unknown>;
    let cargoToml: string;

    beforeAll(() => {
      packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      cargoToml = fs.readFileSync('src-tauri/Cargo.toml', 'utf-8');
    });

    it('should have required build scripts', () => {
      const scripts = packageJson.scripts as Record<string, string>;

      expect(scripts).toHaveProperty('build');
      expect(scripts).toHaveProperty('dev');
      expect(scripts).toHaveProperty('build:production');
    });

    it('should have titane deployment scripts', () => {
      const scripts = packageJson.scripts as Record<string, string>;

      expect(scripts).toHaveProperty('titane');
      expect(scripts).toHaveProperty('titane:build');
      expect(scripts).toHaveProperty('titane:deploy');
      expect(scripts).toHaveProperty('titane:full');
    });

    it('should have Cargo release profile configured', () => {
      expect(cargoToml).toContain('[profile.release]');
      expect(cargoToml).toContain('opt-level');
    });

    it('should have LTO optimization configured', () => {
      expect(cargoToml).toContain('lto');
    });

    it('should have consistent versioning', () => {
      const tauriConfig = JSON.parse(
        fs.readFileSync('src-tauri/tauri.conf.json', 'utf-8')
      );

      const pkgVersion = packageJson.version as string;
      const tauriVersion = tauriConfig.version as string;

      // Extract version from Cargo.toml using helper
      const cargoVersion = extractCargoVersion(cargoToml);

      expect(pkgVersion).toBe(tauriVersion);
      expect(pkgVersion).toBe(cargoVersion);
    });
  });

  describe('⚙️ Tauri Configuration', () => {
    let tauriConfig: Record<string, unknown>;

    beforeAll(() => {
      tauriConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf-8'));
    });

    it('should have valid Tauri schema', () => {
      expect(tauriConfig['$schema']).toContain('tauri.app');
    });

    it('should have product name defined', () => {
      expect(tauriConfig.productName).toBeDefined();
      expect(typeof tauriConfig.productName).toBe('string');
    });

    it('should have identifier defined', () => {
      expect(tauriConfig.identifier).toBeDefined();
      expect(tauriConfig.identifier).toMatch(/^com\./);
    });

    it('should have bundle configuration active', () => {
      const bundle = tauriConfig.bundle as Record<string, unknown>;
      expect(bundle).toBeDefined();
      expect(bundle.active).toBe(true);
    });

    it('should have icons configured', () => {
      const bundle = tauriConfig.bundle as Record<string, unknown>;
      const icons = bundle.icon as string[];

      expect(icons).toBeDefined();
      expect(icons.length).toBeGreaterThan(0);

      // Verify at least one icon exists
      const iconExists = icons.some(icon => {
        const iconPath = path.join(PROJECT_ROOT, 'src-tauri', icon);
        return fs.existsSync(iconPath);
      });

      expect(iconExists).toBe(true);
    });

    it('should have CSP configured for security', () => {
      const app = tauriConfig.app as Record<string, unknown>;
      const security = app.security as Record<string, unknown>;

      expect(security).toBeDefined();
      expect(security.csp).toBeDefined();
      expect(typeof security.csp).toBe('string');
    });

    it('should have main window configured', () => {
      const app = tauriConfig.app as Record<string, unknown>;
      const windows = app.windows as Array<Record<string, unknown>>;

      expect(windows).toBeDefined();
      expect(windows.length).toBeGreaterThan(0);

      const mainWindow = windows.find(w => w.label === 'main');
      expect(mainWindow).toBeDefined();
      expect(mainWindow?.width).toBeGreaterThan(0);
      expect(mainWindow?.height).toBeGreaterThan(0);
    });
  });

  describe('🏠 Runtime Configurations', () => {
    it('should have dev runtime configuration', () => {
      expect(fs.existsSync('runtime/dev/tauri.conf.json')).toBe(true);
    });

    it('should have stable runtime configuration', () => {
      expect(fs.existsSync('runtime/stable/tauri.conf.json')).toBe(true);
    });

    it('should have dev runtime build script', () => {
      expect(fs.existsSync('runtime/dev/run-dev.sh')).toBe(true);
    });

    it('should have stable runtime build script', () => {
      expect(fs.existsSync('runtime/stable/build.sh')).toBe(true);
    });

    it('stable version should not contain -dev suffix', () => {
      const stableConfig = JSON.parse(
        fs.readFileSync('runtime/stable/tauri.conf.json', 'utf-8')
      );
      const version = stableConfig.version as string;

      expect(version).not.toContain('-dev');
    });

    it('stable runtime should target AppImage', () => {
      const stableConfig = JSON.parse(
        fs.readFileSync('runtime/stable/tauri.conf.json', 'utf-8')
      );
      const bundle = stableConfig.bundle as Record<string, unknown>;
      const targets = bundle.targets;

      const hasAppImage =
        targets === 'all' || (Array.isArray(targets) && targets.includes('appimage'));

      expect(hasAppImage).toBe(true);
    });
  });

  describe('📜 Deployment Scripts', () => {
    const requiredScripts = [
      { path: 'titane.sh', description: 'Main deployment command' },
      { path: 'scripts/build_titane.sh', description: 'Build script' },
      { path: 'scripts/deploy-production.sh', description: 'Production deploy' },
      { path: 'runtime/stable/build.sh', description: 'Stable build' },
    ];

    it.each(requiredScripts)(
      'should have $description at $path',
      ({ path: scriptPath }) => {
        expect(fs.existsSync(scriptPath)).toBe(true);
      }
    );

    it('titane.sh should have all required commands', () => {
      const tauriScript = fs.readFileSync('titane.sh', 'utf-8');
      const requiredCommands = [
        'clean',
        'repair',
        'fix',
        'build',
        'deploy',
        'full',
        'health',
      ];

      requiredCommands.forEach(cmd => {
        // Check for command in case statement using helper
        expect(tauriScript).toMatch(createCommandPattern(cmd));
      });
    });

    it('scripts should be bash compatible', () => {
      const scripts = ['titane.sh', 'scripts/build_titane.sh', 'runtime/stable/build.sh'];

      scripts.forEach(scriptPath => {
        if (fs.existsSync(scriptPath)) {
          const content = fs.readFileSync(scriptPath, 'utf-8');
          expect(
            content.startsWith('#!/bin/bash') || content.startsWith('#!/usr/bin/env bash')
          ).toBe(true);
        }
      });
    });
  });

  describe('🔧 Installer Scripts', () => {
    const installerScripts = [
      'installer/install.sh',
      'installer/uninstall.sh',
      'installer/update.sh',
      'installer/checks/check_dependencies.sh',
    ];

    it.each(installerScripts)('should have %s', scriptPath => {
      expect(fs.existsSync(scriptPath)).toBe(true);
    });

    it('dependency checker should verify essential tools', () => {
      const checker = fs.readFileSync('installer/checks/check_dependencies.sh', 'utf-8');

      expect(checker).toContain('cargo');
      expect(checker).toContain('node');
      expect(checker).toContain('pnpm');
    });
  });

  describe('🔄 CI/CD Workflows', () => {
    it('should have CI workflow', () => {
      expect(fs.existsSync('.github/workflows/ci-unified.yml')).toBe(true);
    });

    it('should have release workflow', () => {
      expect(fs.existsSync('.github/workflows/release-unified.yml')).toBe(true);
    });

    it('release workflow should build for Linux', () => {
      const releaseWorkflow = fs.readFileSync(
        '.github/workflows/release-unified.yml',
        'utf-8'
      );
      expect(releaseWorkflow).toContain('ubuntu');
    });

    it('release workflow should reference AppImage', () => {
      const releaseWorkflow = fs.readFileSync(
        '.github/workflows/release-unified.yml',
        'utf-8'
      );
      expect(releaseWorkflow.toLowerCase()).toContain('appimage');
    });

    it('release workflow should upload artifacts', () => {
      const releaseWorkflow = fs.readFileSync(
        '.github/workflows/release-unified.yml',
        'utf-8'
      );
      expect(releaseWorkflow).toContain('actions/upload-artifact');
    });
  });

  describe('🖼️ Icons & Assets', () => {
    it('should have icons directory', () => {
      expect(fs.existsSync('src-tauri/icons')).toBe(true);
    });

    const requiredIcons = ['src-tauri/icons/32x32.png', 'src-tauri/icons/128x128.png'];

    it.each(requiredIcons)('should have icon %s', iconPath => {
      expect(fs.existsSync(iconPath)).toBe(true);
    });

    it('should have desktop entry file', () => {
      const desktopFileExists =
        fs.existsSync('titane-infinity.desktop') ||
        fs.existsSync('scripts/titane-infinity.desktop');

      expect(desktopFileExists).toBe(true);
    });
  });

  describe('📂 Deployment Directory Structure', () => {
    const requiredDirs = [
      'deployment',
      'installer',
      'installer/checks',
      'runtime/dev',
      'runtime/stable',
      'scripts/audit',
      '.github/workflows',
    ];

    it.each(requiredDirs)('should have %s directory', dir => {
      expect(fs.existsSync(dir)).toBe(true);
      expect(fs.statSync(dir).isDirectory()).toBe(true);
    });
  });

  describe('📋 Documentation', () => {
    it('should have deployment documentation', () => {
      const hasDeployDocs =
        fs.existsSync('deployment/QUICK_DEPLOY.md') ||
        fs.existsSync('docs/DEPLOYMENT.md') ||
        fs.existsSync('QUICKSTART_UBUNTU_24.04.md');

      expect(hasDeployDocs).toBe(true);
    });

    it('should have README with build instructions', () => {
      const readme = fs.readFileSync('README.md', 'utf-8');
      expect(readme.toLowerCase()).toContain('build');
    });
  });

  describe('🔐 Security Configuration', () => {
    it('should not expose development server in production', () => {
      const stableConfig = JSON.parse(
        fs.readFileSync('runtime/stable/tauri.conf.json', 'utf-8')
      );
      const build = stableConfig.build as Record<string, unknown>;

      // Stable should not have devUrl or beforeDevCommand
      expect(build.beforeDevCommand || '').toBe('');
    });

    it('should have CSP in stable configuration', () => {
      const stableConfig = JSON.parse(
        fs.readFileSync('runtime/stable/tauri.conf.json', 'utf-8')
      );
      const app = stableConfig.app as Record<string, unknown>;
      const security = app.security as Record<string, unknown>;

      expect(security.csp).toBeDefined();
    });
  });
});

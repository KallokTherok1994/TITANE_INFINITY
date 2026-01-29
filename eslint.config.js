import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const legacyConfig = require('./.eslintrc.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const ignores = [
  'backups/',
  'backup_*/',
  '*.backup.*',
  '*.old.*',
  '*.new.*',
  'docs/legacy/',
  'docs/archive/',
  'src-tauri/archive/',
  'scripts/archive/',
  '_archive/',
  'legacy/',
  'dist/',
  'build/',
  'out/',
  'target/',
  'src-tauri/target/',
  'node_modules/',
  '.pnpm-store/',
  '.vite/',
  '.vite-cache/',
  '*.log',
  '.DS_Store',
  '**/*.d.ts',
];

const lintFiles = ['src/**/*.{js,jsx,ts,tsx}'];
const compatConfig = compat.config(legacyConfig).map(config => ({
  ...config,
  files: lintFiles,
}));

export default [
  { ignores },
  {
    files: lintFiles,
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  ...compatConfig,
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['src/components/chat/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    files: ['src/ui/pages/Chat.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];

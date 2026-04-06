import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  resolveNativeBinaryPolicy,
} = require('../../../scripts/e2e/native-binary-policy.cjs');

const tempDirs: string[] = [];

function makeTempRoot(): string {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'titane-native-policy-'));
  tempDirs.push(rootDir);
  return rootDir;
}

function writeExecutable(filePath: string, mtimeMs: number): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, '#!/bin/sh\nexit 0\n', 'utf8');
  fs.chmodSync(filePath, 0o755);
  const timestamp = new Date(mtimeMs);
  fs.utimesSync(filePath, timestamp, timestamp);
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('resolveNativeBinaryPolicy', () => {
  it('selects the newest discovered AppImage without relying on hardcoded versions', () => {
    const rootDir = makeTempRoot();
    const olderPath = path.join(
      rootDir,
      'runtime/stable/Titan-Stable_28.88.0_amd64.AppImage'
    );
    const newerPath = path.join(
      rootDir,
      'deployment/latest/Titan-Stable_28.90.0_amd64.AppImage'
    );

    fs.mkdirSync(path.join(rootDir, 'src-tauri'), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, 'src-tauri/tauri.conf.json'),
      JSON.stringify({ version: '28.90.0' }),
      'utf8'
    );
    fs.writeFileSync(
      path.join(rootDir, 'package.json'),
      JSON.stringify({ version: '28.90.0' }),
      'utf8'
    );

    writeExecutable(olderPath, Date.now() - 60_000);
    writeExecutable(newerPath, Date.now());

    const policy = resolveNativeBinaryPolicy({ rootDir, mode: 'release' });

    expect(policy.selectedBinaryPath).toBe(newerPath);
    expect(policy.selectedBinaryKind).toBe('appimage');
  });
});

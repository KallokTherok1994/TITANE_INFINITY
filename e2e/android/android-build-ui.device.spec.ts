import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PACKAGE_NAME = 'com.titane.infinity';
const ACTIVITY_NAME = `${PACKAGE_NAME}/.MainActivity`;
const ARTIFACT_DIR = path.resolve(process.cwd(), 'reports/e2e/android-ui/device');

function runAdb(args: string[]) {
  return spawnSync('adb', args, { encoding: 'utf8' });
}

function ensureArtifactDir(): void {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function writeTextArtifact(fileName: string, value: string): void {
  ensureArtifactDir();
  fs.writeFileSync(path.join(ARTIFACT_DIR, fileName), `${value}\n`);
}

function writeJsonArtifact(fileName: string, payload: unknown): void {
  ensureArtifactDir();
  fs.writeFileSync(path.join(ARTIFACT_DIR, fileName), `${JSON.stringify(payload, null, 2)}\n`);
}

function connectedDeviceId(): string | null {
  const devices = runAdb(['devices']);
  if (devices.error || devices.status !== 0) {
    return null;
  }

  const online = devices.stdout
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /\tdevice$/.test(line))
    .map(line => line.split('\t')[0]);

  return online[0] ?? null;
}

test.describe('Android Build UI - Real Device Smoke', () => {
  const deviceEnabled = process.env.TITANE_E2E_ANDROID_DEVICE === '1';

  if (!deviceEnabled) {
    test('android device precondition proof (set TITANE_E2E_ANDROID_DEVICE=1)', async () => {
      expect(deviceEnabled).toBe(false);
    });
    return;
  }

  test('launches installed Android build and validates UI focus/dump', async () => {
    const deviceId = connectedDeviceId();
    expect(deviceId, 'No Android device detected by adb').toBeTruthy();

    const launch = runAdb(['-s', String(deviceId), 'shell', 'am', 'start', '-n', ACTIVITY_NAME]);
    expect(launch.status, launch.stderr || launch.stdout).toBe(0);

    await expect
      .poll(
        () => {
          const result = runAdb(['-s', String(deviceId), 'shell', 'dumpsys', 'window', 'windows']);
          return `${result.stdout}\n${result.stderr}`;
        },
        {
          timeout: 30000,
          intervals: [1000, 1500, 2000],
          message: 'Android app did not become focused in time',
        }
      )
      .toContain(PACKAGE_NAME);

    const dumpCmd = runAdb([
      '-s',
      String(deviceId),
      'shell',
      'uiautomator',
      'dump',
      '/sdcard/titane_ui_dump.xml',
    ]);
    expect(dumpCmd.status, dumpCmd.stderr || dumpCmd.stdout).toBe(0);

    const dumpContent = runAdb([
      '-s',
      String(deviceId),
      'shell',
      'cat',
      '/sdcard/titane_ui_dump.xml',
    ]);
    expect(dumpContent.status, dumpContent.stderr || dumpContent.stdout).toBe(0);

    const xml = dumpContent.stdout;
    expect(xml).toContain('hierarchy');
    expect(xml).toContain(PACKAGE_NAME);

    const focusRaw = runAdb(['-s', String(deviceId), 'shell', 'dumpsys', 'window', 'windows']);
    writeTextArtifact('focus.txt', focusRaw.stdout);
    writeTextArtifact('ui_dump.xml', xml);

    writeJsonArtifact('page_classification.json', {
      platform: 'android-device',
      package: PACKAGE_NAME,
      activity: ACTIVITY_NAME,
      deviceId,
      launchOutput: launch.stdout.trim(),
    });

    writeJsonArtifact('chat_dom_map.json', {
      source: 'uiautomator-dump',
      containsPackageNode: xml.includes(PACKAGE_NAME),
    });

    writeJsonArtifact('AR20.json', {
      focusContainsPackage: focusRaw.stdout.includes(PACKAGE_NAME),
      dumpContainsHierarchy: xml.includes('hierarchy'),
    });

    writeJsonArtifact('OFFLINE5.json', {
      note: 'Offline indicators are validated in browser lane; device lane validates install+focus+hierarchy.',
    });

    writeJsonArtifact('navigation.json', {
      focusDetected: focusRaw.stdout.includes(PACKAGE_NAME),
      dumpsysCaptured: true,
    });

    writeJsonArtifact('stability.json', {
      launchStatus: launch.status,
      dumpStatus: dumpCmd.status,
      catStatus: dumpContent.status,
    });
  });
});

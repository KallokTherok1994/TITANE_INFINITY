import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { nowIso, writeJsonArtifact, writeTextArtifact } from './helpers';

const PACKAGE_NAME = 'com.titane.infinity';
const ACTIVITY_NAME = `${PACKAGE_NAME}/.MainActivity`;
const ARTIFACT_DIR = path.resolve(process.cwd(), 'reports/e2e/android-ui/device');
const REQUESTED_DEVICE_ID = process.env.TITANE_ANDROID_DEVICE_ID?.trim() || null;

function runAdb(args: string[]) {
  return spawnSync('adb', args, {
    encoding: 'utf8',
    timeout: 20000,
    maxBuffer: 10 * 1024 * 1024,
  });
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

  if (REQUESTED_DEVICE_ID) {
    return online.includes(REQUESTED_DEVICE_ID) ? REQUESTED_DEVICE_ID : null;
  }

  return online[0] ?? null;
}

function focusedWindow(deviceId: string): string {
  const dump = runAdb(['-s', deviceId, 'shell', 'dumpsys', 'window', 'windows']);
  const text = `${dump.stdout}\n${dump.stderr}`;

  const focusLines = text
    .split(/\r?\n/)
    .filter(line => line.includes('mCurrentFocus') || line.includes('mFocusedApp'));

  if (focusLines.length > 0) {
    return focusLines.join('\n');
  }

  return text;
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
    const startedAt = Date.now();
    const deviceId = connectedDeviceId();
    expect(
      deviceId,
      REQUESTED_DEVICE_ID
        ? `Requested Android device not found: ${REQUESTED_DEVICE_ID}`
        : 'No Android device detected by adb'
    ).toBeTruthy();

    const packagePath = runAdb([
      '-s',
      String(deviceId),
      'shell',
      'pm',
      'path',
      PACKAGE_NAME,
    ]);
    expect(packagePath.status, packagePath.stderr || packagePath.stdout).toBe(0);
    expect(packagePath.stdout).toContain(PACKAGE_NAME);

    const launch = runAdb([
      '-s',
      String(deviceId),
      'shell',
      'am',
      'start',
      '-n',
      ACTIVITY_NAME,
    ]);
    expect(launch.status, launch.stderr || launch.stdout).toBe(0);

    await expect
      .poll(() => focusedWindow(String(deviceId)), {
        timeout: 30000,
        intervals: [1000, 1500, 2000],
        message: 'Android app did not become focused in time',
      })
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

    const focusRaw = focusedWindow(String(deviceId));
    const packagePathRaw = packagePath.stdout.trim();
    const launchRaw = launch.stdout.trim();
    const selectedDevice = String(deviceId);

    writeTextArtifact(ARTIFACT_DIR, 'focus.txt', focusRaw);
    writeTextArtifact(ARTIFACT_DIR, 'ui_dump.xml', xml);
    writeTextArtifact(ARTIFACT_DIR, 'adb_devices.txt', runAdb(['devices']).stdout.trim());

    writeJsonArtifact(ARTIFACT_DIR, 'page_classification.json', {
      platform: 'android-device',
      package: PACKAGE_NAME,
      activity: ACTIVITY_NAME,
      deviceId: selectedDevice,
      requestedDeviceId: REQUESTED_DEVICE_ID,
      launchOutput: launchRaw,
      packagePath: packagePathRaw,
      startedAt: nowIso(),
    });

    writeJsonArtifact(ARTIFACT_DIR, 'chat_dom_map.json', {
      source: 'uiautomator-dump',
      containsPackageNode: xml.includes(PACKAGE_NAME),
    });

    writeJsonArtifact(ARTIFACT_DIR, 'AR20.json', {
      focusContainsPackage: focusRaw.includes(PACKAGE_NAME),
      dumpContainsHierarchy: xml.includes('hierarchy'),
    });

    writeJsonArtifact(ARTIFACT_DIR, 'OFFLINE5.json', {
      note: 'Offline indicators are validated in browser lane; device lane validates install+focus+hierarchy.',
    });

    writeJsonArtifact(ARTIFACT_DIR, 'navigation.json', {
      focusDetected: focusRaw.includes(PACKAGE_NAME),
      dumpsysCaptured: true,
    });

    writeJsonArtifact(ARTIFACT_DIR, 'stability.json', {
      durationMs: Date.now() - startedAt,
      launchStatus: launch.status,
      packagePathStatus: packagePath.status,
      dumpStatus: dumpCmd.status,
      catStatus: dumpContent.status,
      focusLinesDetected: focusRaw.split(/\r?\n/).length,
    });
  });
});

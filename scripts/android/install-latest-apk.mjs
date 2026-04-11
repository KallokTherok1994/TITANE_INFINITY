import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const apkRoot = path.join(
  repoRoot,
  'src-tauri',
  'gen',
  'android',
  'app',
  'build',
  'outputs',
  'apk'
);

function collectApks(root) {
  if (!fs.existsSync(root)) return [];

  const found = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolute);
      } else if (entry.isFile() && absolute.endsWith('.apk')) {
        const stat = fs.statSync(absolute);
        found.push({
          absolute,
          relative: path.relative(repoRoot, absolute),
          mtimeMs: stat.mtimeMs,
          isDebug: absolute.includes(`${path.sep}debug${path.sep}`),
          isRelease: absolute.includes(`${path.sep}release${path.sep}`),
        });
      }
    }
  }

  return found.sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function pickPreferredApk(apks) {
  return (
    apks.find(apk => apk.isDebug) ?? apks.find(apk => apk.isRelease) ?? apks[0] ?? null
  );
}

function waitMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function runAdb(args, options = {}) {
  return spawnSync('adb', args, {
    encoding: 'utf8',
    ...options,
  });
}

function readDeviceProp(deviceId, prop) {
  const result = runAdb(['-s', deviceId, 'shell', 'getprop', prop]);
  if (result.error || result.status !== 0) return '';
  return result.stdout.trim();
}

function inspectDeviceReadiness(deviceId) {
  const packageService = runAdb(['-s', deviceId, 'shell', 'service', 'list']);
  const pmPath = runAdb(['-s', deviceId, 'shell', 'pm', 'path', 'android']);
  const sysBootCompleted = readDeviceProp(deviceId, 'sys.boot_completed');
  const devBootComplete = readDeviceProp(deviceId, 'dev.bootcomplete');
  const bootAnimation = readDeviceProp(deviceId, 'init.svc.bootanim');
  const deviceProvisioned = runAdb([
    '-s',
    deviceId,
    'shell',
    'settings',
    'get',
    'global',
    'device_provisioned',
  ]).stdout.trim();
  const userSetupComplete = runAdb([
    '-s',
    deviceId,
    'shell',
    'settings',
    'get',
    'secure',
    'user_setup_complete',
  ]).stdout.trim();
  const bootCompleted = sysBootCompleted === '1' || devBootComplete === '1';
  const provisioningReady = deviceProvisioned === '1' && userSetupComplete === '1';
  const packageServiceReady =
    !packageService.error &&
    packageService.status === 0 &&
    /\bpackage\b/i.test(packageService.stdout);
  const pmPathReady =
    !pmPath.error && pmPath.status === 0 && pmPath.stdout.includes('package:');

  return {
    deviceId,
    sysBootCompleted: sysBootCompleted || '-',
    devBootComplete: devBootComplete || '-',
    bootAnimation: bootAnimation || '-',
    deviceProvisioned: deviceProvisioned || '-',
    userSetupComplete: userSetupComplete || '-',
    packageServiceReady,
    pmPathReady,
    ready: bootCompleted && provisioningReady && packageServiceReady && pmPathReady,
  };
}

function waitForDeviceReady(deviceId, timeoutMs = 180_000) {
  const start = Date.now();
  let snapshot = inspectDeviceReadiness(deviceId);

  while (!snapshot.ready && Date.now() - start < timeoutMs) {
    waitMs(2_000);
    snapshot = inspectDeviceReadiness(deviceId);
  }

  return snapshot;
}

function shouldRetryInstall(result) {
  const combined = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  return /(device offline|device .* not found|cannot connect|closed|Can't find service: package|NullPointerException)/i.test(
    combined
  );
}

function printOutput(result) {
  if (result.stdout?.trim()) console.log(result.stdout.trim());
  if (result.stderr?.trim()) console.error(result.stderr.trim());
}

const dryRun = process.argv.includes('--dry-run');
const apks = collectApks(apkRoot);
const preferred = pickPreferredApk(apks);

console.log('ANDROID_INSTALL_LATEST_APK');

if (!preferred) {
  console.error('status=BLOCKED');
  console.error('error=no APK found under src-tauri/gen/android/app/build/outputs/apk');
  console.error(
    'next_step=run an explicit build first: corepack pnpm run android:build:mock:debug or corepack pnpm run android:build:full:debug'
  );
  process.exit(1);
}

console.log(`selected_apk=${preferred.relative}`);
console.log(
  `selection_reason=${preferred.isDebug ? 'debug-preferred' : preferred.isRelease ? 'release-fallback' : 'latest-apk'}`
);
console.log(`install_command=adb install -r ${preferred.relative}`);

if (dryRun) {
  console.log('status=DRY_RUN');
  process.exit(0);
}

if (preferred.isRelease && preferred.relative.endsWith('-unsigned.apk')) {
  console.error('status=BLOCKED');
  console.error('error=selected-apk-is-unsigned-release');
  console.error(
    'next_step=build a debug APK via `corepack pnpm run android:build:mock:debug` or configure Android signing, then rerun the install helper'
  );
  process.exit(1);
}

const adbDevices = runAdb(['devices']);
if (adbDevices.error) {
  console.error('status=BLOCKED');
  console.error('error=adb not found in PATH');
  console.error(
    'next_step=install Android platform-tools or export adb into PATH, then retry'
  );
  process.exit(1);
}

if (adbDevices.status !== 0) {
  console.error('status=FAIL');
  printOutput(adbDevices);
  process.exit(adbDevices.status ?? 1);
}

const connectedDevices = adbDevices.stdout
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => /\tdevice$/.test(line))
  .map(line => line.split('\t')[0]);

if (connectedDevices.length === 0) {
  console.error('status=BLOCKED');
  console.error('error=no connected Android device/emulator detected');
  console.error('next_step=run `adb devices`, connect a device or emulator, then retry');
  process.exit(1);
}

const targetDevice = connectedDevices[0];
console.log(`devices=${connectedDevices.join(',')}`);
console.log(`target_device=${targetDevice}`);

runAdb(['-s', targetDevice, 'wait-for-device'], { timeout: 30_000 });
const readiness = waitForDeviceReady(targetDevice);
console.log(
  `boot_readiness=sys=${readiness.sysBootCompleted}:dev=${readiness.devBootComplete}:bootanim=${readiness.bootAnimation}:prov=${readiness.deviceProvisioned}:setup=${readiness.userSetupComplete}:package=${readiness.packageServiceReady ? '1' : '0'}:pm=${readiness.pmPathReady ? '1' : '0'}`
);

if (!readiness.ready) {
  console.error('status=BLOCKED');
  console.error('error=device-not-boot-ready');
  console.error(
    'next_step=wait until sys.boot_completed=1 and user_setup_complete=1, or provision the clean AVD before retrying'
  );
  process.exit(1);
}

let installResult = null;
for (let attempt = 1; attempt <= 3; attempt += 1) {
  console.log(`install_attempt=${attempt}`);
  installResult = runAdb(['-s', targetDevice, 'install', '-r', preferred.absolute], {
    timeout: 300_000,
  });
  printOutput(installResult);

  if (!installResult.error && installResult.status === 0) {
    console.log('status=PASS');
    process.exit(0);
  }

  if (attempt < 3 && installResult && shouldRetryInstall(installResult)) {
    const retryReadiness = waitForDeviceReady(targetDevice, 60_000);
    console.log(
      `retry_boot_readiness=sys=${retryReadiness.sysBootCompleted}:dev=${retryReadiness.devBootComplete}:bootanim=${retryReadiness.bootAnimation}:prov=${retryReadiness.deviceProvisioned}:setup=${retryReadiness.userSetupComplete}:package=${retryReadiness.packageServiceReady ? '1' : '0'}:pm=${retryReadiness.pmPathReady ? '1' : '0'}`
    );
  } else {
    break;
  }
}

if (installResult?.error) {
  console.error('status=FAIL');
  console.error(`error=${installResult.error.message}`);
  process.exit(1);
}

if (installResult && shouldRetryInstall(installResult)) {
  console.error('status=BLOCKED');
  console.error('error=device-offline-or-package-manager-not-ready');
  console.error(
    'next_step=ensure the emulator reaches full boot, stays online, and is provisioned before rerunning `corepack pnpm run android:install:latest`'
  );
  process.exit(1);
}

console.error('status=FAIL');
process.exit(installResult?.status ?? 1);

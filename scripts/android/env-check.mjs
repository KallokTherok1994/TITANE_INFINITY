import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const requiredTargets = [
  'aarch64-linux-android',
  'armv7-linux-androideabi',
  'i686-linux-android',
  'x86_64-linux-android',
];

function resolveCommandPath(command) {
  const result = spawnSync('sh', ['-lc', `command -v ${command}`], { encoding: 'utf8' });
  if (result.status === 0) {
    return result.stdout.trim();
  }
  return '';
}

function commandExists(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  return {
    found: !result.error,
    path: resolveCommandPath(command),
  };
}

function findSdkDir() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? '';
}

function runAdb(args) {
  return spawnSync('adb', args, { encoding: 'utf8' });
}

function listConnectedDevices() {
  const adb = runAdb(['devices']);
  if (adb.error || adb.status !== 0) {
    return { available: false, devices: [] };
  }

  const devices = adb.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /\tdevice$/.test(line))
    .map((line) => line.split('\t')[0]);

  return { available: true, devices };
}

function inspectDeviceReadiness(deviceId) {
  const readProp = (prop) => {
    const result = runAdb(['-s', deviceId, 'shell', 'getprop', prop]);
    if (result.error || result.status !== 0) return '';
    return result.stdout.trim();
  };

  const packageService = runAdb(['-s', deviceId, 'shell', 'service', 'list']);
  const pmPath = runAdb(['-s', deviceId, 'shell', 'pm', 'path', 'android']);
  const sysBootCompleted = readProp('sys.boot_completed');
  const devBootComplete = readProp('dev.bootcomplete');
  const bootAnimation = readProp('init.svc.bootanim');
  const deviceProvisioned = readProp('ro.setupwizard.mode') === 'DISABLED'
    ? '1'
    : runAdb(['-s', deviceId, 'shell', 'settings', 'get', 'global', 'device_provisioned']).stdout.trim();
  const userSetupComplete = runAdb([
    '-s',
    deviceId,
    'shell',
    'settings',
    'get',
    'secure',
    'user_setup_complete',
  ]).stdout.trim();

  const packageServiceReady =
    !packageService.error && packageService.status === 0 && /\bpackage\b/i.test(packageService.stdout);
  const pmPathReady = !pmPath.error && pmPath.status === 0 && pmPath.stdout.includes('package:');
  const bootCompleted = sysBootCompleted === '1' || devBootComplete === '1';
  const provisioningReady = deviceProvisioned === '1' && userSetupComplete === '1';

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

function listInstalledRustTargets() {
  const rustup = spawnSync('rustup', ['target', 'list', '--installed'], { encoding: 'utf8' });
  if (rustup.error || rustup.status !== 0) {
    return [];
  }
  return rustup.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const java = commandExists('java', ['-version']);
const adb = commandExists('adb', ['version']);
const sdkmanager = commandExists('sdkmanager', ['--version']);
const sdkDir = findSdkDir();
const ndkDir = sdkDir ? path.join(sdkDir, 'ndk') : '';
const ndkInstalled = Boolean(ndkDir && fs.existsSync(ndkDir) && fs.readdirSync(ndkDir).length > 0);
const deviceState = adb.found ? listConnectedDevices() : { available: false, devices: [] };
const deviceReadiness = deviceState.devices.map(inspectDeviceReadiness);
const readyDevices = deviceReadiness.filter((device) => device.ready).map((device) => device.deviceId);
const installedTargets = listInstalledRustTargets();
const missingTargets = requiredTargets.filter((target) => !installedTargets.includes(target));

const blockers = [];
const warnings = [];

if (!java.found) blockers.push('java-missing');
if (!adb.found) blockers.push('adb-missing');
if (!sdkDir) blockers.push('android-sdk-missing');
if (!ndkInstalled) blockers.push('android-ndk-missing');
if (missingTargets.length > 0) blockers.push('rust-android-targets-missing');
if (deviceState.devices.length === 0) blockers.push('no-device-connected');
if (deviceState.devices.length > 0 && readyDevices.length === 0) blockers.push('device-not-boot-ready');
if (!sdkmanager.found) warnings.push('sdkmanager-not-in-path');

console.log('ANDROID_ENV_REPORT');
console.log(`java=${java.found ? `yes:${java.path}` : 'no'}`);
console.log(`adb=${adb.found ? `yes:${adb.path}` : 'no'}`);
console.log(`sdkmanager=${sdkmanager.found ? `yes:${sdkmanager.path}` : 'no'}`);
console.log(`android_sdk_dir=${sdkDir || 'missing'}`);
console.log(`ndk_installed=${ndkInstalled ? 'yes' : 'no'}`);
console.log(`rust_android_targets=${requiredTargets.length - missingTargets.length}/${requiredTargets.length}`);
console.log(`missing_rust_targets=${missingTargets.length > 0 ? missingTargets.join(',') : 'none'}`);
console.log(`connected_devices=${deviceState.devices.length}`);
console.log(`device_ids=${deviceState.devices.length > 0 ? deviceState.devices.join(',') : 'none'}`);
console.log(`ready_devices=${readyDevices.length}`);
console.log(`ready_device_ids=${readyDevices.length > 0 ? readyDevices.join(',') : 'none'}`);
console.log(
  `device_readiness=${deviceReadiness.length > 0 ? deviceReadiness
    .map(
      (device) =>
        `${device.deviceId}:${device.ready ? 'ready' : 'not-ready'}:sys=${device.sysBootCompleted}:dev=${device.devBootComplete}:bootanim=${device.bootAnimation}:prov=${device.deviceProvisioned}:setup=${device.userSetupComplete}:package=${device.packageServiceReady ? '1' : '0'}:pm=${device.pmPathReady ? '1' : '0'}`
    )
    .join(';') : 'none'}`
);
console.log(`warnings=${warnings.length > 0 ? warnings.join(',') : 'none'}`);

if (blockers.length > 0) {
  console.log('status=BLOCKED');
  console.log(`blockers=${blockers.join(',')}`);

  if (blockers.includes('no-device-connected')) {
    console.log('next_step=connect an Android device or start an emulator, then rerun `corepack pnpm run android:install:latest`');
  } else if (blockers.includes('device-not-boot-ready')) {
    console.log('next_step=wait until the emulator reports sys.boot_completed=1 and user_setup_complete=1, or provision the clean AVD before rerunning the install');
  } else if (blockers.includes('rust-android-targets-missing')) {
    console.log(`next_step=run \`rustup target add ${missingTargets.join(' ')}\``);
  } else if (blockers.includes('android-sdk-missing')) {
    console.log('next_step=install Android SDK command-line tools or export ANDROID_HOME / ANDROID_SDK_ROOT');
  } else if (blockers.includes('android-ndk-missing')) {
    console.log('next_step=install a compatible Android NDK under your SDK directory');
  } else if (blockers.includes('adb-missing')) {
    console.log('next_step=install Android platform-tools so `adb` is available in PATH');
  } else {
    console.log('next_step=finish the missing Android prerequisites, then rerun the local finishing flow');
  }

  process.exit(1);
}

console.log('status=PASS');

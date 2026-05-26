import os from 'node:os';

const platform = os.platform();
const release = os.release();
const isCi = String(process.env.CI || '').toLowerCase() === 'true';
const isGitHubActions = String(process.env.GITHUB_ACTIONS || '').toLowerCase() === 'true';
const runnerOs = process.env.RUNNER_OS || '';
const shellHint =
  process.env.SHELL || process.env.ComSpec || process.env.PSModulePath || 'UNKNOWN';

let osHost = 'UNKNOWN';
let classification = 'UNKNOWN';

if (platform === 'win32') {
  const build = Number(release.split('.')[2] || 0);
  if (isGitHubActions || runnerOs.toLowerCase() === 'windows') {
    osHost = 'GITHUB_ACTIONS_WINDOWS';
    classification = 'PASS';
  } else if (build >= 22000) {
    osHost = 'WINDOWS_11_LOCAL';
    classification = 'PASS';
  } else {
    osHost = 'WINDOWS_LOCAL';
    classification = 'UNKNOWN';
  }
} else if (platform === 'linux') {
  osHost =
    isGitHubActions || runnerOs.toLowerCase() === 'linux'
      ? 'GITHUB_ACTIONS_LINUX'
      : 'LINUX_LOCAL';
  classification = 'PASS';
} else if (platform === 'darwin') {
  osHost = 'MACOS_LOCAL';
  classification = isCi ? 'UNKNOWN' : 'PASS';
}

console.log(`OS_HOST=${osHost}`);
console.log(`OS_FAMILY=${platform}`);
console.log(`OS_VERSION=${release}`);
console.log(`CI=${isCi ? 'true' : 'false'}`);
console.log(`SHELL_HINT=${shellHint}`);
console.log(`OS_HOST_CLASSIFICATION=${classification}`);

if (classification === 'FAIL') {
  process.exitCode = 1;
}

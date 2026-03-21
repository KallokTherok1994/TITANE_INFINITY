const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

function statMtimeMs(filePath) {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return -1;
  }
}

function existsExecutable(filePath) {
  if (!filePath) return false;
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function newestAssetMtimeMs(assetsDir) {
  if (!fs.existsSync(assetsDir)) return -1;
  let newest = -1;
  for (const entry of fs.readdirSync(assetsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = path.join(assetsDir, entry.name);
    const current = statMtimeMs(full);
    if (current > newest) newest = current;
  }
  return newest;
}

function listWorkspaceChanges(rootDir) {
  try {
    const out = execSync('git status --porcelain', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    const lines = out
      .split('\n')
      .map(line => line.trimEnd())
      .filter(Boolean);

    const relevant = [];
    for (const line of lines) {
      // Format examples:
      // " M src/App.tsx"
      // "?? src/new.ts"
      const rawPath = line.slice(3).trim();
      if (!rawPath) continue;
      const normalized = rawPath.replace(/\\/g, '/');
      if (
        normalized.startsWith('src/') ||
        normalized.startsWith('src-tauri/') ||
        normalized === 'package.json' ||
        normalized === 'pnpm-lock.yaml' ||
        normalized === 'vite.config.ts' ||
        normalized === 'index.html'
      ) {
        const fullPath = path.resolve(rootDir, normalized);
        relevant.push({
          path: normalized,
          mtimeMs: statMtimeMs(fullPath),
        });
      }
    }
    return relevant;
  } catch {
    return [];
  }
}

function pickByPreference(candidates, mode) {
  const release = candidates.find(item => item.kind === 'release');
  const debug = candidates.find(item => item.kind === 'debug');
  const appimage = candidates.find(item => item.kind === 'appimage');

  if (mode === 'debug') {
    return debug || release || appimage || null;
  }
  if (mode === 'release') {
    return release || debug || appimage || null;
  }

  return candidates
    .slice()
    .sort((left, right) => right.mtimeMs - left.mtimeMs)[0] || null;
}

function classifyFreshness({ selectedKind, isFresh, explicitOverride, workspaceAhead }) {
  if (workspaceAhead) return 'WORKSPACE_AHEAD_OF_RUNTIME';
  if (!isFresh) {
    if (selectedKind === 'debug') return 'STALE_DEBUG_BINARY';
    if (selectedKind === 'release') return 'STALE_RELEASE_BINARY';
    return 'BUILD_REQUIRED';
  }

  if (selectedKind === 'debug') return 'FRESH_DEBUG_BINARY';
  if (selectedKind === 'release') return 'FRESH_RELEASE_BINARY';
  if (explicitOverride) return 'FRESH_CERTIFIED_BINARY';
  return 'FRESH_CERTIFIED_BINARY';
}

function resolveNativeBinaryPolicy(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const explicitBinaryPath = (options.explicitBinaryPath || '').trim();
  const tauriDevServerUrl = (options.tauriDevServerUrl || '').trim();

  // debug-preferred in dev server mode, release-preferred for native certification,
  // newest fallback for generic runs if mode is not explicit.
  let mode = (options.mode || '').trim().toLowerCase();
  if (!mode) {
    mode = tauriDevServerUrl ? 'debug' : 'release';
  }
  if (!['debug', 'release', 'newest'].includes(mode)) {
    mode = 'release';
  }

  const debugPath = path.resolve(rootDir, 'src-tauri/target/debug/titane-infinity');
  const releasePath = path.resolve(rootDir, 'src-tauri/target/release/titane-infinity');
  const appImagePaths = [
    // newest first: policy selects the first executable found
    path.resolve(rootDir, 'src-tauri/target/release/bundle/appimage/TITANE-Infinity_28.6.0_amd64.AppImage'),
    path.resolve(rootDir, 'deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage'),
    path.resolve(rootDir, 'deployment/latest/TITANE-Infinity_28.0.0_amd64.AppImage'),
    path.resolve(rootDir, 'runtime/stable/Titan-Stable_27.2.0_amd64.AppImage'),
    path.resolve(rootDir, 'deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage'),
  ];

  const existingAppImage = appImagePaths.find(filePath => existsExecutable(filePath)) || '';
  const candidates = [
    { kind: 'debug', filePath: debugPath, mtimeMs: statMtimeMs(debugPath) },
    { kind: 'release', filePath: releasePath, mtimeMs: statMtimeMs(releasePath) },
    { kind: 'appimage', filePath: existingAppImage, mtimeMs: statMtimeMs(existingAppImage) },
  ].filter(item => item.filePath && item.mtimeMs >= 0);

  const explicitExists = existsExecutable(explicitBinaryPath);
  const selected = explicitExists
    ? {
        kind: explicitBinaryPath.includes('/debug/') ? 'debug' : explicitBinaryPath.includes('/release/') ? 'release' : 'appimage',
        filePath: path.resolve(explicitBinaryPath),
        mtimeMs: statMtimeMs(explicitBinaryPath),
      }
    : pickByPreference(candidates, mode);

  // Build inputs: source configuration files only.
  // dist/ is intentionally excluded — it is a build OUTPUT (produced by vite),
  // not a source file. Including it as an input causes false STALE verdicts when
  // vite is invoked after cargo (e.g. post-build processing or re-bundling passes).
  const buildInputs = [
    {
      key: 'tauri_conf',
      filePath: path.resolve(rootDir, 'src-tauri/tauri.conf.json'),
      mtimeMs: statMtimeMs(path.resolve(rootDir, 'src-tauri/tauri.conf.json')),
    },
    {
      key: 'cargo_toml',
      filePath: path.resolve(rootDir, 'src-tauri/Cargo.toml'),
      mtimeMs: statMtimeMs(path.resolve(rootDir, 'src-tauri/Cargo.toml')),
    },
    {
      key: 'package_json',
      filePath: path.resolve(rootDir, 'package.json'),
      mtimeMs: statMtimeMs(path.resolve(rootDir, 'package.json')),
    },
  ];

  const maxInput = buildInputs
    .filter(item => item.mtimeMs >= 0)
    .sort((left, right) => right.mtimeMs - left.mtimeMs)[0] || {
    key: 'none',
    filePath: '',
    mtimeMs: -1,
  };

  const selectedMtimeMs = selected?.mtimeMs ?? -1;
  const changedInputs = listWorkspaceChanges(rootDir);
  const workspaceAheadPaths = changedInputs
    .filter(item => item.mtimeMs > selectedMtimeMs)
    .map(item => item.path);
  const workspaceAhead = workspaceAheadPaths.length > 0;
  const hasValidBinary = !!selected?.filePath && selectedMtimeMs >= 0;
  const isFresh = hasValidBinary && selectedMtimeMs >= maxInput.mtimeMs;

  let freshnessClass = 'NO_VALID_BINARY';
  if (hasValidBinary) {
    freshnessClass = classifyFreshness({
      selectedKind: selected.kind,
      isFresh,
      explicitOverride: explicitExists,
      workspaceAhead,
    });
  }

  const buildRequired =
    freshnessClass === 'NO_VALID_BINARY' ||
    freshnessClass === 'STALE_DEBUG_BINARY' ||
    freshnessClass === 'STALE_RELEASE_BINARY' ||
    freshnessClass === 'WORKSPACE_AHEAD_OF_RUNTIME' ||
    freshnessClass === 'BUILD_REQUIRED';

  const selectionReason = explicitExists
    ? 'EXPLICIT_TAURI_BINARY_PATH'
    : mode === 'debug'
      ? 'DEBUG_PREFERRED_POLICY'
      : mode === 'release'
        ? 'RELEASE_PREFERRED_POLICY'
        : 'NEWEST_BINARY_POLICY';

  return {
    mode,
    selectedBinaryPath: selected?.filePath || '',
    selectedBinaryKind: selected?.kind || 'none',
    selectedBinaryMtimeMs: selectedMtimeMs,
    selectionReason,
    precedence: explicitExists
      ? ['explicit', 'policy']
      : mode === 'debug'
        ? ['debug', 'release', 'appimage']
        : mode === 'release'
          ? ['release', 'debug', 'appimage']
          : ['newest(debug/release/appimage)'],
    freshnessClass,
    buildRequired,
    workspaceAhead,
    workspaceAheadPaths,
    freshnessBasis: {
      maxInputKey: maxInput.key,
      maxInputPath: maxInput.filePath,
      maxInputMtimeMs: maxInput.mtimeMs,
      buildInputs,
    },
    candidates,
    shouldBlock: buildRequired,
  };
}

function formatPolicySummary(policy) {
  return [
    `class=${policy.freshnessClass}`,
    `mode=${policy.mode}`,
    `reason=${policy.selectionReason}`,
    `selected=${policy.selectedBinaryPath || '<none>'}`,
    `selectedKind=${policy.selectedBinaryKind}`,
    `selectedMtimeMs=${policy.selectedBinaryMtimeMs}`,
    `basis=${policy.freshnessBasis.maxInputKey}:${policy.freshnessBasis.maxInputPath}`,
    `basisMtimeMs=${policy.freshnessBasis.maxInputMtimeMs}`,
    `workspaceAhead=${policy.workspaceAhead}`,
  ].join(' | ');
}

if (require.main === module) {
  const rootDir = process.cwd();
  const policy = resolveNativeBinaryPolicy({
    rootDir,
    explicitBinaryPath: process.env.TAURI_BINARY_PATH || '',
    tauriDevServerUrl: process.env.TAURI_DEV_SERVER_URL || '',
    mode: process.env.TITANE_NATIVE_BINARY_MODE || '',
  });
  console.log(JSON.stringify(policy, null, 2));
  if (process.env.TITANE_BINARY_POLICY_ENFORCE === '1' && policy.shouldBlock) {
    process.exit(2);
  }
}

module.exports = {
  resolveNativeBinaryPolicy,
  formatPolicySummary,
};
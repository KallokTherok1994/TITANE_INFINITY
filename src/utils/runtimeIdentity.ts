/**
 * TITANE∞ — Runtime Identity Probe
 * Deterministic runtime classification without secrets.
 */

export type RuntimeKind =
  | 'tauri-stable'
  | 'tauri-dev'
  | 'browser-dev'
  | 'browser-preview'
  | 'unknown';

export type BinarySource = 'appimage' | 'deb-installed' | 'browser' | 'unknown';

export interface RuntimeIdentity {
  packageVersion: string;
  buildTruthVersion: string | null;
  buildTimestamp: string | null;
  runtimeKind: RuntimeKind;
  isTauriRuntimeAvailable: boolean;
  hasTauriInternals: boolean;
  currentUrl: string;
  userAgent: string;
  appMode: string;
  source: BinarySource;
  surfaceTruth: string | null;
  surfaceRing: string | null;
  isDev: boolean;
  tauriVersion: string | null;
}

declare const __APP_VERSION__: string;

function detectRuntimeKind(
  hasTauriAPI: boolean,
  hasTauriInternals: boolean,
  hasTauriUA: boolean,
  protocol: string,
  isDev: boolean
): RuntimeKind {
  const isTauri = hasTauriAPI || hasTauriInternals || hasTauriUA || protocol === 'tauri';
  if (!isTauri) {
    return isDev ? 'browser-dev' : 'browser-preview';
  }
  return isDev ? 'tauri-dev' : 'tauri-stable';
}

function detectBinarySource(protocol: string, userAgent: string): BinarySource {
  if (protocol !== 'tauri' && protocol !== 'http' && protocol !== 'https') {
    return 'unknown';
  }
  if (protocol !== 'tauri') return 'browser';
  if (userAgent.toLowerCase().includes('appimage')) return 'appimage';
  if (
    userAgent.toLowerCase().includes('deb') ||
    userAgent.toLowerCase().includes('installed')
  ) {
    return 'deb-installed';
  }
  return 'appimage';
}

let _buildTruth: { appVersion?: string; buildTimestamp?: string } | null | undefined =
  undefined;

async function loadBuildTruth(): Promise<{
  appVersion?: string;
  buildTimestamp?: string;
} | null> {
  if (_buildTruth !== undefined) return _buildTruth;
  try {
    const res = await fetch('/build-truth.json');
    if (!res.ok) {
      _buildTruth = null;
      return null;
    }
    _buildTruth = (await res.json()) as { appVersion?: string; buildTimestamp?: string };
    return _buildTruth;
  } catch {
    _buildTruth = null;
    return null;
  }
}

export async function resolveRuntimeIdentity(): Promise<RuntimeIdentity> {
  if (typeof window === 'undefined') {
    return {
      packageVersion: __APP_VERSION__,
      buildTruthVersion: null,
      buildTimestamp: null,
      runtimeKind: 'unknown',
      isTauriRuntimeAvailable: false,
      hasTauriInternals: false,
      currentUrl: '',
      userAgent: '',
      appMode: 'ssr',
      source: 'unknown',
      surfaceTruth: null,
      surfaceRing: null,
      isDev: false,
      tauriVersion: null,
    };
  }

  const w = window as typeof window & {
    __TAURI__?: { getVersion?: () => Promise<string> };
    __TAURI_INTERNALS__?: unknown;
  };

  const hasTauriAPI = '__TAURI__' in window;
  const hasTauriInternals = '__TAURI_INTERNALS__' in window;
  const userAgent = navigator.userAgent || '';
  const hasTauriUA = userAgent.toLowerCase().includes('tauri');
  const protocol = window.location.protocol.replace(':', '');
  const isDev = Boolean(
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV
  );

  const runtimeKind = detectRuntimeKind(
    hasTauriAPI,
    hasTauriInternals,
    hasTauriUA,
    protocol,
    isDev
  );

  const source = detectBinarySource(protocol, userAgent);

  let tauriVersion: string | null = null;
  try {
    if (hasTauriAPI && w.__TAURI__?.getVersion) {
      tauriVersion = await w.__TAURI__.getVersion();
    }
  } catch {
    // ignore
  }

  const bt = await loadBuildTruth();
  const appMode = isDev ? 'development' : 'production';

  const rootEl = document.querySelector('[data-surface-truth]');
  const surfaceTruth = rootEl?.getAttribute('data-surface-truth') ?? null;
  const surfaceRing = rootEl?.getAttribute('data-surface-ring') ?? null;

  return {
    packageVersion: __APP_VERSION__,
    buildTruthVersion: bt?.appVersion ?? null,
    buildTimestamp: bt?.buildTimestamp ?? null,
    runtimeKind,
    isTauriRuntimeAvailable:
      hasTauriAPI || hasTauriInternals || hasTauriUA || protocol === 'tauri',
    hasTauriInternals,
    currentUrl: window.location.href,
    userAgent,
    appMode,
    source,
    surfaceTruth,
    surfaceRing,
    isDev,
    tauriVersion,
  };
}

export function applyRuntimeIdentityToDOM(identity: RuntimeIdentity): void {
  const root = document.documentElement;
  root.setAttribute('data-runtime-kind', identity.runtimeKind);
  root.setAttribute('data-app-version', identity.packageVersion);
  if (identity.buildTimestamp) {
    root.setAttribute('data-build-timestamp', identity.buildTimestamp);
  }
  root.setAttribute('data-binary-source', identity.source);
  if (identity.buildTruthVersion) {
    root.setAttribute('data-ui-build-id', identity.buildTruthVersion);
  }
}

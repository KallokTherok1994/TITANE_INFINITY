/**
 * TITANE_INFINITY — Minimal boot loader.
 * Purpose: make startup observable even when main.tsx fails.
 */

type MemoryCoreLogLevel = 'Info' | 'Warning' | 'Error';

type MemoryCoreLogEntry = {
  id: string;
  timestamp: number;
  level: MemoryCoreLogLevel;
  module: string;
  message: string;
};

type TauriInvoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

function getTauriInvoke(): TauriInvoke | null {
  const w = window as unknown as {
    __TAURI__?: { core?: { invoke?: TauriInvoke } };
    __TAURI_INTERNALS__?: { invoke?: TauriInvoke };
  };

  const invokeFromTauri = w.__TAURI__?.core?.invoke;
  if (typeof invokeFromTauri === 'function') {
    return invokeFromTauri;
  }

  const invokeFromInternals = w.__TAURI_INTERNALS__?.invoke;
  if (typeof invokeFromInternals === 'function') {
    return invokeFromInternals;
  }

  return null;
}

function createBootBeacon(): HTMLDivElement {
  const existing = document.getElementById('titane-boot-beacon');
  if (existing && existing instanceof HTMLDivElement) {
    return existing;
  }

  const el = document.createElement('div');
  el.id = 'titane-boot-beacon';
  el.textContent = 'TITANE BOOT: boot.ts chargé';
  el.style.position = 'fixed';
  el.style.left = '8px';
  el.style.top = '8px';
  el.style.zIndex = '2147483647';
  el.style.fontFamily = 'monospace';
  el.style.fontSize = '12px';
  el.style.padding = '6px 8px';
  el.style.borderRadius = '6px';
  el.style.background = 'rgba(0,0,0,0.75)';
  el.style.color = '#fff';
  el.style.pointerEvents = 'none';

  document.documentElement.appendChild(el);
  return el;
}

async function tryWriteLog(message: string, level: MemoryCoreLogLevel = 'Info'): Promise<void> {
  try {
    const invoke = getTauriInvoke();
    if (!invoke) {
      return;
    }

    const now = Date.now();
    const entry: MemoryCoreLogEntry = {
      id: `ui-${now}-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: now,
      level,
      module: 'frontend.boot',
      message,
    };

    await invoke('write_log', { log: entry });
  } catch {
    // Never break boot for logging
  }
}

async function boot(): Promise<void> {
  const beacon = createBootBeacon();
  await tryWriteLog('boot.ts: start');

  try {
    beacon.textContent = 'TITANE BOOT: import main.tsx…';
    await tryWriteLog('boot.ts: importing main.tsx');

    await import('./main');

    beacon.textContent = 'TITANE BOOT: main.tsx import OK';
    await tryWriteLog('boot.ts: main.tsx import OK');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    beacon.textContent = `TITANE BOOT: main.tsx import FAILED: ${msg}`;
    await tryWriteLog(`boot.ts: main.tsx import FAILED: ${msg}`, 'Error');
  }
}

void boot();

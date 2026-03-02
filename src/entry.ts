type BootWindow = Window & {
  __TITANE_BOOT__?: Record<string, unknown>;
  __TITANE_BOOT_READY__?: boolean;
  __TAURI_INTERNALS__?: {
    invoke?: (command: string, payload?: Record<string, unknown>) => Promise<unknown>;
  };
};

const getBootWindow = (): BootWindow => window as BootWindow;

const emitBootMarker = async (marker: string): Promise<void> => {
  try {
    const win = getBootWindow();
    const invoke = win.__TAURI_INTERNALS__?.invoke;
    if (typeof invoke === 'function') {
      await invoke('boot_marker_log', { marker });
    }
  } catch {
    // no-op
  }
};

const hideLoaderElements = (): void => {
  const splash = document.querySelector('.loading-splash') as HTMLElement | null;
  if (splash) {
    splash.style.display = 'none';
    splash.style.visibility = 'hidden';
    splash.style.opacity = '0';
    splash.setAttribute('aria-hidden', 'true');
  }

  const fallback = document.querySelector('.page-loading-fallback') as HTMLElement | null;
  if (fallback) {
    fallback.style.display = 'none';
    fallback.style.visibility = 'hidden';
    fallback.style.opacity = '0';
    fallback.setAttribute('aria-hidden', 'true');
  }
};

const showFatalOverlay = (error: unknown): void => {
  const existing = document.getElementById('titane-entry-fatal');
  if (existing) return;

  const host = document.getElementById('root') ?? document.body;
  const overlay = document.createElement('div');
  overlay.id = 'titane-entry-fatal';
  overlay.setAttribute('role', 'alert');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '2147483647';
  overlay.style.background = '#0b1020';
  overlay.style.color = '#e2e8f0';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.gap = '10px';
  overlay.style.padding = '24px';
  overlay.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

  const title = document.createElement('h1');
  title.textContent = 'TITANE∞ — démarrage partiel';
  title.style.margin = '0';
  title.style.fontSize = '20px';

  const message = document.createElement('p');
  message.textContent =
    "Le noyau est lancé mais l'interface principale n'a pas pu se charger. Le chargement infini a été arrêté.";
  message.style.margin = '0';
  message.style.maxWidth = '720px';
  message.style.textAlign = 'center';

  const details = document.createElement('pre');
  details.textContent = String(error);
  details.style.margin = '0';
  details.style.maxWidth = '860px';
  details.style.maxHeight = '260px';
  details.style.overflow = 'auto';
  details.style.whiteSpace = 'pre-wrap';
  details.style.wordBreak = 'break-word';
  details.style.background = 'rgba(148, 163, 184, 0.14)';
  details.style.border = '1px solid rgba(148, 163, 184, 0.3)';
  details.style.padding = '10px';
  details.style.borderRadius = '8px';

  const button = document.createElement('button');
  button.textContent = 'Relancer l’interface';
  button.style.padding = '10px 14px';
  button.style.border = '1px solid rgba(148, 163, 184, 0.4)';
  button.style.borderRadius = '8px';
  button.style.background = 'rgba(148, 163, 184, 0.14)';
  button.style.color = '#e2e8f0';
  button.style.cursor = 'pointer';
  button.onclick = () => window.location.reload();

  overlay.append(title, message, details, button);
  host.appendChild(overlay);
};

const resolveMainModuleSpecifier = async (): Promise<string> => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return './main.tsx';
  }

  try {
    const response = await fetch('./main-entry.json', { cache: 'no-store' });
    if (response.ok) {
      const manifest = (await response.json()) as { main?: string | null };
      const mainChunk = manifest.main;
      if (mainChunk) {
        return new URL(`./${mainChunk}`, window.location.href).href;
      }
    }
  } catch {
    // fallback below
  }

  return '';
};

const bootstrap = async (): Promise<void> => {
  const win = getBootWindow();
  win.__TITANE_BOOT__ = win.__TITANE_BOOT__ || {};
  win.__TITANE_BOOT__.entry_ts = true;
  win.__TITANE_BOOT__.entry_ts_timestamp = Date.now();

  const failSafe = (reason: unknown): void => {
    if (win.__TITANE_BOOT_READY__) {
      return;
    }
    hideLoaderElements();
    showFatalOverlay(reason);
  };

  const startedAt = Date.now();
  const loaderGuardTimer = window.setInterval(() => {
    if (win.__TITANE_BOOT_READY__) {
      window.clearInterval(loaderGuardTimer);
      return;
    }

    if (Date.now() - startedAt >= 3000) {
      hideLoaderElements();
    }
  }, 250);

  window.addEventListener('error', event => {
    failSafe(event.error ?? event.message);
  });

  window.addEventListener('unhandledrejection', event => {
    failSafe(event.reason);
  });

  window.setTimeout(() => {
    if (!win.__TITANE_BOOT_READY__) {
      failSafe('BOOT_WATCHDOG_ENTRY_8S');
      void emitBootMarker('BOOT:ENTRY_WATCHDOG_8S');
    }
  }, 8000);

  await emitBootMarker('BOOT:ENTRY_START');

  try {
    const importMain = new Function('specifier', 'return import(specifier);') as (
      specifier: string
    ) => Promise<unknown>;
    const specifier = await resolveMainModuleSpecifier();
    if (!specifier) {
      throw new Error('MAIN_CHUNK_UNRESOLVED');
    }
    await importMain(specifier);
    await emitBootMarker('BOOT:ENTRY_MAIN_IMPORTED');
  } catch (error) {
    hideLoaderElements();
    showFatalOverlay(error);
    const errorDetails =
      error instanceof Error
        ? `${error.name}:${error.message}|${error.stack || ''}`
        : String(error);
    await emitBootMarker(`BOOT:ENTRY_IMPORT_FAIL|${errorDetails.slice(0, 420)}`);
  }
};

void bootstrap();

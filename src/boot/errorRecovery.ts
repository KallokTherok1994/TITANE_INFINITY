/**
 * TITANE_INFINITY — Boot: Error Recovery
 * Extracted from src/main.tsx (pure refactor, no behavior change).
 *
 * Exports: escapeHtmlForError, tryWriteMemoryCoreLog, showFatalErrorOverlay
 * Types:   MemoryCoreLogLevel, FatalErrorOverlayPayload, TitaneBootDiagnostics
 */

import { safeInvokeTauri } from '../utils/tauriProtector';
import { TAURI_COMMANDS } from '../core/commands/TAURI_COMMANDS';

export type MemoryCoreLogLevel = 'Info' | 'Warning' | 'Error';

export type FatalErrorOverlayPayload = {
  title: string;
  message: string;
  stack?: string;
  source?: string;
};

export type TitaneBootDiagnostics = {
  stage: string;
  timestamp: number;
};

/**
 * Échapper les caractères HTML pour prévenir XSS dans les fallbacks d'erreur
 */
export const escapeHtmlForError = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
};

export const tryWriteMemoryCoreLog = (
  level: MemoryCoreLogLevel,
  module: string,
  message: string
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const w = window as Window & {
      __TAURI__?: unknown;
      __TAURI_INTERNALS__?: unknown;
    };
    const isTauri = Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
    if (!isTauri) {
      return;
    }

    const now = Date.now();
    const id = `ui-${now}-${Math.random().toString(36).slice(2, 10)}`;

    void safeInvokeTauri<void>(
      TAURI_COMMANDS.MEMORY_WRITE_LOG,
      {
        log: {
          id,
          timestamp: now,
          level,
          module,
          message,
        },
      },
      2000
    ).catch(() => {
      // Do not break UI boot if logging fails
    });
  } catch {
    // Do not break UI boot if logging fails
  }
};

export const showFatalErrorOverlay = (payload: FatalErrorOverlayPayload): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const docAny = document as Document & { __titaneFatalOverlayShown?: boolean };
  if (docAny.__titaneFatalOverlayShown) {
    return;
  }
  docAny.__titaneFatalOverlayShown = true;

  const safeTitle = escapeHtmlForError(payload.title);
  const safeMessage = escapeHtmlForError(payload.message);
  const safeStack = escapeHtmlForError(payload.stack ?? '');
  const safeSource = escapeHtmlForError(payload.source ?? '');

  const stackBlock = safeStack
    ? `<details style="margin-top: 1rem;"><summary style="cursor:pointer;color:#8899aa;">Détails techniques</summary><pre style="margin-top:0.75rem;white-space:pre-wrap;background:#000;padding:1rem;border-radius:8px;max-height:45vh;overflow:auto;">${safeStack}</pre></details>`
    : '';

  const sourceLine = safeSource
    ? `<div style="margin-top:0.75rem;color:#9ca3af;font-size:0.85rem;">Source: ${safeSource}</div>`
    : '';

  const hint =
    'Astuce: appuie sur F12 (ou Ctrl+Shift+I) pour ouvrir les DevTools si disponibles.';

  document.body.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      min-height:100vh;
      background:#0a0a0a;
      color:#ff4444;
      font-family:monospace;
      padding:2rem;
      text-align:left;
    ">
      <div style="max-width: 980px; width: 100%;">
        <h1 style="font-size:1.6rem;margin:0 0 0.75rem 0;">⚠️ ${safeTitle}</h1>
        <div style="color:#9ca3af;margin-bottom:1rem;">${safeMessage}</div>
        ${sourceLine}
        <div style="margin-top:1rem;color:#9ca3af;font-size:0.9rem;">${escapeHtmlForError(hint)}</div>
        ${stackBlock}
      </div>
    </div>
  `;

  tryWriteMemoryCoreLog(
    'Error',
    'frontend.fatal',
    `${payload.title}: ${payload.message}${payload.source ? ` (${payload.source})` : ''}`
  );
};

export const registerFatalErrorHandlers = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('error', ev => {
    try {
      const err = ev.error instanceof Error ? ev.error : undefined;
      const message = err?.message || ev.message || 'Erreur JavaScript non gérée';
      const stack = err?.stack;
      showFatalErrorOverlay({
        title: 'Erreur UI (non capturée)',
        message,
        stack,
        source: ev.filename
          ? `${ev.filename}:${ev.lineno ?? 0}:${ev.colno ?? 0}`
          : undefined,
      });
    } catch {
      // Ne jamais casser le boot sur un handler d'erreur
    }
  });

  window.addEventListener('unhandledrejection', ev => {
    try {
      const reason = ev.reason;
      const err = reason instanceof Error ? reason : undefined;
      const message =
        err?.message ||
        (typeof reason === 'string' ? reason : 'Promise rejection non gérée');
      const stack = err?.stack;
      showFatalErrorOverlay({
        title: 'Erreur UI (Promise non gérée)',
        message,
        stack,
      });
    } catch {
      // Ne jamais casser le boot sur un handler d'erreur
    }
  });
};

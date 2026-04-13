/**
 * TITANE_INFINITY — Boot: Beacon UI
 * Extracted from src/main.tsx (pure refactor, no behavior change).
 *
 * Exports: getUILogsSnapshot, showDebugOverlay, startBootBeacon
 */

import { escapeHtmlForError, TitaneBootDiagnostics } from './errorRecovery';

export const getUILogsSnapshot = (): unknown => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem('titane_ui_logs');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return parsed;
    }
    return parsed.slice(-200);
  } catch (error) {
    return { error: 'Failed to read titane_ui_logs', details: String(error) };
  }
};

export const showDebugOverlay = (title: string, payload: unknown): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const existing = document.getElementById('titane-debug-overlay');
  if (existing) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'titane-debug-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  let body: string;
  try {
    body = JSON.stringify(payload, null, 2);
  } catch {
    body = String(payload);
  }

  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    ">
      <div style="
        width: min(1100px, 100%);
        max-height: 85vh;
        overflow: auto;
        background: #0a0a0a;
        color: #e5e7eb;
        border: 2px solid #3b3b3b;
        border-radius: 12px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.55);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 16px 12px 16px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 0.9rem; color: #9ca3af;">TITANE∞ Diagnostic</div>
            <div style="font-size: 1.1rem; font-weight: 700;">${escapeHtmlForError(title)}</div>
          </div>
          <button id="titane-debug-overlay-close" style="
            padding: 8px 12px;
            background: #1f1f1f;
            color: #e5e7eb;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          ">Fermer</button>
        </div>
        <div style="padding: 16px;">
          <div style="color:#9ca3af;margin-bottom:12px;">Raccourci: Ctrl+Alt+D (ré-ouvre si fermé)</div>
          <pre style="white-space: pre-wrap; word-break: break-word; margin:0; padding: 12px; background:#000; border-radius: 10px; border:1px solid rgba(255,255,255,0.08);">${escapeHtmlForError(body)}</pre>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('titane-debug-overlay-close')?.addEventListener('click', () => {
    overlay.remove();
  });
};

export const startBootBeacon = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // Avoid duplicates across reloads
  if (document.getElementById('titane-boot-beacon')) {
    return;
  }

  const beacon = document.createElement('div');
  beacon.id = 'titane-boot-beacon';
  beacon.style.position = 'fixed';
  beacon.style.right = '12px';
  beacon.style.bottom = '12px';
  beacon.style.zIndex = '2147483647';
  beacon.style.maxWidth = '420px';
  beacon.style.background = 'rgba(0,0,0,0.85)';
  beacon.style.color = '#e5e7eb';
  beacon.style.border = '1px solid rgba(255,255,255,0.15)';
  beacon.style.borderRadius = '10px';
  beacon.style.padding = '10px 12px';
  beacon.style.fontFamily =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
  beacon.style.fontSize = '12px';
  beacon.style.lineHeight = '1.35';
  // ⚠️ CRITICAL FIX: Allow clicks to pass through beacon (prevent test interference)
  beacon.style.pointerEvents = 'none';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Fermer diagnostic');
  closeBtn.style.float = 'right';
  closeBtn.style.marginLeft = '8px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.color = '#9ca3af';
  closeBtn.style.border = 'none';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '16px';
  // Re-enable pointer events ONLY for close button
  closeBtn.style.pointerEvents = 'auto';
  closeBtn.onclick = () => beacon.remove();

  const content = document.createElement('div');
  beacon.appendChild(closeBtn);
  beacon.appendChild(content);
  document.body.appendChild(beacon);

  const render = (): void => {
    const w = window as typeof window & {
      __TAURI__?: unknown;
      __TAURI_INTERNALS__?: unknown;
      __TITANE_BOOT__?: TitaneBootDiagnostics;
    };

    const root = document.getElementById('root');
    const childCount = root?.childElementCount ?? 0;

    const stage = w.__TITANE_BOOT__?.stage ?? 'n/a';
    const isTauri = Boolean(w.__TAURI__ || w.__TAURI_INTERNALS__);
    const href = typeof location !== 'undefined' ? String(location.href) : 'n/a';

    content.innerHTML = `${escapeHtmlForError('BOOT BEACON')}<br/>
<span style="color:#9ca3af;">stage</span>: ${escapeHtmlForError(stage)}<br/>
<span style="color:#9ca3af;">isTauri</span>: ${isTauri ? 'true' : 'false'}<br/>
<span style="color:#9ca3af;">rootChildren</span>: ${childCount}<br/>
<span style="color:#9ca3af;">href</span>: ${escapeHtmlForError(href)}<br/>
<span style="color:#9ca3af;">keys</span>: F12/Ctrl+Shift+I, Ctrl+Alt+D`;
  };

  render();
  window.setInterval(render, 1000);
};

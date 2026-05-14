/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v34.0.13 — UPDATE AVAILABLE TOAST
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Listens to the `sw-update-available` CustomEvent dispatched by
 * `ServiceWorkerManager.notifyUpdateAvailable()` and offers the user a one-click
 * action to skip waiting + reload, ensuring fresh UI after rebuild.
 *
 * Pair with the `index.html → NetworkFirst` strategy in `public/sw-source.js`
 * to eliminate the multi-week class of "page edits not visible after rebuild"
 * incidents.
 *
 * data-testid:
 *   - "update-available-toast"            (container, rendered when visible)
 *   - "update-available-reload"           (call-to-action button)
 *
 * Rule 16: unit tests in `src/__tests__/components/system/UpdateAvailableToast.test.tsx`
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export interface UpdateAvailableToastProps {
  /** Listen target — defaults to `window`. Overridable for tests. */
  target?: EventTarget;
  /** Override the reload action — defaults to `location.reload()`. */
  onReload?: () => void;
}

const TOAST_ID = 'titane-sw-update-available';

export function UpdateAvailableToast({
  target,
  onReload,
}: UpdateAvailableToastProps = {}): null | JSX.Element {
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const listener = target ?? window;

    const handler = (): void => {
      if (shownRef.current) return;
      shownRef.current = true;
      setVisible(true);

      toast.info('Mise à jour disponible', {
        id: TOAST_ID,
        description: 'Une nouvelle version de TITANE∞ est prête. Recharger maintenant ?',
        duration: Infinity,
        action: {
          label: 'Recharger',
          onClick: () => {
            try {
              // Best-effort skipWaiting on the waiting worker.
              if (
                typeof navigator !== 'undefined' &&
                navigator.serviceWorker &&
                navigator.serviceWorker.controller
              ) {
                void navigator.serviceWorker.getRegistration().then(reg => {
                  reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
                });
              }
            } catch {
              /* noop — best-effort */
            }
            if (onReload) {
              onReload();
            } else if (typeof location !== 'undefined') {
              location.reload();
            }
          },
        },
      });
    };

    listener.addEventListener('sw-update-available', handler);
    return () => {
      listener.removeEventListener('sw-update-available', handler);
    };
  }, [target, onReload]);

  if (!visible) return null;

  // Invisible marker for E2E presence assertion. The actual UI is rendered by
  // Sonner via `toast.info` above (this allows Playwright to query
  // [data-testid="update-available-toast"] regardless of Sonner internals).
  return (
    <div
      data-testid="update-available-toast"
      aria-hidden="true"
      style={{ position: 'fixed', left: '-9999px', top: 0, width: 1, height: 1 }}
    >
      <button
        type="button"
        data-testid="update-available-reload"
        onClick={() => {
          if (onReload) {
            onReload();
          } else if (typeof location !== 'undefined') {
            location.reload();
          }
        }}
      >
        reload
      </button>
    </div>
  );
}

export default UpdateAvailableToast;

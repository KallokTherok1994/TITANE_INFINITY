import { isTauriAvailable } from '@/api/tauriClient';

type ConfirmActionOptions = {
  title?: string;
  okLabel?: string;
  cancelLabel?: string;
  defaultToConfirmed?: boolean;
  useTauriDialog?: boolean;
};

export async function confirmAction(
  message: string,
  options: ConfirmActionOptions = {}
): Promise<boolean> {
  const {
    title = 'Confirmation requise',
    okLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    defaultToConfirmed = false,
    useTauriDialog = false,
  } = options;

  try {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }

    if (useTauriDialog && isTauriAvailable()) {
      try {
        const { confirm } = await import('@tauri-apps/plugin-dialog');
        return await confirm(message, {
          title,
          kind: 'warning',
          okLabel,
          cancelLabel,
        });
      } catch (error) {
        console.warn('[TITANE] Tauri confirm fallback used:', error);
      }
    }
  } catch (error) {
    console.warn('[TITANE] Confirm dialog failed unexpectedly:', error);
  }

  return defaultToConfirmed;
}

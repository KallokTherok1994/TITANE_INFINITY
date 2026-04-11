type KeyboardShortcutEvent = Pick<
  KeyboardEvent,
  | 'key'
  | 'ctrlKey'
  | 'metaKey'
  | 'shiftKey'
  | 'altKey'
  | 'preventDefault'
  | 'stopPropagation'
>;

type DevtoolsShortcutHandlerOptions = {
  isTauriRuntime: () => boolean;
  openDevtools: () => Promise<void>;
  toggleDevtools?: () => Promise<void>;
  fallbackAction?: () => void | Promise<void>;
  onError?: (error: unknown) => void;
};

export const isDevtoolsShortcut = (
  ev: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'altKey'>
): boolean => {
  const key = ev.key.toLowerCase();

  return (
    ev.key === 'F12' ||
    (ev.ctrlKey && ev.shiftKey && key === 'i') ||
    (ev.metaKey && ev.altKey && key === 'i')
  );
};

export const createDevtoolsShortcutHandler = ({
  isTauriRuntime,
  openDevtools,
  toggleDevtools,
  fallbackAction,
  onError,
}: DevtoolsShortcutHandlerOptions) => {
  return async (ev: KeyboardShortcutEvent): Promise<void> => {
    if (!isDevtoolsShortcut(ev) || !isTauriRuntime()) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    let lastError: unknown = null;

    try {
      await openDevtools();
      return;
    } catch (primaryError) {
      lastError = primaryError;
    }

    if (toggleDevtools) {
      try {
        await toggleDevtools();
        return;
      } catch (toggleError) {
        lastError = toggleError instanceof Error ? toggleError : lastError;
      }
    }

    if (fallbackAction) {
      try {
        await fallbackAction();
        return;
      } catch (fallbackError) {
        onError?.(fallbackError instanceof Error ? fallbackError : lastError);
        return;
      }
    }

    onError?.(lastError);
  };
};

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
  onError,
}: DevtoolsShortcutHandlerOptions) => {
  return async (ev: KeyboardShortcutEvent): Promise<void> => {
    if (!isDevtoolsShortcut(ev) || !isTauriRuntime()) {
      return;
    }

    ev.preventDefault();
    ev.stopPropagation();

    try {
      await openDevtools();
      return;
    } catch (primaryError) {
      if (!toggleDevtools) {
        onError?.(primaryError);
        return;
      }

      try {
        await toggleDevtools();
      } catch (toggleError) {
        onError?.(toggleError instanceof Error ? toggleError : primaryError);
      }
    }
  };
};

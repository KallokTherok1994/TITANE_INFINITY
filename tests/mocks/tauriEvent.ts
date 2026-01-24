export type UnlistenFn = () => void;

// Minimal stub for `@tauri-apps/api/event` in Vitest.
// Prevents real Tauri event bridge from initializing in the test environment.
export async function listen<T = unknown>(
  _event: string,
  _handler: (event: { payload: T }) => void
): Promise<UnlistenFn> {
  return () => {};
}

export async function emit<T = unknown>(
  _event: string,
  _payload?: T
): Promise<void> {
  // no-op
}

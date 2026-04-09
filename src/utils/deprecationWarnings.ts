const warnedDeprecations = new Set<string>();

const shouldEmitDeprecationWarnings =
  import.meta.env.DEV || import.meta.env.MODE === 'test';

export function warnOncePerSession(key: string, message: string): void {
  if (!shouldEmitDeprecationWarnings || warnedDeprecations.has(key)) {
    return;
  }

  warnedDeprecations.add(key);
  console.warn(message);
}

export function resetWarnOnceRegistryForTests(): void {
  warnedDeprecations.clear();
}

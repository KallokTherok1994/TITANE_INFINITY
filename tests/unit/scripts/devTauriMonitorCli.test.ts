import { describe, expect, it } from 'vitest';

import { normalizeMonitorArgs } from '../../../scripts/launch/dev_tauri_monitor_rules.mjs';

describe('dev tauri monitor cli normalization', () => {
  it('drops the leading npm separator so monitor options still reach the wrapper', () => {
    expect(normalizeMonitorArgs(['--', '--smoke', '20', '--no-ollama'])).toEqual([
      '--smoke',
      '20',
      '--no-ollama',
    ]);
  });

  it('keeps direct node invocation arguments unchanged', () => {
    expect(normalizeMonitorArgs(['--smoke', '10', '--', '--features', 'full'])).toEqual([
      '--smoke',
      '10',
      '--',
      '--features',
      'full',
    ]);
  });
});
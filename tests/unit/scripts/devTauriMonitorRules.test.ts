import { describe, expect, it } from 'vitest';

import {
  classifyMonitorLine,
  stripAnsi,
} from '../../../scripts/launch/dev_tauri_monitor_rules.mjs';

describe('dev tauri monitor rules', () => {
  it('ignores cargo compile progress lines even when crate names contain error substrings', () => {
    const line = '\u001b[K\u001b[1m\u001b[92m   Compiling\u001b[0m quick-error v2.0.1';

    expect(stripAnsi(line)).toContain('Compiling quick-error v2.0.1');
    expect(classifyMonitorLine(line)).toMatchObject({
      ignore: true,
      isError: false,
      isWarn: false,
    });
  });

  it('still counts real runtime errors', () => {
    expect(classifyMonitorLine('error: could not compile titane-infinity')).toMatchObject(
      {
        ignore: false,
        isError: true,
      }
    );
    expect(
      classifyMonitorLine("thread 'main' panicked at src/main.rs:1:1:")
    ).toMatchObject({
      ignore: false,
      isError: true,
    });
  });

  it('keeps boot markers visible to the monitor', () => {
    expect(classifyMonitorLine('  VITE v7.3.1  ready in 560 ms')).toMatchObject({
      bootSeen: true,
    });
    expect(classifyMonitorLine('[UI] frontend.boot — BOOT:READY')).toMatchObject({
      bootSeen: false,
    });
    expect(classifyMonitorLine('UI_BOOT_MARKER label=main BOOT:READY')).toMatchObject({
      bootSeen: true,
    });
  });
});

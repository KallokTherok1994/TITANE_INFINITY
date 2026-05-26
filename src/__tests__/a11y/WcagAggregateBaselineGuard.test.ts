import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('WCAG aggregate baseline guard', () => {
  it('locks aggregate baseline to 3 in canonical gate', () => {
    const specPath = resolve(process.cwd(), 'e2e/a11y/wcag-aa-core.spec.ts');
    const source = readFileSync(specPath, 'utf-8');

    expect(source).toContain('const AGGREGATE_BLOCKING_BASELINE = 3;');
    expect(source).not.toContain('const AGGREGATE_BLOCKING_BASELINE = 5;');
    expect(source).not.toContain('const AGGREGATE_BLOCKING_BASELINE = 30;');
  });
});

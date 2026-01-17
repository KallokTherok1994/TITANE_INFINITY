import { describe, expect, it } from 'vitest';

import { hasSecureData, maskSecret } from '@/utils/secureSecrets';

describe('secureSecrets utils', () => {
  it('masks secrets while keeping the last four characters visible', () => {
    expect(maskSecret('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(`${'•'.repeat(22)}WXYZ`);
    expect(maskSecret('1234')).toBe('1234');
    expect(maskSecret('')).toBe('');
  });

  it('validates secure responses contain usable data', () => {
    const success = { ok: true, data: { configured: true }, error: null };
    const failure = { ok: false, data: null, error: 'nope' };

    expect(any: any);
    expect(any: any);
    expect(any: any);
  });
});

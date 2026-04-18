import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Logger architecture anti-cycle truth', () => {
  it('keeps LogLevel in the shared types module and out of utils/logger', () => {
    const sharedLogLevel = readFileSync(resolve(process.cwd(), 'src/types/logLevel.ts'), 'utf8');
    const runtimeLogger = readFileSync(resolve(process.cwd(), 'src/utils/logger.ts'), 'utf8');
    const runtimeConfig = readFileSync(resolve(process.cwd(), 'src/config/logLevelConfig.ts'), 'utf8');

    expect(sharedLogLevel).toContain('export enum LogLevel');
    expect(runtimeLogger).toContain("import { LogLevel } from '@/types/logLevel';");
    expect(runtimeLogger).toContain("export { LogLevel } from '@/types/logLevel';");
    expect(runtimeLogger).not.toContain('export enum LogLevel');
    expect(runtimeConfig).toContain("import { LogLevel } from '@/types/logLevel';");
    expect(runtimeConfig).not.toContain("import { LogLevel } from '@/utils/logger';");
  });
});
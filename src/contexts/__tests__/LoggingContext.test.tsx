import React, { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoggingProvider, useLogging, useModuleLogger } from '@/contexts/LoggingContext';

function createStubLogger() {
  return {
    configure: vi.fn(),
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    group: vi.fn(),
    groupEnd: vi.fn(),
    table: vi.fn(),
    time: vi.fn(),
    timeEnd: vi.fn(),
  };
}

describe('LoggingContext', () => {
  it('exposes root logger and module logger from provider', () => {
    const rootLogger = createStubLogger();
    const moduleLogger = createStubLogger();
    const createModuleLogger = vi.fn(() => moduleLogger);

    const Probe = () => {
      const { logger } = useLogging();
      const scopedLogger = useModuleLogger('ProbeModule');

      useEffect(() => {
        logger.info('root-message');
        scopedLogger.warn('module-message');
      }, [logger, scopedLogger]);

      return <div data-testid="logging-context-probe">ready</div>;
    };

    render(
      <LoggingProvider
        rootLogger={rootLogger as never}
        createModuleLogger={createModuleLogger}
      >
        <Probe />
      </LoggingProvider>
    );

    expect(screen.getByTestId('logging-context-probe')).toHaveTextContent('ready');
    expect(createModuleLogger).toHaveBeenCalledWith('ProbeModule');
    expect(rootLogger.info).toHaveBeenCalledWith('root-message');
    expect(moduleLogger.warn).toHaveBeenCalledWith('module-message');
  });

  it('throws when used outside provider', () => {
    const Probe = () => {
      useLogging();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useLogging must be used within LoggingProvider'
    );
  });
});

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
  it('exposes root logger and module logger from provider (custom createModuleLogger)', () => {
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

  it('uses default createLogger fallback when no createModuleLogger is provided', () => {
    // Covers the ?? branch at LoggingContext.tsx line 29:
    //   createModuleLogger ?? ((moduleName: string) => createLogger(moduleName))
    const rootLogger = createStubLogger();

    const Probe = () => {
      const { createModuleLogger } = useLogging();
      const moduleLogger = createModuleLogger('DefaultModule');
      return (
        <div data-testid="default-module-logger" data-has-info={String(typeof moduleLogger.info === 'function')}>
          ready
        </div>
      );
    };

    render(
      <LoggingProvider rootLogger={rootLogger as never}>
        <Probe />
      </LoggingProvider>
    );

    const el = screen.getByTestId('default-module-logger');
    expect(el).toHaveTextContent('ready');
    // The default createLogger returns a real logger with an `info` function
    expect(el).toHaveAttribute('data-has-info', 'true');
  });

  it('throws when useLogging is used outside provider', () => {
    const Probe = () => {
      useLogging();
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useLogging must be used within LoggingProvider'
    );
  });

  it('throws when useModuleLogger is used outside provider', () => {
    const Probe = () => {
      useModuleLogger('OrphanModule');
      return null;
    };

    expect(() => render(<Probe />)).toThrow(
      'useLogging must be used within LoggingProvider'
    );
  });

  it('exposes createModuleLogger callable from useLogging context', () => {
    const rootLogger = createStubLogger();
    const moduleLogger = createStubLogger();
    const createModuleLogger = vi.fn(() => moduleLogger);

    const Probe = () => {
      const ctx = useLogging();
      const ml = ctx.createModuleLogger('DirectCall');
      return (
        <div data-testid="direct-call-probe" data-has-fn={String(typeof ml.debug === 'function')}>
          ok
        </div>
      );
    };

    render(
      <LoggingProvider rootLogger={rootLogger as never} createModuleLogger={createModuleLogger}>
        <Probe />
      </LoggingProvider>
    );

    expect(screen.getByTestId('direct-call-probe')).toHaveAttribute('data-has-fn', 'true');
    expect(createModuleLogger).toHaveBeenCalledWith('DirectCall');
  });
});

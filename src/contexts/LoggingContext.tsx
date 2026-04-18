import React, { createContext, useContext, useMemo } from 'react';
import { createLogger, logger } from '@/utils/logger';

type RootLogger = typeof logger;
type ModuleLogger = ReturnType<typeof createLogger>;

interface LoggingContextValue {
  logger: RootLogger;
  createModuleLogger: (moduleName: string) => ModuleLogger;
}

const LoggingContext = createContext<LoggingContextValue | undefined>(undefined);

interface LoggingProviderProps {
  children: React.ReactNode;
  rootLogger?: RootLogger;
  createModuleLogger?: (moduleName: string) => ModuleLogger;
}

export const LoggingProvider: React.FC<LoggingProviderProps> = ({
  children,
  rootLogger = logger,
  createModuleLogger,
}) => {
  const value = useMemo<LoggingContextValue>(
    () => ({
      logger: rootLogger,
      createModuleLogger: createModuleLogger ?? ((moduleName: string) => createLogger(moduleName)),
    }),
    [createModuleLogger, rootLogger]
  );

  return <LoggingContext.Provider value={value}>{children}</LoggingContext.Provider>;
};

export const useLogging = (): LoggingContextValue => {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error('useLogging must be used within LoggingProvider');
  }
  return context;
};

export const useModuleLogger = (moduleName: string): ModuleLogger => {
  const { createModuleLogger } = useLogging();
  return useMemo(() => createModuleLogger(moduleName), [createModuleLogger, moduleName]);
};
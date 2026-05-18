import React from 'react';

export interface SurfaceRootProps {
  id: string;
  ring?: 'core' | 'admin' | 'dev' | 'feature' | 'experimental';
  children: React.ReactNode;
}

export function SurfaceRoot({ id, ring = 'feature', children }: SurfaceRootProps) {
  return (
    <main
      className="flex w-full min-h-0 flex-1 flex-col"
      data-surface-truth={id}
      data-surface-ring={ring}
      data-app-version={typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
      data-build-timestamp={
        typeof __BUILD_TIMESTAMP__ !== 'undefined'
          ? __BUILD_TIMESTAMP__
          : new Date(0).toISOString()
      }
      data-testid="surface-root"
    >
      {children}
    </main>
  );
}

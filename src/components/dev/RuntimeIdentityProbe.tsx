/**
 * TITANE∞ — Runtime Identity Probe Component
 * Renders runtime identity into DOM attributes for WDIO/Playwright assertions.
 */

import React, { useEffect, useState } from 'react';
import {
  resolveRuntimeIdentity,
  applyRuntimeIdentityToDOM,
} from '@/utils/runtimeIdentity';
import type { RuntimeIdentity } from '@/utils/runtimeIdentity';

interface RuntimeIdentityProbeProps {
  visible?: boolean;
}

export const RuntimeIdentityProbe: React.FC<RuntimeIdentityProbeProps> = ({
  visible = false,
}) => {
  const [identity, setIdentity] = useState<RuntimeIdentity | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveRuntimeIdentity().then(id => {
      if (cancelled) return;
      setIdentity(id);
      applyRuntimeIdentityToDOM(id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible || !identity) return null;

  return (
    <div
      data-testid="runtime-identity-probe"
      data-runtime-kind={identity.runtimeKind}
      data-app-version={identity.packageVersion}
      data-build-timestamp={identity.buildTimestamp ?? ''}
      data-binary-source={identity.source}
      style={{ display: 'none' }}
    />
  );
};

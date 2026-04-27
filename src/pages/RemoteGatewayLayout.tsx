/**
 * TITANE∞ — Remote Gateway Layout
 *
 * Auth-guard wrapper rendered when TITANE runs in browser/remote mode.
 * Checks getRemoteTransport().isAuthenticated(); shows RemoteLoginPage if not,
 * renders children when authenticated.
 *
 * Usage in App.tsx:
 *   if (isRemoteContext()) return <RemoteGatewayLayout>{routes}</RemoteGatewayLayout>;
 */

import React, { useState, useEffect } from 'react';
import { isRemoteContext } from '../lib/transport';
import { getRemoteTransport, initRemoteTransport } from '../lib/remoteTransport';
import RemoteLoginPage from './RemoteLoginPage';

interface RemoteGatewayLayoutProps {
  children: React.ReactNode;
}

/**
 * Initialise RemoteTransport with the current origin as baseUrl if not already
 * configured. This covers the common case where the browser loads TITANE directly
 * from the axum server (same origin).
 */
function ensureRemoteTransportInitialised() {
  try {
    // If already configured (has a baseUrl), getRemoteTransport() returns it.
    getRemoteTransport();
  } catch {
    // Not yet initialised — use window.location.origin as baseUrl.
    const baseUrl =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:7420';
    initRemoteTransport({ baseUrl });
  }
}

export const RemoteGatewayLayout: React.FC<RemoteGatewayLayoutProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    ensureRemoteTransportInitialised();
    const transport = getRemoteTransport();
    setAuthenticated(transport.isAuthenticated());
    setChecked(true);
  }, []);

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  // Don't render anything until we've checked auth state (avoid flash)
  if (!checked) return null;

  if (!authenticated) {
    return <RemoteLoginPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div data-testid="remote-gateway-layout" style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

export default RemoteGatewayLayout;

/**
 * HOC: wraps any component with RemoteGatewayLayout when in remote context.
 * Use in App.tsx root render function.
 */
export function withRemoteGateway<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function RemoteGatewayWrapped(props: P) {
    if (!isRemoteContext()) {
      return <Component {...props} />;
    }
    return (
      <RemoteGatewayLayout>
        <Component {...props} />
      </RemoteGatewayLayout>
    );
  };
}

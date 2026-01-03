/**
 * TITANE∞ - App Minimal pour diagnostic de chargement
 */
import React from 'react';

export default function AppMinimal() {
  const [mounted, setMounted] = React.useState(false);
  const [info, setInfo] = React.useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
    const logs: string[] = [];

    try {
      logs.push('✅ React mounted');
      logs.push(`🌐 Origin: ${window.location.origin}`);
      logs.push(`🔧 Dev mode: ${import.meta.env.DEV}`);

      // Vérifier localStorage
      if (typeof localStorage !== 'undefined') {
        logs.push('✅ localStorage available');
        const browserMode = localStorage.getItem('titane_browser_mode');
        logs.push(`📱 Browser mode: ${browserMode}`);
      }

      // Vérifier Tauri
      const w = window as Window & { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
      const hasTauri = !!(w.__TAURI__ || w.__TAURI_INTERNALS__);
      logs.push(`🦀 Tauri: ${hasTauri ? 'YES' : 'NO'}`);

      setInfo(logs);
    } catch (error) {
      logs.push(`❌ Error: ${error}`);
      setInfo(logs);
    }
  }, []);

  if (!mounted) {
    return <div style={{ padding: '20px' }}>⏳ Mounting...</div>;
  }

  return (
    <div
      style={{
        fontFamily: 'monospace',
        padding: '40px',
        background: '#0a0a0a',
        color: '#e5e7eb',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#6366f1', marginBottom: '30px' }}>
        🔍 TITANE∞ - Diagnostic Minimal
      </h1>

      <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
        {info.map((line, i) => (
          <div key={i} style={{ marginBottom: '10px', fontSize: '14px' }}>
            {line}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', color: '#9ca3af' }}>
        <p>✅ Si vous voyez ce message, React fonctionne !</p>
        <p>🔄 Rechargez pour tester le chargement complet</p>
      </div>
    </div>
  );
}

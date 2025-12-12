/**
 * TITANE∞ - MINIMAL RENDER TEST
 * Test si React peut se monter sans les providers complexes
 */

import React from 'react';

export default function AppMinimalTest() {
  console.log('🎨 [AppMinimalTest] Component rendering...');

  React.useEffect(() => {
    console.log('✅ [AppMinimalTest] Component mounted successfully!');
    console.log('📍 Root element:', document.getElementById('root'));
    console.log('📍 Root children:', document.getElementById('root')?.children.length);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
        color: '#00d4ff',
        fontFamily: 'Inter, sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          background: 'rgba(0, 212, 255, 0.1)',
          border: '2px solid #00d4ff',
          borderRadius: '12px',
          padding: '3rem',
          maxWidth: '600px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.8)',
          }}
        >
          ✅ TITANE∞ React OK
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#93b399',
            marginBottom: '2rem',
          }}
        >
          React 18 successfully mounted and rendering
        </p>
        <div
          style={{
            background: '#1a1a2e',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            textAlign: 'left',
            color: '#727b81',
          }}
        >
          <p>✅ Root element found</p>
          <p>✅ React.StrictMode active</p>
          <p>✅ Component lifecycle working</p>
          <p>✅ CSS-in-JS rendering</p>
          <p style={{ marginTop: '1rem', color: '#00d4ff' }}>
            → Next: Test with providers (Theme, Animation, Router)
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#727b81',
        }}
      >
        v24.2.0 - Minimal Test Component
      </div>
    </div>
  );
}

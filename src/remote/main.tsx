/**
 * TITANE∞ Remote — Entry point
 * Standalone browser SPA — no Tauri APIs.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import RemoteApp from './RemoteApp';
import './remote.css';

const container = document.getElementById('root');
if (!container) throw new Error('No #root element found');
createRoot(container).render(
  <React.StrictMode>
    <RemoteApp />
  </React.StrictMode>
);

/**
 * TITANE∞ — DocCenter — Centre Documentaire
 * Export natif DOCX via doc_engine (Phase 3)
 * data-testid stables: doc-center-page, btn-export-docx, doc-export-status
 */

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TAURI_COMMANDS } from '../lib/tauriCommands';

interface ExportDocxContent {
  path: string;
  size: number;
}

interface ExportDocxResponse {
  ok: boolean;
  content?: ExportDocxContent;
  error?: string;
}

function buildDemoDocument(title: string) {
  const now = new Date().toISOString();
  return {
    metadata: {
      id: `doc-${Date.now()}`,
      title,
      version: '1.0.0',
      created_at: now,
      updated_at: now,
      author: 'TITANE∞',
      tags: ['titane', 'docx'],
      category: 'Rapport',
    },
    config: {
      doc_type: 'Analysis',
      style: 'Professional',
      detail_level: 'Standard',
      tone: 'professionnel',
      language: 'fr',
      custom_params: {},
    },
    content: {
      title,
      executive_summary: `Résumé exécutif de "${title}" généré par TITANE∞.`,
      objectives: ['Démontrer l\'export DOCX natif', 'Valider le moteur doc_engine'],
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `Ce document a été exporté nativement en DOCX par TITANE∞ via docx-rs.`,
          subsections: [],
          level: 1,
        },
      ],
      mandatory_clauses: null,
      annexes: [],
      references: [],
    },
    validation_status: {
      is_valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    },
  };
}

export function DocCenterPage() {
  const [title, setTitle] = useState('Rapport TITANE∞');
  const [outputDir, setOutputDir] = useState('/tmp');
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleExportDocx() {
    setIsLoading(true);
    setStatus(null);
    try {
      const resp = await invoke<ExportDocxResponse>(TAURI_COMMANDS.EXPORT_DOCX_FILE, {
        req: {
          document: buildDemoDocument(title),
          output_dir: outputDir,
        },
      });
      if (resp.ok && resp.content) {
        setStatus(`✅ Exporté : ${resp.content.path} (${resp.content.size} octets)`);
      } else {
        setStatus(`❌ Erreur : ${resp.error ?? 'inconnu'}`);
      }
    } catch (e) {
      setStatus(`❌ IPC error : ${String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="doc-center-page" data-testid="doc-center-page" style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>📄 Centre Documentaire</h1>
      <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>
        Export natif DOCX via <code>doc_engine</code> + docx-rs
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 480 }}>
        <label>
          <span style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', opacity: 0.8 }}>
            Titre du document
          </span>
          <input
            data-testid="input-doc-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
          />
        </label>

        <label>
          <span style={{ display: 'block', marginBottom: 4, fontSize: '0.85rem', opacity: 0.8 }}>
            Répertoire de sortie
          </span>
          <input
            data-testid="input-output-dir"
            type="text"
            value={outputDir}
            onChange={e => setOutputDir(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #444', background: '#1a1a1a', color: '#fff' }}
          />
        </label>

        <button
          data-testid="btn-export-docx"
          onClick={handleExportDocx}
          disabled={isLoading}
          style={{
            padding: '0.7rem 1.5rem',
            borderRadius: 8,
            background: isLoading ? '#555' : '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          {isLoading ? '⏳ Export en cours…' : '📥 Exporter en DOCX'}
        </button>

        {status && (
          <div
            data-testid="doc-export-status"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              background: status.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${status.startsWith('✅') ? '#22c55e55' : '#ef444455'}`,
              fontSize: '0.85rem',
            }}
          >
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

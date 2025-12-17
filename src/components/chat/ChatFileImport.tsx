/**
 * TITANE_INFINITY v18 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v18.0 — CHAT FILE IMPORT
 *   Composant d'importation de fichiers dans le Chat IA
 *   Drag & Drop + Analyse automatique + Award XP Memory
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { invokeTauri, TAURI_COMMANDS } from '@/core/commands/TAURI_COMMANDS';
import './ChatFileImport.css';

interface ChatFileImportProps {
  onFileAnalyzed: (analysis: FileAnalysis) => void;
  disabled?: boolean;
}

interface FileAnalysis {
  filename: string;
  content: string;
  summary: string;
  size: number;
  type: string;
  wordCount: number;
  lines: number;
}

export const ChatFileImport: React.FC<ChatFileImportProps> = ({
  onFileAnalyzed,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Valide le type MIME du fichier
   */
  const validateFileMimeType = (file: File): boolean => {
    const allowedMimeTypes = [
      'text/plain',
      'text/markdown',
      'text/x-markdown',
      'application/json',
      'application/x-yaml',
      'text/yaml',
      'text/javascript',
      'application/javascript',
      'text/typescript',
      'application/typescript',
      'text/x-typescript',
      'text/jsx',
      'text/tsx',
    ];

    // Vérification MIME
    if (file.type && allowedMimeTypes.includes(file.type)) {
      return true;
    }

    // Fallback: vérification extension si MIME vide
    const allowedExtensions = [
      '.txt',
      '.md',
      '.json',
      '.yaml',
      '.yml',
      '.js',
      '.ts',
      '.tsx',
      '.jsx',
      '.log',
    ];
    const hasValidExtension = allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!file.type && hasValidExtension) {
      logger.warn('MIME type empty, validated by extension', {
        component: 'ChatFileImport',
        action: 'validateFileMimeType',
        filename: file.name,
      });
      return true;
    }

    return false;
  };

  /**
   * Valide la taille du fichier (max 10MB - unifié avec backend v24.6)
   */
  const validateFileSize = (file: File): boolean => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB (unifié frontend/backend)
    return file.size > 0 && file.size <= MAX_SIZE;
  };

  /**
   * Analyse le contenu d'un fichier
   */
  const analyzeFileContent = (filename: string, content: string): FileAnalysis => {
    const lines = content.split('\n').length;
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const sizeBytes = new Blob([content]).size;

    // Génère un résumé basique
    const preview = content.substring(0, 200).trim();
    const summary = preview.length < content.length ? `${preview}...` : preview;

    // Détecte le type de fichier
    let type = 'text';
    if (filename.endsWith('.md')) type = 'markdown';
    else if (filename.match(/\.(js|ts|tsx|jsx)$/)) type = 'code';
    else if (filename.match(/\.(json|yaml|yml)$/)) type = 'data';
    else if (filename.match(/\.(txt|log)$/)) type = 'text';

    return {
      filename,
      content,
      summary,
      size: sizeBytes,
      type,
      wordCount,
      lines,
    };
  };

  /**
   * Importe et analyse un fichier
   */
  const handleFileImport = useCallback(
    async (file: File) => {
      if (disabled || isProcessing) return;

      // Validation MIME type
      if (!validateFileMimeType(file)) {
        alert(
          `Type de fichier non supporté: ${file.type || 'inconnu'}\nExtensions autorisées: .txt, .md, .json, .yaml, .yml, .js, .ts, .tsx, .jsx, .log`
        );
        return;
      }

      // Validation taille
      if (!validateFileSize(file)) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`Fichier trop volumineux: ${sizeMB} MB\nTaille maximale autorisée: 10 MB`);
        return;
      }

      setIsProcessing(true);

      try {
        // Lecture du fichier
        const content = await file.text();

        logger.debug('File imported', {
          component: 'ChatFileImport',
          action: 'handleFileImport',
          filename: file.name,
          size: file.size,
        });

        // Analyse locale
        const analysis = analyzeFileContent(file.name, content);

        logger.debug('File analysis completed', {
          component: 'ChatFileImport',
          action: 'handleFileImport',
          filename: analysis.filename,
          type: analysis.type,
          lines: analysis.lines,
          words: analysis.wordCount,
          sizeKB: (analysis.size / 1024).toFixed(2),
        });

        // Appel backend pour ingestion (si disponible)
        try {
          await invokeTauri(TAURI_COMMANDS.MEMORY_INGEST_FILE, {
            path: file.name,
            content: content,
            metadata: {
              type: analysis.type,
              size: analysis.size,
              lines: analysis.lines,
              wordCount: analysis.wordCount,
            },
          });
          logger.info('File ingested in Memory backend', {
            component: 'ChatFileImport',
            action: 'handleFileImport',
            filename: file.name,
          });
        } catch (error) {
          const err = error as Error;
          logger.warn('Backend Memory unavailable, using frontend-only analysis', {
            component: 'ChatFileImport',
            action: 'handleFileImport',
            filename: file.name,
            error: err.message,
          });
        }

        // Callback avec résultat
        onFileAnalyzed(analysis);
      } catch (error) {
        logger.error(
          'File import failed',
          {
            component: 'ChatFileImport',
            action: 'handleFileImport',
            filename: file.name,
          },
          error as Error
        );
        alert(
          `Erreur lors de l'import du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, isProcessing, onFileAnalyzed]
  );

  /**
   * Gestion du drag & drop
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // Import uniquement le premier fichier
      const file = files[0];
      await handleFileImport(file);
    },
    [disabled, handleFileImport]
  );

  /**
   * Click sur le bouton
   */
  const handleButtonClick = () => {
    if (disabled || isProcessing) return;
    fileInputRef.current?.click();
  };

  /**
   * Sélection via input file
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await handleFileImport(files[0]);

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="chat-file-import">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.json,.yaml,.yml,.js,.ts,.tsx,.jsx,.log"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || isProcessing}
      />

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Importer un fichier"
      >
        {isProcessing ? (
          <>
            <span className="icon spinning">⏳</span>
            <span className="label">Analyse en cours...</span>
          </>
        ) : (
          <>
            <span className="icon">📁</span>
            <span className="label">
              {isDragging ? 'Déposer le fichier' : 'Glisser un fichier ou cliquer'}
            </span>
            <span className="hint">
              .txt, .md, .json, .yaml/.yml, .js/.ts/.tsx/.jsx, .log
            </span>
          </>
        )}
      </div>
    </div>
  );
};

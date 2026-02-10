/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — FILE UPLOAD BUTTON
 *   Bouton d'import de fichiers avec drag & drop pour analyse IA
 *   Features: Multi-fichiers, Preview, Classification automatique
 *   + Sauvegarde permanente mémoire IA + Attribution XP
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useRef, useState, useCallback, memo } from 'react';
import { tauriClient } from '@/lib/tauriClient';
import { XP } from '../../core/experience/XP_ENGINE';
import { awardExperience } from '../../services/experienceService';
import { XPSource, XP_REWARDS } from '../../types/experience';
import './FileUploadButton.css';

const isDev = process.env.NODE_ENV === 'development';

// Types de fichiers supportés
const SUPPORTED_FILE_TYPES = {
  code: ['.ts', '.tsx', '.js', '.jsx', '.rs', '.py', '.java', '.cpp', '.c', '.go', '.rb'],
  document: ['.md', '.txt', '.doc', '.docx', '.pdf'],
  data: ['.json', '.xml', '.yaml', '.yml', '.csv', '.sql'],
  config: ['.toml', '.ini', '.env', '.config'],
  image: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
};

const ALL_SUPPORTED_EXTENSIONS = Object.values(SUPPORTED_FILE_TYPES).flat();

// Classification des fichiers
export type FileCategory = 'code' | 'document' | 'data' | 'config' | 'image' | 'unknown';

export interface AnalyzedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  content: string | null;
  preview: string;
  analysis?: FileAnalysisResult;
  status: 'pending' | 'analyzing' | 'done' | 'error';
  error?: string;
}

export interface FileAnalysisResult {
  summary: string;
  lineCount: number;
  wordCount: number;
  charCount: number;
  contentType: string;
  metadata: Record<string, unknown>;
  suggestions?: string[];
}

interface FileUploadButtonProps {
  onFilesSelected: (files: AnalyzedFile[]) => void;
  onFileAnalyzed?: (file: AnalyzedFile) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
  showPreview?: boolean;
  className?: string;
}

// Utilitaires
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileExtension = (filename: string): string => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return ext || '';
};

const classifyFile = (filename: string, mimeType: string): FileCategory => {
  const ext = getFileExtension(filename);

  for (const [category, extensions] of Object.entries(SUPPORTED_FILE_TYPES)) {
    if (extensions.includes(ext)) {
      return category as FileCategory;
    }
  }

  // Fallback sur MIME type
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'document';
  if (mimeType.includes('json')) return 'data';

  return 'unknown';
};

const generateFileId = (): string => {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const getFileIcon = (category: FileCategory): string => {
  const icons: Record<FileCategory, string> = {
    code: '📄',
    document: '📝',
    data: '📊',
    config: '⚙️',
    image: '🖼️',
    unknown: '📁',
  };
  return icons[category];
};

const generatePreview = (content: string, maxLength: number = 200): string => {
  if (!content) return '(Contenu binaire ou vide)';
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength) + '...';
};

// Analyse locale du fichier
const analyzeFileContent = (content: string, filename: string): FileAnalysisResult => {
  const lines = content.split('\n');
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const ext = getFileExtension(filename);

  let contentType = 'text';
  const metadata: Record<string, unknown> = {};
  const suggestions: string[] = [];

  // Détection du type de contenu
  if (['.ts', '.tsx'].includes(ext)) {
    contentType = 'TypeScript/React';
    const componentMatches = content.match(/export\s+(const|function)\s+\w+/g);
    const hookMatches = content.match(/use[A-Z]\w+/g);
    metadata.components = componentMatches?.length || 0;
    metadata.hooks = [...new Set(hookMatches || [])].length;
    if ((metadata.components as number) === 0) {
      suggestions.push('Ce fichier ne semble pas contenir de composants React exportés');
    }
  } else if (['.rs'].includes(ext)) {
    contentType = 'Rust';
    const fnMatches = content.match(/fn\s+\w+/g);
    const structMatches = content.match(/struct\s+\w+/g);
    const implMatches = content.match(/impl\s+\w+/g);
    metadata.functions = fnMatches?.length || 0;
    metadata.structs = structMatches?.length || 0;
    metadata.implementations = implMatches?.length || 0;
  } else if (['.py'].includes(ext)) {
    contentType = 'Python';
    const defMatches = content.match(/def\s+\w+/g);
    const classMatches = content.match(/class\s+\w+/g);
    metadata.functions = defMatches?.length || 0;
    metadata.classes = classMatches?.length || 0;
  } else if (['.json'].includes(ext)) {
    contentType = 'JSON';
    try {
      const parsed = JSON.parse(content);
      metadata.isArray = Array.isArray(parsed);
      metadata.keyCount = typeof parsed === 'object' ? Object.keys(parsed).length : 0;
    } catch {
      suggestions.push('⚠️ JSON invalide détecté');
    }
  } else if (['.md'].includes(ext)) {
    contentType = 'Markdown';
    const h1Matches = content.match(/^#\s+.+$/gm);
    const h2Matches = content.match(/^##\s+.+$/gm);
    metadata.sections = (h1Matches?.length || 0) + (h2Matches?.length || 0);
    metadata.codeBlocks = (content.match(/```/g)?.length || 0) / 2;
  }

  // Génération du résumé
  const summary = `${contentType} • ${lines.length} lignes • ${words.length} mots • ${formatFileSize(content.length)}`;

  return {
    summary,
    lineCount: lines.length,
    wordCount: words.length,
    charCount: content.length,
    contentType,
    metadata,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
};

// Composant principal
export const FileUploadButton: React.FC<FileUploadButtonProps> = memo(
  ({
    onFilesSelected,
    onFileAnalyzed,
    disabled = false,
    maxFiles = 10,
    maxSizeBytes = 10 * 1024 * 1024, // 10 MB
    acceptedTypes = ALL_SUPPORTED_EXTENSIONS,
    showPreview = true,
    className = '',
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<AnalyzedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Lecture et analyse d'un fichier
    const processFile = useCallback(
      async (file: File): Promise<AnalyzedFile> => {
        const category = classifyFile(file.name, file.type);
        const id = generateFileId();

        const analyzedFile: AnalyzedFile = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          category,
          content: null,
          preview: '',
          status: 'pending',
        };

        // Vérification taille
        if (file.size > maxSizeBytes) {
          return {
            ...analyzedFile,
            status: 'error',
            error: `Fichier trop volumineux (max ${formatFileSize(maxSizeBytes)})`,
          };
        }

        // Pour les images, on ne lit pas le contenu texte
        if (category === 'image') {
          return {
            ...analyzedFile,
            preview: '🖼️ Image - Aperçu non disponible',
            status: 'done',
            analysis: {
              summary: `Image ${file.type} • ${formatFileSize(file.size)}`,
              lineCount: 0,
              wordCount: 0,
              charCount: 0,
              contentType: 'image',
              metadata: { mimeType: file.type },
            },
          };
        }

        // Lecture du contenu texte
        try {
          analyzedFile.status = 'analyzing';
          const content = await file.text();
          analyzedFile.content = content;
          analyzedFile.preview = generatePreview(content);
          analyzedFile.analysis = analyzeFileContent(content, file.name);
          analyzedFile.status = 'done';
        } catch (err) {
          analyzedFile.status = 'error';
          analyzedFile.error = `Erreur de lecture: ${err instanceof Error ? err.message : 'Erreur inconnue'}`;
        }

        return analyzedFile;
      },
      [maxSizeBytes]
    );

    // Traitement de plusieurs fichiers
    const handleFiles = useCallback(
      async (fileList: FileList | File[]) => {
        setError(null);
        setIsProcessing(true);

        const files = Array.from(fileList).slice(0, maxFiles);

        if (files.length === 0) {
          setError('Aucun fichier sélectionné');
          setIsProcessing(false);
          return;
        }

        isDev && console.log('[FileUpload] Processing', files.length, 'files');

        const results: AnalyzedFile[] = [];

        for (const file of files) {
          const result = await processFile(file);
          results.push(result);
          onFileAnalyzed?.(result);

          // ═══ SAUVEGARDE MÉMOIRE PERMANENTE + XP ═══
          // Enregistrer le fichier dans la mémoire IA permanente (backend Tauri)
          if (result.status === 'done' && result.content) {
            try {
              // Ingestion dans la mémoire IA permanente
              const memoryResult = await tauriClient.memoryIngestFile({
                path: result.name,
                content: result.content,
                category: result.category,
                metadata: {
                  name: result.name,
                  size: result.size,
                  type: result.type,
                  analysis: result.analysis,
                  timestamp: Date.now(),
                },
              });

              isDev &&
                console.log(
                  '[FileUpload] ✅ File ingested to memory:',
                  result.name,
                  memoryResult
                );

              // +20 XP global + domaine memory pour chaque fichier importé avec succès
              XP.gain(
                XP_REWARDS.FILE_IMPORT,
                'file_import',
                `Fichier importé: ${result.name}`
              );
              await awardExperience(
                'memory',
                XP_REWARDS.FILE_IMPORT,
                XPSource.FileImport,
                {
                  filename: result.name,
                  category: result.category,
                  size: result.size,
                  lineCount: result.analysis?.lineCount || 0,
                }
              );
              isDev &&
                console.log(
                  '[FileUpload] ✨ +20 XP awarded for file import:',
                  result.name
                );
            } catch (memoryError) {
              // Non-bloquant : l'analyse locale reste disponible même si la mémoire échoue
              console.warn(
                '[FileUpload] Memory ingestion warning (non-blocking):',
                memoryError
              );

              // On donne quand même +10 XP pour l'analyse locale
              try {
                XP.gain(
                  10,
                  'file_analysis',
                  `Fichier analysé localement: ${result.name}`
                );
                await awardExperience('cognitive', 10, XPSource.CognitiveAnalysis, {
                  filename: result.name,
                  category: result.category,
                  localOnly: true,
                });
                isDev &&
                  console.log(
                    '[FileUpload] ✨ +10 XP awarded for local analysis:',
                    result.name
                  );
              } catch (xpError) {
                console.warn('[FileUpload] XP award warning:', xpError);
              }
            }
          }
        }

        setSelectedFiles(results);
        onFilesSelected(results);
        setIsProcessing(false);

        isDev && console.log('[FileUpload] Processed files:', results);
      },
      [maxFiles, processFile, onFilesSelected, onFileAnalyzed]
    );

    // Handlers
    const handleClick = useCallback(() => {
      if (!disabled && inputRef.current) {
        inputRef.current.click();
      }
    }, [disabled]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          handleFiles(e.target.files);
        }
      },
      [handleFiles]
    );

    const handleDragEnter = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
      },
      [disabled]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!disabled && e.dataTransfer.files) {
          handleFiles(e.dataTransfer.files);
        }
      },
      [disabled, handleFiles]
    );

    const handleRemoveFile = useCallback((fileId: string) => {
      setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    }, []);

    const handleClearAll = useCallback(() => {
      setSelectedFiles([]);
      setError(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }, []);

    return (
      <div className={`file-upload-container ${className}`.trim()}>
        {/* Zone de drop / Bouton */}
        <div
          className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Importer des fichiers"
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
            disabled={disabled}
            className="file-upload-input"
          />

          <div className="file-upload-content">
            {isProcessing ? (
              <>
                <span className="file-upload-icon spinning">⏳</span>
                <span className="file-upload-text">Analyse en cours...</span>
              </>
            ) : isDragging ? (
              <>
                <span className="file-upload-icon">📥</span>
                <span className="file-upload-text">Déposez vos fichiers ici</span>
              </>
            ) : (
              <>
                <span className="file-upload-icon">📎</span>
                <span className="file-upload-text">Importer fichiers</span>
              </>
            )}
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="file-upload-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Liste des fichiers sélectionnés */}
        {showPreview && selectedFiles.length > 0 && (
          <div className="file-upload-preview">
            <div className="file-preview-header">
              <span className="file-preview-count">
                {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''}{' '}
                sélectionné{selectedFiles.length > 1 ? 's' : ''}
              </span>
              <button
                className="file-preview-clear"
                onClick={handleClearAll}
                title="Supprimer tous les fichiers"
              >
                ✕
              </button>
            </div>

            <div className="file-preview-list">
              {selectedFiles.map(file => (
                <div key={file.id} className={`file-preview-item ${file.status}`}>
                  <div className="file-preview-icon">{getFileIcon(file.category)}</div>

                  <div className="file-preview-info">
                    <div className="file-preview-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-preview-meta">
                      {file.analysis?.summary || formatFileSize(file.size)}
                    </div>
                    {file.error && <div className="file-preview-error">{file.error}</div>}
                  </div>

                  <button
                    className="file-preview-remove"
                    onClick={() => handleRemoveFile(file.id)}
                    title="Supprimer ce fichier"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileUploadButton.displayName = 'FileUploadButton';

export default FileUploadButton;

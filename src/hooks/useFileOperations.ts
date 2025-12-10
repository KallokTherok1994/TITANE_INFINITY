/**
 * useFileOperations Hook (v19.0 Task 5)
 *
 * React hook for file operations with state management
 *
 * Features:
 * - List, delete, copy, move files
 * - Upload/download with progress tracking
 * - Error handling
 * - Loading states
 */

import { useState, useCallback } from 'react';
import {
  listFiles,
  deleteFile,
  copyFile,
  moveFile,
  getFileInfo,
  fileExists,
  createDirectory,
  readFile,
  writeFile,
  type FileInfo,
  type ListFilesOptions,
} from '../services/tauriBridge';

interface FileOperationsState {
  files: FileInfo[] | null;
  currentFile: FileInfo | null;
  loading: boolean;
  progress: number | null;
  error: string | null;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useFileOperations() {
  const [state, setState] = useState<FileOperationsState>({
    files: null,
    currentFile: null,
    loading: false,
    progress: null,
    error: null,
  });

  /**
   * List files in directory
   */
  const list = useCallback(async (path: string, options?: ListFilesOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await listFiles(path, options);
      const files = response.data || [];
      setState({ files, currentFile: null, loading: false, progress: null, error: null });
      return files;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to list files';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Get file info
   */
  const info = useCallback(async (path: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getFileInfo(path);
      const fileInfo = response.data;
      setState(prev => ({
        ...prev,
        currentFile: fileInfo || null,
        loading: false,
        error: null,
      }));
      return fileInfo;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get file info';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Check if file exists
   */
  const exists = useCallback(async (path: string) => {
    try {
      return await fileExists(path);
    } catch (error) {
      return false;
    }
  }, []);

  /**
   * Delete file or directory
   */
  const remove = useCallback(async (path: string, recursive: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await deleteFile(path, recursive);
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete file';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Copy file or directory
   */
  const copy = useCallback(
    async (source: string, dest: string, overwrite: boolean = false) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await copyFile(source, dest, overwrite);
        setState(prev => ({ ...prev, loading: false, error: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to copy file';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  /**
   * Move/rename file or directory
   */
  const move = useCallback(
    async (source: string, dest: string, overwrite: boolean = false) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await moveFile(source, dest, overwrite);
        setState(prev => ({ ...prev, loading: false, error: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to move file';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  /**
   * Create directory
   */
  const createDir = useCallback(async (path: string, recursive: boolean = true) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await createDirectory(path, recursive);
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create directory';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Upload file (write with progress)
   */
  const upload = useCallback(
    async (
      path: string,
      content: string,
      onProgress?: (progress: UploadProgress) => void
    ) => {
      setState(prev => ({ ...prev, loading: true, progress: 0, error: null }));

      try {
        const chunkSize = 64 * 1024; // 64KB chunks
        const totalSize = content.length;
        let uploaded = 0;

        // Simulate chunked upload with progress
        while (uploaded < totalSize) {
          const chunk = content.slice(uploaded, uploaded + chunkSize);
          uploaded += chunk.length;

          const percentage = Math.round((uploaded / totalSize) * 100);
          setState(prev => ({ ...prev, progress: percentage }));

          if (onProgress) {
            onProgress({ loaded: uploaded, total: totalSize, percentage });
          }

          // Small delay to show progress (remove in production if backend supports chunking)
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Write complete file
        await writeFile(path, content);
        setState(prev => ({ ...prev, loading: false, progress: 100, error: null }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload file';
        setState(prev => ({
          ...prev,
          loading: false,
          progress: null,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Download file (read with progress)
   */
  const download = useCallback(
    async (path: string, onProgress?: (progress: UploadProgress) => void) => {
      setState(prev => ({ ...prev, loading: true, progress: 0, error: null }));

      try {
        // Get file size first
        const fileInfoResponse = await getFileInfo(path);
        const fileInfo = fileInfoResponse.data;

        if (!fileInfo) {
          throw new Error('File info not available');
        }

        const totalSize = fileInfo.size;

        // Read file
        const contentResponse = await readFile(path);
        const content = contentResponse.data;

        // Simulate progress
        setState(prev => ({ ...prev, progress: 100 }));

        if (onProgress) {
          onProgress({ loaded: totalSize, total: totalSize, percentage: 100 });
        }

        setState(prev => ({ ...prev, loading: false, progress: null, error: null }));
        return content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to download file';
        setState(prev => ({
          ...prev,
          loading: false,
          progress: null,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      files: null,
      currentFile: null,
      loading: false,
      progress: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    list,
    info,
    exists,
    remove,
    copy,
    move,
    createDir,
    upload,
    download,
    reset,
  };
}

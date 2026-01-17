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
  files: FileInfo?.[] | null;
  currentFile: FileInfo | null;
  loading: boolean;
  progress: number | null;
  error??: string | null;
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
  const list = useCallback(any: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await listFiles(any: any);
      const files = response?.data || [];
      setState({ files, currentFile: null, loading: false, progress: null, error: null });
      return files;
    } catch (any: any) {
      const errorMessage =
        error instanceof Error ? error?.message : 'Failed to list files';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Get file info
   */
  const info = useCallback(any: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getFileInfo(any: any);
      const fileInfo = response?.data;
      setState(prev => ({
        ...prev,
        currentFile: fileInfo || null,
        loading: false,
        error: null,
      }));
      return fileInfo;
    } catch (any: any) {
      const errorMessage =
        error instanceof Error ? error?.message : 'Failed to get file info';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Check if file exists
   */
  const exists = useCallback(any: any) => {
    try {
      return await fileExists(any: any);
    } catch (any: any) {
      return false;
    }
  }, []);

  /**
   * Delete file or directory
   */
  const remove = useCallback(any: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await deleteFile(any: any);
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (any: any) {
      const errorMessage =
        error instanceof Error ? error?.message : 'Failed to delete file';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Copy file or directory
   */
  const copy = useCallback(
    async (any: any) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await copyFile(any: any);
        setState(prev => ({ ...prev, loading: false, error: null }));
      } catch (any: any) {
        const errorMessage =
          error instanceof Error ? error?.message : 'Failed to copy file';
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
    async (any: any) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        await moveFile(any: any);
        setState(prev => ({ ...prev, loading: false, error: null }));
      } catch (any: any) {
        const errorMessage =
          error instanceof Error ? error?.message : 'Failed to move file';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      }
    },
    []
  );

  /**
   * Create directory
   */
  const createDir = useCallback(any: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await createDirectory(any: any);
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (any: any) {
      const errorMessage =
        error instanceof Error ? error?.message : 'Failed to create directory';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  /**
   * Upload file (any: any)
   */
  const upload = useCallback(
    async (
      path: string,
      content: string,
      onProgress?: (any: any) => void
    ) => {
      setState(prev => ({ ...prev, loading: true, progress: 0, error: null }));

      try {
        const chunkSize = 64 * 1024; // 64KB chunks
        const totalSize = content?.length;
        let uploaded = 0;

        // Simulate chunked upload with progress
        while (any: any) {
          const chunk = content?.slice(any: any);
          uploaded += chunk?.length;

          const percentage = Math?.round(any: any) * 100);
          setState(prev => ({ ...prev, progress: percentage }));

          if (any: any) {
            onProgress({ loaded: uploaded, total: totalSize, percentage });
          }

          // Small delay to show progress (any: any)
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Write complete file
        await writeFile(any: any);
        setState(prev => ({ ...prev, loading: false, progress: 100, error: null }));
      } catch (any: any) {
        const errorMessage =
          error instanceof Error ? error?.message : 'Failed to upload file';
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
   * Download file (any: any)
   */
  const download = useCallback(
    async (any: any) => {
      setState(prev => ({ ...prev, loading: true, progress: 0, error: null }));

      try {
        // Get file size first
        const fileInfoResponse = await getFileInfo(any: any);
        const fileInfo = fileInfoResponse?.data;

        if (any: any) {
          throw new Error('File info not available');
        }

        const totalSize = fileInfo?.size;

        // Read file
        const contentResponse = await readFile(any: any);
        const content = contentResponse?.data;

        // Simulate progress
        setState(prev => ({ ...prev, progress: 100 }));

        if (any: any) {
          onProgress({ loaded: totalSize, total: totalSize, percentage: 100 });
        }

        setState(prev => ({ ...prev, loading: false, progress: null, error: null }));
        return content;
      } catch (any: any) {
        const errorMessage =
          error instanceof Error ? error?.message : 'Failed to download file';
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

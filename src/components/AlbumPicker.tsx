import React, { useState, useEffect } from 'react';
import { X, Folder, ChevronRight, Home, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../config/axios';

interface AlbumFolder {
  _id: string;
  name: string;
  description: string;
  parentFolder: string | null;
}

interface AlbumFile {
  _id: string;
  folder: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  type: string;
  mimeType: string;
  size: number;
}

interface AlbumPickerProps {
  onClose: () => void;
  onSelectFiles: (files: File[]) => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
  allowMultiple?: boolean;
  fileType?: 'image' | 'video' | 'all';
}

const AlbumPicker: React.FC<AlbumPickerProps> = ({
  onClose,
  onSelectFiles,
  showAlert,
  allowMultiple = true,
  fileType = 'image'
}) => {
  const [folders, setFolders] = useState<AlbumFolder[]>([]);
  const [files, setFiles] = useState<AlbumFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<AlbumFolder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<AlbumFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processingFiles, setProcessingFiles] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await api.get('/v1/folders');
      setFolders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      showAlert('Failed to fetch folders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubfolders = async (parentId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/folders/parent/${parentId}`);
      setFolders(response.data.children || []);
    } catch (error) {
      console.error('Error fetching subfolders:', error);
      showAlert('Failed to fetch subfolders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async (folderId: string) => {
    setLoadingFiles(true);
    try {
      const response = await api.get(`/v1/files/folder/${folderId}`);
      const filesData = Array.isArray(response.data) ? response.data : (response.data.data || []);

      const filteredFiles = filesData.filter((file: AlbumFile) => {
        if (fileType === 'all') return true;
        return file.type === fileType;
      });

      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      showAlert('Failed to fetch files', 'error');
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFolderClick = (folder: AlbumFolder) => {
    setSelectedFolder(folder);
    setBreadcrumbs(prev => [...prev, folder]);
    fetchSubfolders(folder._id);
    fetchFiles(folder._id);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedFolder(null);
      setBreadcrumbs([]);
      fetchFolders();
      setFiles([]);
    } else {
      const clickedFolder = breadcrumbs[index];
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setSelectedFolder(clickedFolder);
      fetchSubfolders(clickedFolder._id);
      fetchFiles(clickedFolder._id);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  };

  const handleConfirmSelection = async () => {
    if (selectedFiles.size === 0) {
      showAlert('Please select at least one file', 'error');
      return;
    }

    setProcessingFiles(true);
    try {
      const selectedFileObjects = files.filter(f => selectedFiles.has(f._id));
      const filePromises = selectedFileObjects.map(file =>
        urlToFile(`https://laqsya.com${file.fileUrl}`, file.originalName, file.mimeType)
      );

      const convertedFiles = await Promise.all(filePromises);
      onSelectFiles(convertedFiles);
      onClose();
    } catch (error) {
      console.error('Error processing files:', error);
      showAlert('Failed to process selected files', 'error');
    } finally {
      setProcessingFiles(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-black">
          <h2 className="text-2xl font-bold text-gray-900">Pick from Album</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {breadcrumbs.length > 0 && (
          <div className="px-6 pt-4 flex items-center gap-2 text-sm">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Albums</span>
            </button>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb._id}>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-black transition-colors ${
                    index === breadcrumbs.length - 1
                      ? 'text-black font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : !selectedFolder ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  No folders available
                </div>
              ) : (
                folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => handleFolderClick(folder)}
                    className="p-6 border border-black hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Folder className="h-8 w-8 text-gray-700 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {folder.name}
                          </h3>
                          {folder.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {folder.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {folders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Folders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                      <button
                        key={folder._id}
                        onClick={() => handleFolderClick(folder)}
                        className="p-6 border border-black hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Folder className="h-8 w-8 text-gray-700 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {folder.name}
                              </h3>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {fileType === 'image' ? 'Images' : fileType === 'video' ? 'Videos' : 'Files'}
                </h3>
                {loadingFiles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No {fileType === 'all' ? 'files' : `${fileType}s`} in this folder
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div
                        key={file._id}
                        onClick={() => toggleFileSelection(file._id)}
                        className={`border-2 cursor-pointer transition-all overflow-hidden ${
                          selectedFiles.has(file._id)
                            ? 'border-black bg-gray-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          {file.type === 'image' ? (
                            <img
                              src={`https://laqsya.com${file.fileUrl}`}
                              alt={file.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : file.type === 'video' ? (
                            <video
                              src={`https://laqsya.com${file.fileUrl}`}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-gray-400" />
                          )}
                          {selectedFiles.has(file._id) && (
                            <div className="absolute top-2 right-2 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-black p-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selectedFiles.size} {allowMultiple ? 'files' : 'file'} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
              disabled={processingFiles}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 flex items-center gap-2"
              disabled={selectedFiles.size === 0 || processingFiles}
            >
              {processingFiles ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Select ${selectedFiles.size > 0 ? `(${selectedFiles.size})` : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumPicker;

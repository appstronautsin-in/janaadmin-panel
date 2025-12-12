import React, { useState, useEffect } from 'react';
import { FolderPlus, Folder, ChevronRight, Loader2, X, Pencil, Home, Upload, Image, Video, FileText, File as FileIcon, Download, CheckSquare, Square } from 'lucide-react';
import api from '../config/axios';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface Folder {
  _id: string;
  name: string;
  description: string;
  parentFolder: string | null;
  createdBy: {
    _id: string;
    fullname: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FileItem {
  _id: string;
  folder: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  type: string;
  mimeType: string;
  size: number;
  uploadedBy: {
    _id: string;
    fullname: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ManageAlbumsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageAlbums: React.FC<ManageAlbumsProps> = ({ onClose, showAlert }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [subfolders, setSubfolders] = useState<Folder[]>([]);
  const [loadingSubfolders, setLoadingSubfolders] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'folders' | 'files'>('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);

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
    setLoadingSubfolders(true);
    try {
      const response = await api.get(`/v1/folders/parent/${parentId}`);
      setSubfolders(response.data.children || []);
    } catch (error) {
      console.error('Error fetching subfolders:', error);
      showAlert('Failed to fetch subfolders', 'error');
    } finally {
      setLoadingSubfolders(false);
    }
  };

  const fetchFiles = async (folderId: string) => {
    setLoadingFiles(true);
    try {
      const response = await api.get(`/v1/files/folder/${folderId}`);
      const filesData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setFiles(filesData);
    } catch (error) {
      console.error('Error fetching files:', error);
      showAlert('Failed to fetch files', 'error');
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder);
    setBreadcrumbs(prev => [...prev, folder]);
    setFilterMode('all');
    setSelectedFiles(new Set());
    fetchSubfolders(folder._id);
    fetchFiles(folder._id);
  };

  const handleCreateFolder = () => {
    setShowCreateModal(true);
    setIsCreatingSubfolder(false);
    setCreateForm({ name: '', description: '' });
  };

  const handleCreateSubfolder = () => {
    if (!selectedFolder) {
      showAlert('Please select a parent folder first', 'error');
      return;
    }
    setShowCreateModal(true);
    setIsCreatingSubfolder(true);
    setCreateForm({ name: '', description: '' });
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      showAlert('Folder name is required', 'error');
      return;
    }

    setCreating(true);
    try {
      let response;
      if (isCreatingSubfolder && selectedFolder) {
        response = await api.post(`/v1/folders/${selectedFolder._id}`, createForm);

        await logActivity(
          ActivityActions.CREATE,
          ActivitySections.ALBUMS,
          `Created subfolder: ${createForm.name} under ${selectedFolder.name}`,
          { folderName: createForm.name, parentFolder: selectedFolder.name }
        );

        fetchSubfolders(selectedFolder._id);
      } else {
        response = await api.post('/v1/folders', createForm);

        await logActivity(
          ActivityActions.CREATE,
          ActivitySections.ALBUMS,
          `Created folder: ${createForm.name}`,
          { folderName: createForm.name }
        );

        fetchFolders();
      }

      showAlert(`${isCreatingSubfolder ? 'Subfolder' : 'Folder'} created successfully`, 'success');
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
    } catch (error: any) {
      console.error('Error creating folder:', error);
      showAlert(error.response?.data?.error || 'Failed to create folder', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setSubfolders([]);
    setBreadcrumbs([]);
    setSelectedFiles(new Set());
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      handleBackToFolders();
    } else {
      const clickedFolder = breadcrumbs[index];
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setSelectedFolder(clickedFolder);
      setFilterMode('all');
      setSelectedFiles(new Set());
      fetchSubfolders(clickedFolder._id);
      fetchFiles(clickedFolder._id);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile || !selectedFolder) {
      showAlert('Please select a file to upload', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folderId', selectedFolder._id);

      await api.post('/v1/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await logActivity(
        ActivityActions.UPLOAD,
        ActivitySections.ALBUMS,
        `Uploaded file: ${uploadFile.name} to folder ${selectedFolder.name}`,
        { fileName: uploadFile.name, folderId: selectedFolder._id }
      );

      showAlert('File uploaded successfully', 'success');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchFiles(selectedFolder._id);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showAlert(error.response?.data?.error || 'Failed to upload file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-12 w-12 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="h-12 w-12 text-purple-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-12 w-12 text-red-500" />;
    return <FileIcon className="h-12 w-12 text-gray-500" />;
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleEditFolder = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setEditForm({
      name: folder.name,
      description: folder.description
    });
    setShowEditModal(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      showAlert('Folder name is required', 'error');
      return;
    }

    if (!editingFolder) return;

    setUpdating(true);
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        parentFolder: editingFolder.parentFolder
      };

      await api.put(`/v1/folders/${editingFolder._id}`, updateData);

      await logActivity(
        ActivityActions.EDIT,
        ActivitySections.ALBUMS,
        `Updated folder: ${editingFolder.name} to ${editForm.name}`,
        { folderId: editingFolder._id, oldName: editingFolder.name, newName: editForm.name }
      );

      if (editingFolder.parentFolder) {
        fetchSubfolders(editingFolder.parentFolder);
      } else {
        fetchFolders();
      }

      showAlert('Folder updated successfully', 'success');
      setShowEditModal(false);
      setEditingFolder(null);
      setEditForm({ name: '', description: '' });
    } catch (error: any) {
      console.error('Error updating folder:', error);
      showAlert(error.response?.data?.error || 'Failed to update folder', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Album Management</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {breadcrumbs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm">
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

      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-3">
          {!selectedFolder && (
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Create Folder
            </button>
          )}
          {selectedFolder && (
            <>
              <button
                onClick={handleCreateSubfolder}
                className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                Create Subfolder
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
            </>
          )}
        </div>
        {selectedFolder && (
          <div className="flex items-center gap-4">
            {selectedFiles.size > 0 && (
              <div className="text-sm font-medium text-gray-700">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                <button
                  onClick={clearSelection}
                  className="ml-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="flex gap-2 border border-black">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-4 py-2 transition-colors ${
                  filterMode === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('folders')}
                className={`px-4 py-2 transition-colors ${
                  filterMode === 'folders'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Folders
              </button>
              <button
                onClick={() => setFilterMode('files')}
                className={`px-4 py-2 transition-colors ${
                  filterMode === 'files'
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Files
              </button>
            </div>
          </div>
        )}
      </div>

      {!selectedFolder ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No folders yet. Create your first folder to get started.
            </div>
          ) : (
            folders.map((folder) => (
              <div
                key={folder._id}
                className="relative p-6 border border-black hover:bg-gray-50 transition-colors group"
              >
                <button
                  onClick={() => handleFolderClick(folder)}
                  className="w-full text-left"
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
                        <p className="text-xs text-gray-500 mt-2">
                          Created by {folder.createdBy.fullname}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                </button>
                <button
                  onClick={(e) => handleEditFolder(folder, e)}
                  className="absolute top-3 right-3 p-2 border border-black bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit folder"
                >
                  <Pencil className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {(loadingSubfolders || loadingFiles) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(() => {
                const showFolders = filterMode === 'all' || filterMode === 'folders';
                const showFiles = filterMode === 'all' || filterMode === 'files';
                const hasContent = (showFolders && subfolders.length > 0) || (showFiles && files.length > 0);

                if (!hasContent) {
                  return (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      {filterMode === 'folders' && 'No subfolders yet. Create your first subfolder in this folder.'}
                      {filterMode === 'files' && 'No files yet. Upload your first file to this folder.'}
                      {filterMode === 'all' && 'This folder is empty. Create subfolders or upload files to get started.'}
                    </div>
                  );
                }

                return (
                  <>
                    {showFolders && subfolders.map((subfolder) => (
                      <div
                        key={subfolder._id}
                        className="relative p-6 border border-black hover:bg-gray-50 transition-colors group col-span-2"
                      >
                        <button
                          onClick={() => handleFolderClick(subfolder)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <Folder className="h-8 w-8 text-gray-700 flex-shrink-0 mt-1" />
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {subfolder.name}
                                </h3>
                                {subfolder.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {subfolder.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  Created by {subfolder.createdBy.fullname}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleEditFolder(subfolder, e)}
                          className="absolute top-3 right-3 p-2 border border-black bg-white hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit subfolder"
                        >
                          <Pencil className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    ))}
                    {showFiles && files.map((file) => {
                      const isSelected = selectedFiles.has(file._id);
                      return (
                        <div
                          key={file._id}
                          className={`relative border hover:bg-gray-50 transition-colors overflow-hidden flex flex-col ${
                            isSelected ? 'border-blue-500 border-2' : 'border-black'
                          }`}
                        >
                          <button
                            onClick={() => toggleFileSelection(file._id)}
                            className="absolute top-2 left-2 z-10 p-1 bg-white border border-black hover:bg-gray-100 transition-colors"
                            title={isSelected ? 'Deselect' : 'Select'}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-600" />
                            )}
                          </button>
                          <div
                            className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => setPreviewFile(file)}
                          >
                            {file.type === 'image' ? (
                              <img
                                src={`https://laqsya.com${file.fileUrl}`}
                                alt={file.originalName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : file.type === 'video' ? (
                              <video
                                src={`https://laqsya.com${file.fileUrl}`}
                                className="w-full h-full object-cover"
                                controls={false}
                                preload="metadata"
                              />
                            ) : (
                              <div className="flex items-center justify-center">
                                {getFileIcon(file.mimeType)}
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col items-center text-center">
                            <h4 className="text-sm font-semibold text-gray-900 truncate w-full mb-1">
                              {file.originalName}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {formatFileSize(file.size)}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              By {file.uploadedBy.fullname}
                            </p>
                            <a
                              href={`https://laqsya.com${file.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 border border-black text-xs text-black bg-white hover:bg-black hover:text-white transition-colors flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4 border-b border-black pb-3">
              <h3 className="text-xl font-bold">
                {isCreatingSubfolder ? 'Create Subfolder' : 'Create Folder'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter folder name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter folder description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4 border-b border-black pb-3">
              <h3 className="text-xl font-bold">Edit Folder</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter folder name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter folder description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4 border-b border-black pb-3">
              <h3 className="text-xl font-bold">Upload File</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setIsDragging(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File <span className="text-red-600">*</span>
                </label>

                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragging
                      ? 'border-black bg-gray-100 scale-105'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                  />

                  <div className="flex flex-col items-center">
                    <Upload className={`h-12 w-12 mb-3 transition-colors ${
                      isDragging ? 'text-black' : 'text-gray-400'
                    }`} />
                    {uploadFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {uploadFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.size)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadFile(null);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className={`text-sm font-medium mb-1 ${
                          isDragging ? 'text-black' : 'text-gray-700'
                        }`}>
                          {isDragging ? 'Drop file here' : 'Drag and drop file here'}
                        </p>
                        <p className="text-xs text-gray-500">
                          or click to browse
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Supports: Images, Videos, PDF, DOC, DOCX
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setIsDragging(false);
                  }}
                  className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadFile}
                  className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black flex items-center gap-2"
                  disabled={uploading || !uploadFile}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full max-h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white">
                <h3 className="text-xl font-bold">{previewFile.originalName}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  {formatFileSize(previewFile.size)} • Uploaded by {previewFile.uploadedBy.fullname}
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-white hover:text-gray-300"
              >
                <X className="h-8 w-8" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto">
              {previewFile.type === 'image' ? (
                <img
                  src={`https://laqsya.com${previewFile.fileUrl}`}
                  alt={previewFile.originalName}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              ) : previewFile.type === 'video' ? (
                <video
                  src={`https://laqsya.com${previewFile.fileUrl}`}
                  controls
                  className="max-w-full max-h-[80vh]"
                  autoPlay
                />
              ) : previewFile.mimeType === 'application/pdf' ? (
                <iframe
                  src={`https://laqsya.com${previewFile.fileUrl}`}
                  className="w-full h-[80vh] bg-white"
                  title={previewFile.originalName}
                />
              ) : (
                <div className="text-center text-white">
                  <div className="mb-4">{getFileIcon(previewFile.mimeType)}</div>
                  <p className="mb-4">Preview not available for this file type</p>
                  <a
                    href={`https://laqsya.com${previewFile.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <a
                href={`https://laqsya.com${previewFile.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAlbums;

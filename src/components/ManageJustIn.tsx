import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Eye, AlertTriangle, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewJustIn from './ViewJustIn';
import EditJustIn from './EditJustIn';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface JustIn {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  image: string;
  views?: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

interface ManageJustInProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageJustIn: React.FC<ManageJustInProps> = ({ showAlert }) => {
  const [justIns, setJustIns] = useState<JustIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [viewingJustIn, setViewingJustIn] = useState<JustIn | null>(null);
  const [editingJustInId, setEditingJustInId] = useState<string | null>(null);

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editJustIn');
  const canDelete = checkPermission('deleteJustIn');

  useEffect(() => {
    fetchJustIns();
  }, []);

  const fetchJustIns = async () => {
    try {
      const response = await api.get('/v1/justin/all');
      setJustIns(response.data);
    } catch (error) {
      console.error('Error fetching Just In posts:', error);
      showAlert('Failed to fetch Just In posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit Just In posts', 'error');
      return;
    }
    setEditingJustInId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete Just In posts', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this Just In post?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/justin/${id}`);
      setJustIns(prev => prev.filter(item => item._id !== id));
      showAlert('Just In post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting Just In post:', error);
      showAlert('Failed to delete Just In post', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (justIn: JustIn) => {
    setViewingJustIn(justIn);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to update Just In posts', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.patch(`/v1/justin/${id}`, { isActive: !currentStatus });
      setJustIns(prev => prev.map(item =>
        item._id === id ? { ...item, isActive: !currentStatus } : item
      ));
      showAlert(`Just In post ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error toggling Just In post status:', error);
      showAlert('Failed to update Just In post status', 'error');
    } finally {
      setToggleLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (editingJustInId) {
    return (
      <EditJustIn
        justInId={editingJustInId}
        onClose={() => setEditingJustInId(null)}
        onSuccess={fetchJustIns}
        showAlert={showAlert}
      />
    );
  }

  if (viewingJustIn) {
    return (
      <ViewJustIn
        justIn={viewingJustIn}
        onClose={() => setViewingJustIn(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Zap className="h-8 w-8 text-gray-700 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Ideega</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all Just In news posts</p>
        </div>
      </div>

      {justIns.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Zap className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No Just In posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {justIns.map((justIn) => {
            const expired = isExpired(justIn.expiry);
            const views = justIn.views ?? 0;

            return (
              <div
                key={justIn._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                {justIn.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={`${IMAGE_BASE_URL}/${justIn.image}`}
                      alt={justIn.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        justIn.isActive && !expired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {justIn.isActive && !expired ? 'Active' : expired ? 'Expired' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {justIn.title}
                  </h3>
                </div>

                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {justIn.content}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Views: {views}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className={expired ? 'text-red-600 font-medium' : ''}>
                        {expired ? 'Expired: ' : 'Expires: '}{formatDate(justIn.expiry)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleView(justIn)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(justIn._id)}
                      disabled={!canEdit}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(justIn._id)}
                      disabled={!canDelete || deleteLoading === justIn._id}
                      className="p-2 text-red-600 hover:bg-red-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleteLoading === justIn._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(justIn._id, justIn.isActive)}
                    disabled={!canEdit || toggleLoading === justIn._id || expired}
                    className={`w-full flex items-center justify-center px-3 py-2 border transition-colors text-sm font-medium ${
                      justIn.isActive
                        ? 'border-red-300 text-red-700 hover:bg-red-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {toggleLoading === justIn._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : justIn.isActive ? (
                      <XCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {justIn.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageJustIn;

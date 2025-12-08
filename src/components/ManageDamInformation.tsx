import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Eye, Database, DropletIcon } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewDamInformation from './ViewDamInformation';
import EditDamInformation from './EditDamInformation';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface DamInformation {
  _id: string;
  title: string;
  points: Array<{
    _id: string;
    key: string;
    value: string;
    unit: string;
  }>;
  image: string;
  views?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ManageDamInformationProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageDamInformation: React.FC<ManageDamInformationProps> = ({ showAlert }) => {
  const [damInformation, setDamInformation] = useState<DamInformation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [editingDamId, setEditingDamId] = useState<string | null>(null);
  const [viewingDam, setViewingDam] = useState<DamInformation | null>(null);

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editDamInformation');
  const canDelete = checkPermission('deleteDamInformation');

  useEffect(() => {
    fetchDamInformation();
  }, []);

  const fetchDamInformation = async () => {
    try {
      const response = await api.get('/v1/dam-information/all');
      setDamInformation(response.data);
    } catch (error) {
      console.error('Error fetching dam information:', error);
      showAlert('Failed to fetch dam information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit dam information', 'error');
      return;
    }
    setEditingDamId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete dam information', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this dam information?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/dam-information/${id}`);
      setDamInformation(prev => prev.filter(dam => dam._id !== id));
      showAlert('Dam information deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting dam information:', error);
      showAlert('Failed to delete dam information', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to change dam information status', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.patch(`/v1/dam-information/${id}/toggle-active`);
      setDamInformation(prev =>
        prev.map(dam =>
          dam._id === id ? { ...dam, isActive: !currentStatus } : dam
        )
      );
      showAlert(`Dam information ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error toggling dam information status:', error);
      showAlert('Failed to update dam information status', 'error');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleView = (dam: DamInformation) => {
    setViewingDam(dam);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (editingDamId) {
    return (
      <EditDamInformation
        damInfoId={editingDamId}
        onClose={() => {
          setEditingDamId(null);
          fetchDamInformation();
        }}
        onSuccess={() => {
          setEditingDamId(null);
          fetchDamInformation();
        }}
        showAlert={showAlert}
      />
    );
  }

  if (viewingDam) {
    return (
      <ViewDamInformation
        dam={viewingDam}
        onClose={() => setViewingDam(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <DropletIcon className="h-8 w-8 text-gray-700 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Chutuku</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all dam water level data</p>
        </div>
      </div>

      {damInformation.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <DropletIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No dam information found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {damInformation.map((dam) => {
            const views = dam.views ?? 0;

            return (
              <div
                key={dam._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                {dam.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={`${IMAGE_BASE_URL}/${dam.image}`}
                      alt={dam.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        dam.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {dam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {dam.title}
                  </h3>
                </div>

                <div className="p-4 flex-1">
                  <div className="space-y-2 mb-4">
                    {dam.points.slice(0, 3).map((point) => (
                      <div key={point._id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="text-gray-700 font-medium">{point.key}:</span>
                        <span className="text-gray-900">{point.value} {point.unit}</span>
                      </div>
                    ))}
                    {dam.points.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        +{dam.points.length - 3} more data point(s)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>Views: {views}</span>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    Expires: {formatDate(dam.createdAt)}
                  </div>
                </div>

                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(dam)}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(dam._id)}
                        disabled={!canEdit}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dam._id)}
                        disabled={!canDelete || deleteLoading === dam._id}
                        className="p-2 text-red-600 hover:bg-red-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {deleteLoading === dam._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleActive(dam._id, dam.isActive)}
                      disabled={!canEdit || toggleLoading === dam._id}
                      className={`w-full flex items-center justify-center px-3 py-2 border transition-colors text-sm font-medium ${
                        dam.isActive
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'border-green-300 text-green-700 hover:bg-green-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {toggleLoading === dam._id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      {dam.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageDamInformation;

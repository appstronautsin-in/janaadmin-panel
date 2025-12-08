import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, Eye, FileText, ToggleLeft, ToggleRight, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewFifty from './ViewFifty';
import EditFifty from './EditFifty';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface FiftyYear {
  _id: string;
  title: string;
  date: string;
  description: string;
  isActive: boolean;
  image: string;
  isPremiuim: boolean;
  views?: number;
  createdAt: string;
  updatedAt: string;
}

interface ManageFiftyProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageFifty: React.FC<ManageFiftyProps> = ({ onClose, showAlert }) => {
  const [fiftyYears, setFiftyYears] = useState<FiftyYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [viewingFifty, setViewingFifty] = useState<FiftyYear | null>(null);
  const [editingFiftyId, setEditingFiftyId] = useState<string | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editFifty');
  const canDelete = checkPermission('deleteFifty');

  useEffect(() => {
    fetchFiftyYears();
  }, []);

  const fetchFiftyYears = async () => {
    try {
      const response = await api.get('/v1/fifty-years/all/admin');
      setFiftyYears(response.data);
    } catch (error) {
      console.error('Error fetching FiftyYears:', error);
      showAlert('Failed to fetch FiftyYears', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to modify FiftyYears status', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.put(`/v1/fifty-years/edit/${id}`, {
        isActive: !currentStatus
      });
      
      // Update the local state
      setFiftyYears(prev => 
        prev.map(item => 
          item._id === id 
            ? { ...item, isActive: !currentStatus }
            : item
        )
      );
      
      showAlert(
        `FiftyYears ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling FiftyYears status:', error);
      showAlert('Failed to update FiftyYears status', 'error');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit FiftyYears', 'error');
      return;
    }
    setEditingFiftyId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete FiftyYears', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this FiftyYears entry?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/fifty-years/${id}`);
      setFiftyYears(fiftyYears.filter(item => item._id !== id));
      showAlert('FiftyYears deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting FiftyYears:', error);
      showAlert('Failed to delete FiftyYears', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (fiftyYear: FiftyYear) => {
    setViewingFifty(fiftyYear);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  return (
    <>
      <div className="bg-white border border-black shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Manage Nenapina Angala</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {fiftyYears.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No FiftyYears entries found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fiftyYears.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                {item.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={`${IMAGE_BASE_URL}/${item.image}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
                        item.isActive
                          ? 'bg-green-100 text-green-800 border-green-800'
                          : 'bg-gray-100 text-gray-800 border-gray-800'
                      }`}>
                        {item.isActive ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${
                      item.isPremiuim
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-800'
                        : 'bg-gray-100 text-gray-800 border-gray-800'
                    }`}>
                      {item.isPremiuim ? 'Premium' : 'Free'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {item.description}
                  </p>

                  <div className="text-xs text-gray-500">
                    Date: {formatDate(item.date)}
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-grow">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Views: {item.views ?? 0}</span>
                    <span>Created: {formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleView(item)}
                    className="text-black hover:text-gray-700 border border-black p-1.5 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      disabled={toggleLoading === item._id}
                      className={`border p-1.5 rounded transition-colors ${
                        item.isActive
                          ? 'text-orange-600 hover:text-orange-800 border-orange-600 hover:border-orange-800'
                          : 'text-green-600 hover:text-green-800 border-green-600 hover:border-green-800'
                      } disabled:opacity-50`}
                      title={item.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {toggleLoading === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : item.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => handleEdit(item._id)}
                      className="text-black hover:text-gray-700 border border-black p-1.5 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deleteLoading === item._id}
                      className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1.5 rounded disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deleteLoading === item._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingFifty && (
        <ViewFifty
          fiftyYear={viewingFifty}
          onClose={() => setViewingFifty(null)}
        />
      )}

      {editingFiftyId && (
        <EditFifty
          fiftyYearId={editingFiftyId}
          onClose={() => setEditingFiftyId(null)}
          onSuccess={fetchFiftyYears}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageFifty;
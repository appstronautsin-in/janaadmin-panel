import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, ImageIcon } from 'lucide-react';
import axios from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface DoYouKnow {
  _id: string;
  title: string;
  content: string;
  expiry: string;
  isActive: boolean;
  image: string;
  likes: any[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface ManageDoYouKnowProps {
  onView: (doYouKnow: DoYouKnow) => void;
  onEdit: (doYouKnow: DoYouKnow) => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageDoYouKnow: React.FC<ManageDoYouKnowProps> = ({ onView, onEdit, showAlert }) => {
  const [doYouKnows, setDoYouKnows] = useState<DoYouKnow[]>([]);
  const [filteredDoYouKnows, setFilteredDoYouKnows] = useState<DoYouKnow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editDoYouKnow');
  const canDelete = checkPermission('deleteDoYouKnow');

  useEffect(() => {
    fetchDoYouKnows();
  }, []);

  useEffect(() => {
    const filtered = doYouKnows.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDoYouKnows(filtered);
  }, [searchTerm, doYouKnows]);

  const fetchDoYouKnows = async () => {
    try {
      const response = await axios.get('/v1/do-you-know/');
      setDoYouKnows(response.data);
      setFilteredDoYouKnows(response.data);
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to fetch Do You Know items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/v1/do-you-know/${id}`);
      showAlert('Do You Know deleted successfully!', 'success');
      setDeleteConfirm(null);
      fetchDoYouKnows();
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to delete Do You Know', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage Arivina Angala</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black w-64"
          />
        </div>
      </div>

      {filteredDoYouKnows.length === 0 ? (
        <div className="text-center py-12 border border-black">
          <p className="text-gray-500">No Do You Know items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoYouKnows.map((item) => (
            <div key={item._id} className="border border-black bg-white overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={`https://laqsya.com/${item.image}`}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.content}</p>

                <div className="text-xs text-gray-500 mb-3 space-y-1">
                  <div className="flex justify-between">
                    <span>Views: {item.views}</span>
                    <span>Likes: {item.likes.length}</span>
                  </div>
                  {item.expiry && (
                    <div>Expires: {new Date(item.expiry).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onView(item)}
                    className="flex-1 px-3 py-1.5 border border-black text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="flex-1 px-3 py-1.5 border border-black text-sm hover:bg-gray-50 flex items-center justify-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeleteConfirm(item._id)}
                      className="px-3 py-1.5 border border-red-500 text-red-500 text-sm hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white p-6 max-w-md w-full border border-black">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this Do You Know item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoYouKnow;

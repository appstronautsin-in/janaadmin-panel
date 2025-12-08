import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, FileText, ExternalLink } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import EditENews from './EditENews';

interface ENews {
  _id: string;
  title: string;
  thumbnail: string;
  newsPaperDate: string;
  pdf: string;
  addedBy: {
    _id: string;
    fullname: string;
    position: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ManageENewsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageENews: React.FC<ManageENewsProps> = ({ onClose, showAlert }) => {
  const [eNews, setENews] = useState<ENews[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editENews');
  const canDelete = checkPermission('deleteENews');

  useEffect(() => {
    fetchENews();
  }, [currentPage]);

  const fetchENews = async () => {
    try {
      const response = await api.get(`/v1/enews/admin?page=${currentPage}`);
      setENews(response.data);
    } catch (error) {
      console.error('Error fetching E-News:', error);
      showAlert('Failed to fetch E-News', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete E-News', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this E-News?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/enews/${id}`);
      setENews(eNews.filter(item => item._id !== id));
      showAlert('E-News deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting E-News:', error);
      showAlert('Failed to delete E-News', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit E-News', 'error');
      return;
    }
    setEditingNewsId(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
          <h2 className="text-2xl font-bold text-gray-900">Manage E-News</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Thumbnail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Newspaper Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Added By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {eNews.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <img
                      src={`${IMAGE_BASE_URL}/${item.thumbnail}`}
                      alt={item.title}
                      className="h-16 w-24 object-cover border border-black"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(item.newsPaperDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                    <div className="text-sm text-gray-900">{item.addedBy.fullname}</div>
                    <div className="text-sm text-gray-500">{item.addedBy.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`${IMAGE_BASE_URL}/${item.pdf}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="View PDF"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(item._id)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleteLoading === item._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center border-t border-black pt-4">
          <nav className="relative z-0 inline-flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      {editingNewsId && (
        <EditENews
          newsId={editingNewsId}
          onClose={() => setEditingNewsId(null)}
          onSuccess={fetchENews}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageENews;
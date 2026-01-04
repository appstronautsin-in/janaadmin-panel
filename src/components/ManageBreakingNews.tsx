import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Eye, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import EditBreakingNews from './EditBreakingNews';
import ViewBreakingNews from './ViewBreakingNews';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface BreakingNews {
  _id: string;
  title: string;
  subtitle: string;
  source: string | null;
  isActive: boolean;
  image?: string;
  views?: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
  addedBy?: {
    _id: string;
    fullname: string;
    position: string;
  };
}

interface ManageBreakingNewsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageBreakingNews: React.FC<ManageBreakingNewsProps> = ({ showAlert }) => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [viewingNews, setViewingNews] = useState<BreakingNews | null>(null);

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editBreakingNews');
  const canDelete = checkPermission('deleteBreakingNews');

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      const response = await api.get('/v1/breaking-news');
      setBreakingNews(response.data);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      showAlert('Failed to fetch breaking news', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit breaking news', 'error');
      return;
    }
    setEditingNewsId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete breaking news', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this breaking news?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/breaking-news/${id}`);
      setBreakingNews(prev => prev.filter(news => news._id !== id));
      showAlert('Breaking news deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      showAlert('Failed to delete breaking news', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (news: BreakingNews) => {
    setViewingNews(news);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to update breaking news', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.patch(`/v1/breaking-news/${id}`, { isActive: !currentStatus });
      setBreakingNews(prev => prev.map(news =>
        news._id === id ? { ...news, isActive: !currentStatus } : news
      ));
      showAlert(`Breaking news ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (error) {
      console.error('Error toggling breaking news status:', error);
      showAlert('Failed to update breaking news status', 'error');
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

  if (editingNewsId) {
    return (
      <EditBreakingNews
        newsId={editingNewsId}
        onClose={() => {
          setEditingNewsId(null);
          fetchBreakingNews();
        }}
        showAlert={showAlert}
      />
    );
  }

  if (viewingNews) {
    return (
      <ViewBreakingNews
        news={viewingNews}
        onClose={() => setViewingNews(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <AlertTriangle className="h-8 w-8 text-gray-700 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Breaking News</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all breaking news alerts</p>
        </div>
      </div>

      {breakingNews.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No breaking news found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {breakingNews.map((news) => {
            const expired = isExpired(news.expiry);
            const views = news.views ?? 0;

            return (
              <div
                key={news._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                {news.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={`${IMAGE_BASE_URL}/${news.image}`}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        news.isActive && !expired
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {news.isActive && !expired ? 'Active' : expired ? 'Expired' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {news.title}
                  </h3>
                </div>

                <div className="p-4 flex-1">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {news.subtitle}
                  </p>

                  <div className="space-y-2 text-sm">
                    {news.source && (
                      <div className="text-gray-600">
                        <span className="font-medium">Source:</span> {news.source}
                      </div>
                    )}

                    {news.addedBy && (
                      <div className="text-gray-600">
                        <span className="font-medium">Added By:</span> {news.addedBy.fullname}
                        {news.addedBy.position && <span className="text-xs ml-1">({news.addedBy.position})</span>}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>Views: {views}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className={expired ? 'text-red-600 font-medium' : ''}>
                        {expired ? 'Expired: ' : 'Expires: '}{formatDate(news.expiry)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleView(news)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(news._id)}
                      disabled={!canEdit}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(news._id)}
                      disabled={!canDelete || deleteLoading === news._id}
                      className="p-2 text-red-600 hover:bg-red-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleteLoading === news._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(news._id, news.isActive)}
                    disabled={!canEdit || toggleLoading === news._id || expired}
                    className={`w-full flex items-center justify-center px-3 py-2 border transition-colors text-sm font-medium ${
                      news.isActive
                        ? 'border-red-300 text-red-700 hover:bg-red-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {toggleLoading === news._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : news.isActive ? (
                      <XCircle className="h-4 w-4 mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    {news.isActive ? 'Deactivate' : 'Activate'}
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

export default ManageBreakingNews;

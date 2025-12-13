import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, Eye, Filter, Search, Facebook, MessageSquare, EyeOff, BarChart3 } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewNews from './ViewNews';
import EditNews from './EditNews';
import ViewComments from './ViewComments';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface ManageNewsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface News {
  _id: string;
  category: {
    _id: string;
    name: string;
  } | null;
  subCategory: {
    _id: string;
    name: string;
  } | null;
  image: string[];
  authors: Array<{
    _id: string;
    fullname: string;
    position: string;
  }>;
  addedBy: {
    _id: string;
    fullname: string;
    position: string;
  };
  title: string;
  subTitle: string;
  content: string;
  tags: string[];
  views: number;
  viewsVisible?: boolean;
  viwsCountToVisible?: number;
  commentsVisible?: boolean;
  status: 'Draft' | 'Approved' | 'Scheduled' | 'Published' | 'Rejected';
  shareable: boolean;
  isAllowedScreenshot: boolean;
  createdAt: string;
  updatedAt: string;
  scheduleDate?: string;
  isPublished: boolean;
  isPostUploadedFb?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

const ITEMS_PER_PAGE = 20;

const ManageNews: React.FC<ManageNewsProps> = ({ onClose, showAlert }) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewingNews, setViewingNews] = useState<News | null>(null);
  const [editingNews, setEditingNews] = useState<string | null>(null);
  const [viewingComments, setViewingComments] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [postingToFacebook, setPostingToFacebook] = useState<string | null>(null);
  const [updatingViews, setUpdatingViews] = useState<{ id: string; type: string } | null>(null);
  const [editingViewsCount, setEditingViewsCount] = useState<{ id: string; value: number } | null>(null);

  const { checkPermission } = usePermissions();
  const canCreate = checkPermission('createNews');
  const canEdit = checkPermission('editNews');
  const canDelete = checkPermission('deleteNews');
  const hasFullPermissions = canCreate && canEdit && canDelete;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!categoryLoading) {
      fetchNews();
    }
  }, [currentPage, selectedCategory, categoryLoading]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchNews();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/category/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to fetch categories', 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      let endpoint = '/v1/news/admin';
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (selectedCategory) {
        queryParams.append('category', selectedCategory);
      }

      const response = await api.get(`${endpoint}?${queryParams}`);
      
      if (response.data) {
        setNews(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalItems(response.data.totalItems || 0);
      } else {
        setNews([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showAlert('Failed to fetch news', 'error');
      setNews([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete news', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const newsToDelete = news.find(n => n._id === id);
      await api.delete(`/v1/news/${id}`);

      await logActivity(
        ActivityActions.DELETE,
        ActivitySections.NEWS,
        `Deleted news: ${newsToDelete?.title || 'Unknown'}`,
        { newsId: id, newsTitle: newsToDelete?.title, category: newsToDelete?.category?.name }
      );

      await fetchNews();
      showAlert('News deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting news:', error);
      showAlert('Failed to delete news', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (newsItem: News) => {
    setViewingNews(newsItem);
  };

  const handleEdit = (newsId: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit news', 'error');
      return;
    }
    setEditingNews(newsId);
  };

  const handlePostToFacebook = async (id: string) => {
    setPostingToFacebook(id);
    try {
      await api.post(`/v1/facebook-post/post-news/${id}`);
      showAlert('News posted to Facebook successfully', 'success');
    } catch (error: any) {
      console.error('Error posting to Facebook:', error);
      showAlert(error.response?.data?.message || 'Failed to post to Facebook', 'error');
    } finally {
      setPostingToFacebook(null);
    }
  };

  const handleToggleViewsVisible = async (id: string, currentValue: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit news settings', 'error');
      return;
    }

    setUpdatingViews({ id, type: 'viewsVisible' });
    try {
      const newsItem = news.find(n => n._id === id);

      const response = await api.get(`/v1/news/${id}`);
      const fullNewsData = response.data;

      const updatedData = {
        ...fullNewsData,
        viewsVisible: !currentValue
      };

      await api.put(`/v1/news/${id}`, updatedData);

      await logActivity(
        ActivityActions.UPDATE,
        ActivitySections.NEWS,
        `Updated Views Visible for news: ${newsItem?.title || 'Unknown'}`,
        { newsId: id, setting: 'viewsVisible', value: !currentValue }
      );

      await fetchNews();
      showAlert('Views Visible updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating views visible:', error);
      showAlert(error.response?.data?.message || 'Failed to update setting', 'error');
    } finally {
      setUpdatingViews(null);
    }
  };

  const handleUpdateViewsCount = async (id: string, value: number) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit news settings', 'error');
      return;
    }

    setUpdatingViews({ id, type: 'viwsCountToVisible' });
    try {
      const newsItem = news.find(n => n._id === id);

      const response = await api.get(`/v1/news/${id}`);
      const fullNewsData = response.data;

      const updatedData = {
        ...fullNewsData,
        viwsCountToVisible: value
      };

      await api.put(`/v1/news/${id}`, updatedData);

      await logActivity(
        ActivityActions.UPDATE,
        ActivitySections.NEWS,
        `Updated Views Count To Visible for news: ${newsItem?.title || 'Unknown'}`,
        { newsId: id, setting: 'viwsCountToVisible', value }
      );

      await fetchNews();
      showAlert('Views Count To Visible updated successfully', 'success');
      setEditingViewsCount(null);
    } catch (error: any) {
      console.error('Error updating views count:', error);
      showAlert(error.response?.data?.message || 'Failed to update setting', 'error');
    } finally {
      setUpdatingViews(null);
    }
  };

  const handleToggleCommentsVisible = async (id: string, currentValue: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit news settings', 'error');
      return;
    }

    setUpdatingViews({ id, type: 'commentsVisible' });
    try {
      const newsItem = news.find(n => n._id === id);

      const response = await api.get(`/v1/news/${id}`);
      const fullNewsData = response.data;

      const updatedData = {
        ...fullNewsData,
        commentsVisible: !currentValue
      };

      await api.put(`/v1/news/${id}`, updatedData);

      await logActivity(
        ActivityActions.UPDATE,
        ActivitySections.NEWS,
        `Updated Comments Visible for news: ${newsItem?.title || 'Unknown'}`,
        { newsId: id, setting: 'commentsVisible', value: !currentValue }
      );

      await fetchNews();
      showAlert('Comments Visible updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating comments visible:', error);
      showAlert(error.response?.data?.message || 'Failed to update setting', 'error');
    } finally {
      setUpdatingViews(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const formattedHours = String(hours12).padStart(2, '0');

    return `${day}-${month}-${year}:${formattedHours}:${minutes}${ampm}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-800';
    }
  };

  if (loading || categoryLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900">Manage News</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, subtitle, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2 min-w-[300px] max-w-[300px]">
            <Filter className="h-5 w-5 text-gray-500 shrink-0" />
            <div className="relative w-full">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-black rounded px-3 py-2 pr-8 bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option 
                    key={category._id} 
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No news articles found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-black">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                    Authors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                    Status
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
                {news.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-black">
                      <div className="flex items-center">
                        {item.image?.[0] && (
                          <img
                            src={`${IMAGE_BASE_URL}/${item.image[0]}`}
                            alt={item.title}
                            className="h-10 w-10 object-cover border border-black mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.subTitle.length > 50 
                              ? `${item.subTitle.substring(0, 50)}...` 
                              : item.subTitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                      <div className="text-sm text-gray-900">
                        {item.category?.name || 'Uncategorized'}
                      </div>
                      {item.subCategory && (
                        <div className="text-sm text-gray-500">{item.subCategory.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-black">
                      <div className="text-sm text-gray-900">
                        {item.authors?.map(author => author.fullname).join(', ') || 'No authors'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Added by: {item.addedBy?.fullname || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-medium border ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                        {item.scheduleDate && (
                          <div className="text-xs text-gray-500">
                            Scheduled: {formatDate(item.scheduleDate)}
                          </div>
                        )}
                        {item.isPostUploadedFb && (
                          <span className="px-2 inline-flex text-xs leading-5 font-medium bg-blue-100 text-blue-800 border border-blue-800">
                            Posted to FB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 border-r border-black">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {hasFullPermissions && (
                          <button
                            onClick={() => setViewingComments(item._id)}
                            className="text-green-600 hover:text-green-800 border border-green-600 hover:border-green-800 p-1"
                            title="View Comments"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleToggleViewsVisible(item._id, item.viewsVisible ?? false)}
                              disabled={updatingViews?.id === item._id && updatingViews.type === 'viewsVisible'}
                              className={`border p-1 disabled:opacity-50 ${
                                item.viewsVisible
                                  ? 'text-green-600 hover:text-green-800 border-green-600 hover:border-green-800'
                                  : 'text-gray-400 hover:text-gray-600 border-gray-400 hover:border-gray-600'
                              }`}
                              title={`Views Visible: ${item.viewsVisible ? 'ON' : 'OFF'}`}
                            >
                              {updatingViews?.id === item._id && updatingViews.type === 'viewsVisible' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : item.viewsVisible ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                            {editingViewsCount?.id === item._id ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min="0"
                                  value={editingViewsCount.value}
                                  onChange={(e) => setEditingViewsCount({ id: item._id, value: parseInt(e.target.value) || 0 })}
                                  className="w-16 border border-black px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleUpdateViewsCount(item._id, editingViewsCount.value)}
                                  disabled={updatingViews?.id === item._id && updatingViews.type === 'viwsCountToVisible'}
                                  className="text-green-600 hover:text-green-800 border border-green-600 hover:border-green-800 p-1 disabled:opacity-50"
                                  title="Save"
                                >
                                  {updatingViews?.id === item._id && updatingViews.type === 'viwsCountToVisible' ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <BarChart3 className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setEditingViewsCount(null)}
                                  className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1"
                                  title="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingViewsCount({ id: item._id, value: item.viwsCountToVisible || 0 })}
                                className="text-orange-600 hover:text-orange-800 border border-orange-600 hover:border-orange-800 p-1"
                                title={`Views Count To Visible: ${item.viwsCountToVisible || 0}`}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleCommentsVisible(item._id, item.commentsVisible ?? false)}
                              disabled={updatingViews?.id === item._id && updatingViews.type === 'commentsVisible'}
                              className={`border p-1 disabled:opacity-50 ${
                                item.commentsVisible
                                  ? 'text-purple-600 hover:text-purple-800 border-purple-600 hover:border-purple-800'
                                  : 'text-gray-400 hover:text-gray-600 border-gray-400 hover:border-gray-600'
                              }`}
                              title={`Comments Visible: ${item.commentsVisible ? 'ON' : 'OFF'}`}
                            >
                              {updatingViews?.id === item._id && updatingViews.type === 'commentsVisible' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : item.commentsVisible ? (
                                <MessageSquare className="h-4 w-4" />
                              ) : (
                                <MessageSquare className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handlePostToFacebook(item._id)}
                          disabled={postingToFacebook === item._id || item.isPostUploadedFb}
                          className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 p-1 disabled:opacity-50"
                          title={item.isPostUploadedFb ? "Already posted to Facebook" : "Post to Facebook"}
                        >
                          {postingToFacebook === item._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Facebook className="h-4 w-4" />
                          )}
                        </button>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center border-t border-black pt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {viewingNews && (
        <ViewNews
          news={viewingNews}
          onClose={() => setViewingNews(null)}
        />
      )}

      {editingNews && (
        <EditNews
          newsId={editingNews}
          onClose={() => setEditingNews(null)}
          onSuccess={fetchNews}
          showAlert={showAlert}
        />
      )}

      {viewingComments && (
        <ViewComments
          newsId={viewingComments}
          onClose={() => setViewingComments(null)}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageNews;
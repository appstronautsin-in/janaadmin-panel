import React, { useState, useEffect } from 'react';
import { Loader2, Eye, Trash2, FileText, ArrowLeft, CheckCircle, XCircle, Ban } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';

interface ManageSubmittedNewsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface SubmittedNews {
  _id: string;
  name: string;
  userId: string;
  platform: string;
  email: string;
  phone: string;
  category: {
    _id: string;
    name: string;
    image: string;
    designIndex: number;
  };
  title: string;
  files: string[];
  content: string;
  createdAt: string;
  isPublished: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  spam?: boolean;
}

const ManageSubmittedNews: React.FC<ManageSubmittedNewsProps> = ({ showAlert }) => {
  const [submittedNews, setSubmittedNews] = useState<SubmittedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewingNews, setViewingNews] = useState<SubmittedNews | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [spamLoading, setSpamLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedNewsForReject, setSelectedNewsForReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'rejected' | 'pending'>('all');

  useEffect(() => {
    fetchSubmittedNews();
  }, []);

  const fetchSubmittedNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/submit-news/all');
      setSubmittedNews(response.data.data);
    } catch (error) {
      console.error('Error fetching submitted news:', error);
      showAlert('Failed to fetch submitted news', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submitted news?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      await api.delete(`/v1/submit-news/${id}`);
      showAlert('Submitted news deleted successfully', 'success');
      fetchSubmittedNews();
    } catch (error) {
      console.error('Error deleting submitted news:', error);
      showAlert('Failed to delete submitted news', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to publish this news?')) {
      return;
    }

    try {
      setStatusLoading(id);
      await api.put(`/v1/submit-news/status/${id}`, {
        isPublished: true,
        isRejected: false,
        rejectionReason: null
      });
      showAlert('News published successfully', 'success');
      fetchSubmittedNews();
      if (viewingNews && viewingNews._id === id) {
        setViewingNews(null);
      }
    } catch (error: any) {
      console.error('Error publishing news:', error);
      showAlert(error.response?.data?.error || 'Failed to publish news', 'error');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleRejectClick = (id: string) => {
    setSelectedNewsForReject(id);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      showAlert('Rejection reason is required', 'error');
      return;
    }

    if (!selectedNewsForReject) return;

    try {
      setStatusLoading(selectedNewsForReject);
      await api.put(`/v1/submit-news/status/${selectedNewsForReject}`, {
        isPublished: false,
        isRejected: true,
        rejectionReason: rejectionReason
      });
      showAlert('News rejected successfully', 'success');
      setShowRejectModal(false);
      setSelectedNewsForReject(null);
      setRejectionReason('');
      fetchSubmittedNews();
      if (viewingNews && viewingNews._id === selectedNewsForReject) {
        setViewingNews(null);
      }
    } catch (error: any) {
      console.error('Error rejecting news:', error);
      showAlert(error.response?.data?.error || 'Failed to reject news', 'error');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleToggleSpam = async (item: SubmittedNews) => {
    const newSpamStatus = !item.spam;
    const confirmMessage = newSpamStatus
      ? 'Are you sure you want to mark this submitter as spam?'
      : 'Are you sure you want to remove spam status from this submitter?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSpamLoading(item._id);
    try {
      await api.put(`/v1/customer/auth/update-spam/${item.userId}`, {
        spam: newSpamStatus
      });

      setSubmittedNews(submittedNews.map(news =>
        news._id === item._id ? { ...news, spam: newSpamStatus } : news
      ));

      showAlert(
        newSpamStatus ? 'Submitter marked as spam' : 'Spam status removed',
        'success'
      );
    } catch (error) {
      console.error('Error updating spam status:', error);
      showAlert('Failed to update spam status', 'error');
    } finally {
      setSpamLoading(null);
    }
  };

  const handleView = (item: SubmittedNews) => {
    setViewingNews(item);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (item: SubmittedNews) => {
    return (
      <div className="flex flex-col gap-1">
        {item.isPublished && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
            Published
          </span>
        )}
        {item.isRejected && (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
            Rejected
          </span>
        )}
        {!item.isPublished && !item.isRejected && (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            Pending
          </span>
        )}
        {item.spam && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
            SPAM
          </span>
        )}
      </div>
    );
  };

  const getFilteredNews = () => {
    if (statusFilter === 'all') {
      return submittedNews;
    }
    if (statusFilter === 'published') {
      return submittedNews.filter(news => news.isPublished);
    }
    if (statusFilter === 'rejected') {
      return submittedNews.filter(news => news.isRejected);
    }
    if (statusFilter === 'pending') {
      return submittedNews.filter(news => !news.isPublished && !news.isRejected);
    }
    return submittedNews;
  };

  if (viewingNews) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">View Submitted News</h2>
              {getStatusBadge(viewingNews)}
            </div>
            <button
              onClick={() => setViewingNews(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to List</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{viewingNews.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{viewingNews.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{viewingNews.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <p className="text-gray-900 capitalize">{viewingNews.platform}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{viewingNews.category.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted On</label>
                <p className="text-gray-900">{formatDate(viewingNews.createdAt)}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <p className="text-gray-900 font-medium text-lg">{viewingNews.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">{viewingNews.content}</p>
              </div>
            </div>

            {viewingNews.files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attached Files</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {viewingNews.files.map((file, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <img
                        src={`${IMAGE_BASE_URL}${file}`}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewingNews.isRejected && viewingNews.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-red-900 mb-2">Rejection Reason</label>
                <p className="text-red-800">{viewingNews.rejectionReason}</p>
              </div>
            )}

            {!viewingNews.isPublished && !viewingNews.isRejected && (
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePublish(viewingNews._id)}
                  disabled={statusLoading === viewingNews._id}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {statusLoading === viewingNews._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Publish</span>
                </button>
                <button
                  onClick={() => handleRejectClick(viewingNews._id)}
                  disabled={statusLoading === viewingNews._id}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredNews = getFilteredNews();

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold">Manage Submitted News</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : submittedNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg">No submitted news found</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'rejected' | 'pending')}
                  className="px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
                <div className="text-sm text-gray-600">
                  Showing {filteredNews.length} of {submittedNews.length} news
                </div>
              </div>

              {filteredNews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="text-lg">No news match the selected filter</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-black">
                    <thead className="bg-gray-50">
                      <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Submitted By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Files
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider border-r border-black">
                      Submitted On
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNews.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 border-b border-black">
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 border-r border-black">
                        <div className="text-sm text-gray-900">{item.email}</div>
                        <div className="text-sm text-gray-500">{item.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm text-gray-900">{item.category.name}</div>
                      </td>
                      <td className="px-6 py-4 border-r border-black">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {item.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                          {item.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        <div className="text-sm text-gray-900">
                          {item.files.length} file(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                        {getStatusBadge(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
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
                          {!item.isPublished && !item.isRejected && (
                            <>
                              <button
                                onClick={() => handlePublish(item._id)}
                                disabled={statusLoading === item._id}
                                className="text-green-600 hover:text-green-800 border border-green-600 hover:border-green-800 p-1 disabled:opacity-50"
                                title="Publish"
                              >
                                {statusLoading === item._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectClick(item._id)}
                                disabled={statusLoading === item._id}
                                className="text-orange-600 hover:text-orange-800 border border-orange-600 hover:border-orange-800 p-1 disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleSpam(item)}
                            disabled={spamLoading === item._id}
                            className={`border p-1 disabled:opacity-50 ${
                              item.spam
                                ? 'text-green-600 hover:text-green-800 border-green-600 hover:border-green-800'
                                : 'text-orange-600 hover:text-orange-800 border-orange-600 hover:border-orange-800'
                            }`}
                            title={item.spam ? 'Remove Spam Status' : 'Mark as Spam'}
                          >
                            {spamLoading === item._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : item.spam ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Total: {submittedNews.length} submitted news
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold">Reject News</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedNewsForReject(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={statusLoading !== null}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                {statusLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Reject News</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubmittedNews;

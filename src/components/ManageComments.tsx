import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, MessageSquare, Eye, Search } from 'lucide-react';
import api from '../config/axios';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface ManageCommentsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Comment {
  _id: string;
  artical: {
    _id: string;
    title: string;
  };
  parent: string | null;
  author: {
    _id: string;
    fullname: string;
  };
  text: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  __v: number;
  replies: Comment[];
}

const ITEMS_PER_PAGE = 20;

const ManageComments: React.FC<ManageCommentsProps> = ({ onClose, showAlert }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    let filtered = [...comments];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(comment =>
        (comment.text && comment.text.toLowerCase().includes(search)) ||
        (comment.author?.fullname && comment.author.fullname.toLowerCase().includes(search)) ||
        (comment.artical?.title && comment.artical.title.toLowerCase().includes(search))
      );
    }

    setFilteredComments(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, comments]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/news/comment/comments');
      setComments(response.data || []);
      setFilteredComments(response.data || []);
      setTotalPages(Math.ceil((response.data || []).length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingComment(comment._id);
    try {
      await api.delete(`/v1/news/comment/admin/${comment.artical._id}/comment/${comment._id}`);

      await logActivity(
        ActivityActions.DELETE,
        ActivitySections.NEWS,
        `Deleted comment from news article: ${comment.artical.title}`,
        { newsId: comment.artical._id, commentId: comment._id }
      );

      setComments(prev => prev.filter(c => c._id !== comment._id));
      showAlert('Comment deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting comment:', error);
      showAlert('Failed to delete comment', 'error');
    } finally {
      setDeletingComment(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredComments.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-gray-900">Manage Comments</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by comment text, author, or article title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {filteredComments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No comments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {getCurrentPageData().map((comment) => (
                <tr key={comment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm">
                      <div
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                        onClick={() => setSearchTerm(comment.artical?.title || '')}
                        title="Click to filter by this article"
                      >
                        {comment.artical?.title || 'Unknown Article'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {comment.artical?._id}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                    <div className="text-sm text-gray-900">
                      {comment.author?.fullname || 'Anonymous'}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-700 max-w-md">
                      {comment.text.length > 150
                        ? `${comment.text.substring(0, 150)}...`
                        : comment.text}
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(comment.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDeleteComment(comment)}
                        disabled={deletingComment === comment._id}
                        className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete comment"
                      >
                        {deletingComment === comment._id ? (
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

      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center border-t border-black pt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredComments.length)} of {filteredComments.length} comments
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
  );
};

export default ManageComments;

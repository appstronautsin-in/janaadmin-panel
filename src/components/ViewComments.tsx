import React, { useState, useEffect } from 'react';
import { X, Loader2, Trash2, MessageSquare } from 'lucide-react';
import api from '../config/axios';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface ViewCommentsProps {
  newsId: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Comment {
  _id: string;
  artical: string;
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
}

const ViewComments: React.FC<ViewCommentsProps> = ({ newsId, onClose, showAlert }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/news/comment/${newsId}/comment`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingComment(commentId);
    try {
      await api.delete(`/v1/news/comment/admin/${newsId}/comment/${commentId}`);

      await logActivity(
        ActivityActions.DELETE,
        ActivitySections.NEWS,
        `Deleted comment from news article`,
        { newsId, commentId }
      );

      setComments(prev => prev.filter(comment => comment._id !== commentId));
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <h2 className="text-2xl font-bold text-gray-900">Comments ({comments.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="border border-black p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {comment.author?.fullname || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deletingComment === comment._id}
                      className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete comment"
                    >
                      {deletingComment === comment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-black px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewComments;

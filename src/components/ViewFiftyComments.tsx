import React, { useState, useEffect } from 'react';
import { X, Loader2, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import axios from '../config/axios';

interface Author {
  _id: string;
  fullname: string;
}

interface Comment {
  _id: string;
  artical: string;
  parent: string | null;
  author: Author;
  text: string;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  __v: number;
}

interface ViewFiftyCommentsProps {
  fiftyYearId: string;
  fiftyYearTitle: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ViewFiftyComments: React.FC<ViewFiftyCommentsProps> = ({
  fiftyYearId,
  fiftyYearTitle,
  onClose,
  showAlert
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [fiftyYearId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://laqsya.com/api/v1/fifty/comment/${fiftyYearId}/comment`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showAlert('Failed to fetch comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRootComments = () => {
    return comments.filter(comment => !comment.parent);
  };

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parent === parentId);
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment._id);

    return (
      <div key={comment._id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
        <div className={`bg-white border ${isReply ? 'border-gray-200' : 'border-gray-300'} rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {comment.author.fullname}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.text}
              </p>

              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center text-xs text-gray-600">
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  <span>{comment.likes.length}</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  <span>{comment.dislikes.length}</span>
                </div>
                {replies.length > 0 && (
                  <div className="flex items-center text-xs text-gray-600">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-3">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-600 mt-1">{fiftyYearTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-black" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No comments yet</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to comment on this article</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </p>
              </div>

              <div className="space-y-4">
                {getRootComments().map(comment => renderComment(comment))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFiftyComments;

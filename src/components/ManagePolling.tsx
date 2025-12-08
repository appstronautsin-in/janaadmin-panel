import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Eye, BarChart3, ToggleLeft, ToggleRight, Users, ThumbsUp } from 'lucide-react';
import api from '../config/axios';
import ViewPolling from './ViewPolling';
import EditPolling from './EditPolling';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface PollOption {
  _id: string;
  option: string;
  votes: number;
  percentage: number;
}

interface VoteLog {
  _id: string;
  userId: string;
  selectedOptionIndex: number;
  votedAt: string;
}

interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  votesLog: VoteLog[];
  views?: number;
  createdAt: string;
  updatedAt: string;
}

interface ManagePollingProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManagePolling: React.FC<ManagePollingProps> = ({ showAlert }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);
  const [editingPollId, setEditingPollId] = useState<string | null>(null);

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editPolling');
  const canDelete = checkPermission('deletePolling');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const response = await api.get('/v1/polling/all/admin');
      setPolls(response.data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      showAlert('Failed to fetch polls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to modify poll status', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.put(`/v1/polling/${id}/active`);

      setPolls(prev =>
        prev.map(poll =>
          poll._id === id
            ? { ...poll, isActive: !currentStatus }
            : poll
        )
      );

      showAlert(
        `Poll ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling poll status:', error);
      showAlert('Failed to update poll status', 'error');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit polls', 'error');
      return;
    }
    setEditingPollId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete polls', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/polling/${id}`);
      setPolls(prev => prev.filter(poll => poll._id !== id));
      showAlert('Poll deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting poll:', error);
      showAlert('Failed to delete poll', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (poll: Poll) => {
    setViewingPoll(poll);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options.reduce((total, option) => total + option.votes, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (editingPollId) {
    return (
      <EditPolling
        pollId={editingPollId}
        onClose={() => {
          setEditingPollId(null);
          fetchPolls();
        }}
        showAlert={showAlert}
      />
    );
  }

  if (viewingPoll) {
    return (
      <ViewPolling
        poll={viewingPoll}
        onClose={() => setViewingPoll(null)}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="h-8 w-8 text-gray-700 mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Polls</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all polling questions</p>
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">No polls found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => {
            const totalVotes = getTotalVotes(poll);
            const views = poll.views ?? 0;

            return (
              <div
                key={poll._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-gray-600" />
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        poll.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {poll.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {poll.question}
                  </h3>
                </div>

                <div className="p-4 flex-1">
                  <div className="space-y-2 mb-4">
                    {poll.options.slice(0, 2).map((option, index) => (
                      <div key={option._id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate flex-1">{option.option}</span>
                        <span className="text-gray-500 ml-2 font-medium">{option.votes} votes</span>
                      </div>
                    ))}
                    {poll.options.length > 2 && (
                      <div className="text-xs text-gray-500 italic">
                        +{poll.options.length - 2} more option(s)
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Eye className="h-4 w-4" />
                      <span>{views}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{totalVotes}</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    Expires: {formatDate(poll.createdAt)}
                  </div>
                </div>

                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => handleView(poll)}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(poll._id)}
                      disabled={!canEdit}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(poll._id)}
                      disabled={!canDelete || deleteLoading === poll._id}
                      className="p-2 text-red-600 hover:bg-red-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleteLoading === poll._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(poll._id, poll.isActive)}
                    disabled={!canEdit || toggleLoading === poll._id}
                    className={`w-full flex items-center justify-center px-3 py-2 border transition-colors text-sm ${
                      poll.isActive
                        ? 'border-red-300 text-red-700 hover:bg-red-50'
                        : 'border-green-300 text-green-700 hover:bg-green-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {toggleLoading === poll._id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : poll.isActive ? (
                      <ToggleLeft className="h-4 w-4 mr-1" />
                    ) : (
                      <ToggleRight className="h-4 w-4 mr-1" />
                    )}
                    {poll.isActive ? 'Deactivate' : 'Activate'}
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

export default ManagePolling;

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, Eye, Lightbulb, ToggleLeft, ToggleRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewThought from './ViewThought';
import EditThought from './EditThought';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Thought {
  _id: string;
  thought: string;
  author: string;
  isActive: boolean;
  image: string;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

interface ManageThoughtsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageThoughts: React.FC<ManageThoughtsProps> = ({ onClose, showAlert }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [viewingThought, setViewingThought] = useState<Thought | null>(null);
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'recent' | 'old' | 'new'>('recent');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editThought');
  const canDelete = checkPermission('deleteThought');

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      const response = await api.get('/v1/thought/');
      setThoughts(response.data);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      showAlert('Failed to fetch thoughts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (!canEdit) {
      showAlert('You do not have permission to modify thought status', 'error');
      return;
    }

    setToggleLoading(id);
    try {
      await api.put(`/v1/thought/${id}/active`);

      // Update the local state
      setThoughts(prev =>
        prev.map(thought =>
          thought._id === id
            ? { ...thought, isActive: !currentStatus }
            : thought
        )
      );

      showAlert(
        `Thought ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling thought status:', error);
      showAlert('Failed to update thought status', 'error');
    } finally {
      setToggleLoading(null);
    }
  };

  const handleEdit = (id: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit thoughts', 'error');
      return;
    }
    setEditingThoughtId(id);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete thoughts', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this thought?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/thought/${id}`);
      setThoughts(thoughts.filter(thought => thought._id !== id));
      showAlert('Thought deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting thought:', error);
      showAlert('Failed to delete thought', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (thought: Thought) => {
    setViewingThought(thought);
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

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (thought: Thought) => {
    const expired = isExpired(thought.expiry);

    if (expired) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </span>
      );
    }

    if (thought.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getFilteredAndSortedThoughts = () => {
    let filtered = [...thoughts];

    // Apply status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(thought => thought.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(thought => !thought.isActive);
    }

    // Apply date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (dateFilter === 'recent') {
        return dateB - dateA; // Newest first
      } else if (dateFilter === 'old') {
        return dateA - dateB; // Oldest first
      } else if (dateFilter === 'new') {
        return dateB - dateA; // Same as recent - newest first
      }
      return 0;
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const filteredThoughts = getFilteredAndSortedThoughts();

  return (
    <>
      <div className="bg-white border border-black shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Manage Thoughts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'recent' | 'old' | 'new')}
              className="px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
            >
              <option value="recent">Recent</option>
              <option value="new">New</option>
              <option value="old">Old</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredThoughts.length} of {thoughts.length} thoughts
          </div>
        </div>

        {thoughts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No thoughts found
          </div>
        ) : filteredThoughts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No thoughts match the selected filters
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThoughts.map((thought) => (
              <div
                key={thought._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition-all duration-200 flex flex-col"
              >
                {thought.image && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={`${IMAGE_BASE_URL}/${thought.image}`}
                      alt={thought.thought}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      {getStatusBadge(thought)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-900 line-clamp-3 mb-2 italic">
                    "{thought.thought}"
                  </p>

                  <p className="text-xs text-gray-600">
                    — {thought.author}
                  </p>
                </div>

                <div className="p-4 space-y-2 flex-grow">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires: {formatDate(thought.expiry)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {formatDate(thought.createdAt)}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleView(thought)}
                    className="text-black hover:text-gray-700 border border-black p-1.5 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => handleToggleActive(thought._id, thought.isActive)}
                      disabled={toggleLoading === thought._id}
                      className={`border p-1.5 rounded transition-colors ${
                        thought.isActive
                          ? 'text-orange-600 hover:text-orange-800 border-orange-600 hover:border-orange-800'
                          : 'text-green-600 hover:text-green-800 border-green-600 hover:border-green-800'
                      } disabled:opacity-50`}
                      title={thought.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {toggleLoading === thought._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : thought.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => handleEdit(thought._id)}
                      className="text-black hover:text-gray-700 border border-black p-1.5 rounded transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(thought._id)}
                      disabled={deleteLoading === thought._id}
                      className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1.5 rounded disabled:opacity-50 transition-colors"
                      title="Delete"
                    >
                      {deleteLoading === thought._id ? (
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

      {viewingThought && (
        <ViewThought
          thought={viewingThought}
          onClose={() => setViewingThought(null)}
        />
      )}

      {editingThoughtId && (
        <EditThought
          thoughtId={editingThoughtId}
          onClose={() => setEditingThoughtId(null)}
          onSuccess={fetchThoughts}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageThoughts;
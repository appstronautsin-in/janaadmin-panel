import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, RefreshCw } from 'lucide-react';
import api from '../config/axios';
import { logActivity } from '../utils/activityLogger';
import { useTimeFormat } from '../contexts/TimeFormatContext';

interface Keyword {
  _id: string;
  keyword: string;
  category: string;
  types: string[];
  adminsToNotify: string[];
  frequencyMinutes: number;
  lastCheckedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KeywordInput {
  keyword: string;
  type: 'web' | 'youtube' | 'both';
}

interface ManageKeywordsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageKeywords: React.FC<ManageKeywordsProps> = ({ showAlert }) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [newKeywords, setNewKeywords] = useState<KeywordInput[]>([
    { keyword: '', type: 'web' }
  ]);
  const [editType, setEditType] = useState<'web' | 'youtube' | 'both'>('web');
  const [editFrequency, setEditFrequency] = useState(30);
  const { formatDateTime } = useTimeFormat();

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await api.get('https://laqsya.com/api/v1/monitoring/keywords');
      setKeywords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching keywords:', error);
      showAlert('Failed to fetch keywords', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    setNewKeywords([...newKeywords, { keyword: '', type: 'web' }]);
  };

  const handleRemoveKeyword = (index: number) => {
    if (newKeywords.length > 1) {
      setNewKeywords(newKeywords.filter((_, i) => i !== index));
    }
  };

  const handleKeywordChange = (index: number, field: keyof KeywordInput, value: string) => {
    const updated = [...newKeywords];
    updated[index] = { ...updated[index], [field]: value };
    setNewKeywords(updated);
  };

  const handleSubmitKeywords = async () => {
    try {
      const validKeywords = newKeywords.filter(k => k.keyword.trim() !== '');

      if (validKeywords.length === 0) {
        showAlert('Please enter at least one keyword', 'error');
        return;
      }

      await api.post('https://laqsya.com/api/v1/monitoring/keywords', validKeywords);

      showAlert(`Successfully added ${validKeywords.length} keyword(s)`, 'success');
      setShowAddModal(false);
      setNewKeywords([{ keyword: '', type: 'web' }]);
      fetchKeywords();

      await logActivity('create', 'keywords', '', `Added ${validKeywords.length} keywords for crawler bot`);
    } catch (error: any) {
      console.error('Error adding keywords:', error);
      showAlert(error.response?.data?.message || 'Failed to add keywords', 'error');
    }
  };

  const handleEditKeyword = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
    setEditType(keyword.types.includes('web') && keyword.types.includes('youtube') ? 'both' : keyword.types[0] as 'web' | 'youtube');
    setEditFrequency(keyword.frequencyMinutes);
    setShowEditModal(true);
  };

  const handleUpdateKeyword = async () => {
    if (!selectedKeyword) return;

    try {
      await api.patch(`https://laqsya.com/api/v1/monitoring/keywords/${selectedKeyword._id}`, {
        type: editType,
        frequencyMinutes: editFrequency
      });

      showAlert('Keyword updated successfully', 'success');
      setShowEditModal(false);
      setSelectedKeyword(null);
      fetchKeywords();

      await logActivity('update', 'keywords', selectedKeyword._id, `Updated keyword: ${selectedKeyword.keyword}`);
    } catch (error: any) {
      console.error('Error updating keyword:', error);
      showAlert(error.response?.data?.message || 'Failed to update keyword', 'error');
    }
  };

  const handleDeleteKeyword = async (id: string, keyword: string) => {
    if (!window.confirm(`Are you sure you want to delete the keyword "${keyword}"?`)) {
      return;
    }

    try {
      await api.delete(`https://laqsya.com/api/v1/monitoring/keywords/${id}`);
      showAlert('Keyword deleted successfully', 'success');
      fetchKeywords();

      await logActivity('delete', 'keywords', id, `Deleted keyword: ${keyword}`);
    } catch (error: any) {
      console.error('Error deleting keyword:', error);
      showAlert(error.response?.data?.message || 'Failed to delete keyword', 'error');
    }
  };

  const filteredKeywords = keywords.filter(k =>
    k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeDisplay = (types: string[]) => {
    if (types.includes('web') && types.includes('youtube')) return 'Both';
    if (types.includes('youtube')) return 'YouTube';
    return 'Web';
  };

  const getTypeBadgeColor = (types: string[]) => {
    if (types.includes('web') && types.includes('youtube')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (types.includes('youtube')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add Keywords for Auto Research By Janathavani Crawler Bot
          </h1>
          <p className="text-gray-600">
            Manage keywords for automated web and YouTube content monitoring
          </p>
        </div>

        <div className="bg-white border-2 border-black p-6 mb-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search keywords..."
                className="flex-1 border border-black px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Keywords
            </button>
            <button
              onClick={fetchKeywords}
              className="flex items-center gap-2 border-2 border-black px-6 py-2 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
              <p className="mt-4 text-gray-600">Loading keywords...</p>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No keywords found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first keyword to start monitoring</p>
            </div>
          ) : (
            <div className="border border-black overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-black">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Keyword</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Frequency (min)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Last Checked</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredKeywords.map((keyword, index) => (
                    <tr key={keyword._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{keyword.keyword}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{keyword.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${getTypeBadgeColor(keyword.types)}`}>
                          {getTypeDisplay(keyword.types)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{keyword.frequencyMinutes}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateTime(keyword.lastCheckedAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${
                          keyword.isActive
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {keyword.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditKeyword(keyword)}
                            className="p-2 text-blue-600 hover:bg-blue-50 border border-blue-600 hover:border-blue-700 transition-colors"
                            title="Edit keyword"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKeyword(keyword._id, keyword.keyword)}
                            className="p-2 text-red-600 hover:bg-red-50 border border-red-600 hover:border-red-700 transition-colors"
                            title="Delete keyword"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Keywords Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-black p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Keywords</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewKeywords([{ keyword: '', type: 'web' }]);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                {newKeywords.map((kw, index) => (
                  <div key={index} className="border border-gray-300 p-4 bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Keyword {index + 1}
                          </label>
                          <input
                            type="text"
                            value={kw.keyword}
                            onChange={(e) => handleKeywordChange(index, 'keyword', e.target.value)}
                            placeholder="Enter keyword..."
                            className="w-full border border-black px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monitoring Type
                          </label>
                          <select
                            value={kw.type}
                            onChange={(e) => handleKeywordChange(index, 'type', e.target.value)}
                            className="w-full border border-black px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="web">Web Only</option>
                            <option value="youtube">YouTube Only</option>
                            <option value="both">Both Web & YouTube</option>
                          </select>
                        </div>
                      </div>
                      {newKeywords.length > 1 && (
                        <button
                          onClick={() => handleRemoveKeyword(index)}
                          className="mt-8 p-2 text-red-600 hover:bg-red-50 border border-red-600"
                          title="Remove keyword"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddKeyword}
                className="w-full mb-6 flex items-center justify-center gap-2 border-2 border-dashed border-gray-400 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Another Keyword
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewKeywords([{ keyword: '', type: 'web' }]);
                  }}
                  className="flex-1 border-2 border-black px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitKeywords}
                  className="flex-1 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
                >
                  Add Keywords
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Keyword Modal */}
      {showEditModal && selectedKeyword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-black max-w-md w-full">
            <div className="bg-white border-b-2 border-black p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Keyword</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedKeyword(null);
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keyword
                </label>
                <input
                  type="text"
                  value={selectedKeyword.keyword}
                  disabled
                  className="w-full border border-gray-300 px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monitoring Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as 'web' | 'youtube' | 'both')}
                  className="w-full border border-black px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="web">Web Only</option>
                  <option value="youtube">YouTube Only</option>
                  <option value="both">Both Web & YouTube</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check Frequency (minutes)
                </label>
                <input
                  type="number"
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(parseInt(e.target.value) || 30)}
                  min="5"
                  step="5"
                  className="w-full border border-black px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-sm text-gray-500 mt-1">
                  How often the crawler should check for new content
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedKeyword(null);
                  }}
                  className="flex-1 border-2 border-black px-6 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateKeyword}
                  className="flex-1 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
                >
                  Update Keyword
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageKeywords;

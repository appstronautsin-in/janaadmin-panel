import React, { useState, useEffect } from 'react';
import { Loader2, X, Plus, Trash2, BarChart3 } from 'lucide-react';
import api from '../config/axios';

interface EditPollingProps {
  pollId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const EditPolling: React.FC<EditPollingProps> = ({ pollId, onClose, onSuccess, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    question: ''
  });
  const [options, setOptions] = useState<string[]>(['', '']);

  useEffect(() => {
    fetchPollData();
  }, [pollId]);

  const fetchPollData = async () => {
    try {
      const response = await api.get(`/v1/polling/${pollId}`);
      const poll = response.data;
      
      setFormData({
        question: poll.question
      });

      // Extract option text from the poll options
      const optionTexts = poll.options.map((option: any) => option.option);
      setOptions(optionTexts.length > 0 ? optionTexts : ['', '']);
    } catch (error) {
      console.error('Error fetching poll data:', error);
      showAlert('Failed to fetch poll data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that we have at least 2 non-empty options
    const validOptions = options.filter(option => option.trim() !== '');

    if (validOptions.length < 2) {
      showAlert('Please provide at least 2 options for the poll', 'error');
      return;
    }

    if (!formData.question.trim()) {
      showAlert('Please enter a question for the poll', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        question: formData.question.trim(),
        options: validOptions
      };

      await api.put(`/v1/polling/${pollId}`, payload);
      showAlert('Poll updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating poll:', error);
      showAlert('Failed to update poll. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setOptions(prev => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    setOptions(prev => prev.map((option, i) => 
      i === index ? value : option
    ));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Edit Poll</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Poll Question *
            </label>
            <textarea
              id="question"
              required
              rows={3}
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your poll question here..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Poll Options *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center px-3 py-1 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 border border-black rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800"
                      title="Remove option"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex">
              <BarChart3 className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Note
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Editing this poll will update the question and options, but existing votes will be preserved.
                    Be careful when modifying options as it may affect the accuracy of existing vote data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPolling;
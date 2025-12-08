import React, { useState, useRef } from 'react';
import { Loader2, X, Upload } from 'lucide-react';
import api from '../config/axios';

interface AddENewsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

type Status = 'published' | 'scheduled' | 'draft';

const AddENews: React.FC<AddENewsProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    newsPaperDate: new Date().toISOString().split('T')[0],
    scheduleDate: '',
    scheduleTime: '',
    status: 'draft' as Status
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile) {
      showAlert('Please select a PDF file', 'error');
      return;
    }

    if (!selectedThumbnail) {
      showAlert('Please select a thumbnail image', 'error');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('newsPaperDate', formData.newsPaperDate);
      formPayload.append('pdf', selectedPdfFile);
      formPayload.append('thumbnail', selectedThumbnail);

      // If schedule date and time are set, combine them into a single timestamp
      if (formData.scheduleDate && formData.scheduleTime) {
        const scheduleDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}`);
        formPayload.append('scheduleDate', scheduleDateTime.toISOString());
        formPayload.append('status', 'scheduled');
      } else {
        formPayload.append('status', formData.status);
      }

      await api.post('/v1/enews', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('E-News created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating E-News:', error);
      showAlert('Failed to create E-News. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedPdfFile(file);
      } else {
        showAlert('Please select a PDF file', 'error');
        e.target.value = '';
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedThumbnail(file);
      } else {
        showAlert('Please select an image file', 'error');
        e.target.value = '';
      }
    }
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      status: (name === 'scheduleDate' || name === 'scheduleTime') && value ? 'scheduled' : prev.status
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create E-News</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="newsPaperDate" className="block text-sm font-medium text-gray-700">
            Newspaper Date
          </label>
          <input
            type="date"
            id="newsPaperDate"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.newsPaperDate}
            onChange={(e) => setFormData(prev => ({ ...prev, newsPaperDate: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
              Schedule Date (Optional)
            </label>
            <input
              type="date"
              id="scheduleDate"
              name="scheduleDate"
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.scheduleDate}
              onChange={handleScheduleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">
              Schedule Time
            </label>
            <input
              type="time"
              id="scheduleTime"
              name="scheduleTime"
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.scheduleTime}
              onChange={handleScheduleChange}
              disabled={!formData.scheduleDate}
            />
          </div>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.scheduleDate ? 'scheduled' : formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
            disabled={!!formData.scheduleDate}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF File
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => pdfInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload PDF</span>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={handlePdfChange}
                  />
                </label>
              </div>
              {selectedPdfFile && (
                <p className="text-sm text-green-600">
                  Selected: {selectedPdfFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Image
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => thumbnailInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload thumbnail</span>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleThumbnailChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
              {selectedThumbnail && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedThumbnail)}
                    alt="Thumbnail preview"
                    className="mx-auto h-32 w-32 object-cover border border-black"
                  />
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedThumbnail.name}
                  </p>
                </div>
              )}
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
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create E-News'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddENews;
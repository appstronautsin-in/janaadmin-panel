import React, { useState, useRef } from 'react';
import { Loader2, X, Upload, AlertTriangle } from 'lucide-react';
import api from '../config/axios';

interface CreateBreakingNewsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreateBreakingNews: React.FC<CreateBreakingNewsProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    source: '',
    expiry: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5)
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('subtitle', formData.subtitle);
      if (formData.source) {
        formPayload.append('source', formData.source);
      }
      if (formData.expiry) {
        formPayload.append('expiry', formData.expiry);
      }
      
      // Combine date and time into a single datetime string
      const datetime = `${formData.date}T${formData.time}`;
      formPayload.append('date', datetime);
      formPayload.append('time', datetime);
      
      if (selectedImage) {
        formPayload.append('image', selectedImage);
      }

      await api.post('/v1/breaking-news', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Breaking news created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating breaking news:', error);
      showAlert('Failed to create breaking news. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      } else {
        showAlert('Please select an image file', 'error');
        e.target.value = '';
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create Breaking News</h2>
        </div>
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
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter breaking news title"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
            Subtitle *
          </label>
          <textarea
            id="subtitle"
            name="subtitle"
            required
            rows={3}
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.subtitle}
            onChange={handleChange}
            placeholder="Enter breaking news subtitle or description"
          />
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source (Optional)
          </label>
          <input
            type="text"
            id="source"
            name="source"
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.source}
            onChange={handleChange}
            placeholder="Enter news source"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
            Expiry Date & Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="expiry"
            name="expiry"
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.expiry}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="mt-1 text-sm text-gray-500">
            If not set, breaking news will become in-active after 30 mins.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image (Optional)
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload an image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB (Optional)
              </p>
              {selectedImage && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mx-auto h-32 w-48 object-cover border border-black"
                  />
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {selectedImage.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Breaking News Guidelines
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use clear, concise titles that grab attention</li>
                  <li>Ensure the information is verified and accurate</li>
                  <li>Images and expiry dates are optional but recommended</li>
                  <li>Without expiry date, news will remain active until manually deactivated</li>
                </ul>
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
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Create Breaking News
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBreakingNews;
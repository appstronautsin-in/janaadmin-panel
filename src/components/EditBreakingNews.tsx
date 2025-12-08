import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, AlertTriangle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';

interface EditBreakingNewsProps {
  newsId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const EditBreakingNews: React.FC<EditBreakingNewsProps> = ({ newsId, onClose, onSuccess, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    source: '',
    expiry: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchBreakingNewsData();
  }, [newsId]);

  const fetchBreakingNewsData = async () => {
    try {
      const response = await api.get(`/v1/breaking-news/${newsId}`);
      const data = response.data;
      
      // Parse the expiry date for the datetime-local input
      const expiryDate = new Date(data.expiry);
      const expiryFormatted = expiryDate.toISOString().slice(0, 16);
      
      // Parse created date for date and time inputs
      const createdDate = new Date(data.createdAt);
      const dateFormatted = createdDate.toISOString().split('T')[0];
      const timeFormatted = createdDate.toTimeString().slice(0, 5);

      setFormData({
        title: data.title,
        subtitle: data.subtitle,
        source: data.source || '',
        expiry: expiryFormatted,
        date: dateFormatted,
        time: timeFormatted
      });

      setCurrentImage(data.image || '');
    } catch (error) {
      console.error('Error fetching breaking news data:', error);
      showAlert('Failed to fetch breaking news data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

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
      formPayload.append('expiry', formData.expiry);
      
      // Combine date and time into a single datetime string
      const datetime = `${formData.date}T${formData.time}`;
      formPayload.append('date', datetime);
      formPayload.append('time', datetime);
      
      if (selectedImage) {
        formPayload.append('image', selectedImage);
      }

      await api.put(`/v1/breaking-news/${newsId}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Breaking news updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating breaking news:', error);
      showAlert('Failed to update breaking news. Please try again.', 'error');
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
            <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Edit Breaking News</h2>
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
              Expiry Date & Time *
            </label>
            <input
              type="datetime-local"
              id="expiry"
              name="expiry"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.expiry}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {selectedImage ? (
                  <div>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="New preview"
                      className="mx-auto h-32 w-48 object-cover border border-black"
                    />
                    <p className="text-sm text-green-600 font-medium mt-2">
                      New image selected: {selectedImage.name}
                    </p>
                  </div>
                ) : currentImage ? (
                  <>
                    <img
                      src={`${IMAGE_BASE_URL}/${currentImage}`}
                      alt="Current"
                      className="mx-auto h-32 w-48 object-cover border border-black"
                    />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mt-4" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload new image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
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
                    </div>
                  </>
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
              className="flex items-center justify-center px-4 py-2 border border-black text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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

export default EditBreakingNews;
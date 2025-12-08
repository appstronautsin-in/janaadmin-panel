import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from '../config/axios';

interface CreateDoYouKnowProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
  onSuccess: () => void;
}

const CreateDoYouKnow: React.FC<CreateDoYouKnowProps> = ({ onClose, showAlert, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isActive: true,
    expiry: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('isActive', String(formData.isActive));
      if (formData.expiry) {
        formDataToSend.append('expiry', new Date(formData.expiry).toISOString());
      }
      if (image) {
        formDataToSend.append('image', image);
      }

      await axios.post('/v1/do-you-know/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Do You Know created successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to create Do You Know', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Create Do You Know</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-auto object-cover border border-gray-300"
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 border-black focus:ring-black"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDoYouKnow;

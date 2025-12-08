import React, { useState, useRef } from 'react';
import { Loader2, X, Upload, AlertTriangle } from 'lucide-react';
import api from '../config/axios';

interface CreateJustInProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreateJustIn: React.FC<CreateJustInProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expiry: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      showAlert('Please select an image', 'error');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('content', formData.content);
      formPayload.append('expiry', formData.expiry);
      formPayload.append('image', selectedImage);

      await api.post('/v1/justin/create', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('JustIn created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating JustIn:', error);
      showAlert('Failed to create JustIn. Please try again.', 'error');
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
          <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create JustIn</h2>
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
            placeholder="Enter JustIn title"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter JustIn content..."
          />
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
          <p className="mt-1 text-sm text-gray-500">
            Set when this JustIn should expire and become inactive
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image *
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
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
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

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                JustIn Guidelines
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Keep content concise and impactful</li>
                  <li>Ensure information is timely and relevant</li>
                  <li>Set appropriate expiry date for content relevance</li>
                  <li>Choose images that complement the content</li>
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
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 mr-2" />
                Create JustIn
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJustIn;
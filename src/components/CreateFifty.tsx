import React, { useState, useRef } from 'react';
import { Loader2, X, Upload, FileText } from 'lucide-react';
import api from '../config/axios';

interface CreateFiftyProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreateFifty: React.FC<CreateFiftyProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isActive: true,
    isPremiuim: false
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
      formPayload.append('date', formData.date);
      formPayload.append('description', formData.description);
      formPayload.append('isActive', formData.isActive.toString());
      formPayload.append('isPremiuim', formData.isPremiuim.toString());
      formPayload.append('image', selectedImage);

      await api.post('/v1/fifty-years/add', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('FiftyYears created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating FiftyYears:', error);
      showAlert('Failed to create FiftyYears. Please try again.', 'error');
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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create FiftyYears</h2>
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
            placeholder="Enter FiftyYears title"
          />
        </div>

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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={8}
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter detailed description..."
          />
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

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              className="border-black text-black focus:ring-black"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span className="ml-2 text-sm text-gray-600">Active</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPremiuim"
              className="border-black text-black focus:ring-black"
              checked={formData.isPremiuim}
              onChange={handleChange}
            />
            <span className="ml-2 text-sm text-gray-600">Premium Content</span>
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex">
            <FileText className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                FiftyYears Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Provide a clear and descriptive title</li>
                  <li>Include detailed description with historical context</li>
                  <li>Select an appropriate date for the content</li>
                  <li>Choose relevant images that complement the content</li>
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
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Create FiftyYears
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFifty;
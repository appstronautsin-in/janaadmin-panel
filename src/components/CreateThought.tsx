import React, { useState, useRef } from 'react';
import { Loader2, X, Upload, Lightbulb } from 'lucide-react';
import api from '../config/axios';

interface CreateThoughtProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreateThought: React.FC<CreateThoughtProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    thought: '',
    author: '',
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
      formPayload.append('thought', formData.thought);
      formPayload.append('author', formData.author);
      formPayload.append('expiry', formData.expiry);
      formPayload.append('image', selectedImage);

      await api.post('/v1/thought/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Thought created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating thought:', error);
      showAlert('Failed to create thought. Please try again.', 'error');
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
          <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create Thought</h2>
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
          <label htmlFor="thought" className="block text-sm font-medium text-gray-700">
            Thought *
          </label>
          <textarea
            id="thought"
            name="thought"
            required
            rows={4}
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.thought}
            onChange={handleChange}
            placeholder="Enter the thought or quote..."
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Author *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
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
            Set when this thought should expire and become inactive
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

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Thought Guidelines
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Keep thoughts meaningful and inspiring</li>
                  <li>Ensure proper attribution to the author</li>
                  <li>Choose an appropriate expiry date</li>
                  <li>Select a relevant image that complements the thought</li>
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
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-1 focus:ring-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lightbulb className="w-5 h-5 mr-2" />
                Create Thought
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateThought;
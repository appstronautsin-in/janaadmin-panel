import React, { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import api from '../config/axios';

interface AddCategoryProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    designIndex: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showAlert('Please select an image file', 'error');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('designIndex', formData.designIndex.toString());
      formPayload.append('image', selectedFile);

      await api.post('/v1/category/add', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showAlert('Category added successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error adding category:', error);
      showAlert('Failed to add category. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        showAlert('Please select an image file', 'error');
        e.target.value = '';
      }
    }
  };

  const handleDesignSelect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      designIndex: index
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Add New Category</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Design Template
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className={`relative cursor-pointer border ${
                  formData.designIndex === index ? 'border-2 border-black' : 'border-black hover:bg-gray-50'
                } transition-colors duration-200`}
                onClick={() => handleDesignSelect(index)}
              >
                <img
                  src={`/categorydesigns/${index}.png`}
                  alt={`Design ${index}`}
                  className="w-full h-40 object-contain"
                />
                <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity ${
                  formData.designIndex === index ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}>
                  <span className="text-white font-medium">Design {index}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image
          </label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload a file</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
              {selectedFile && (
                <p className="text-sm text-green-600 font-medium">
                  Selected: {selectedFile.name}
                </p>
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
              'Add Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
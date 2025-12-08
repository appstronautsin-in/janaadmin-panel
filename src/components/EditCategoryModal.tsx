import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface EditCategoryModalProps {
  category: {
    _id: string;
    name: string;
    designIndex: number;
    image: string;
  };
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  onClose,
  onSuccess,
  showAlert,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: category.name,
    designIndex: category.designIndex,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('designIndex', formData.designIndex.toString());
      if (selectedFile) {
        formPayload.append('image', selectedFile);
      }

      await api.put(`/v1/category/edit/${category._id}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await logActivity(
        ActivityActions.EDIT,
        ActivitySections.CATEGORY,
        `Updated category: ${formData.name}`,
        {
          categoryId: category._id,
          categoryName: formData.name,
          previousName: category.name,
          imageChanged: !!selectedFile
        }
      );

      showAlert('Category updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
      showAlert('Failed to update category. Please try again.', 'error');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black shadow-lg w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-black">
          <h2 className="text-2xl font-bold text-gray-900">Edit Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                {selectedFile ? (
                  <>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover border border-black"
                    />
                    <p className="text-sm text-green-600 font-medium">
                      Selected: {selectedFile.name}
                    </p>
                  </>
                ) : (
                  <>
                    <img
                      src={`${IMAGE_BASE_URL}${category.image}`}
                      alt="Current"
                      className="mx-auto h-32 w-32 object-cover border border-black"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mt-4" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload a new image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
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
              className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
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

export default EditCategoryModal;
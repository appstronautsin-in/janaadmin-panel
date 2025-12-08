import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../config/axios';

interface Category {
  _id: string;
  name: string;
}

interface AddSubCategoryProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const AddSubCategory: React.FC<AddSubCategoryProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    parent: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/category/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to fetch categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parent) {
      showAlert('Please select a parent category', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/sub-category', {
        name: formData.name,
        parent: formData.parent
      });

      showAlert('Sub-category added successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error adding sub-category:', error);
      showAlert('Failed to add sub-category. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg">
      <div className="flex justify-between items-center p-6 border-b border-black">
        <h2 className="text-2xl font-bold text-gray-900">Add New Sub-Category</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
            Parent Category
          </label>
          <select
            id="parent"
            required
            className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            value={formData.parent}
            onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Sub-Category Name
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
              'Add Sub-Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubCategory;
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface SubCategory {
  _id: string;
  name: string;
  parent: {
    _id: string;
    name: string;
    image: string;
    designIndex: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ManageSubCategoryProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSubCategory: React.FC<ManageSubCategoryProps> = ({ onClose, showAlert }) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    parent: ''
  });
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editSubCategory');
  const canDelete = checkPermission('deleteSubCategory');

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await api.get('/v1/sub-category');
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      showAlert('Failed to fetch sub-categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/category/all');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to fetch categories', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete sub-categories', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this sub-category?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/sub-category/${id}`);
      setSubCategories(subCategories.filter(subCategory => subCategory._id !== id));
      showAlert('Sub-category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting sub-category:', error);
      showAlert('Failed to delete sub-category', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (subCategory: SubCategory) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit sub-categories', 'error');
      return;
    }
    setEditingSubCategory(subCategory);
    setEditForm({
      name: subCategory.name,
      parent: subCategory.parent._id
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubCategory) return;

    try {
      await api.put(`/v1/sub-category/${editingSubCategory._id}`, editForm);
      
      const updatedSubCategories = subCategories.map(subCategory => {
        if (subCategory._id === editingSubCategory._id) {
          const updatedParent = categories.find(cat => cat._id === editForm.parent);
          return {
            ...subCategory,
            name: editForm.name,
            parent: {
              ...subCategory.parent,
              _id: editForm.parent,
              name: updatedParent?.name || subCategory.parent.name
            }
          };
        }
        return subCategory;
      });

      setSubCategories(updatedSubCategories);
      setEditingSubCategory(null);
      showAlert('Sub-category updated successfully', 'success');
    } catch (error) {
      console.error('Error updating sub-category:', error);
      showAlert('Failed to update sub-category', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Sub-Categories</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {editingSubCategory && (
        <div className="mb-6 p-6 border border-black">
          <h3 className="text-lg font-semibold mb-4">Edit Sub-Category</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Category</label>
              <select
                value={editForm.parent}
                onChange={(e) => setEditForm(prev => ({ ...prev, parent: e.target.value }))}
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              >
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingSubCategory(null)}
                className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Parent Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Updated At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {subCategories.map((subCategory) => (
              <tr key={subCategory._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-r border-black">
                  <div className="text-sm font-medium text-gray-900">
                    {subCategory.name}
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    <img
                      src={`${IMAGE_BASE_URL}${subCategory.parent.image}`}
                      alt={subCategory.parent.name}
                      className="h-8 w-8 object-cover border border-black mr-3"
                    />
                    <div className="text-sm text-gray-900">{subCategory.parent.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                  {formatDate(subCategory.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                  {formatDate(subCategory.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(subCategory)}
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(subCategory._id)}
                        disabled={deleteLoading === subCategory._id}
                        className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === subCategory._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSubCategory;
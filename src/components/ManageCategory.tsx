import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import EditCategoryModal from './EditCategoryModal';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface Category {
  _id: string;
  name: string;
  image: string;
  designIndex: number;
  createdAt: string;
  updatedAt: string;
}

interface ManageCategoryProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageCategory: React.FC<ManageCategoryProps> = ({ onClose, showAlert }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editCategory');
  const canDelete = checkPermission('deleteCategory');

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
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete categories', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const categoryToDelete = categories.find(cat => cat._id === id);
      await api.delete(`/v1/category/${id}`);

      await logActivity(
        ActivityActions.DELETE,
        ActivitySections.CATEGORY,
        `Deleted category: ${categoryToDelete?.name || 'Unknown'}`,
        { categoryId: id, categoryName: categoryToDelete?.name }
      );

      setCategories(categories.filter(category => category._id !== id));
      showAlert('Category deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showAlert('Failed to delete category', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (category: Category) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit categories', 'error');
      return;
    }
    setEditingCategory(category);
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
    <>
      <div className="bg-white border border-black shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Design
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
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <img
                      src={`${IMAGE_BASE_URL}${category.image}`}
                      alt={category.name}
                      className="h-10 w-10 object-cover border border-black"
                    />
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold border border-black bg-gray-100 text-gray-800">
                      Design {category.designIndex}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(category.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(category._id)}
                          disabled={deleteLoading === category._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === category._id ? (
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

      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={fetchCategories}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageCategory;
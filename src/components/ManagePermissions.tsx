import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import api from '../config/axios';

interface Permission {
  _id: string;
  admin: {
    _id: string;
    fullname: string;
    email: string;
    position: string;
  };
  createNews: boolean;
  editNews: boolean;
  deleteNews: boolean;
  createENews: boolean;
  editENews: boolean;
  deleteENews: boolean;
  createCategory: boolean;
  editCategory: boolean;
  deleteCategory: boolean;
  createSubCategory: boolean;
  editSubCategory: boolean;
  deleteSubCategory: boolean;
  addUser: boolean;
  editUser: boolean;
  deleteUser: boolean;
  createSubscription: boolean;
  editSubscription: boolean;
  deleteSubscription: boolean;
  createAds: boolean;
  editAds: boolean;
  deleteAds: boolean;
  createCustomer: boolean;
  editCustomer: boolean;
  deleteCustomer: boolean;
  createPolling: boolean;
  editPolling: boolean;
  deletePolling: boolean;
  createBreakingNews: boolean;
  editBreakingNews: boolean;
  deleteBreakingNews: boolean;
  createDamInformation: boolean;
  editDamInformation: boolean;
  deleteDamInformation: boolean;
  createClassifiedAds: boolean;
  editClassifiedAds: boolean;
  deleteClassifiedAds: boolean;
  createThought: boolean;
  editThought: boolean;
  deleteThought: boolean;
  createJustIn: boolean;
  editJustIn: boolean;
  deleteJustIn: boolean;
  createFifty: boolean;
  editFifty: boolean;
  deleteFifty: boolean;
  createPromotion: boolean;
  editPromotion: boolean;
  deletePromotion: boolean;
  createDoYouKnow: boolean;
  editDoYouKnow: boolean;
  deleteDoYouKnow: boolean;
  createEvent: boolean;
  editEvent: boolean;
  deleteEvent: boolean;
  viewActivity: boolean;
  viewViews: boolean;
}

interface ManagePermissionsProps {
  userId: string;
  userName?: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const defaultPermissions: Omit<Permission, '_id' | 'admin'> = {
  createNews: false,
  editNews: false,
  deleteNews: false,
  createENews: false,
  editENews: false,
  deleteENews: false,
  createCategory: false,
  editCategory: false,
  deleteCategory: false,
  createSubCategory: false,
  editSubCategory: false,
  deleteSubCategory: false,
  addUser: false,
  editUser: false,
  deleteUser: false,
  createSubscription: false,
  editSubscription: false,
  deleteSubscription: false,
  createAds: false,
  editAds: false,
  deleteAds: false,
  createCustomer: false,
  editCustomer: false,
  deleteCustomer: false,
  createPolling: false,
  editPolling: false,
  deletePolling: false,
  createBreakingNews: false,
  editBreakingNews: false,
  deleteBreakingNews: false,
  createDamInformation: false,
  editDamInformation: false,
  deleteDamInformation: false,
  createClassifiedAds: false,
  editClassifiedAds: false,
  deleteClassifiedAds: false,
  createThought: false,
  editThought: false,
  deleteThought: false,
  createJustIn: false,
  editJustIn: false,
  deleteJustIn: false,
  createFifty: false,
  editFifty: false,
  deleteFifty: false,
  createPromotion: false,
  editPromotion: false,
  deletePromotion: false,
  createDoYouKnow: false,
  editDoYouKnow: false,
  deleteDoYouKnow: false,
  createEvent: false,
  editEvent: false,
  deleteEvent: false,
  viewActivity: false,
  viewViews: false
};

const ManagePermissions: React.FC<ManagePermissionsProps> = ({ userId, userName, onClose, showAlert }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission>({
    _id: '',
    admin: {
      _id: userId,
      fullname: userName || '',
      email: '',
      position: ''
    },
    ...defaultPermissions
  });

  useEffect(() => {
    fetchPermissions();
  }, [userId]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get(`/v1/admin/roles/roles/admin/${userId}`);
      if (response.data && response.data.length > 0) {
        setPermissions(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      showAlert('Failed to fetch permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (key: keyof Omit<Permission, '_id' | 'admin'>, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        admin: userId,
        ...Object.keys(defaultPermissions).reduce((acc, key) => ({
          ...acc,
          [key]: permissions[key as keyof typeof defaultPermissions]
        }), {})
      };

      if (permissions._id) {
        await api.put(`/v1/admin/roles/roles/${permissions._id}`, payload);
      } else {
        await api.post('/v1/admin/roles/roles', payload);
      }

      showAlert('Permissions updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      showAlert('Failed to save permissions', 'error');
    } finally {
      setSaving(false);
    }
  };

  const PermissionGroup = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: Array<{ key: keyof Omit<Permission, '_id' | 'admin'>; label: string }> 
  }) => (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-2">
        {items.map(({ key, label }) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={permissions[key]}
              onChange={(e) => handlePermissionChange(key, e.target.checked)}
              className="rounded border-black text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Permissions</h2>
            {userName && (
              <p className="text-sm text-gray-600 mt-1">User: {userName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PermissionGroup
              title="News Management"
              items={[
                { key: 'createNews', label: 'Create News' },
                { key: 'editNews', label: 'Edit News' },
                { key: 'deleteNews', label: 'Delete News' }
              ]}
            />

            <PermissionGroup
              title="Breaking News Management"
              items={[
                { key: 'createBreakingNews', label: 'Create Breaking News' },
                { key: 'editBreakingNews', label: 'Edit Breaking News' },
                { key: 'deleteBreakingNews', label: 'Delete Breaking News' }
              ]}
            />

            <PermissionGroup
              title="E-News Management"
              items={[
                { key: 'createENews', label: 'Create E-News' },
                { key: 'editENews', label: 'Edit E-News' },
                { key: 'deleteENews', label: 'Delete E-News' }
              ]}
            />

            <PermissionGroup
              title="Category Management"
              items={[
                { key: 'createCategory', label: 'Create Category' },
                { key: 'editCategory', label: 'Edit Category' },
                { key: 'deleteCategory', label: 'Delete Category' }
              ]}
            />

            <PermissionGroup
              title="Sub-Category Management"
              items={[
                { key: 'createSubCategory', label: 'Create Sub-Category' },
                { key: 'editSubCategory', label: 'Edit Sub-Category' },
                { key: 'deleteSubCategory', label: 'Delete Sub-Category' }
              ]}
            />

            <PermissionGroup
              title="User Management"
              items={[
                { key: 'addUser', label: 'Add User' },
                { key: 'editUser', label: 'Edit User' },
                { key: 'deleteUser', label: 'Delete User' }
              ]}
            />

            <PermissionGroup
              title="Customer Management"
              items={[
                { key: 'createCustomer', label: 'Create Customer' },
                { key: 'editCustomer', label: 'Edit Customer' },
                { key: 'deleteCustomer', label: 'Delete Customer' }
              ]}
            />

            <PermissionGroup
              title="Subscription Management"
              items={[
                { key: 'createSubscription', label: 'Create Subscription' },
                { key: 'editSubscription', label: 'Edit Subscription' },
                { key: 'deleteSubscription', label: 'Delete Subscription' }
              ]}
            />

            <PermissionGroup
              title="Ads Management"
              items={[
                { key: 'createAds', label: 'Create Ads' },
                { key: 'editAds', label: 'Edit Ads' },
                { key: 'deleteAds', label: 'Delete Ads' }
              ]}
            />

            <PermissionGroup
              title="Polling Management"
              items={[
                { key: 'createPolling', label: 'Create Poll' },
                { key: 'editPolling', label: 'Edit Poll' },
                { key: 'deletePolling', label: 'Delete Poll' }
              ]}
            />

            <PermissionGroup
              title="Dam Information Management"
              items={[
                { key: 'createDamInformation', label: 'Create Dam Info' },
                { key: 'editDamInformation', label: 'Edit Dam Info' },
                { key: 'deleteDamInformation', label: 'Delete Dam Info' }
              ]}
            />

            <PermissionGroup
              title="Classified Ads Management"
              items={[
                { key: 'createClassifiedAds', label: 'Create Classified Ad' },
                { key: 'editClassifiedAds', label: 'Edit Classified Ad' },
                { key: 'deleteClassifiedAds', label: 'Delete Classified Ad' }
              ]}
            />

            <PermissionGroup
              title="Thought Management"
              items={[
                { key: 'createThought', label: 'Create Thought' },
                { key: 'editThought', label: 'Edit Thought' },
                { key: 'deleteThought', label: 'Delete Thought' }
              ]}
            />

            <PermissionGroup
              title="Activity Management"
              items={[
                { key: 'viewActivity', label: 'View Activity' }
              ]}
            />

            <PermissionGroup
              title="Views Management"
              items={[
                { key: 'viewViews', label: 'View Views' }
              ]}
            />

            <PermissionGroup
              title="FiftyYears Management"
              items={[
                { key: 'createFifty', label: 'Create FiftyYears' },
                { key: 'editFifty', label: 'Edit FiftyYears' },
                { key: 'deleteFifty', label: 'Delete FiftyYears' }
              ]}
            />

            <PermissionGroup
              title="JustIn Management"
              items={[
                { key: 'createJustIn', label: 'Create JustIn' },
                { key: 'editJustIn', label: 'Edit JustIn' },
                { key: 'deleteJustIn', label: 'Delete JustIn' }
              ]}
            />

            <PermissionGroup
              title="Promotion Management"
              items={[
                { key: 'createPromotion', label: 'Create Promotion' },
                { key: 'editPromotion', label: 'Edit Promotion' },
                { key: 'deletePromotion', label: 'Delete Promotion' }
              ]}
            />

            <PermissionGroup
              title="Do You Know Management"
              items={[
                { key: 'createDoYouKnow', label: 'Create Do You Know' },
                { key: 'editDoYouKnow', label: 'Edit Do You Know' },
                { key: 'deleteDoYouKnow', label: 'Delete Do You Know' }
              ]}
            />

            <PermissionGroup
              title="Event Management"
              items={[
                { key: 'createEvent', label: 'Create Event' },
                { key: 'editEvent', label: 'Edit Event' },
                { key: 'deleteEvent', label: 'Delete Event' }
              ]}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-black p-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagePermissions;
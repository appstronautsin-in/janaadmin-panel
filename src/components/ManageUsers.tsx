import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, Shield, Key } from 'lucide-react';
import api from '../config/axios';
import ManagePermissions from './ManagePermissions';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface User {
  _id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  position: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  loginTimeSlot?: {
    start?: string;
    end?: string;
  };
}

interface ManageUsersProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ onClose, showAlert }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [managingPermissions, setManagingPermissions] = useState<{id: string; name: string} | null>(null);
  const [changingPassword, setChangingPassword] = useState<{id: string; name: string} | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: '',
    phonenumber: '',
    email: '',
    position: '',
    role: '',
    startTime: '',
    endTime: ''
  });

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editUser');
  const canDelete = checkPermission('deleteUser');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/v1/admin/auth/all');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete users', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      const userToDelete = users.find(u => u._id === id);
      await api.delete(`/v1/admin/auth/${id}`);

      await logActivity(
        ActivityActions.DELETE,
        ActivitySections.USERS,
        `Deleted user: ${userToDelete?.fullname || 'Unknown'} (${userToDelete?.email || 'Unknown'})`,
        { userId: id, userName: userToDelete?.fullname, userEmail: userToDelete?.email }
      );

      setUsers(users.filter(user => user._id !== id));
      showAlert('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('Failed to delete user', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (user: User) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit users', 'error');
      return;
    }
    setEditingUser(user);
    setEditForm({
      fullname: user.fullname,
      phonenumber: user.phonenumber,
      email: user.email,
      position: user.position,
      role: user.role,
      startTime: user.loginTimeSlot?.start || '',
      endTime: user.loginTimeSlot?.end || ''
    });
  };

  const handleManagePermissions = (user: User) => {
    // Only allow managing permissions if user has both edit and delete permissions
    if (!canEdit || !canDelete) {
      showAlert('You do not have permission to manage user permissions', 'error');
      return;
    }
    setManagingPermissions({
      id: user._id,
      name: user.fullname
    });
  };

  const handleChangePassword = (user: User) => {
    if (!canEdit) {
      showAlert('You do not have permission to change user passwords', 'error');
      return;
    }
    setChangingPassword({
      id: user._id,
      name: user.fullname
    });
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!changingPassword) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await api.put(`/v1/admin/auth/change-password/${changingPassword.id}`, {
        password: passwordForm.newPassword
      });

      await logActivity(
        ActivityActions.EDIT,
        ActivitySections.USERS,
        `Changed password for user: ${changingPassword.name}`,
        { userId: changingPassword.id, userName: changingPassword.name }
      );

      showAlert('Password changed successfully', 'success');
      setChangingPassword(null);
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert('Failed to change password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await api.put(`/v1/admin/auth/${editingUser._id}`, editForm);

      await logActivity(
        ActivityActions.EDIT,
        ActivitySections.USERS,
        `Updated user: ${editForm.fullname} (${editForm.email})`,
        {
          userId: editingUser._id,
          previousName: editingUser.fullname,
          newName: editForm.fullname,
          email: editForm.email
        }
      );

      const updatedUsers = users.map(user => {
        if (user._id === editingUser._id) {
          return {
            ...user,
            fullname: editForm.fullname,
            phonenumber: editForm.phonenumber,
            email: editForm.email,
            position: editForm.position,
            role: editForm.role,
            loginTimeSlot: {
              start: editForm.startTime,
              end: editForm.endTime
            }
          };
        }
        return user;
      });

      setUsers(updatedUsers);
      setEditingUser(null);
      showAlert('User updated successfully', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showAlert('Failed to update user', 'error');
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
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {editingUser && (
        <div className="mb-6 p-6 border border-black">
          <h3 className="text-lg font-semibold mb-4">Edit User</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullname: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phonenumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phonenumber: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={editForm.position}
                  onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Login Start Time</label>
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startTime: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="HH:MM (24-hour format)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Login End Time</label>
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="HH:MM (24-hour format)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
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
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-r border-black">
                  <div className="text-sm font-medium text-gray-900">
                    {user.fullname}
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-sm text-gray-500">{user.phonenumber}</div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className="text-sm text-gray-900">{user.position}</div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <span className={`px-2 inline-flex text-xs leading-5 font-medium border ${
                    user.role === 'superadmin' 
                      ? 'bg-purple-100 text-purple-800 border-purple-800'
                      : user.role === 'admin'
                      ? 'bg-green-100 text-green-800 border-green-800'
                      : 'bg-blue-100 text-blue-800 border-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Only show permissions icon if user has both edit and delete permissions */}
                    {canEdit && canDelete && (
                      <button
                        onClick={() => handleManagePermissions(user)}
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="Manage Permissions"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}
                    {canEdit && (
                      <>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Change Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleteLoading === user._id}
                        className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteLoading === user._id ? (
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

      {managingPermissions && (
        <ManagePermissions
          userId={managingPermissions.id}
          userName={managingPermissions.name}
          onClose={() => setManagingPermissions(null)}
          showAlert={showAlert}
        />
      )}

      {changingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-black">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                <p className="text-sm text-gray-600 mt-1">User: {changingPassword.name}</p>
              </div>
              <button
                onClick={() => setChangingPassword(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-black">
                <button
                  type="button"
                  onClick={() => setChangingPassword(null)}
                  className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
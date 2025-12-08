import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import api from '../config/axios';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface AddUserProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const positions = [
  'Manager',
  'Accountant',
  'Editor',
  'Content Writer',
  'Reporter',
  'Administrator',
  'Marketing Executive'
];

const roles = [
  'superadmin',
  'admin',
  'editor'
];

const AddUser: React.FC<AddUserProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    phonenumber: '',
    email: '',
    position: positions[0],
    role: roles[0],
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/v1/admin/auth/add', formData);

      await logActivity(
        ActivityActions.CREATE,
        ActivitySections.USERS,
        `Added new user: ${formData.fullname} (${formData.email})`,
        {
          userName: formData.fullname,
          userEmail: formData.email,
          position: formData.position,
          role: formData.role
        }
      );

      showAlert('User added successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      showAlert('Failed to add user. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg">
      <div className="flex justify-between items-center p-6 border-b border-black">
        <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.phonenumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position
            </label>
            <select
              id="position"
              name="position"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.position}
              onChange={handleChange}
            >
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.role}
              onChange={handleChange}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
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
              'Add User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
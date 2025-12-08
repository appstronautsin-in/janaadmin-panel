import React, { useState } from 'react';
import { Loader2, X, UserPlus } from 'lucide-react';
import api from '../config/axios';

interface CreateCustomerProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreateCustomer: React.FC<CreateCustomerProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    dob: '',
    phoneNumber: '',
    otp: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!showOtpField) {
        // First step: Send customer details
        const response = await api.post('/v1/customer/auth/signupadminpanel', {
          fullname: formData.fullname,
          dob: formData.dob,
          phoneNumber: formData.phoneNumber
        });

        if (response.status === 200) {
          setShowOtpField(true);
          showAlert('OTP has been sent to the customer\'s phone number', 'success');
        }
      } else {
        // Second step: Verify OTP
        const response = await api.post('/v1/customer/auth/verify-otp-phone', {
          phoneNumber: formData.phoneNumber,
          otp: formData.otp
        });

        if (response.status === 200) {
          showAlert('Customer created successfully!', 'success');
          onClose();
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      showAlert(
        error.response?.data?.message || 
        'Failed to process request. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <UserPlus className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Create Customer</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOtpField ? (
          <>
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
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                required
                pattern="[0-9]{10}"
                placeholder="10-digit phone number"
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="otp"
                name="otp"
                required
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.otp}
                onChange={handleChange}
              />
              <p className="mt-2 text-sm text-gray-500">
                OTP has been sent to {formData.phoneNumber}
              </p>
            </div>
          </div>
        )}

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
            ) : showOtpField ? (
              'Verify OTP'
            ) : (
              'Create Customer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCustomer;
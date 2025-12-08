import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Facebook, Chrome, MapPin, Smartphone, Globe, Clock } from 'lucide-react';
import api from '../config/axios';

interface ViewCustomerProps {
  customer: {
    _id: string;
    fullname?: string;
    email?: string;
    phoneNumber?: string;
    isEmailLogin: boolean;
    isPhoneLogin: boolean;
    isGoogleLogin: boolean;
    isFacebookLogin: boolean;
    isAppleLogin: boolean;
    isSubcribed: boolean;
    lastlogin: string;
    createdAt: string;
    updatedAt: string;
    dob?: string;
    latitude?: string;
    longitude?: string;
    appVersion?: string;
    platform?: string;
  };
  onClose: () => void;
}

interface Activity {
  _id: string;
  userId: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

const ViewCustomer: React.FC<ViewCustomerProps> = ({ customer, onClose }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [customer._id]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/v1/activity/${customer._id}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.fullname && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 text-sm text-gray-900">{customer.fullname}</div>
                </div>
              )}
              {customer.dob && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="mt-1 text-sm text-gray-900">{customer.dob}</div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{customer.email}</span>
                </div>
              )}
              {customer.phoneNumber && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{customer.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Login Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Login Methods</h3>
            <div className="flex flex-wrap gap-4">
              {customer.isEmailLogin && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Email Login</span>
                </div>
              )}
              {customer.isPhoneLogin && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Phone Login</span>
                </div>
              )}
              {customer.isGoogleLogin && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Chrome className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Google Login</span>
                </div>
              )}
              {customer.isFacebookLogin && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <Facebook className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-900">Facebook Login</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Information */}
          {(customer.latitude || customer.longitude) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  Latitude: {customer.latitude}, Longitude: {customer.longitude}
                </span>
              </div>
            </div>
          )}

          {/* Subscription Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-sm font-medium border ${
                customer.isSubcribed
                  ? 'bg-green-100 text-green-800 border-green-800'
                  : 'bg-gray-100 text-gray-800 border-gray-800'
              }`}>
                {customer.isSubcribed ? 'Subscribed' : 'Not Subscribed'}
              </span>
            </div>
          </div>

          {/* App Information */}
          {(customer.platform || customer.appVersion) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">App Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.platform && (
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Platform</label>
                      <span className="text-sm text-gray-900">{customer.platform}</span>
                    </div>
                  </div>
                )}
                {customer.appVersion && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="block text-xs font-medium text-gray-500">App Version</label>
                      <span className="text-sm text-gray-900">{customer.appVersion}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading activity history...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="border border-black p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{activity.userAgent}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">IP: {activity.ipAddress}</span>
                      </div>
                      {activity.location?.coordinates && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            Location: {activity.location.coordinates[1]}, {activity.location.coordinates[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Last Active: {formatDate(activity.lastActive)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Session Started: {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No activity history found.</p>
            )}
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Login</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(customer.lastlogin)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Joined On</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(customer.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-black p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCustomer;
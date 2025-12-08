import React, { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Globe, Smartphone, Clock, Search, Filter, CheckCircle2, XCircle, Mail, Phone, User, MapIcon, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../config/axios';

interface Activity {
  _id: string;
  userId: {
    _id: string;
    phoneNumber: string;
    email: string;
    fullname?: string;
    isSubcribed?: boolean;
  } | null;
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

interface ManageActivityProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ITEMS_PER_PAGE = 10;

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ManageActivity: React.FC<ManageActivityProps> = ({ onClose, showAlert }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'subscribed' | 'not-subscribed'>('all');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity =>
        statusFilter === 'active' ? activity.isActive : !activity.isActive
      );
    }

    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(activity =>
        subscriptionFilter === 'subscribed' ? activity.userId?.isSubcribed : !activity.userId?.isSubcribed
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(activity =>
        (activity.userAgent || '').toLowerCase().includes(search) ||
        (activity.ipAddress || '').includes(search) ||
        (activity.userId?.phoneNumber || '').includes(search) ||
        (activity.userId?.email || '').toLowerCase().includes(search) ||
        (activity.userId?.fullname || '').toLowerCase().includes(search)
      );
    }

    setFilteredActivities(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [activities, searchTerm, statusFilter, subscriptionFilter]);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/v1/activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showAlert('Failed to fetch activities', 'error');
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

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredActivities.slice(startIndex, endIndex);
  };

  const handleViewLocation = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowMap(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (showMap && selectedActivity) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl">
          <div className="flex justify-between items-center p-4 border-b border-black">
            <h3 className="text-lg font-semibold">User Location</h3>
            <button
              onClick={() => setShowMap(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4">
            <div className="h-[500px] w-full rounded-lg overflow-hidden border border-black">
              <MapContainer
                center={[selectedActivity.location.coordinates[1], selectedActivity.location.coordinates[0]]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={[selectedActivity.location.coordinates[1], selectedActivity.location.coordinates[0]]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{selectedActivity.userId?.fullname || 'Unnamed User'}</p>
                      <p>{selectedActivity.userAgent}</p>
                      <p>Last active: {formatDate(selectedActivity.lastActive)}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Activities</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone, device or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="flex-1 border border-black rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Activities</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <div className="flex items-center gap-2 min-w-[200px]">
          <Shield className="h-5 w-5 text-gray-500" />
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as 'all' | 'subscribed' | 'not-subscribed')}
            className="flex-1 border border-black rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Subscriptions</option>
            <option value="subscribed">Subscribed Only</option>
            <option value="not-subscribed">Not Subscribed</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {getCurrentPageData().map((activity) => (
          <div
            key={activity._id}
            className="border border-black p-4 rounded-lg space-y-4"
          >
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {activity.userId?.fullname || 'Unnamed User'}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  activity.userId?.isSubcribed
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  <Shield className="h-3 w-3" />
                  {activity.userId?.isSubcribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{activity.userId?.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{activity.userId?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{activity.userAgent || 'Unknown Device'}</span>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activity.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activity.isActive ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Active
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-1" />
                    Inactive
                  </div>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">IP: {activity.ipAddress || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {activity.location.coordinates[1]}, {activity.location.coordinates[0]}
                  </span>
                </div>
                <button
                  onClick={() => handleViewLocation(activity)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                >
                  <MapIcon className="h-4 w-4" />
                  <span className="text-sm">View Map</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm border-t border-gray-200 pt-4">
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

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center border-t border-black pt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageActivity;
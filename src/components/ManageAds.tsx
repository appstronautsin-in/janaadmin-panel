import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, X, ExternalLink, Eye } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewAd from './ViewAd';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Ad {
  _id: string;
  pageIndex: number;
  adsImages: string[];
  urlEnabled: boolean;
  url?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ManageAdsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const getPageName = (pageIndex: number) => {
  switch (pageIndex) {
    case 1:
      return 'Homepage Ad';
    case 2:
      return 'Single News Page Ad';
    case 3:
      return 'Sidebar Ads';
    default:
      return 'Unknown';
  }
};

const ManageAds: React.FC<ManageAdsProps> = ({ onClose, showAlert }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewingAd, setViewingAd] = useState<Ad | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canDelete = checkPermission('deleteAds');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.get('/v1/admin/ads/ads');
      // Sort ads by creation date in descending order (newest first)
      const sortedAds = response.data.sort((a: Ad, b: Ad) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAds(sortedAds);
    } catch (error) {
      console.error('Error fetching ads:', error);
      showAlert('Failed to fetch advertisements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete advertisements', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this advertisement?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/admin/ads/ads/${id}`);
      setAds(ads.filter(ad => ad._id !== id));
      showAlert('Advertisement deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      showAlert('Failed to delete advertisement', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
          <h2 className="text-2xl font-bold text-gray-900">Manage Advertisements</h2>
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
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Status
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
              {ads.map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <div className="flex items-center space-x-2">
                      {ad.adsImages.slice(0, 2).map((image, index) => (
                        <img
                          key={index}
                          src={`${IMAGE_BASE_URL}${image}`}
                          alt={`Ad preview ${index + 1}`}
                          className="h-16 w-16 object-cover border border-black"
                        />
                      ))}
                      {ad.adsImages.length > 2 && (
                        <span className="text-sm text-gray-500">
                          +{ad.adsImages.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm font-medium text-gray-900">
                      {getPageName(ad.pageIndex)}
                    </div>
                    {ad.urlEnabled && ad.url && (
                      <a
                        href={ad.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        Visit URL <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      {formatDate(ad.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      {formatDate(ad.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      {formatTime(ad.startTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      {formatTime(ad.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium border ${
                      ad.isActive
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : 'bg-red-100 text-red-800 border-red-800'
                    }`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(ad.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setViewingAd(ad)}
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(ad._id)}
                          disabled={deleteLoading === ad._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === ad._id ? (
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

      {viewingAd && (
        <ViewAd
          ad={viewingAd}
          onClose={() => setViewingAd(null)}
        />
      )}
    </>
  );
};

export default ManageAds;
import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewAdProps {
  ad: {
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
  };
  onClose: () => void;
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

const ViewAd: React.FC<ViewAdProps> = ({ ad, onClose }) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Advertisement Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertisement Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ad.adsImages.map((image, index) => (
                <img
                  key={index}
                  src={`${IMAGE_BASE_URL}${image}`}
                  alt={`Advertisement ${index + 1}`}
                  className="w-full h-40 object-cover border border-black"
                />
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 text-sm text-gray-900">{getPageName(ad.pageIndex)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium border ${
                  ad.isActive
                    ? 'bg-green-100 text-green-800 border-green-800'
                    : 'bg-red-100 text-red-800 border-red-800'
                }`}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* URL Information */}
          {ad.urlEnabled && ad.url && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Advertisement URL</label>
              <div className="mt-1 flex items-center space-x-2">
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {ad.url}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}

          {/* Duration Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
              <div className="mt-1 text-sm text-gray-900">{formatDateTime(ad.startTime)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
              <div className="mt-1 text-sm text-gray-900">{formatDateTime(ad.endTime)}</div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <div className="mt-1 text-sm text-gray-900">{formatDateTime(ad.createdAt)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <div className="mt-1 text-sm text-gray-900">{formatDateTime(ad.updatedAt)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-black p-6">
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

export default ViewAd;
import React from 'react';
import { X, CheckCircle, MapPin, Globe } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewClassifiedAdProps {
  ad: {
    _id: string;
    paymentId: string | null;
    phoneNumber: string;
    customerId: {
      _id: string;
      phoneNumber: string;
      email: string;
    };
    images: string[];
    from: string;
    to: string;
    estimatedPrice: number;
    GstNumber: string;
    matter: string;
    platform: string;
    paid: boolean;
    status: string;
    category?: string;
    isMapAvailable?: boolean;
    isWebsiteAvailable?: boolean;
    lattitude?: string;
    longitude?: string;
    websiteUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
  onApprove: (id: string) => void;
}

const ViewClassifiedAd: React.FC<ViewClassifiedAdProps> = ({ ad, onClose, onApprove }) => {
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
      <div className="bg-white border border-black shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Classified Ad Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-sm text-gray-900">{ad.customerId.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 text-sm text-gray-900">{ad.phoneNumber}</div>
              </div>
              {ad.GstNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST Number</label>
                  <div className="mt-1 text-sm text-gray-900">{ad.GstNumber}</div>
                </div>
              )}
            </div>
          </div>

          {/* Ad Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertisement Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Matter</label>
                <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{ad.matter}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Platform</label>
                  <div className="mt-1">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-800">
                      {ad.platform}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium border ${
                      ad.status === 'running'
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : ad.status === 'closed'
                        ? 'bg-red-100 text-red-800 border-red-800'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-800'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(ad.from)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <div className="mt-1 text-sm text-gray-900">{formatDate(ad.to)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Price</label>
                  <div className="mt-1 text-sm text-gray-900">₹{ad.estimatedPrice}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium border ${
                      ad.paid
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : 'bg-red-100 text-red-800 border-red-800'
                    }`}>
                      {ad.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                {ad.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="mt-1">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-800">
                        {ad.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location & Website */}
          {(ad.isMapAvailable || ad.isWebsiteAvailable) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                {ad.isMapAvailable && ad.lattitude && ad.longitude && (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500">Latitude</label>
                        <div className="mt-1 text-sm text-gray-900">{ad.lattitude}</div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Longitude</label>
                        <div className="mt-1 text-sm text-gray-900">{ad.longitude}</div>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${ad.lattitude},${ad.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </div>
                )}

                {ad.isWebsiteAvailable && ad.websiteUrl && (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </label>
                    <a
                      href={ad.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {ad.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {ad.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ad.images.map((image, index) => (
                  <img
                    key={index}
                    src={`${IMAGE_BASE_URL}/${image}`}
                    alt={`Advertisement ${index + 1}`}
                    className="w-full h-40 object-cover border border-black"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(ad.createdAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <div className="mt-1 text-sm text-gray-900">{formatDate(ad.updatedAt)}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-black p-6 flex justify-end space-x-3">
          {ad.status === 'submitted' && (
            <button
              onClick={() => onApprove(ad._id)}
              className="flex items-center px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 focus:outline-none focus:ring-1 focus:ring-green-600"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Ad
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClassifiedAd;
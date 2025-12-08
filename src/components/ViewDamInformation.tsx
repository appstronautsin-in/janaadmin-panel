import React from 'react';
import { X, Database, BarChart3 } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewDamInformationProps {
  damInfo: {
    _id: string;
    title: string;
    points: Array<{
      _id: string;
      key: string;
      value: string;
      unit: string;
    }>;
    image: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewDamInformation: React.FC<ViewDamInformationProps> = ({ damInfo, onClose }) => {
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
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Chutuku Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="text-center">
            <img
              src={`${IMAGE_BASE_URL}/${damInfo.image}`}
              alt={damInfo.title}
              className="max-w-full h-auto border border-black mx-auto rounded-lg"
            />
          </div>

          {/* Title and Status */}
          <div className="border-b border-black pb-4">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{damInfo.title}</h1>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${
                damInfo.isActive
                  ? 'bg-green-100 text-green-800 border-green-800'
                  : 'bg-gray-100 text-gray-800 border-gray-800'
              } ml-4`}>
                {damInfo.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Data Points */}
          <div>
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Data Points</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {damInfo.points.map((point) => (
                <div
                  key={point._id}
                  className="bg-gray-50 border border-black p-4 rounded-lg"
                >
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {point.key}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {point.value}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {point.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border border-black p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(damInfo.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(damInfo.updatedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Total Data Points</h3>
              <p className="mt-1 text-sm text-gray-900">
                {damInfo.points.length} points
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Information ID</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {damInfo._id}
              </p>
            </div>
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex">
              <Database className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Chutuku Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This information contains various data points related to Some Facts,
                    water levels, flow rates, and other relevant measurements.
                  </p>
                </div>
              </div>
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

export default ViewDamInformation;
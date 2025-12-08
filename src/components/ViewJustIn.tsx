import React from 'react';
import { X, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewJustInProps {
  justIn: {
    _id: string;
    title: string;
    content: string;
    isActive: boolean;
    image: string;
    expiry: string;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewJustIn: React.FC<ViewJustInProps> = ({ justIn, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusInfo = () => {
    const expired = isExpired(justIn.expiry);
    
    if (expired) {
      return {
        icon: Clock,
        text: 'Expired',
        className: 'bg-gray-100 text-gray-800 border-gray-800'
      };
    }
    
    if (justIn.isActive) {
      return {
        icon: CheckCircle,
        text: 'Active',
        className: 'bg-green-100 text-green-800 border-green-800'
      };
    }
    
    return {
      icon: XCircle,
      text: 'Inactive',
      className: 'bg-red-100 text-red-800 border-red-800'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">JustIn Details</h2>
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
              src={`${IMAGE_BASE_URL}/${justIn.image}`}
              alt={justIn.title}
              className="max-w-full h-auto border border-black mx-auto rounded-lg"
            />
          </div>

          {/* Title and Status */}
          <div className="border-b border-black pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{justIn.title}</h1>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${statusInfo.className} ml-4`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusInfo.text}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
            <div className="bg-gray-50 border border-black p-6 rounded-lg">
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {justIn.content}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border border-black p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <div className="mt-1 flex items-center">
                <StatusIcon className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm text-gray-900">{statusInfo.text}</span>
                {isExpired(justIn.expiry) && (
                  <span className="ml-2 text-xs text-red-600">(Expired)</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Expiry Date</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(justIn.expiry)}
              </p>
              {isExpired(justIn.expiry) && (
                <p className="text-xs text-red-600 mt-1">
                  This JustIn has expired
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(justIn.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(justIn.updatedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">JustIn ID</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {justIn._id}
              </p>
            </div>
          </div>

          {/* JustIn Information */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  JustIn Information
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    This JustIn appears in the application to provide timely updates and information.
                    It will automatically become inactive after the expiry date.
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

export default ViewJustIn;
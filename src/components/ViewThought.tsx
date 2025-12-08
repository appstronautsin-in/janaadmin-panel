import React from 'react';
import { X, Lightbulb, Clock, CheckCircle, XCircle } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewThoughtProps {
  thought: {
    _id: string;
    thought: string;
    author: string;
    isActive: boolean;
    image: string;
    expiry: string;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewThought: React.FC<ViewThoughtProps> = ({ thought, onClose }) => {
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
    const expired = isExpired(thought.expiry);
    
    if (expired) {
      return {
        icon: Clock,
        text: 'Expired',
        className: 'bg-gray-100 text-gray-800 border-gray-800'
      };
    }
    
    if (thought.isActive) {
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
            <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Thought Details</h2>
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
              src={`${IMAGE_BASE_URL}/${thought.image}`}
              alt={thought.thought}
              className="max-w-full h-auto border border-black mx-auto rounded-lg"
            />
          </div>

          {/* Thought and Status */}
          <div className="border-b border-black pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <blockquote className="text-2xl font-bold text-gray-900 italic mb-2">
                  "{thought.thought}"
                </blockquote>
                <p className="text-lg text-gray-600">— {thought.author}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${statusInfo.className} ml-4`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusInfo.text}
              </span>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border border-black p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Author</h3>
              <p className="mt-1 text-sm text-gray-900">
                {thought.author}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <div className="mt-1 flex items-center">
                <StatusIcon className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-sm text-gray-900">{statusInfo.text}</span>
                {isExpired(thought.expiry) && (
                  <span className="ml-2 text-xs text-red-600">(Expired)</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Expiry Date</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(thought.expiry)}
              </p>
              {isExpired(thought.expiry) && (
                <p className="text-xs text-red-600 mt-1">
                  This thought has expired
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(thought.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(thought.updatedAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Thought ID</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {thought._id}
              </p>
            </div>
          </div>

          {/* Thought Information */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Thought Information
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This thought appears in the application to inspire and motivate users.
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

export default ViewThought;
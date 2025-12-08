import React from 'react';
import { X, FileText, Calendar, CheckCircle, XCircle, Crown } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewFiftyProps {
  fiftyYear: {
    _id: string;
    title: string;
    date: string;
    description: string;
    isActive: boolean;
    image: string;
    isPremiuim: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewFifty: React.FC<ViewFiftyProps> = ({ fiftyYear, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">FiftyYears Details</h2>
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
              src={`${IMAGE_BASE_URL}/${fiftyYear.image}`}
              alt={fiftyYear.title}
              className="max-w-full h-auto border border-black mx-auto rounded-lg"
            />
          </div>

          {/* Title and Status */}
          <div className="border-b border-black pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{fiftyYear.title}</h1>
                <div className="flex items-center text-lg text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  {formatContentDate(fiftyYear.date)}
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${
                  fiftyYear.isActive
                    ? 'bg-green-100 text-green-800 border-green-800'
                    : 'bg-gray-100 text-gray-800 border-gray-800'
                }`}>
                  {fiftyYear.isActive ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {fiftyYear.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium border ${
                  fiftyYear.isPremiuim
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-800'
                    : 'bg-gray-100 text-gray-800 border-gray-800'
                }`}>
                  {fiftyYear.isPremiuim ? (
                    <Crown className="h-4 w-4 mr-1" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  {fiftyYear.isPremiuim ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <div className="bg-gray-50 border border-black p-6 rounded-lg">
              <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {fiftyYear.description}
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 border border-black p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Content Date</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatContentDate(fiftyYear.date)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Status</h3>
              <div className="mt-1 flex items-center">
                {fiftyYear.isActive ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                )}
                <span className="text-sm text-gray-900">
                  {fiftyYear.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Content Type</h3>
              <div className="mt-1 flex items-center">
                {fiftyYear.isPremiuim ? (
                  <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                ) : (
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                )}
                <span className="text-sm text-gray-900">
                  {fiftyYear.isPremiuim ? 'Premium Content' : 'Free Content'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Entry ID</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {fiftyYear._id}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Created</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(fiftyYear.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700">Last Updated</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(fiftyYear.updatedAt)}
              </p>
            </div>
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex">
              <FileText className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  FiftyYears Information
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This entry contains historical content and information related to significant events.
                    Premium content requires subscription access for users to view.
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

export default ViewFifty;
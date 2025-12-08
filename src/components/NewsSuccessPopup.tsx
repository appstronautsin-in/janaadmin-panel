import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

interface NewsSuccessPopupProps {
  newsId: string;
  onClose: () => void;
}

const NewsSuccessPopup: React.FC<NewsSuccessPopupProps> = ({ newsId, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newsId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-green-100 rounded-full p-2">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-center text-gray-900">
          News Created Successfully!
        </h3>

        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            News ID
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
              {newsId}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">How to use this ID:</h4>
          <p className="text-sm text-blue-700">
            You can hyperlink this ID in your E-News paper using the following format:
          </p>
         
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
          <a
            href={`/news/${newsId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View News <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsSuccessPopup;
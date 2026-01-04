import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/constants';

interface ViewNewsProps {
  news: {
    _id: string;
    category: {
      _id: string;
      name: string;
    } | null;
    subCategory: {
      _id: string;
      name: string;
    } | null;
    secondarycategory: {
      _id: string;
      name: string;
    } | null;
    image: string[];
    authors: Array<{
      _id: string;
      fullname: string;
      position: string;
    }>;
    addedBy: {
      _id: string;
      fullname: string;
      position: string;
    };
    title: string;
    subTitle: string;
    content: string;
    tags: string[];
    views: number;
    status: 'Draft' | 'Approved' | 'Published';
    shareable: boolean;
    isPremiumContent: boolean;
    isAllowedScreenshot: boolean;
    createdAt: string;
    updatedAt: string;
  };
  onClose: () => void;
}

const ViewNews: React.FC<ViewNewsProps> = ({ news, onClose }) => {
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800 border-green-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800 border-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-800';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(news._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">View News</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* News ID Section */}
          <div className="bg-gray-50 border border-black p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              News ID
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 border border-black font-mono text-sm">
                {news._id}
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

          {/* Images */}
          {news.image && news.image.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.image.map((img, index) => (
                <img
                  key={index}
                  src={`${IMAGE_BASE_URL}/${img}`}
                  alt={`News image ${index + 1}`}
                  className="w-full h-48 object-cover border border-black"
                />
              ))}
            </div>
          )}

          {/* Title and Subtitle */}
          <div className="border-b border-black pb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{news.title}</h1>
            <p className="text-xl text-gray-600">{news.subTitle}</p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 border border-black p-4">
            <div>
              <p className="text-sm text-gray-600">
                Category: <span className="font-medium">{news.category?.name || 'Uncategorized'}</span>
                {news.subCategory && (
                  <> / <span className="font-medium">{news.subCategory.name}</span></>
                )}
              </p>
              {news.secondarycategory && (
                <p className="text-sm text-gray-600 mt-1">
                  Secondary Category: <span className="font-medium">{news.secondarycategory.name}</span>
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Status: <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${getStatusBadgeClass(news.status)}`}>
                  {news.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Created: <span className="font-medium">{formatDate(news.createdAt)}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Last Updated: <span className="font-medium">{formatDate(news.updatedAt)}</span>
              </p>
            </div>
          </div>

          {/* Authors */}
          <div className="border-b border-black pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authors</h3>
            <div className="flex flex-wrap gap-2">
              {news.authors.map(author => (
                <span
                  key={author._id}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border border-black"
                >
                  {author.fullname} ({author.position})
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Added by: {news.addedBy.fullname} ({news.addedBy.position})
            </p>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
            <div 
              className="prose max-w-none border border-black p-4"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="border-t border-black pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 border border-black"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sharing and Screenshot Settings */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 border-t border-black pt-4">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${news.shareable ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {news.shareable ? 'Sharing Allowed' : 'Sharing Disabled'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${news.isAllowedScreenshot ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {news.isAllowedScreenshot ? 'Comments Allowed' : 'Comments Disabled'}
            </div>
             <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${news.isPremiumContent ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {news.isPremiumContent ? 'Premium Content' : 'Not Premium Content'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNews;
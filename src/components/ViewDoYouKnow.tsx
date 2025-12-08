import React from 'react';
import { X, Calendar, Eye, Heart, ImageIcon } from 'lucide-react';

interface DoYouKnow {
  _id: string;
  title: string;
  content: string;
  expiry: string;
  isActive: boolean;
  image: string;
  likes: any[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface ViewDoYouKnowProps {
  doYouKnow: DoYouKnow;
  onClose: () => void;
}

const ViewDoYouKnow: React.FC<ViewDoYouKnowProps> = ({ doYouKnow, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Do You Know Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            {doYouKnow.image ? (
              <img
                src={`https://laqsya.com/${doYouKnow.image}`}
                alt={doYouKnow.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-16 w-16 text-gray-400" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-lg font-semibold">{doYouKnow.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p>
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  doYouKnow.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {doYouKnow.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Content</label>
            <p className="text-gray-700 whitespace-pre-wrap">{doYouKnow.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-500">Views</label>
                <p className="text-lg font-semibold">{doYouKnow.views}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-500">Likes</label>
                <p className="text-lg font-semibold">{doYouKnow.likes.length}</p>
              </div>
            </div>
          </div>

          {doYouKnow.expiry && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                <p className="text-gray-700">
                  {new Date(doYouKnow.expiry).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <label className="font-medium">Created At</label>
              <p>{new Date(doYouKnow.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="font-medium">Updated At</label>
              <p>{new Date(doYouKnow.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDoYouKnow;

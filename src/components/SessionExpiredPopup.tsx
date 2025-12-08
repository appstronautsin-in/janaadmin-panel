import React from 'react';
import { LogOut } from 'lucide-react';

interface SessionExpiredPopupProps {
  onClose: () => void;
}

const SessionExpiredPopup: React.FC<SessionExpiredPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-md p-6 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full">
            <LogOut className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Session Expired
          </h2>
          
          <p className="mt-2 text-gray-600">
            Your session has expired. Please login again to continue.
          </p>

          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-2 bg-black text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
          >
            Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredPopup;
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-black mt-8">
      <div className="px-6 py-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
           Version 3.35 © 2025 Copyright by Janathavani | All rights reserved
          </p>
          <p className="text-xs text-gray-500">
            By accessing this data, you are bound to company policy of not sharing data outside the company
          </p>
          <p className="text-xs text-gray-400">
            Developed by Appstronauts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
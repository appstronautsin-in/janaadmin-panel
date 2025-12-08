import React from 'react';
import { Clock } from 'lucide-react';
import { useTimeFormat } from '../contexts/TimeFormatContext';

const DashboardHeader: React.FC = () => {
  const { timeFormat, setTimeFormat } = useTimeFormat();

  const toggleTimeFormat = () => {
    setTimeFormat(timeFormat === '12' ? '24' : '12');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-end">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-600">Time Format:</span>
        <button
          onClick={toggleTimeFormat}
          className="px-3 py-1.5 border border-black text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          {timeFormat === '12' ? '12 Hour' : '24 Hour'}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;

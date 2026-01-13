import React, { useState, useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { sessionManager } from '../utils/sessionManager';

const DashboardHeader: React.FC = () => {
  const { timeFormat, setTimeFormat } = useTimeFormat();
  const { profile, loading } = useAdminProfile();
  const [sessionStartTime, setSessionStartTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let sessionStartTimeStr = sessionManager.getSessionStartTime();

    if (!sessionStartTimeStr) {
      const token = localStorage.getItem('token');
      if (token) {
        sessionStartTimeStr = new Date().toISOString();
        localStorage.setItem('sessionStartTime', sessionStartTimeStr);
      }
    }

    if (sessionStartTimeStr) {
      setSessionStartTime(sessionStartTimeStr);
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTimeFormat = () => {
    setTimeFormat(timeFormat === '12' ? '24' : '12');
  };

  const calculateDuration = (startTime: string) => {
    if (!startTime) return '';
    const start = new Date(startTime);
    const now = currentTime;
    const diff = now.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (timeFormat === '12') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    } else {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {loading ? (
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400 animate-pulse" />
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : profile ? (
            <>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-700" />
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{profile.fullname}</div>
                    <div className="text-xs text-gray-500">{profile.position} · {profile.role}</div>
                  </div>

                  {sessionStartTime && (
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="text-xs text-gray-500">Session time started:</div>
                        <div className="text-sm font-medium text-gray-700">
                          {formatTime(sessionStartTime)} · {calculateDuration(sessionStartTime)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>

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
    </div>
  );
};

export default DashboardHeader;

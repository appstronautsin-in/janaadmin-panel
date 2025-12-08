import React, { createContext, useContext, useState, useEffect } from 'react';

type TimeFormat = '12' | '24';

interface TimeFormatContextType {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
}

const TimeFormatContext = createContext<TimeFormatContextType | undefined>(undefined);

export const TimeFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>(() => {
    const saved = localStorage.getItem('timeFormat');
    return (saved === '12' || saved === '24') ? saved : '24';
  });

  const setTimeFormat = (format: TimeFormat) => {
    setTimeFormatState(format);
    localStorage.setItem('timeFormat', format);
  };

  return (
    <TimeFormatContext.Provider value={{ timeFormat, setTimeFormat }}>
      {children}
    </TimeFormatContext.Provider>
  );
};

export const useTimeFormat = () => {
  const context = useContext(TimeFormatContext);
  if (context === undefined) {
    throw new Error('useTimeFormat must be used within a TimeFormatProvider');
  }
  return context;
};

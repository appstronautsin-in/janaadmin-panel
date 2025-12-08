import React, { useState, useEffect } from 'react';
import { useTimeFormat } from '../contexts/TimeFormatContext';

interface DateTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  name,
  required,
  className = ''
}) => {
  const { timeFormat } = useTimeFormat();
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setDateValue(`${year}-${month}-${day}`);

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');

      if (timeFormat === '12') {
        setAmpm(hours >= 12 ? 'PM' : 'AM');
        hours = hours % 12 || 12;
        setTimeValue(`${String(hours).padStart(2, '0')}:${minutes}`);
      } else {
        setTimeValue(`${String(hours).padStart(2, '0')}:${minutes}`);
      }
    }
  }, [value, timeFormat]);

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);
    updateDateTime(newDate, timeValue, ampm);
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    updateDateTime(dateValue, newTime, ampm);
  };

  const handleAmPmChange = (newAmPm: 'AM' | 'PM') => {
    setAmpm(newAmPm);
    updateDateTime(dateValue, timeValue, newAmPm);
  };

  const updateDateTime = (date: string, time: string, period: 'AM' | 'PM') => {
    if (!date || !time) return;

    const [hours, minutes] = time.split(':').map(Number);

    let finalHours = hours;
    if (timeFormat === '12') {
      if (period === 'PM' && hours !== 12) {
        finalHours = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        finalHours = 0;
      }
    }

    const dateTimeString = `${date}T${String(finalHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onChange(dateTimeString);
  };

  if (timeFormat === '24') {
    return (
      <input
        type="datetime-local"
        name={name}
        value={value ? value.slice(0, 16) : ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={className}
      />
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={dateValue}
        onChange={(e) => handleDateChange(e.target.value)}
        required={required}
        className={`flex-1 ${className}`}
      />
      <input
        type="time"
        value={timeValue}
        onChange={(e) => handleTimeChange(e.target.value)}
        required={required}
        className={`flex-1 ${className}`}
        pattern="(0[1-9]|1[0-2]):[0-5][0-9]"
      />
      <select
        value={ampm}
        onChange={(e) => handleAmPmChange(e.target.value as 'AM' | 'PM')}
        className={`px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black ${className}`}
        required={required}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default DateTimeInput;

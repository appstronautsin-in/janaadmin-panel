export const formatDateTimeForInput = (isoString: string, timeFormat: '12' | '24'): string => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (timeFormat === '12') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${year}-${month}-${day}T${hoursStr}:${minutes} ${ampm}`;
  } else {
    const hoursStr = String(hours).padStart(2, '0');
    return `${year}-${month}-${day}T${hoursStr}:${minutes}`;
  }
};

export const convertToDateTimeLocal = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatDisplayDateTime = (isoString: string, timeFormat: '12' | '24'): string => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (timeFormat === '12') {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    return `${month}/${day}/${year}, ${hoursStr}:${minutes} ${ampm}`;
  } else {
    const hoursStr = String(hours).padStart(2, '0');
    return `${month}/${day}/${year}, ${hoursStr}:${minutes}`;
  }
};

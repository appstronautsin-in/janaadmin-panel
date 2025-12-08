import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, MapPin, Upload, Trash2 } from 'lucide-react';
import api from '../config/axios';
import DateTimeInput from './DateTimeInput';

interface Event {
  _id: string;
  title: string;
  description: string;
  image: string[];
  locationAvailable: boolean;
  latitude?: number;
  longitude?: number;
  websiteAvailable: boolean;
  websiteUrl?: string;
  locationName?: string;
  views: number;
  eventDateAndTime: string;
  eventEndTime: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFinished: boolean;
  hostedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditEventProps {
  eventId: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyB4whweXXbh9dQc1tNfJPcEpA4LD2LWBgc';

const EditEvent: React.FC<EditEventProps> = ({ eventId, onClose, showAlert }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationAvailable: false,
    latitude: 0,
    longitude: 0,
    locationName: '',
    websiteAvailable: false,
    websiteUrl: '',
    eventDateAndTime: '',
    eventEndTime: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    hostedBy: ''
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'LOCATION_SELECTED') {
        const { locationName, latitude, longitude } = event.data.data;
        setFormData(prev => ({
          ...prev,
          locationName,
          latitude,
          longitude
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/events/${eventId}`);
      const event: Event = response.data;

      const formatDateTimeLocal = (isoString: string) => {
        const [datePart, timePart] = isoString.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 330;
        let newHours = Math.floor(totalMinutes / 60);
        let newMinutes = totalMinutes % 60;
        let newDay = parseInt(day);
        let newMonth = parseInt(month);
        let newYear = parseInt(year);

        if (newHours >= 24) {
          newHours -= 24;
          newDay += 1;

          const daysInMonth = new Date(newYear, newMonth, 0).getDate();
          if (newDay > daysInMonth) {
            newDay = 1;
            newMonth += 1;
            if (newMonth > 12) {
              newMonth = 1;
              newYear += 1;
            }
          }
        }

        const formattedDay = String(newDay).padStart(2, '0');
        const formattedMonth = String(newMonth).padStart(2, '0');
        const formattedHours = String(newHours).padStart(2, '0');
        const formattedMinutes = String(newMinutes).padStart(2, '0');

        return `${newYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`;
      };

      setFormData({
        title: event.title,
        description: event.description,
        locationAvailable: event.locationAvailable,
        latitude: event.latitude || 0,
        longitude: event.longitude || 0,
        locationName: event.locationName || '',
        websiteAvailable: event.websiteAvailable,
        websiteUrl: event.websiteUrl || '',
        eventDateAndTime: formatDateTimeLocal(event.eventDateAndTime),
        eventEndTime: formatDateTimeLocal(event.eventEndTime),
        status: event.status,
        hostedBy: event.hostedBy || ''
      });

      setExistingImages(event.image || []);
    } catch (error) {
      console.error('Error fetching event:', error);
      showAlert('Failed to fetch event details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const openLocationPicker = () => {
    const params = new URLSearchParams();
    if (formData.latitude && formData.longitude) {
      params.append('lat', formData.latitude.toString());
      params.append('lng', formData.longitude.toString());
    }
    if (formData.locationName) {
      params.append('locationName', formData.locationName);
    }

    const url = `/location-picker.html?${params.toString()}`;
    window.open(url, '_blank', 'width=1200,height=800');
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setNewImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    setRemovedImages(prev => [...prev, imageToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.eventDateAndTime || !formData.eventEndTime) {
      showAlert('Please select event start and end dates', 'error');
      return;
    }

    if (new Date(formData.eventEndTime) < new Date(formData.eventDateAndTime)) {
      showAlert('Event end time must be after start time', 'error');
      return;
    }

    if (formData.locationAvailable && (!formData.latitude || !formData.longitude)) {
      showAlert('Please select a location on the map', 'error');
      return;
    }

    if (formData.websiteAvailable && !formData.websiteUrl) {
      showAlert('Please enter a website URL', 'error');
      return;
    }

    setSaving(true);

    try {
      const convertToServerTime = (datetimeLocal: string) => {
        const [datePart, timePart] = datetimeLocal.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');

        let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) - 330;
        let newHours = Math.floor(totalMinutes / 60);
        let newMinutes = totalMinutes % 60;
        let newDay = parseInt(day);
        let newMonth = parseInt(month);
        let newYear = parseInt(year);

        if (totalMinutes < 0) {
          newHours = 24 + newHours;
          newMinutes = newMinutes < 0 ? 60 + newMinutes : newMinutes;
          newDay -= 1;

          if (newDay < 1) {
            newMonth -= 1;
            if (newMonth < 1) {
              newMonth = 12;
              newYear -= 1;
            }
            const daysInMonth = new Date(newYear, newMonth, 0).getDate();
            newDay = daysInMonth;
          }
        }

        const formattedDay = String(newDay).padStart(2, '0');
        const formattedMonth = String(newMonth).padStart(2, '0');
        const formattedHours = String(newHours).padStart(2, '0');
        const formattedMinutes = String(newMinutes).padStart(2, '0');

        return `${newYear}-${formattedMonth}-${formattedDay}T${formattedHours}:${formattedMinutes}`;
      };

      const data = new FormData();

      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('locationAvailable', String(formData.locationAvailable));

      if (formData.locationAvailable) {
        data.append('latitude', String(formData.latitude));
        data.append('longitude', String(formData.longitude));
        data.append('locationName', formData.locationName);
      }

      data.append('websiteAvailable', String(formData.websiteAvailable));
      if (formData.websiteAvailable) {
        data.append('websiteUrl', formData.websiteUrl);
      }

      data.append('eventDateAndTime', convertToServerTime(formData.eventDateAndTime));
      data.append('eventEndTime', convertToServerTime(formData.eventEndTime));
      data.append('status', formData.status);

      if (formData.hostedBy) {
        data.append('hostedBy', formData.hostedBy);
      }

      if (removedImages.length > 0) {
        data.append('removeImages', JSON.stringify(removedImages));
      }

      newImages.forEach((image) => {
        data.append('images', image);
      });

      await api.put(`/v1/events/${eventId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlert('Event updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error updating event:', error);
      showAlert('Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white border border-black shadow-lg p-6">
          <Loader2 className="w-8 h-8 animate-spin text-black" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="bg-white border-b border-black px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 flex-shrink-0"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Start Date & Time <span className="text-red-500">*</span>
              </label>
              <DateTimeInput
                name="eventDateAndTime"
                value={formData.eventDateAndTime}
                onChange={(value) => setFormData(prev => ({ ...prev, eventDateAndTime: value }))}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event End Date & Time <span className="text-red-500">*</span>
              </label>
              <DateTimeInput
                name="eventEndTime"
                value={formData.eventEndTime}
                onChange={(value) => setFormData(prev => ({ ...prev, eventEndTime: value }))}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hosted By
              </label>
              <input
                type="text"
                name="hostedBy"
                value={formData.hostedBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Organization or person name"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                name="locationAvailable"
                checked={formData.locationAvailable}
                onChange={handleInputChange}
                className="rounded border-black text-black focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-700">Add Location</span>
            </label>

            {formData.locationAvailable && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualInput(false);
                      openLocationPicker();
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    {formData.locationName ? 'Change Location' : 'Select on Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="flex-1 px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
                  >
                    {showManualInput ? 'Hide Manual Entry' : 'Enter Manually'}
                  </button>
                </div>

                {showManualInput && (
                  <div className="p-4 bg-gray-50 border border-gray-300 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Enter Coordinates Manually</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            latitude: parseFloat(e.target.value) || 0
                          }))}
                          placeholder="e.g., 14.4644"
                          className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            longitude: parseFloat(e.target.value) || 0
                          }))}
                          placeholder="e.g., 75.9241"
                          className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Location Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.locationName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          locationName: e.target.value
                        }))}
                        placeholder="e.g., Davanagere, Karnataka"
                        className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Tip: You can find coordinates by right-clicking on Google Maps
                    </p>
                  </div>
                )}

                {formData.locationName && !showManualInput && (
                  <div className="p-3 bg-gray-50 border border-gray-300">
                    <p className="text-sm font-medium text-gray-700">Selected Location:</p>
                    <p className="text-sm text-gray-600 mt-1">{formData.locationName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                name="websiteAvailable"
                checked={formData.websiteAvailable}
                onChange={handleInputChange}
                className="rounded border-black text-black focus:ring-black"
              />
              <span className="text-sm font-medium text-gray-700">Add Website URL</span>
            </label>

            {formData.websiteAvailable && (
              <input
                type="url"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Event Images
            </label>

            {existingImages.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Existing Images:</p>
                <div className="flex flex-wrap gap-4 mb-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`https://laqsya.com/${image}`}
                        alt={`Existing ${index + 1}`}
                        className="w-32 h-32 object-cover border border-black"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">New Images:</p>
                <div className="flex flex-wrap gap-4 mb-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-32 h-32 object-cover border border-black"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 hover:border-black cursor-pointer">
              <Upload className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Upload New Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default EditEvent;

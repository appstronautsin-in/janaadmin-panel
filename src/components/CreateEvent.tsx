import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, MapPin, Upload, Plus, Trash2 } from 'lucide-react';
import api from '../config/axios';
import DateTimeInput from './DateTimeInput';

interface CreateEventProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyB4whweXXbh9dQc1tNfJPcEpA4LD2LWBgc';

const CreateEvent: React.FC<CreateEventProps> = ({ showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getEndDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationAvailable: false,
    latitude: 0,
    longitude: 0,
    locationName: '',
    websiteAvailable: false,
    websiteUrl: '',
    eventDateAndTime: getCurrentDateTime(),
    eventEndTime: getEndDateTime(),
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
    hostedBy: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

    setLoading(true);

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

      images.forEach((image) => {
        data.append('images', image);
      });

      await api.post('/v1/events', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlert('Event created successfully', 'success');

      setFormData({
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
        status: 'upcoming',
        hostedBy: ''
      });
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error creating event:', error);
      showAlert('Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-black shadow-sm p-6 space-y-6">
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

            <div className="flex flex-wrap gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-32 h-32 object-cover border border-black"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 hover:border-black cursor-pointer">
              <Upload className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CreateEvent;

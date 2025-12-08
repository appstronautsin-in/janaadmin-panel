import React, { useState, useEffect } from 'react';
import { X, Loader2, MapPin, Globe, User, Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../config/axios';

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

interface ViewEventProps {
  eventId: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ViewEvent: React.FC<ViewEventProps> = ({ eventId, onClose, showAlert }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      showAlert('Failed to fetch event details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split('T');
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

    const period = newHours >= 12 ? 'PM' : 'AM';
    const displayHours = newHours % 12 || 12;
    const formattedHours = String(displayHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');

    return `${formattedDay}-${formattedMonth}-${newYear} ${formattedHours}:${formattedMinutes} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const nextImage = () => {
    if (event && event.image.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % event.image.length);
    }
  };

  const prevImage = () => {
    if (event && event.image.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + event.image.length) % event.image.length);
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

  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl my-8">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {event.image && event.image.length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-gray-100 border border-black overflow-hidden">
                <img
                  src={`https://laqsya.com/${event.image[currentImageIndex]}`}
                  alt={event.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {event.image.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 hover:bg-opacity-70"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 hover:bg-opacity-70"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {event.image.length}
                  </div>
                </>
              )}
            </div>
          )}

          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
              <span className={`px-3 py-1 text-sm font-semibold ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {event.views} views
              </div>
              {event.hostedBy && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {event.hostedBy}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Event Schedule
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Start:</span>
                  <p className="text-gray-900 font-medium">{formatDate(event.eventDateAndTime)}</p>
                </div>
                <div>
                  <span className="text-gray-600">End:</span>
                  <p className="text-gray-900 font-medium">{formatDate(event.eventEndTime)}</p>
                </div>
              </div>
            </div>

            {event.locationAvailable && event.locationName && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </h4>
                <p className="text-gray-900 text-sm mb-2">{event.locationName}</p>
                {event.latitude && event.longitude && (
                  <>
                    <p className="text-xs text-gray-500 mb-2">
                      Coordinates: {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      View on Google Maps
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          {event.websiteAvailable && event.websiteUrl && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </h4>
              <a
                href={event.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {event.websiteUrl}
              </a>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Created: {formatDate(event.createdAt)}</span>
              <span>Updated: {formatDate(event.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-black px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;

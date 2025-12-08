import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Edit2, Trash2, Loader2, MapPin, Globe, User, Filter, X, RefreshCw } from 'lucide-react';
import api from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';

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

interface ManageEventsProps {
  onViewEvent: (id: string) => void;
  onEditEvent: (id: string) => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageEvents: React.FC<ManageEventsProps> = ({ onViewEvent, onEditEvent, showAlert }) => {
  const { checkPermission } = usePermissions();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedWeekDate, setSelectedWeekDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const canEdit = checkPermission('editEvent');
  const canDelete = checkPermission('deleteEvent');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((event) => {
        const titleMatch = event.title.toLowerCase().includes(query);
        const descriptionMatch = event.description.toLowerCase().includes(query);
        const locationMatch = event.locationName?.toLowerCase().includes(query) || false;

        return titleMatch || descriptionMatch || locationMatch;
      });
    }

    if (filterDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDateAndTime);
        const filterDateObj = new Date(filterDate);

        return (
          eventDate.getFullYear() === filterDateObj.getFullYear() &&
          eventDate.getMonth() === filterDateObj.getMonth() &&
          eventDate.getDate() === filterDateObj.getDate()
        );
      });
    }

    if (selectedWeekDate) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.eventDateAndTime);
        const selectedDate = new Date(selectedWeekDate);

        return (
          eventDate.getFullYear() === selectedDate.getFullYear() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getDate() === selectedDate.getDate()
        );
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((event) => event.status === filterStatus);
    }

    setFilteredEvents(filtered);
  }, [filterDate, filterStatus, events, selectedWeekDate, searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/events/');
      const eventsData = Array.isArray(response.data) ? response.data : [];
      const sortedEvents = eventsData.sort((a, b) => {
        return new Date(b.eventDateAndTime).getTime() - new Date(a.eventDateAndTime).getTime();
      });
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      showAlert('Failed to fetch events', 'error');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/v1/events/');
      const eventsData = Array.isArray(response.data) ? response.data : [];
      const sortedEvents = eventsData.sort((a, b) => {
        return new Date(b.eventDateAndTime).getTime() - new Date(a.eventDateAndTime).getTime();
      });
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
    } catch (error) {
      console.error('Error refreshing events:', error);
      showAlert('Failed to refresh events', 'error');
    } finally {
      setRefreshing(false);
    }
  };


  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/v1/events/${id}`);
      showAlert('Event deleted successfully', 'success');
      setDeleteId(null);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('Failed to delete event', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilter = () => {
    setFilterDate('');
    setShowFilterModal(false);
  };

  const clearAllFilters = () => {
    setFilterDate('');
    setFilterStatus('all');
    setSelectedWeekDate('');
    setSearchQuery('');
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 11; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const formatWeekDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filter by Date
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or location..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {(filterDate || filterStatus !== 'all' || selectedWeekDate || searchQuery.trim()) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-700 hover:text-black underline"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Date Filter (This Week):</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {getWeekDates().map((date, index) => {
            const dateStr = getDateString(date);
            const isSelected = selectedWeekDate === dateStr;
            const isToday = index === 0;

            return (
              <button
                key={index}
                onClick={() => {
                  if (isSelected) {
                    setSelectedWeekDate('');
                  } else {
                    setSelectedWeekDate(dateStr);
                    setFilterDate('');
                  }
                }}
                className={`flex-shrink-0 px-4 py-3 border transition-all ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : isToday
                    ? 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs font-medium">{formatWeekDate(date)}</div>
                {isToday && <div className="text-xs mt-1">Today</div>}
              </button>
            );
          })}
        </div>
      </div>

      {filterDate && (
        <div className="mb-4 flex items-center justify-between bg-gray-100 p-3 border border-black">
          <span className="text-sm text-gray-700">
            Showing events for: {formatDate(filterDate)}
          </span>
          <button
            onClick={clearFilter}
            className="text-sm text-gray-700 hover:text-black underline"
          >
            Clear Date Filter
          </button>
        </div>
      )}

      <div className="bg-white border border-black shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="flex items-center">
                        {event.image && event.image.length > 0 && (
                          <img
                            src={`https://laqsya.com/${event.image[0]}`}
                            alt={event.title}
                            className="w-12 h-12 object-cover border border-black mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {event.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {event.description}
                          </div>
                          {event.hostedBy && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <User className="w-3 h-3 mr-1" />
                              {event.hostedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <div className="text-sm text-gray-900">
                        {formatDate(event.eventDateAndTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {formatDate(event.eventEndTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      {event.locationAvailable && event.locationName && (
                        <div className="flex items-start text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{event.locationName}</span>
                        </div>
                      )}
                      {event.websiteAvailable && event.websiteUrl && (
                        <div className="flex items-center text-xs text-blue-600 mt-1">
                          <Globe className="w-3 h-3 mr-1" />
                          <a href={event.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                            Website
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      {event.views}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewEvent(event._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEditEvent(event._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(event._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-black shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Filter Events by Date</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearFilter}
                  className="flex-1 px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-black shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;

import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, Check, XCircle, Calendar, MapPin, DollarSign, ExternalLink, Loader2, Filter, X, Copy, Download } from 'lucide-react';
import axios from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Customer {
  _id: string;
  phoneNumber?: string;
  email?: string;
  fullname?: string;
}

interface Location {
  type: string;
  coordinates: [number, number];
}

interface SubmittedEvent {
  _id: string;
  title: string;
  customer: Customer;
  description: string;
  image: string[];
  location?: Location;
  submitterLocation?: Location;
  locationAvailable: boolean;
  ipAddress?: string;
  macAddress?: string;
  websiteAvailable: boolean;
  website?: string;
  paid: boolean;
  price: number;
  views: number;
  eventDateAndTime?: string;
  status: string;
  isFinished: boolean;
  hostedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface ManageSubmittedEventsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSubmittedEvents: React.FC<ManageSubmittedEventsProps> = ({ showAlert }) => {
  const { checkPermission } = usePermissions();
  const [events, setEvents] = useState<SubmittedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SubmittedEvent | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/v1/submit-event/submitted');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to fetch submitted events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get('/v1/submit-event/submitted');
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to refresh submitted events', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to approve this event?')) return;

    try {
      const response = await axios.patch(`/api/v1/submit-event/${eventId}/approve`);
      if (response.data.success) {
        showAlert('Event approved successfully', 'success');
        fetchEvents();
        setSelectedEvent(null);
        setViewMode(false);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to approve event', 'error');
    }
  };

  const handleReject = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to reject this event?')) return;

    try {
      const response = await axios.patch(`/api/v1/submit-event/${eventId}/reject`);
      if (response.data.success) {
        showAlert('Event rejected successfully', 'success');
        fetchEvents();
        setSelectedEvent(null);
        setViewMode(false);
      }
    } catch (error: any) {
      showAlert(error.response?.data?.message || 'Failed to reject event', 'error');
    }
  };

  const handleView = (event: SubmittedEvent) => {
    setSelectedEvent(event);
    setViewMode(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.customer.phoneNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert(`${label} copied to clipboard`, 'success');
    } catch (error) {
      showAlert('Failed to copy to clipboard', 'error');
    }
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(`https://laqsya.com/${imageUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert('Image downloaded successfully', 'success');
    } catch (error) {
      showAlert('Failed to download image', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (viewMode && selectedEvent) {
    return (
      <div className="p-6">
        <div className="bg-white border border-black shadow-lg max-w-4xl mx-auto">
          <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-gray-900">View Submitted Event</h2>
            <button
              onClick={() => {
                setViewMode(false);
                setSelectedEvent(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">{selectedEvent.title}</h3>
                <button
                  onClick={() => copyToClipboard(selectedEvent.title, 'Title')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors"
                  title="Copy title to clipboard"
                >
                  <Copy size={16} />
                  <span className="text-sm">Copy</span>
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedEvent.status)}`}>
                {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Submitted By</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedEvent.customer.fullname || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedEvent.customer.email || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedEvent.customer.phoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Event Details</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                  {selectedEvent.eventDateAndTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-600" />
                      <span>{new Date(selectedEvent.eventDateAndTime).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedEvent.paid && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-green-600" />
                      <span>Paid Event: ${selectedEvent.price}</span>
                    </div>
                  )}
                  {selectedEvent.hostedBy && (
                    <p className="text-sm"><span className="font-medium">Host:</span> {selectedEvent.hostedBy}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Eye size={16} className="text-gray-600" />
                    <span>{selectedEvent.views} views</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedEvent.description && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Description</h4>
                  <button
                    onClick={() => copyToClipboard(selectedEvent.description, 'Description')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors text-sm"
                    title="Copy description to clipboard"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              </div>
            )}

            {selectedEvent.image && selectedEvent.image.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Images ({selectedEvent.image.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedEvent.image.map((img, index) => (
                    <div key={index} className="border border-gray-300 rounded overflow-hidden relative group">
                      <img
                        src={`https://laqsya.com/${img}`}
                        alt={`Event ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <button
                          onClick={() => downloadImage(img, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                          title="Download image"
                        >
                          <Download size={18} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedEvent.locationAvailable && selectedEvent.location && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={18} />
                  Event Location
                </h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm">
                    Coordinates: {selectedEvent.location.coordinates[1]}, {selectedEvent.location.coordinates[0]}
                  </p>
                </div>
              </div>
            )}

            {selectedEvent.websiteAvailable && selectedEvent.website && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ExternalLink size={18} />
                  Website
                </h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <a
                    href={selectedEvent.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {selectedEvent.website}
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><span className="font-medium">Created:</span> {new Date(selectedEvent.createdAt).toLocaleString()}</p>
                <p><span className="font-medium">Updated:</span> {new Date(selectedEvent.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p><span className="font-medium">IP Address:</span> {selectedEvent.ipAddress || 'N/A'}</p>
                {selectedEvent.macAddress && (
                  <p><span className="font-medium">MAC Address:</span> {selectedEvent.macAddress}</p>
                )}
              </div>
            </div>

            {selectedEvent.status === 'submitted' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedEvent._id)}
                  className="flex-1 bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Approve Event
                </button>
                <button
                  onClick={() => handleReject(selectedEvent._id)}
                  className="flex-1 bg-red-600 text-white px-6 py-3 font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reject Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Submitted Events</h1>
          <div className="mt-2 flex gap-4 text-sm">
            <span className="text-gray-600">
              Total: <span className="font-semibold text-gray-900">{events.length}</span>
            </span>
            <span className="text-gray-600">
              Submitted: <span className="font-semibold text-blue-700">{events.filter(e => e.status === 'submitted').length}</span>
            </span>
            <span className="text-gray-600">
              Approved: <span className="font-semibold text-green-700">{events.filter(e => e.status === 'approved').length}</span>
            </span>
            <span className="text-gray-600">
              Rejected: <span className="font-semibold text-red-700">{events.filter(e => e.status === 'rejected').length}</span>
            </span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, customer name, email, or phone..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white border border-black">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No submitted events found</p>
        </div>
      ) : (
        <div className="bg-white border border-black shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Submitted By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-black">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="font-medium text-gray-900">{event.title}</div>
                      {event.image.length > 0 && (
                        <span className="text-xs text-gray-500">{event.image.length} images</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <div className="text-sm">
                        <div className="font-medium">{event.customer.fullname || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{event.customer.email || event.customer.phoneNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 text-sm">
                      {event.eventDateAndTime ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(event.eventDateAndTime).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 text-sm">
                      {event.paid ? (
                        <span className="text-green-600 font-medium">${event.price}</span>
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 text-sm">{event.views}</td>
                    <td className="px-6 py-4 border-r border-gray-200 text-sm text-gray-600">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(event)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {event.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(event._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(event._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubmittedEvents;

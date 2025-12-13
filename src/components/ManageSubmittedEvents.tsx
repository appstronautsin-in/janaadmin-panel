import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Eye, Check, XCircle, Calendar, MapPin, DollarSign, Clock, ExternalLink } from 'lucide-react';
import axios from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import { API_BASE_URL } from '../config/constants';

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
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSubmittedEvents: React.FC<ManageSubmittedEventsProps> = ({ onClose, showAlert }) => {
  const { checkPermission } = usePermissions();
  const [events, setEvents] = useState<SubmittedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SubmittedEvent | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const hasEventPermission = checkPermission('createEvent') || checkPermission('editEvent') || checkPermission('deleteEvent');
    if (!hasEventPermission) {
      showAlert('You do not have permission to view submitted events', 'error');
      onClose();
      return;
    }
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

  if (viewMode && selectedEvent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-black shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedEvent.status)}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>
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
                <h4 className="font-semibold text-gray-900">Description</h4>
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
                    <div key={index} className="border border-gray-300 rounded overflow-hidden">
                      <img
                        src={`${API_BASE_URL}/${img}`}
                        alt={`Event ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-black p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Submitted Events</h2>
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
            <div className="flex items-center gap-3">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="p-2 border border-black hover:bg-gray-100 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 border border-black hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search by title, customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-black rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-black rounded px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw size={32} className="animate-spin text-gray-400" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No submitted events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black">
                    <th className="text-left p-3 font-bold">Title</th>
                    <th className="text-left p-3 font-bold">Submitted By</th>
                    <th className="text-left p-3 font-bold">Date & Time</th>
                    <th className="text-left p-3 font-bold">Status</th>
                    <th className="text-left p-3 font-bold">Paid</th>
                    <th className="text-left p-3 font-bold">Views</th>
                    <th className="text-left p-3 font-bold">Created</th>
                    <th className="text-left p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.image.length > 0 && (
                          <span className="text-xs text-gray-500">{event.image.length} images</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium">{event.customer.fullname || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">{event.customer.email || event.customer.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {event.eventDateAndTime ? (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(event.eventDateAndTime).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        {event.paid ? (
                          <span className="text-green-600 font-medium">${event.price}</span>
                        ) : (
                          <span className="text-gray-400">Free</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">{event.views}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(event)}
                            className="p-2 border border-black hover:bg-gray-100"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {event.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleApprove(event._id)}
                                className="p-2 border border-green-600 text-green-600 hover:bg-green-50"
                                title="Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => handleReject(event._id)}
                                className="p-2 border border-red-600 text-red-600 hover:bg-red-50"
                                title="Reject"
                              >
                                <XCircle size={16} />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSubmittedEvents;

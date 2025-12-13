import React, { useState, useEffect } from 'react';
import { RefreshCw, Eye, Check, XCircle, MapPin, DollarSign, Loader2, X, Copy, Download, Calendar } from 'lucide-react';
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

interface Obituary {
  _id: string;
  submitterName: string;
  customer: string | Customer;
  phone: string;
  relation: string;
  ipAddress: string;
  macAddress: string;
  photo: string;
  name: string;
  matter: string;
  death: string;
  status: 'pending' | 'approved' | 'rejected';
  paid: boolean;
  location: Location;
  createdAt: string;
  updatedAt: string;
  transaction?: string;
}

interface ManageSubmittedObituaryProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSubmittedObituary: React.FC<ManageSubmittedObituaryProps> = ({ showAlert }) => {
  const [obituaries, setObituaries] = useState<Obituary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(false);
  const [selectedObituary, setSelectedObituary] = useState<Obituary | null>(null);
  const { checkPermission } = usePermissions();

  const canCreateNews = checkPermission('createNews');
  const canEditNews = checkPermission('editNews');
  const canDeleteNews = checkPermission('deleteNews');

  const hasAllNewsPermissions = canCreateNews && canEditNews && canDeleteNews;

  useEffect(() => {
    fetchObituaries();
  }, []);

  const fetchObituaries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://laqsya.com/api/v1/obituary');
      setObituaries(response.data);
    } catch (error) {
      console.error('Error fetching obituaries:', error);
      showAlert('Failed to fetch obituaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (obituary: Obituary) => {
    setSelectedObituary(obituary);
    setViewMode(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(`https://laqsya.com/api/v1/obituary/${id}`, { status: 'approved' });
      showAlert('Obituary approved successfully', 'success');
      fetchObituaries();
      setViewMode(false);
      setSelectedObituary(null);
    } catch (error) {
      console.error('Error approving obituary:', error);
      showAlert('Failed to approve obituary', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.put(`https://laqsya.com/api/v1/obituary/${id}`, { status: 'rejected' });
      showAlert('Obituary rejected successfully', 'success');
      fetchObituaries();
      setViewMode(false);
      setSelectedObituary(null);
    } catch (error) {
      console.error('Error rejecting obituary:', error);
      showAlert('Failed to reject obituary', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-blue-100 text-blue-800',
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

  const downloadImage = async (imagePath: string, name: string) => {
    try {
      const response = await fetch(`https://laqsya.com/${imagePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/\s+/g, '_')}_obituary.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert('Image downloaded successfully', 'success');
    } catch (error) {
      showAlert('Failed to download image', 'error');
    }
  };

  if (!hasAllNewsPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">You do not have permission to access this section.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (viewMode && selectedObituary) {
    return (
      <div className="p-6">
        <div className="bg-white border border-black shadow-lg max-w-4xl mx-auto">
          <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-gray-900">View Obituary</h2>
            <button
              onClick={() => {
                setViewMode(false);
                setSelectedObituary(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">{selectedObituary.name}</h3>
                <button
                  onClick={() => copyToClipboard(selectedObituary.name, 'Name')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors"
                  title="Copy name to clipboard"
                >
                  <Copy size={16} />
                  <span className="text-sm">Copy</span>
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedObituary.status)}`}>
                {selectedObituary.status.charAt(0).toUpperCase() + selectedObituary.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Submitted By</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedObituary.submitterName}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedObituary.phone}</p>
                  <p className="text-sm"><span className="font-medium">Relation:</span> {selectedObituary.relation}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Details</h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
                  {selectedObituary.death && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-600" />
                      <span>Death: {new Date(selectedObituary.death).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedObituary.paid && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={16} className="text-green-600" />
                      <span>Paid</span>
                    </div>
                  )}
                  {selectedObituary.transaction && (
                    <p className="text-sm"><span className="font-medium">Transaction:</span> {selectedObituary.transaction}</p>
                  )}
                </div>
              </div>
            </div>

            {selectedObituary.matter && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Obituary Matter</h4>
                  <button
                    onClick={() => copyToClipboard(selectedObituary.matter, 'Matter')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-colors text-sm"
                    title="Copy matter to clipboard"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedObituary.matter}</p>
                </div>
              </div>
            )}

            {selectedObituary.photo && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Photo</h4>
                <div className="border border-gray-300 rounded overflow-hidden relative group max-w-md">
                  <img
                    src={`https://laqsya.com/${selectedObituary.photo}`}
                    alt={selectedObituary.name}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(selectedObituary.photo, selectedObituary.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 flex items-center gap-2 hover:bg-gray-100"
                      title="Download photo"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedObituary.location && (
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={18} />
                  Location
                </h4>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-sm">
                    Coordinates: {selectedObituary.location.coordinates[1]}, {selectedObituary.location.coordinates[0]}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><span className="font-medium">Created:</span> {new Date(selectedObituary.createdAt).toLocaleString()}</p>
                <p><span className="font-medium">Updated:</span> {new Date(selectedObituary.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <p><span className="font-medium">IP Address:</span> {selectedObituary.ipAddress || 'N/A'}</p>
                {selectedObituary.macAddress && (
                  <p><span className="font-medium">MAC Address:</span> {selectedObituary.macAddress}</p>
                )}
              </div>
            </div>

            {selectedObituary.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedObituary._id)}
                  className="flex-1 bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedObituary._id)}
                  className="flex-1 bg-red-600 text-white px-6 py-3 font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={20} />
                  Reject
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
      <div className="bg-white border border-black shadow-lg">
        <div className="border-b border-black p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Submitted Obituaries</h2>
          <button
            onClick={fetchObituaries}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {obituaries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No obituaries submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Submitter</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {obituaries.map((obituary) => (
                  <tr key={obituary._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{obituary.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{obituary.submitterName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{obituary.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(obituary.status)}`}>
                        {obituary.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {obituary.paid ? (
                        <span className="text-green-600 text-sm">Yes</span>
                      ) : (
                        <span className="text-red-600 text-sm">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(obituary.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(obituary)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSubmittedObituary;

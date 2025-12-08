import React, { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Loader2, X, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewClassifiedAd from './ViewClassifiedAd';
import EditClassifiedAd from './EditClassifiedAd';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface ClassifiedAd {
  _id: string;
  title?: string;
  paymentId: string | null;
  phoneNumber: string;
  customerId: {
    _id: string;
    phoneNumber: string;
    email: string;
  };
  images: string[];
  from: string;
  to: string;
  estimatedPrice: number;
  GstNumber: string;
  matter: string;
  platform: string;
  paid: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ManageClassifiedAdsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ITEMS_PER_PAGE = 10;

const ManageClassifiedAds: React.FC<ManageClassifiedAdsProps> = ({ onClose, showAlert }) => {
  const [ads, setAds] = useState<ClassifiedAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<ClassifiedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewingAd, setViewingAd] = useState<ClassifiedAd | null>(null);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [goToPage, setGoToPage] = useState('');
  const [rejectingAdId, setRejectingAdId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editClassifiedAds');
  const canDelete = checkPermission('deleteClassifiedAds');

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    let filtered = [...ads];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ad => ad.status === statusFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ad =>
        ad.phoneNumber?.includes(search) ||
        ad.matter?.toLowerCase().includes(search) ||
        ad.customerId?.email?.toLowerCase().includes(search) ||
        (ad.title && ad.title.toLowerCase().includes(search))
      );
    }

    setFilteredAds(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [ads, searchTerm, statusFilter]);

  const fetchAds = async () => {
    try {
      const response = await api.get('/v1/classified-ads');
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching classified ads:', error);
      showAlert('Failed to fetch classified ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete classified ads', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this classified ad?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/classified-ads/${id}`);
      setAds(ads.filter(ad => ad._id !== id));
      showAlert('Classified ad deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting classified ad:', error);
      showAlert('Failed to delete classified ad', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (adId: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit classified ads', 'error');
      return;
    }
    setEditingAdId(adId);
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/v1/classified-ads/${id}/status`, { status: 'running' });
      await fetchAds();
      showAlert('Classified ad approved successfully', 'success');
    } catch (error) {
      console.error('Error approving classified ad:', error);
      showAlert('Failed to approve classified ad', 'error');
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingAdId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      showAlert('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      await api.post(`/v1/classified-ads/${rejectingAdId}/reject`, { reason: rejectReason });
      await fetchAds();
      showAlert('Classified ad rejected successfully', 'success');
      setRejectingAdId(null);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting classified ad:', error);
      showAlert('Failed to reject classified ad', 'error');
    }
  };

  const handleRejectCancel = () => {
    setRejectingAdId(null);
    setRejectReason('');
  };

  const handleGoToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(goToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage('');
    } else {
      showAlert('Invalid page number', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAds.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-black shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Classified Ads</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by title, phone, email, or matter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 border border-black rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="running">Running</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Matter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {getCurrentPageData().map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm font-medium text-gray-900">
                      {ad.title || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{ad.customerId.email}</div>
                      <div className="text-gray-600">{ad.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900 line-clamp-2">{ad.matter}</div>
                    <div className="text-sm text-gray-600">₹{ad.estimatedPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                    <span className="px-2 inline-flex text-xs leading-5 font-medium bg-gray-100 text-gray-800 border border-gray-800">
                      {ad.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm">
                      <div>From: {formatDate(ad.from)}</div>
                      <div>To: {formatDate(ad.to)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-r border-black">
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium border ${
                      ad.status === 'running'
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : ad.status === 'closed'
                        ? 'bg-red-100 text-red-800 border-red-800'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-800'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setViewingAd(ad)}
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {ad.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleApprove(ad._id)}
                            className="text-green-600 hover:text-green-800 border border-green-600 hover:border-green-800 p-1"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectClick(ad._id)}
                            className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => handleEdit(ad._id)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(ad._id)}
                          disabled={deleteLoading === ad._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === ad._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center border-t border-black pt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAds.length)} of {filteredAds.length} results
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleGoToPage} className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Go to page:</label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="w-16 border border-black px-2 py-1 text-sm"
                />
                <button
                  type="submit"
                  className="px-2 py-1 border border-black text-sm hover:bg-gray-50"
                >
                  Go
                </button>
              </form>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-black text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewingAd && (
        <ViewClassifiedAd
          ad={viewingAd}
          onClose={() => setViewingAd(null)}
          onApprove={handleApprove}
        />
      )}

      {editingAdId && (
        <EditClassifiedAd
          adId={editingAdId}
          onClose={() => setEditingAdId(null)}
          onSuccess={fetchAds}
          showAlert={showAlert}
        />
      )}

      {rejectingAdId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-black shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4 border-b border-black pb-4">
              <h3 className="text-xl font-bold">Reject Classified Ad</h3>
              <button onClick={handleRejectCancel} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this ad..."
                className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleRejectCancel}
                className="px-4 py-2 border border-black text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white border border-red-600 hover:bg-red-700"
              >
                Reject Ad
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageClassifiedAds;
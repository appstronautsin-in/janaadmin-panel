import React, { useState, useEffect } from 'react';
import { X, Loader2, Search, Filter, CreditCard, Calendar, User, CheckCircle2, XCircle } from 'lucide-react';
import api from '../config/axios';

interface SubscriptionLog {
  _id: string;
  package: {
    _id: string;
    planName: string;
    ePaperAllowedInApp: boolean;
    ePaperAllowedInWeb: boolean;
    price: number;
    features: string[];
    validity: string;
    newsAllowedInApp: boolean;
    newsAllowedInWebsite: boolean;
    createdAt: string;
    updatedAt: string;
  };
  start: string;
  end: string;
  customer?: {
    _id: string;
    phoneNumber: string;
    email: string;
    fullname?: string;
    isEmailLogin: boolean;
    isPhoneLogin: boolean;
    isGoogleLogin: boolean;
    isFacebookLogin: boolean;
    isAppleLogin: boolean;
    isSubcribed: boolean;
    lastlogin: string;
    createdAt: string;
    updatedAt: string;
    dob?: string;
    latitude?: string;
    longitude?: string;
  } | null;
  addedBy?: {
    _id: string;
    fullname?: string;
    phonenumber?: string;
    email?: string;
    position?: string;
    role?: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ManageSubscriptionLogsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ITEMS_PER_PAGE = 20;

const ManageSubscriptionLogs: React.FC<ManageSubscriptionLogsProps> = ({ onClose, showAlert }) => {
  const [logs, setLogs] = useState<SubscriptionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SubscriptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);

  useEffect(() => {
    fetchSubscriptionLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log =>
        statusFilter === 'active' ? log.isActive : !log.isActive
      );
    }

    // Apply plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(log => log.package.planName === planFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.package.planName.toLowerCase().includes(search) ||
        ((log.customer?.fullname || '').toLowerCase().includes(search)) ||
        ((log.customer?.email || '').toLowerCase().includes(search)) ||
        ((log.customer?.phoneNumber || '').toLowerCase().includes(search)) ||
        ((log.customer?._id || '').toLowerCase().includes(search)) ||
        log._id.toLowerCase().includes(search) ||
        ((log.addedBy?.fullname || '').toLowerCase().includes(search)) ||
        ((log.addedBy?.email || '').toLowerCase().includes(search)) ||
        ((log.addedBy?.phonenumber || '').toLowerCase().includes(search))
      );
    }

    setFilteredLogs(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
    setCurrentPage(1);
  }, [logs, searchTerm, statusFilter, planFilter]);

  const fetchSubscriptionLogs = async () => {
    try {
      const response = await api.get('/v1/customer/subscription/admin/subscriptions');
      setLogs(response.data || []);

      // Extract unique plan names for filter
      const plans = [...new Set((response.data || []).map((log: SubscriptionLog) => log.package.planName))];
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error fetching subscription logs:', error);
      showAlert('Failed to fetch subscription logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number') return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, endIndex);
  };

  const isExpired = (endDate: string) => {
    if (!endDate) return false;
    const d = new Date(endDate);
    return !isNaN(d.getTime()) && d < new Date();
  };

  const getStatusBadge = (log: SubscriptionLog) => {
    const expired = isExpired(log.end);

    if (expired) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </span>
      );
    }

    if (log.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 border border-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Subscription Logs</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by plan, customer name, email, phone, admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Plans</option>
            {availablePlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 flex items-center">
          Total: {filteredLogs.length} subscriptions
        </div>
      </div>

      {/* Subscription Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Subscription Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Added By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {getCurrentPageData().map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.package.planName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(log.package.price)} • {log.package.validity}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {Array.isArray(log.package.features) ? log.package.features.slice(0, 2).join(', ') : ''}
                        {Array.isArray(log.package.features) && log.package.features.length > 2 && ` +${log.package.features.length - 2} more`}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    {log.customer ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.customer.fullname || 'No Name'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {log.customer.email || '—'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {log.customer.phoneNumber || '—'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          ID: {log.customer._id}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No customer data
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 border-r border-black">
                  <div className="text-sm">
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      Start: {formatDate(log.start)}
                    </div>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      End: {formatDate(log.end)}
                    </div>
                    {isExpired(log.end) && (
                      <div className="text-xs text-red-600 mt-1">
                        Expired
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 border-r border-black">
                  {getStatusBadge(log)}
                </td>

                <td className="px-6 py-4 border-r border-black">
                  {/* addedBy can be null */}
                  {log.addedBy ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {log.addedBy.fullname || 'Admin'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.addedBy.email || log.addedBy.phonenumber || '—'}
                      </div>
                      {log.addedBy.position && (
                        <div className="text-xs text-gray-500 mt-1">
                          {log.addedBy.position} {log.addedBy.role ? `• ${log.addedBy.role}` : ''}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      — {/* or 'Self-service' or 'N/A' depending on what you prefer */}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center border-t border-black pt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} results
          </div>
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
      )}
    </div>
  );
};

export default ManageSubscriptionLogs;

import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Loader2, X, Mail, Phone, Facebook, Chrome, CreditCard, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../config/axios';
import ViewCustomer from './ViewCustomer';
import ViewSubscriptions from './ViewSubscriptions';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Customer {
  _id: string;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
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
  appVersion?: string;
  platform?: string;
}

interface ManageCustomersProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ITEMS_PER_PAGE = 10;

const ManageCustomers: React.FC<ManageCustomersProps> = ({ onClose, showAlert }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [viewingSubscriptions, setViewingSubscriptions] = useState<{id: string; name?: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchById, setSearchById] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [dateFilter, setDateFilter] = useState<'recent' | 'old' | 'new'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [goToPage, setGoToPage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editCustomer');
  const canDelete = checkPermission('deleteCustomer');

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...customers];

    // Apply subscription filter
    if (subscriptionFilter !== 'all') {
      filtered = filtered.filter(customer =>
        subscriptionFilter === 'subscribed' ? customer.isSubcribed : !customer.isSubcribed
      );
    }

    // Apply search by ID
    if (searchById) {
      filtered = filtered.filter(customer =>
        customer._id.includes(searchById)
      );
    }
    // Apply general search
    else if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        (customer.fullname?.toLowerCase().includes(search) || '') ||
        (customer.email?.toLowerCase().includes(search) || '') ||
        (customer.phoneNumber?.includes(search) || '')
      );
    }

    // Apply date sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (dateFilter === 'recent') {
        return dateB - dateA; // Newest first
      } else if (dateFilter === 'old') {
        return dateA - dateB; // Oldest first
      } else if (dateFilter === 'new') {
        return dateB - dateA; // Same as recent - newest first
      }
      return 0;
    });

    setFilteredCustomers(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [customers, searchTerm, searchById, subscriptionFilter, dateFilter]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/v1/customer/auth/all-customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showAlert('Failed to fetch customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/v1/customer/auth/all-customers');
      setCustomers(response.data);
      showAlert('Customers refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing customers:', error);
      showAlert('Failed to refresh customers', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete customers', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/customer/auth/${id}`);
      setCustomers(customers.filter(customer => customer._id !== id));
      showAlert('Customer deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('Failed to delete customer', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleViewSubscriptions = (customer: Customer) => {
    // Only allow viewing subscriptions if user has both edit and delete permissions
    if (!canEdit || !canDelete) {
      showAlert('You do not have permission to manage customer subscriptions', 'error');
      return;
    }
    setViewingSubscriptions({
      id: customer._id,
      name: customer.fullname
    });
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLoginMethodIcons = (customer: Customer) => {
    return (
      <div className="flex space-x-2">
        {customer.isEmailLogin && (
          <Mail className="h-4 w-4 text-gray-600" title="Email Login" />
        )}
        {customer.isPhoneLogin && (
          <Phone className="h-4 w-4 text-gray-600" title="Phone Login" />
        )}
        {customer.isGoogleLogin && (
          <Chrome className="h-4 w-4 text-gray-600" title="Google Login" />
        )}
        {customer.isFacebookLogin && (
          <Facebook className="h-4 w-4 text-gray-600" title="Facebook Login" />
        )}
      </div>
    );
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, endIndex);
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
          <h2 className="text-2xl font-bold text-gray-900">Manage Customers</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh customers"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchById(''); // Clear ID search when using general search
              }}
              className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by customer ID..."
              value={searchById}
              onChange={(e) => {
                setSearchById(e.target.value);
                setSearchTerm(''); // Clear general search when using ID search
              }}
              className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
              className="flex-1 border border-black rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="all">All Customers</option>
              <option value="subscribed">Subscribed Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-[180px]">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'recent' | 'old' | 'new')}
              className="flex-1 border border-black rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="recent">Recent</option>
              <option value="new">New</option>
              <option value="old">Old</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Login Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  App Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {getCurrentPageData().map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm">
                      {customer.fullname && (
                        <div className="font-medium text-gray-900">{customer.fullname}</div>
                      )}
                      {customer.email && (
                        <div className="text-gray-600">{customer.email}</div>
                      )}
                      {customer.phoneNumber && (
                        <div className="text-gray-600">{customer.phoneNumber}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">ID: {customer._id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    {getLoginMethodIcons(customer)}
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium border ${
                      customer.isSubcribed
                        ? 'bg-green-100 text-green-800 border-green-800'
                        : 'bg-gray-100 text-gray-800 border-gray-800'
                    }`}>
                      {customer.isSubcribed ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm">
                      {customer.platform && (
                        <div className="text-gray-900">
                          <span className="font-medium">Platform:</span> {customer.platform}
                        </div>
                      )}
                      {customer.appVersion && (
                        <div className="text-gray-600">
                          <span className="font-medium">Version:</span> {customer.appVersion}
                        </div>
                      )}
                      {!customer.platform && !customer.appVersion && (
                        <span className="text-gray-400 text-xs">Not available</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(customer.lastlogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(customer)}
                        className="text-black hover:text-gray-700 border border-black p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canEdit && canDelete && (
                        <button
                          onClick={() => handleViewSubscriptions(customer)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="View Subscriptions"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => handleDelete(customer._id)}
                          disabled={deleteLoading === customer._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === customer._id ? (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center border-t border-black pt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length} results
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

      {viewingCustomer && (
        <ViewCustomer
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}

      {viewingSubscriptions && canEdit && canDelete && (
        <ViewSubscriptions
          customerId={viewingSubscriptions.id}
          customerName={viewingSubscriptions.name}
          onClose={() => setViewingSubscriptions(null)}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageCustomers;
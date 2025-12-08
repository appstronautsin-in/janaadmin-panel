import React, { useState, useEffect } from 'react';
import { X, Loader2, Search, Filter, DollarSign, Calendar, User, CreditCard, Smartphone, RefreshCcw } from 'lucide-react';
import api from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Transaction {
  _id: string;
  transactionType: 'credit' | 'debit' | 'trial';
  amount: number;
  paymentType: string;
  paymentId: string;
  purchaseFor?: string;
  user: {
    _id: string;
    phoneNumber: string;
    email: string;
    isEmailLogin: boolean;
    isPhoneLogin: boolean;
    isGoogleLogin: boolean;
    isFacebookLogin: boolean;
    isAppleLogin: boolean;
    isSubcribed: boolean;
    lastlogin: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  activity?: {
    platform: string;
    appVersion: string;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    lastActive: string;
    location?: {
      type: string;
      coordinates: number[];
    };
  } | null;
  createdAt: string;
  updatedAt: string;
  isRefunded?: boolean;
}

interface ManageTransactionsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ITEMS_PER_PAGE = 20;

const ManageTransactions: React.FC<ManageTransactionsProps> = ({ onClose, showAlert }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all');
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState<string[]>([]);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [refundConfirmation, setRefundConfirmation] = useState<string | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  
  // Check if user has ALL subscription permissions (super-admin level)
  const hasAllSubscriptionPermissions = 
    checkPermission('createSubscription') && 
    checkPermission('editSubscription') && 
    checkPermission('deleteSubscription');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    // Apply transaction type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === typeFilter);
    }

    // Apply payment type filter
    if (paymentTypeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentType === paymentTypeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        (transaction.paymentId || '').toLowerCase().includes(search) ||
        (transaction.user?.phoneNumber || '').includes(search) ||
        (transaction.user?.email || '').toLowerCase().includes(search) ||
        (transaction._id || '').toLowerCase().includes(search)
      );
    }

    setFilteredTransactions(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [transactions, searchTerm, typeFilter, paymentTypeFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/v1/customer/subscription/admin/transactions');
      const transactionsData = Array.isArray(response.data) ? response.data : (response.data.data || response.data.transactions || []);
      setTransactions(transactionsData);
      console.log(transactionsData);

      // Extract unique payment types for filter
      const paymentTypes = [...new Set(transactionsData.map((transaction: Transaction) => transaction.paymentType))];
      setAvailablePaymentTypes(paymentTypes);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showAlert('Failed to fetch transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!hasAllSubscriptionPermissions) {
      showAlert('You do not have permission to process refunds', 'error');
      return;
    }

    if (refundConfirmation !== paymentId) {
      setRefundConfirmation(paymentId);
      return;
    }

    setRefundLoading(paymentId);
    try {
      await api.post('/v1/customer/subscription/transactions/refund', { paymentId });
      
      // Update the local state to mark this transaction as refunded
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.paymentId === paymentId 
            ? { ...transaction, isRefunded: true }
            : transaction
        )
      );
      
      showAlert('Refund processed successfully', 'success');
      setRefundConfirmation(null);
    } catch (error) {
      console.error('Error processing refund:', error);
      showAlert('Failed to process refund', 'error');
    } finally {
      setRefundLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'credit' ? (
      <div className="flex items-center text-green-600">
        <DollarSign className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Credit</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600">
        <DollarSign className="h-4 w-4 mr-1" />
        <span className="text-xs font-medium">Debit</span>
      </div>
    );
  };

  const getPaymentTypeIcon = (paymentType: string) => {
    switch (paymentType.toLowerCase()) {
      case 'upi':
        return <Smartphone className="h-4 w-4 text-blue-600" />;
      case 'card':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      return transaction.transactionType === 'credit' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
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
          <DollarSign className="h-6 w-6 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Transaction Logs</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Summary Cards - Only visible for super-admin users */}
      {hasAllSubscriptionPermissions && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Amount</p>
                <p className="text-xl font-bold text-blue-900">{formatAmount(getTotalAmount())}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Credits</p>
                <p className="text-xl font-bold text-green-900">
                  {filteredTransactions.filter(t => t.transactionType === 'credit').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Total Debits</p>
                <p className="text-xl font-bold text-red-900">
                  {filteredTransactions.filter(t => t.transactionType === 'debit').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Transactions</p>
                <p className="text-xl font-bold text-purple-900">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by payment ID, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'credit' | 'debit')}
            className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Types</option>
            <option value="credit">Credit Only</option>
            <option value="debit">Debit Only</option>
          </select>
        </div>

        <div>
          <select
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="all">All Payment Types</option>
            {availablePaymentTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 flex items-center">
          Showing: {filteredTransactions.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Transaction Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Payment Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                Device & Platform
              </th>
              {hasAllSubscriptionPermissions && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {getCurrentPageData().map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    {getTransactionTypeIcon(transaction.transactionType)}
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        Transaction ID
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {transaction._id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  {transaction.user ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {transaction.user.phoneNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.user.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 text-xs font-medium border ${
                            transaction.user.isSubcribed
                              ? 'bg-green-100 text-green-800 border-green-800'
                              : 'bg-gray-100 text-gray-800 border-gray-800'
                          }`}>
                            {transaction.user.isSubcribed ? 'Subscribed' : 'Not Subscribed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No customer data</div>
                  )}
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    {getPaymentTypeIcon(transaction.paymentType)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.paymentType.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 font-mono break-all">
                        {transaction.paymentId.length > 20 
                          ? `${transaction.paymentId.substring(0, 20)}...`
                          : transaction.paymentId
                        }
                      </div>
                      {transaction.isRefunded && (
                        <div className="text-xs text-red-600 mt-1">
                          Refunded
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className={`text-lg font-bold ${
                    transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transactionType === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-r border-black">
                  {transaction.activity ? (
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">
                          {transaction.activity.userAgent || 'Unknown Device'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.activity.platform ? transaction.activity.platform.charAt(0).toUpperCase() + transaction.activity.platform.slice(1) : 'Unknown Platform'}
                        </div>
                        {transaction.activity.appVersion && (
                          <div className="text-xs text-gray-400">
                            v{transaction.activity.appVersion}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">No device info</div>
                  )}
                </td>
                {hasAllSubscriptionPermissions && (
                  <td className="px-6 py-4 text-center">
                    {transaction.transactionType === 'credit' && !transaction.isRefunded && (
                      <button
                        onClick={() => handleRefund(transaction.paymentId)}
                        disabled={refundLoading === transaction.paymentId}
                        className={`inline-flex items-center px-3 py-1 border ${
                          refundConfirmation === transaction.paymentId
                            ? 'border-red-600 text-red-600 hover:bg-red-50'
                            : 'border-black text-black hover:bg-gray-50'
                        } focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50`}
                      >
                        {refundLoading === transaction.paymentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-1" />
                            {refundConfirmation === transaction.paymentId ? 'Confirm Refund' : 'Refund'}
                          </>
                        )}
                      </button>
                    )}
                    {transaction.isRefunded && (
                      <span className="text-xs text-red-600 font-medium">
                        Refunded
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center border-t border-black pt-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} results
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

export default ManageTransactions;
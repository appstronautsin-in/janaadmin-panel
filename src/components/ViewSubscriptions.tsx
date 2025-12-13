import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, CheckCircle2, XCircle, CreditCard, Edit, Calendar, Package } from 'lucide-react';
import api from '../config/axios';

interface Subscription {
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
  customer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Package {
  _id: string;
  planName: string;
  price: number;
  validity: string;
  features: string[];
  ePaperAllowedInApp: boolean;
  ePaperAllowedInWeb: boolean;
  newsAllowedInApp: boolean;
  newsAllowedInWebsite: boolean;
}

interface ViewSubscriptionsProps {
  customerId: string;
  customerName?: string;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const PAYMENT_TYPES = ['upi', 'card', 'netbanking', 'cash'];

const ViewSubscriptions: React.FC<ViewSubscriptionsProps> = ({ customerId, customerName, onClose, showAlert }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    packageId: '',
    start: '',
    end: '',
    isActive: true
  });
  const [assignForm, setAssignForm] = useState({
    packageId: '',
    paymentType: 'upi',
    paymentId: '',
    amount: 0,
    endDate: ''
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [customerId]);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get(`/v1/customer/subscription/subscriptions/customer/${customerId}`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      showAlert('Failed to fetch subscription history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const response = await api.get('/v1/admin/subscription/package/subscription-packages');
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      showAlert('Failed to fetch subscription packages', 'error');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleShowAssignForm = async () => {
    await fetchPackages();
    setShowAssignForm(true);
  };

  const handlePackageSelect = (packageId: string) => {
    const selectedPackage = packages.find(pkg => pkg._id === packageId);
    
    // Auto-calculate end date based on package validity
    let calculatedEndDate = '';
    if (selectedPackage) {
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      if (selectedPackage.validity === 'Monthly') {
        // Add 1 month
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (selectedPackage.validity === 'Yearly') {
        // Add 1 year
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      calculatedEndDate = endDate.toISOString().split('T')[0];
    }
    
    setAssignForm(prev => ({
      ...prev,
      packageId,
      amount: selectedPackage?.price || 0,
      endDate: calculatedEndDate
    }));
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignLoading(true);

    const selectedPackage = packages.find(pkg => pkg._id === assignForm.packageId);
    if (!selectedPackage) {
      showAlert('Please select a package', 'error');
      return;
    }

    if (!assignForm.endDate) {
      showAlert('Please select an end date', 'error');
      return;
    }

    try {
      const payload = {
        customerId,
        packageId: assignForm.packageId,
        endDate: assignForm.endDate,
        paymentType: assignForm.paymentType,
        paymentId: assignForm.paymentId,
        amount: assignForm.amount
      };

      await api.post('/v1/customer/subscription/assignplanfromadmin', payload);
      showAlert('Subscription assigned successfully!', 'success');
      setShowAssignForm(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error assigning subscription:', error);
      showAlert('Failed to assign subscription', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    fetchPackages(); // Fetch packages when opening edit form
    setEditForm({
      packageId: subscription.package._id,
      start: new Date(subscription.start).toISOString().slice(0, 16),
      end: new Date(subscription.end).toISOString().slice(0, 16),
      isActive: subscription.isActive
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;

    setEditLoading(true);
    try {
      const payload: any = {};
      
      // Only include fields that have changed
      if (editForm.packageId !== editingSubscription.package._id) {
        payload.packageId = editForm.packageId;
      }
      
      if (new Date(editForm.start).toISOString() !== new Date(editingSubscription.start).toISOString()) {
        payload.start = new Date(editForm.start).toISOString();
      }
      
      if (new Date(editForm.end).toISOString() !== new Date(editingSubscription.end).toISOString()) {
        payload.end = new Date(editForm.end).toISOString();
      }
      
      if (editForm.isActive !== editingSubscription.isActive) {
        payload.isActive = editForm.isActive;
      }

      // Only send request if there are changes
      if (Object.keys(payload).length === 0) {
        showAlert('No changes detected', 'error');
        return;
      }

      await api.put(`/v1/customer/subscription/admin/subscriptions/${editingSubscription._id}`, payload);
      showAlert('Subscription updated successfully!', 'success');
      setEditingSubscription(null);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      showAlert('Failed to update subscription', 'error');
    } finally {
      setEditLoading(false);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
          <p className="mt-2 text-center text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (showAssignForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-black shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-black">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Subscription</h2>
              {customerName && (
                <p className="text-sm text-gray-600 mt-1">Customer: {customerName}</p>
              )}
            </div>
            <button
              onClick={() => setShowAssignForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loadingPackages ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
              <p className="mt-2 text-gray-600">Loading packages...</p>
            </div>
          ) : (
            <form onSubmit={handleAssignSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Package
                </label>
                <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto pr-2">
                  {packages.map((pkg) => (
                    <label
                      key={pkg._id}
                      className={`relative flex items-center p-4 border cursor-pointer transition-colors ${
                        assignForm.packageId === pkg._id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      <input
                        type="radio"
                        name="package"
                        value={pkg._id}
                        checked={assignForm.packageId === pkg._id}
                        onChange={() => handlePackageSelect(pkg._id)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{pkg.planName}</h3>
                        <p className="text-sm text-gray-500">{formatPrice(pkg.price)} • {pkg.validity}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {pkg.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          assignForm.packageId === pkg._id ? 'text-black' : 'text-gray-300'
                        }`}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  value={assignForm.endDate}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, endDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Type
                </label>
                <select
                  value={assignForm.paymentType}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {PAYMENT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Reference ID
                </label>
                <input
                  type="text"
                  required
                  value={assignForm.paymentId}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, paymentId: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder={assignForm.paymentType === 'upi' ? 'Enter UPI UTR number' : 'Enter payment reference number'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  required
                  value={assignForm.amount}
                  onChange={(e) => setAssignForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-black">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !assignForm.packageId}
                  className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                >
                  {assignLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Assign Subscription'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (editingSubscription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-black shadow-lg w-full max-w-2xl">
          <div className="flex justify-between items-center p-6 border-b border-black">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Subscription</h2>
              {customerName && (
                <p className="text-sm text-gray-600 mt-1">Customer: {customerName}</p>
              )}
            </div>
            <button
              onClick={() => setEditingSubscription(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package
              </label>
              {loadingPackages ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-black mr-2" />
                  <span className="text-sm text-gray-600">Loading packages...</span>
                </div>
              ) : (
                <select
                  value={editForm.packageId}
                  onChange={(e) => setEditForm(prev => ({ ...prev, packageId: e.target.value }))}
                  className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {packages.map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.planName} - {formatPrice(pkg.price)} ({pkg.validity})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editForm.start}
                  onChange={(e) => setEditForm(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editForm.end}
                  onChange={(e) => setEditForm(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="border-black text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-700">Active Subscription</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Uncheck to deactivate the subscription (soft cancel)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Edit Options:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Change package to upgrade/downgrade subscription</li>
                <li>• Extend end date to give more time</li>
                <li>• Adjust start date for admin corrections</li>
                <li>• Deactivate to soft cancel subscription</li>
                <li>• Reactivate expired subscriptions</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-black">
              <button
                type="button"
                onClick={() => setEditingSubscription(null)}
                className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
              >
                {editLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription History</h2>
            {customerName && (
              <p className="text-sm text-gray-600 mt-1">Customer: {customerName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {subscriptions.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-600">No subscription history found.</p>
              <button
                onClick={handleShowAssignForm}
                className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Assign Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={handleShowAssignForm}
                  className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Assign New Subscription
                </button>
              </div>

              {subscriptions.map((subscription) => (
                <div
                  key={subscription._id}
                  className="border border-black p-4 rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscription.package.planName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatPrice(subscription.package.price)} • {subscription.package.validity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditSubscription(subscription)}
                        className="flex items-center px-3 py-1 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.isActive ? (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {subscription.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date</p>
                      <p className="font-medium">{formatDate(subscription.start)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date</p>
                      <p className="font-medium">{formatDate(subscription.end)}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.package.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Access Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">E-Paper Access</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center">
                            {subscription.package.ePaperAllowedInApp ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-600">App Access</span>
                          </div>
                          <div className="flex items-center">
                            {subscription.package.ePaperAllowedInWeb ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-600">Web Access</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">News Access</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex items-center">
                            {subscription.package.newsAllowedInApp ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-600">App Access</span>
                          </div>
                          <div className="flex items-center">
                            {subscription.package.newsAllowedInWebsite ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            <span className="text-sm text-gray-600">Web Access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-black p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptions;
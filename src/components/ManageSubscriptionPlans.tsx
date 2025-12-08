import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X } from 'lucide-react';
import api from '../config/axios';
import EditSubscriptionPlan from './EditSubscriptionPlan';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface SubscriptionPlan {
  _id: string;
  planName: string;
  price: number;
  validity: 'Monthly' | 'Yearly';
  features: string[];
  ePaperAllowedInApp: boolean;
  ePaperAllowedInWeb: boolean;
  newsAllowedInApp: boolean;
  newsAllowedInWebsite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ManageSubscriptionPlansProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManageSubscriptionPlans: React.FC<ManageSubscriptionPlansProps> = ({ onClose, showAlert }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Get permissions
  const { checkPermission } = usePermissions();
  const canEdit = checkPermission('editSubscription');
  const canDelete = checkPermission('deleteSubscription');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/v1/admin/subscription/package/subscription-packages');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showAlert('Failed to fetch subscription plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      showAlert('You do not have permission to delete subscription plans', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }

    setDeleteLoading(id);
    try {
      await api.delete(`/v1/admin/subscription/package/${id}`);
      setPlans(plans.filter(plan => plan._id !== id));
      showAlert('Subscription plan deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      showAlert('Failed to delete subscription plan', 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (planId: string) => {
    if (!canEdit) {
      showAlert('You do not have permission to edit subscription plans', 'error');
      return;
    }
    setEditingPlanId(planId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-black shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Manage Subscription Plans</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-black">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black">
              {plans.map((plan) => (
                <tr key={plan._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm font-medium text-gray-900">
                      {plan.planName}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      {formatPrice(plan.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <span className="px-2 inline-flex text-xs leading-5 font-medium border border-black bg-gray-100 text-gray-800">
                      {plan.validity}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="text-sm text-gray-900">
                      <ul className="list-disc list-inside">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="truncate">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-r border-black">
                    <div className="space-y-1 text-sm text-gray-900">
                      <div>
                        E-Paper: {' '}
                        {[
                          plan.ePaperAllowedInApp && 'App',
                          plan.ePaperAllowedInWeb && 'Web'
                        ].filter(Boolean).join(', ') || 'None'}
                      </div>
                      <div>
                        News: {' '}
                        {[
                          plan.newsAllowedInApp && 'App',
                          plan.newsAllowedInWebsite && 'Web'
                        ].filter(Boolean).join(', ') || 'None'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-black">
                    {formatDate(plan.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(plan._id)}
                          className="text-black hover:text-gray-700 border border-black p-1"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(plan._id)}
                          disabled={deleteLoading === plan._id}
                          className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 p-1 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteLoading === plan._id ? (
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
      </div>

      {editingPlanId && (
        <EditSubscriptionPlan
          planId={editingPlanId}
          onClose={() => setEditingPlanId(null)}
          onSuccess={fetchPlans}
          showAlert={showAlert}
        />
      )}
    </>
  );
};

export default ManageSubscriptionPlans;
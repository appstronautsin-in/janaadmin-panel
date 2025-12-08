import React, { useState } from 'react';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import api from '../config/axios';

interface AddSubscriptionPlanProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const AddSubscriptionPlan: React.FC<AddSubscriptionPlanProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    ePaperAllowedInApp: true,
    ePaperAllowedInWeb: true,
    price: '',
    features: [''],
    validity: 'Monthly',
    newsAllowedInApp: true,
    newsAllowedInWebsite: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        features: formData.features.filter(feature => feature.trim() !== '')
      };

      await api.post('/v1/admin/subscription/package/add', payload);
      showAlert('Subscription plan created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      showAlert('Failed to create subscription plan. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  return (
    <div className="bg-white border border-black shadow-lg">
      <div className="flex justify-between items-center p-6 border-b border-black">
        <h2 className="text-2xl font-bold text-gray-900">Create Subscription Plan</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Plan Name
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.planName}
              onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Validity
            </label>
            <select
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.validity}
              onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={`Feature ${index + 1}`}
                  className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center justify-center px-4 py-2 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">E-Paper Access</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ePaperAllowedInApp}
                  onChange={(e) => setFormData(prev => ({ ...prev, ePaperAllowedInApp: e.target.checked }))}
                  className="border-black text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Allow in App</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ePaperAllowedInWeb}
                  onChange={(e) => setFormData(prev => ({ ...prev, ePaperAllowedInWeb: e.target.checked }))}
                  className="border-black text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Allow on Website</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">News Access</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.newsAllowedInApp}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsAllowedInApp: e.target.checked }))}
                  className="border-black text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Allow in App</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.newsAllowedInWebsite}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsAllowedInWebsite: e.target.checked }))}
                  className="border-black text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Allow on Website</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-black">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Plan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubscriptionPlan;
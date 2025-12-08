import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../config/axios';

interface Promotion {
  _id: string;
  backgroundColor: string;
  image?: string;
  title: string;
  content: string;
  terms: string;
  buttonText: string;
  FooterText: string;
  url?: string;
  path?: string;
  expiry: string;
  isWebsite: boolean;
  isAppPath: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditPromotionProps {
  promotion: Promotion;
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const EditPromotion: React.FC<EditPromotionProps> = ({ promotion, onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    backgroundColor: '',
    title: '',
    content: '',
    terms: '',
    buttonText: '',
    FooterText: '',
    url: '',
    path: '',
    expiry: '',
    isWebsite: false,
    isAppPath: false,
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (promotion) {
      setFormData({
        backgroundColor: promotion.backgroundColor || '000000',
        title: promotion.title || '',
        content: promotion.content || '',
        terms: promotion.terms || 'https://janathavani.com/terms',
        buttonText: promotion.buttonText || '',
        FooterText: promotion.FooterText || '',
        url: promotion.url || '',
        path: promotion.path || '',
        expiry: promotion.expiry ? new Date(promotion.expiry).toISOString().split('T')[0] : '',
        isWebsite: promotion.isWebsite || false,
        isAppPath: promotion.isAppPath || false,
        isActive: promotion.isActive ?? true
      });

      if (promotion.image) {
        setImagePreview(`https://laqsya.com/${promotion.image}`);
      }
    }
  }, [promotion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isWebsite && !formData.url) {
      showAlert('URL is required when Website is selected', 'error');
      return;
    }

    if (formData.isAppPath && !formData.path) {
      showAlert('Path is required when App Path is selected', 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('backgroundColor', formData.backgroundColor);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('terms', formData.terms);
      submitData.append('buttonText', formData.buttonText);
      submitData.append('FooterText', formData.FooterText);
      submitData.append('expiry', formData.expiry);
      submitData.append('isWebsite', String(formData.isWebsite));
      submitData.append('isAppPath', String(formData.isAppPath));
      submitData.append('isActive', String(formData.isActive));

      if (formData.isWebsite && formData.url) {
        submitData.append('url', formData.url);
      }

      if (formData.isAppPath && formData.path) {
        submitData.append('path', formData.path);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await api.patch(`/v1/promotions/${promotion._id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlert('Promotion updated successfully', 'success');
      onClose();
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      showAlert(error.response?.data?.error || 'Failed to update promotion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Edit Promotion</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={`#${formData.backgroundColor}`}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value.replace('#', '') })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value.replace('#', '') })}
                placeholder="000000"
                maxLength={6}
                className="flex-1 border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms URL
            </label>
            <input
              type="url"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Text
              </label>
              <input
                type="text"
                value={formData.FooterText}
                onChange={(e) => setFormData({ ...formData, FooterText: e.target.value })}
                className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isWebsite}
                onChange={(e) => setFormData({ ...formData, isWebsite: e.target.checked, isAppPath: e.target.checked ? false : formData.isAppPath })}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Website URL</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isAppPath}
                onChange={(e) => setFormData({ ...formData, isAppPath: e.target.checked, isWebsite: e.target.checked ? false : formData.isWebsite })}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">App Path</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {formData.isWebsite && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL *
              </label>
              <input
                type="url"
                required={formData.isWebsite}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}

          {formData.isAppPath && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Path *
              </label>
              <input
                type="text"
                required={formData.isAppPath}
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/subscriptions"
                className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
              className="w-full border border-black px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Promotion'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPromotion;

import React, { useState, useEffect } from 'react';
import { X, Loader2, Plus, Edit2, Trash2, Eye, ExternalLink, Smartphone, Calendar, Globe, Image as ImageIcon } from 'lucide-react';
import api from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import EditPromotion from './EditPromotion';

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

interface ManagePromotionsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const ManagePromotions: React.FC<ManagePromotionsProps> = ({ onClose, showAlert }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const { checkPermission } = usePermissions();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/v1/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      showAlert('Failed to fetch promotions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!checkPermission('deletePromotion')) {
      showAlert('You do not have permission to delete promotions', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      await api.delete(`/v1/promotions/${id}`);
      showAlert('Promotion deleted successfully', 'success');
      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      showAlert('Failed to delete promotion', 'error');
    }
  };

  const handleView = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPromotionType = (promotion: Promotion) => {
    if (promotion.isWebsite) return 'Website';
    if (promotion.isAppPath) return 'App Path';
    return 'Image Only';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] flex flex-col border border-black">
        <div className="flex justify-between items-center p-6 border-b border-black">
          <div>
            <h2 className="text-2xl font-bold">Manage Promotions</h2>
            <p className="text-sm text-gray-600 mt-1">Create and manage promotional content</p>
          </div>
          <div className="flex items-center gap-2">
            {checkPermission('createPromotion') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Promotion
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No promotions found</p>
              {checkPermission('createPromotion') && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-black text-white hover:bg-gray-800"
                >
                  Create Your First Promotion
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <div
                  key={promotion._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{ backgroundColor: `#${promotion.backgroundColor}` }}
                  >
                    {promotion.image ? (
                      <img
                        src={`https://laqsya.com/${promotion.image}`}
                        alt={promotion.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-white opacity-50" />
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{promotion.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        promotion.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{promotion.content}</p>

                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      {promotion.isWebsite && (
                        <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                          <Globe className="h-3 w-3" />
                          Website
                        </span>
                      )}
                      {promotion.isAppPath && (
                        <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
                          <Smartphone className="h-3 w-3" />
                          App
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3" />
                      Expires: {formatDate(promotion.expiry)}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(promotion)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {checkPermission('editPromotion') && (
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {checkPermission('deletePromotion') && (
                        <button
                          onClick={() => handleDelete(promotion._id)}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreatePromotionModal
          onClose={() => {
            setShowCreateModal(false);
            fetchPromotions();
          }}
          showAlert={showAlert}
        />
      )}

      {showViewModal && selectedPromotion && (
        <ViewPromotionModal
          promotion={selectedPromotion}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPromotion(null);
          }}
        />
      )}

      {showEditModal && selectedPromotion && (
        <EditPromotion
          promotion={selectedPromotion}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPromotion(null);
            fetchPromotions();
          }}
          showAlert={showAlert}
        />
      )}
    </div>
  );
};

interface CreatePromotionModalProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const CreatePromotionModal: React.FC<CreatePromotionModalProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    backgroundColor: '000000',
    title: '',
    content: '',
    terms: 'https://janathavani.com/terms',
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

      await api.post('/v1/promotions', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showAlert('Promotion created successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating promotion:', error);
      showAlert('Failed to create promotion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Create Promotion</h3>
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
              Image (Optional)
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
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Promotion
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ViewPromotionModalProps {
  promotion: Promotion;
  onClose: () => void;
}

const ViewPromotionModal: React.FC<ViewPromotionModalProps> = ({ promotion, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-black">
        <div className="sticky top-0 bg-white border-b border-black p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold">Promotion Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div
            className="h-48 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `#${promotion.backgroundColor}` }}
          >
            {promotion.image ? (
              <img
                src={`https://laqsya.com/${promotion.image}`}
                alt={promotion.title}
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <ImageIcon className="h-16 w-16 text-white opacity-50" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-lg font-semibold">{promotion.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  promotion.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {promotion.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Content</label>
            <p className="text-gray-900">{promotion.content}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Button Text</label>
              <p className="text-gray-900">{promotion.buttonText || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Footer Text</label>
              <p className="text-gray-900">{promotion.FooterText || '-'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Terms</label>
            <a
              href={promotion.terms}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {promotion.terms}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {promotion.isWebsite && promotion.url && (
            <div>
              <label className="text-sm font-medium text-gray-500">Website URL</label>
              <a
                href={promotion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {promotion.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {promotion.isAppPath && promotion.path && (
            <div>
              <label className="text-sm font-medium text-gray-500">App Path</label>
              <p className="text-gray-900 font-mono">{promotion.path}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Expiry Date</label>
              <p className="text-gray-900">
                {new Date(promotion.expiry).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">
                {new Date(promotion.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePromotions;

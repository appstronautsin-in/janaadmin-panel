import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, Search } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';

interface EditClassifiedAdProps {
  adId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Customer {
  _id: string;
  phoneNumber: string;
  email: string;
}

const EditClassifiedAd: React.FC<EditClassifiedAdProps> = ({ adId, onClose, onSuccess, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    phoneNumber: '',
    paymentId: '',
    from: '',
    to: '',
    estimatedPrice: 0,
    GstNumber: '',
    matter: '',
    paid: false,
    status: 'running' as 'submitted' | 'pending-review' | 'running' | 'closed',
    category: 'Others',
    isMapAvailable: false,
    isWebsiteAvailable: false,
    lattitude: '',
    longitude: '',
    websiteUrl: ''
  });

  useEffect(() => {
    fetchClassifiedAdData();
    fetchCustomers();
  }, [adId]);

  useEffect(() => {
    // Filter customers based on search term
    if (customerSearch) {
      const filtered = customers.filter(customer => 
        (customer.phoneNumber || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  useEffect(() => {
    // Calculate estimated price when dates change
    if (formData.from && formData.to) {
      const start = new Date(formData.from);
      const end = new Date(formData.to);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const price = days * 200; // 200 Rs per day
      setFormData(prev => ({ ...prev, estimatedPrice: price }));
    }
  }, [formData.from, formData.to]);

  const fetchClassifiedAdData = async () => {
    try {
      const response = await api.get(`/v1/classified-ads/${adId}`);
      const data = response.data;
      
      setFormData({
        title: data.title || '',
        customerId: data.customerId?._id || '',
        phoneNumber: data.phoneNumber || '',
        paymentId: data.paymentId || '',
        from: new Date(data.from).toISOString().split('T')[0],
        to: new Date(data.to).toISOString().split('T')[0],
        estimatedPrice: data.estimatedPrice || 0,
        GstNumber: data.GstNumber || '',
        matter: data.matter || '',
        paid: data.paid || false,
        status: data.status || 'running',
        category: data.category || 'Others',
        isMapAvailable: data.isMapAvailable || false,
        isWebsiteAvailable: data.isWebsiteAvailable || false,
        lattitude: data.lattitude || '',
        longitude: data.longitude || '',
        websiteUrl: data.websiteUrl || ''
      });

      setExistingImages(data.images || []);
    } catch (error) {
      console.error('Error fetching classified ad data:', error);
      showAlert('Failed to fetch classified ad data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/v1/customer/auth/all-customers');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showAlert('Failed to fetch customers', 'error');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerId: customer._id,
      phoneNumber: customer.phoneNumber || ''
    }));
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a regular object instead of FormData
      const payload: any = {
        title: formData.title,
        from: formData.from,
        to: formData.to,
        estimatedPrice: formData.estimatedPrice,
        matter: formData.matter,
        paid: formData.paid,
        status: formData.status
      };
      
      // Only add these fields if they have values
      if (formData.customerId) payload.customerId = formData.customerId;
      if (formData.phoneNumber) payload.phoneNumber = formData.phoneNumber;
      if (formData.paymentId) payload.paymentId = formData.paymentId;
      if (formData.GstNumber) payload.GstNumber = formData.GstNumber;

      // Add new fields
      payload.category = formData.category;
      payload.isMapAvailable = formData.isMapAvailable;
      payload.isWebsiteAvailable = formData.isWebsiteAvailable;

      if (formData.isMapAvailable && formData.lattitude && formData.longitude) {
        payload.lattitude = formData.lattitude;
        payload.longitude = formData.longitude;
      }

      if (formData.isWebsiteAvailable && formData.websiteUrl) {
        payload.websiteUrl = formData.websiteUrl;
      }

      // Add existing images
      payload.existingImages = existingImages;
      
      // If we have new images, we need to use FormData
      if (selectedImages.length > 0) {
        const formPayload = new FormData();
        
        // Add all the regular fields to FormData
        Object.keys(payload).forEach(key => {
          if (key === 'existingImages') {
            formPayload.append(key, JSON.stringify(payload[key]));
          } else {
            formPayload.append(key, String(payload[key]));
          }
        });
        
        // Add the new images
        selectedImages.forEach(image => {
          formPayload.append('images', image);
        });
        
        await api.put(`/v1/classified-ads/${adId}`, formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // No new images, use regular JSON
        await api.put(`/v1/classified-ads/${adId}`, payload);
      }

      showAlert('Classified Ad updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating classified ad:', error);
      showAlert('Failed to update classified ad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      showAlert('Some files were skipped. Please select only image files.', 'error');
    }
    
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (initialLoading || loadingCustomers) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto" />
          <p className="mt-2 text-center text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  const selectedCustomer = customers.find(c => c._id === formData.customerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Classified Ad</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter advertisement title"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer (Optional)</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by phone or email (optional)..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="pl-10 w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-black shadow-lg max-h-60 overflow-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer._id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="font-medium">{customer.email || 'No email'}</div>
                          <div className="text-sm text-gray-600">{customer.phoneNumber || 'No phone'}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No customers found</div>
                    )}
                  </div>
                )}
              </div>
              {selectedCustomer && (
                <div className="mt-2 p-2 bg-gray-50 border border-black">
                  <div className="font-medium">{selectedCustomer.email || 'No email'}</div>
                  <div className="text-sm text-gray-600">{selectedCustomer.phoneNumber || 'No phone'}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                type="tel"
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment ID (Optional)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.paymentId}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentId: e.target.value }))}
                placeholder="Enter payment ID (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">GST Number (Optional)</label>
              <input
                type="text"
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.GstNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, GstNumber: e.target.value }))}
                placeholder="Enter GST number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                required
                min={formData.from}
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Price</label>
              <input
                type="number"
                required
                readOnly
                className="mt-1 block w-full border border-black px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.estimatedPrice}
              />
              <p className="mt-1 text-sm text-gray-500">₹200 per day</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="submitted">Submitted</option>
                <option value="pending-review">Pending Review</option>
                <option value="running">Running</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Status</label>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="border-black text-black focus:ring-black"
                    checked={formData.paid}
                    onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                  />
                  <span className="ml-2">Mark as Paid</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Wanted">Wanted</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Rent">Rent</option>
                <option value="Automobiles">Automobiles</option>
                <option value="Business & Services">Business & Services</option>
                <option value="Education">Education</option>
                <option value="Sports">Sports</option>
                <option value="Matrimonial">Matrimonial</option>
                <option value="Events & Entertainments">Events & Entertainments</option>
                <option value="Miscellaneous">Miscellaneous</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 border-t border-black pt-6">
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.isMapAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMapAvailable: e.target.checked }))}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Add Map Location</span>
              </label>
            </div>

            {formData.isMapAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    value={formData.lattitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, lattitude: e.target.value }))}
                    placeholder="e.g., 12.9716"
                    required={formData.isMapAvailable}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 77.5946"
                    required={formData.isMapAvailable}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.isWebsiteAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isWebsiteAvailable: e.target.checked }))}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Add Website URL</span>
              </label>
            </div>

            {formData.isWebsiteAvailable && (
              <div className="pl-6">
                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                <input
                  type="url"
                  className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://example.com"
                  required={formData.isWebsiteAvailable}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Matter</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.matter}
              onChange={(e) => setFormData(prev => ({ ...prev, matter: e.target.value }))}
              placeholder="Enter advertisement content"
            />
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`${IMAGE_BASE_URL}/${image}`}
                      alt={`Existing image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images (Optional)</label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                    <span>Upload new images (optional)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClassifiedAd;
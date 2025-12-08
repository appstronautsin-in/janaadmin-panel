import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, Search } from 'lucide-react';
import api from '../config/axios';

interface CreateClassifiedAdProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Customer {
  _id: string;
  phoneNumber: string;
  email: string;
}

const CreateClassifiedAd: React.FC<CreateClassifiedAdProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
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
    fetchCustomers();
  }, []);

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
      const formPayload = new FormData();
      
      // Only append customerId if it's provided
      if (formData.customerId) {
        formPayload.append('customerId', formData.customerId);
      }
      
      // Only append phoneNumber if it's provided
      if (formData.phoneNumber) {
        formPayload.append('phoneNumber', formData.phoneNumber);
      }
      
      // Only append paymentId if it's provided
      if (formData.paymentId) {
        formPayload.append('paymentId', formData.paymentId);
      }

      // Append other required fields
      formPayload.append('title', formData.title);
      formPayload.append('from', formData.from);
      formPayload.append('to', formData.to);
      formPayload.append('estimatedPrice', formData.estimatedPrice.toString());
      formPayload.append('matter', formData.matter);
      formPayload.append('paid', formData.paid.toString());
      formPayload.append('status', formData.status);
      
      // Append optional GST number if provided
      if (formData.GstNumber) {
        formPayload.append('GstNumber', formData.GstNumber);
      }

      // Append new fields
      formPayload.append('category', formData.category);
      formPayload.append('isMapAvailable', formData.isMapAvailable.toString());
      formPayload.append('isWebsiteAvailable', formData.isWebsiteAvailable.toString());

      if (formData.isMapAvailable && formData.lattitude && formData.longitude) {
        formPayload.append('lattitude', formData.lattitude);
        formPayload.append('longitude', formData.longitude);
      }

      if (formData.isWebsiteAvailable && formData.websiteUrl) {
        formPayload.append('websiteUrl', formData.websiteUrl);
      }

      selectedImages.forEach(image => {
        formPayload.append('images', image);
      });

      await api.post('/v1/classified-ads', formPayload);
      showAlert('Classified Ad created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating classified ad:', error);
      showAlert('Failed to create classified ad', 'error');
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

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  if (loadingCustomers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const selectedCustomer = customers.find(c => c._id === formData.customerId);

  return (
    <div className="bg-white border border-black shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Classified Ad</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              min={minDate}
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
              min={formData.from || minDate}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                  <span>Upload images (optional)</span>
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
                    alt={`Selected image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
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
              'Create Ad'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClassifiedAd;
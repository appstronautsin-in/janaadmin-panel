import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, Plus, Trash2, Database } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';

interface EditDamInformationProps {
  damInfoId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Point {
  key: string;
  value: string;
  unit: string;
}

const EditDamInformation: React.FC<EditDamInformationProps> = ({ damInfoId, onClose, onSuccess, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [formData, setFormData] = useState({
    title: ''
  });
  const [points, setPoints] = useState<Point[]>([
    { key: '', value: '', unit: '' }
  ]);

  useEffect(() => {
    fetchDamInformationData();
  }, [damInfoId]);

  const fetchDamInformationData = async () => {
    try {
      const response = await api.get(`/v1/dam-information/${damInfoId}`);
      const data = response.data;
      
      setFormData({
        title: data.title
      });

      // Convert the points data to the format we need
      const formattedPoints = data.points.map((point: any) => ({
        key: point.key,
        value: point.value,
        unit: point.unit
      }));

      setPoints(formattedPoints.length > 0 ? formattedPoints : [{ key: '', value: '', unit: '' }]);
      setCurrentImage(data.image || '');
    } catch (error) {
      console.error('Error fetching dam information data:', error);
      showAlert('Failed to fetch dam information data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that we have at least one complete point
    const validPoints = points.filter(point => 
      point.key.trim() !== '' && point.value.trim() !== '' && point.unit.trim() !== ''
    );

    if (validPoints.length === 0) {
      showAlert('Please add at least one complete data point', 'error');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('points', JSON.stringify(validPoints));
      
      if (selectedImage) {
        formPayload.append('image', selectedImage);
      }

      await api.put(`/v1/dam-information/${damInfoId}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Dam information updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating dam information:', error);
      showAlert('Failed to update dam information. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      } else {
        showAlert('Please select an image file', 'error');
        e.target.value = '';
      }
    }
  };

  const addPoint = () => {
    setPoints(prev => [...prev, { key: '', value: '', unit: '' }]);
  };

  const removePoint = (index: number) => {
    if (points.length > 1) {
      setPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePoint = (index: number, field: keyof Point, value: string) => {
    setPoints(prev => prev.map((point, i) => 
      i === index ? { ...point, [field]: value } : point
    ));
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Database className="h-6 w-6 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Edit Chutuku</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter dam information title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Data Points
              </label>
              <button
                type="button"
                onClick={addPoint}
                className="flex items-center px-3 py-1 border border-black text-black hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </button>
            </div>

            <div className="space-y-4">
              {points.map((point, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Key/Description
                    </label>
                    <input
                      type="text"
                      value={point.key}
                      onChange={(e) => updatePoint(index, 'key', e.target.value)}
                      placeholder="e.g., ಇಂದಿನ ಮಟ್ಟ"
                      className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Value
                    </label>
                    <input
                      type="text"
                      value={point.value}
                      onChange={(e) => updatePoint(index, 'value', e.target.value)}
                      placeholder="e.g., 142"
                      className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={point.unit}
                        onChange={(e) => updatePoint(index, 'unit', e.target.value)}
                        placeholder="e.g., ಅಡಿ"
                        className="w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                    {points.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePoint(index)}
                        className="p-2 text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800"
                        title="Remove point"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {selectedImage ? (
                  <div>
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="New preview"
                      className="mx-auto h-32 w-48 object-cover border border-black"
                    />
                    <p className="text-sm text-green-600 font-medium mt-2">
                      New image selected: {selectedImage.name}
                    </p>
                  </div>
                ) : currentImage ? (
                  <>
                    <img
                      src={`${IMAGE_BASE_URL}/${currentImage}`}
                      alt="Current"
                      className="mx-auto h-32 w-48 object-cover border border-black"
                    />
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mt-4" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload new image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload an image</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Example Data Points
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Key:</strong> ಭೂಮಿಯ ವಾಯುಮಂಡಲದಲ್ಲಿ ನೈಟ್ರೋಜನ್ ಪ್ರಮಾಣ, <strong>Value:</strong> 78, <strong>Unit:</strong> %</p>
              <p><strong>Key:</strong> ಇಂದಿನ ಮಟ್ಟ, <strong>Value:</strong> 142, <strong>Unit:</strong> ಅಡಿ</p>
              <p><strong>Key:</strong> ಒಳ ಹರಿವು, <strong>Value:</strong> 2419, <strong>Unit:</strong> ಕೂಸೆಕ್ಸ್</p>
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
              className="flex items-center justify-center px-4 py-2 border border-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
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

export default EditDamInformation;
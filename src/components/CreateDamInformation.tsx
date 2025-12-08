import React, { useState, useRef } from 'react';
import { Loader2, X, Upload, Plus, Trash2 } from 'lucide-react';
import api from '../config/axios';

interface CreateDamInformationProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Point {
  key: string;
  value: string;
  unit: string;
}

const CreateDamInformation: React.FC<CreateDamInformationProps> = ({ onClose, showAlert }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: ''
  });
  const [points, setPoints] = useState<Point[]>([
    { key: '', value: '', unit: '' }
  ]);

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

    if (!selectedImage) {
      showAlert('Please select an image', 'error');
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('points', JSON.stringify(validPoints));
      formPayload.append('image', selectedImage);

      await api.post('/v1/dam-information/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Dam information created successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error creating dam information:', error);
      showAlert('Failed to create dam information. Please try again.', 'error');
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

  return (
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create Chutuku</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
              {selectedImage && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mx-auto h-32 w-48 object-cover border border-black"
                  />
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {selectedImage.name}
                  </p>
                </div>
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
              'Create Dam Information'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDamInformation;
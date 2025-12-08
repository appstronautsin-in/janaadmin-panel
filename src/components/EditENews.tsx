import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload } from 'lucide-react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';

interface EditENewsProps {
  newsId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

const EditENews: React.FC<EditENewsProps> = ({ newsId, onClose, onSuccess, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [currentPdf, setCurrentPdf] = useState<string>('');
  const [currentThumbnail, setCurrentThumbnail] = useState<string>('');
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    newsPaperDate: ''
  });

  useEffect(() => {
    fetchENewsData();
  }, [newsId]);

  const fetchENewsData = async () => {
    try {
      const response = await api.get(`/v1/enews/${newsId}`);
      const data = response.data;
      
      setFormData({
        title: data.title,
        newsPaperDate: new Date(data.newsPaperDate).toISOString().split('T')[0]
      });

      setCurrentPdf(data.pdf);
      setCurrentThumbnail(data.thumbnail);
    } catch (error) {
      console.error('Error fetching E-News data:', error);
      showAlert('Failed to fetch E-News data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('newsPaperDate', formData.newsPaperDate);
      
      if (selectedPdfFile) {
        formPayload.append('pdf', selectedPdfFile);
      }
      
      if (selectedThumbnail) {
        formPayload.append('thumbnail', selectedThumbnail);
      }

      await api.put(`/v1/enews/${newsId}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('E-News updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating E-News:', error);
      showAlert('Failed to update E-News. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedPdfFile(file);
      } else {
        showAlert('Please select a PDF file', 'error');
        e.target.value = '';
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedThumbnail(file);
      } else {
        showAlert('Please select an image file', 'error');
        e.target.value = '';
      }
    }
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
      <div className="bg-white border border-black shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-black">
          <h2 className="text-2xl font-bold text-gray-900">Edit E-News</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Newspaper Date
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.newsPaperDate}
              onChange={(e) => setFormData(prev => ({ ...prev, newsPaperDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => pdfInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {selectedPdfFile ? (
                  <div>
                    <p className="text-sm text-green-600">
                      Selected new PDF: {selectedPdfFile.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload new PDF</span>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf"
                          className="sr-only"
                          onChange={handlePdfChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Current PDF: {currentPdf.split('/').pop()}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {selectedThumbnail ? (
                  <div>
                    <img
                      src={URL.createObjectURL(selectedThumbnail)}
                      alt="New thumbnail preview"
                      className="mx-auto h-32 w-32 object-cover border border-black"
                    />
                    <p className="text-sm text-green-600 mt-2">
                      Selected new thumbnail: {selectedThumbnail.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={`${IMAGE_BASE_URL}/${currentThumbnail}`}
                      alt="Current thumbnail"
                      className="mx-auto h-32 w-32 object-cover border border-black"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mt-4" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                        <span>Upload new thumbnail</span>
                        <input
                          ref={thumbnailInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                    </div>
                  </>
                )}
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditENews;
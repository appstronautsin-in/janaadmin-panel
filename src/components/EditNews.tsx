import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Loader2, X, Eye, Hash, Upload, Video } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import ViewNews from './ViewNews';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import ImageResize from 'quill-image-resize-module-react';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

ReactQuill.Quill.register('modules/imageResize', ImageResize);

interface EditNewsProps {
  newsId: string;
  onClose: () => void;
  onSuccess: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  parent: string;
}

interface Author {
  _id: string;
  fullname: string;
  email: string;
}

const EditNews: React.FC<EditNewsProps> = ({ newsId, onClose, onSuccess, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Image cropping states
  const [cropMode, setCropMode] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imageToCropIndex, setImageToCropIndex] = useState<number | null>(null);
  const [isExistingImage, setIsExistingImage] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageScale, setImageScale] = useState<number>(1);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasBlur, setCanvasBlur] = useState<number>(0);
  const [canvasColor, setCanvasColor] = useState<string>('#ffffff');
  
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    secondaryCategory: '',
    authors: [] as string[],
    title: '',
    subTitle: '',
    tags: [] as string[],
    status: 'Draft',
    shareable: true,
    isAllowedScreenshot: false,
    isPremiuimContent: false,
    createdDate: '',
    createdTime: '',
    viewsVisible: false,
    visibleComment: false,
    viwsCountToVisible: 0
  });

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'table': [] }],
        ['clean']
      ]
    },
    imageResize: {
      parchment: ReactQuill.Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize']
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'link', 'image',
    'blockquote', 'code-block',
    'table'
  ];

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchAuthors()]);
      await fetchNewsData();
    };
    loadData();
  }, [newsId]);

  useEffect(() => {
    console.log('Form data secondaryCategory changed:', formData.secondaryCategory);
    console.log('Available categories:', categories);
    console.log('Categories IDs:', categories.map(c => c._id));
  }, [formData.secondaryCategory, categories]);

  const fetchNewsData = async () => {
    try {
      const response = await api.get(`/v1/news/${newsId}`);
      const newsData = response.data;
      
      // Convert createdAt to local date and time
      const createdAt = new Date(newsData.createdAt);
      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, '0');
      const day = String(createdAt.getDate()).padStart(2, '0');
      const createdDate = `${year}-${month}-${day}`;
      const createdTime = createdAt.toTimeString().slice(0, 5);

      const secondaryCategoryId = newsData.secondaryCategory?._id || newsData.secondarycategory?._id || '';

      console.log('News Data:', {
        secondaryCategory: newsData.secondaryCategory,
        secondarycategory: newsData.secondarycategory,
        extractedId: secondaryCategoryId,
        allNewsData: newsData
      });

      const newFormData = {
        category: newsData.category?._id || '',
        subCategory: newsData.subCategory?._id || '',
        secondaryCategory: secondaryCategoryId,
        authors: newsData.authors.map((author: any) => author._id),
        title: newsData.title,
        subTitle: newsData.subTitle,
        tags: newsData.tags,
        status: newsData.status,
        shareable: newsData.shareable,
        isAllowedScreenshot: newsData.isAllowedScreenshot,
        isPremiuimContent: newsData.isPremiuimContent,
        createdDate,
        createdTime,
        viewsVisible: newsData.viewsVisible || false,
        visibleComment: newsData.visibleComment || false,
        viwsCountToVisible: newsData.viwsCountToVisible || 0
      };

      console.log('Setting form data:', newFormData);
      setFormData(newFormData);

      setContent(newsData.content);
      setExistingImages(newsData.image || []);
      setExistingVideos(newsData.videos || []);

      if (newsData.category?._id) {
        await fetchSubCategories(newsData.category._id);
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      showAlert('Failed to fetch news data', 'error');
      onClose();
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/category/all');
      console.log('Fetched categories:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showAlert('Failed to fetch categories', 'error');
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await api.get('/v1/admin/auth/all');
      setAuthors(response.data);
    } catch (error) {
      console.error('Error fetching authors:', error);
      showAlert('Failed to fetch authors', 'error');
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await api.get(`/v1/sub-category/parent/${categoryId}`);
      setSubCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching sub-categories:', error);
      if (error.response?.status === 404) {
        setSubCategories([]);
      } else {
        showAlert('Failed to fetch sub-categories', 'error');
      }
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));
    if (categoryId) {
      await fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedVideos(prev => [...prev, ...files]);
  };

  const removeExistingVideo = (index: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      input.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Image cropping functions
  const onSelectImageForCrop = async (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      const imageUrl = `${IMAGE_BASE_URL}/${existingImages[index]}`;

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageToCrop(blobUrl);
        setImageToCropIndex(index);
        setIsExistingImage(true);
        setCropMode(true);
      } catch (error) {
        console.error('Error loading image for crop:', error);
        showAlert('Failed to load image for cropping', 'error');
      }
    } else {
      const imageFile = selectedImages[index];
      const imageUrl = URL.createObjectURL(imageFile);
      setImageToCrop(imageUrl);
      setImageToCropIndex(index);
      setIsExistingImage(false);
      setCropMode(true);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
    drawCanvas();
  };

  const getCanvasDimensions = () => {
    const aspectRatioDimensions = {
      '1:1': { width: 600, height: 600 },
      '4:3': { width: 600, height: 450 },
      '3:2': { width: 600, height: 400 },
      '16:9': { width: 600, height: 338 },
      '9:16': { width: 338, height: 600 },
      '3:4': { width: 450, height: 600 },
      '2:3': { width: 400, height: 600 }
    };
    return aspectRatioDimensions[aspectRatio as keyof typeof aspectRatioDimensions] || { width: 600, height: 338 };
  };

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dimensions = getCanvasDimensions();
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Fill canvas with selected background color
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = imageRef.current;
    const scaledWidth = img.width * imageScale;
    const scaledHeight = img.height * imageScale;

    // If blur is enabled, draw blurred background first
    if (canvasBlur > 0) {
      ctx.filter = `blur(${canvasBlur}px)`;

      // Draw the image scaled to fill the entire canvas as background
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;

      let bgWidth, bgHeight, bgX, bgY;
      if (canvasAspect > imgAspect) {
        bgWidth = canvas.width;
        bgHeight = canvas.width / imgAspect;
        bgX = 0;
        bgY = (canvas.height - bgHeight) / 2;
      } else {
        bgHeight = canvas.height;
        bgWidth = canvas.height * imgAspect;
        bgX = (canvas.width - bgWidth) / 2;
        bgY = 0;
      }

      ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);
      ctx.filter = 'none';
    }

    // Draw main image with scale and position (without blur)
    ctx.drawImage(
      img,
      imagePosition.x,
      imagePosition.y,
      scaledWidth,
      scaledHeight
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setImagePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageScale(parseFloat(e.target.value));
  };

  useEffect(() => {
    if (cropMode && imageRef.current) {
      drawCanvas();
    }
  }, [imageScale, imagePosition, aspectRatio, cropMode, canvasBlur, canvasColor]);

  useEffect(() => {
    if (cropMode && imageRef.current) {
      // Reset position and scale when aspect ratio changes
      const dimensions = getCanvasDimensions();
      const img = imageRef.current;
      const scaleX = dimensions.width / img.width;
      const scaleY = dimensions.height / img.height;
      const initialScale = Math.max(scaleX, scaleY);
      setImageScale(initialScale);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [aspectRatio, cropMode]);

  const cancelCrop = () => {
    setCropMode(false);
    setImageToCrop(null);
    setImageToCropIndex(null);
    setIsExistingImage(false);
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setCanvasBlur(0);
  };

  const applyCrop = async () => {
    if (!canvasRef.current || !imageRef.current || imageToCropIndex === null) {
      showAlert('Unable to apply crop. Please try again.', 'error');
      return;
    }

    const canvas = canvasRef.current;
    const outputCanvas = document.createElement('canvas');
    const ctx = outputCanvas.getContext('2d');

    if (!ctx) {
      showAlert('Failed to create canvas context', 'error');
      return;
    }

    // Get final dimensions based on aspect ratio
    const aspectRatioDimensions = {
      '1:1': { width: 1080, height: 1080 },
      '4:3': { width: 1200, height: 900 },
      '3:2': { width: 1200, height: 800 },
      '16:9': { width: 1200, height: 675 },
      '9:16': { width: 607, height: 1080 },
      '3:4': { width: 810, height: 1080 },
      '2:3': { width: 720, height: 1080 }
    };

    const finalDimensions = aspectRatioDimensions[aspectRatio as keyof typeof aspectRatioDimensions] || { width: 1200, height: 675 };
    outputCanvas.width = finalDimensions.width;
    outputCanvas.height = finalDimensions.height;

    // Fill canvas with selected background color
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Calculate scale ratio from preview canvas to final canvas
    const canvasDimensions = getCanvasDimensions();
    const scaleRatio = finalDimensions.width / canvasDimensions.width;

    const img = imageRef.current;

    // If blur is enabled, draw blurred background first
    if (canvasBlur > 0) {
      ctx.filter = `blur(${canvasBlur}px)`;

      // Draw the image scaled to fill the entire canvas as background
      const canvasAspect = outputCanvas.width / outputCanvas.height;
      const imgAspect = img.width / img.height;

      let bgWidth, bgHeight, bgX, bgY;
      if (canvasAspect > imgAspect) {
        bgWidth = outputCanvas.width;
        bgHeight = outputCanvas.width / imgAspect;
        bgX = 0;
        bgY = (outputCanvas.height - bgHeight) / 2;
      } else {
        bgHeight = outputCanvas.height;
        bgWidth = outputCanvas.height * imgAspect;
        bgX = (outputCanvas.width - bgWidth) / 2;
        bgY = 0;
      }

      ctx.drawImage(img, bgX, bgY, bgWidth, bgHeight);
      ctx.filter = 'none';
    }

    // Draw the main image with the same relative position and scale
    const scaledWidth = img.width * imageScale * scaleRatio;
    const scaledHeight = img.height * imageScale * scaleRatio;
    const scaledX = imagePosition.x * scaleRatio;
    const scaledY = imagePosition.y * scaleRatio;

    ctx.drawImage(
      img,
      scaledX,
      scaledY,
      scaledWidth,
      scaledHeight
    );

    // Convert canvas to blob
    outputCanvas.toBlob((blob) => {
      if (!blob) {
        showAlert('Failed to create image blob', 'error');
        return;
      }

      if (!isExistingImage) {
        const originalFile = selectedImages[imageToCropIndex];
        const croppedFile = new File([blob], originalFile.name, {
          type: 'image/jpeg',
          lastModified: new Date().getTime()
        });

        setSelectedImages(prev => {
          const newImages = [...prev];
          newImages[imageToCropIndex] = croppedFile;
          return newImages;
        });
      } else {
        const croppedFile = new File([blob], `fitted_image_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: new Date().getTime()
        });

        setSelectedImages(prev => [...prev, croppedFile]);
        setExistingImages(prev => prev.filter((_, i) => i !== imageToCropIndex));
      }

      setCropMode(false);
      setImageToCrop(null);
      setImageToCropIndex(null);
      setIsExistingImage(false);
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setCanvasBlur(0);

      showAlert('Image fitted to canvas successfully', 'success');
    }, 'image/jpeg', 0.92);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      
      // Combine date and time into a single timestamp
      const createdAt = new Date(`${formData.createdDate}T${formData.createdTime}`);
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'createdDate' && key !== 'createdTime') {
          if (Array.isArray(value)) {
            formPayload.append(key, JSON.stringify(value));
          } else {
            formPayload.append(key, String(value));
          }
        }
      });

      // Append createdAt timestamp
      formPayload.append('createdAt', createdAt.toISOString());

      // Append content
      formPayload.append('content', content);

      // Append existing images
      formPayload.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      selectedImages.forEach(image => {
        formPayload.append('images', image);
      });

      // Append existing videos (backend will keep these)
      formPayload.append('existingVideos', JSON.stringify(existingVideos));

      // Append new videos
      selectedVideos.forEach(video => {
        formPayload.append('videos', video);
      });

      await api.put(`/v1/news/${newsId}`, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await logActivity(
        ActivityActions.EDIT,
        ActivitySections.NEWS,
        `Updated news: ${formData.title}`,
        {
          newsId,
          newsTitle: formData.title,
          category: formData.category,
          status: formData.status
        }
      );

      showAlert('News updated successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating news:', error);
      showAlert('Failed to update news. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (cropMode && imageToCrop) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
          <h2 className="text-xl font-bold mb-4">Fit Image to Canvas</h2>

          <div className="mb-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Aspect Ratio:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="text-sm border border-black px-3 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="1:1">Square (1:1)</option>
                  <option value="4:3">Landscape (4:3)</option>
                  <option value="3:2">Landscape (3:2)</option>
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="3:4">Portrait (3:4)</option>
                  <option value="2:3">Portrait (2:3)</option>
                  <option value="9:16">Story (9:16)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
              <label className="text-sm font-medium text-gray-700">Scale:</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.01"
                value={imageScale}
                onChange={handleScaleChange}
                className="w-48"
              />
              <span className="text-sm text-gray-600 w-12">{(imageScale * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
              <label className="text-sm font-medium text-gray-700">Canvas Blur:</label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={canvasBlur}
                onChange={(e) => setCanvasBlur(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-sm text-gray-600 w-12">{canvasBlur}px</span>
              <span className="text-xs text-gray-500">(optional background blur)</span>
            </div>

            <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
              <label className="text-sm font-medium text-gray-700">Canvas Color:</label>
              <input
                type="color"
                value={canvasColor}
                onChange={(e) => setCanvasColor(e.target.value)}
                className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{canvasColor}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCanvasColor('#ffffff')}
                  className="w-6 h-6 rounded border-2 border-gray-300 bg-white"
                  title="White"
                />
                <button
                  type="button"
                  onClick={() => setCanvasColor('#e5e7eb')}
                  className="w-6 h-6 rounded border-2 border-gray-300 bg-gray-200"
                  title="Light Gray"
                />
                <button
                  type="button"
                  onClick={() => setCanvasColor('#9ca3af')}
                  className="w-6 h-6 rounded border-2 border-gray-300 bg-gray-400"
                  title="Gray"
                />
                <button
                  type="button"
                  onClick={() => setCanvasColor('#000000')}
                  className="w-6 h-6 rounded border-2 border-gray-300 bg-black"
                  title="Black"
                />
              </div>
            </div>

            <div className="flex justify-center items-center bg-gray-100 p-4 rounded-lg">
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="border-2 border-gray-400 cursor-move shadow-lg"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Drag to position
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Drag to position the image within the canvas
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={cancelCrop}
              className="px-4 py-2 border border-black text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCrop}
              className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800"
            >
              Save Image
            </button>
          </div>

          <img
            src={imageToCrop}
            alt="Source"
            onLoad={onImageLoad}
            crossOrigin="anonymous"
            className="hidden"
            ref={(img) => {
              if (img) imageRef.current = img;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-black shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-black px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit News</h2>
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
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.category}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sub Category</label>
              <select
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.subCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
              >
                <option value="">Select Sub Category</option>
                {subCategories.map(subCategory => (
                  <option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Secondary Category</label>
              <select
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.secondaryCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, secondaryCategory: e.target.value }))}
              >
                <option value="">Select Secondary Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Authors</label>
              <select
                multiple
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black min-h-[120px]"
                value={formData.authors}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, authors: values }));
                }}
              >
                {authors.map(author => (
                  <option key={author._id} value={author._id}>
                    {author.fullname} ({author.email})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple authors</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Created Date</label>
              <input
                type="date"
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.createdDate}
                onChange={(e) => setFormData(prev => ({ ...prev, createdDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Created Time</label>
              <input
                type="time"
                required
                className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.createdTime}
                onChange={(e) => setFormData(prev => ({ ...prev, createdTime: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.subTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subTitle: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <div className="border border-black [&_.ql-toolbar]:border-black [&_.ql-container]:border-black [&_.ql-editor]:min-h-[300px]">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center">
              <Hash className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Type tag and press Enter"
                className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                onKeyDown={handleTagInput}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${IMAGE_BASE_URL}/${img}`}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectImageForCrop(index, true);
                      }}
                      className="bg-white text-black p-1 rounded-full mx-1"
                      title="Fit to canvas"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingImage(index);
                      }}
                      className="bg-white text-red-600 p-1 rounded-full mx-1"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => imageInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                    <span>Upload images</span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
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
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectImageForCrop(index);
                            }}
                            className="bg-white text-black p-1 rounded-full mx-1"
                            title="Fit to canvas"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="3" y1="9" x2="21" y2="9"></line>
                              <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSelectedImage(index);
                            }}
                            className="bg-white text-red-600 p-1 rounded-full mx-1"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Videos</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {existingVideos.map((video, index) => (
                <div key={index} className="relative group">
                  <video
                    src={`${IMAGE_BASE_URL}/${video}`}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingVideo(index)}
                    className="absolute top-2 right-2 bg-white text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove video"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Add New Videos</label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => videoInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                    <span>Upload videos (max 3)</span>
                    <input
                      ref={videoInputRef}
                      type="file"
                      multiple
                      accept="video/*"
                      className="sr-only"
                      onChange={handleVideoChange}
                    />
                  </label>
                </div>
                {selectedVideos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedVideos.map((file, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedVideo(index)}
                          className="absolute top-2 right-2 bg-white text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove video"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.shareable}
                  onChange={(e) => setFormData(prev => ({ ...prev, shareable: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-600">Allow Sharing</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.isPremiuimContent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPremiuimContent: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-600">is Premiuim Content</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.isAllowedScreenshot}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAllowedScreenshot: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-600">Allow Comments</span>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.viewsVisible}
                  onChange={(e) => setFormData(prev => ({ ...prev, viewsVisible: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-600">Views Visible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="border-black text-black focus:ring-black"
                  checked={formData.visibleComment}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibleComment: e.target.checked }))}
                />
                <span className="ml-2 text-sm text-gray-600">Visible Comment</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Views Count To Visible</label>
              <input
                type="number"
                min="0"
                className="mt-1 block w-full md:w-64 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
                value={formData.viwsCountToVisible}
                onChange={(e) => setFormData(prev => ({ ...prev, viwsCountToVisible: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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

export default EditNews;
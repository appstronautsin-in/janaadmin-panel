import React, { useState, useRef, useEffect } from 'react';
import { Loader2, X, Upload, Hash, FolderOpen } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../config/axios';
import NewsSuccessPopup from './NewsSuccessPopup';
import ImageResize from 'quill-image-resize-module-react';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';
import AlbumPicker from './AlbumPicker';

ReactQuill.Quill.register('modules/imageResize', ImageResize);

interface CreateNewsProps {
  onClose: () => void;
  showAlert: (message: string, type: 'success' | 'error') => void;
}

type Status = 'Draft' | 'Approved' | 'Scheduled' | 'Published' | 'Rejected';

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

const CreateNews: React.FC<CreateNewsProps> = ({ onClose, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [selectedPassportPhotos, setSelectedPassportPhotos] = useState<File[]>([]);
  const [createdNewsId, setCreatedNewsId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const passportPhotoInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [showImageAlbumPicker, setShowImageAlbumPicker] = useState(false);
  const [showVideoAlbumPicker, setShowVideoAlbumPicker] = useState(false);

  // Image cropping states
  const [cropMode, setCropMode] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [imageToCropIndex, setImageToCropIndex] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageScale, setImageScale] = useState<number>(1);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasBlur, setCanvasBlur] = useState<number>(0);
  
  const getInitialDateTime = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours === 0) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        date: tomorrow.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
      };
    }

    return {
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
    };
  };

  const initialDateTime = getInitialDateTime();

  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    authors: [] as string[],
    title: '',
    subTitle: '',
    tags: [] as string[],
    status: 'Published' as Status,
    shareable: true,
    isAllowedScreenshot: true,
    isPremiuimContent: false,
    addedBy: localStorage.getItem('userId') || '',
    publishDate: initialDateTime.date,
    publishTime: initialDateTime.time,
    scheduleDate: '',
    scheduleTime: '',
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
    fetchCategories();
    fetchAuthors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/category/all');
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

      const janathavaniAuthor = response.data.find(
        (author: Author) => author.email === 'janatavani@gmail.com'
      );
      if (janathavaniAuthor) {
        setFormData(prev => ({
          ...prev,
          authors: [janathavaniAuthor._id]
        }));
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      showAlert('Failed to fetch authors', 'error');
    }
  };

  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await api.get(`/v1/sub-category/parent/${categoryId}`);
      setSubCategories(response.data);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      showAlert('Failed to fetch sub-categories', 'error');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));
    if (categoryId) {
      fetchSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
  };

  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check if selected category should skip resizing
          const selectedCategory = categories.find(cat => cat._id === formData.category);
          const shouldSkipResize = selectedCategory?.name === 'ಸಂಕ್ಷಿಪ್ತ' || selectedCategory?.name === 'ಓದುಗರ ಪತ್ರ' || selectedCategory?.name === 'ನಿಧನ' ||selectedCategory?.name === 'ಸುದ್ದಿಗಳು' ||selectedCategory?.name === 'ಸುದ್ದಿ ವೈವಿಧ್ಯ' ||selectedCategory?.name === 'ಲೇಖನ / ಕವನ'|| selectedCategory?.name === 'ರಾಜ್ಯ / ರಾಷ್ಟ್ರ'|| selectedCategory?.name === 'ಅಂತಾರಾಷ್ಟ್ರೀಯ'|| selectedCategory?.name === 'ರಾಜಕೀಯ' || selectedCategory?.name === 'ಚಿತ್ರದಲ್ಲಿ ಸುದ್ದಿ';

          if (shouldSkipResize) {
            // Return original file without resizing
            resolve(file);
            return;
          }

          // Get dimensions based on aspect ratio
          const aspectRatioDimensions = {
            '1:1': { width: 1080, height: 1080 },
            '4:3': { width: 1200, height: 900 },
            '3:2': { width: 1200, height: 800 },
            '16:9': { width: 1200, height: 675 },
            '9:16': { width: 607, height: 1080 },
            '3:4': { width: 810, height: 1080 },
            '2:3': { width: 720, height: 1080 }
          };

          const dimensions = aspectRatioDimensions[aspectRatio as keyof typeof aspectRatioDimensions] || { width: 1200, height: 630 };
          const canvas = document.createElement('canvas');
          canvas.width = dimensions.width;
          canvas.height = dimensions.height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            // If canvas context fails, return original file
            resolve(file);
            return;
          }

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, dimensions.width, dimensions.height);

          const imgAspect = img.width / img.height;
          const targetAspect = dimensions.width / dimensions.height;

          let drawWidth, drawHeight, offsetX, offsetY;

          if (imgAspect > targetAspect) {
            drawHeight = dimensions.height;
            drawWidth = img.width * (dimensions.height / img.height);
            offsetX = (dimensions.width - drawWidth) / 2;
            offsetY = 0;
          } else {
            drawWidth = dimensions.width;
            drawHeight = img.height * (dimensions.width / img.width);
            offsetX = 0;
            offsetY = (dimensions.height - drawHeight) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              // If blob creation fails, return original file
              resolve(file);
            }
          }, 'image/jpeg', 0.92);
        };
        img.onerror = () => {
          // If image loading fails, return original file
          resolve(file);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        // If file reading fails, return original file
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      showAlert('Some files were skipped. Please select only image files.', 'error');
    }

    try {
      const resizedFiles = await Promise.all(validFiles.map(file => resizeImage(file)));
      setSelectedImages(prev => [...prev, ...resizedFiles]);
    } catch (error) {
      console.error('Error resizing images:', error);
      showAlert('Failed to resize images', 'error');
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (validFiles.length !== files.length) {
      showAlert('Some files were skipped. Please select only video files.', 'error');
    }
    
    // Check file size (limit to 100MB per video)
    const validSizedFiles = validFiles.filter(file => {
      if (file.size > 100 * 1024 * 1024) {
        showAlert(`Video "${file.name}" exceeds 100MB limit`, 'error');
        return false;
      }
      return true;
    });
    
    setSelectedVideos(prev => [...prev, ...validSizedFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removePassportPhoto = (index: number) => {
    setSelectedPassportPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const processPassportPhoto = (file: File): Promise<File> => {
    // No processing - just return the original file
    return Promise.resolve(file);
  };

  const handlePassportPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      showAlert('Some files were skipped. Please select only image files.', 'error');
    }

    try {
      const processedFiles = await Promise.all(validFiles.map(file => processPassportPhoto(file)));
      setSelectedPassportPhotos(prev => [...prev, ...processedFiles]);
      showAlert('Passport photo(s) processed successfully', 'success');
    } catch (error) {
      console.error('Error processing passport photos:', error);
      showAlert('Failed to process passport photos', 'error');
    }
  };

  const handleAlbumImagesSelected = async (files: File[]) => {
    try {
      const resizedFiles = await Promise.all(files.map(file => resizeImage(file)));
      setSelectedImages(prev => [...prev, ...resizedFiles]);
      showAlert(`${files.length} image(s) added from album`, 'success');
    } catch (error) {
      console.error('Error processing album images:', error);
      showAlert('Failed to process album images', 'error');
    }
  };

  const handleAlbumVideosSelected = (files: File[]) => {
    const validSizedFiles = files.filter(file => {
      if (file.size > 100 * 1024 * 1024) {
        showAlert(`Video "${file.name}" exceeds 100MB limit`, 'error');
        return false;
      }
      return true;
    });
    setSelectedVideos(prev => [...prev, ...validSizedFiles]);
    if (validSizedFiles.length > 0) {
      showAlert(`${validSizedFiles.length} video(s) added from album`, 'success');
    }
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

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      status: (name === 'scheduleDate' || name === 'scheduleTime') && value ? 'Scheduled' : prev.status
    }));
  };

  // Image cropping functions
  const onSelectImageForCrop = (index: number) => {
    const imageFile = selectedImages[index];
    const imageUrl = URL.createObjectURL(imageFile);
    setImageToCrop(imageUrl);
    setImageToCropIndex(index);
    setCropMode(true);
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

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
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

      // Reset filter for main image
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
  }, [imageScale, imagePosition, aspectRatio, cropMode, canvasBlur]);

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
    setImageScale(1);
    setImagePosition({ x: 0, y: 0 });
    setCanvasBlur(0);
  };

  const applyCrop = async () => {
    if (!canvasRef.current || !imageRef.current || imageToCropIndex === null) return;

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

    // Fill with white background
    ctx.fillStyle = '#ffffff';
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

      // Reset filter for main image
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

      // Create a new file from the blob
      const originalFile = selectedImages[imageToCropIndex];
      const croppedFile = new File([blob], originalFile.name, {
        type: 'image/jpeg',
        lastModified: new Date().getTime()
      });

      // Replace the original image with the cropped one
      setSelectedImages(prev => {
        const newImages = [...prev];
        newImages[imageToCropIndex] = croppedFile;
        return newImages;
      });

      // Exit crop mode
      setCropMode(false);
      setImageToCrop(null);
      setImageToCropIndex(null);
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
      
      // Combine date and time into a single timestamp for publish date
      const publishDateTime = new Date(`${formData.publishDate}T${formData.publishTime}`);
      const createdAt = publishDateTime.toISOString();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'publishDate' && key !== 'publishTime') {
          if (Array.isArray(value)) {
            formPayload.append(key, JSON.stringify(value));
          } else {
            formPayload.append(key, String(value));
          }
        }
      });

      formPayload.append('createdAt', createdAt);
      formPayload.append('content', content);

      // If schedule date and time are set, combine them into a single timestamp
    if (formData.scheduleDate && formData.scheduleTime) {
  const istDate = new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00+05:30`);
  const utcISOString = istDate.toISOString(); // backend expects UTC
  formPayload.append('scheduleDate', utcISOString);
  formPayload.append('scheduleTime', formData.scheduleTime); // optional but helps backend
  formPayload.set('status', 'Scheduled'); // ensure only one "status" key
}


      // Append images
      selectedImages.forEach(image => {
        formPayload.append('images', image);
      });

      // Append passport photos (these go in images too but are already processed)
      selectedPassportPhotos.forEach(photo => {
        formPayload.append('images', photo);
      });

      // Append videos
      selectedVideos.forEach(video => {
        formPayload.append('videos', video);
      });

      const response = await api.post('/v1/news', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setCreatedNewsId(response.data._id);

      // Log activity
      await logActivity(
        ActivityActions.CREATE,
        ActivitySections.NEWS,
        `Created news article: ${formData.headline}`,
        {
          newsId: response.data._id,
          headline: formData.headline,
          status: formData.status,
          category: formData.category
        }
      );
    } catch (error) {
      console.error('Error creating news:', error);
      showAlert('Failed to create news. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (createdNewsId) {
    return (
      <NewsSuccessPopup
        newsId={createdNewsId}
        onClose={onClose}
      />
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

              <div className="flex items-center space-x-3">
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
                  Drag to position • Scroll to zoom
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Use the slider to resize the image and drag to position it within the canvas
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
    <div className="bg-white border border-black shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create News</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              value={formData.scheduleDate ? 'Scheduled' : formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
              disabled={!!formData.scheduleDate}
            >
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Publish Date</label>
            <input
              type="date"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.publishDate}
              onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Publish Time</label>
            <input
              type="time"
              required
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.publishTime}
              onChange={(e) => setFormData(prev => ({ ...prev, publishTime: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">
              Schedule Date (Optional)
            </label>
            <input
              type="date"
              id="scheduleDate"
              name="scheduleDate"
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.scheduleDate}
              onChange={handleScheduleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">
              Schedule Time
            </label>
            <input
              type="time"
              id="scheduleTime"
              name="scheduleTime"
              className="mt-1 block w-full border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.scheduleTime}
              onChange={handleScheduleChange}
              disabled={!formData.scheduleDate}
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

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-gray-600">Aspect Ratio:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="text-xs border border-black px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-black"
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
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => imageInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
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
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageAlbumPicker(true)}
                className="flex justify-center items-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="space-y-1 text-center">
                  <FolderOpen className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-black hover:text-gray-700">Pick from Album</span>
                  </div>
                </div>
              </button>
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
                        onClick={() => onSelectImageForCrop(index)}
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
                        onClick={() => removeImage(index)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Videos</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => videoInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                      <span>Upload videos</span>
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
                  <p className="text-xs text-gray-500">
                    MP4, WebM up to 100MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoAlbumPicker(true)}
                className="flex justify-center items-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="space-y-1 text-center">
                  <FolderOpen className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-black hover:text-gray-700">Pick from Album</span>
                  </div>
                </div>
              </button>
            </div>
            {selectedVideos.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVideos.map((file, index) => (
                  <div key={index} className="relative group border border-black p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <video
                      className="mt-2 w-full h-48 object-cover"
                      src={URL.createObjectURL(file)}
                      controls
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passport Photo</label>
            <p className="text-xs text-gray-500 mb-2">Images will be automatically fitted to 9:16 canvas at 50% scale</p>
            <div
              className="flex justify-center px-6 pt-5 pb-6 border border-black hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              onClick={() => passportPhotoInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer font-medium text-black hover:text-gray-700">
                    <span>Upload passport photo</span>
                    <input
                      ref={passportPhotoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePassportPhotoChange}
                    />
                  </label>
                </div>
              </div>
            </div>
            {selectedPassportPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedPassportPhotos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Passport photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-blue-500"
                    />
                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      9:16 @ 50%
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => removePassportPhoto(index)}
                        className="bg-white text-red-600 p-2 rounded-full"
                        title="Remove passport photo"
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
              <span className="ml-2 text-sm text-gray-600">Premiuim Content</span>
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
              'Create News'
            )}
          </button>
        </div>
      </form>

      {showImageAlbumPicker && (
        <AlbumPicker
          onClose={() => setShowImageAlbumPicker(false)}
          onSelectFiles={handleAlbumImagesSelected}
          showAlert={showAlert}
          allowMultiple={true}
          fileType="image"
        />
      )}

      {showVideoAlbumPicker && (
        <AlbumPicker
          onClose={() => setShowVideoAlbumPicker(false)}
          onSelectFiles={handleAlbumVideosSelected}
          showAlert={showAlert}
          allowMultiple={true}
          fileType="video"
        />
      )}
    </div>
  );
};

export default CreateNews;
import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { IMAGE_BASE_URL } from '../config/constants';
import { GripVertical, Loader2, Filter, ImageIcon, RefreshCw } from 'lucide-react';

interface Author {
  _id: string;
  fullname: string;
  position: string;
}

interface Category {
  _id: string;
  name: string;
}

interface NewsItem {
  _id: string;
  title: string;
  subTitle: string;
  category: Category | null;
  authors: Author[];
  image: string[];
  index: number;
  createdAt: string;
  status: string;
}

interface GroupedNews {
  [categoryName: string]: NewsItem[];
}

interface Settings {
  _id?: string;
  suddiBigDesign?: boolean;
  antharashtriyaBigDesign?: boolean;
  rajakiyaBigDesign?: boolean;
  suddiVaividyaBigDesign?: boolean;
  rajyaRashtraBigDesign?: boolean;
}

const AlignNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [draggedItem, setDraggedItem] = useState<NewsItem | null>(null);
  const [draggedOverCategory, setDraggedOverCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [settings, setSettings] = useState<Settings | null>(null);

  const categorySettingsMap: { [key: string]: keyof Settings } = {
    'ಸುದ್ದಿಗಳು': 'suddiBigDesign',
    'ಅಂತಾರಾಷ್ಟ್ರೀಯ': 'antharashtriyaBigDesign',
    'ರಾಜಕೀಯ': 'rajakiyaBigDesign',
    'ಸುದ್ದಿ ವೈವಿಧ್ಯ': 'suddiVaividyaBigDesign',
    'ರಾಜ್ಯ / ರಾಷ್ಟ್ರ': 'rajyaRashtraBigDesign',
  };

  useEffect(() => {
    fetchNews();
    fetchSettings();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/v1/app/settings');
      setSettings({
        _id: response.data._id,
        suddiBigDesign: response.data.suddiBigDesign,
        antharashtriyaBigDesign: response.data.antharashtriyaBigDesign,
        rajakiyaBigDesign: response.data.rajakiyaBigDesign,
        suddiVaividyaBigDesign: response.data.suddiVaividyaBigDesign,
        rajyaRashtraBigDesign: response.data.rajyaRashtraBigDesign,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleCategoryDesign = async (settingKey: keyof Settings) => {
    if (!settings || !settings._id) return;

    const newValue = !settings[settingKey];
    const oldSettings = { ...settings };

    try {
      setSettings({ ...settings, [settingKey]: newValue });

      const response = await api.put(`/v1/app/settings/${settings._id}`, {
        [settingKey]: newValue,
      });

      if (response.data && response.data[settingKey] !== undefined) {
        setSettings({ ...settings, [settingKey]: response.data[settingKey] });
      }
    } catch (error: any) {
      console.error('Error updating setting:', error);
      alert(`Failed to update setting: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setSettings(oldSettings);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/v1/news');
      setNews(response.data);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const groupNewsByCategory = (): GroupedNews => {
    const grouped: GroupedNews = {};

    news.forEach((item) => {
      const categoryName = item.category?.name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });

    Object.keys(grouped).forEach((categoryName) => {
      grouped[categoryName].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    });

    return grouped;
  };

  const isBigImagePosition = (index: number, isBigDesign: boolean) => {
    const position = index + 1;

    if (isBigDesign) {
      return position % 2 === 1;
    } else {
      return (position - 1) % 3 === 0;
    }
  };

  const updateNewsIndex = async (newsId: string, newIndex: number) => {
    try {
      await api.put(`/v1/news/${newsId}/index`, {
        index: newIndex
      });
    } catch (error) {
      console.error('Error updating news index:', error);
      throw error;
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: NewsItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (categoryName: string) => {
    setDraggedOverCategory(categoryName);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetItem: NewsItem, categoryName: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem._id === targetItem._id) {
      setDraggedItem(null);
      setDraggedOverCategory(null);
      return;
    }

    const categoryNews = groupedNews[categoryName];
    if (!categoryNews) return;

    const draggedIndex = categoryNews.findIndex(item => item._id === draggedItem._id);
    const targetIndex = categoryNews.findIndex(item => item._id === targetItem._id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDraggedOverCategory(null);
      return;
    }

    setUpdating(true);

    try {
      const updatedCategoryNews = [...categoryNews];
      updatedCategoryNews.splice(draggedIndex, 1);
      updatedCategoryNews.splice(targetIndex, 0, draggedItem);

      const updatePromises = updatedCategoryNews.map((item, index) =>
        updateNewsIndex(item._id, index + 1)
      );

      await Promise.all(updatePromises);

      await fetchNews();
    } catch (error) {
      console.error('Error reordering news:', error);
    } finally {
      setUpdating(false);
      setDraggedItem(null);
      setDraggedOverCategory(null);
    }
  };

  const groupedNews = groupNewsByCategory();
  const categories = Object.keys(groupedNews).sort();

  const filteredGroupedNews = selectedCategory === 'all'
    ? groupedNews
    : { [selectedCategory]: groupedNews[selectedCategory] };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Align News</h1>
        <p className="text-gray-600 mt-1">Drag and drop news items to reorder within each category</p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} ({groupedNews[category].length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {selectedCategory !== 'all' && categorySettingsMap[selectedCategory] && settings && (
        <div className="mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Category Design for: {selectedCategory}
            </h3>
            <div className="flex items-center gap-6">
              <button
                onClick={() => toggleCategoryDesign(categorySettingsMap[selectedCategory])}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  settings[categorySettingsMap[selectedCategory]]
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <img src="/categorydesigns/1.png" alt="Modern Design" className="w-12 h-12 object-contain" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Modern Design</div>
                  <div className="text-xs text-gray-600">Odd positions (1,3,5...)</div>
                </div>
                {settings[categorySettingsMap[selectedCategory]] && (
                  <div className="ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>

              <button
                onClick={() => toggleCategoryDesign(categorySettingsMap[selectedCategory])}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all hover:shadow-md ${
                  !settings[categorySettingsMap[selectedCategory]]
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                <img src="/categorydesigns/2.png" alt="Default Design" className="w-12 h-12 object-contain" />
                <div className="text-left">
                  <div className="font-semibold text-gray-800">Default Design</div>
                  <div className="text-xs text-gray-600">Positions 1,4,7...</div>
                </div>
                {!settings[categorySettingsMap[selectedCategory]] && (
                  <div className="ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    ✓
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {updating && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Updating order...</span>
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(filteredGroupedNews).sort().map((categoryName) => (
          <div key={categoryName} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">{categoryName}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredGroupedNews[categoryName].length} {filteredGroupedNews[categoryName].length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="p-4 space-y-2">
              {filteredGroupedNews[categoryName].map((item, index) => {
                const settingKey = categorySettingsMap[categoryName];
                const isBigDesign = settingKey && settings?.[settingKey];
                const shouldBeBlue = isBigDesign !== undefined && isBigImagePosition(index, isBigDesign);

                return (
                  <div
                    key={item._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(categoryName)}
                    onDrop={(e) => handleDrop(e, item, categoryName)}
                    className={`
                      flex items-center gap-4 p-4 border rounded-lg cursor-move
                      transition-all duration-200 hover:shadow-md hover:border-gray-400
                      ${shouldBeBlue ? 'bg-blue-50' : 'bg-white'}
                      ${draggedItem?._id === item._id ? 'opacity-50' : ''}
                      ${draggedOverCategory === categoryName && draggedItem?._id !== item._id ? 'border-blue-400' : 'border-gray-200'}
                    `}
                  >
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">{index + 1}</span>
                    </div>
                  </div>

                  {item.image && item.image.length > 0 && (
                    <img
                      src={`${IMAGE_BASE_URL}/${item.image[0]}`}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {item.subTitle}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        Index: {item.index ?? 'N/A'}
                      </span>
                      <span>{item.status}</span>
                      {item.authors && item.authors.length > 0 && (
                        <span>By: {item.authors[0].fullname}</span>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(filteredGroupedNews).length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No news items found {selectedCategory !== 'all' && `in category "${selectedCategory}"`}</p>
        </div>
      )}
    </div>
  );
};

export default AlignNews;

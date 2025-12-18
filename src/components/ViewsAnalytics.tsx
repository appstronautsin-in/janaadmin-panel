import React, { useState, useEffect } from 'react';
import { Loader2, Eye, Filter, Phone, MessageCircle, Globe, MapPin, Search, RefreshCw, FileText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../config/axios';

interface ViewsAnalyticsProps {
  showAlert: (message: string, type: 'success' | 'error') => void;
}

interface Category {
  _id: string;
  name: string;
}

interface NewsItem {
  _id: string;
  title: string;
  views: number;
  category: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

interface ClassifiedAdItem {
  _id: string;
  title: string;
  phoneNumber: string;
  views: number;
  category: string;
  whatsappClicked: number;
  phoneClicked: number;
  websiteClicked: number;
  locationClicked: number;
  createdAt: string;
}

interface EPaperViewItem {
  _id: string;
  customerId: {
    _id: string;
    email: string;
  } | string;
  sessionTime: number;
  pageNumber: number;
  ePaper: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ViewsAnalytics: React.FC<ViewsAnalyticsProps> = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'classified' | 'epaper'>('news');
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [classifiedData, setClassifiedData] = useState<ClassifiedAdItem[]>([]);
  const [epaperData, setEpaperData] = useState<EPaperViewItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [epaperDateFilter, setEpaperDateFilter] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [classifiedCategories] = useState<string[]>([
    'Wanted',
    'Real Estate',
    'Rent',
    'Automobiles',
    'Business & Services',
    'Education',
    'Sports',
    'Matrimonial',
    'Events & Entertainments',
    'Miscellaneous',
    'Others'
  ]);

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNewsData();
    } else if (activeTab === 'classified') {
      fetchClassifiedData();
    } else if (activeTab === 'epaper') {
      fetchEpaperData();
    }
  }, [activeTab, selectedCategory, phoneSearch, customerSearch, dateFilter, epaperDateFilter]);

  const fetchNewsData = async () => {
    setLoading(true);
    setCategoryLoading(true);
    try {
      const response = await api.get('/v1/news');
      const allNews = response.data;

      const uniqueCategories = Array.from(
        new Map(
          allNews
            .filter((news: NewsItem) => news.category)
            .map((news: NewsItem) => [news.category._id, news.category])
        ).values()
      ) as Category[];

      setCategories(uniqueCategories);

      let filteredNews = allNews;
      if (selectedCategory !== 'all') {
        filteredNews = allNews.filter((news: NewsItem) =>
          news.category?._id === selectedCategory
        );
      }

      const sortedNews = filteredNews.sort((a: NewsItem, b: NewsItem) => b.views - a.views);
      setNewsData(sortedNews);
    } catch (error) {
      console.error('Error fetching news data:', error);
      showAlert('Failed to fetch news data', 'error');
    } finally {
      setLoading(false);
      setCategoryLoading(false);
    }
  };

  const fetchClassifiedData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/classified-ads');
      let filteredAds = response.data;

      if (selectedCategory !== 'all') {
        filteredAds = filteredAds.filter((ad: ClassifiedAdItem) =>
          ad.category === selectedCategory
        );
      }

      if (phoneSearch.trim()) {
        filteredAds = filteredAds.filter((ad: ClassifiedAdItem) =>
          ad.phoneNumber && ad.phoneNumber.includes(phoneSearch.trim())
        );
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        filteredAds = filteredAds.filter((ad: ClassifiedAdItem) => {
          const adDate = new Date(ad.createdAt);
          const adDateOnly = new Date(adDate.getFullYear(), adDate.getMonth(), adDate.getDate());

          if (dateFilter === 'today') {
            return adDateOnly.getTime() === today.getTime();
          } else if (dateFilter === 'yesterday') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return adDateOnly.getTime() === yesterday.getTime();
          } else if (dateFilter === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return adDateOnly >= weekAgo;
          } else if (dateFilter === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return adDateOnly >= monthAgo;
          }
          return true;
        });
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const sortedAds = filteredAds.sort((a: ClassifiedAdItem, b: ClassifiedAdItem) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        const aDateOnly = new Date(aDate.getFullYear(), aDate.getMonth(), aDate.getDate());
        const bDateOnly = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());

        const aIsToday = aDateOnly.getTime() === today.getTime();
        const bIsToday = bDateOnly.getTime() === today.getTime();

        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;

        return (b.views || 0) - (a.views || 0);
      });
      setClassifiedData(sortedAds);
    } catch (error) {
      console.error('Error fetching classified ads data:', error);
      showAlert('Failed to fetch classified ads data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEpaperData = async () => {
    setLoading(true);
    try {
      let url = '/v1/epaper-views/';
      if (epaperDateFilter) {
        url = `/v1/epaper-views/by-date/${epaperDateFilter}`;
      }

      const response = await api.get(url);
      let data = epaperDateFilter ? response.data.data : response.data;

      if (customerSearch.trim()) {
        data = data.filter((item: EPaperViewItem) => {
          const email = typeof item.customerId === 'object' ? item.customerId.email : '';
          return email.toLowerCase().includes(customerSearch.trim().toLowerCase());
        });
      }

      setEpaperData(data || []);
    } catch (error) {
      console.error('Error fetching epaper data:', error);
      showAlert('Failed to fetch epaper data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTotalViews = () => {
    if (activeTab === 'news') {
      return newsData.reduce((sum, item) => sum + item.views, 0);
    } else if (activeTab === 'classified') {
      return classifiedData.reduce((sum, item) => sum + (item.views || 0), 0);
    } else {
      return epaperData.length;
    }
  };

  const getAverageViews = () => {
    const total = getTotalViews();
    const count = activeTab === 'news' ? newsData.length : activeTab === 'classified' ? classifiedData.length : epaperData.length;
    return count > 0 ? (total / count).toFixed(2) : '0';
  };

  const getEpaperPageViews = () => {
    const pageViews: { [key: number]: number } = {};
    epaperData.forEach(item => {
      pageViews[item.pageNumber] = (pageViews[item.pageNumber] || 0) + 1;
    });
    return Object.entries(pageViews)
      .map(([page, views]) => ({ page: `Page ${page}`, views }))
      .sort((a, b) => parseInt(a.page.split(' ')[1]) - parseInt(b.page.split(' ')[1]));
  };

  const getEpaperTitles = () => {
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);

    const filteredData = epaperData.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= fiveDaysAgo;
    });

    const titleViews: { [key: string]: number } = {};
    filteredData.forEach(item => {
      const title = item.ePaper.title;
      titleViews[title] = (titleViews[title] || 0) + 1;
    });
    return Object.entries(titleViews)
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views);
  };

  const getTotalSessionTime = () => {
    return epaperData.reduce((sum, item) => sum + item.sessionTime, 0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'news') {
        await fetchNewsData();
      } else if (activeTab === 'classified') {
        await fetchClassifiedData();
      } else if (activeTab === 'epaper') {
        await fetchEpaperData();
      }
      showAlert('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showAlert('Failed to refresh data', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6 border-b border-black bg-white flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Views Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Track views for news, classified ads, and e-papers</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex border-b border-black bg-white">
        <button
          onClick={() => {
            setActiveTab('news');
            setSelectedCategory('all');
            setPhoneSearch('');
            setCustomerSearch('');
            setDateFilter('today');
          }}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'news'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          News
        </button>
        <button
          onClick={() => {
            setActiveTab('classified');
            setSelectedCategory('all');
            setPhoneSearch('');
            setCustomerSearch('');
            setDateFilter('today');
          }}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'classified'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Classified Ads
        </button>
        <button
          onClick={() => {
            setActiveTab('epaper');
            setSelectedCategory('all');
            setPhoneSearch('');
            setCustomerSearch('');
            setDateFilter('today');
            const today = new Date();
            setEpaperDateFilter(today.toISOString().split('T')[0]);
          }}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'epaper'
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          E-Paper Views
        </button>
      </div>

      <div className="p-6 border-b border-black bg-white space-y-4">
        {activeTab !== 'epaper' && (
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black min-w-[200px]"
              disabled={categoryLoading && activeTab === 'news'}
            >
              <option value="all">All Categories</option>
              {activeTab === 'news' ? (
                categoryLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No categories found</option>
                )
              ) : (
                classifiedCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {activeTab === 'classified' && (
          <>
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Search by Phone:</label>
              <input
                type="text"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                placeholder="Enter phone number..."
                className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              {phoneSearch && (
                <button
                  onClick={() => setPhoneSearch('')}
                  className="px-3 py-2 text-sm border border-black text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black min-w-[200px]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'epaper' && (
          <>
            <div className="flex items-center gap-4">
              <Search className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Search by Customer:</label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Enter customer email..."
                className="flex-1 border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
              {customerSearch && (
                <button
                  onClick={() => setCustomerSearch('')}
                  className="px-3 py-2 text-sm border border-black text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
              <input
                type="date"
                value={epaperDateFilter}
                onChange={(e) => setEpaperDateFilter(e.target.value)}
                className="border border-black px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </>
        )}
      </div>

      {activeTab === 'epaper' ? (
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-black bg-white">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{epaperData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Unique E-Papers</p>
            <p className="text-2xl font-bold text-gray-900">{getEpaperTitles().length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Pages Viewed</p>
            <p className="text-2xl font-bold text-gray-900">{getEpaperPageViews().length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Session Time</p>
            <p className="text-2xl font-bold text-gray-900">{getTotalSessionTime()}s</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-black bg-white">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === 'news' ? newsData.length : classifiedData.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">{getTotalViews().toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average Views</p>
            <p className="text-2xl font-bold text-gray-900">{getAverageViews()}</p>
          </div>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'news' ? (
              newsData.length > 0 ? (
                <div className="border border-black bg-white">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-black">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rank</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Views</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Shared</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {newsData.map((item, index) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.category?.name || 'Uncategorized'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-900">
                                {item.views.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                            {item.sharedCount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No news found</p>
                </div>
              )
            ) : activeTab === 'classified' ? (
              classifiedData.length > 0 ? (
                <div className="border border-black bg-white overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-black">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-900">Rank</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-900">Title</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-900">Phone</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-900">Category</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-900">Views</th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                          <MessageCircle className="h-4 w-4 inline" title="WhatsApp Clicks" />
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                          <Phone className="h-4 w-4 inline" title="Phone Clicks" />
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                          <Globe className="h-4 w-4 inline" title="Website Clicks" />
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-900">
                          <MapPin className="h-4 w-4 inline" title="Location Clicks" />
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-900">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {classifiedData.map((item, index) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-xs text-gray-900">#{index + 1}</td>
                          <td className="px-3 py-3 text-xs text-gray-900 max-w-[200px] truncate" title={item.title}>
                            {item.title}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600">
                            {item.phoneNumber || '-'}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600">
                            {item.category || 'Others'}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Eye className="h-3 w-3 text-gray-500" />
                              <span className="text-xs font-semibold text-gray-900">
                                {(item.views || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-xs text-gray-900">
                            {(item.whatsappClicked || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center text-xs text-gray-900">
                            {(item.phoneClicked || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center text-xs text-gray-900">
                            {(item.websiteClicked || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-center text-xs text-gray-900">
                            {(item.locationClicked || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600">
                            {formatDate(item.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No classified ads found</p>
                </div>
              )
            ) : (
              epaperData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border border-black bg-white p-4">
                      <h3 className="text-lg font-semibold mb-4 text-center">Views by Page</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getEpaperPageViews()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="page" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="views" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="border border-black bg-white p-4">
                      <h3 className="text-lg font-semibold mb-4 text-center">Views by E-Paper Title (Last 5 Days)</h3>
                      {getEpaperTitles().length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={getEpaperTitles()}
                              dataKey="views"
                              nameKey="title"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={(entry) => `${entry.title}: ${entry.views}`}
                            >
                              {getEpaperTitles().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-gray-500">
                          <p>No e-paper views in the last 5 days</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-black bg-white overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-black">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">#</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Customer Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">E-Paper Title</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Page Number</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Session Time (s)</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Viewed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {epaperData.map((item, index) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {typeof item.customerId === 'object' ? item.customerId.email : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.ePaper.title}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                              {item.pageNumber}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-900">
                              {item.sessionTime}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatDateTime(item.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No e-paper views found</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewsAnalytics;

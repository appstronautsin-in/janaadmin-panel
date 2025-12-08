import React, { useState, useEffect } from 'react';
import { Users, Newspaper, FileText, FolderTree, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../config/axios';
import { usePermissions } from '../middleware/PermissionsMiddleware';

interface Stats {
  customers: number;
  categories: number;
  news: number;
  eNews: number;
  customerGrowth: {
    month: string;
    count: number;
  }[];
  newsGrowth: {
    month: string;
    count: number;
  }[];
  categoryDistribution: {
    name: string;
    count: number;
  }[];
}

const DashboardContent = () => {
  const [stats, setStats] = useState<Stats>({
    customers: 0,
    categories: 0,
    news: 0,
    eNews: 0,
    customerGrowth: [],
    newsGrowth: [],
    categoryDistribution: []
  });
  const [loading, setLoading] = useState(true);
  const { checkPermission, loading: permissionsLoading } = usePermissions();

  // Check if user has permission to see customer data
  const canSeeCustomerData = checkPermission('createCustomer') || 
                            checkPermission('editCustomer') || 
                            checkPermission('deleteCustomer');

  useEffect(() => {
    if (!permissionsLoading) {
      fetchStats();
    }
  }, [permissionsLoading]);

  const fetchStats = async () => {
    try {
      // Fetch all required data in parallel
      const [customersRes, categoriesRes, newsRes, eNewsRes] = await Promise.all([
        canSeeCustomerData ? api.get('/v1/customer/auth/all-customers') : Promise.resolve({ data: [] }),
        api.get('/v1/category/all'),
        api.get('/v1/news'),
        api.get('/v1/enews')
      ]);

      // Process category distribution
      const categoryDistribution = await Promise.all(
        categoriesRes.data.map(async (category: any) => {
          const newsInCategory = await api.get(`/v1/news/category/${category._id}`);
          return {
            name: category.name,
            count: newsInCategory.data.length
          };
        })
      );

      // Process customer growth (last 12 months)
      const customerGrowth = canSeeCustomerData ? 
        processMonthlyGrowthData(customersRes.data) : [];

      // Process news growth (last 12 months)
      const newsGrowth = processMonthlyGrowthData(newsRes.data);

      setStats({
        customers: customersRes.data.length,
        categories: categoriesRes.data.length,
        news: newsRes.data.length,
        eNews: eNewsRes.data.length,
        customerGrowth,
        newsGrowth,
        categoryDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyGrowthData = (data: any[]) => {
    const months = new Map();
    const today = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.set(monthKey, {
        month: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        count: 0
      });
    }

    // Count items per month
    data.forEach((item: any) => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months.has(monthKey)) {
        const monthData = months.get(monthKey);
        months.set(monthKey, {
          ...monthData,
          count: monthData.count + 1
        });
      }
    });

    return Array.from(months.values());
  };

  const calculateMonthlyGrowth = (data: { count: number }[]) => {
    if (data.length < 2) return 0;
    const latestMonth = data[data.length - 1].count;
    const previousMonth = data[data.length - 2].count;
    return previousMonth === 0 ? 100 : ((latestMonth - previousMonth) / previousMonth) * 100;
  };

  const StatCard = ({ title, value, icon: Icon, growth }: { title: string; value: number; icon: React.ElementType; growth?: number }) => (
    <div className="bg-white p-6 rounded-lg border border-black">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</h3>
          {growth !== undefined && (
            <div className={`flex items-center mt-2 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm">{Math.abs(growth).toFixed(1)}% from last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <Icon className="h-6 w-6 text-gray-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {canSeeCustomerData && (
          <StatCard
            title="Total Customers"
            value={stats.customers}
            icon={Users}
            growth={calculateMonthlyGrowth(stats.customerGrowth)}
          />
        )}
        <StatCard
          title="Total Categories"
          value={stats.categories}
          icon={FolderTree}
        />
        <StatCard
          title="Total News"
          value={stats.news}
          icon={Newspaper}
          growth={calculateMonthlyGrowth(stats.newsGrowth)}
        />
        <StatCard
          title="Total E-Paper"
          value={stats.eNews}
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Only show customer growth chart for users with permission */}
        {canSeeCustomerData && (
          <div className="bg-white p-6 rounded-lg border border-black">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Customer Growth</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickLine={{ stroke: '#6B7280' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickLine={{ stroke: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #000000',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* News Growth Chart */}
        <div className="bg-white p-6 rounded-lg border border-black">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly News Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.newsGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #000000',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white p-6 rounded-lg border border-black lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">News Distribution by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280' }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #000000',
                  }}
                />
                <Bar dataKey="count" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
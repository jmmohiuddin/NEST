import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  HiOutlineUsers,
  HiOutlineRocketLaunch,
  HiOutlineAcademicCap,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentCheck,
  HiOutlineChartBar,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import { adminAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const COLORS = ['#dc2626', '#16a34a', '#ef4444', '#22c55e', '#b91c1c', '#15803d', '#f87171', '#4ade80'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAnalytics(),
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const statCards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers, icon: HiOutlineUsers, color: 'bg-red-600' },
        { label: 'Startups', value: stats.totalStartups, icon: HiOutlineRocketLaunch, color: 'bg-green-600' },
        { label: 'Mentors', value: stats.totalMentors, icon: HiOutlineAcademicCap, color: 'bg-red-700' },
        { label: 'Events', value: stats.totalEvents, icon: HiOutlineCalendarDays, color: 'bg-green-700' },
        { label: 'Pending Approvals', value: (stats.pendingStartups || 0) + (stats.pendingMentors || 0), icon: HiOutlineClipboardDocumentCheck, color: 'bg-red-500' },
      ]
    : [];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - NEEST</title>
      </Helmet>

      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Platform overview and analytics</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard/admin/approvals" className="btn-secondary !py-2 !px-4 text-sm">
              <HiOutlineClipboardDocumentCheck className="w-4 h-4 inline mr-1" />
              Approvals
            </Link>
            <Link to="/dashboard/admin/analytics" className="btn-primary !py-2 !px-4 text-sm">
              <HiOutlineChartBar className="w-4 h-4 inline mr-1" />
              Analytics
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="card p-4">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value ?? 0}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Growth */}
          {analytics?.userGrowth && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineArrowTrendingUp className="w-4 h-4 text-primary-600" />
                User Growth (Last 6 months)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Industry Distribution */}
          {analytics?.industryDistribution && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Industry Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.industryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    nameKey="_id"
                    label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {analytics.industryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Startup Growth */}
          {analytics?.startupGrowth && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Startup Growth (Last 6 months)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.startupGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Startups */}
          {analytics?.topStartups && analytics.topStartups.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Startups by Views</h3>
              <div className="space-y-3">
                {analytics.topStartups.slice(0, 5).map((startup, i) => (
                  <div key={startup._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{startup.name}</p>
                      <p className="text-xs text-gray-500">{startup.industry}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{startup.views} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Link
            to="/dashboard/admin/users"
            className="card p-4 hover:border-primary-300 transition-colors text-center"
          >
            <HiOutlineUsers className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Manage Users</p>
          </Link>
          <Link
            to="/dashboard/admin/approvals"
            className="card p-4 hover:border-primary-300 transition-colors text-center"
          >
            <HiOutlineClipboardDocumentCheck className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Pending Approvals</p>
          </Link>
          <Link
            to="/dashboard/admin/analytics"
            className="card p-4 hover:border-primary-300 transition-colors text-center"
          >
            <HiOutlineChartBar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Full Analytics</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

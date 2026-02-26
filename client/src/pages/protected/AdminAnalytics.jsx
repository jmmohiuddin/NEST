import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { adminAPI } from '../../services/api';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const COLORS = ['#dc2626', '#16a34a', '#ef4444', '#22c55e', '#b91c1c', '#15803d', '#f87171', '#4ade80', '#991b1b', '#166534'];

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!analytics) return null;

  return (
    <>
      <Helmet>
        <title>Analytics - NEEST Admin</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8 font-display">Platform Analytics</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Growth */}
          {analytics.userGrowth && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">User Growth (Monthly)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#dc2626" fill="#dc2626" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Startup Growth */}
          {analytics.startupGrowth && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Startup Growth (Monthly)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={analytics.startupGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#16a34a" fill="#16a34a" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Event Activity */}
          {analytics.eventActivity && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Event Activity (Monthly)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={analytics.eventActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Industry Distribution */}
          {analytics.industryDistribution && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Industry Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.industryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analytics.industryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Startups Table */}
          {analytics.topStartups && analytics.topStartups.length > 0 && (
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Startups</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Rank</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analytics.topStartups.map((startup, i) => (
                      <tr key={startup._id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold inline-flex items-center justify-center">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">{startup.name}</td>
                        <td className="px-3 py-3"><span className="badge-primary">{startup.industry}</span></td>
                        <td className="px-3 py-3"><span className="badge-accent">{startup.stage}</span></td>
                        <td className="px-3 py-3 text-right text-sm font-semibold text-gray-700">{startup.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;

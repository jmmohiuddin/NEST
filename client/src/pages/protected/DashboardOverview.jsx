import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineBriefcase, HiOutlineCalendar, HiOutlineBell,
  HiOutlineBookOpen, HiOutlineArrowRight, HiOutlineLightBulb,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import { notificationsAPI, eventsAPI, startupsAPI, mentorsAPI } from '../../services/api';
import Loader from '../../components/common/Loader';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    notifications: [],
    upcomingEvents: [],
    startup: null,
    mentorProfile: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [
          notificationsAPI.getAll({ limit: 5, unread: 'true' }),
          eventsAPI.getMyRegistered(),
        ];

        if (user?.role === 'startup_founder') {
          promises.push(startupsAPI.getMine());
        }
        if (user?.role === 'mentor') {
          promises.push(mentorsAPI.getMine());
        }

        const results = await Promise.allSettled(promises);

        setData({
          notifications: results[0].status === 'fulfilled' ? results[0].value.data.data : [],
          upcomingEvents: results[1].status === 'fulfilled' ? results[1].value.data.data : [],
          startup: results[2]?.status === 'fulfilled' ? results[2].value.data.data : null,
          mentorProfile: user?.role === 'mentor' && results[2]?.status === 'fulfilled'
            ? results[2].value.data.data : null,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) return <Loader size="lg" text="Loading dashboard..." />;

  const quickActions = [
    ...(user?.role === 'startup_founder'
      ? [
          {
            name: data.startup ? 'Manage Startup' : 'Register Startup',
            path: '/dashboard/startup',
            icon: HiOutlineBriefcase,
            color: 'bg-red-50 text-red-600',
          },
          {
            name: 'Find Mentors',
            path: '/mentors',
            icon: HiOutlineLightBulb,
            color: 'bg-green-50 text-green-600',
          },
        ]
      : []),
    ...(user?.role === 'mentor'
      ? [
          {
            name: data.mentorProfile ? 'My Mentor Profile' : 'Create Profile',
            path: '/dashboard/mentor',
            icon: HiOutlineAcademicCap,
            color: 'bg-red-50 text-red-600',
          },
        ]
      : []),
    {
      name: 'Browse Events',
      path: '/events',
      icon: HiOutlineCalendar,
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'Book Resource',
      path: '/dashboard/bookings',
      icon: HiOutlineBookOpen,
      color: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - NEST</title>
      </Helmet>

      <div className="space-y-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 md:p-8 text-white">
          <h1 className="text-2xl md:text-3xl font-bold font-display">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-2 text-primary-100">
            Here's what's happening in your entrepreneurial journey.
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.path}
                  className="card p-4 hover:border-primary-200 group flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {action.name}
                    </span>
                  </div>
                  <HiOutlineArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
              <Link to="/dashboard/notifications" className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>
            <div className="card divide-y divide-gray-50">
              {data.notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No unread notifications
                </div>
              ) : (
                data.notifications.map((notif) => (
                  <div key={notif._id} className="p-4 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Upcoming Events</h2>
              <Link to="/events" className="text-sm text-primary-600 hover:text-primary-700">
                Browse Events
              </Link>
            </div>
            <div className="card divide-y divide-gray-50">
              {data.upcomingEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No upcoming events. <Link to="/events" className="text-primary-600">Browse events</Link>
                </div>
              ) : (
                data.upcomingEvents.slice(0, 5).map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event.slug || event._id}`}
                    className="p-4 hover:bg-gray-50 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex flex-col items-center justify-center text-primary-700">
                      <HiOutlineCalendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.type}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Startup Status Card */}
        {user?.role === 'startup_founder' && data.startup && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Startup</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">{data.startup.name?.[0]}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{data.startup.name}</h3>
                <p className="text-sm text-gray-500">{data.startup.industry} • {data.startup.stage}</p>
              </div>
              <span
                className={`badge ${
                  data.startup.status === 'approved'
                    ? 'badge-success'
                    : data.startup.status === 'pending'
                    ? 'badge-warning'
                    : 'badge-danger'
                }`}
              >
                {data.startup.status}
              </span>
              <Link to="/dashboard/startup" className="btn-secondary !py-2 !px-4 text-sm">
                Manage
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardOverview;

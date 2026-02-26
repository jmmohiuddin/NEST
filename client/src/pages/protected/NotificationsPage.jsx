import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiOutlineBell, HiOutlineCheck, HiOutlineTrash, HiOutlineCheckCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data.notifications || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Action failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Action failed');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Action failed');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Notifications - NEEST</title>
      </Helmet>

      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary text-sm !py-2 !px-4 flex items-center gap-1">
              <HiOutlineCheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={HiOutlineBell}
            title="No Notifications"
            description="You're all caught up! New notifications will appear here."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`card p-4 flex items-start gap-4 transition-colors ${
                  !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(notification.createdAt), 'MMM dd, yyyy · h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Mark as read"
                    >
                      <HiOutlineCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;

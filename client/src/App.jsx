import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Common
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Public pages
import HomePage from './pages/public/HomePage';
import StartupDirectory from './pages/public/StartupDirectory';
import MentorDirectory from './pages/public/MentorDirectory';
import EventsPage from './pages/public/EventsPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Protected pages
import DashboardOverview from './pages/protected/DashboardOverview';
import ProfilePage from './pages/protected/ProfilePage';
import NotificationsPage from './pages/protected/NotificationsPage';
import MyEventsPage from './pages/protected/MyEventsPage';
import BookingsPage from './pages/protected/BookingsPage';
import StartupManagement from './pages/protected/StartupManagement';
import MentorProfileManagement from './pages/protected/MentorProfileManagement';
import AdminDashboard from './pages/protected/AdminDashboard';
import AdminUsers from './pages/protected/AdminUsers';
import AdminApprovals from './pages/protected/AdminApprovals';
import AdminAnalytics from './pages/protected/AdminAnalytics';

const App = () => {
  const { loading } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      {/* ───────── Public Routes ───────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/startups" element={<StartupDirectory />} />
        <Route path="/mentors" element={<MentorDirectory />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ───────── Protected / Dashboard Routes ───────── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Common dashboard pages (all authenticated users) */}
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard/events" element={<MyEventsPage />} />
        <Route path="/dashboard/bookings" element={<BookingsPage />} />

        {/* Startup Founder routes */}
        <Route
          path="/dashboard/startup"
          element={
            <ProtectedRoute allowedRoles={['startup_founder', 'admin']}>
              <StartupManagement />
            </ProtectedRoute>
          }
        />

        {/* Mentor routes */}
        <Route
          path="/dashboard/mentor-profile"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <MentorProfileManagement />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/approvals"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

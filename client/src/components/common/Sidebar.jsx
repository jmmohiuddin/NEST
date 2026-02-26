import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineBookOpen,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardCheck,
} from 'react-icons/hi';

const Sidebar = ({ onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const commonLinks = [
    { name: 'Overview', path: '/dashboard', icon: HiOutlineViewGrid },
    { name: 'Profile', path: '/dashboard/profile', icon: HiOutlineUser },
    { name: 'Notifications', path: '/dashboard/notifications', icon: HiOutlineBell },
    { name: 'My Events', path: '/dashboard/events', icon: HiOutlineCalendar },
    { name: 'Bookings', path: '/dashboard/bookings', icon: HiOutlineBookOpen },
  ];

  const founderLinks = [
    { name: 'My Startup', path: '/dashboard/startup', icon: HiOutlineBriefcase },
  ];

  const mentorLinks = [
    { name: 'Mentor Profile', path: '/dashboard/mentor-profile', icon: HiOutlineAcademicCap },
  ];

  const adminLinks = [
    { name: 'Admin Panel', path: '/dashboard/admin', icon: HiOutlineCog },
    { name: 'User Management', path: '/dashboard/admin/users', icon: HiOutlineUsers },
    { name: 'Approvals', path: '/dashboard/admin/approvals', icon: HiOutlineClipboardCheck },
    { name: 'Analytics', path: '/dashboard/admin/analytics', icon: HiOutlineChartBar },
  ];

  let links = [...commonLinks];
  if (user?.role === 'startup_founder') links = [...links, ...founderLinks];
  if (user?.role === 'mentor') links = [...links, ...mentorLinks];
  if (user?.role === 'admin') links = [...links, ...adminLinks];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-1 flex-1 overflow-y-auto">
        {/* User info */}
        <div className="p-4 mb-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center">
              <span className="text-primary-800 font-bold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;

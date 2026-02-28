import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineShieldCheck,
  HiOutlineUserAdd,
  HiOutlineTrash,
  HiOutlineMail,
  HiOutlineStar,
} from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const roleColors = {
  superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-red-100 text-red-700 border-red-200',
};

const AdminRoleManagement = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [revoking, setRevoking] = useState(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdmins();
      setAdmins(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a Gmail address');
      return;
    }

    setAssigning(true);
    try {
      const res = await adminAPI.assignAdmin(email.trim());
      toast.success(res.data.message);
      setEmail('');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign admin');
    } finally {
      setAssigning(false);
    }
  };

  const handleRevoke = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to revoke admin access from ${name}?`)) return;

    setRevoking(userId);
    try {
      const res = await adminAPI.revokeAdmin(userId);
      toast.success(res.data.message);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke admin');
    } finally {
      setRevoking(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Role Management - NEST Admin</title>
      </Helmet>

      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HiOutlineShieldCheck className="w-8 h-8 text-purple-600" />
            Admin Role Management
          </h1>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            Assign or revoke admin access by Gmail address. Only you (superadmin) can manage admin roles.
          </p>
        </div>

        {/* Assign Admin Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <HiOutlineUserAdd className="w-5 h-5 text-teal-600" />
            Grant Admin Access
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter the Gmail address of a registered user to give them admin privileges.
            They will be able to access all admin features (dashboard, user management, approvals, analytics).
          </p>
          <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Enter Gmail address (e.g. user@gmail.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-all"
                disabled={assigning}
                required
              />
            </div>
            <button
              type="submit"
              disabled={assigning}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
            >
              {assigning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Assign Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Admins List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HiOutlineStar className="w-5 h-5 text-yellow-500" />
              Current Admins
              <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {admins.length}
              </span>
            </h2>
          </div>

          {admins.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <HiOutlineShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No admins assigned yet</p>
              <p className="text-sm mt-1">Use the form above to grant admin access</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {admins.map((adminUser) => {
                const isSelf = adminUser._id === currentUser?.id;
                const isSuperAdmin = adminUser.role === 'superadmin';

                return (
                  <div
                    key={adminUser._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-gray-50/50 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        {adminUser.avatar ? (
                          <img
                            src={adminUser.avatar}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {adminUser.firstName?.[0]}{adminUser.lastName?.[0]}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {adminUser.firstName} {adminUser.lastName}
                          </p>
                          {isSelf && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{adminUser.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border capitalize ${
                              roleColors[adminUser.role] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isSuperAdmin ? '👑 Super Admin' : '🛡️ Admin'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            Since {format(new Date(adminUser.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="sm:ml-auto">
                      {isSuperAdmin ? (
                        <span className="text-xs text-purple-500 font-medium bg-purple-50 px-3 py-1.5 rounded-lg">
                          Owner — Cannot be removed
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            handleRevoke(
                              adminUser._id,
                              `${adminUser.firstName} ${adminUser.lastName}`
                            )
                          }
                          disabled={revoking === adminUser._id}
                          className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                        >
                          {revoking === adminUser._id ? (
                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <HiOutlineTrash className="w-4 h-4" />
                          )}
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/50 p-6">
          <h3 className="font-semibold text-purple-900 mb-2">ℹ️ How Admin Roles Work</h3>
          <ul className="text-sm text-purple-800/80 space-y-1.5">
            <li>
              <strong>👑 Super Admin (You)</strong> — Full platform access + ability to assign/revoke admin roles.
              Your access can never be revoked.
            </li>
            <li>
              <strong>🛡️ Admin</strong> — Access to admin dashboard, user management, approvals, and analytics.
              Cannot assign or revoke admin roles.
            </li>
            <li>
              Users must have an account (signed up via Google or email) before you can grant admin access.
            </li>
            <li>
              Role changes take effect immediately. The user may need to log out and back in to see changes.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AdminRoleManagement;

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { HiOutlineMagnifyingGlass, HiOutlinePencilSquare } from 'react-icons/hi2';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  mentor: 'bg-green-100 text-green-700',
  startup_founder: 'bg-red-50 text-red-600',
  student: 'bg-green-50 text-green-600',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users || res.data.data || []);
      setTotalPages(res.data.data.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditRole(user.role);
  };

  const saveRole = async () => {
    setSaving(true);
    try {
      await adminAPI.updateUser(editUser._id, { role: editRole });
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? { ...u, role: editRole } : u)));
      setEditUser(null);
      toast.success('User updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Users - NEEST Admin</title>
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6 font-display">Manage Users</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10"
              placeholder="Search by name or email..."
            />
          </form>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field !w-auto"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="startup_founder">Founder</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {u.firstName} {u.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}>
                            {u.role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <HiOutlinePencilSquare className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User Role" size="sm">
        {editUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Updating role for <strong>{editUser.firstName} {editUser.lastName}</strong>
            </p>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="startup_founder">Startup Founder</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveRole} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminUsers;

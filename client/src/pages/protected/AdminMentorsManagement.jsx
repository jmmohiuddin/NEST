import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineAcademicCap,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineNoSymbol,
  HiOutlineEye,
} from 'react-icons/hi2';
import { adminAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-gray-100 text-gray-700',
};

const STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

const AdminMentorsManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View modal
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminAPI.getMentors(params);
      setMentors(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchMentors(); };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateMentorStatus(id, { status });
      setMentors(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      toast.success(`Mentor ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteMentor(id);
      setMentors(prev => prev.filter(m => m._id !== id));
      setDeleteConfirm(null);
      toast.success('Mentor profile deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <>
      <Helmet><title>Manage Mentors - NEST Admin</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <HiOutlineAcademicCap className="w-7 h-7 text-teal-600" />
            Mentors Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">View, approve, reject, suspend, and manage mentor profiles</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10" placeholder="Search by name, email, or title..." />
          </form>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? <Loader /> : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mentor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title / Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Expertise</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Experience</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mentors.length === 0 ? (
                      <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-400">No mentors found</td></tr>
                    ) : mentors.map(m => (
                      <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {m.user?.avatar ? (
                              <img src={m.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                {m.user?.firstName?.[0]}{m.user?.lastName?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                {m.featured && <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />}
                                {m.user?.firstName} {m.user?.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{m.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">{m.title || '—'}</p>
                          <p className="text-xs text-gray-500">{m.company?.name ? `${m.company.position} @ ${m.company.name}` : '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(m.expertise || []).slice(0, 3).map((e, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">{e}</span>
                            ))}
                            {(m.expertise?.length || 0) > 3 && (
                              <span className="text-[10px] text-gray-400">+{m.expertise.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{m.experience?.years || 0} yrs</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[m.status]}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {m.ratings?.average > 0 ? (
                            <span className="flex items-center gap-1">
                              <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />
                              {m.ratings.average.toFixed(1)} ({m.ratings.count})
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {m.status === 'pending' && (
                              <>
                                <button onClick={() => handleStatusChange(m._id, 'approved')} title="Approve"
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <HiOutlineCheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleStatusChange(m._id, 'rejected')} title="Reject"
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <HiOutlineXCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {m.status === 'approved' && (
                              <button onClick={() => handleStatusChange(m._id, 'suspended')} title="Suspend"
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <HiOutlineNoSymbol className="w-4 h-4" />
                              </button>
                            )}
                            {(m.status === 'rejected' || m.status === 'suspended') && (
                              <button onClick={() => handleStatusChange(m._id, 'approved')} title="Approve"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <HiOutlineCheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => setSelected(m)} title="View details"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(m)} title="Delete"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>

      {/* View Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Mentor Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              {selected.user?.avatar ? (
                <img src={selected.user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
                  {selected.user?.firstName?.[0]}{selected.user?.lastName?.[0]}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selected.user?.firstName} {selected.user?.lastName}</h3>
                <p className="text-sm text-gray-500">{selected.user?.email}</p>
                <p className="text-sm text-gray-600 mt-0.5">{selected.title}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
                  {selected.featured && <span className="text-xs font-medium px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><HiOutlineStar className="w-3 h-3" /> Featured</span>}
                </div>
              </div>
            </div>

            {/* Company */}
            {selected.company?.name && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Company</p>
                <p className="text-sm font-medium text-gray-900">{selected.company.position} @ {selected.company.name}</p>
                {selected.company.website && <a href={selected.company.website} target="_blank" rel="noreferrer" className="text-xs text-teal-600 hover:underline">{selected.company.website}</a>}
              </div>
            )}

            {/* Expertise & Specializations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.expertise || []).map((e, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{e}</span>
                  ))}
                  {(!selected.expertise || selected.expertise.length === 0) && <span className="text-xs text-gray-400">None listed</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.specializations || []).map((s, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{s}</span>
                  ))}
                  {(!selected.specializations || selected.specializations.length === 0) && <span className="text-xs text-gray-400">None listed</span>}
                </div>
              </div>
            </div>

            {/* Industries */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Industries</p>
              <div className="flex flex-wrap gap-1.5">
                {(selected.industries || []).map((ind, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full">{ind}</span>
                ))}
                {(!selected.industries || selected.industries.length === 0) && <span className="text-xs text-gray-400">None listed</span>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selected.experience?.years || 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Years Exp</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selected.sessionCount || 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Sessions</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selected.mentees?.length || 0}</p>
                <p className="text-[10px] text-gray-500 uppercase">Mentees</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{selected.ratings?.average?.toFixed(1) || '—'}</p>
                <p className="text-[10px] text-gray-500 uppercase">Rating ({selected.ratings?.count || 0})</p>
              </div>
            </div>

            {/* Availability */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Availability</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{selected.availability?.status || '—'}</span></div>
                <div><span className="text-gray-500">Hours/week:</span> <span className="font-medium">{selected.availability?.hoursPerWeek || 0}</span></div>
                <div className="col-span-2"><span className="text-gray-500">Preferred Days:</span> <span className="font-medium">{(selected.availability?.preferredDays || []).join(', ') || '—'}</span></div>
              </div>
            </div>

            {/* Experience description */}
            {selected.experience?.description && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Experience Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selected.experience.description}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <p className="text-xs text-gray-400">Joined {selected.createdAt ? format(new Date(selected.createdAt), 'MMM dd, yyyy') : '—'}</p>
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Mentor" size="sm">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.user?.firstName} {deleteConfirm.user?.lastName}</strong>&apos;s mentor profile? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminMentorsManagement;

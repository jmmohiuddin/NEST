import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineRocketLaunch,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineNoSymbol,
} from 'react-icons/hi2';
import { adminAPI, startupsAPI } from '../../services/api';
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

const INDUSTRIES = ['Technology', 'Healthcare', 'Education', 'Finance', 'Agriculture', 'E-Commerce', 'SaaS', 'AI/ML', 'IoT', 'CleanTech', 'FoodTech', 'Social Impact', 'Other'];
const STAGES = ['Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];
const STATUSES = ['pending', 'approved', 'rejected', 'suspended'];

const AdminStartupsManagement = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View/edit modal
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchStartups = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (industryFilter) params.industry = industryFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminAPI.getStartups(params);
      setStartups(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load startups');
    } finally {
      setLoading(false);
    }
  }, [page, industryFilter, statusFilter, search]);

  useEffect(() => { fetchStartups(); }, [fetchStartups]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchStartups(); };

  // Status actions
  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateStartupStatus(id, { status });
      setStartups(prev => prev.map(s => s._id === id ? { ...s, status } : s));
      toast.success(`Startup ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await adminAPI.toggleStartupFeatured(id);
      setStartups(prev => prev.map(s => s._id === id ? { ...s, featured: res.data.data.featured } : s));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteStartup(id);
      setStartups(prev => prev.filter(s => s._id !== id));
      setDeleteConfirm(null);
      toast.success('Startup deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const openView = (startup) => {
    setSelected(startup);
    setEditMode(false);
    setEditForm({
      name: startup.name || '',
      tagline: startup.tagline || '',
      description: startup.description || '',
      industry: startup.industry || 'Technology',
      stage: startup.stage || 'Idea',
      website: startup.website || '',
      logo: startup.logo || '',
      teamSize: startup.teamSize || 1,
      'location.city': startup.location?.city || '',
      'location.state': startup.location?.state || '',
    });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        tagline: editForm.tagline,
        description: editForm.description,
        industry: editForm.industry,
        stage: editForm.stage,
        website: editForm.website,
        logo: editForm.logo,
        teamSize: parseInt(editForm.teamSize) || 1,
        location: {
          city: editForm['location.city'],
          state: editForm['location.state'],
        },
      };
      await startupsAPI.update(selected._id, payload);
      setStartups(prev => prev.map(s => s._id === selected._id ? { ...s, ...payload } : s));
      setEditMode(false);
      toast.success('Startup updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet><title>Manage Startups - NEST Admin</title></Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
            <HiOutlineRocketLaunch className="w-7 h-7 text-teal-600" />
            Startups Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">View, approve, feature, edit, and manage all startups</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10" placeholder="Search startups..." />
          </form>
          <select value={industryFilter} onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Industries</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Startup</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Founder</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {startups.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">No startups found</td></tr>
                    ) : startups.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.logo ? (
                              <img src={s.logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                {s.name?.[0]}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                {s.featured && <HiOutlineStar className="w-3.5 h-3.5 text-yellow-500" />}
                                {s.name}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{s.tagline}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600">{s.industry}</td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600">{s.stage}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[s.status]}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {s.founder?.firstName} {s.founder?.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {s.status === 'pending' && (
                              <>
                                <button onClick={() => handleStatusChange(s._id, 'approved')} title="Approve"
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  <HiOutlineCheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleStatusChange(s._id, 'rejected')} title="Reject"
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <HiOutlineXCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {s.status === 'approved' && (
                              <button onClick={() => handleStatusChange(s._id, 'suspended')} title="Suspend"
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                <HiOutlineNoSymbol className="w-4 h-4" />
                              </button>
                            )}
                            {(s.status === 'rejected' || s.status === 'suspended') && (
                              <button onClick={() => handleStatusChange(s._id, 'approved')} title="Approve"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <HiOutlineCheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleToggleFeatured(s._id)} title="Toggle featured"
                              className={`p-1.5 rounded-lg transition-colors ${s.featured ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                              <HiOutlineStar className="w-4 h-4" />
                            </button>
                            <button onClick={() => openView(s)} title="View / Edit"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(s)} title="Delete"
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

      {/* View / Edit Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={editMode ? 'Edit Startup' : selected?.name || 'Startup Details'} size="lg">
        {selected && !editMode && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {selected.logo && <img src={selected.logo} alt="" className="w-16 h-16 rounded-xl object-cover" />}
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.tagline}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs font-medium px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">{selected.industry}</span>
                  <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{selected.stage}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Founder:</span> <span className="font-medium">{selected.founder?.firstName} {selected.founder?.lastName}</span></div>
              <div><span className="text-gray-500">Team Size:</span> <span className="font-medium">{selected.teamSize}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{selected.location?.city}, {selected.location?.state}</span></div>
              <div><span className="text-gray-500">Website:</span> <a href={selected.website} target="_blank" rel="noreferrer" className="font-medium text-teal-600 hover:underline">{selected.website || '—'}</a></div>
              <div><span className="text-gray-500">Views:</span> <span className="font-medium">{selected.views}</span></div>
              <div><span className="text-gray-500">Created:</span> <span className="font-medium">{selected.createdAt ? format(new Date(selected.createdAt), 'MMM dd, yyyy') : '—'}</span></div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button onClick={() => setSelected(null)} className="btn-secondary">Close</button>
              <button onClick={() => setEditMode(true)} className="btn-primary">Edit Startup</button>
            </div>
          </div>
        )}
        {selected && editMode && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
                  className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={editForm.tagline} onChange={e => setEditForm(p => ({...p, tagline: e.target.value}))}
                  className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select value={editForm.industry} onChange={e => setEditForm(p => ({...p, industry: e.target.value}))} className="input-field">
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={editForm.stage} onChange={e => setEditForm(p => ({...p, stage: e.target.value}))} className="input-field">
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={editForm.website} onChange={e => setEditForm(p => ({...p, website: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input type="url" value={editForm.logo} onChange={e => setEditForm(p => ({...p, logo: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                <input type="number" min={1} value={editForm.teamSize} onChange={e => setEditForm(p => ({...p, teamSize: e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={editForm['location.city']} onChange={e => setEditForm(p => ({...p, 'location.city': e.target.value}))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" value={editForm['location.state']} onChange={e => setEditForm(p => ({...p, 'location.state': e.target.value}))} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleEditSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Startup" size="sm">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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

export default AdminStartupsManagement;

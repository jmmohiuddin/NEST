import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineCalendarDays,
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineStar,
  HiOutlineEye,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { adminAPI, eventsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const EVENT_TYPES = ['Workshop', 'Hackathon', 'Webinar', 'Networking', 'Pitch Competition', 'Conference', 'Bootcamp', 'Meetup', 'Demo Day', 'Other'];
const EVENT_CATEGORIES = ['Technology', 'Business', 'Marketing', 'Design', 'Finance', 'Legal', 'General'];
const EVENT_STATUSES = ['draft', 'published', 'ongoing', 'completed', 'cancelled'];
const VENUE_TYPES = ['online', 'offline', 'hybrid'];

const emptyForm = {
  title: '', description: '', shortDescription: '', type: 'Workshop', category: 'General',
  startDate: '', endDate: '', registrationDeadline: '', capacity: '',
  venue: { type: 'online', address: '', city: '', meetingLink: '', platform: '' },
  coverImage: '', status: 'published', featured: false,
  price: { amount: 0, isFree: true },
  tags: '',
};

const AdminEventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminAPI.getEvents(params);
      setEvents(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, search]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchEvents(); };

  // Open create form
  const openCreate = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  // Open edit form
  const openEdit = (ev) => {
    setEditId(ev._id);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      shortDescription: ev.shortDescription || '',
      type: ev.type || 'Workshop',
      category: ev.category || 'General',
      startDate: ev.startDate ? format(new Date(ev.startDate), "yyyy-MM-dd'T'HH:mm") : '',
      endDate: ev.endDate ? format(new Date(ev.endDate), "yyyy-MM-dd'T'HH:mm") : '',
      registrationDeadline: ev.registrationDeadline ? format(new Date(ev.registrationDeadline), "yyyy-MM-dd'T'HH:mm") : '',
      capacity: ev.capacity || '',
      venue: {
        type: ev.venue?.type || 'online',
        address: ev.venue?.address || '',
        city: ev.venue?.city || '',
        meetingLink: ev.venue?.meetingLink || '',
        platform: ev.venue?.platform || '',
      },
      coverImage: ev.coverImage || '',
      status: ev.status || 'draft',
      featured: ev.featured || false,
      price: { amount: ev.price?.amount || 0, isFree: ev.price?.isFree !== false },
      tags: (ev.tags || []).join(', '),
    });
    setShowForm(true);
  };

  const handleFormChange = (field, value) => {
    if (field.startsWith('venue.')) {
      const key = field.split('.')[1];
      setForm(prev => ({ ...prev, venue: { ...prev.venue, [key]: value } }));
    } else if (field.startsWith('price.')) {
      const key = field.split('.')[1];
      setForm(prev => ({ ...prev, price: { ...prev.price, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price: { amount: form.price.isFree ? 0 : Number(form.price.amount), isFree: form.price.isFree },
      };
      if (editId) {
        await eventsAPI.update(editId, payload);
        toast.success('Event updated');
      } else {
        await eventsAPI.create(payload);
        toast.success('Event created');
      }
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminAPI.updateEventStatus(id, { status });
      setEvents(prev => prev.map(e => e._id === id ? { ...e, status } : e));
      toast.success(`Event ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await adminAPI.toggleEventFeatured(id);
      setEvents(prev => prev.map(e => e._id === id ? { ...e, featured: res.data.data.featured } : e));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      setDeleteConfirm(null);
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <>
      <Helmet><title>Manage Events - NEST Admin</title></Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
              <HiOutlineCalendarDays className="w-7 h-7 text-teal-600" />
              Events Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Create, edit, publish, and manage all events</p>
          </div>
          <button onClick={openCreate} className="btn-primary !py-2.5 !px-5 text-sm flex items-center gap-2 self-start">
            <HiOutlinePlusCircle className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-10" placeholder="Search events..." />
          </form>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Types</option>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field !w-auto">
            <option value="">All Statuses</option>
            {EVENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Event</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Regs</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.length === 0 ? (
                      <tr><td colSpan="6" className="px-4 py-12 text-center text-gray-400">No events found</td></tr>
                    ) : events.map(ev => (
                      <tr key={ev._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              {ev.featured && <HiOutlineStar className="w-4 h-4 text-yellow-500" />}
                              {ev.title}
                            </p>
                            <p className="text-xs text-gray-500">{ev.organizer?.firstName} {ev.organizer?.lastName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-600">{ev.type}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {ev.startDate ? format(new Date(ev.startDate), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={ev.status}
                            onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[ev.status] || 'bg-gray-100'}`}
                          >
                            {EVENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 font-medium">
                          {ev.registrations?.length || 0}{ev.capacity ? `/${ev.capacity}` : ''}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleToggleFeatured(ev._id)} title="Toggle featured"
                              className={`p-1.5 rounded-lg transition-colors ${ev.featured ? 'text-yellow-600 bg-yellow-50' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                              <HiOutlineStar className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(ev)} title="Edit"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <HiOutlinePencilSquare className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(ev)} title="Delete"
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

      {/* Create / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Event' : 'Create New Event'} size="lg">
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={e => handleFormChange('title', e.target.value)}
                className="input-field" placeholder="Event title" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input type="text" value={form.shortDescription} onChange={e => handleFormChange('shortDescription', e.target.value)}
                className="input-field" placeholder="Brief one-liner" maxLength={300} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={4} value={form.description} onChange={e => handleFormChange('description', e.target.value)}
                className="input-field" placeholder="Full event description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={e => handleFormChange('type', e.target.value)} className="input-field">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => handleFormChange('category', e.target.value)} className="input-field">
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="datetime-local" required value={form.startDate} onChange={e => handleFormChange('startDate', e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="datetime-local" required value={form.endDate} onChange={e => handleFormChange('endDate', e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
              <input type="datetime-local" value={form.registrationDeadline} onChange={e => handleFormChange('registrationDeadline', e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min={1} value={form.capacity} onChange={e => handleFormChange('capacity', e.target.value)}
                className="input-field" placeholder="Leave empty for unlimited" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
              <select value={form.venue.type} onChange={e => handleFormChange('venue.type', e.target.value)} className="input-field">
                {VENUE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {(form.venue.type === 'online' || form.venue.type === 'hybrid') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <input type="url" value={form.venue.meetingLink} onChange={e => handleFormChange('venue.meetingLink', e.target.value)}
                    className="input-field" placeholder="https://zoom.us/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <input type="text" value={form.venue.platform} onChange={e => handleFormChange('venue.platform', e.target.value)}
                    className="input-field" placeholder="Zoom, Google Meet..." />
                </div>
              </>
            )}
            {(form.venue.type === 'offline' || form.venue.type === 'hybrid') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={form.venue.address} onChange={e => handleFormChange('venue.address', e.target.value)}
                    className="input-field" placeholder="Venue address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={form.venue.city} onChange={e => handleFormChange('venue.city', e.target.value)}
                    className="input-field" placeholder="City" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input type="url" value={form.coverImage} onChange={e => handleFormChange('coverImage', e.target.value)}
                className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => handleFormChange('status', e.target.value)} className="input-field">
                {EVENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => handleFormChange('tags', e.target.value)}
                className="input-field" placeholder="startup, technology, AI" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => handleFormChange('featured', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.price.isFree} onChange={e => handleFormChange('price.isFree', e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Free Event</span>
              </label>
            </div>
            {!form.price.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input type="number" min={0} value={form.price.amount} onChange={e => handleFormChange('price.amount', e.target.value)}
                  className="input-field" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" size="sm">
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminEventsManagement;

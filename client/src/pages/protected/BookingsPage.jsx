import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HiOutlineBuildingOffice,
  HiOutlineComputerDesktop,
  HiOutlineWrench,
  HiOutlineAcademicCap,
  HiOutlineBeaker,
  HiOutlinePlus,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { bookingsAPI } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const resourceIcons = {
  meeting_room: HiOutlineBuildingOffice,
  workspace: HiOutlineComputerDesktop,
  equipment: HiOutlineWrench,
  mentor_session: HiOutlineAcademicCap,
  lab: HiOutlineBeaker,
};

const statusColors = {
  pending: 'bg-red-50 text-red-600',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
};

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    resourceType: 'meeting_room',
    resourceName: '',
    date: '',
    startTime: '',
    endTime: '',
    participants: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getAll();
      setBookings(res.data.data || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await bookingsAPI.create(formData);
      setBookings((prev) => [res.data.data, ...prev]);
      setShowModal(false);
      setFormData({ resourceType: 'meeting_room', resourceName: '', date: '', startTime: '', endTime: '', participants: 1 });
      toast.success('Booking created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b))
      );
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Bookings - NEEST</title>
      </Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-display">My Bookings</h1>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 !py-2.5 !px-4">
            <HiOutlinePlus className="w-4 h-4" />
            New Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={HiOutlineBuildingOffice}
            title="No Bookings Yet"
            description="Book meeting rooms, workspaces, equipment, and mentor sessions."
            actionLabel="Create Booking"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const Icon = resourceIcons[booking.resourceType] || HiOutlineBuildingOffice;
              return (
                <div key={booking._id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{booking.resourceName}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.date), 'MMM dd, yyyy')} · {booking.startTime} – {booking.endTime}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[booking.status] || ''}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                    >
                      <HiOutlineXMark className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Booking" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <select
              value={formData.resourceType}
              onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              className="input-field"
            >
              <option value="meeting_room">Meeting Room</option>
              <option value="workspace">Workspace</option>
              <option value="equipment">Equipment</option>
              <option value="mentor_session">Mentor Session</option>
              <option value="lab">Lab</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
            <input
              type="text"
              value={formData.resourceName}
              onChange={(e) => setFormData({ ...formData, resourceName: e.target.value })}
              className="input-field"
              placeholder="e.g., Conference Room A"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
            <input
              type="number"
              min={1}
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default BookingsPage;
